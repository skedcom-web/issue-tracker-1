import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { EmailService } from '@infrastructure/email/email.service';
import {
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private email: EmailService,
  ) {}

  async login(dto: LoginDto) {
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

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

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

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });
    if (!user) throw new UnauthorizedException();
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

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    if (dto.newPassword.length < 6)
      throw new BadRequestException('Password must be at least 6 characters');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed, mustChangePassword: false },
    });

    return { message: 'Password changed successfully' };
  }

  // ── Forgot Password ────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
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
        throw new NotFoundException(
          'This email or employee number is not registered in the system. Please contact your Administrator.',
        );
      }

      throw new NotFoundException(
        'Your employee record exists but no login account has been created yet. Please contact your Administrator to set up your account.',
      );
    }

    if (!user.email) {
      throw new BadRequestException(
        'No email address is associated with this account. Please contact your Administrator.',
      );
    }

    // Generate secure reset token (1 hour expiry)
    const token = uuidv4().replace(/-/g, '');
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

  // ── Reset Password (from link) ────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      throw new BadRequestException('Invalid or expired reset link. Please request a new one.');
    }

    if (user.resetToken !== dto.token) {
      throw new BadRequestException('Invalid reset token. Please request a new one.');
    }

    if (new Date() > user.resetTokenExpiry) {
      // Clear expired token
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken: null, resetTokenExpiry: null },
      });
      throw new BadRequestException('This reset link has expired (valid for 1 hour only). Please request a new one.');
    }

    if (dto.newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
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
}
