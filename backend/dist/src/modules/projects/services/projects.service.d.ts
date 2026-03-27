import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        department: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        lead: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        department: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        lead: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string | null;
    }>;
    create(dto: CreateProjectDto, userId: string): Promise<{
        id: number;
        name: string;
        department: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        lead: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string | null;
    }>;
    update(id: number, dto: UpdateProjectDto): Promise<{
        id: number;
        name: string;
        department: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        lead: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        department: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        lead: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string | null;
    }>;
    makeAbbrev(name: string): string;
    nextDefectNo(projectId: number, projectName: string): Promise<string>;
}
