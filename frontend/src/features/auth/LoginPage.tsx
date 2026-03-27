import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button,
  Alert, CircularProgress, InputAdornment, IconButton, Link,
} from '@mui/material';
import VisibilityIcon       from '@mui/icons-material/Visibility';
import VisibilityOffIcon    from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon        from '@mui/icons-material/ArrowBack';
import EmailOutlinedIcon    from '@mui/icons-material/EmailOutlined';
import LockResetIcon        from '@mui/icons-material/LockReset';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '@store/useAuth';
import { authApi } from '@services/api';

type Screen = 'login' | 'forgot' | 'forgot-sent' | 'must-change';

// ── Reusable left panel ──────────────────────────────────────────
const LeftPanel: React.FC = () => (
  <Box sx={{
    display: { xs: 'none', md: 'flex' },
    width: '50%', flexDirection: 'column', justifyContent: 'space-between',
    p: 5,
    background: 'linear-gradient(135deg,#4F38F6 0%,#3B24E0 50%,#2E1BB8 100%)',
    position: 'relative', overflow: 'hidden',
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
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, bgcolor: 'rgba(255,255,255,.1)', borderRadius: 99, mb: 2.5 }}>
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#4ade80' }} />
        <Typography sx={{ fontSize: 11, color: '#fff' }}>Platform Online</Typography>
      </Box>
      <Typography sx={{ fontSize: 36, fontWeight: 500, color: '#fff', lineHeight: 1.3, mb: 1.5 }}>
        One platform.<br />
        <span style={{ background: 'linear-gradient(to right,#fff,rgba(255,255,255,.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Track. Plan. Deliver.
        </span>
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#c6d2ff', lineHeight: 1.7, maxWidth: 360 }}>
        Unified issue tracking, project planning, and real-time collaboration — everything your team needs from initiation to closure.
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, mt: 4 }}>
        {[
          { n: '24', l: 'Active Projects', d: '+3' },
          { n: '128', l: 'Team Members', d: '+12' },
          { n: '87%', l: 'Issues Resolved', d: '+5%' },
        ].map((s) => (
          <Box key={s.l} sx={{ bgcolor: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 2, p: 1.5 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{s.n}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,.7)' }}>{s.l}</Typography>
              <Typography sx={{ fontSize: 9, color: '#86efac', fontWeight: 600 }}>{s.d}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>

    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,.4)', zIndex: 1 }}>
      © {new Date().getFullYear()} vThink. All rights reserved.
    </Typography>
  </Box>
);

// ────────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [screen, setScreen] = useState<Screen>('login');

  // ── Login state ────────────────────────────────────────────────
  const [credential, setCredential] = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError]     = useState('');

  // ── Forgot password state ──────────────────────────────────────
  const [forgotCred, setForgotCred]       = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError]     = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  // ── Must-change-password state ────────────────────────────────
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError]     = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);
  // keep temp password in memory to use as currentPassword
  const [tempPassword, setTempPassword] = useState('');

  // ── Handlers ──────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim() || !password.trim()) {
      setLoginError('Please enter your email / employee number and password');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    try {
      const { mustChangePassword } = await login(credential.trim(), password);
      if (mustChangePassword) {
        // Stay on this page — show the change-password panel
        setTempPassword(password);
        setNewPw('');
        setConfirmPw('');
        setChangeError('');
        setChangeSuccess(false);
        setScreen('must-change');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setLoginError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Invalid credentials',
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCred.trim()) { setForgotError('Please enter your email or employee number'); return; }
    setForgotLoading(true); setForgotError('');
    try {
      const res = await authApi.forgotPassword(forgotCred.trim());
      setForgotMessage(res.data.data?.message ?? 'Reset link sent. Please check your email.');
      setScreen('forgot-sent');
    } catch (err: unknown) {
      setForgotError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to send reset link',
      );
    } finally { setForgotLoading(false); }
  };

  const handleMustChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPw.trim())              { setChangeError('Please enter a new password'); return; }
    if (newPw.length < 6)          { setChangeError('Password must be at least 6 characters'); return; }
    if (newPw !== confirmPw)        { setChangeError('Passwords do not match'); return; }
    if (newPw === tempPassword)     { setChangeError('New password must be different from your temporary password'); return; }
    setChangeLoading(true); setChangeError('');
    try {
      await authApi.changePassword(tempPassword, newPw);
      setChangeSuccess(true);
      // Brief success moment then enter the app
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err: unknown) {
      setChangeError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to change password',
      );
    } finally { setChangeLoading(false); }
  };

  // Password strength
  const strength = (() => {
    if (!newPw) return { score: 0, label: '', color: '' };
    let s = 0;
    if (newPw.length >= 8)          s++;
    if (/[A-Z]/.test(newPw))        s++;
    if (/[0-9]/.test(newPw))        s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    if (s <= 1) return { score: s, label: 'Weak',   color: '#DC2626' };
    if (s === 2) return { score: s, label: 'Fair',   color: '#F59E0B' };
    if (s === 3) return { score: s, label: 'Good',   color: '#16A34A' };
    return           { score: s, label: 'Strong', color: '#4F38F6' };
  })();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#EBE8FC' }}>
      <LeftPanel />

      {/* ── Right panel ─────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>

          {/* ══ LOGIN ═══════════════════════════════════════════ */}
          {screen === 'login' && (
            <>
              <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#07003C', textAlign: 'center', mb: 0.5 }}>
                Welcome back
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#6B6B8A', textAlign: 'center', mb: 4 }}>
                Sign in to your account to continue
              </Typography>

              {loginError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{loginError}</Alert>}

              <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#07003C', mb: 0.75 }}>
                    Email or Employee Number
                  </Typography>
                  <TextField
                    fullWidth size="small"
                    placeholder="admin@company.com or VT348"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    autoComplete="username"
                    inputProps={{ style: { textTransform: 'none' } }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#07003C', mb: 0.75 }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth size="small"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={rememberMe ? 'current-password' : 'off'}
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
                </Box>

                {/* Remember me + Forgot password */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => setRememberMe(v => !v)}>
                    <Box sx={{
                      width: 18, height: 18, border: '2px solid',
                      borderColor: rememberMe ? '#4F38F6' : '#D1D5DB',
                      borderRadius: '4px',
                      bgcolor: rememberMe ? '#4F38F6' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 150ms', flexShrink: 0,
                    }}>
                      {rememberMe && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 13, color: '#374151', userSelect: 'none' }}>Remember me</Typography>
                  </Box>
                  <Link component="button" type="button"
                    onClick={() => { setScreen('forgot'); setForgotError(''); setForgotCred(''); }}
                    sx={{ fontSize: 13, color: '#4F38F6', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    Forgot password?
                  </Link>
                </Box>

                <Button type="submit" variant="contained" fullWidth disabled={loginLoading}
                  sx={{ py: 1.25, fontSize: 14, fontWeight: 600, borderRadius: 2.5 }}>
                  {loginLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign In →'}
                </Button>
              </Box>
            </>
          )}

          {/* ══ MUST CHANGE PASSWORD ════════════════════════════ */}
          {screen === 'must-change' && (
            <>
              {/* Warning banner */}
              <Box sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1.5,
                p: 2, mb: 3, borderRadius: 2.5,
                bgcolor: '#fffbeb', border: '1px solid #FDE68A',
              }}>
                <LockResetIcon sx={{ color: '#F59E0B', fontSize: 22, mt: 0.25, flexShrink: 0 }} />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#92400E', mb: 0.25 }}>
                    Password change required
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
                    You are using a temporary password. You must set a new password before accessing the system.
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#07003C', mb: 0.5 }}>
                Set Your New Password
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#6B6B8A', mb: 3 }}>
                Choose a secure password for your account.
              </Typography>

              {changeError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>{changeError}</Alert>}

              {changeSuccess ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#16A34A', fontSize: 32 }} />
                  </Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#07003C', mb: 0.75 }}>Password Updated!</Typography>
                  <Typography sx={{ fontSize: 13, color: '#6B6B8A' }}>Redirecting you to the dashboard…</Typography>
                  <CircularProgress size={20} sx={{ mt: 2, color: '#4F38F6' }} />
                </Box>
              ) : (
                <Box component="form" onSubmit={handleMustChange} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#07003C', mb: 0.75 }}>New Password</Typography>
                    <TextField
                      fullWidth size="small" autoFocus
                      type={showNewPw ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowNewPw(v => !v)} edge="end">
                              {showNewPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
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
                        <Typography sx={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#07003C', mb: 0.75 }}>Confirm New Password</Typography>
                    <TextField
                      fullWidth size="small"
                      type={showConfPw ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      error={confirmPw.length > 0 && confirmPw !== newPw}
                      helperText={confirmPw.length > 0 && confirmPw !== newPw ? 'Passwords do not match' : ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowConfPw(v => !v)} edge="end">
                              {showConfPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Button type="submit" variant="contained" fullWidth disabled={changeLoading}
                    sx={{ py: 1.25, fontSize: 14, fontWeight: 600, borderRadius: 2.5 }}>
                    {changeLoading ? <CircularProgress size={20} color="inherit" /> : 'Set New Password & Enter App →'}
                  </Button>

                  <Button onClick={() => { setScreen('login'); setPassword(''); }}
                    sx={{ fontSize: 13, color: '#6B6B8A' }}>
                    ← Back to Sign In
                  </Button>
                </Box>
              )}
            </>
          )}

          {/* ══ FORGOT PASSWORD ═════════════════════════════════ */}
          {screen === 'forgot' && (
            <>
              <Button startIcon={<ArrowBackIcon />} onClick={() => setScreen('login')}
                sx={{ mb: 3, color: '#6B6B8A', p: 0, '&:hover': { background: 'transparent', color: '#4F38F6' } }}>
                Back to login
              </Button>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#EBE8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <EmailOutlinedIcon sx={{ color: '#4F38F6', fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#07003C' }}>Forgot Password?</Typography>
                  <Typography sx={{ fontSize: 13, color: '#6B6B8A' }}>We&apos;ll send a reset link to your email</Typography>
                </Box>
              </Box>
              {forgotError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>{forgotError}</Alert>}
              <Box component="form" onSubmit={handleForgot} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#07003C', mb: 0.75 }}>
                    Email Address or Employee Number
                  </Typography>
                  <TextField fullWidth size="small" autoFocus
                    placeholder="your@email.com or VT348"
                    value={forgotCred}
                    onChange={(e) => setForgotCred(e.target.value)}
                  />
                  <Typography sx={{ fontSize: 11, color: '#6B6B8A', mt: 0.75 }}>
                    If not found in the system, please contact your Administrator.
                  </Typography>
                </Box>
                <Button type="submit" variant="contained" fullWidth disabled={forgotLoading}
                  sx={{ py: 1.25, fontSize: 14, fontWeight: 600, borderRadius: 2.5 }}>
                  {forgotLoading ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Link'}
                </Button>
              </Box>
            </>
          )}

          {/* ══ FORGOT SENT ═════════════════════════════════════ */}
          {screen === 'forgot-sent' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <EmailOutlinedIcon sx={{ color: '#16A34A', fontSize: 32 }} />
              </Box>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#07003C', mb: 1 }}>Check Your Email</Typography>
              <Typography sx={{ fontSize: 13, color: '#6B6B8A', lineHeight: 1.7, mb: 3 }}>{forgotMessage}</Typography>
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2, textAlign: 'left', fontSize: 13 }}>
                The reset link is valid for <strong>1 hour</strong>. Check your spam folder if you don&apos;t see it.
              </Alert>
              <Button variant="outlined" fullWidth onClick={() => setScreen('login')}
                sx={{ py: 1.25, fontSize: 14, fontWeight: 600, borderRadius: 2.5 }}>
                Back to Sign In
              </Button>
              <Button fullWidth onClick={() => { setScreen('forgot'); setForgotCred(''); }}
                sx={{ mt: 1, fontSize: 13, color: '#6B6B8A' }}>
                Resend reset link
              </Button>
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
