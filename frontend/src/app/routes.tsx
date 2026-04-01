import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '@store/useAuth';
import MainLayout from '@components/layout/MainLayout';
import { ErrorBoundary } from '@components/common/ErrorBoundary';

const LoginPage           = lazy(() => import('@features/auth/LoginPage'));
const ResetPasswordPage   = lazy(() => import('@features/auth/ResetPasswordPage'));
const DashboardPage       = lazy(() => import('@features/dashboard/DashboardPage'));
const AllIssuesPage       = lazy(() => import('@features/issues/pages/AllIssuesPage'));
const MyIssuesPage        = lazy(() => import('@features/issues/pages/MyIssuesPage'));
const IssueDetailPage     = lazy(() => import('@features/issues/pages/IssueDetailPage'));
const ProjectSetupPage    = lazy(() => import('@features/projects/pages/ProjectSetupPage'));
const EmployeeSetupPage   = lazy(() => import('@features/employees/pages/EmployeeSetupPage'));
const UserManagementPage  = lazy(() => import('@features/users/pages/UserManagementPage'));
const ChangePasswordPage  = lazy(() => import('@features/auth/ChangePasswordPage'));
const ProjectTrackingPage = lazy(() => import('@features/projects/pages/ProjectTrackingPage'));
const ReportsPage         = lazy(() => import('@features/reports/ReportsPage'));

const Loader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// ── Standard protected route — needs valid token ──────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const hasToken = !!localStorage.getItem('access_token');
  if (!hasToken && !isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ── Admin-only route — Admin or Manager roles only ────────────────
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const hasToken = !!localStorage.getItem('access_token');
  if (!hasToken && !isAuthenticated) return <Navigate to="/login" replace />;
  // If user is loaded and is NOT admin/manager — redirect to dashboard
  if (user && user.role !== 'Admin' && user.role !== 'Manager') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {/* Public */}
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* All authenticated users */}
        <Route path="dashboard"        element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
        <Route path="issues"           element={<ErrorBoundary><AllIssuesPage /></ErrorBoundary>} />
        <Route path="issues/:id"       element={<ErrorBoundary><IssueDetailPage /></ErrorBoundary>} />
        <Route path="my-issues"        element={<ErrorBoundary><MyIssuesPage /></ErrorBoundary>} />
        <Route path="project-tracking" element={<ErrorBoundary><ProjectTrackingPage /></ErrorBoundary>} />
        <Route path="change-password"  element={<ErrorBoundary><ChangePasswordPage /></ErrorBoundary>} />

        {/* Admin + Manager only — redirects others to dashboard */}
        <Route path="project-setup"   element={<AdminRoute><ErrorBoundary><ProjectSetupPage /></ErrorBoundary></AdminRoute>} />
        <Route path="employee-setup"  element={<AdminRoute><ErrorBoundary><EmployeeSetupPage /></ErrorBoundary></AdminRoute>} />
        <Route path="user-management" element={<AdminRoute><ErrorBoundary><UserManagementPage /></ErrorBoundary></AdminRoute>} />
        <Route path="reports"         element={<AdminRoute><ErrorBoundary><ReportsPage /></ErrorBoundary></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
