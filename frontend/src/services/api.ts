import axiosInstance from './axiosInstance';
import type {
  ApiResponse, User, Project, Issue,
  Employee, DashboardStats, IssueQuery,
} from '@app-types/index';

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  login: (credential: string, password: string) =>
    axiosInstance.post<{ accessToken: string; mustChangePassword: boolean; user: User }>(
      '/api/v1/auth/login',
      { credential, password },
    ),

  me: () =>
    axiosInstance.get<ApiResponse<User>>('/api/v1/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    axiosInstance.post('/api/v1/auth/change-password', { currentPassword, newPassword }),

  forgotPassword: (credential: string) =>
    axiosInstance.post<ApiResponse<{ message: string }>>('/api/v1/auth/forgot-password', { credential }),

  resetPassword: (token: string, userId: string, newPassword: string) =>
    axiosInstance.post<ApiResponse<{ message: string }>>('/api/v1/auth/reset-password', { token, userId, newPassword }),
};

// ── Projects ──────────────────────────────────────────────────────
export const projectsApi = {
  getAll: () =>
    axiosInstance.get<ApiResponse<Project[]>>('/api/v1/projects'),

  getOne: (id: number) =>
    axiosInstance.get<ApiResponse<Project>>(`/api/v1/projects/${id}`),

  create: (data: Partial<Project>) =>
    axiosInstance.post<ApiResponse<Project>>('/api/v1/projects', data),

  update: (id: number, data: Partial<Project>) =>
    axiosInstance.put<ApiResponse<Project>>(`/api/v1/projects/${id}`, data),

  remove: (id: number) =>
    axiosInstance.delete(`/api/v1/projects/${id}`),
};

// ── Issues ────────────────────────────────────────────────────────
export const issuesApi = {
  getAll: (query: IssueQuery = {}) =>
    axiosInstance.get<ApiResponse<{ items: Issue[]; total: number; page: number; limit: number }>>(
      '/api/v1/issues',
      { params: query },
    ),

  getOne: (id: number) =>
    axiosInstance.get<ApiResponse<Issue>>(`/api/v1/issues/${id}`),

  create: (data: Partial<Issue>) =>
    axiosInstance.post<ApiResponse<Issue>>('/api/v1/issues', data),

  update: (id: number, data: Partial<Issue>) =>
    axiosInstance.patch<ApiResponse<Issue>>(`/api/v1/issues/${id}`, data),

  addComment: (id: number, payload: { body?: string; statusChange?: string; resolution?: string; reopenReason?: string }) =>
    axiosInstance.post(`/api/v1/issues/${id}/comments`, payload),

  getStats: (projectId?: number) =>
    axiosInstance.get<ApiResponse<DashboardStats>>(
      '/api/v1/issues/stats',
      { params: projectId ? { projectId } : {} },
    ),
};

// ── Employees ─────────────────────────────────────────────────────
export const employeesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; active?: string }) =>
    axiosInstance.get<ApiResponse<{ items: Employee[]; total: number; page: number; limit: number; totalPages: number }>>('/api/v1/employees', { params }),

  create: (data: Partial<Employee>) =>
    axiosInstance.post<ApiResponse<Employee>>('/api/v1/employees', data),

  bulkUpsert: (rows: Partial<Employee>[]) =>
    axiosInstance.post('/api/v1/employees/bulk', { rows }),

  update: (id: string, data: Partial<Employee>) =>
    axiosInstance.patch<ApiResponse<Employee>>(`/api/v1/employees/${id}`, data),

  remove: (id: string) =>
    axiosInstance.delete(`/api/v1/employees/${id}`),
};

// ── Users ─────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () =>
    axiosInstance.get<ApiResponse<User[]>>('/api/v1/users'),

  create: (data: { name: string; email: string; role: string; department?: string; employeeId?: string }) =>
    axiosInstance.post<ApiResponse<{ user: User; tempPassword: string }>>('/api/v1/users', data),

  update: (id: string, data: Partial<User>) =>
    axiosInstance.patch<ApiResponse<User>>(`/api/v1/users/${id}`, data),

  resetPassword: (id: string) =>
    axiosInstance.post<ApiResponse<{ tempPassword: string }>>(`/api/v1/users/${id}/reset-password`),

  remove: (id: string) =>
    axiosInstance.delete(`/api/v1/users/${id}`),
};

// ── Dashboard ─────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: (projectId?: number) =>
    axiosInstance.get<ApiResponse<DashboardStats>>(
      '/api/v1/dashboard/stats',
      { params: projectId ? { projectId } : {} },
    ),
};
