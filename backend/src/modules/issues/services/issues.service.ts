import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { EmailService } from '@infrastructure/email/email.service';
import { ProjectsService } from '@modules/projects/services/projects.service';
import {
  CreateIssueDto,
  UpdateIssueDto,
  CreateCommentDto,
  IssueQueryDto,
} from '../dto/issue.dto';
import { IssueStatus } from '@common/constants/enums';

// ── Valid status transitions (IT audit-compliant) ─────────────────
const ALLOWED_TRANSITIONS: Record<string, IssueStatus[]> = {
  Open:       [IssueStatus.InProgress, IssueStatus.Closed],
  InProgress: [IssueStatus.InReview, IssueStatus.Open, IssueStatus.Closed],
  InReview:   [IssueStatus.Resolved, IssueStatus.InProgress, IssueStatus.Reopened],
  Resolved:   [IssueStatus.Closed, IssueStatus.Reopened],
  Closed:     [IssueStatus.Reopened],
  Reopened:   [IssueStatus.InProgress, IssueStatus.Open],
};

@Injectable()
export class IssuesService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private emailService: EmailService,
  ) {}

  /** Distinct recipient emails for reporter (User) and assignee (Employee or linked User). */
  private async collectIssueNotifyEmails(
    reporterId: string | null,
    assigneeId: string | null,
  ): Promise<string[]> {
    const byLower = new Map<string, string>();

    const add = (raw: string | null | undefined) => {
      const t = raw?.trim();
      if (!t) return;
      const k = t.toLowerCase();
      if (!byLower.has(k)) byLower.set(k, t);
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

  /** Single employee email (assignee / contact) — employee record or linked user. */
  private async resolveEmployeeNotifyEmail(employeeId: string): Promise<string | null> {
    const emp = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { email: true },
    });
    const direct = emp?.email?.trim();
    if (direct) return direct;
    const linked = await this.prisma.user.findFirst({
      where: { employeeId },
      select: { email: true },
    });
    return linked?.email?.trim() || null;
  }

  private fireIssueNewParticipantEmail(
    issue: {
      id: number;
      defectNo: string;
      title: string;
      status: string;
      priority: string;
      reporterId: string | null;
      project: { name: string };
    },
    role: 'assignee' | 'contact',
    employeeId: string,
    actorUserId: string,
  ) {
    void (async () => {
      const toEmail = await this.resolveEmployeeNotifyEmail(employeeId);
      if (!toEmail) return;

      const reporter = issue.reporterId
        ? await this.prisma.user.findUnique({
            where: { id: issue.reporterId },
            select: { name: true },
          })
        : null;

      const actor = await this.prisma.user.findUnique({
        where: { id: actorUserId },
        select: { name: true },
      });

      await this.emailService.sendIssueNewParticipant({
        toEmail,
        role,
        defectNo: issue.defectNo,
        title: issue.title,
        projectName: issue.project.name,
        priority: String(issue.priority),
        status: String(issue.status),
        issueId: issue.id,
        reportedByName: reporter?.name ?? 'A team member',
        updatedByName: actor?.name,
      });
    })();
  }

  private fireIssueCreatedEmail(issue: {
    id: number;
    defectNo: string;
    title: string;
    status: string;
    priority: string;
    reporterId: string | null;
    assigneeId: string | null;
    project: { name: string };
  }) {
    void (async () => {
      const toEmails = await this.collectIssueNotifyEmails(issue.reporterId, issue.assigneeId);
      if (!toEmails.length) return;

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

  private fireIssueStatusChangedEmail(
    issue: {
      id: number;
      defectNo: string;
      title: string;
      reporterId: string | null;
      assigneeId: string | null;
      project: { name: string };
    },
    previousStatus: string,
    newStatus: string,
    actorUserId: string,
  ) {
    void (async () => {
      const toEmails = await this.collectIssueNotifyEmails(issue.reporterId, issue.assigneeId);
      if (!toEmails.length) return;

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

  // ── Enrich a raw Prisma issue with display names & computed fields ─
  private async enrichIssue(issue: Record<string, unknown>) {
    const [employees, users] = await Promise.all([
      this.prisma.employee.findMany({ where: { active: true } }),
      this.prisma.user.findMany({ select: { id: true, name: true, employeeId: true } }),
    ]);

    const empById: Record<string, string> = {};
    for (const e of employees) empById[e.id] = e.employeeName;

    const userById: Record<string, string> = {};
    for (const u of users) userById[u.id] = u.name;

    const empToUserId: Record<string, string> = {};
    for (const u of users) { if (u.employeeId) empToUserId[u.employeeId] = u.id; }

    // assigneeId is Employee.id; reporterId is User.id; contactPersonId is Employee.id
    const assigneeId      = issue['assigneeId']      as string | null;
    const contactPersonId = issue['contactPersonId'] as string | null;
    const reporterId      = issue['reporterId']      as string | null;

    const assigneeName      = assigneeId      ? (empById[assigneeId]      ?? '—') : 'Unassigned';
    const contactPersonName = contactPersonId ? (empById[contactPersonId] ?? '—') : '—';
    const reporterName      = reporterId      ? (userById[reporterId]     ?? '—') : '—';

    const dueDate = issue['dueDate'] as Date | null;
    const status  = issue['status'] as string;
    const isOverdue = !!dueDate && dueDate < new Date() && !['Resolved', 'Closed'].includes(status);

    return {
      ...issue,
      assigneeName,
      contactPersonName,
      reporterName,
      projectName: (issue['project'] as { name: string } | null)?.name ?? '—',
      isOverdue,
    };
  }

  // ── System comment helper ──────────────────────────────────────────
  private async addSystemComment(issueId: number, message: string, userId: string) {
    return this.prisma.comment.create({
      data: {
        body: `🔄 **${message}**`,
        issueId,
        authorId: userId,
      },
    });
  }

  // ── Find all with filters ──────────────────────────────────────────
  async findAll(query: IssueQueryDto) {
    const page  = Number(query.page  ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip  = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where['OR'] = [
        { title:    { contains: query.search, mode: 'insensitive' } },
        { defectNo: { contains: query.search, mode: 'insensitive' } },
        { module:   { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status      && query.status      !== 'All') where['status']      = query.status;
    if (query.priority    && query.priority    !== 'All') where['priority']    = query.priority;
    if (query.severity    && query.severity    !== 'All') where['severity']    = query.severity;
    if (query.type        && query.type        !== 'All') where['type']        = query.type;
    if (query.environment && query.environment !== 'All') where['environment'] = query.environment;
    if (query.projectId   && query.projectId   !== 'All') where['projectId']   = Number(query.projectId);
    if (query.assigneeId  && query.assigneeId  !== 'All') where['assigneeId']  = query.assigneeId;

    if (query.overdue === 'true') {
      where['dueDate'] = { lt: new Date() };
      where['status']  = { notIn: ['Resolved', 'Closed'] };
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

    const items = await Promise.all(
      rawItems.map((i: Record<string, unknown>) => this.enrichIssue(i as Record<string, unknown>)),
    );

    return { items, total, page, limit };
  }

  // ── Find one with comments & activity ─────────────────────────────
  async findOne(id: number) {
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
    if (!issue) throw new NotFoundException(`Issue #${id} not found`);

    const enriched = await this.enrichIssue(issue as unknown as Record<string, unknown>);

    const comments = issue.comments.map((c: { id: number; body: string; createdAt: Date; updatedAt: Date; issueId: number; authorId: string; author: { id: string; name: string } | null }) => ({
      id:         c.id,
      body:       c.body,
      authorName: c.author?.name ?? 'Unknown',
      authorId:   c.authorId,
      createdAt:  c.createdAt,
      updatedAt:  c.updatedAt,
      isSystem:   c.body.startsWith('🔄 **'),
    }));

    return { ...enriched, comments };
  }

  // ── Create ─────────────────────────────────────────────────────────
  async create(dto: CreateIssueDto, reporterUserId: string) {
    const project = await this.projectsService.findOne(dto.projectId);
    if (project.endDate && project.endDate < new Date()) {
      throw new BadRequestException(
        `Project "${project.name}" has ended. Ask a Manager to extend it in Project Setup.`,
      );
    }

    const defectNo = await this.projectsService.nextDefectNo(project.id, project.name);

    // Resolve reporterId (could be employee ID or omitted — default to logged-in user)
    let resolvedReporterId = reporterUserId;
    if (dto.reporterId) {
      const asUser = await this.prisma.user.findUnique({ where: { id: dto.reporterId } });
      if (asUser) {
        resolvedReporterId = asUser.id;
      } else {
        const asEmpUser = await this.prisma.user.findFirst({ where: { employeeId: dto.reporterId } });
        if (asEmpUser) resolvedReporterId = asEmpUser.id;
      }
    }

    try {
      const issue = await this.prisma.issue.create({
        data: {
          defectNo,
          title:            dto.title,
          description:      dto.description,
          type:             dto.type      ?? 'Bug',
          priority:         dto.priority,
          severity:         dto.severity  ?? 'Major',
          status:           IssueStatus.Open,
          projectId:        dto.projectId,
          assigneeId:       dto.assigneeId      ?? null,
          contactPersonId:  dto.contactPersonId ?? null,
          reporterId:       resolvedReporterId,
          environment:      dto.environment     ?? null,
          dueDate:          dto.dueDate ? new Date(dto.dueDate) : null,
          module:           dto.module           ?? null,
          stepsToReproduce: dto.stepsToReproduce ?? null,
          expectedResult:   dto.expectedResult   ?? null,
          actualResult:     dto.actualResult     ?? null,
          fileName:         dto.fileName         ?? null,
          fileUrl:          dto.fileUrl          ?? null,
        },
        include: { project: true },
      });

      await this.prisma.activityLog.create({
        data: {
          type:      'issue_created',
          message:   `Issue ${issue.defectNo} "${issue.title}" created with status Open`,
          userId:    reporterUserId,
          issueId:   issue.id,
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

      return this.enrichIssue(issue as unknown as Record<string, unknown>);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? '';
      if (msg.includes('Foreign key') || msg.includes('foreign key')) {
        throw new BadRequestException('Invalid project, reporter or assignee. Please check your selections.');
      }
      throw new BadRequestException(`Failed to create issue: ${msg}`);
    }
  }

  // ── Update (fields only, no status transitions here — use comments) ─
  async update(id: number, dto: UpdateIssueDto, userId: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException(`Issue #${id} not found`);

    const previousAssigneeId = issue.assigneeId;
    const previousContactPersonId = issue.contactPersonId;

    const previousStatus = issue.status;

    // Status transitions via update are allowed but must be valid
    if (dto.status && dto.status !== issue.status) {
      const allowed = ALLOWED_TRANSITIONS[issue.status] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${issue.status} to ${dto.status}. ` +
          `Allowed: ${allowed.join(', ') || 'none'}.`,
        );
      }
      // Require resolution note when resolving
      if (dto.status === IssueStatus.Resolved && !dto.resolution?.trim()) {
        throw new BadRequestException('A resolution note is required when marking an issue as Resolved.');
      }
      // Require reopen reason
      if (dto.status === IssueStatus.Reopened) {
        throw new BadRequestException('Use the comment box with a reopen reason to reopen an issue.');
      }
    }

    const data: Record<string, unknown> = {};

    // Only copy allowed update fields
    const fields = [
      'title', 'description', 'type', 'priority', 'severity',
      'environment', 'assigneeId', 'contactPersonId', 'module',
      'stepsToReproduce', 'expectedResult', 'actualResult', 'resolution',
      'fileName', 'fileUrl',
    ];
    for (const f of fields) {
      if ((dto as Record<string, unknown>)[f] !== undefined) {
        data[f] = (dto as Record<string, unknown>)[f];
      }
    }

    if (dto.dueDate !== undefined) data['dueDate'] = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.status  !== undefined) {
      data['status'] = dto.status;
      if (dto.status === IssueStatus.Resolved) data['resolvedAt'] = new Date();
      if (dto.status === IssueStatus.Closed)   data['closedAt']   = new Date();
    }

    const updated = await this.prisma.issue.update({
      where: { id },
      data,
      include: { project: true },
    });

    await this.prisma.activityLog.create({
      data: {
        type:      'issue_updated',
        message:   `Issue ${updated.defectNo} updated`,
        userId,
        issueId:   updated.id,
        projectId: updated.projectId,
      },
    });

    if (dto.status !== undefined && dto.status !== previousStatus) {
      this.fireIssueStatusChangedEmail(
        {
          id: updated.id,
          defectNo: updated.defectNo,
          title: updated.title,
          reporterId: updated.reporterId,
          assigneeId: updated.assigneeId,
          project: updated.project,
        },
        previousStatus,
        dto.status,
        userId,
      );
    }

    // Reassignment / new contact: notify only the newly selected person (edit workflow)
    if (dto.assigneeId !== undefined) {
      const nextId = updated.assigneeId;
      if (nextId && nextId !== previousAssigneeId) {
        this.fireIssueNewParticipantEmail(
          {
            id: updated.id,
            defectNo: updated.defectNo,
            title: updated.title,
            status: updated.status,
            priority: updated.priority,
            reporterId: updated.reporterId,
            project: updated.project,
          },
          'assignee',
          nextId,
          userId,
        );
      }
    }

    if (dto.contactPersonId !== undefined) {
      const nextContact = updated.contactPersonId;
      if (nextContact && nextContact !== previousContactPersonId) {
        this.fireIssueNewParticipantEmail(
          {
            id: updated.id,
            defectNo: updated.defectNo,
            title: updated.title,
            status: updated.status,
            priority: updated.priority,
            reporterId: updated.reporterId,
            project: updated.project,
          },
          'contact',
          nextContact,
          userId,
        );
      }
    }

    return this.enrichIssue(updated as unknown as Record<string, unknown>);
  }

  // ── Add comment with optional status transition ────────────────────
  async addComment(issueId: number, dto: CreateCommentDto, userId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: { project: true },
    });
    if (!issue) throw new NotFoundException(`Issue #${issueId} not found`);

    // ── Validate status transition ───────────────────────────────────
    if (dto.statusChange && dto.statusChange !== issue.status) {
      const allowed = ALLOWED_TRANSITIONS[issue.status] ?? [];
      if (!allowed.includes(dto.statusChange)) {
        throw new BadRequestException(
          `Cannot transition from "${issue.status}" to "${dto.statusChange}". ` +
          `Allowed: ${allowed.join(', ') || 'none'}.`,
        );
      }

      // Reopen requires a reason
      if (dto.statusChange === IssueStatus.Reopened) {
        if (!dto.reopenReason?.trim()) {
          throw new BadRequestException('A reason is required when reopening an issue.');
        }
      }

      // Resolve requires resolution note
      if (dto.statusChange === IssueStatus.Resolved) {
        if (!dto.resolution?.trim() && !dto.body?.trim()) {
          throw new BadRequestException('A resolution note is required when resolving an issue.');
        }
      }

      // Apply status change
      const statusData: Record<string, unknown> = {
        status: dto.statusChange,
      };
      if (dto.statusChange === IssueStatus.Resolved) {
        statusData['resolvedAt'] = new Date();
        if (dto.resolution) statusData['resolution'] = dto.resolution;
      }
      if (dto.statusChange === IssueStatus.Closed) {
        statusData['closedAt'] = new Date();
      }
      if (dto.statusChange === IssueStatus.Reopened) {
        statusData['reopenCount']  = issue.reopenCount + 1;
        statusData['resolvedAt']   = null;
        statusData['closedAt']     = null;
      }
      if (dto.statusChange === IssueStatus.InProgress && issue.status === IssueStatus.Open) {
        // Clear any previous timestamps if going back to active
      }

      await this.prisma.issue.update({ where: { id: issueId }, data: statusData });

      // Add a system audit comment recording the transition
      const transitionMsg = dto.statusChange === IssueStatus.Reopened
        ? `Status changed: ${issue.status} → ${dto.statusChange} — Reason: ${dto.reopenReason}`
        : dto.statusChange === IssueStatus.Resolved
        ? `Status changed: ${issue.status} → ${dto.statusChange} — Resolution: ${dto.resolution ?? dto.body}`
        : `Status changed: ${issue.status} → ${dto.statusChange}`;

      await this.addSystemComment(issueId, transitionMsg, userId);

      await this.prisma.activityLog.create({
        data: {
          type:      'status_change',
          message:   `${issue.defectNo} status changed: ${issue.status} → ${dto.statusChange}`,
          userId,
          issueId,
          projectId: issue.projectId,
        },
      });

      this.fireIssueStatusChangedEmail(
        {
          id: issue.id,
          defectNo: issue.defectNo,
          title: issue.title,
          reporterId: issue.reporterId,
          assigneeId: issue.assigneeId,
          project: issue.project,
        },
        issue.status,
        dto.statusChange,
        userId,
      );
    }

    // Create the actual user comment (always, unless it is empty for a pure status change)
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
          type:      'comment',
          message:   `Comment added on ${issue.defectNo}`,
          userId,
          issueId,
          projectId: issue.projectId,
        },
      });
    }

    return userComment;
  }

  // ── Stats ──────────────────────────────────────────────────────────
  async getStats(projectId?: number) {
    const where: Record<string, unknown> = {};
    if (projectId) where['projectId'] = projectId;

    const now  = new Date();
    const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [all, overdueCount, weekCount] = await Promise.all([
      this.prisma.issue.findMany({ where, select: { status: true, priority: true, type: true } }),
      this.prisma.issue.count({ where: { ...where, dueDate: { lt: now }, status: { notIn: ['Resolved', 'Closed'] } } }),
      this.prisma.issue.count({ where: { ...where, createdAt: { gte: week } } }),
    ]);

    const byStatus: Record<string, number>   = {};
    const byPriority: Record<string, number> = {};
    const byType: Record<string, number>     = {};

    for (const i of all) {
      byStatus[i.status]     = (byStatus[i.status]     ?? 0) + 1;
      byPriority[i.priority] = (byPriority[i.priority] ?? 0) + 1;
      byType[i.type]         = (byType[i.type]         ?? 0) + 1;
    }

    const activity = await this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    return {
      total: all.length,
      open:       byStatus['Open']       ?? 0,
      inProgress: byStatus['InProgress'] ?? 0,
      inReview:   byStatus['InReview']   ?? 0,
      resolved:   byStatus['Resolved']   ?? 0,
      closed:     byStatus['Closed']     ?? 0,
      reopened:   byStatus['Reopened']   ?? 0,
      critical:   byPriority['Critical'] ?? 0,
      high:       byPriority['High']     ?? 0,
      medium:     byPriority['Medium']   ?? 0,
      low:        byPriority['Low']      ?? 0,
      overdue:    overdueCount,
      thisWeek:   weekCount,
      byStatus, byPriority, byType, activity,
    };
  }
}
