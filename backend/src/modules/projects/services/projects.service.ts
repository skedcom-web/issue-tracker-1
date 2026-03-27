import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException(`Project #${id} not found`);
    return project;
  }

  async create(dto: CreateProjectDto, userId: string) {
    const existing = await this.prisma.project.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('A project with this name already exists');

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

  async update(id: number, dto: UpdateProjectDto) {
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

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }

  // ── Defect number generation ─────────────────────────────────────
  makeAbbrev(name: string): string {
    const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim().toUpperCase();
    const words = clean.split(/\s+/).filter(Boolean);
    if (!words.length) return 'DEF';
    if (words.length === 1) return words[0].slice(0, 6);
    const n = Math.min(words.length, 6);
    const base = Math.floor(6 / n);
    const extra = 6 - base * n;
    return words
      .slice(0, n)
      .map((w, i) => w.slice(0, base + (i < extra ? 1 : 0)))
      .join('')
      .slice(0, 6);
  }

  async nextDefectNo(projectId: number, projectName: string): Promise<string> {
    const abbrev = this.makeAbbrev(projectName);

    const counter = await this.prisma.$transaction(async (tx: typeof this.prisma) => {
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
}
