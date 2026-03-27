import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Button, TextField,
  CircularProgress, Alert, Chip, Divider, FormControl,
  InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import ArrowBackIcon      from '@mui/icons-material/ArrowBack';
import EditIcon           from '@mui/icons-material/Edit';
import SaveIcon           from '@mui/icons-material/Save';
import CancelIcon         from '@mui/icons-material/Cancel';
import AttachFileIcon     from '@mui/icons-material/AttachFile';
import InfoOutlinedIcon   from '@mui/icons-material/InfoOutlined';
import LockIcon           from '@mui/icons-material/Lock';
import ReplayIcon         from '@mui/icons-material/Replay';
import { issuesApi, employeesApi } from '@services/api';
import { useAuth } from '@store/useAuth';
import type { Issue, Employee } from '@app-types/index';

// ── Status transition map (mirrors backend) ───────────────────────
const ALLOWED: Record<string, string[]> = {
  Open:       ['InProgress', 'Closed'],
  InProgress: ['InReview', 'Open', 'Closed'],
  InReview:   ['Resolved', 'InProgress', 'Reopened'],
  Resolved:   ['Closed', 'Reopened'],
  Closed:     ['Reopened'],
  Reopened:   ['InProgress', 'Open'],
};

const STATUS_LABELS: Record<string, string> = {
  Open: '🔵 Open', InProgress: '🟡 In Progress', InReview: '🟣 In Review',
  Resolved: '🟢 Resolved', Closed: '⚫ Closed', Reopened: '🔴 Reopened',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Open:       { bg: '#EBE8FC', color: '#4F38F6' },
  InProgress: { bg: '#fff7ed', color: '#F97316' },
  InReview:   { bg: '#F3E8FF', color: '#7C3AED' },
  Resolved:   { bg: '#f0fdf4', color: '#16A34A' },
  Closed:     { bg: '#F3F4F6', color: '#374151' },
  Reopened:   { bg: '#fef2f2', color: '#DC2626' },
};

// ── Priority / severity colors ────────────────────────────────────
const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  Critical: { bg: '#fef2f2', color: '#DC2626' },
  High:     { bg: '#fff7ed', color: '#EA580C' },
  Medium:   { bg: '#fffbeb', color: '#D97706' },
  Low:      { bg: '#f0fdf4', color: '#16A34A' },
};

const SEV_COLORS: Record<string, { bg: string; color: string }> = {
  Critical: { bg: '#fef2f2', color: '#DC2626' },
  Blocker:  { bg: '#fff0f0', color: '#B91C1C' },
  Major:    { bg: '#fff7ed', color: '#EA580C' },
  Minor:    { bg: '#f0fdf4', color: '#16A34A' },
};

const fmtDate = (d?: string | Date | null) =>
  d ? new Date(String(d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const fmtDateOnly = (d?: string | Date | null) =>
  d ? new Date(String(d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Section header — clearly styled as category, not a field ─────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25, pb: 0.75, borderBottom: '2px solid #EBE8FC' }}>
      <Box sx={{ width: 3, height: 14, borderRadius: 99, bgcolor: '#4F38F6', flexShrink: 0 }} />
      <Typography sx={{
        fontSize: 11, fontWeight: 800, color: '#4F38F6',
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
);

// ── Inline field display ──────────────────────────────────────────
const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 1.1, borderBottom: '1px solid #F9FAFB' }}>
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, mr: 2 }}>{label}</Typography>
    <Box sx={{ fontSize: 12.5, color: '#07003C', fontWeight: 500, textAlign: 'right' }}>{value}</Box>
  </Box>
);

