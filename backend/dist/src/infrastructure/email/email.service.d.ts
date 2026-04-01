export declare class EmailService {
    private readonly logger;
    private transporter;
    constructor();
    private wrap;
    sendWelcome(opts: {
        to: string;
        name: string;
        email: string;
        tempPassword: string;
        role: string;
    }): Promise<void>;
    sendPasswordReset(opts: {
        to: string;
        name: string;
        resetLink: string;
    }): Promise<void>;
    sendIssueCreated(opts: {
        toEmails: string[];
        defectNo: string;
        title: string;
        projectName: string;
        priority: string;
        status: string;
        issueId: number;
        reportedByName: string;
    }): Promise<void>;
    sendIssueStatusChanged(opts: {
        toEmails: string[];
        defectNo: string;
        title: string;
        projectName: string;
        previousStatus: string;
        newStatus: string;
        issueId: number;
        changedByName?: string;
    }): Promise<void>;
    private escapeHtml;
    private send;
}
