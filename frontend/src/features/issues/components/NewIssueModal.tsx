import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Grid, Typography, Alert, CircularProgress,
  Box, IconButton,
} from '@mui/material';
import CloseIcon           from '@mui/icons-material/Close';
import AttachFileIcon      from '@mui/icons-material/AttachFile';
import DeleteIcon          from '@mui/icons-material/Delete';
import FolderOpenIcon      from '@mui/icons-material/FolderOpen';
import BugReportIcon       from '@mui/icons-material/BugReport';
import PriorityHighIcon    from '@mui/icons-material/PriorityHigh';
import PeopleAltIcon       from '@mui/icons-material/PeopleAlt';
import CalendarTodayIcon   from '@mui/icons-material/CalendarToday';
import PsychologyIcon      from '@mui/icons-material/Psychology';
import SectionDivider      from '@components/common/SectionDivider';
import { issuesApi, projectsApi, employeesApi } from '@services/api';
import { useAuth } from '@store/useAuth';
import type { Project, Employee } from '@app-types/index';

interface Props { open: boolean; onClose: () => void; onCreated?: () => void; }

const PRIORITIES  = ['Critical', 'High', 'Medium', 'Low'];
const SEVERITIES  = ['Critical', 'Blocker', 'Major', 'Minor'];
const TYPES       = ['Bug', 'Task', 'FeatureRequest', 'Improvement'];
const TYPE_LABELS: Record<string, string> = {
  Bug: '🐛 Bug', Task: '✅ Task',
  FeatureRequest: '⭐ Feature Request', Improvement: '🔧 Improvement',
};
const ENVS = ['Dev', 'QA', 'UAT', 'Production'];
const MAX_FILE_BYTES = 2 * 1024 * 1024;

const NewIssueModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const { user } = useAuth();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [projects, setProjects]   = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', type: 'Bug', priority: '', severity: 'Major',
    projectId: '', assigneeId: '', contactPersonId: '', environment: '',
    dueDate: '', module: '', stepsToReproduce: '', expectedResult: '', actualResult: '',
  });
  const [attachment, setAttachment] = useState<{ name: string; dataUrl: string } | null>(null);
  const [fileError, setFileError]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [projectEndedError, setProjectEndedError] = useState('');

  useEffect(() => {
    if (open) {
      projectsApi.getAll().then((r) => setProjects(r.data.data));
      employeesApi.getAll({ limit: 500 }).then((r) => setEmployees(r.data.data.items));
      setError(''); setProjectEndedError(''); setAttachment(null); setFileError('');
    }
  }, [open]);

  const sf = (k: keyof typeof form) =>
    (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleProjectChange = (pid: string) => {
    const proj = projects.find((p) => String(p.id) === pid);
    if (proj?.endDate && new Date(proj.endDate) < new Date()) {
      setProjectEndedError(
        `"${proj.name}" ended on ${new Date(proj.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. Ask a Manager to extend it.`,
      );
    } else { setProjectEndedError(''); }
    setForm((f) => ({ ...f, projectId: pid }));
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 2 MB.`);
      return;
    }
    setFileError('');
    const reader = new FileReader();
    reader.onload = () => setAttachment({ name: file.name, dataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title.trim())       { setError('Title is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!form.priority)           { setError('Priority is required'); return; }
    if (!form.projectId)          { setError('Project is required'); return; }
    if (projectEndedError)        return;

    setLoading(true); setError('');
    try {
      await issuesApi.create({
        title: form.title.trim(), description: form.description.trim(),
        type: form.type as never, priority: form.priority as never,
        severity: form.severity as never, projectId: Number(form.projectId),
        assigneeId: form.assigneeId || undefined,
        contactPersonId: form.contactPersonId || undefined,
        environment: form.environment as never || undefined,
        dueDate: form.dueDate || undefined, module: form.module || undefined,
        stepsToReproduce: form.stepsToReproduce || undefined,
        expectedResult: form.expectedResult || undefined,
        actualResult: form.actualResult || undefined,
        fileName: attachment?.name || undefined,
        fileUrl: attachment?.dataUrl || undefined,
      });
      onCreated?.(); onClose();
      setForm({ title: '', description: '', type: 'Bug', priority: '', severity: 'Major',
        projectId: '', assigneeId: '', contactPersonId: '', environment: '',
        dueDate: '', module: '', stepsToReproduce: '', expectedResult: '', actualResult: '' });
      setAttachment(null);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Failed to create issue');
    } finally { setLoading(false); }
  };

  const activeEmps = employees.filter((e) => e.active)
    .sort((a, b) => a.employeeName.localeCompare(b.employeeName));

  return (
    <Dialog open={open} maxWidth="md" fullWidth disableEscapeKeyDown
      PaperProps={{ sx: { borderRadius: 3 } }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <DialogTitle sx={{ pb: 0.5, borderBottom: '2px solid #4F38F6' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#EBE8FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BugReportIcon sx={{ color: '#4F38F6', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#07003C', lineHeight: 1.2 }}>
                New Issue
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
                All fields marked * are required
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ px: 1.5, py: 0.4, bgcolor: '#FEF3C7', borderRadius: 99, border: '1px solid #FDE68A' }}>
              <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#92400E' }}>
                ⚠ Click outside does not close
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose}
              sx={{ bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#fef2f2', color: '#DC2626' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5, pb: 2 }}>
        {error             && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {projectEndedError && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}><strong>Project Ended — </strong>{projectEndedError}</Alert>}

        <Grid container spacing={2}>

          {/* ── 1. Project & Classification ────────────────────── */}
          <Grid item xs={12}>
            <SectionDivider title="Project & Classification" subtitle="Which project does this issue belong to?" icon={<FolderOpenIcon sx={{ fontSize: 15 }} />} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Project *</InputLabel>
              <Select value={form.projectId} onChange={(e) => handleProjectChange(e.target.value as string)} label="Project *">
                <MenuItem value=""><em>— Select a project —</em></MenuItem>
                {projects.map((p) => <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Issue Type</InputLabel>
              <Select value={form.type} onChange={sf('type')} label="Issue Type">
                {TYPES.map((t) => <MenuItem key={t} value={t}>{TYPE_LABELS[t]}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* ── 2. Issue Details ───────────────────────────────── */}
          <Grid item xs={12}>
            <SectionDivider title="Issue Details" subtitle="Describe the issue clearly and concisely" icon={<BugReportIcon sx={{ fontSize: 15 }} />} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Title / Summary *"
              value={form.title} onChange={sf('title')}
              placeholder="e.g. Login button unresponsive on mobile Safari"
              InputLabelProps={{ shrink: !!form.title || undefined }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} size="small" label="Description *"
              value={form.description} onChange={sf('description')}
              placeholder="Provide a detailed explanation — what happened, when, and under what conditions..."
            />
          </Grid>

          {/* ── 3. Priority & Severity ─────────────────────────── */}
          <Grid item xs={12}>
            <SectionDivider title="Priority & Severity" subtitle="How urgent and impactful is this issue?" icon={<PriorityHighIcon sx={{ fontSize: 15 }} />} color="#DC2626" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Priority *</InputLabel>
              <Select value={form.priority} onChange={sf('priority')} label="Priority *">
                <MenuItem value=""><em>— How urgent? —</em></MenuItem>
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: { Critical: '#DC2626', High: '#EA580C', Medium: '#D97706', Low: '#16A34A' }[p] }} />
                      {p}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select value={form.severity} onChange={sf('severity')} label="Severity">
                {SEVERITIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* ── 4. People ──────────────────────────────────────── */}
          <Grid item xs={12}>
            <SectionDivider title="People" subtitle="Who is involved with this issue?" icon={<PeopleAltIcon sx={{ fontSize: 15 }} />} color="#7C3AED" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Raised By (Reporter)"
              value={user?.name ?? '—'} InputProps={{ readOnly: true }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB' } }}
              helperText="Auto-set to logged-in user" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Assignee</InputLabel>
              <Select value={form.assigneeId} onChange={sf('assigneeId')} label="Assignee">
                <MenuItem value=""><em>— Leave unassigned —</em></MenuItem>
                {activeEmps.map((e) => <MenuItem key={e.id} value={e.id}>{e.employeeNumber} — {e.employeeName}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Contact Person</InputLabel>
              <Select value={form.contactPersonId} onChange={sf('contactPersonId')} label="Contact Person">
                <MenuItem value=""><em>— None —</em></MenuItem>
                {activeEmps.map((e) => <MenuItem key={e.id} value={e.id}>{e.employeeNumber} — {e.employeeName}</MenuItem>)}
              </Select>
              <Typography sx={{ fontSize: 10, color: '#9CA3AF', mt: 0.5, px: 0.25 }}>Whom to contact for more details</Typography>
            </FormControl>
          </Grid>

          {/* ── 5. Scheduling & Environment ────────────────────── */}
          <Grid item xs={12}>
            <SectionDivider title="Scheduling & Environment" subtitle="When is it due and where does it occur?" icon={<CalendarTodayIcon sx={{ fontSize: 15 }} />} color="#0891B2" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" type="date" label="Due Date"
              value={form.dueDate} onChange={sf('dueDate')} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Environment</InputLabel>
              <Select value={form.environment} onChange={sf('environment')} label="Environment">
                <MenuItem value=""><em>— Select environment —</em></MenuItem>
                {ENVS.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth size="small" label="Module / Component"
              value={form.module} onChange={sf('module')}
              placeholder="e.g. Login, Reports, Dashboard..." />
          </Grid>

          {/* ── 6. Attachment ──────────────────────────────────── */}
          <Grid item xs={12}>
            <SectionDivider title="Attachment" subtitle="Optional — screenshots, logs or supporting files (max 2 MB)" icon={<AttachFileIcon sx={{ fontSize: 15 }} />} color="#16A34A" />
          </Grid>
          <Grid item xs={12}>
            <input type="file" ref={fileRef} style={{ display: 'none' }}
              accept="image/*,.pdf,.doc,.docx,.xlsx,.txt,.log"
              onChange={handleFilePick} />
            {attachment ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #BBF7D0' }}>
                <AttachFileIcon sx={{ color: '#16A34A', fontSize: 20 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#07003C' }}>{attachment.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: '#6B6B8A' }}>
                    {(attachment.dataUrl.length * 0.75 / 1024).toFixed(0)} KB
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setAttachment(null)}
                  sx={{ color: '#DC2626', '&:hover': { bgcolor: '#fef2f2' } }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="outlined" size="small" startIcon={<AttachFileIcon />}
                  onClick={() => fileRef.current?.click()}
                  sx={{ fontSize: 12, borderStyle: 'dashed', color: '#6B6B8A', borderColor: '#D1D5DB', '&:hover': { borderColor: '#4F38F6', color: '#4F38F6' } }}>
                  Choose File
                </Button>
                {fileError
                  ? <Typography sx={{ fontSize: 12, color: '#DC2626' }}>{fileError}</Typography>
                  : <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>Images, PDF, Word, Excel, TXT — max 2 MB</Typography>
                }
              </Box>
            )}
          </Grid>

          {/* ── 7. QA Details ──────────────────────────────────── */}
          <Grid item xs={12}>
            <SectionDivider title="QA Details" subtitle="Optional — fill these in for bug reports to speed up investigation" icon={<PsychologyIcon sx={{ fontSize: 15 }} />} color="#F97316" />
          </Grid>
          {[
            { k: 'stepsToReproduce', label: 'Steps to Reproduce', ph: '1. Navigate to...\n2. Click...\n3. Observe that...' },
            { k: 'expectedResult',   label: 'Expected Result',    ph: 'Describe what should happen in normal conditions...' },
            { k: 'actualResult',     label: 'Actual Result',      ph: 'Describe what actually happened instead...' },
          ].map(({ k, label, ph }) => (
            <Grid item xs={12} key={k}>
              <TextField fullWidth multiline rows={2} size="small" label={label}
                value={form[k as keyof typeof form]} onChange={sf(k as keyof typeof form)}
                placeholder={ph} />
            </Grid>
          ))}

        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E5E7EB', gap: 1.5 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained"
          disabled={loading || !!projectEndedError}
          sx={{ minWidth: 140 }}>
          {loading ? <CircularProgress size={18} color="inherit" /> : '+ Create Issue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewIssueModal;
