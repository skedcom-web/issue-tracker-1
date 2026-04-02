import { IssuesService } from '../services/issues.service';
import { CreateIssueDto, UpdateIssueDto, CreateCommentDto, IssueQueryDto } from '../dto/issue.dto';
export declare class IssuesController {
    private issuesService;
    constructor(issuesService: IssuesService);
    findAll(query: IssueQueryDto): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        items: {
            assigneeName: string;
            contactPersonName: string;
            reporterName: string;
            projectName: string;
            isOverdue: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
    }>>;
    stats(projectId?: string): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        total: number;
        open: number;
        inProgress: number;
        inReview: number;
        resolved: number;
        closed: number;
        reopened: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        overdue: number;
        thisWeek: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        byType: Record<string, number>;
        activity: {
            id: number;
            type: string;
            createdAt: Date;
            projectId: number | null;
            issueId: number | null;
            message: string;
            userId: string | null;
        }[];
    }>>;
    findOne(id: number): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        comments: {
            id: number;
            body: string;
            authorName: string;
            authorId: string;
            createdAt: Date;
            updatedAt: Date;
            isSystem: boolean;
        }[];
        assigneeName: string;
        contactPersonName: string;
        reporterName: string;
        projectName: string;
        isOverdue: boolean;
    }>>;
    create(dto: CreateIssueDto, req: {
        user: {
            id: string;
        };
    }): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        assigneeName: string;
        contactPersonName: string;
        reporterName: string;
        projectName: string;
        isOverdue: boolean;
    }>>;
    update(id: number, dto: UpdateIssueDto, req: {
        user: {
            id: string;
        };
    }): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        assigneeName: string;
        contactPersonName: string;
        reporterName: string;
        projectName: string;
        isOverdue: boolean;
    }>>;
    addComment(id: number, dto: CreateCommentDto, req: {
        user: {
            id: string;
        };
    }): Promise<import("@common/types/global/api-response.interface").ApiResponse<({
        author: {
            id: string;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        body: string;
        issueId: number;
        authorId: string;
    }) | null>>;
}
