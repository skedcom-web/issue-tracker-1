import { IssueType, IssuePriority, IssueSeverity, IssueStatus, IssueEnvironment } from '@common/constants/enums';
export declare class CreateIssueDto {
    title: string;
    description: string;
    type: IssueType;
    priority: IssuePriority;
    severity: IssueSeverity;
    projectId: number;
    assigneeId?: string;
    contactPersonId?: string;
    reporterId?: string;
    environment?: IssueEnvironment;
    dueDate?: string;
    module?: string;
    stepsToReproduce?: string;
    expectedResult?: string;
    actualResult?: string;
    fileName?: string;
    fileUrl?: string;
}
export declare class UpdateIssueDto {
    title?: string;
    description?: string;
    type?: IssueType;
    priority?: IssuePriority;
    severity?: IssueSeverity;
    status?: IssueStatus;
    environment?: IssueEnvironment;
    assigneeId?: string;
    contactPersonId?: string;
    reporterId?: string;
    dueDate?: string;
    module?: string;
    stepsToReproduce?: string;
    expectedResult?: string;
    actualResult?: string;
    resolution?: string;
    projectId?: number;
    fileName?: string;
    fileUrl?: string;
}
export declare class CreateCommentDto {
    body: string;
    statusChange?: IssueStatus;
    reopenReason?: string;
    resolution?: string;
}
export declare class IssueQueryDto {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    projectId?: string;
    environment?: string;
    overdue?: string;
    search?: string;
    assigneeId?: string;
    severity?: string;
}
