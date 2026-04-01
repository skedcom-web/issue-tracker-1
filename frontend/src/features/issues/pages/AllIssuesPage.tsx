import React, { useEffect, useState, useCallback } from 'react';
import { ISSUE_CREATED_EVENT } from '@components/layout/MainLayout';
import {
  Box, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  TextField, Select, MenuItem, FormControl, Button, Typography,
  CircularProgress, TableContainer, Pagination, InputAdornment, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { useNavigate } from 'react-router-dom';
import { issuesApi, projectsApi } from '@services/api';
import type { Issue, Project, IssueQuery } from '@app-types/index';
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
const ENVS = ['Dev', 'QA', 'UAT', 'Production'];
const STATUS_LABELS: Record<string, string> = { Open: 'Open', InProgress: 'In Progress', InReview: 'In Review', Resolved: 'Resolved', Closed: 'Closed', Reopened: 'Reopened' };
const TYPE_LABELS: Record<string, string> = { Bug: 'Bug', Task: 'Task', FeatureRequest: 'Feature Request', Improvement: 'Improvement' };

const INIT_FILTERS: IssueQuery = { page: 1, limit: 20, search: '', status: 'All', priority: 'All', type: 'All', projectId: 'All', environment: 'All', overdue: '' };

const filterControlSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: issueListColors.border },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C1C7D0' },
};

const AllIssuesPage: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<IssueQuery>(INIT_FILTERS);
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async (q: IssueQuery) => {
    setLoading(true);
    try {
      const res = await issuesApi.getAll(q);
      const d = res.data.data;
      setIssues(d.items);
      setTotal(d.total);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    projectsApi.getAll().then((r) => setProjects(r.data.data));
    load(INIT_FILTERS);
  }, [load]);

  useEffect(() => {
    const handler = () => {
      const fresh = { ...INIT_FILTERS, page: 1 };
      setFilters(fresh);
      setSearchInput('');
      load(fresh);
    };
    window.addEventListener(ISSUE_CREATED_EVENT, handler);
    return () => window.removeEventListener(ISSUE_CREATED_EVENT, handler);
  }, [load]);

  const handleFilter = (key: keyof IssueQuery, val: string) => {
    const updated = { ...filters, [key]: val, page: 1 };
    setFilters(updated);
    load(updated);
  };

  const handleSearch = () => {
    const updated = { ...filters, search: searchInput, page: 1 };
    setFilters(updated);
    load(updated);
  };

  const handleReset = () => {
    setSearchInput('');
    setFilters(INIT_FILTERS);
    load(INIT_FILTERS);
  };

  const handlePage = (_: React.ChangeEvent<unknown>, page: number) => {
    const updated = { ...filters, page };
    setFilters(updated);
    load(updated);
  };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const limit = filters.limit ?? 20;
  const page = filters.page ?? 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const headers = ['Type', 'Key', 'Summary', 'Project', 'Status', 'Priority', 'Severity', 'Reporter', 'Assignee', 'Reopen', 'Due'];

  return (
    <Box>
      <PageHeader breadcrumbs={['Tracking', 'Issue Tracking', 'All Issues']} title="Issues" subtitle="Track, manage and resolve all issues across projects" />

      <Paper elevation={0} sx={filterBarPaperSx}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search issues"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: issueListColors.textSecondary }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 240, ...filterControlSx, bgcolor: '#fff', borderRadius: 1 }}
          />
          {[
            { key: 'projectId', label: 'Project', opts: projects.map((p) => ({ v: String(p.id), l: p.name })) },
            { key: 'status', label: 'Status', opts: STATUSES.map((s) => ({ v: s, l: STATUS_LABELS[s] })) },
            { key: 'priority', label: 'Priority', opts: PRIORITIES.map((s) => ({ v: s, l: s })) },
            { key: 'type', label: 'Type', opts: TYPES.map((s) => ({ v: s, l: TYPE_LABELS[s] })) },
            { key: 'environment', label: 'Environment', opts: ENVS.map((s) => ({ v: s, l: s })) },
          ].map(({ key, label, opts }) => (
            <FormControl key={key} size="small" sx={{ minWidth: 148, ...filterControlSx, bgcolor: '#fff', borderRadius: 1 }}>
              <Select
                displayEmpty
                value={(filters[key as keyof IssueQuery] as string) ?? 'All'}
                onChange={(e) => handleFilter(key as keyof IssueQuery, e.target.value as string)}
                sx={{ fontSize: '0.8125rem', color: issueListColors.text }}
              >
                <MenuItem value="All">All {label}s</MenuItem>
                {opts.map((o) => <MenuItem key={o.v} value={o.v}>{o.l}</MenuItem>)}
              </Select>
            </FormControl>
          ))}
          <FormControl size="small" sx={{ minWidth: 132, ...filterControlSx, bgcolor: '#fff', borderRadius: 1 }}>
            <Select value={filters.overdue ?? ''} onChange={(e) => handleFilter('overdue', e.target.value as string)} sx={{ fontSize: '0.8125rem' }}>
              <MenuItem value="">Due date</MenuItem>
              <MenuItem value="true">Overdue only</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={() => load(filters)} sx={{ borderColor: issueListColors.border, color: issueListColors.text, textTransform: 'none' }}>Refresh</Button>
          <Button variant="outlined" size="small" startIcon={<FilterAltOffIcon />} onClick={handleReset} sx={{ borderColor: issueListColors.border, color: issueListColors.textSecondary, textTransform: 'none' }}>Clear filters</Button>
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
                  <TableCell colSpan={11} align="center" sx={{ py: 6, border: 'none' }}>
                    <CircularProgress size={28} sx={{ color: issueListColors.link }} />
                  </TableCell>
                </TableRow>
              ) : issues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6, color: issueListColors.textSecondary, fontSize: '0.875rem', borderBottom: `1px solid ${issueListColors.border}` }}>
                    No issues found
                  </TableCell>
                </TableRow>
              ) : issues.map((issue) => (
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
                  <TableCell sx={{ color: issueListColors.textSecondary, maxWidth: 160 }}>{issue.projectName}</TableCell>
                  <TableCell><StatusChip type="status" value={issue.status} variant="list" /></TableCell>
                  <TableCell><StatusChip type="priority" value={issue.priority} variant="list" /></TableCell>
                  <TableCell><StatusChip type="severity" value={issue.severity} variant="list" /></TableCell>
                  <TableCell><PersonCell name={issue.reporterName} kind="reporter" /></TableCell>
                  <TableCell><PersonCell name={issue.assigneeName} kind="assignee" /></TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {issue.reopenCount > 0 ? (
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: issueListColors.text }}>{issue.reopenCount}</Typography>
                    ) : (
                      <Typography sx={{ fontSize: '0.8125rem', color: '#C1C7D0' }}>—</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: issueListColors.textSecondary, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{fmtDate(issue.dueDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            px: 2,
            py: 1.5,
            borderTop: `1px solid ${issueListColors.border}`,
            bgcolor: '#FAFBFC',
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', color: issueListColors.textSecondary }}>
            {total === 0 ? 'Showing 0 of 0' : `Showing ${from}-${to} of ${total}`}
          </Typography>
          {total > limit && (
            <Pagination
              count={Math.ceil(total / limit)}
              page={page}
              onChange={handlePage}
              size="small"
              sx={{
                '& .MuiPaginationItem-root': { fontSize: '0.75rem', color: issueListColors.text },
                '& .Mui-selected': { bgcolor: `${issueListColors.link} !important`, color: '#fff' },
              }}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AllIssuesPage;
