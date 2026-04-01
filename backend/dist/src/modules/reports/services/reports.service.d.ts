import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { ReportQueryDto } from '../dto/report-query.dto';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private buildWhere;
    executiveSummary(q: ReportQueryDto): Promise<{
        generatedAt: string;
        filters: {
            projectId: number | undefined;
            dateFrom: string | undefined;
            dateTo: string | undefined;
        };
        total: number;
        overdue: number;
        totalReopens: number;
        byStatus: {
            [k: string]: number;
        };
        byPriority: {
            [k: string]: number;
        };
        byType: {
            [k: string]: number;
        };
        bySeverity: {
            [k: string]: number;
        };
        byProject: {
            projectId: number;
            projectName: string;
            count: number;
        }[];
    }>;
    byProject(q: ReportQueryDto): Promise<{
        generatedAt: string;
        filters: {
            projectId: number | undefined;
            dateFrom: string | undefined;
            dateTo: string | undefined;
        };
        rows: {
            projectId: number;
            projectName: string;
            department?: string;
            total: number;
            open: number;
            inProgress: number;
            inReview: number;
            resolved: number;
            closed: number;
            reopened: number;
        }[];
    }>;
    byReporter(q: ReportQueryDto): Promise<{
        generatedAt: string;
        filters: {
            projectId: number | undefined;
            dateFrom: string | undefined;
            dateTo: string | undefined;
        };
        rows: {
            reporterId: string | null;
            reporterName: string;
            email: string | undefined;
            department: string | null | undefined;
            role: import(".prisma/client").$Enums.Role | undefined;
            issueCount: number;
        }[];
    }>;
    byAssignee(q: ReportQueryDto): Promise<{
        generatedAt: string;
        filters: {
            projectId: number | undefined;
            dateFrom: string | undefined;
            dateTo: string | undefined;
        };
        rows: {
            assigneeId: string | null;
            assigneeName: string;
            employeeNumber: string | undefined;
            designation: string | null | undefined;
            email: string | null | undefined;
            issueCount: number;
        }[];
    }>;
    overdueAging(q: ReportQueryDto): Promise<{
        generatedAt: string;
        filters: {
            projectId: number | undefined;
            dateFrom: string | undefined;
            dateTo: string | undefined;
        };
        total: number;
        rows: {
            defectNo: string;
            title: string;
            projectName: string;
            status: import(".prisma/client").$Enums.IssueStatus;
            priority: import(".prisma/client").$Enums.IssuePriority;
            dueDate: string | null;
            daysOverdue: number;
            reporterName: string;
            assigneeName: string;
        }[];
    }>;
    issueRegister(q: ReportQueryDto): Promise<{
        generatedAt: string;
        filters: {
            projectId: number | undefined;
            dateFrom: string | undefined;
            dateTo: string | undefined;
            status: string | undefined;
            type: string | undefined;
        };
        rowCount: number;
        cappedAt: number;
        rows: {
            defectNo: string;
            title: string;
            projectName: string;
            type: import(".prisma/client").$Enums.IssueType;
            status: import(".prisma/client").$Enums.IssueStatus;
            priority: import(".prisma/client").$Enums.IssuePriority;
            severity: import(".prisma/client").$Enums.IssueSeverity;
            environment: import(".prisma/client").$Enums.IssueEnvironment | null;
            module: string | null;
            reporterName: string;
            reporterEmail: string | undefined;
            assigneeName: string;
            dueDate: string | null;
            createdAt: string;
            resolvedAt: string | null;
            closedAt: string | null;
            reopenCount: number;
        }[];
    }>;
    weeklyTrend(q: ReportQueryDto): Promise<{
        generatedAt: string;
        filters: {
            projectId: number | undefined;
            dateFrom: string | undefined;
            dateTo: string | undefined;
        };
        weeks: {
            weekStart: string;
            weekEnd: string;
            count: number;
        }[];
    }>;
    priorityMatrix(q: ReportQueryDto): Promise<{
        generatedAt: string;
        filters: {
            projectId: number | undefined;
            dateFrom: string | undefined;
            dateTo: string | undefined;
        };
        priorities: ("Critical" | "High" | "Medium" | "Low")[];
        statuses: ("Open" | "InProgress" | "InReview" | "Resolved" | "Closed" | "Reopened")[];
        matrix: Record<string, Record<string, number>>;
    }>;
}
