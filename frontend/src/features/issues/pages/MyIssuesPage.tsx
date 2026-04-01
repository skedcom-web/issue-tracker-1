import React, { useEffect, useState, useCallback } from 'react';
import { ISSUE_CREATED_EVENT } from '@components/layout/MainLayout';
import {
  Box, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  TextField, Select, MenuItem, FormControl, Button, Typography,
  CircularProgress, TableContainer, Chip, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { useNavigate } from 'react-router-dom';
import { issuesApi, projectsApi } from '@services/api';
import type { Issue, Project, IssueQuery } from '@app-types/index';
import { useAuth } from '@store/useAuth';
import PageHeader from '@components/common/PageHeader';
import StatusChip from '@components/common/StatusChip';

const STATUSES = ['Open', 'InProgress', 'InReview', 'Resolved', 'Closed', 'Reopened'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const TYPES = ['Bug', 'Task', 'FeatureRequest', 'Improvement'];
const STATUS_LABELS: Record<string, string> = { Open: 'Open', InProgress: 'In Progress', InReview: 'In Review', Resolved: 'Resolved', Closed: 'Closed', Reopened: 'Reopened' };
const TYPE_LABELS: Record<string, string> = { Bug: 'Bug', Task: 'Task', FeatureRequest: 'Feature Request', Improvement: 'Improvement' };

const ROLE_COLORS = {
  Reporter: { bg: '#fffbeb', color: '#F59E0B' },
  Assignee: { bg: '#f0fdf4', color: '#16A34A' },
  'Assignee & Reporter': { bg: '#EBE8FC', color: '#4F38F6' },
};

const INIT_FILTERS: IssueQuery = { page: 1, limit: 500, search: '', status: 'All', priority: 'All', type: 'All', projectId: 'All' };

const MyIssuesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [filtered, setFiltered] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [type, setType] = useState('All');
  const [projectId, setProjectId] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const myUserId = user?.id;
  const myEmployeeId = user?.employeeId;

  const getMyRole = (issue: Issue): string => {
    const isAssignee = issue.assigneeId === myEmployeeId;
    const isReporter = issue.reporterId === myUserId;
    if (isAssignee && isReporter) return 'Assignee & Reporter';
    if (isAssignee) return 'Assignee';
    return 'Reporter';
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await issuesApi.getAll(INIT_FILTERS);
      const all = res.data.data.items;
      const mine = all.filter((i) => {
        const isA = i.assigneeId === myEmployeeId;
        const isR = i.reporterId === myUserId;
        return isA || isR;
      });
      setAllIssues(mine);
      setFiltered(mine);
    } finally { setLoading(false); }
  }, [myUserId, myEmployeeId]);

  useEffect(() => {
    projectsApi.getAll().then((r) => setProjects(r.data.data));
    loadAll();
  }, [loadAll]);

  // ── Auto-refresh when a new issue is created via the modal ──────
  useEffect(() => {
    const handler = () => loadAll();
    window.addEventListener(ISSUE_CREATED_EVENT, handler);
    return () => window.removeEventListener(ISSUE_CREATED_EVENT, handler);
  }, [loadAll]);

  useEffect(() => {
    let result = [...allIssues];
    if (search) result = result.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()) || i.defectNo.toLowerCase().includes(search.toLowerCase()));
    if (status !== 'All') result = result.filter((i) => i.status === status);
    if (priority !== 'All') result = result.filter((i) => i.priority === priority);
    if (type !== 'All') result = result.filter((i) => i.type === type);
    if (projectId !== 'All') result = result.filter((i) => String(i.projectId) === projectId);
    if (roleFilter !== 'All') result = result.filter((i) => getMyRole(i) === roleFilter || (roleFilter === 'Assignee' && getMyRole(i) === 'Assignee & Reporter'));
    setFiltered(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority, type, projectId, roleFilter, allIssues]);

  const reset = () => { setSearch(''); setStatus('All'); setPriority('All'); setType('All'); setProjectId('All'); setRoleFilter('All'); };
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <Box>
      <PageHeader breadcrumbs={['Tracking', 'Issue Tracking', 'My Issues']} title="My Issues" />

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <TextField size="small" placeholder="Search my issues…" value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#6B6B8A' }} /></InputAdornment> }} sx={{ minWidth: 220 }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value as string)}>
              <MenuItem value="All">All Projects</MenuItem>
              {projects.map((p) => <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={status} onChange={(e) => setStatus(e.target.value as string)}>
              <MenuItem value="All">All Status</MenuItem>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as string)}>
              <MenuItem value="All">All Priority</MenuItem>
              {PRIORITIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={type} onChange={(e) => setType(e.target.value as string)}>
              <MenuItem value="All">All Types</MenuItem>
              {TYPES.map((s) => <MenuItem key={s} value={s}>{TYPE_LABELS[s]}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as string)}>
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="Reporter">Reporter</MenuItem>
              <MenuItem value="Assignee">Assignee</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={loadAll}>Refresh</Button>
          <Button variant="outlined" size="small" startIcon={<FilterAltOffIcon />} onClick={reset} color="inherit">Reset Filters</Button>
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Defect No', 'Title', 'Project', 'My Role', 'Raised By', 'Assignee', 'Priority', 'Status', 'Due Date'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <Box sx={{ color: '#6B6B8A', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>All clear!</Typography>
                    <Typography sx={{ fontSize: 13 }}>No issues raised by or assigned to you</Typography>
                  </Box>
                </TableCell></TableRow>
              ) : filtered.map((issue) => {
                const role = getMyRole(issue);
                const roleColor = ROLE_COLORS[role as keyof typeof ROLE_COLORS] ?? ROLE_COLORS.Reporter;
                return (
                  <TableRow key={issue.id} onClick={() => navigate(`/issues/${issue.id}`)} className={issue.isOverdue ? 'row-overdue' : ''} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={issue.defectNo} size="small" sx={{ bgcolor: '#EBE8FC', color: '#4F38F6', fontWeight: 600, fontSize: 11, fontFamily: 'monospace' }} />
                        {issue.isOverdue && <Chip label="OVERDUE" size="small" sx={{ bgcolor: '#fef2f2', color: '#DC2626', fontWeight: 700, fontSize: 10 }} />}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.title}</TableCell>
                    <TableCell sx={{ color: '#6B6B8A', fontSize: 12 }}>{issue.projectName}</TableCell>
                    <TableCell><Chip label={role} size="small" sx={{ bgcolor: roleColor.bg, color: roleColor.color, fontWeight: 600, fontSize: 11, height: 22, borderRadius: '99px' }} /></TableCell>
                    <TableCell sx={{ color: '#6B6B8A', fontSize: 12 }}>{issue.reporterName}</TableCell>
                    <TableCell sx={{ color: '#6B6B8A', fontSize: 12 }}>{issue.assigneeName}</TableCell>
                    <TableCell><StatusChip type="priority" value={issue.priority} /></TableCell>
                    <TableCell><StatusChip type="status" value={issue.status} /></TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{fmtDate(issue.dueDate)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #F3F4F6' }}>
          <Typography sx={{ fontSize: 12, color: '#6B6B8A' }}>{filtered.length} issue{filtered.length !== 1 ? 's' : ''}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default MyIssuesPage;
