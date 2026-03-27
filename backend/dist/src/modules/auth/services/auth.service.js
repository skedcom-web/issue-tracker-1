"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../../infrastructure/database/prisma/prisma.service");
const email_service_1 = require("../../../infrastructure/email/email.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, email) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.email = email;
    }
    async login(dto) {
        const cred = dto.credential.trim();
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: cred.toLowerCase() },
                    { employeeNumber: cred },
                    { employeeNumber: cred.toUpperCase() },
                ],
                active: true,
            },
            include: { employee: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwt.sign(payload);
        return {
            accessToken: token,
            mustChangePassword: user.mustChangePassword,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId,
                employeeNumber: user.employee?.employeeNumber ?? null,
                mustChangePassword: user.mustChangePassword,
            },
        };
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { employee: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException();
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            employeeId: user.employeeId,
            employeeNumber: user.employee?.employeeNumber ?? null,
            mustChangePassword: user.mustChangePassword,
        };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        const valid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!valid)
            throw new common_1.BadRequestException('Current password is incorrect');
        if (dto.newPassword.length < 6)
            throw new common_1.BadRequestException('Password must be at least 6 characters');
        const hashed = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashed, mustChangePassword: false },
        });
        return { message: 'Password changed successfully' };
    }
    async forgotPassword(dto) {
        const cred = dto.credential.trim();
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: cred.toLowerCase() },
                    { employeeNumber: cred },
                    { employeeNumber: cred.toUpperCase() },
                ],
                active: true,
            },
            include: { employee: true },
        });
        if (!user) {
            const emp = await this.prisma.employee.findFirst({
                where: {
                    OR: [
                        { email: cred.toLowerCase() },
                        { employeeNumber: cred },
                        { employeeNumber: cred.toUpperCase() },
                    ],
                },
            });
            if (!emp) {
                throw new common_1.NotFoundException('This email or employee number is not registered in the system. Please contact your Administrator.');
            }
            throw new common_1.NotFoundException('Your employee record exists but no login account has been created yet. Please contact your Administrator to set up your account.');
        }
        if (!user.email) {
            throw new common_1.BadRequestException('No email address is associated with this account. Please contact your Administrator.');
        }
        const token = (0, uuid_1.v4)().replace(/-/g, '');
        const expiry = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry,
            },
        });
        const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
        const resetLink = `${appUrl}/reset-password?token=${token}&userId=${user.id}`;
        await this.email.sendPasswordReset({
            to: user.email,
            name: user.name,
            resetLink,
        });
        return {
            message: `Password reset link sent to ${user.email.replace(/(.{2}).*(@.*)/, '$1***$2')}`,
        };
    }
    async resetPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            throw new common_1.BadRequestException('Invalid or expired reset link. Please request a new one.');
        }
        if (user.resetToken !== dto.token) {
            throw new common_1.BadRequestException('Invalid reset token. Please request a new one.');
        }
        if (new Date() > user.resetTokenExpiry) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { resetToken: null, resetTokenExpiry: null },
            });
            throw new common_1.BadRequestException('This reset link has expired (valid for 1 hour only). Please request a new one.');
        }
        if (dto.newPassword.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters');
        }
        const hashed = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashed,
                mustChangePassword: false,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        return { message: 'Password reset successfully. You can now log in with your new password.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map