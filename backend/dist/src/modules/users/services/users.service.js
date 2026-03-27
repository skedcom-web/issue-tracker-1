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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../../infrastructure/database/prisma/prisma.service");
const email_service_1 = require("../../../infrastructure/email/email.service");
const ADMIN_EMAIL = 'admin@company.com';
function generateTempPassword(length = 10) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$!';
    return [...Array(length)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}
let UsersService = class UsersService {
    constructor(prisma, email) {
        this.prisma = prisma;
        this.email = email;
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            where: { email: { not: ADMIN_EMAIL } },
            include: { employee: true },
            orderBy: { name: 'asc' },
        });
        const mapped = users.map((u) => { const { password: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...rest } = u; void _pw; void _rt; void _rte; return rest; });
        return mapped;
    }
    async create(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const tempPassword = generateTempPassword();
        const hashed = await bcrypt.hash(tempPassword, 10);
        let employeeNumber = null;
        let employeeEmail = null;
        if (dto.employeeId) {
            const emp = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
            if (!emp)
                throw new common_1.NotFoundException('Employee not found');
            employeeNumber = emp.employeeNumber;
            employeeEmail = emp.email ?? null;
        }
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email.toLowerCase(),
                password: hashed,
                role: dto.role,
                department: dto.department,
                employeeNumber: employeeNumber ?? undefined,
                employeeId: dto.employeeId ?? undefined,
                mustChangePassword: true,
                active: true,
            },
            include: { employee: true },
        });
        const sendTo = employeeEmail ?? user.email;
        await this.email.sendWelcome({
            to: sendTo,
            name: user.name,
            email: user.email,
            tempPassword,
            role: user.role,
        });
        const { password: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...safe } = user;
        return { user: safe, tempPassword };
    }
    async update(id, dto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const updated = await this.prisma.user.update({
            where: { id },
            data: { role: dto.role, department: dto.department, active: dto.active },
        });
        const { password: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...safe } = updated;
        return safe;
    }
    async resetPassword(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { employee: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const tempPassword = generateTempPassword();
        const hashed = await bcrypt.hash(tempPassword, 10);
        await this.prisma.user.update({
            where: { id },
            data: { password: hashed, mustChangePassword: true },
        });
        const sendTo = user.employee?.email ?? user.email;
        await this.email.sendWelcome({
            to: sendTo,
            name: user.name,
            email: user.email,
            tempPassword,
            role: user.role,
        });
        return { tempPassword };
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.email === ADMIN_EMAIL)
            throw new common_1.ConflictException('Cannot delete the default admin');
        await this.prisma.user.delete({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map