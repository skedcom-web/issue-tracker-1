import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@services/api';
import PageHeader from '@components/common/PageHeader';
import { useAuth } from '@store/useAuth';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPw !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.newPw.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      await authApi.changePassword(form.current, form.newPw);
      setSuccess('Password changed successfully');
      await refreshUser();
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <Box>
      <PageHeader breadcrumbs={['Account', 'Change Password']} title="Change Password" />
      <Paper sx={{ maxWidth: 480, p: 4, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {['current', 'newPw', 'confirm'].map((field) => (
            <Box key={field}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
                {field === 'current' ? 'Current Password' : field === 'newPw' ? 'New Password' : 'Confirm New Password'}
              </Typography>
              <TextField
                fullWidth type="password" size="small"
                value={form[field as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              />
            </Box>
          ))}
          <Button type="submit" variant="contained" disabled={loading} sx={{ py: 1.25, mt: 0.5 }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Change Password'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangePasswordPage;
