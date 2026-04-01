import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Typography, CircularProgress, Grid, Chip, Alert,
  ToggleButton, ToggleButtonGroup, TableContainer, TextField,
  FormControl, InputLabel, Select, MenuItem, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
} from '@mui/material';
import AddIcon         from '@mui/icons-material/Add';
import LockResetIcon   from '@mui/icons-material/LockReset';
import EditIcon        from '@mui/icons-material/Edit';
import BlockIcon       from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { usersApi, employeesApi } from '@services/api';
import type { User, Employee } from '@app-types/index';
import PageHeader from '@components/common/PageHeader';

const ROLES = ['Admin', 'Manager', 'Developer', 'QA', 'Reporter'];

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  Admin:     { bg: '#fef2f2', color: '#DC2626' },
  Manager:   { bg: '#fff7ed', color: '#F97316' },
  Developer: { bg: '#EBE8FC', color: '#4F38F6' },
  QA:        { bg: '#f0fdf4', color: '#16A34A' },
  Reporter:  { bg: '#F3F4F6', color: '#6B6B8A' },
};

// ── Reusable confirm dialog ───────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'error' | 'warning' | 'success' | 'primary';
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, message, confirmLabel = 'Confirm',
  confirmColor = 'primary', icon, onConfirm, onCancel, loading,
}) => (
  <Dialog open={open} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogContent sx={{ pt: 3.5, pb: 2, textAlign: 'center' }}>
      {icon && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>{icon}</Box>
      )}
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#07003C', mb: 1 }}>{title}</Typography>
      <Typography sx={{ fontSize: 13, color: '#6B6B8A', lineHeight: 1.6 }}>{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, justifyContent: 'center' }}>
      <Button onClick={onCancel} variant="outlined" color="inherit" sx={{ minWidth: 100 }}>Cancel</Button>
      <Button onClick={onConfirm} variant="contained" color={confirmColor} disabled={loading} sx={{ minWidth: 100 }}>
        {loading ? <CircularProgress size={18} color="inherit" /> : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

// ── Info/success dialog ───────────────────────────────────────────
interface InfoDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  onClose: () => void;
}
const InfoDialog: React.FC<InfoDialogProps> = ({ open, title, message, onClose }) => (
  <Dialog open={open} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogContent sx={{ pt: 3.5, pb: 2, textAlign: 'center' }}>
      <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
        <CheckCircleOutlineIcon sx={{ color: '#16A34A', fontSize: 28 }} />
      </Box>
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#07003C', mb: 1 }}>{title}</Typography>
      <Typography sx={{ fontSize: 13, color: '#6B6B8A', lineHeight: 1.7 }}>{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'center' }}>
      <Button onClick={onClose} variant="contained" sx={{ minWidth: 120 }}>Done</Button>
    </DialogActions>
  </Dialog>
);

