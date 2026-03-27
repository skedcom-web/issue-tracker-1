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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma/prisma.service");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project)
            throw new common_1.NotFoundException(`Project #${id} not found`);
        return project;
    }
    async create(dto, userId) {
        const existing = await this.prisma.project.findUnique({
            where: { name: dto.name },
        });
        if (existing)
            throw new common_1.ConflictException('A project with this name already exists');
        return this.prisma.project.create({
            data: {
                name: dto.name,
                description: dto.description,
                department: dto.department,
                lead: dto.lead,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                createdBy: userId,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.project.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                department: dto.department,
                lead: dto.lead,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.project.delete({ where: { id } });
    }
    makeAbbrev(name) {
        const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim().toUpperCase();
        const words = clean.split(/\s+/).filter(Boolean);
        if (!words.length)
            return 'DEF';
        if (words.length === 1)
            return words[0].slice(0, 6);
        const n = Math.min(words.length, 6);
        const base = Math.floor(6 / n);
        const extra = 6 - base * n;
        return words
            .slice(0, n)
            .map((w, i) => w.slice(0, base + (i < extra ? 1 : 0)))
            .join('')
            .slice(0, 6);
    }
    async nextDefectNo(projectId, projectName) {
        const abbrev = this.makeAbbrev(projectName);
        const counter = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.projectCounter.findUnique({
                where: { projectId },
            });
            const nextSeq = (existing?.counter ?? 0) + 1;
            await tx.projectCounter.upsert({
                where: { projectId },
                create: { projectId, counter: nextSeq },
                update: { counter: nextSeq },
            });
            return nextSeq;
        });
        const seq = String(counter).padStart(4, '0');
        return `${abbrev}-DEF-${seq}`;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map