// ── Auth ──────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  employeeId?: string;
  employeeNumber?: string;
  active: boolean;
  mustChangePassword: boolean;
}

export type Role = 'Admin' | 'Manager' | 'Developer' | 'QA' | 'Reporter';

// ── Project ───────────────────────────────────────────────────────
export interface Project {
  id: number;
  name: string;
  description?: string;
  department?: string;
  lead?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

// ── Issue ─────────────────────────────────────────────────────────
export type IssueStatus = 'Open' | 'InProgress' | 'InReview' | 'Resolved' | 'Closed' | 'Reopened';
export type IssuePriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type IssueSeverity = 'Critical' | 'Blocker' | 'Major' | 'Minor';
export type IssueType = 'Bug' | 'Task' | 'FeatureRequest' | 'Improvement';
export type IssueEnvironment = 'Dev' | 'QA' | 'UAT' | 'Production';

export interface Issue {
  id: number;
  defectNo: string;
  title: string;
  description: string;
  type: IssueType;
  priority: IssuePriority;
  severity: IssueSeverity;
  status: IssueStatus;
  environment?: IssueEnvironment;
  module?: string;
  dueDate?: string;
  resolution?: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  fileName?: string;
  fileUrl?: string;
  reopenCount: number;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  projectId: number;
  projectName: string;
  reporterId?: string;
  reporterName: string;
  assigneeId?: string;
  assigneeName: string;
  contactPersonId?: string;
  contactPersonName?: string;
  isOverdue: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  isSystem?: boolean;
}

// ── Employee ──────────────────────────────────────────────────────
export interface Employee {
  id: string;
  employeeNumber: string;
  employeeName: string;
  designation?: string;
  email?: string;
  managerEmpNo?: string;
  active: boolean;
  createdAt: string;
}

// ── API Response ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginatedMeta;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Dashboard Stats ───────────────────────────────────────────────
export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  reopened: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  overdue: number;
  thisWeek: number;
  myIssues: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  activity: ActivityLog[];
}

export interface ActivityLog {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  userId?: string;
  issueId?: number;
  projectId?: number;
}

// ── Issue Filter Query ────────────────────────────────────────────
export interface IssueQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  projectId?: string;
  environment?: string;
  overdue?: string;
}