// ─────────────────────────────────────────────────────────────────
const UserManagementPage: React.FC = () => {
  const [users, setUsers]         = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<'manage' | 'add'>('manage');

  // Add user form
  const [form, setForm]     = useState({ name: '', email: '', role: '', department: '', employeeId: '' });
  const [saving, setSaving] = useState(false);
  const [addError, setAddError]   = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [tempPw, setTempPw] = useState('');

  // Change role modal
  const [editUser, setEditUser]     = useState<User | null>(null);
  const [editRole, setEditRole]     = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError]   = useState('');

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string; message: string; confirmLabel: string;
    confirmColor: 'error' | 'warning' | 'success' | 'primary';
    icon: React.ReactNode; onConfirm: () => Promise<void>;
  } | null>(null);

  // Info/result dialog state
  const [infoOpen, setInfoOpen]   = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoMessage, setInfoMessage] = useState<React.ReactNode>('');

  const showInfo = (title: string, message: React.ReactNode) => {
    setInfoTitle(title); setInfoMessage(message); setInfoOpen(true);
  };

  const showConfirm = (config: typeof confirmConfig) => {
    setConfirmConfig(config); setConfirmOpen(true);
  };

  const handleConfirmOk = async () => {
    if (!confirmConfig) return;
    setConfirmLoading(true);
    try { await confirmConfig.onConfirm(); }
    finally { setConfirmLoading(false); setConfirmOpen(false); }
  };

  const load = async () => {
    setLoading(true);
    try { const r = await usersApi.getAll(); setUsers(r.data.data); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    employeesApi.getAll({ limit: 500 }).then((r) => setEmployees(r.data.data.items));
  }, []);

  // ── Open change-role modal ────────────────────────────────────
  const openEdit = (u: User) => {
    setEditUser(u); setEditRole(u.role); setEditError('');
  };

  // ── Save role change ──────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editUser) return;
    setEditSaving(true); setEditError('');
    try {
      await usersApi.update(editUser.id, { role: editRole as User['role'] });
      setEditUser(null);
      await load();
      showInfo('Role Updated', `${editUser.name}'s role has been changed to ${editRole}.`);
    } catch (e: unknown) {
      setEditError(
        (e as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to update role',
      );
    } finally { setEditSaving(false); }
  };

  // ── Enable / Disable user ─────────────────────────────────────
  const handleToggleActive = (u: User) => {
    const enabling = !u.active;
    showConfirm({
      title:        enabling ? 'Enable User' : 'Disable User',
      message:      enabling
        ? `Re-enable access for "${u.name}"? They will be able to log in again.`
        : `Disable access for "${u.name}"? They will no longer be able to log in until re-enabled.`,
      confirmLabel: enabling ? 'Enable' : 'Disable',
      confirmColor: enabling ? 'success' : 'error',
      icon: enabling
        ? <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircleIcon sx={{ color: '#16A34A', fontSize: 28 }} /></Box>
        : <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BlockIcon sx={{ color: '#DC2626', fontSize: 28 }} /></Box>,
      onConfirm: async () => {
        await usersApi.update(u.id, { active: !u.active });
        await load();
      },
    });
  };

  // ── Reset password ────────────────────────────────────────────
  const handleReset = (u: User) => {
    showConfirm({
      title:        'Reset Password',
      message:      `Reset the password for "${u.name}"? A new temporary password will be generated and sent to their email address.`,
      confirmLabel: 'Reset Password',
      confirmColor: 'warning',
      icon: <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LockResetIcon sx={{ color: '#F59E0B', fontSize: 28 }} /></Box>,
      onConfirm: async () => {
        const r = await usersApi.resetPassword(u.id);
        const pw = r.data.data.tempPassword;
        showInfo(
          'Password Reset Successfully',
          <Box>
            <Typography sx={{ fontSize: 13, color: '#6B6B8A', mb: 1.5 }}>
              A new temporary password has been generated for <strong>{u.name}</strong> and sent to their email.
            </Typography>
            <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 2, px: 2, py: 1.5, display: 'inline-block' }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.25 }}>Temporary Password</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#07003C', letterSpacing: 1 }}>{pw}</Typography>
            </Box>
            <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF', mt: 1.5 }}>
              The user must change this password on their next login.
            </Typography>
          </Box>,
        );
      },
    });
  };

  // ── Create user ───────────────────────────────────────────────
  const handleEmpSelect = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    setForm((f) => ({
      ...f, employeeId: empId,
      name:       emp?.employeeName ?? f.name,
      email:      emp?.email        ?? f.email,
      department: emp?.designation  ?? f.department,
    }));
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.role) {
      setAddError('Name, email and role are required'); return;
    }
    setSaving(true); setAddError(''); setAddSuccess(''); setTempPw('');
    try {
      const r = await usersApi.create({
        name: form.name, email: form.email,
        role: form.role, department: form.department,
        employeeId: form.employeeId || undefined,
      });
      setTempPw(r.data.data.tempPassword);
      setAddSuccess('User created and welcome email sent.');
      setForm({ name: '', email: '', role: '', department: '', employeeId: '' });
      await load();
    } catch (e: unknown) {
      setAddError(
        (e as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to create user',
      );
    } finally { setSaving(false); }
  };

  return (
    <Box>
      <PageHeader
        breadcrumbs={['Administration', 'User Management']}
        title="User Management"
        subtitle="Add users, manage roles, enable / disable access and reset passwords"
      />

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => v && setTab(v)} size="small" sx={{ mb: 2 }}>
            <ToggleButton value="manage" sx={{ px: 3 }}>Manage Users</ToggleButton>
            <ToggleButton value="add"    sx={{ px: 3 }}>Add New User</ToggleButton>
          </ToggleButtonGroup>

          {/* ── MANAGE TABLE ────────────────────────────────── */}
          {tab === 'manage' && (
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {['Name / Email', 'Role', 'Department', 'Status', 'Actions'].map((h) => (
                        <TableCell key={h}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                    ) : users.map((u) => {
                      const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.Reporter;
                      return (
                        <TableRow key={u.id} sx={{ opacity: u.active ? 1 : 0.55, '&:hover td': { bgcolor: '#F9FAFB' } }}>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#07003C' }}>{u.name}</Typography>
                            <Typography sx={{ fontSize: 12, color: '#6B7280' }}>{u.email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={u.role} size="small" sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 600, fontSize: 11, height: 22, borderRadius: '99px' }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: 12, color: '#6B6B8A' }}>{u.department ?? '—'}</TableCell>
                          <TableCell>
                            <Chip label={u.active ? 'Active' : 'Disabled'} size="small"
                              sx={{ bgcolor: u.active ? '#f0fdf4' : '#fef2f2', color: u.active ? '#16A34A' : '#DC2626', fontWeight: 600, fontSize: 11, height: 22, borderRadius: '99px' }} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Change Role">
                                <IconButton size="small" onClick={() => openEdit(u)}
                                  sx={{ color: '#6B6B8A', '&:hover': { color: '#4F38F6', bgcolor: '#EBE8FC' } }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reset Password">
                                <IconButton size="small" onClick={() => handleReset(u)}
                                  sx={{ color: '#6B6B8A', '&:hover': { color: '#F59E0B', bgcolor: '#fffbeb' } }}>
                                  <LockResetIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={u.active ? 'Disable User' : 'Enable User'}>
                                <IconButton size="small" onClick={() => handleToggleActive(u)}
                                  sx={{ color: '#6B6B8A', '&:hover': u.active ? { color: '#DC2626', bgcolor: '#fef2f2' } : { color: '#16A34A', bgcolor: '#f0fdf4' } }}>
                                  {u.active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!loading && users.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: '#6B6B8A', fontSize: 13 }}>No users found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #F3F4F6', display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ROLE ACCESS:</Typography>
                {[
                  { role: 'Admin',     access: 'Full access including Administration' },
                  { role: 'Manager',   access: 'Full access including Administration' },
                  { role: 'Developer', access: 'Issues + Dashboard only' },
                  { role: 'QA',        access: 'Issues + Dashboard only' },
                  { role: 'Reporter',  access: 'Issues + Dashboard only' },
                ].map(({ role, access }) => {
                  const rc = ROLE_COLORS[role];
                  return (
                    <Tooltip key={role} title={access}>
                      <Chip label={role} size="small"
                        sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 600, fontSize: 10, height: 20, borderRadius: '99px', cursor: 'help' }} />
                    </Tooltip>
                  );
                })}
                <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF', ml: 0.5 }}>— hover a role to see access level</Typography>
              </Box>
            </Paper>
          )}

          {/* ── ADD USER ─────────────────────────────────────── */}
          {tab === 'add' && (
            <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 560 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2.5 }}>Create New User Account</Typography>
              {addError   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{addError}</Alert>}
              {addSuccess && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                  <strong>User created!</strong> Welcome email sent.<br />
                  Temporary password: <strong style={{ fontFamily: 'monospace' }}>{tempPw}</strong><br />
                  The user must change this on first login.
                </Alert>
              )}
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Employee (from Employee Upload)</InputLabel>
                    <Select value={form.employeeId} onChange={(e) => handleEmpSelect(e.target.value as string)} label="Employee (from Employee Upload)">
                      <MenuItem value=""><em>Select or leave blank…</em></MenuItem>
                      {employees.filter((e) => e.active).sort((a, b) => a.employeeName.localeCompare(b.employeeName)).map((e) => (
                        <MenuItem key={e.id} value={e.id}>{e.employeeNumber} — {e.employeeName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Full Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" type="email" label="Email Address *" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Designation / Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>Access Role *</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {ROLES.map((r) => {
                      const rc = ROLE_COLORS[r];
                      return (
                        <Button key={r} size="small"
                          variant={form.role === r ? 'contained' : 'outlined'}
                          onClick={() => setForm((f) => ({ ...f, role: r }))}
                          sx={{ borderRadius: 99, px: 2, fontSize: 12,
                            ...(form.role === r ? { bgcolor: rc.color, '&:hover': { bgcolor: rc.color } } : { color: rc.color, borderColor: rc.color }) }}>
                          {r}
                        </Button>
                      );
                    })}
                  </Box>
                  {form.role && (
                    <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF', mt: 0.75 }}>
                      {['Admin', 'Manager'].includes(form.role)
                        ? '⚡ This role has access to the Administration section'
                        : '👤 This role has access to Issues and Dashboard only'}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={handleCreate} disabled={saving} sx={{ py: 1.25 }}>
                    {saving ? <CircularProgress size={18} color="inherit" /> : 'Create User & Send Email'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>

        {tab === 'add' && (
          <Paper sx={{ p: 3, borderRadius: 3, minWidth: 260, maxWidth: 300 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 2 }}>How it works</Typography>
            {[
              { n: 1, title: 'Fill in employee details', sub: 'Select from Employee Upload list or enter manually' },
              { n: 2, title: 'Choose access role', sub: 'Admin / Manager get Administration. Others get Issues & Dashboard only.' },
              { n: 3, title: 'System creates account', sub: 'A secure temporary password is generated automatically' },
              { n: 4, title: 'User sets new password', sub: 'On first login, user must change their temporary password' },
            ].map((s) => (
              <Box key={s.n} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#4F38F6', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>{s.n}</Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#07003C', mb: 0.25 }}>{s.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#6B6B8A', lineHeight: 1.5 }}>{s.sub}</Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        )}
      </Box>

      {/* ── CHANGE ROLE MODAL ──────────────────────────────────── */}
      <Dialog open={!!editUser} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Change Role
          {editUser && (
            <Typography sx={{ fontSize: 13, color: '#6B6B8A', fontWeight: 400, mt: 0.25 }}>
              {editUser.name} · {editUser.email}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {editError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{editError}</Alert>}
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#07003C', mb: 1.5 }}>Select New Role</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ROLES.map((r) => {
              const rc = ROLE_COLORS[r];
              const selected = editRole === r;
              return (
                <Box key={r} onClick={() => setEditRole(r)} sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 2, py: 1.25, borderRadius: 2, cursor: 'pointer', border: '2px solid',
                  borderColor: selected ? rc.color : '#E5E7EB',
                  bgcolor: selected ? rc.bg : 'transparent',
                  transition: 'all 150ms',
                  '&:hover': { borderColor: rc.color, bgcolor: rc.bg },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: selected ? rc.color : '#D1D5DB', transition: 'background 150ms' }} />
                    <Typography sx={{ fontSize: 13, fontWeight: selected ? 600 : 400, color: selected ? rc.color : '#07003C' }}>{r}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF' }}>
                    {['Admin', 'Manager'].includes(r) ? '⚡ Full admin access' : '👤 Issues & Dashboard'}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          {editUser && editRole !== editUser.role && (
            <Alert severity="info" sx={{ mt: 2, fontSize: 12, borderRadius: 2 }}>
              Changing <strong>{editUser.role}</strong> → <strong>{editRole}</strong>.
              {['Admin', 'Manager'].includes(editRole) && !['Admin', 'Manager'].includes(editUser.role)
                ? ' This user will gain Administration access.'
                : !['Admin', 'Manager'].includes(editRole) && ['Admin', 'Manager'].includes(editUser.role)
                ? ' This user will lose Administration access.'
                : ''}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditUser(null)} variant="outlined" color="inherit">Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={editSaving || editRole === editUser?.role}>
            {editSaving ? <CircularProgress size={18} color="inherit" /> : 'Save Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── CONFIRM DIALOG ─────────────────────────────────────── */}
      {confirmConfig && (
        <ConfirmDialog
          open={confirmOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          confirmColor={confirmConfig.confirmColor}
          icon={confirmConfig.icon}
          onConfirm={handleConfirmOk}
          onCancel={() => setConfirmOpen(false)}
          loading={confirmLoading}
        />
      )}

      {/* ── INFO / RESULT DIALOG ───────────────────────────────── */}
      <InfoDialog
        open={infoOpen}
        title={infoTitle}
        message={infoMessage}
        onClose={() => setInfoOpen(false)}
      />
    </Box>
  );
};

export default UserManagementPage;
