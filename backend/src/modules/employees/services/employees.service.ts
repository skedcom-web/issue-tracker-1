import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from '../dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: EmployeeQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.search) {
      where['OR'] = [
        { employeeName: { contains: query.search, mode: 'insensitive' } },
        { employeeNumber: { contains: query.search, mode: 'insensitive' } },
        { designation: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.active !== undefined && query.active !== '')
      where['active'] = query.active === 'true';

    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        orderBy: { employeeName: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new NotFoundException(`Employee not found`);
    return emp;
  }

  async create(dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: { employeeNumber: dto.employeeNumber },
    });
    if (existing) throw new ConflictException('Employee number already exists');

    return this.prisma.employee.create({ data: dto });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    return this.prisma.employee.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.employee.delete({ where: { id } });
  }

  async bulkUpsert(rows: CreateEmployeeDto[]) {
    const results = { inserted: 0, updated: 0 };
    for (const row of rows) {
      const existing = await this.prisma.employee.findUnique({
        where: { employeeNumber: row.employeeNumber },
      });
      if (existing) {
        await this.prisma.employee.update({ where: { id: existing.id }, data: row });
        results.updated++;
      } else {
        await this.prisma.employee.create({ data: row });
        results.inserted++;
      }
    }
    return results;
  }
}
