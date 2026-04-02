"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    wrap(body) {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body { margin:0; padding:0; background:#EBE8FC; font-family:'Segoe UI',Arial,sans-serif; }
    .shell { max-width:600px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(79,56,246,.1); }
    .header { background:linear-gradient(135deg,#4F38F6 0%,#3B24E0 100%); padding:32px 40px; text-align:center; }
    .logo { display:inline-flex; align-items:baseline; gap:0; }
    .logo-v { font-size:28px; font-weight:700; color:#fff; }
    .logo-think { font-size:28px; font-weight:700; color:#fff; }
    .logo-star { font-size:28px; font-weight:700; color:#f87171; }
    .logo-sub { display:block; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.6); margin-top:4px; }
    .body { padding:36px 40px; }
    .greeting { font-size:16px; color:#07003C; font-weight:600; margin-bottom:16px; }
    .text { font-size:14px; color:#374151; line-height:1.7; margin-bottom:16px; }
    .box { background:#F5F3FF; border:1px solid #DDD6FE; border-radius:10px; padding:20px 24px; margin:24px 0; }
    .box-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #EDE9FE; font-size:13px; }
    .box-row:last-child { border-bottom:none; }
    .box-label { color:#6B6B8A; font-weight:500; }
    .box-value { color:#07003C; font-weight:600; }
    .warning { background:#FEF9C3; border:1px solid #FDE68A; border-radius:8px; padding:14px 18px; margin:20px 0; font-size:13px; color:#854D0E; }
    .btn-wrap { text-align:center; margin:28px 0 16px; }
    .btn { display:inline-block; background:#4F38F6; color:#fff; font-size:14px; font-weight:600; padding:14px 36px; border-radius:10px; text-decoration:none; letter-spacing:.3px; }
    .footer { background:#F9FAFB; border-top:1px solid #E5E7EB; padding:20px 40px; text-align:center; font-size:11px; color:#9CA3AF; line-height:1.6; }
  </style>
</head>
<body>
  <div class="shell">
    <div class="header">
      <div class="logo">
        <span class="logo-v">v</span><span class="logo-think">Think</span><span class="logo-star">*</span>
      </div>
      <span class="logo-sub">Project &amp; Issue Tracker</span>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      This is an automated message from the Project/Issue Tracker System. Please do not reply to this email.<br/>
      &copy; ${new Date().getFullYear()} vThink. All rights reserved.
    </div>
  </div>
</body>
</html>`;
    }
    async sendWelcome(opts) {
        const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
        const body = `
      <p class="greeting">Dear ${opts.name},</p>
      <p class="text">
        Welcome to the <strong>Project &amp; Issue Tracker System</strong>.<br/>
        Your account has been successfully created. Please use the login credentials below
        to access the system. You will be required to change your password during your
        first login for security purposes.
      </p>
      <div class="box">
        <div class="box-row"><span class="box-label">Username / Email</span><span class="box-value">${opts.email}</span></div>
        <div class="box-row"><span class="box-label">Temporary Password</span><span class="box-value">${opts.tempPassword}</span></div>
        <div class="box-row"><span class="box-label">Role</span><span class="box-value">${opts.role}</span></div>
      </div>
      <div class="warning">
        ⚠ This is a temporary password. You will be required to set a new password when
        you log in for the first time. Please do not share this password with anyone.
      </div>
      <p class="text">You can access the system using the following link:</p>
      <div class="btn-wrap">
        <a href="${appUrl}/login" class="btn">Access the System →</a>
      </div>
      <p class="text" style="font-size:12px;color:#9CA3AF;">
        If you experience any issues accessing your account, please contact the system administrator.
      </p>
      <p class="text" style="margin-bottom:0;">
        Regards,<br/><strong>Project/Issue Tracker Support Team</strong>
      </p>`;
        await this.send({
            to: opts.to,
            subject: '🎉 Your vThink Tracker Account Has Been Created',
            html: this.wrap(body),
        });
    }
    async sendPasswordReset(opts) {
        const body = `
      <p class="greeting">Dear ${opts.name},</p>
      <p class="text">
        We received a request to reset the password for your
        <strong>Project &amp; Issue Tracker</strong> account.
      </p>
      <p class="text">
        Click the button below to set a new password. This link is valid for
        <strong>1 hour</strong> only.
      </p>
      <div class="btn-wrap">
        <a href="${opts.resetLink}" class="btn">Reset My Password →</a>
      </div>
      <div class="warning">
        ⚠ If you did not request a password reset, please ignore this email.
        Your password will remain unchanged and no action is needed.
      </div>
      <p class="text">
        Or copy and paste this link in your browser:<br/>
        <span style="font-size:12px;color:#6B6B8A;word-break:break-all;">${opts.resetLink}</span>
      </p>
      <p class="text" style="margin-bottom:0;">
        Regards,<br/><strong>Project/Issue Tracker Support Team</strong>
      </p>`;
        await this.send({
            to: opts.to,
            subject: '🔐 Reset Your vThink Tracker Password',
            html: this.wrap(body),
        });
    }
    async sendIssueCreated(opts) {
        if (!opts.toEmails.length)
            return;
        const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
        const issueUrl = `${appUrl}/issues/${opts.issueId}`;
        const safeTitle = this.escapeHtml(opts.title);
        const body = `
      <p class="greeting">Hello,</p>
      <p class="text">
        A new issue has been created in vThink Issue Tracker. Notifications have been sent to the reporter and assignee. Kindly review and proceed with the necessary actions.
      </p>
      <div class="box">
        <div class="box-row"><span class="box-label">Project</span><span class="box-value">${this.escapeHtml(opts.projectName)}</span></div>
        <div class="box-row"><span class="box-label">Defect / ID</span><span class="box-value">${this.escapeHtml(opts.defectNo)}</span></div>
        <div class="box-row"><span class="box-label">Title</span><span class="box-value">${safeTitle}</span></div>
        <div class="box-row"><span class="box-label">Priority</span><span class="box-value">${this.escapeHtml(opts.priority)}</span></div>
        <div class="box-row"><span class="box-label">Status</span><span class="box-value">${this.escapeHtml(opts.status)}</span></div>
        <div class="box-row"><span class="box-label">Reported by</span><span class="box-value">${this.escapeHtml(opts.reportedByName)}</span></div>
      </div>
      <div class="btn-wrap">
        <a href="${issueUrl}" class="btn">Open issue →</a>
      </div>
      <p class="text" style="font-size:12px;color:#9CA3AF;word-break:break-all;">
        ${issueUrl}
      </p>
      <p class="text" style="margin-bottom:0;">
        Regards,<br/><strong>Project/Issue Tracker</strong>
      </p>`;
        const subject = `[vThink Tracker] New issue ${opts.defectNo}: ${opts.title.length > 50 ? `${opts.title.slice(0, 47)}…` : opts.title}`;
        await Promise.all(opts.toEmails.map((to) => this.send({ to, subject, html: this.wrap(body) })));
    }
    async sendIssueStatusChanged(opts) {
        if (!opts.toEmails.length)
            return;
        const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
        const issueUrl = `${appUrl}/issues/${opts.issueId}`;
        const byLine = opts.changedByName
            ? `<div class="box-row"><span class="box-label">Updated by</span><span class="box-value">${this.escapeHtml(opts.changedByName)}</span></div>`
            : '';
        const body = `
      <p class="greeting">Hello,</p>
      <p class="text">
        The status of an issue you are involved with has been <strong>updated</strong>.
      </p>
      <div class="box">
        <div class="box-row"><span class="box-label">Defect / ID</span><span class="box-value">${this.escapeHtml(opts.defectNo)}</span></div>
        <div class="box-row"><span class="box-label">Title</span><span class="box-value">${this.escapeHtml(opts.title)}</span></div>
        <div class="box-row"><span class="box-label">Project</span><span class="box-value">${this.escapeHtml(opts.projectName)}</span></div>
        <div class="box-row"><span class="box-label">Previous status</span><span class="box-value">${this.escapeHtml(opts.previousStatus)}</span></div>
        <div class="box-row"><span class="box-label">New status</span><span class="box-value">${this.escapeHtml(opts.newStatus)}</span></div>
        ${byLine}
      </div>
      <div class="btn-wrap">
        <a href="${issueUrl}" class="btn">View issue →</a>
      </div>
      <p class="text" style="font-size:12px;color:#9CA3AF;word-break:break-all;">
        ${issueUrl}
      </p>
      <p class="text" style="margin-bottom:0;">
        Regards,<br/><strong>Project/Issue Tracker</strong>
      </p>`;
        const subject = `[vThink Tracker] ${opts.defectNo}: ${opts.previousStatus} → ${opts.newStatus}`;
        await Promise.all(opts.toEmails.map((to) => this.send({ to, subject, html: this.wrap(body) })));
    }
    async sendIssueNewParticipant(opts) {
        const t = opts.toEmail?.trim();
        if (!t)
            return;
        const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
        const issueUrl = `${appUrl}/issues/${opts.issueId}`;
        const safeTitle = this.escapeHtml(opts.title);
        const intro = opts.role === 'assignee'
            ? `<p class="text">
        You have been assigned as the <strong>assignee</strong> for the following issue (reassignment).
        Please review it in vThink Issue Tracker and proceed with the necessary actions.
      </p>`
            : `<p class="text">
        You have been set as the <strong>contact person</strong> for the following issue.
        You may be contacted for clarification or additional details about this work item.
      </p>`;
        const byRow = opts.updatedByName
            ? `<div class="box-row"><span class="box-label">Updated by</span><span class="box-value">${this.escapeHtml(opts.updatedByName)}</span></div>`
            : '';
        const body = `
      <p class="greeting">Hello,</p>
      ${intro}
      <div class="box">
        <div class="box-row"><span class="box-label">Project</span><span class="box-value">${this.escapeHtml(opts.projectName)}</span></div>
        <div class="box-row"><span class="box-label">Defect / ID</span><span class="box-value">${this.escapeHtml(opts.defectNo)}</span></div>
        <div class="box-row"><span class="box-label">Title</span><span class="box-value">${safeTitle}</span></div>
        <div class="box-row"><span class="box-label">Priority</span><span class="box-value">${this.escapeHtml(opts.priority)}</span></div>
        <div class="box-row"><span class="box-label">Status</span><span class="box-value">${this.escapeHtml(opts.status)}</span></div>
        <div class="box-row"><span class="box-label">Reported by</span><span class="box-value">${this.escapeHtml(opts.reportedByName)}</span></div>
        ${byRow}
      </div>
      <div class="btn-wrap">
        <a href="${issueUrl}" class="btn">Open issue →</a>
      </div>
      <p class="text" style="font-size:12px;color:#9CA3AF;word-break:break-all;">
        ${issueUrl}
      </p>
      <p class="text" style="margin-bottom:0;">
        Regards,<br/><strong>Project/Issue Tracker</strong>
      </p>`;
        const roleBit = opts.role === 'assignee' ? 'Assigned to you' : 'You are contact person';
        const shortTitle = opts.title.length > 42 ? `${opts.title.slice(0, 39)}…` : opts.title;
        const subject = `[vThink Tracker] ${roleBit}: ${opts.defectNo} — ${shortTitle}`;
        await this.send({ to: t, subject, html: this.wrap(body) });
    }
    escapeHtml(s) {
        return s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    async send(opts) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM ?? 'vThink Tracker <noreply@vthink.com>',
                to: opts.to,
                subject: opts.subject,
                html: opts.html,
            });
            this.logger.log(`Email sent to ${opts.to} — messageId: ${info.messageId}`);
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${opts.to}: ${String(err)}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map