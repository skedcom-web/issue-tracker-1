import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Typography, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Chip, Alert,
  InputAdornment, TableContainer, FormControl, InputLabel,
  Select, MenuItem, Autocomplete, createFilterOptions,
} from '@mui/material';
import AddIcon    from '@mui/icons-material/Add';
import EditIcon   from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { projectsApi, employeesApi } from '@services/api';
import type { Project, Employee } from '@app-types/index';
import PageHeader from '@components/common/PageHeader';
import SectionDivider from '@components/common/SectionDivider';

// ── Default department / business unit options ─────────────────
const DEFAULT_DEPARTMENTS = [
  'Engineering',
  'Quality Assurance',
  'Product Management',
  'Design / UX',
  'DevOps / Infrastructure',
  'Business Analysis',
  'Project Management Office',
  'Sales & Marketing',
  'Customer Support',
  'Finance',
  'Human Resources',
  'Operations',
  'Research & Development',
  'Security',
  'Data & Analytics',
];

const DEPT_STORAGE_KEY = 'vthink_project_departments';

function loadSavedDepts(): string[] {
  try {
    const raw = localStorage.getItem(DEPT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

function saveDept(dept: string) {
  try {
    const existing = loadSavedDepts();
    if (!existing.includes(dept)) {
      localStorage.setItem(DEPT_STORAGE_KEY, JSON.stringify([...existing, dept]));
    }
  } catch { /* ignore */ }
}

// ── Creatable filter for Autocomplete ─────────────────────────
const filter = createFilterOptions<string>();

// ──────────────────────────────────────────────────────────────
const ProjectSetupPage: React.FC = () => {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [filtered, setFiltered]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Project | null>(null);
  const [form, setForm]           = useState({
    name: '', description: '', department: '',
    leadId: '', startDate: '', endDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // Build merged department list: defaults + saved custom + from existing projects
  const [customDepts, setCustomDepts] = useState<string[]>(loadSavedDepts);

  const allDeptOptions = useMemo(() => {
    const fromProjects = projects.map((p) => p.department ?? '').filter(Boolean);
    const merged = [...new Set([...DEFAULT_DEPARTMENTS, ...customDepts, ...fromProjects])];
    return merged.sort();
  }, [projects, customDepts]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await projectsApi.getAll();
      setProjects(r.data.data);
      setFiltered(r.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    employeesApi.getAll({ limit: 500 }).then((r) => setEmployees(r.data.data.items));
  }, []);

  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(
      projects.filter((p) =>
        p.name.toLowerCase().includes(s) ||
        (p.department ?? '').toLowerCase().includes(s) ||
        (p.lead ?? '').toLowerCase().includes(s),
      ),
    );
  }, [search, projects]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', department: '', leadId: '', startDate: '', endDate: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    const emp = employees.find((e) => e.employeeName === p.lead);
    setForm({
      name:        p.name,
      description: p.description ?? '',
      department:  p.department  ?? '',
      leadId:      emp?.id       ?? '',
      startDate:   p.startDate ? p.startDate.slice(0, 10) : '',
      endDate:     p.endDate   ? p.endDate.slice(0, 10)   : '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setSaving(true); setError('');

    // If department is a new custom value, persist it
    if (form.department && !allDeptOptions.includes(form.department)) {
      saveDept(form.department);
      setCustomDepts((d) => [...d, form.department]);
    }

    const leadEmp = employees.find((e) => e.id === form.leadId);
    const body = {
      name:        form.name.trim(),
      description: form.description,
      department:  form.department,
      lead:        leadEmp?.employeeName ?? '',
      startDate:   form.startDate || undefined,
      endDate:     form.endDate   || undefined,
    };
    try {
      if (editing) { await projectsApi.update(editing.id, body); }
      else         { await projectsApi.create(body); }
      setModalOpen(false);
      await load();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to save project',
      );
    } finally { setSaving(false); }
  };

  const isEnded = (p: Project) => !!p.endDate && new Date(p.endDate) < new Date();
  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <Box>
      <PageHeader
        breadcrumbs={['Administration', 'Project Setup']}
        title="Project Setup"
        subtitle="Create and configure projects for your teams"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>New Project</Button>}
      />

      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <TextField
          size="small" placeholder="Search projects…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#6B6B8A' }} /></InputAdornment> }}
          sx={{ minWidth: 280 }}
        />
        <Typography component="span" sx={{ ml: 2, fontSize: 12, color: '#6B6B8A' }}>
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </Typography>
      </Paper>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Project Name', 'Department / BU', 'Lead', 'Start Date', 'End Date', 'Status', 'Actions'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#07003C' }}>{p.name}</Typography>
                    {p.description && (
                      <Typography sx={{ fontSize: 11, color: '#6B6B8A', mt: 0.25 }}>
                        {p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.department
                      ? <Chip label={p.department} size="small" sx={{ bgcolor: '#EBE8FC', color: '#4F38F6', fontWeight: 500, fontSize: 11, height: 22 }} />
                      : <Typography sx={{ fontSize: 12, color: '#6B6B8A' }}>—</Typography>
                    }
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: '#6B6B8A' }}>{p.lead ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{fmtDate(p.startDate)}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: isEnded(p) ? '#DC2626' : undefined, fontWeight: isEnded(p) ? 600 : 400 }}>
                    {fmtDate(p.endDate)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={isEnded(p) ? 'Ended' : 'Active'} size="small"
                      sx={{ bgcolor: isEnded(p) ? '#fef2f2' : '#f0fdf4', color: isEnded(p) ? '#DC2626' : '#16A34A', fontWeight: 600, fontSize: 11, height: 22, borderRadius: '99px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" startIcon={<EditIcon sx={{ fontSize: 13 }} />}
                      onClick={() => openEdit(p)} sx={{ fontSize: 12, py: 0.5 }}>
                      Edit / Extend
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: '#6B6B8A', fontSize: 13 }}>
                    No projects found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── CREATE / EDIT MODAL ──────────────────────────────── */}
      <Dialog open={modalOpen} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 0.5, borderBottom: '2px solid #4F38F6' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#07003C' }}>
            {editing ? '✏️ Edit Project' : '+ New Project'}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9CA3AF', mt: 0.25 }}>
            {editing ? 'Update project details below' : 'Fill in the details to create a new project'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2.5}>

            <Grid item xs={12}>
              <SectionDivider title="Project Information" subtitle="Core details about this project" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Project Name *"
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Customer Portal v2.0"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} size="small" label="Description (optional)"
                value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of what this project covers..."
              />
            </Grid>

            <Grid item xs={12}>
              <SectionDivider title="Team & Schedule" subtitle="Department, lead and project timeline" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                size="small"
                freeSolo
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                value={form.department}
                onChange={(_, newValue) => {
                  // Strip the "Add: " prefix if user selected a new option
                  const val = typeof newValue === 'string'
                    ? newValue.replace(/^Add:\s*/i, '')
                    : '';
                  setForm((f) => ({ ...f, department: val }));
                }}
                onInputChange={(_, newInput) => {
                  setForm((f) => ({ ...f, department: newInput }));
                }}
                options={allDeptOptions}
                filterOptions={(options, params) => {
                  const filtered2 = filter(options, params);
                  const inputVal  = params.inputValue.trim();
                  // Offer "Add: <typed value>" if it doesn't already exist
                  if (inputVal && !options.some((o) => o.toLowerCase() === inputVal.toLowerCase())) {
                    filtered2.push(`Add: ${inputVal}`);
                  }
                  return filtered2;
                }}
                getOptionLabel={(option) => option.replace(/^Add:\s*/i, '')}
                renderOption={(props, option) => {
                  const isNew = option.startsWith('Add:');
                  return (
                    <li {...props} key={option}>
                      {isNew ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#4F38F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AddIcon sx={{ fontSize: 12, color: '#fff' }} />
                          </Box>
                          <Typography sx={{ fontSize: 13 }}>
                            <strong>Add new:</strong> {option.replace(/^Add:\s*/i, '')}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: 13 }}>{option}</Typography>
                      )}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department / Business Unit"
                    placeholder="Select or type to add new…"
                    helperText="Pick from list or type a new department name"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Manager / Project Lead</InputLabel>
                <Select
                  value={form.leadId}
                  onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value as string }))}
                  label="Manager / Project Lead"
                >
                  <MenuItem value=""><em>— Select from employees —</em></MenuItem>
                  {employees
                    .filter((e) => e.active)
                    .sort((a, b) => a.employeeName.localeCompare(b.employeeName))
                    .map((e) => (
                      <MenuItem key={e.id} value={e.id}>{e.employeeNumber} — {e.employeeName}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" type="date" label="Start Date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" type="date" label="End Date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined" color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : editing ? 'Save Changes' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectSetupPage;
