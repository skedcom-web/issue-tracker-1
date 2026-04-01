import { IssuesService } from '@modules/issues/services/issues.service';
export declare class DashboardController {
    private issuesService;
    constructor(issuesService: IssuesService);
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
}
