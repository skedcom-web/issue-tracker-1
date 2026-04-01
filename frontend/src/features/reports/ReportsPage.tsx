import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, TextField, Stack,
  List, ListItemButton, ListItemText, CircularProgress, Alert, Chip, Divider,
} from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { projectsApi, reportsApi, type ReportQueryParams } from '@services/api';
import type { Project } from '@app-types/index';
import type {
  ExecutiveSummaryReport, ProjectWiseReport, ReporterWorkloadReport, AssigneeWorkloadReport,
  OverdueAgingReport, IssueRegisterReport, WeeklyTrendReport, PriorityMatrixReport,
} from '@app-types/index';
import PageHeader from '@components/common/PageHeader';
import { downloadPdfReport, downloadXlsxSheet, downloadXlsxWorkbook } from './reportExport';

type ReportId =
  | 'executive-summary'
  | 'by-project'
  | 'by-reporter'
  | 'by-assignee'
  | 'overdue-aging'
  | 'issue-register'
  | 'weekly-trend'
  | 'priority-matrix';

const REPORT_MENU: { id: ReportId; title: string; description: string }[] = [
  { id: 'executive-summary', title: 'Executive summary', description: 'Totals, status, priority, type, severity, by project' },
  { id: 'by-project', title: 'Project-wise performance', description: 'Volume and pipeline by project' },
  { id: 'by-reporter', title: 'Reporter workload', description: 'Issues raised per user' },
  { id: 'by-assignee', title: 'Assignee workload', description: 'Issues owned per employee' },
  { id: 'overdue-aging', title: 'Overdue & aging', description: 'Open items past due with days overdue' },
  { id: 'issue-register', title: 'Full issue register', description: 'Detailed rows for export and audit' },
  { id: 'weekly-trend', title: 'Creation trend (16 weeks)', description: 'New issues per week' },
  { id: 'priority-matrix', title: 'Priority × status matrix', description: 'Risk view across workflow' },
];

const STATUSES = ['Open', 'InProgress', 'InReview', 'Resolved', 'Closed', 'Reopened'];
const STATUS_LABELS: Record<string, string> = {
  Open: 'Open', InProgress: 'In Progress', InReview: 'In Review', Resolved: 'Resolved', Closed: 'Closed', Reopened: 'Reopened',
};
const TYPES = ['Bug', 'Task', 'FeatureRequest', 'Improvement'];
const TYPE_LABELS: Record<string, string> = {
  Bug: 'Bug', Task: 'Task', FeatureRequest: 'Feature Request', Improvement: 'Improvement',
};

function toParams(
  projectId: string,
  dateFrom: string,
  dateTo: string,
  status: string,
  type: string,
  limit: number,
): ReportQueryParams {
  const p: ReportQueryParams = {};
  if (projectId && projectId !== 'All') p.projectId = Number(projectId);
  if (dateFrom) p.dateFrom = dateFrom;
  if (dateTo) p.dateTo = dateTo;
  if (status && status !== 'All') p.status = status;
  if (type && type !== 'All') p.type = type;
  if (limit) p.limit = limit;
  return p;
}

