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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma/prisma.service");
let EmployeesService = class EmployeesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 50);
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOne(id) {
        const emp = await this.prisma.employee.findUnique({ where: { id } });
        if (!emp)
            throw new common_1.NotFoundException(`Employee not found`);
        return emp;
    }
    async create(dto) {
        const existing = await this.prisma.employee.findUnique({
            where: { employeeNumber: dto.employeeNumber },
        });
        if (existing)
            throw new common_1.ConflictException('Employee number already exists');
        return this.prisma.employee.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.employee.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.employee.delete({ where: { id } });
    }
    async bulkUpsert(rows) {
        const results = { inserted: 0, updated: 0 };
        for (const row of rows) {
            const existing = await this.prisma.employee.findUnique({
                where: { employeeNumber: row.employeeNumber },
            });
            if (existing) {
                await this.prisma.employee.update({ where: { id: existing.id }, data: row });
                results.updated++;
            }
            else {
                await this.prisma.employee.create({ data: row });
                results.inserted++;
            }
        }
        return results;
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map