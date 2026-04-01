import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl,
  Grid, Typography, Alert, CircularProgress,
  Box, IconButton,
} from '@mui/material';
import CloseIcon         from '@mui/icons-material/Close';
import AttachFileIcon    from '@mui/icons-material/AttachFile';
import DeleteIcon        from '@mui/icons-material/Delete';
import FolderOpenIcon    from '@mui/icons-material/FolderOpen';
import BugReportIcon     from '@mui/icons-material/BugReport';
import PriorityHighIcon  from '@mui/icons-material/PriorityHigh';
import PeopleAltIcon     from '@mui/icons-material/PeopleAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PsychologyIcon    from '@mui/icons-material/Psychology';
import LockOutlinedIcon  from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SectionDivider    from '@components/common/SectionDivider';
import { issuesApi, projectsApi, employeesApi } from '@services/api';
import { useAuth } from '@store/useAuth';
import type { Project, Employee } from '@app-types/index';

interface Props { open: boolean; onClose: () => void; onCreated?: () => void; }

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const SEVERITIES = ['Critical', 'Blocker', 'Major', 'Minor'];
const TYPES      = ['Bug', 'Task', 'FeatureRequest', 'Improvement'];
const TYPE_LABELS: Record<string, string> = {
  Bug: '🐛 Bug', Task: '✅ Task',
  FeatureRequest: '⭐ Feature Request', Improvement: '🔧 Improvement',
};
const ENVS = ['Dev', 'QA', 'UAT', 'Production'];
const MAX_FILE_BYTES = 2 * 1024 * 1024;

// ── Field label — bold above field, red asterisk, inline hint ──────
const FL: React.FC<{ label: string; required?: boolean; hint?: string }> = ({ label, required, hint }) => (
  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.75 }}>
    <Typography component="span" sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
      {label}
    </Typography>
    {required && (
      <Typography component="span" sx={{ fontSize: 13, color: '#DC2626', lineHeight: 1 }}>*</Typography>
    )}
    {hint && (
      <Typography component="span" sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF', ml: 0.5 }}>
        — {hint}
      </Typography>
    )}
  </Box>
);

// ── Read-only field — dashed box, lock icon ─────────────────────────
const ReadOnlyField: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
      <LockOutlinedIcon sx={{ fontSize: 11, color: '#9CA3AF' }} />
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
    </Box>
    <Box sx={{
      display: 'flex', alignItems: 'center', minHeight: 40,
      px: 1.5, py: 1,
      bgcolor: '#F9FAFB',
      border: '1.5px dashed #D1D5DB',
      borderRadius: '8px',
    }}>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{value}</Typography>
    </Box>
    {hint && (
      <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF', mt: 0.5 }}>
        {hint}
      </Typography>
    )}
  </Box>
);

