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
    private send;
}