const ReportsPage: React.FC = () => {
  const [activeId, setActiveId] = useState<ReportId>('executive-summary');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [limit, setLimit] = useState(2000);
  /** Start true so first paint doesn’t flash “No data” before executive summary loads. */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);

  const params = () => toParams(projectId, dateFrom, dateTo, status, type, limit);

  /** Must reset in the same event as `activeId` — otherwise one render pairs new report id with stale `data` and `.map` throws. */
  const selectReport = (id: ReportId) => {
    setData(null);
    setError(null);
    setLoading(true);
    setActiveId(id);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = params();
      let res;
      switch (activeId) {
        case 'executive-summary':
          res = await reportsApi.executiveSummary(q);
          break;
        case 'by-project':
          res = await reportsApi.byProject(q);
          break;
        case 'by-reporter':
          res = await reportsApi.byReporter(q);
          break;
        case 'by-assignee':
          res = await reportsApi.byAssignee(q);
          break;
        case 'overdue-aging':
          res = await reportsApi.overdueAging(q);
          break;
        case 'issue-register':
          res = await reportsApi.issueRegister(q);
          break;
        case 'weekly-trend':
          res = await reportsApi.weeklyTrend(q);
          break;
        case 'priority-matrix':
          res = await reportsApi.priorityMatrix(q);
          break;
        default:
          return;
      }
      setData(res.data.data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to load report. Ensure you are signed in as Admin or Manager.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [activeId, projectId, dateFrom, dateTo, status, type, limit]);

  useEffect(() => {
    projectsApi.getAll().then((r) => setProjects(r.data.data));
  }, []);

  useEffect(() => {
    void load();
  }, [activeId, load]);

  const slug = () => `vthink-report-${activeId}-${new Date().toISOString().slice(0, 10)}`;

  const exportXlsx = () => {
    if (!data) return;
    const base = slug();
    switch (activeId) {
      case 'executive-summary': {
        const d = data as ExecutiveSummaryReport;
        downloadXlsxWorkbook(`${base}.xlsx`, [
          { name: 'Summary', data: [{ total: d.total, overdue: d.overdue, totalReopens: d.totalReopens, generatedAt: d.generatedAt }] },
          { name: 'By status', data: Object.entries(d.byStatus ?? {}).map(([k, v]) => ({ status: k, count: v })) },
          { name: 'By priority', data: Object.entries(d.byPriority ?? {}).map(([k, v]) => ({ priority: k, count: v })) },
          { name: 'By type', data: Object.entries(d.byType ?? {}).map(([k, v]) => ({ type: k, count: v })) },
          { name: 'By severity', data: Object.entries(d.bySeverity ?? {}).map(([k, v]) => ({ severity: k, count: v })) },
          { name: 'By project', data: (d.byProject ?? []).map((row) => ({ ...row })) as unknown as Record<string, unknown>[] },
        ]);
        break;
      }
      case 'by-project':
        downloadXlsxSheet(`${base}.xlsx`, 'By project', ((data as ProjectWiseReport).rows ?? []) as unknown as Record<string, unknown>[]);
        break;
      case 'by-reporter':
        downloadXlsxSheet(`${base}.xlsx`, 'By reporter', ((data as ReporterWorkloadReport).rows ?? []) as unknown as Record<string, unknown>[]);
        break;
      case 'by-assignee':
        downloadXlsxSheet(`${base}.xlsx`, 'By assignee', ((data as AssigneeWorkloadReport).rows ?? []) as unknown as Record<string, unknown>[]);
        break;
      case 'overdue-aging':
        downloadXlsxSheet(`${base}.xlsx`, 'Overdue', ((data as OverdueAgingReport).rows ?? []) as unknown as Record<string, unknown>[]);
        break;
      case 'issue-register':
        downloadXlsxSheet(`${base}.xlsx`, 'Register', ((data as IssueRegisterReport).rows ?? []) as unknown as Record<string, unknown>[]);
        break;
      case 'weekly-trend':
        downloadXlsxSheet(`${base}.xlsx`, 'Weekly trend', ((data as WeeklyTrendReport).weeks ?? []) as unknown as Record<string, unknown>[]);
        break;
      case 'priority-matrix': {
        const d = data as PriorityMatrixReport;
        const rows: Record<string, unknown>[] = [];
        for (const p of d.priorities ?? []) {
          const row: Record<string, unknown> = { priority: p };
          for (const s of d.statuses ?? []) row[s] = d.matrix[p]?.[s] ?? 0;
          rows.push(row);
        }
        downloadXlsxSheet(`${base}.xlsx`, 'Matrix', rows);
        break;
      }
      default:
        break;
    }
  };

  const exportPdf = () => {
    if (!data) return;
    const title = REPORT_MENU.find((r) => r.id === activeId)?.title ?? 'Report';
    const base = slug();
    switch (activeId) {
      case 'executive-summary': {
        const d = data as ExecutiveSummaryReport;
        downloadPdfReport(`${base}.pdf`, title, [
          {
            subtitle: 'Summary',
            head: [['Metric', 'Value']],
            body: [
              ['Total issues', d.total],
              ['Overdue (open)', d.overdue],
              ['Total reopens', d.totalReopens],
              ['Generated', d.generatedAt],
            ],
          },
          {
            subtitle: 'By project (top)',
            head: [['Project', 'Count']],
            body: d.byProject.slice(0, 25).map((r) => [r.projectName, r.count]),
          },
          {
            subtitle: 'By status',
            head: [['Status', 'Count']],
            body: Object.entries(d.byStatus ?? {}).map(([k, v]) => [k, v]),
          },
        ]);
        break;
      }
      case 'by-project': {
        const d = data as ProjectWiseReport;
        downloadPdfReport(`${base}.pdf`, title, [
          {
            subtitle: 'Projects',
            head: [['Project', 'Total', 'Open', 'In prog', 'Review', 'Resolved', 'Closed', 'Reopened']],
            body: (d.rows ?? []).map((row) => [
              row.projectName, row.total, row.open, row.inProgress, row.inReview, row.resolved, row.closed, row.reopened,
            ]),
          },
        ]);
        break;
      }
      case 'by-reporter': {
        const d = data as ReporterWorkloadReport;
        downloadPdfReport(`${base}.pdf`, title, [
          {
            subtitle: 'Reporters',
            head: [['Name', 'Email', 'Dept', 'Role', 'Issues']],
            body: (d.rows ?? []).map((row) => [row.reporterName, row.email ?? '', row.department ?? '', row.role ?? '', row.issueCount]),
          },
        ]);
        break;
      }
      case 'by-assignee': {
        const d = data as AssigneeWorkloadReport;
        downloadPdfReport(`${base}.pdf`, title, [
          {
            subtitle: 'Assignees',
            head: [['Name', 'Emp #', 'Issues']],
            body: (d.rows ?? []).map((row) => [row.assigneeName, row.employeeNumber ?? '', row.issueCount]),
          },
        ]);
        break;
      }
      case 'overdue-aging': {
        const d = data as OverdueAgingReport;
        downloadPdfReport(`${base}.pdf`, title, [
          {
            subtitle: `Overdue items (${d.total} shown, max 500)`,
            head: [['Defect', 'Title', 'Project', 'Priority', 'Days overdue']],
            body: (d.rows ?? []).slice(0, 40).map((row) => [row.defectNo, row.title.slice(0, 40), row.projectName, row.priority, row.daysOverdue]),
          },
        ]);
        break;
      }
      case 'issue-register': {
        const d = data as IssueRegisterReport;
        downloadPdfReport(`${base}.pdf`, title, [
          {
            subtitle: `Register (${d.rowCount} rows, cap ${d.cappedAt})`,
            head: [['Defect', 'Title', 'Project', 'Status', 'Priority', 'Created']],
            body: (d.rows ?? []).slice(0, 35).map((row) => [
              row.defectNo, row.title.slice(0, 35), row.projectName, row.status, row.priority, row.createdAt.slice(0, 10),
            ]),
          },
        ]);
        break;
      }
      case 'weekly-trend': {
        const d = data as WeeklyTrendReport;
        downloadPdfReport(`${base}.pdf`, title, [
          {
            subtitle: 'Weekly counts',
            head: [['Week start', 'Week end', 'New issues']],
            body: (d.weeks ?? []).map((w) => [w.weekStart, w.weekEnd, w.count]),
          },
        ]);
        break;
      }
      case 'priority-matrix': {
        const d = data as PriorityMatrixReport;
        const statuses = d.statuses ?? [];
        const head = [['Priority', ...statuses]];
        const body = (d.priorities ?? []).map((p) => [p, ...statuses.map((s) => d.matrix[p]?.[s] ?? 0)]);
        downloadPdfReport(`${base}.pdf`, title, [{ subtitle: 'Matrix', head, body }]);
        break;
      }
      default:
        break;
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
    if (!data) return <Typography color="text.secondary">No data</Typography>;

    switch (activeId) {
      case 'executive-summary': {
        const d = data as ExecutiveSummaryReport;
        return (
          <Stack spacing={3}>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Chip label={`Total: ${d.total ?? 0}`} color="primary" sx={{ fontWeight: 700 }} />
              <Chip label={`Overdue: ${d.overdue ?? 0}`} sx={{ fontWeight: 600 }} />
              <Chip label={`Reopens: ${d.totalReopens ?? 0}`} variant="outlined" />
              <Chip label={d.generatedAt ? new Date(d.generatedAt).toLocaleString() : '—'} variant="outlined" size="small" />
            </Stack>
            <Grid container spacing={2}>
              {[
                ['By status', d.byStatus ?? {}],
                ['By priority', d.byPriority ?? {}],
                ['By type', d.byType ?? {}],
                ['By severity', d.bySeverity ?? {}],
              ].map(([label, obj]) => (
                <Grid item xs={12} md={6} key={String(label)}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>{label}</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Key</TableCell>
                          <TableCell align="right">Count</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(obj as Record<string, number>).map(([k, v]) => (
                          <TableRow key={k}>
                            <TableCell>{k}</TableCell>
                            <TableCell align="right">{v}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              ))}
            </Grid>
            <Box>
              <Typography fontWeight={700} sx={{ mb: 1 }}>By project</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell align="right">Issues</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(d.byProject ?? []).map((row) => (
                      <TableRow key={row.projectId}>
                        <TableCell>{row.projectName}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
        );
      }
      case 'by-project': {
        const d = data as ProjectWiseReport;
        return (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Open</TableCell>
                  <TableCell align="right">In progress</TableCell>
                  <TableCell align="right">Review</TableCell>
                  <TableCell align="right">Resolved</TableCell>
                  <TableCell align="right">Closed</TableCell>
                  <TableCell align="right">Reopened</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(d.rows ?? []).map((row) => (
                  <TableRow key={row.projectId}>
                    <TableCell>{row.projectName}</TableCell>
                    <TableCell align="right">{row.total}</TableCell>
                    <TableCell align="right">{row.open}</TableCell>
                    <TableCell align="right">{row.inProgress}</TableCell>
                    <TableCell align="right">{row.inReview}</TableCell>
                    <TableCell align="right">{row.resolved}</TableCell>
                    <TableCell align="right">{row.closed}</TableCell>
                    <TableCell align="right">{row.reopened}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
      case 'by-reporter': {
        const d = data as ReporterWorkloadReport;
        return (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Reporter</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Issues</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(d.rows ?? []).map((row, i) => (
                  <TableRow key={row.reporterId ?? `u-${i}`}>
                    <TableCell>{row.reporterName}</TableCell>
                    <TableCell>{row.email ?? '—'}</TableCell>
                    <TableCell>{row.department ?? '—'}</TableCell>
                    <TableCell>{row.role ?? '—'}</TableCell>
                    <TableCell align="right">{row.issueCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
      case 'by-assignee': {
        const d = data as AssigneeWorkloadReport;
        return (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Employee #</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell align="right">Issues</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {d.rows.map((r, i) => (
                  <TableRow key={r.assigneeId ?? `a-${i}`}>
                    <TableCell>{r.assigneeName}</TableCell>
                    <TableCell>{r.employeeNumber ?? '—'}</TableCell>
                    <TableCell>{r.designation ?? '—'}</TableCell>
                    <TableCell align="right">{r.issueCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
      case 'overdue-aging': {
        const d = data as OverdueAgingReport;
        return (
          <>
            <Typography sx={{ mb: 1 }} color="text.secondary">
              Showing {d.total ?? (d.rows ?? []).length} overdue open issues (max 500).
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 560 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Defect</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell align="right">Days overdue</TableCell>
                    <TableCell>Assignee</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(d.rows ?? []).map((row) => (
                    <TableRow key={row.defectNo}>
                      <TableCell>{row.defectNo}</TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>{row.title}</TableCell>
                      <TableCell>{row.projectName}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.priority}</TableCell>
                      <TableCell align="right">{row.daysOverdue}</TableCell>
                      <TableCell>{row.assigneeName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        );
      }
      case 'issue-register': {
        const d = data as IssueRegisterReport;
        return (
          <>
            <Typography sx={{ mb: 1 }} color="text.secondary">
              {d.rowCount ?? (d.rows ?? []).length} rows (export limit {d.cappedAt ?? '—'}).
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 560 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Defect</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Prio</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(d.rows ?? []).map((row) => (
                    <TableRow key={row.defectNo}>
                      <TableCell>{row.defectNo}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>{row.title}</TableCell>
                      <TableCell>{row.projectName}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.priority}</TableCell>
                      <TableCell>{row.createdAt?.slice(0, 10) ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        );
      }
      case 'weekly-trend': {
        const d = data as WeeklyTrendReport;
        return (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Week start</TableCell>
                  <TableCell>Week end</TableCell>
                  <TableCell align="right">New issues</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(d.weeks ?? []).map((w) => (
                  <TableRow key={w.weekStart}>
                    <TableCell>{w.weekStart}</TableCell>
                    <TableCell>{w.weekEnd}</TableCell>
                    <TableCell align="right">{w.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
      case 'priority-matrix': {
        const d = data as PriorityMatrixReport;
        return (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Priority</TableCell>
                  {(d.statuses ?? []).map((s) => (
                    <TableCell key={s} align="right">{STATUS_LABELS[s] ?? s}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(d.priorities ?? []).map((p) => (
                  <TableRow key={p}>
                    <TableCell>{p}</TableCell>
                    {(d.statuses ?? []).map((s) => (
                      <TableCell key={s} align="right">{d.matrix[p]?.[s] ?? 0}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }
      default:
        return null;
    }
  };

  const meta = REPORT_MENU.find((r) => r.id === activeId);

  return (
    <Box>
      <PageHeader
        breadcrumbs={['Administration', 'Reports']}
        title="Management reports"
        subtitle="Analytics and exports for leadership (Admin & Manager only)."
        actions={(
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<TableChartOutlinedIcon />}
              onClick={exportXlsx}
              disabled={!data || loading}
              size="small"
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfOutlinedIcon />}
              onClick={exportPdf}
              disabled={!data || loading}
              size="small"
            >
              PDF
            </Button>
          </Stack>
        )}
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <Typography fontWeight={700} fontSize={13}>Report type</Typography>
            </Box>
            <List dense disablePadding>
              {REPORT_MENU.map((r) => (
                <ListItemButton
                  key={r.id}
                  selected={activeId === r.id}
                  onClick={() => selectReport(r.id)}
                  alignItems="flex-start"
                  sx={{
                    borderLeft: activeId === r.id ? '3px solid #4F38F6' : '3px solid transparent',
                    bgcolor: activeId === r.id ? '#f5f3ff' : undefined,
                  }}
                >
                  <ListItemText
                    primary={r.title}
                    secondary={r.description}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: activeId === r.id ? 700 : 500 }}
                    secondaryTypographyProps={{ fontSize: 11, sx: { mt: 0.5 } }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AssessmentOutlinedIcon color="primary" />
              <Box>
                <Typography fontWeight={800} fontSize={18}>{meta?.title}</Typography>
                <Typography variant="body2" color="text.secondary">{meta?.description}</Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Project</InputLabel>
                  <Select value={projectId} label="Project" onChange={(e) => setProjectId(e.target.value)}>
                    <MenuItem value="All">All projects</MenuItem>
                    {projects.map((p) => (
                      <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="From date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="To date"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {activeId === 'issue-register' && (
                <>
                  <Grid item xs={6} sm={4} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                        <MenuItem value="All">All</MenuItem>
                        {STATUSES.map((s) => (
                          <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
                        <MenuItem value="All">All</MenuItem>
                        {TYPES.map((t) => (
                          <MenuItem key={t} value={t}>{TYPE_LABELS[t]}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Row limit"
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(Math.min(5000, Math.max(1, Number(e.target.value) || 2000)))}
                      inputProps={{ min: 1, max: 5000 }}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Button variant="contained" onClick={() => void load()} disabled={loading}>
                  Run report
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            {renderBody()}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;
