import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    findAll(): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
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
    }[]>>;
    findOne(id: number): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
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
    }>>;
    create(dto: CreateProjectDto, req: {
        user: {
            id: string;
        };
    }): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
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
    }>>;
    update(id: number, dto: UpdateProjectDto): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
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
    }>>;
    remove(id: number): Promise<import("@common/types/global/api-response.interface").ApiResponse<null>>;
}
