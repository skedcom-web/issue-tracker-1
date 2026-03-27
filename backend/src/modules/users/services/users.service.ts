import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { EmailService } from '@infrastructure/email/email.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

const ADMIN_EMAIL = 'admin@company.com';

function generateTempPassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$!';
  return [...Array(length)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { email: { not: ADMIN_EMAIL } },
      include: { employee: true },
      orderBy: { name: 'asc' },
    });
    const mapped = users.map((u: { password: string; resetToken: string | null; resetTokenExpiry: Date | null; [key: string]: unknown }) => { const { password: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...rest } = u; void _pw; void _rt; void _rte; return rest; }); return mapped;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already in use');

    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    let employeeNumber: string | null = null;
    let employeeEmail: string | null = null;

    if (dto.employeeId) {
      const emp = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
      if (!emp) throw new NotFoundException('Employee not found');
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

    // Send welcome email — use employee email if available, else user email
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

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role, department: dto.department, active: dto.active },
    });

    const { password: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...safe } = updated;
    return safe;
  }

  async resetPassword(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashed, mustChangePassword: true },
    });

    // Send welcome email with new temp password
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

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.email === ADMIN_EMAIL)
      throw new ConflictException('Cannot delete the default admin');
    await this.prisma.user.delete({ where: { id } });
  }
}