// ── Success dialog shown after issue creation ────────────────────────
interface SuccessDialogProps {
  open: boolean;
  defectNo: string;
  onClose: () => void;
}
const SuccessDialog: React.FC<SuccessDialogProps> = ({ open, defectNo, onClose }) => (
  <Dialog open={open} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogContent sx={{ textAlign: 'center', py: 4, px: 4 }}>
      <Box sx={{
        width: 64, height: 64, borderRadius: '50%',
        bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center',
        justifyContent: 'center', mx: 'auto', mb: 2.5,
      }}>
        <CheckCircleOutlineIcon sx={{ color: '#16A34A', fontSize: 36 }} />
      </Box>
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#07003C', mb: 1 }}>
        Issue Created Successfully!
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 2 }}>
        Your issue has been logged and is now tracked.
      </Typography>
      <Box sx={{
        display: 'inline-block',
        px: 2.5, py: 1,
        bgcolor: '#EBE8FC',
        borderRadius: 2,
        mb: 3,
      }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6B7280', mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Defect Number
        </Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#4F38F6', fontFamily: 'monospace' }}>
          {defectNo}
        </Typography>
      </Box>
      <Button
        fullWidth
        variant="contained"
        onClick={onClose}
        sx={{
          py: 1.25, fontWeight: 600, borderRadius: 2,
          background: 'linear-gradient(135deg,#4F38F6,#3B24E0)',
          '&:hover': { background: 'linear-gradient(135deg,#3B24E0,#2E1BB8)' },
        }}
      >
        OK — View All Issues
      </Button>
    </DialogContent>
  </Dialog>
);

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

  // Success dialog state
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdDefectNo, setCreatedDefectNo] = useState('');

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
        `"${proj.name}" ended on ${new Date(proj.endDate).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        })}. Ask a Manager to extend it.`,
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
    // ── Validation — all mandatory fields ──────────────────────────
    if (!form.projectId)          { setError('Project is required'); return; }
    if (!form.title.trim())       { setError('Title / Summary is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!form.priority)           { setError('Priority is required'); return; }
    if (!form.assigneeId)         { setError('Assignee is required — please select who will work on this issue'); return; }
    if (!form.contactPersonId)    { setError('Contact Person is required — please select whom to contact for more details'); return; }
    if (projectEndedError)        return;

    setLoading(true); setError('');
    try {
      const res = await issuesApi.create({
        title:            form.title.trim(),
        description:      form.description.trim(),
        type:             form.type as never,
        priority:         form.priority as never,
        severity:         form.severity as never,
        projectId:        Number(form.projectId),
        assigneeId:       form.assigneeId,
        contactPersonId:  form.contactPersonId,
        environment:      form.environment as never || undefined,
        dueDate:          form.dueDate || undefined,
        module:           form.module || undefined,
        stepsToReproduce: form.stepsToReproduce || undefined,
        expectedResult:   form.expectedResult || undefined,
        actualResult:     form.actualResult || undefined,
        fileName:         attachment?.name || undefined,
        fileUrl:          attachment?.dataUrl || undefined,
      });

      const defectNo = res.data.data?.defectNo ?? '';
      setCreatedDefectNo(defectNo);
      setSuccessOpen(true);

      // Reset form
      setForm({
        title: '', description: '', type: 'Bug', priority: '', severity: 'Major',
        projectId: '', assigneeId: '', contactPersonId: '', environment: '',
        dueDate: '', module: '', stepsToReproduce: '', expectedResult: '', actualResult: '',
      });
      setAttachment(null);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to create issue',
      );
    } finally { setLoading(false); }
  };

  // Called when user clicks OK on success dialog
  const handleSuccessClose = () => {
    setSuccessOpen(false);
    onClose();        // close the modal
    onCreated?.();    // trigger list refresh in parent
  };

  const activeEmps = employees
    .filter((e) => e.active)
    .sort((a, b) => a.employeeName.localeCompare(b.employeeName));

  const selSx = { height: 40 };

  return (
    <>
      <Dialog
        open={open}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#F9FAFB' } }}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #E5E7EB', bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#EBE8FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BugReportIcon sx={{ color: '#4F38F6', fontSize: 19 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#07003C', lineHeight: 1.2 }}>New Issue</Typography>
                <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF' }}>Fields marked * are required</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ px: 1.5, py: 0.4, bgcolor: '#FEF3C7', borderRadius: 99, border: '1px solid #FDE68A' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#92400E' }}>⚠ Click outside does not close</Typography>
              </Box>
              <IconButton size="small" onClick={onClose} sx={{ bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#fef2f2', color: '#DC2626' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, pb: 2 }}>
          {error             && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {projectEndedError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}><strong>Project Ended — </strong>{projectEndedError}</Alert>}

          <Box sx={{ bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: 2, p: 3 }}>
            <Grid container spacing={2.5}>

              {/* ── 1. Project & Classification ───────────────── */}
              <Grid item xs={12}>
                <SectionDivider title="Project & Classification" subtitle="Which project does this issue belong to?" icon={<FolderOpenIcon sx={{ fontSize: 14 }} />} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FL label="Project" required />
                <FormControl fullWidth>
                  <Select value={form.projectId} onChange={(e) => handleProjectChange(e.target.value as string)} displayEmpty sx={selSx}>
                    <MenuItem value="" disabled><em style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: 13 }}>Select project...</em></MenuItem>
                    {projects.map((p) => <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FL label="Issue Type" />
                <FormControl fullWidth>
                  <Select value={form.type} onChange={sf('type')} sx={selSx}>
                    {TYPES.map((t) => <MenuItem key={t} value={t}>{TYPE_LABELS[t]}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* ── 2. Issue Details ──────────────────────────── */}
              <Grid item xs={12}>
                <SectionDivider title="Issue Details" subtitle="Describe the issue clearly and concisely" icon={<BugReportIcon sx={{ fontSize: 14 }} />} />
              </Grid>
              <Grid item xs={12}>
                <FL label="Title / Summary" required />
                <TextField fullWidth size="small" value={form.title} onChange={sf('title')}
                  placeholder="e.g. Login button unresponsive on mobile Safari"
                  sx={{ '& .MuiInputLabel-root': { display: 'none' } }} />
              </Grid>
              <Grid item xs={12}>
                <FL label="Description" required />
                <TextField fullWidth multiline rows={3} size="small" value={form.description} onChange={sf('description')}
                  placeholder="Provide a detailed explanation — what happened, when, and under what conditions..."
                  sx={{ '& .MuiInputLabel-root': { display: 'none' } }} />
              </Grid>

              {/* ── 3. Priority & Severity ────────────────────── */}
              <Grid item xs={12}>
                <SectionDivider title="Priority & Severity" subtitle="How urgent and impactful is this issue?" icon={<PriorityHighIcon sx={{ fontSize: 14 }} />} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FL label="Priority" required />
                <FormControl fullWidth>
                  <Select value={form.priority} onChange={sf('priority')} displayEmpty sx={selSx}>
                    <MenuItem value="" disabled><em style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: 13 }}>Select priority...</em></MenuItem>
                    {PRIORITIES.map((p) => (
                      <MenuItem key={p} value={p}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            bgcolor: { Critical: '#DC2626', High: '#EA580C', Medium: '#D97706', Low: '#16A34A' }[p] }} />
                          {p}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FL label="Severity" />
                <FormControl fullWidth>
                  <Select value={form.severity} onChange={sf('severity')} sx={selSx}>
                    {SEVERITIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* ── 4. People ─────────────────────────────────── */}
              <Grid item xs={12}>
                <SectionDivider title="People" subtitle="Who is involved with this issue?" icon={<PeopleAltIcon sx={{ fontSize: 14 }} />} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <ReadOnlyField label="Raised By (Reporter)" value={user?.name ?? '—'} hint="Auto-set to logged-in user" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FL label="Assignee" required />
                <FormControl fullWidth>
                  <Select value={form.assigneeId} onChange={sf('assigneeId')} displayEmpty sx={selSx}>
                    <MenuItem value="" disabled><em style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: 13 }}>Select assignee...</em></MenuItem>
                    {activeEmps.map((e) => <MenuItem key={e.id} value={e.id}>{e.employeeNumber} — {e.employeeName}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FL label="Contact Person" required hint="Whom to contact for more details" />
                <FormControl fullWidth>
                  <Select value={form.contactPersonId} onChange={sf('contactPersonId')} displayEmpty sx={selSx}>
                    <MenuItem value="" disabled><em style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: 13 }}>Select contact person...</em></MenuItem>
                    {activeEmps.map((e) => <MenuItem key={e.id} value={e.id}>{e.employeeNumber} — {e.employeeName}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* ── 5. Scheduling & Environment ───────────────── */}
              <Grid item xs={12}>
                <SectionDivider title="Scheduling & Environment" subtitle="When is it due and where does it occur?" icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FL label="Due Date" />
                <TextField fullWidth size="small" type="date" value={form.dueDate} onChange={sf('dueDate')}
                  InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputLabel-root': { display: 'none' } }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FL label="Environment" />
                <FormControl fullWidth>
                  <Select value={form.environment} onChange={sf('environment')} displayEmpty sx={selSx}>
                    <MenuItem value=""><em style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: 13 }}>— Select environment —</em></MenuItem>
                    {ENVS.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FL label="Module / Component" />
                <TextField fullWidth size="small" value={form.module} onChange={sf('module')}
                  placeholder="e.g. Login, Reports, Dashboard..."
                  sx={{ '& .MuiInputLabel-root': { display: 'none' } }} />
              </Grid>

              {/* ── 6. Attachment ─────────────────────────────── */}
              <Grid item xs={12}>
                <SectionDivider title="Attachment" subtitle="Optional — screenshots, logs or supporting files (max 2 MB)" icon={<AttachFileIcon sx={{ fontSize: 14 }} />} />
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
                      <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF' }}>
                        {(attachment.dataUrl.length * 0.75 / 1024).toFixed(0)} KB
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setAttachment(null)} sx={{ color: '#DC2626', '&:hover': { bgcolor: '#fef2f2' } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button variant="outlined" size="small" startIcon={<AttachFileIcon />}
                      onClick={() => fileRef.current?.click()}
                      sx={{ fontSize: 12, borderStyle: 'dashed', color: '#6B7280', borderColor: '#D1D5DB', '&:hover': { borderColor: '#4F38F6', color: '#4F38F6' } }}>
                      Choose File
                    </Button>
                    {fileError
                      ? <Typography sx={{ fontSize: 12, color: '#DC2626' }}>{fileError}</Typography>
                      : <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF' }}>Images, PDF, Word, Excel, TXT — max 2 MB</Typography>
                    }
                  </Box>
                )}
              </Grid>

              {/* ── 7. QA Details ─────────────────────────────── */}
              <Grid item xs={12}>
                <SectionDivider title="QA Details" subtitle="Optional — fill in for bug reports to speed up investigation" icon={<PsychologyIcon sx={{ fontSize: 14 }} />} />
              </Grid>
              {[
                { k: 'stepsToReproduce', label: 'Steps to Reproduce', ph: '1. Navigate to...\n2. Click...\n3. Observe that...' },
                { k: 'expectedResult',   label: 'Expected Result',    ph: 'Describe what should happen in normal conditions...' },
                { k: 'actualResult',     label: 'Actual Result',      ph: 'Describe what actually happened instead...' },
              ].map(({ k, label, ph }) => (
                <Grid item xs={12} key={k}>
                  <FL label={label} />
                  <TextField fullWidth multiline rows={2} size="small"
                    value={form[k as keyof typeof form]} onChange={sf(k as keyof typeof form)}
                    placeholder={ph} sx={{ '& .MuiInputLabel-root': { display: 'none' } }} />
                </Grid>
              ))}

            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E5E7EB', gap: 1.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading || !!projectEndedError} sx={{ minWidth: 140 }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : '+ Create Issue'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Success dialog — shows after issue is created ──────── */}
      <SuccessDialog
        open={successOpen}
        defectNo={createdDefectNo}
        onClose={handleSuccessClose}
      />
    </>
  );
};

export default NewIssueModal;
