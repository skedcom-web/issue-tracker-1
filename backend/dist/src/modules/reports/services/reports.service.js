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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../infrastructure/database/prisma/prisma.service");
const CLOSED_STATUSES = ['Resolved', 'Closed'];
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildWhere(q) {
        const where = {};
        if (q.projectId != null)
            where.projectId = q.projectId;
        if (q.status && q.status !== 'All')
            where.status = q.status;
        if (q.type && q.type !== 'All')
            where.type = q.type;
        if (q.dateFrom || q.dateTo) {
            where.createdAt = {};
            if (q.dateFrom)
                where.createdAt.gte = new Date(q.dateFrom);
            if (q.dateTo) {
                const end = new Date(q.dateTo);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }
        return where;
    }
    async executiveSummary(q) {
        const where = this.buildWhere(q);
        const [total, byStatus, byPriority, byType, bySeverity, byProject, overdueCount, reopenedAgg,] = await Promise.all([
            this.prisma.issue.count({ where }),
            this.prisma.issue.groupBy({ by: ['status'], where, _count: { _all: true } }),
            this.prisma.issue.groupBy({ by: ['priority'], where, _count: { _all: true } }),
            this.prisma.issue.groupBy({ by: ['type'], where, _count: { _all: true } }),
            this.prisma.issue.groupBy({ by: ['severity'], where, _count: { _all: true } }),
            this.prisma.issue.groupBy({ by: ['projectId'], where, _count: { _all: true } }),
            this.prisma.issue.count({
                where: {
                    ...where,
                    dueDate: { lt: new Date() },
                    status: { notIn: [...CLOSED_STATUSES] },
                },
            }),
            this.prisma.issue.aggregate({ where, _sum: { reopenCount: true } }),
        ]);
        const projects = await this.prisma.project.findMany({ select: { id: true, name: true } });
        const projName = Object.fromEntries(projects.map((p) => [p.id, p.name]));
        return {
            generatedAt: new Date().toISOString(),
            filters: { projectId: q.projectId, dateFrom: q.dateFrom, dateTo: q.dateTo },
            total,
            overdue: overdueCount,
            totalReopens: reopenedAgg._sum.reopenCount ?? 0,
            byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])),
            byPriority: Object.fromEntries(byPriority.map((r) => [r.priority, r._count._all])),
            byType: Object.fromEntries(byType.map((r) => [r.type, r._count._all])),
            bySeverity: Object.fromEntries(bySeverity.map((r) => [r.severity, r._count._all])),
            byProject: byProject
                .map((r) => ({
                projectId: r.projectId,
                projectName: projName[r.projectId] ?? `Project #${r.projectId}`,
                count: r._count._all,
            }))
                .sort((a, b) => b.count - a.count),
        };
    }
    async byProject(q) {
        const where = this.buildWhere(q);
        const grouped = await this.prisma.issue.groupBy({
            by: ['projectId', 'status'],
            where,
            _count: { _all: true },
        });
        const projects = await this.prisma.project.findMany({ select: { id: true, name: true, department: true } });
        const meta = Object.fromEntries(projects.map((p) => [p.id, p]));
        const map = {};
        for (const row of grouped) {
            const pid = row.projectId;
            if (!map[pid]) {
                const m = meta[pid];
                map[pid] = {
                    projectId: pid,
                    projectName: m?.name ?? `Project #${pid}`,
                    department: m?.department ?? undefined,
                    total: 0,
                    open: 0,
                    inProgress: 0,
                    inReview: 0,
                    resolved: 0,
                    closed: 0,
                    reopened: 0,
                };
            }
            const c = row._count._all;
            map[pid].total += c;
            const s = row.status;
            if (s === 'Open')
                map[pid].open += c;
            else if (s === 'InProgress')
                map[pid].inProgress += c;
            else if (s === 'InReview')
                map[pid].inReview += c;
            else if (s === 'Resolved')
                map[pid].resolved += c;
            else if (s === 'Closed')
                map[pid].closed += c;
            else if (s === 'Reopened')
                map[pid].reopened += c;
        }
        return {
            generatedAt: new Date().toISOString(),
            filters: { projectId: q.projectId, dateFrom: q.dateFrom, dateTo: q.dateTo },
            rows: Object.values(map).sort((a, b) => b.total - a.total),
        };
    }
    async byReporter(q) {
        const where = this.buildWhere(q);
        const grouped = await this.prisma.issue.groupBy({
            by: ['reporterId'],
            where,
            _count: { _all: true },
        });
        const userIds = grouped.map((g) => g.reporterId).filter((id) => id != null);
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, department: true, role: true },
        });
        const umap = Object.fromEntries(users.map((u) => [u.id, u]));
        const rows = grouped
            .map((g) => {
            const u = g.reporterId ? umap[g.reporterId] : null;
            return {
                reporterId: g.reporterId,
                reporterName: u?.name ?? (g.reporterId ? 'Unknown user' : 'Unassigned'),
                email: u?.email,
                department: u?.department,
                role: u?.role,
                issueCount: g._count._all,
            };
        })
            .sort((a, b) => b.issueCount - a.issueCount);
        return {
            generatedAt: new Date().toISOString(),
            filters: { projectId: q.projectId, dateFrom: q.dateFrom, dateTo: q.dateTo },
            rows,
        };
    }
    async byAssignee(q) {
        const where = this.buildWhere(q);
        const grouped = await this.prisma.issue.groupBy({
            by: ['assigneeId'],
            where,
            _count: { _all: true },
        });
        const empIds = grouped.map((g) => g.assigneeId).filter((id) => id != null);
        const emps = await this.prisma.employee.findMany({
            where: { id: { in: empIds } },
            select: { id: true, employeeName: true, employeeNumber: true, designation: true, email: true },
        });
        const emap = Object.fromEntries(emps.map((e) => [e.id, e]));
        const rows = grouped
            .map((g) => {
            const e = g.assigneeId ? emap[g.assigneeId] : null;
            return {
                assigneeId: g.assigneeId,
                assigneeName: e?.employeeName ?? (g.assigneeId ? 'Unknown' : 'Unassigned'),
                employeeNumber: e?.employeeNumber,
                designation: e?.designation,
                email: e?.email,
                issueCount: g._count._all,
            };
        })
            .sort((a, b) => b.issueCount - a.issueCount);
        return {
            generatedAt: new Date().toISOString(),
            filters: { projectId: q.projectId, dateFrom: q.dateFrom, dateTo: q.dateTo },
            rows,
        };
    }
    async overdueAging(q) {
        const base = this.buildWhere(q);
        const where = {
            ...base,
            dueDate: { lt: new Date() },
            status: { notIn: [...CLOSED_STATUSES] },
        };
        const issues = await this.prisma.issue.findMany({
            where,
            orderBy: { dueDate: 'asc' },
            take: 500,
            include: { project: { select: { name: true } }, reporter: { select: { name: true } } },
        });
        const assigneeIds = [...new Set(issues.map((i) => i.assigneeId).filter(Boolean))];
        const emps = await this.prisma.employee.findMany({
            where: { id: { in: assigneeIds } },
            select: { id: true, employeeName: true },
        });
        const amap = Object.fromEntries(emps.map((e) => [e.id, e.employeeName]));
        const now = new Date();
        const rows = issues.map((i) => {
            const due = i.dueDate ? new Date(i.dueDate) : now;
            const daysOverdue = Math.max(0, Math.floor((now.getTime() - due.getTime()) / (86400000)));
            return {
                defectNo: i.defectNo,
                title: i.title,
                projectName: i.project.name,
                status: i.status,
                priority: i.priority,
                dueDate: i.dueDate?.toISOString() ?? null,
                daysOverdue,
                reporterName: i.reporter?.name ?? '—',
                assigneeName: i.assigneeId ? (amap[i.assigneeId] ?? '—') : 'Unassigned',
            };
        });
        return {
            generatedAt: new Date().toISOString(),
            filters: { projectId: q.projectId, dateFrom: q.dateFrom, dateTo: q.dateTo },
            total: rows.length,
            rows,
        };
    }
    async issueRegister(q) {
        const where = this.buildWhere(q);
        const take = Math.min(q.limit ?? 2000, 5000);
        const issues = await this.prisma.issue.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take,
            include: {
                project: { select: { name: true } },
                reporter: { select: { name: true, email: true } },
            },
        });
        const assigneeIds = [...new Set(issues.map((i) => i.assigneeId).filter(Boolean))];
        const emps = await this.prisma.employee.findMany({
            where: { id: { in: assigneeIds } },
            select: { id: true, employeeName: true },
        });
        const amap = Object.fromEntries(emps.map((e) => [e.id, e.employeeName]));
        const rows = issues.map((i) => ({
            defectNo: i.defectNo,
            title: i.title,
            projectName: i.project.name,
            type: i.type,
            status: i.status,
            priority: i.priority,
            severity: i.severity,
            environment: i.environment,
            module: i.module,
            reporterName: i.reporter?.name ?? '—',
            reporterEmail: i.reporter?.email,
            assigneeName: i.assigneeId ? (amap[i.assigneeId] ?? '—') : 'Unassigned',
            dueDate: i.dueDate?.toISOString() ?? null,
            createdAt: i.createdAt.toISOString(),
            resolvedAt: i.resolvedAt?.toISOString() ?? null,
            closedAt: i.closedAt?.toISOString() ?? null,
            reopenCount: i.reopenCount,
        }));
        return {
            generatedAt: new Date().toISOString(),
            filters: { projectId: q.projectId, dateFrom: q.dateFrom, dateTo: q.dateTo, status: q.status, type: q.type },
            rowCount: rows.length,
            cappedAt: take,
            rows,
        };
    }
    async weeklyTrend(q) {
        const base = this.buildWhere(q);
        const start = new Date();
        start.setDate(start.getDate() - 7 * 16);
        start.setHours(0, 0, 0, 0);
        const merged = { ...base };
        const ca = { gte: start };
        if (base.createdAt && typeof base.createdAt === 'object' && !Array.isArray(base.createdAt)) {
            const b = base.createdAt;
            if (b.gte && b.gte > start)
                ca.gte = b.gte;
            if (b.lte)
                ca.lte = b.lte;
        }
        merged.createdAt = ca;
        const created = await this.prisma.issue.findMany({
            where: merged,
            select: { createdAt: true },
        });
        const weeks = [];
        for (let w = 0; w < 16; w++) {
            const ws = new Date(start);
            ws.setDate(ws.getDate() + w * 7);
            const we = new Date(ws);
            we.setDate(we.getDate() + 7);
            const wsMs = ws.getTime();
            const weMs = we.getTime();
            const count = created.filter((r) => {
                const t = r.createdAt.getTime();
                return t >= wsMs && t < weMs;
            }).length;
            weeks.push({
                weekStart: ws.toISOString().slice(0, 10),
                weekEnd: we.toISOString().slice(0, 10),
                count,
            });
        }
        return {
            generatedAt: new Date().toISOString(),
            filters: { projectId: q.projectId, dateFrom: q.dateFrom, dateTo: q.dateTo },
            weeks,
        };
    }
    async priorityMatrix(q) {
        const where = this.buildWhere(q);
        const grouped = await this.prisma.issue.groupBy({
            by: ['priority', 'status'],
            where,
            _count: { _all: true },
        });
        const priorities = ['Critical', 'High', 'Medium', 'Low'];
        const statuses = ['Open', 'InProgress', 'InReview', 'Resolved', 'Closed', 'Reopened'];
        const matrix = {};
        for (const p of priorities) {
            matrix[p] = {};
            for (const s of statuses)
                matrix[p][s] = 0;
        }
        for (const row of grouped) {
            if (matrix[row.priority])
                matrix[row.priority][row.status] = row._count._all;
        }
        return {
            generatedAt: new Date().toISOString(),
            filters: { projectId: q.projectId, dateFrom: q.dateFrom, dateTo: q.dateTo },
            priorities: [...priorities],
            statuses: [...statuses],
            matrix,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map