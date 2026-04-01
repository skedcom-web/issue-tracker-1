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

const STATUSES = ['Open', 'InProgress', 'InReview', 'Resolved', 'Closed', 'Reopened'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const TYPES = ['Bug', 'Task', 'FeatureRequest', 'Improvement'];
const ENVS = ['Dev', 'QA', 'UAT', 'Production'];
const STATUS_LABELS: Record<string, string> = { Open: 'Open', InProgress: 'In Progress', InReview: 'In Review', Resolved: 'Resolved', Closed: 'Closed', Reopened: 'Reopened' };
const TYPE_LABELS: Record<string, string> = { Bug: 'Bug', Task: 'Task', FeatureRequest: 'Feature Request', Improvement: 'Improvement' };

const INIT_FILTERS: IssueQuery = { page: 1, limit: 20, search: '', status: 'All', priority: 'All', type: 'All', projectId: 'All', environment: 'All', overdue: '' };

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

  // ── Auto-refresh when a new issue is created via the modal ──────
  useEffect(() => {
    const handler = () => {
      // Reset to page 1 and reload so the new issue appears at the top
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

  return (
    <Box>
      <PageHeader breadcrumbs={['Tracking', 'Issue Tracking', 'All Issues']} title="Issue Tracker" subtitle="Track, manage and resolve all issues across projects" />

      {/* Filters */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <TextField
            size="small" placeholder="Search issues…" value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#6B6B8A' }} /></InputAdornment> }}
            sx={{ minWidth: 220 }}
          />
          {[
            { key: 'projectId', label: 'All Projects', opts: projects.map((p) => ({ v: String(p.id), l: p.name })) },
            { key: 'status', label: 'All Status', opts: STATUSES.map((s) => ({ v: s, l: STATUS_LABELS[s] })) },
            { key: 'priority', label: 'All Priority', opts: PRIORITIES.map((s) => ({ v: s, l: s })) },
            { key: 'type', label: 'All Types', opts: TYPES.map((s) => ({ v: s, l: TYPE_LABELS[s] })) },
            { key: 'environment', label: 'All Environments', opts: ENVS.map((s) => ({ v: s, l: s })) },
          ].map(({ key, label, opts }) => (
            <FormControl key={key} size="small" sx={{ minWidth: 140 }}>
              <Select value={(filters[key as keyof IssueQuery] as string) ?? 'All'} onChange={(e) => handleFilter(key as keyof IssueQuery, e.target.value as string)}>
                <MenuItem value="All">{label}</MenuItem>
                {opts.map((o) => <MenuItem key={o.v} value={o.v}>{o.l}</MenuItem>)}
              </Select>
            </FormControl>
          ))}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={filters.overdue ?? ''} onChange={(e) => handleFilter('overdue', e.target.value as string)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Overdue only</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={() => load(filters)}>Refresh</Button>
          <Button variant="outlined" size="small" startIcon={<FilterAltOffIcon />} onClick={handleReset} color="inherit">Reset Filters</Button>
        </Box>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Defect No', 'Title', 'Project', 'Priority', 'Severity', 'Type', 'Raised By', 'Assignee', 'Status', 'Reopen #', 'Due'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={11} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : issues.length === 0 ? (
                <TableRow><TableCell colSpan={11} align="center" sx={{ py: 6, color: '#6B6B8A', fontSize: 13 }}>No issues found</TableCell></TableRow>
              ) : issues.map((issue) => (
                <TableRow
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className={issue.isOverdue ? 'row-overdue' : ''}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={issue.defectNo} size="small" sx={{ bgcolor: '#EBE8FC', color: '#4F38F6', fontWeight: 600, fontSize: 11, fontFamily: 'monospace' }} />
                      {issue.isOverdue && <Chip label="OVERDUE" size="small" sx={{ bgcolor: '#fef2f2', color: '#DC2626', fontWeight: 700, fontSize: 10 }} />}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.title}</TableCell>
                  <TableCell sx={{ color: '#6B6B8A', fontSize: 12 }}>{issue.projectName}</TableCell>
                  <TableCell><StatusChip type="priority" value={issue.priority} /></TableCell>
                  <TableCell><StatusChip type="severity" value={issue.severity} /></TableCell>
                  <TableCell><StatusChip type="type" value={issue.type} /></TableCell>
                  <TableCell sx={{ color: '#6B6B8A', fontSize: 12 }}>{issue.reporterName}</TableCell>
                  <TableCell sx={{ color: '#6B6B8A', fontSize: 12 }}>{issue.assigneeName}</TableCell>
                  <TableCell><StatusChip type="status" value={issue.status} /></TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {issue.reopenCount > 0 ? (
                      <Chip
                        label={`×${issue.reopenCount}`}
                        size="small"
                        sx={{ bgcolor: '#fff7ed', color: '#F97316', fontWeight: 700, fontSize: 10, height: 20 }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: 12, color: '#D1D5DB' }}>—</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(issue.dueDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.5, borderTop: '1px solid #F3F4F6' }}>
          <Typography sx={{ fontSize: 12, color: '#6B6B8A' }}>{total} issue{total !== 1 ? 's' : ''}</Typography>
          {total > (filters.limit ?? 20) && (
            <Pagination count={Math.ceil(total / (filters.limit ?? 20))} page={filters.page ?? 1} onChange={handlePage} size="small" color="primary" />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AllIssuesPage;
