import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { EmailService } from '@infrastructure/email/email.service';
import { ProjectsService } from '@modules/projects/services/projects.service';
import { CreateIssueDto, UpdateIssueDto, CreateCommentDto, IssueQueryDto } from '../dto/issue.dto';
export declare class IssuesService {
    private prisma;
    private projectsService;
    private emailService;
    constructor(prisma: PrismaService, projectsService: ProjectsService, emailService: EmailService);
    private collectIssueNotifyEmails;
    private fireIssueCreatedEmail;
    private fireIssueStatusChangedEmail;
    private enrichIssue;
    private addSystemComment;
    findAll(query: IssueQueryDto): Promise<{
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
    }>;
    findOne(id: number): Promise<{
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
    }>;
    create(dto: CreateIssueDto, reporterUserId: string): Promise<{
        assigneeName: string;
        contactPersonName: string;
        reporterName: string;
        projectName: string;
        isOverdue: boolean;
    }>;
    update(id: number, dto: UpdateIssueDto, userId: string): Promise<{
        assigneeName: string;
        contactPersonName: string;
        reporterName: string;
        projectName: string;
        isOverdue: boolean;
    }>;
    addComment(issueId: number, dto: CreateCommentDto, userId: string): Promise<({
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
    }) | null>;
    getStats(projectId?: number): Promise<{
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
            createdAt: Date;
            userId: string | null;
            projectId: number | null;
            type: string;
            issueId: number | null;
            message: string;
        }[];
    }>;
}