// ─────────────────────────────────────────────────────────────────
const IssueDetailPage: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [issue, setIssue]       = useState<Issue | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Comment form
  const [comment, setComment]         = useState('');
  const [statusChange, setStatusChange] = useState('');
  const [resolution, setResolution]   = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [posting, setPosting]         = useState(false);
  const [postError, setPostError]     = useState('');

  // Reopen dialog
  const [reopenOpen, setReopenOpen]   = useState(false);

  // Edit mode
  const [editing, setEditing]         = useState(false);
  const [editForm, setEditForm]       = useState<Partial<Issue>>({});
  const [editSaving, setEditSaving]   = useState(false);
  const [editError, setEditError]     = useState('');

  // Image attachment

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await issuesApi.getOne(Number(id));
      setIssue(res.data.data);
    } catch { setError('Failed to load issue'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    employeesApi.getAll({ limit: 500 }).then((r) => setEmployees(r.data.data.items));
  }, [id]);

  // ── Post comment (with optional status change) ─────────────────
  const handlePostComment = async () => {
    if (!comment.trim() && !statusChange) { setPostError('Enter a comment or select a status change'); return; }
    if (statusChange === 'Resolved' && !resolution.trim()) { setPostError('Resolution note is required when resolving'); return; }
    if (statusChange === 'Reopened' && !reopenReason.trim()) { setPostError('Reopen reason is required'); return; }
    if (!id) return;

    setPosting(true); setPostError('');
    try {
      await issuesApi.addComment(Number(id), {
        body:         comment.trim(),
        statusChange: statusChange as never || undefined,
        resolution:   resolution.trim()   || undefined,
        reopenReason: reopenReason.trim() || undefined,
      });
      setComment(''); setStatusChange(''); setResolution(''); setReopenReason('');
      setReopenOpen(false);
      await load();
    } catch (err: unknown) {
      setPostError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to post comment',
      );
    } finally { setPosting(false); }
  };

  // ── Save field edits ───────────────────────────────────────────
  const handleEditSave = async () => {
    if (!id) return;
    setEditSaving(true); setEditError('');
    try {
      await issuesApi.update(Number(id), editForm as never);
      setEditing(false);
      await load();
    } catch (err: unknown) {
      setEditError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to save changes',
      );
    } finally { setEditSaving(false); }
  };

  const startEdit = () => {
    if (!issue) return;
    setEditForm({
      title:            issue.title,
      description:      issue.description,
      priority:         issue.priority,
      severity:         issue.severity,
      type:             issue.type,
      environment:      issue.environment,
      module:           issue.module,
      assigneeId:       issue.assigneeId,
      contactPersonId:  issue.contactPersonId,
      dueDate:          issue.dueDate ? String(issue.dueDate).slice(0, 10) : '',
      stepsToReproduce: issue.stepsToReproduce,
      expectedResult:   issue.expectedResult,
      actualResult:     issue.actualResult,
    });
    setEditing(true);
    setEditError('');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!issue)  return <Typography sx={{ py: 4, textAlign: 'center', color: '#6B6B8A' }}>{error || 'Issue not found'}</Typography>;

  const sc = STATUS_COLORS[issue.status] ?? STATUS_COLORS.Open;
  const allowedNext = ALLOWED[issue.status] ?? [];
  const isClosed = issue.status === 'Closed';
  const isResolved = issue.status === 'Resolved';

  return (
    <Box>
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: '#6B6B8A', '&:hover': { color: '#4F38F6' } }}>Back</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!editing && !isClosed && (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={startEdit} sx={{ fontSize: 13 }}>Edit Issue</Button>
          )}
          {editing && (
            <>
              <Button variant="outlined" color="inherit" startIcon={<CancelIcon />} onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="contained" startIcon={editSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />} onClick={handleEditSave} disabled={editSaving}>Save Changes</Button>
            </>
          )}
        </Box>
      </Box>

      {editError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{editError}</Alert>}
      {error     && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* ── Left: issue body ──────────────────────────────────── */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3.5, borderRadius: 3, mb: 2.5 }}>

            {/* Header chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip label={issue.defectNo} sx={{ bgcolor: '#EBE8FC', color: '#4F38F6', fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }} />
              <Chip label={issue.status} sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: 11 }} />
              {issue.isOverdue && <Chip label="⚠ OVERDUE" sx={{ bgcolor: '#fef2f2', color: '#DC2626', fontWeight: 700, fontSize: 11 }} />}
              {issue.reopenCount > 0 && <Chip label={`Reopened ×${issue.reopenCount}`} sx={{ bgcolor: '#fff7ed', color: '#F97316', fontWeight: 600, fontSize: 11 }} />}
              {isClosed && <Chip label="🔒 Closed" icon={<LockIcon sx={{ fontSize: 13, color: '#374151 !important' }} />} sx={{ bgcolor: '#F3F4F6', color: '#374151', fontWeight: 600, fontSize: 11 }} />}
            </Box>

            {/* Title */}
            {editing ? (
              <TextField fullWidth size="small" label="Title *" value={editForm.title ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} sx={{ mb: 2 }} />
            ) : (
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#07003C', mb: 2, lineHeight: 1.4 }}>{issue.title}</Typography>
            )}

            {/* Priority / Severity / Type chips */}
            {!editing && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                <Chip label={`Priority: ${issue.priority}`} size="small" sx={{ ...PRIORITY_COLORS[issue.priority], fontWeight: 600, fontSize: 11 }} />
                <Chip label={`Severity: ${issue.severity}`} size="small" sx={{ ...SEV_COLORS[issue.severity], fontWeight: 600, fontSize: 11 }} />
                <Chip label={issue.type.replace('FeatureRequest', 'Feature Request')} size="small" sx={{ bgcolor: '#EBE8FC', color: '#4F38F6', fontWeight: 600, fontSize: 11 }} />
                {issue.environment && <Chip label={issue.environment} size="small" sx={{ bgcolor: '#F3F4F6', color: '#374151', fontWeight: 600, fontSize: 11 }} />}
                {issue.module && <Chip label={`Module: ${issue.module}`} size="small" sx={{ bgcolor: '#F3F4F6', color: '#374151', fontWeight: 500, fontSize: 11 }} />}
              </Box>
            )}

            {/* Description */}
            <Section title="Description">
              {editing ? (
                <TextField fullWidth multiline rows={3} size="small" value={editForm.description ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
              ) : (
                <Typography sx={{ fontSize: 13.5, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{issue.description}</Typography>
              )}
            </Section>

            {/* Steps / Expected / Actual */}
            {editing ? (
              <>
                {[
                  { k: 'stepsToReproduce', label: 'Steps to Reproduce', ph: '1. Open app\n2. Click...' },
                  { k: 'expectedResult', label: 'Expected Result', ph: 'What should happen...' },
                  { k: 'actualResult', label: 'Actual Result', ph: 'What actually happened...' },
                ].map(({ k, label, ph }) => (
                  <Box key={k} sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6B6B8A', mb: 0.75 }}>{label}</Typography>
                    <TextField fullWidth multiline rows={2} size="small" placeholder={ph}
                      value={(editForm as Record<string, unknown>)[k] as string ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, [k]: e.target.value }))} />
                  </Box>
                ))}
              </>
            ) : (
              <>
                {issue.stepsToReproduce && <Section title="Steps to Reproduce"><Typography sx={{ fontSize: 13.5, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{issue.stepsToReproduce}</Typography></Section>}
                {issue.expectedResult   && <Section title="Expected Result"><Typography sx={{ fontSize: 13.5, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{issue.expectedResult}</Typography></Section>}
                {issue.actualResult     && <Section title="Actual Result"><Typography sx={{ fontSize: 13.5, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{issue.actualResult}</Typography></Section>}
              </>
            )}

            {/* Resolution (if resolved/closed) */}
            {(isResolved || isClosed) && issue.resolution && (
              <Box sx={{ bgcolor: '#f0fdf4', border: '1px solid #BBF7D0', borderRadius: 2, p: 2, mb: 2 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#15803D', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>✅ Resolution</Typography>
                <Typography sx={{ fontSize: 13.5, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{issue.resolution}</Typography>
              </Box>
            )}

            {/* Attachment placeholder */}
            {!editing && (
              <Box sx={{ mt: 1, pt: 2, borderTop: '1px solid #F3F4F6' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachFileIcon sx={{ fontSize: 16, color: '#6B6B8A' }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6B6B8A' }}>Attachments</Typography>
                </Box>
                {issue.fileUrl ? (
                  <a href={issue.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#4F38F6' }}>
                    📎 {issue.fileName ?? 'View Attachment'}
                  </a>
                ) : (
                  <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>No attachments</Typography>
                )}
              </Box>
            )}
          </Paper>

          {/* ── Activity & Comments ────────────────────────────── */}
          <Paper sx={{ p: 3.5, borderRadius: 3 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#07003C', mb: 2.5 }}>
              Activity & Comments ({issue.comments?.length ?? 0})
            </Typography>

            {/* Comment list */}
            {issue.comments?.length === 0 && (
              <Typography sx={{ fontSize: 13, color: '#9CA3AF', mb: 2.5, fontStyle: 'italic' }}>No comments yet. Add the first one below.</Typography>
            )}
            {issue.comments?.map((c) => {
              const isSystem = (c as { isSystem?: boolean }).isSystem;
              return (
                <Box key={c.id} sx={{
                  mb: 2, pb: 2, borderBottom: '1px solid #F3F4F6',
                  ...(isSystem ? { bgcolor: '#F9FAFB', borderRadius: 2, p: 1.5, border: '1px solid #E5E7EB' } : {}),
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                    {isSystem ? (
                      <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <InfoOutlinedIcon sx={{ fontSize: 14, color: '#6B6B8A' }} />
                      </Box>
                    ) : (
                      <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#4F38F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {c.authorName?.charAt(0).toUpperCase()}
                      </Box>
                    )}
                    <Box>
                      <Typography sx={{ fontSize: isSystem ? 11 : 13, fontWeight: 600, color: isSystem ? '#6B6B8A' : '#07003C' }}>
                        {isSystem ? 'System' : c.authorName}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>{fmtDate(c.createdAt)}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{
                    fontSize: isSystem ? 12 : 13.5, color: isSystem ? '#6B6B8A' : '#374151',
                    ml: isSystem ? 0 : 4.75, lineHeight: 1.7, whiteSpace: 'pre-wrap',
                    fontStyle: isSystem ? 'italic' : 'normal',
                  }}>
                    {/* Strip the 🔄 ** wrapper for display */}
                    {isSystem ? c.body.replace(/^🔄 \*\*/, '').replace(/\*\*$/, '') : c.body}
                  </Typography>
                </Box>
              );
            })}

            <Divider sx={{ mb: 2.5 }} />

            {/* ── Comment / Action form ──────────────────────── */}
            {isClosed ? (
              <Box sx={{ bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LockIcon sx={{ color: '#6B6B8A', fontSize: 18 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>This issue is closed</Typography>
                  <Typography sx={{ fontSize: 12, color: '#6B6B8A' }}>To add a comment or make changes, you need to reopen this issue first.</Typography>
                </Box>
                <Button variant="outlined" size="small" color="error" startIcon={<ReplayIcon />}
                  onClick={() => setReopenOpen(true)}>
                  Reopen Issue
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#07003C', mb: 1.5 }}>
                  Add Comment {allowedNext.length > 0 && '/ Change Status'}
                </Typography>

                {postError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{postError}</Alert>}

                {/* Status change selector */}
                {allowedNext.length > 0 && (
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Change Status (optional)</InputLabel>
                    <Select value={statusChange} onChange={(e) => { setStatusChange(e.target.value); setResolution(''); setReopenReason(''); }} label="Change Status (optional)">
                      <MenuItem value=""><em>— No status change —</em></MenuItem>
                      {allowedNext.map((s) => (
                        <MenuItem key={s} value={s}>{STATUS_LABELS[s] ?? s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Resolution note — required when resolving */}
                {statusChange === 'Resolved' && (
                  <TextField fullWidth multiline rows={2} size="small"
                    label="Resolution Note *"
                    placeholder="Describe how this issue was resolved…"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    error={!resolution.trim()}
                    helperText="Required — explain how the issue was fixed or resolved"
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Reopen reason — required when reopening */}
                {statusChange === 'Reopened' && (
                  <TextField fullWidth multiline rows={2} size="small"
                    label="Reopen Reason *"
                    placeholder="Why is this issue being reopened? What was not addressed?…"
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    error={!reopenReason.trim()}
                    helperText="Required — explain why the issue is being reopened"
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Comment body */}
                <TextField
                  fullWidth multiline rows={3} size="small"
                  placeholder={
                    statusChange === 'Resolved' ? 'Add any additional notes…'
                    : statusChange === 'Reopened' ? 'Additional comments (optional)…'
                    : statusChange ? 'Add a comment about this status change…'
                    : 'Add a comment…'
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ mb: 1.5 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
                    Commenting as <strong>{user?.name}</strong>
                  </Typography>
                  <Button
                    variant="contained" onClick={handlePostComment} disabled={posting || (!comment.trim() && !statusChange)}
                    sx={{
                      ...(statusChange === 'Resolved' ? { bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } } : {}),
                      ...(statusChange === 'Closed'   ? { bgcolor: '#374151', '&:hover': { bgcolor: '#1F2937' } } : {}),
                      ...(statusChange === 'Reopened' ? { bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } } : {}),
                    }}
                  >
                    {posting ? <CircularProgress size={18} color="inherit" /> : (
                      statusChange === 'Resolved' ? '✅ Resolve Issue'
                      : statusChange === 'Closed' ? '🔒 Close Issue'
                      : statusChange === 'Reopened' ? '🔄 Reopen Issue'
                      : statusChange ? `Move to ${statusChange}`
                      : 'Post Comment'
                    )}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* ── Right sidebar ────────────────────────────────────── */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#07003C', mb: 1.5 }}>Issue Details</Typography>

            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select value={editForm.priority ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value as never }))} label="Priority">
                    {['Critical', 'High', 'Medium', 'Low'].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Severity</InputLabel>
                  <Select value={editForm.severity ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, severity: e.target.value as never }))} label="Severity">
                    {['Critical', 'Blocker', 'Major', 'Minor'].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select value={editForm.type ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value as never }))} label="Type">
                    {['Bug', 'Task', 'FeatureRequest', 'Improvement'].map((v) => <MenuItem key={v} value={v}>{v.replace('FeatureRequest', 'Feature Request')}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Environment</InputLabel>
                  <Select value={editForm.environment ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, environment: e.target.value as never }))} label="Environment">
                    <MenuItem value=""><em>— None —</em></MenuItem>
                    {['Dev', 'QA', 'UAT', 'Production'].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Assignee</InputLabel>
                  <Select value={editForm.assigneeId ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, assigneeId: e.target.value }))} label="Assignee">
                    <MenuItem value=""><em>— Unassigned —</em></MenuItem>
                    {employees.filter((e) => e.active).map((e) => <MenuItem key={e.id} value={e.id}>{e.employeeNumber} — {e.employeeName}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Contact Person</InputLabel>
                  <Select value={editForm.contactPersonId ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, contactPersonId: e.target.value }))} label="Contact Person">
                    <MenuItem value=""><em>— None —</em></MenuItem>
                    {employees.filter((e) => e.active).map((e) => <MenuItem key={e.id} value={e.id}>{e.employeeNumber} — {e.employeeName}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField fullWidth size="small" label="Module" value={editForm.module ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, module: e.target.value }))} />
                <TextField fullWidth size="small" type="date" label="Due Date" value={editForm.dueDate ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))} InputLabelProps={{ shrink: true }} />
              </Box>
            ) : (
              <>
                <Field label="Project"        value={issue.projectName} />
                <Field label="Raised By"      value={issue.reporterName} />
                <Field label="Assignee"       value={issue.assigneeName ?? 'Unassigned'} />
                <Field label="Contact Person" value={
                  issue.contactPersonName && issue.contactPersonName !== '—'
                    ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4F38F6' }} />
                        <Typography component="span" sx={{ fontSize: 12.5, color: '#07003C', fontWeight: 600 }}>{issue.contactPersonName}</Typography>
                      </Box>
                    : <Typography component="span" sx={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>Not set</Typography>
                } />
                <Field label="Environment" value={issue.environment ?? '—'} />
                <Field label="Module"     value={issue.module ?? '—'} />
                <Field label="Due Date"   value={
                  issue.dueDate ? (
                    <Typography component="span" sx={{ fontSize: 12.5, color: issue.isOverdue ? '#DC2626' : '#07003C', fontWeight: issue.isOverdue ? 700 : 500 }}>
                      {fmtDateOnly(issue.dueDate)}{issue.isOverdue ? ' ⚠' : ''}
                    </Typography>
                  ) : '—'
                } />
                <Field label="Reopen Count" value={
                  issue.reopenCount > 0
                    ? <Chip label={`${issue.reopenCount}×`} size="small" sx={{ bgcolor: '#fff7ed', color: '#F97316', fontWeight: 700, fontSize: 11, height: 20 }} />
                    : '0'
                } />
              </>
            )}
          </Paper>

          {/* Timestamps */}
          <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6B6B8A', mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Timeline</Typography>
            <Field label="Created"  value={fmtDate(issue.createdAt)} />
            <Field label="Updated"  value={fmtDate(issue.updatedAt)} />
            {issue.resolvedAt && <Field label="Resolved" value={fmtDate(issue.resolvedAt)} />}
            {issue.closedAt   && <Field label="Closed"   value={fmtDate(issue.closedAt)} />}
          </Paper>

          {/* Status workflow guide */}
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6B6B8A', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Workflow Guide</Typography>
            {[
              { s: 'Open',       desc: 'Newly raised, not yet actioned' },
              { s: 'InProgress', desc: 'Being worked on by assignee' },
              { s: 'InReview',   desc: 'Fix done, under QA/peer review' },
              { s: 'Resolved',   desc: 'Fix verified, resolution added' },
              { s: 'Closed',     desc: 'Accepted and permanently closed' },
              { s: 'Reopened',   desc: 'Previously closed, re-activated' },
            ].map(({ s, desc }) => {
              const c = STATUS_COLORS[s];
              return (
                <Box key={s} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1 }}>
                  <Chip label={s} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, fontSize: 10, height: 18, borderRadius: '99px', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 11, color: '#6B6B8A', lineHeight: 1.4, mt: 0.1 }}>{desc}</Typography>
                </Box>
              );
            })}
          </Paper>
        </Grid>
      </Grid>

      {/* ── Reopen dialog ──────────────────────────────────────── */}
      <Dialog open={reopenOpen} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReplayIcon sx={{ color: '#DC2626' }} /> Reopen Issue
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {postError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{postError}</Alert>}
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>
            This issue is currently <strong>Closed</strong>. Reopening it will mark it as <strong>Reopened</strong> and require a reason.
          </Alert>
          <TextField fullWidth multiline rows={3} size="small"
            label="Reason for Reopening *"
            placeholder="Why is this issue being reopened? What was not addressed?…"
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            error={!!postError && !reopenReason.trim()}
          />
          <TextField fullWidth multiline rows={2} size="small"
            label="Additional Comments (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setReopenOpen(false); setReopenReason(''); setPostError(''); }} variant="outlined" color="inherit">Cancel</Button>
          <Button onClick={() => { setStatusChange('Reopened'); handlePostComment(); }} variant="contained" color="error" disabled={posting || !reopenReason.trim()}>
            {posting ? <CircularProgress size={18} color="inherit" /> : 'Reopen Issue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssueDetailPage;
