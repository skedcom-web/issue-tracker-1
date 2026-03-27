import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button,
  Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { authApi } from '@services/api';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token  = searchParams.get('token')  ?? '';
  const userId = searchParams.get('userId') ?? '';

  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCPw, setShowCPw]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  // Validate params on mount
  useEffect(() => {
    if (!token || !userId) {
      setError('Invalid reset link. Please request a new one from the login page.');
    }
  }, [token, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPw.trim()) { setError('Please enter a new password'); return; }
    if (newPw.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match'); return; }

    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword(token, userId, newPw);
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to reset password. The link may have expired.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const strength = (() => {
    if (!newPw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (newPw.length >= 8) score++;
    if (/[A-Z]/.test(newPw)) score++;
    if (/[0-9]/.test(newPw)) score++;
    if (/[^A-Za-z0-9]/.test(newPw)) score++;
    if (score <= 1) return { score, label: 'Weak', color: '#DC2626' };
    if (score === 2) return { score, label: 'Fair', color: '#F59E0B' };
    if (score === 3) return { score, label: 'Good', color: '#16A34A' };
    return { score, label: 'Strong', color: '#4F38F6' };
  })();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#EBE8FC' }}>

      {/* Left panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '50%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 5,
        background: 'linear-gradient(135deg,#4F38F6 0%,#3B24E0 50%,#2E1BB8 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,.1)' }} />
        <Box sx={{ position: 'absolute', bottom: -120, left: -60, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,.1)' }} />
        <Box sx={{ display: 'flex', alignItems: 'baseline', zIndex: 1 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>v</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>Think</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#f87171' }}>*</span>
          <sup style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginLeft: 1 }}>®</sup>
        </Box>
        <Box sx={{ zIndex: 1 }}>
          <Typography sx={{ fontSize: 32, fontWeight: 500, color: '#fff', lineHeight: 1.3, mb: 2 }}>
            Secure your<br />
            <span style={{ background: 'linear-gradient(to right,#fff,rgba(255,255,255,.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              account access
            </span>
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#c6d2ff', lineHeight: 1.7 }}>
            Choose a strong password to keep your account safe. Use a mix of uppercase, lowercase, numbers and special characters.
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,.4)', zIndex: 1 }}>
          © {new Date().getFullYear()} vThink. All rights reserved.
        </Typography>
      </Box>

      {/* Right panel */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>

          {/* Success state */}
          {success ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <CheckCircleOutlineIcon sx={{ color: '#16A34A', fontSize: 36 }} />
              </Box>
              <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#07003C', mb: 1 }}>
                Password Reset!
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#6B6B8A', mb: 3, lineHeight: 1.7 }}>
                Your password has been successfully updated. You can now sign in with your new password.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/login')}
                sx={{ py: 1.25, fontSize: 14, fontWeight: 600, borderRadius: 2.5 }}
              >
                Sign In Now →
              </Button>
            </Box>
          ) : (
            <>
              {/* Invalid link state */}
              {(!token || !userId) ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                    <ErrorOutlineIcon sx={{ color: '#DC2626', fontSize: 36 }} />
                  </Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#07003C', mb: 1 }}>Invalid Reset Link</Typography>
                  <Typography sx={{ fontSize: 13, color: '#6B6B8A', mb: 3 }}>
                    This reset link is invalid or has expired. Please request a new one.
                  </Typography>
                  <Button variant="contained" fullWidth onClick={() => navigate('/login')}
                    sx={{ py: 1.25, fontSize: 14, fontWeight: 600, borderRadius: 2.5 }}>
                    Back to Login
                  </Button>
                </Box>
              ) : (
                <>
                  <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#07003C', mb: 0.5 }}>
                    Set New Password
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#6B6B8A', mb: 3.5 }}>
                    Choose a new password for your account. Must be at least 6 characters.
                  </Typography>

                  {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>{error}</Alert>}

                  <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#07003C', mb: 0.75 }}>
                        New Password
                      </Typography>
                      <TextField
                        fullWidth size="small" autoFocus
                        type={showPw ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowPw(v => !v)} edge="end">
                                {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {/* Strength bar */}
                      {newPw && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                            {[1, 2, 3, 4].map((i) => (
                              <Box key={i} sx={{
                                flex: 1, height: 4, borderRadius: 99,
                                bgcolor: i <= strength.score ? strength.color : '#E5E7EB',
                                transition: 'background 200ms',
                              }} />
                            ))}
                          </Box>
                          <Typography sx={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>
                            {strength.label}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#07003C', mb: 0.75 }}>
                        Confirm New Password
                      </Typography>
                      <TextField
                        fullWidth size="small"
                        type={showCPw ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        error={confirmPw.length > 0 && confirmPw !== newPw}
                        helperText={confirmPw.length > 0 && confirmPw !== newPw ? 'Passwords do not match' : ''}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowCPw(v => !v)} edge="end">
                                {showCPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{ py: 1.25, fontSize: 14, fontWeight: 600, borderRadius: 2.5 }}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Reset Password →'}
                    </Button>

                    <Button onClick={() => navigate('/login')} sx={{ color: '#6B6B8A', fontSize: 13 }}>
                      ← Back to Sign In
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
