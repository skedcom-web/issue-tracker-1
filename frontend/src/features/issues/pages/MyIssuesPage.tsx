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
import {
  filterBarPaperSx,
  tableSurfacePaperSx,
  listTableHeadSx,
  listTableBodyRowSx,
  listTableOverdueRowSx,
  issueListColors,
} from '@features/issues/components/issueListTokens';
import {
  IssueTypeIcon,
  PersonCell,
  IssueKeyCell,
  IssueSummaryCell,
} from '@features/issues/components/IssueListCells';

const STATUSES = ['Open', 'InProgress', 'InReview', 'Resolved', 'Closed', 'Reopened'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const TYPES = ['Bug', 'Task', 'FeatureRequest', 'Improvement'];
const STATUS_LABELS: Record<string, string> = { Open: 'Open', InProgress: 'In Progress', InReview: 'In Review', Resolved: 'Resolved', Closed: 'Closed', Reopened: 'Reopened' };
const TYPE_LABELS: Record<string, string> = { Bug: 'Bug', Task: 'Task', FeatureRequest: 'Feature Request', Improvement: 'Improvement' };

const ROLE_COLORS = {
  Reporter: { bg: '#E9F2FF', color: '#0052CC', border: '#B3D4FF' },
  Assignee: { bg: '#E3FCEF', color: '#006644', border: '#ABF5D1' },
  'Assignee & Reporter': { bg: '#EAE6FF', color: '#403294', border: '#C0B6F2' },
};

const INIT_FILTERS: IssueQuery = { page: 1, limit: 500, search: '', status: 'All', priority: 'All', type: 'All', projectId: 'All' };

const filterControlSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: issueListColors.border },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C1C7D0' },
};

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

  const headers = ['Type', 'Key', 'Summary', 'Project', 'My role', 'Reporter', 'Assignee', 'Priority', 'Status', 'Due'];

  return (
    <Box>
      <PageHeader breadcrumbs={['Tracking', 'Issue Tracking', 'My Issues']} title="My issues" />

      <Paper elevation={0} sx={filterBarPaperSx}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search my issues"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: issueListColors.textSecondary }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 240, ...filterControlSx, bgcolor: '#fff', borderRadius: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 148, ...filterControlSx, bgcolor: '#fff', borderRadius: 1 }}>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value as string)} sx={{ fontSize: '0.8125rem' }}>
              <MenuItem value="All">All projects</MenuItem>
              {projects.map((p) => <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 132, ...filterControlSx, bgcolor: '#fff', borderRadius: 1 }}>
            <Select value={status} onChange={(e) => setStatus(e.target.value as string)} sx={{ fontSize: '0.8125rem' }}>
              <MenuItem value="All">All status</MenuItem>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 124, ...filterControlSx, bgcolor: '#fff', borderRadius: 1 }}>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as string)} sx={{ fontSize: '0.8125rem' }}>
              <MenuItem value="All">All priority</MenuItem>
              {PRIORITIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 136, ...filterControlSx, bgcolor: '#fff', borderRadius: 1 }}>
            <Select value={type} onChange={(e) => setType(e.target.value as string)} sx={{ fontSize: '0.8125rem' }}>
              <MenuItem value="All">All types</MenuItem>
              {TYPES.map((s) => <MenuItem key={s} value={s}>{TYPE_LABELS[s]}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140, ...filterControlSx, bgcolor: '#fff', borderRadius: 1 }}>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as string)} sx={{ fontSize: '0.8125rem' }}>
              <MenuItem value="All">All roles</MenuItem>
              <MenuItem value="Reporter">Reporter</MenuItem>
              <MenuItem value="Assignee">Assignee</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={loadAll} sx={{ borderColor: issueListColors.border, color: issueListColors.text, textTransform: 'none' }}>Refresh</Button>
          <Button variant="outlined" size="small" startIcon={<FilterAltOffIcon />} onClick={reset} sx={{ borderColor: issueListColors.border, color: issueListColors.textSecondary, textTransform: 'none' }}>Clear filters</Button>
        </Box>
      </Paper>

      <Paper elevation={0} sx={tableSurfacePaperSx}>
        <TableContainer>
          <Table size="medium" sx={{ borderCollapse: 'collapse' }}>
            <TableHead sx={listTableHeadSx}>
              <TableRow>
                {headers.map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6, border: 'none' }}>
                    <CircularProgress size={28} sx={{ color: issueListColors.link }} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8, borderBottom: `1px solid ${issueListColors.border}` }}>
                    <Box sx={{ color: issueListColors.textSecondary, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 0.5, color: issueListColors.text }}>All clear</Typography>
                      <Typography sx={{ fontSize: '0.875rem' }}>No issues raised by or assigned to you</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filtered.map((issue) => {
                const role = getMyRole(issue);
                const roleColor = ROLE_COLORS[role as keyof typeof ROLE_COLORS] ?? ROLE_COLORS.Reporter;
                return (
                  <TableRow
                    key={issue.id}
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    hover={false}
                    sx={issue.isOverdue ? listTableOverdueRowSx : listTableBodyRowSx}
                  >
                    <TableCell width={48}>
                      <IssueTypeIcon type={issue.type} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <IssueKeyCell defectNo={issue.defectNo} />
                        {issue.isOverdue && (
                          <Chip
                            label="OVERDUE"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              bgcolor: '#FFBDAD',
                              color: '#BF2600',
                              borderRadius: '3px',
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IssueSummaryCell title={issue.title} />
                    </TableCell>
                    <TableCell sx={{ color: issueListColors.textSecondary, maxWidth: 140 }}>{issue.projectName}</TableCell>
                    <TableCell>
                      <Chip
                        label={role}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          bgcolor: roleColor.bg,
                          color: roleColor.color,
                          border: `1px solid ${roleColor.border}`,
                          borderRadius: '4px',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    </TableCell>
                    <TableCell><PersonCell name={issue.reporterName} kind="reporter" /></TableCell>
                    <TableCell><PersonCell name={issue.assigneeName} kind="assignee" /></TableCell>
                    <TableCell><StatusChip type="priority" value={issue.priority} variant="list" /></TableCell>
                    <TableCell><StatusChip type="status" value={issue.status} variant="list" /></TableCell>
                    <TableCell sx={{ color: issueListColors.textSecondary, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{fmtDate(issue.dueDate)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${issueListColors.border}`, bgcolor: '#FAFBFC' }}>
          <Typography sx={{ fontSize: '0.75rem', color: issueListColors.textSecondary }}>
            {filtered.length} issue{filtered.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default MyIssuesPage;
