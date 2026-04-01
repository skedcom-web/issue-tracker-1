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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma/prisma.service");
const email_service_1 = require("../../../infrastructure/email/email.service");
const projects_service_1 = require("../../projects/services/projects.service");
const enums_1 = require("../../../common/constants/enums");
const ALLOWED_TRANSITIONS = {
    Open: [enums_1.IssueStatus.InProgress, enums_1.IssueStatus.Closed],
    InProgress: [enums_1.IssueStatus.InReview, enums_1.IssueStatus.Open, enums_1.IssueStatus.Closed],
    InReview: [enums_1.IssueStatus.Resolved, enums_1.IssueStatus.InProgress, enums_1.IssueStatus.Reopened],
    Resolved: [enums_1.IssueStatus.Closed, enums_1.IssueStatus.Reopened],
    Closed: [enums_1.IssueStatus.Reopened],
    Reopened: [enums_1.IssueStatus.InProgress, enums_1.IssueStatus.Open],
};
let IssuesService = class IssuesService {
    constructor(prisma, projectsService, emailService) {
        this.prisma = prisma;
        this.projectsService = projectsService;
        this.emailService = emailService;
    }
    async collectIssueNotifyEmails(reporterId, assigneeId) {
        const byLower = new Map();
        const add = (raw) => {
            const t = raw?.trim();
            if (!t)
                return;
            const k = t.toLowerCase();
            if (!byLower.has(k))
                byLower.set(k, t);
        };
        if (reporterId) {
            const u = await this.prisma.user.findUnique({
                where: { id: reporterId },
                select: { email: true },
            });
            add(u?.email);
        }
        if (assigneeId) {
            const emp = await this.prisma.employee.findUnique({
                where: { id: assigneeId },
                select: { email: true },
            });
            add(emp?.email ?? undefined);
            if (!emp?.email?.trim()) {
                const linked = await this.prisma.user.findFirst({
                    where: { employeeId: assigneeId },
                    select: { email: true },
                });
                add(linked?.email);
            }
        }
        return [...byLower.values()];
    }
    fireIssueCreatedEmail(issue) {
        void (async () => {
            const toEmails = await this.collectIssueNotifyEmails(issue.reporterId, issue.assigneeId);
            if (!toEmails.length)
                return;
            const reporter = issue.reporterId
                ? await this.prisma.user.findUnique({
                    where: { id: issue.reporterId },
                    select: { name: true },
                })
                : null;
            await this.emailService.sendIssueCreated({
                toEmails,
                defectNo: issue.defectNo,
                title: issue.title,
                projectName: issue.project.name,
                priority: String(issue.priority),
                status: String(issue.status),
                issueId: issue.id,
                reportedByName: reporter?.name ?? 'A team member',
            });
        })();
    }
    fireIssueStatusChangedEmail(issue, previousStatus, newStatus, actorUserId) {
        void (async () => {
            const toEmails = await this.collectIssueNotifyEmails(issue.reporterId, issue.assigneeId);
            if (!toEmails.length)
                return;
            const actor = await this.prisma.user.findUnique({
                where: { id: actorUserId },
                select: { name: true },
            });
            await this.emailService.sendIssueStatusChanged({
                toEmails,
                defectNo: issue.defectNo,
                title: issue.title,
                projectName: issue.project.name,
                previousStatus,
                newStatus,
                issueId: issue.id,
                changedByName: actor?.name,
            });
        })();
    }
    async enrichIssue(issue) {
        const [employees, users] = await Promise.all([
            this.prisma.employee.findMany({ where: { active: true } }),
            this.prisma.user.findMany({ select: { id: true, name: true, employeeId: true } }),
        ]);
        const empById = {};
        for (const e of employees)
            empById[e.id] = e.employeeName;
        const userById = {};
        for (const u of users)
            userById[u.id] = u.name;
        const empToUserId = {};
        for (const u of users) {
            if (u.employeeId)
                empToUserId[u.employeeId] = u.id;
        }
        const assigneeId = issue['assigneeId'];
        const contactPersonId = issue['contactPersonId'];
        const reporterId = issue['reporterId'];
        const assigneeName = assigneeId ? (empById[assigneeId] ?? '—') : 'Unassigned';
        const contactPersonName = contactPersonId ? (empById[contactPersonId] ?? '—') : '—';
        const reporterName = reporterId ? (userById[reporterId] ?? '—') : '—';
        const dueDate = issue['dueDate'];
        const status = issue['status'];
        const isOverdue = !!dueDate && dueDate < new Date() && !['Resolved', 'Closed'].includes(status);
        return {
            ...issue,
            assigneeName,
            contactPersonName,
            reporterName,
            projectName: issue['project']?.name ?? '—',
            isOverdue,
        };
    }
    async addSystemComment(issueId, message, userId) {
        return this.prisma.comment.create({
            data: {
                body: `🔄 **${message}**`,
                issueId,
                authorId: userId,
            },
        });
    }
    async findAll(query) {
        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 20);
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where['OR'] = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { defectNo: { contains: query.search, mode: 'insensitive' } },
                { module: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.status && query.status !== 'All')
            where['status'] = query.status;
        if (query.priority && query.priority !== 'All')
            where['priority'] = query.priority;
        if (query.severity && query.severity !== 'All')
            where['severity'] = query.severity;
        if (query.type && query.type !== 'All')
            where['type'] = query.type;
        if (query.environment && query.environment !== 'All')
            where['environment'] = query.environment;
        if (query.projectId && query.projectId !== 'All')
            where['projectId'] = Number(query.projectId);
        if (query.assigneeId && query.assigneeId !== 'All')
            where['assigneeId'] = query.assigneeId;
        if (query.overdue === 'true') {
            where['dueDate'] = { lt: new Date() };
            where['status'] = { notIn: ['Resolved', 'Closed'] };
        }
        const [rawItems, total] = await Promise.all([
            this.prisma.issue.findMany({
                where,
                include: { project: true },
                orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
                skip,
                take: limit,
            }),
            this.prisma.issue.count({ where }),
        ]);
        const items = await Promise.all(rawItems.map((i) => this.enrichIssue(i)));
        return { items, total, page, limit };
    }
    async findOne(id) {
        const issue = await this.prisma.issue.findUnique({
            where: { id },
            include: {
                project: true,
                reporter: { select: { id: true, name: true } },
                comments: {
                    orderBy: { createdAt: 'asc' },
                    include: { author: { select: { id: true, name: true } } },
                },
            },
        });
        if (!issue)
            throw new common_1.NotFoundException(`Issue #${id} not found`);
        const enriched = await this.enrichIssue(issue);
        const comments = issue.comments.map((c) => ({
            id: c.id,
            body: c.body,
            authorName: c.author?.name ?? 'Unknown',
            authorId: c.authorId,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            isSystem: c.body.startsWith('🔄 **'),
        }));
        return { ...enriched, comments };
    }
    async create(dto, reporterUserId) {
        const project = await this.projectsService.findOne(dto.projectId);
        if (project.endDate && project.endDate < new Date()) {
            throw new common_1.BadRequestException(`Project "${project.name}" has ended. Ask a Manager to extend it in Project Setup.`);
        }
        const defectNo = await this.projectsService.nextDefectNo(project.id, project.name);
        let resolvedReporterId = reporterUserId;
        if (dto.reporterId) {
            const asUser = await this.prisma.user.findUnique({ where: { id: dto.reporterId } });
            if (asUser) {
                resolvedReporterId = asUser.id;
            }
            else {
                const asEmpUser = await this.prisma.user.findFirst({ where: { employeeId: dto.reporterId } });
                if (asEmpUser)
                    resolvedReporterId = asEmpUser.id;
            }
        }
        try {
            const issue = await this.prisma.issue.create({
                data: {
                    defectNo,
                    title: dto.title,
                    description: dto.description,
                    type: dto.type ?? 'Bug',
                    priority: dto.priority,
                    severity: dto.severity ?? 'Major',
                    status: enums_1.IssueStatus.Open,
                    projectId: dto.projectId,
                    assigneeId: dto.assigneeId ?? null,
                    contactPersonId: dto.contactPersonId ?? null,
                    reporterId: resolvedReporterId,
                    environment: dto.environment ?? null,
                    dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                    module: dto.module ?? null,
                    stepsToReproduce: dto.stepsToReproduce ?? null,
                    expectedResult: dto.expectedResult ?? null,
                    actualResult: dto.actualResult ?? null,
                    fileName: dto.fileName ?? null,
                    fileUrl: dto.fileUrl ?? null,
                },
                include: { project: true },
            });
            await this.prisma.activityLog.create({
                data: {
                    type: 'issue_created',
                    message: `Issue ${issue.defectNo} "${issue.title}" created with status Open`,
                    userId: reporterUserId,
                    issueId: issue.id,
                    projectId: issue.projectId,
                },
            });
            this.fireIssueCreatedEmail({
                id: issue.id,
                defectNo: issue.defectNo,
                title: issue.title,
                status: issue.status,
                priority: issue.priority,
                reporterId: issue.reporterId,
                assigneeId: issue.assigneeId,
                project: issue.project,
            });
            return this.enrichIssue(issue);
        }
        catch (err) {
            const msg = err?.message ?? '';
            if (msg.includes('Foreign key') || msg.includes('foreign key')) {
                throw new common_1.BadRequestException('Invalid project, reporter or assignee. Please check your selections.');
            }
            throw new common_1.BadRequestException(`Failed to create issue: ${msg}`);
        }
    }
    async update(id, dto, userId) {
        const issue = await this.prisma.issue.findUnique({ where: { id } });
        if (!issue)
            throw new common_1.NotFoundException(`Issue #${id} not found`);
        const previousStatus = issue.status;
        if (dto.status && dto.status !== issue.status) {
            const allowed = ALLOWED_TRANSITIONS[issue.status] ?? [];
            if (!allowed.includes(dto.status)) {
                throw new common_1.BadRequestException(`Cannot transition from ${issue.status} to ${dto.status}. ` +
                    `Allowed: ${allowed.join(', ') || 'none'}.`);
            }
            if (dto.status === enums_1.IssueStatus.Resolved && !dto.resolution?.trim()) {
                throw new common_1.BadRequestException('A resolution note is required when marking an issue as Resolved.');
            }
            if (dto.status === enums_1.IssueStatus.Reopened) {
                throw new common_1.BadRequestException('Use the comment box with a reopen reason to reopen an issue.');
            }
        }
        const data = {};
        const fields = [
            'title', 'description', 'type', 'priority', 'severity',
            'environment', 'assigneeId', 'contactPersonId', 'module',
            'stepsToReproduce', 'expectedResult', 'actualResult', 'resolution',
            'fileName', 'fileUrl',
        ];
        for (const f of fields) {
            if (dto[f] !== undefined) {
                data[f] = dto[f];
            }
        }
        if (dto.dueDate !== undefined)
            data['dueDate'] = dto.dueDate ? new Date(dto.dueDate) : null;
        if (dto.status !== undefined) {
            data['status'] = dto.status;
            if (dto.status === enums_1.IssueStatus.Resolved)
                data['resolvedAt'] = new Date();
            if (dto.status === enums_1.IssueStatus.Closed)
                data['closedAt'] = new Date();
        }
        const updated = await this.prisma.issue.update({
            where: { id },
            data,
            include: { project: true },
        });
        await this.prisma.activityLog.create({
            data: {
                type: 'issue_updated',
                message: `Issue ${updated.defectNo} updated`,
                userId,
                issueId: updated.id,
                projectId: updated.projectId,
            },
        });
        if (dto.status !== undefined && dto.status !== previousStatus) {
            this.fireIssueStatusChangedEmail({
                id: updated.id,
                defectNo: updated.defectNo,
                title: updated.title,
                reporterId: updated.reporterId,
                assigneeId: updated.assigneeId,
                project: updated.project,
            }, previousStatus, dto.status, userId);
        }
        return this.enrichIssue(updated);
    }
    async addComment(issueId, dto, userId) {
        const issue = await this.prisma.issue.findUnique({
            where: { id: issueId },
            include: { project: true },
        });
        if (!issue)
            throw new common_1.NotFoundException(`Issue #${issueId} not found`);
        if (dto.statusChange && dto.statusChange !== issue.status) {
            const allowed = ALLOWED_TRANSITIONS[issue.status] ?? [];
            if (!allowed.includes(dto.statusChange)) {
                throw new common_1.BadRequestException(`Cannot transition from "${issue.status}" to "${dto.statusChange}". ` +
                    `Allowed: ${allowed.join(', ') || 'none'}.`);
            }
            if (dto.statusChange === enums_1.IssueStatus.Reopened) {
                if (!dto.reopenReason?.trim()) {
                    throw new common_1.BadRequestException('A reason is required when reopening an issue.');
                }
            }
            if (dto.statusChange === enums_1.IssueStatus.Resolved) {
                if (!dto.resolution?.trim() && !dto.body?.trim()) {
                    throw new common_1.BadRequestException('A resolution note is required when resolving an issue.');
                }
            }
            const statusData = {
                status: dto.statusChange,
            };
            if (dto.statusChange === enums_1.IssueStatus.Resolved) {
                statusData['resolvedAt'] = new Date();
                if (dto.resolution)
                    statusData['resolution'] = dto.resolution;
            }
            if (dto.statusChange === enums_1.IssueStatus.Closed) {
                statusData['closedAt'] = new Date();
            }
            if (dto.statusChange === enums_1.IssueStatus.Reopened) {
                statusData['reopenCount'] = issue.reopenCount + 1;
                statusData['resolvedAt'] = null;
                statusData['closedAt'] = null;
            }
            if (dto.statusChange === enums_1.IssueStatus.InProgress && issue.status === enums_1.IssueStatus.Open) {
            }
            await this.prisma.issue.update({ where: { id: issueId }, data: statusData });
            const transitionMsg = dto.statusChange === enums_1.IssueStatus.Reopened
                ? `Status changed: ${issue.status} → ${dto.statusChange} — Reason: ${dto.reopenReason}`
                : dto.statusChange === enums_1.IssueStatus.Resolved
                    ? `Status changed: ${issue.status} → ${dto.statusChange} — Resolution: ${dto.resolution ?? dto.body}`
                    : `Status changed: ${issue.status} → ${dto.statusChange}`;
            await this.addSystemComment(issueId, transitionMsg, userId);
            await this.prisma.activityLog.create({
                data: {
                    type: 'status_change',
                    message: `${issue.defectNo} status changed: ${issue.status} → ${dto.statusChange}`,
                    userId,
                    issueId,
                    projectId: issue.projectId,
                },
            });
            this.fireIssueStatusChangedEmail({
                id: issue.id,
                defectNo: issue.defectNo,
                title: issue.title,
                reporterId: issue.reporterId,
                assigneeId: issue.assigneeId,
                project: issue.project,
            }, issue.status, dto.statusChange, userId);
        }
        let userComment = null;
        const bodyText = dto.reopenReason
            ? `${dto.body ? dto.body + '\n\n' : ''}**Reopen reason:** ${dto.reopenReason}`
            : dto.body;
        if (bodyText?.trim()) {
            userComment = await this.prisma.comment.create({
                data: { body: bodyText, issueId, authorId: userId },
                include: { author: { select: { id: true, name: true } } },
            });
            await this.prisma.activityLog.create({
                data: {
                    type: 'comment',
                    message: `Comment added on ${issue.defectNo}`,
                    userId,
                    issueId,
                    projectId: issue.projectId,
                },
            });
        }
        return userComment;
    }
    async getStats(projectId) {
        const where = {};
        if (projectId)
            where['projectId'] = projectId;
        const now = new Date();
        const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const [all, overdueCount, weekCount] = await Promise.all([
            this.prisma.issue.findMany({ where, select: { status: true, priority: true, type: true } }),
            this.prisma.issue.count({ where: { ...where, dueDate: { lt: now }, status: { notIn: ['Resolved', 'Closed'] } } }),
            this.prisma.issue.count({ where: { ...where, createdAt: { gte: week } } }),
        ]);
        const byStatus = {};
        const byPriority = {};
        const byType = {};
        for (const i of all) {
            byStatus[i.status] = (byStatus[i.status] ?? 0) + 1;
            byPriority[i.priority] = (byPriority[i.priority] ?? 0) + 1;
            byType[i.type] = (byType[i.type] ?? 0) + 1;
        }
        const activity = await this.prisma.activityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 15,
        });
        return {
            total: all.length,
            open: byStatus['Open'] ?? 0,
            inProgress: byStatus['InProgress'] ?? 0,
            inReview: byStatus['InReview'] ?? 0,
            resolved: byStatus['Resolved'] ?? 0,
            closed: byStatus['Closed'] ?? 0,
            reopened: byStatus['Reopened'] ?? 0,
            critical: byPriority['Critical'] ?? 0,
            high: byPriority['High'] ?? 0,
            medium: byPriority['Medium'] ?? 0,
            low: byPriority['Low'] ?? 0,
            overdue: overdueCount,
            thisWeek: weekCount,
            byStatus, byPriority, byType, activity,
        };
    }
};
exports.IssuesService = IssuesService;
exports.IssuesService = IssuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        projects_service_1.ProjectsService,
        email_service_1.EmailService])
], IssuesService);
//# sourceMappingURL=issues.service.js.map