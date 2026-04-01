import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button,
  Alert, CircularProgress, InputAdornment, IconButton, Link,
} from '@mui/material';
import VisibilityIcon         from '@mui/icons-material/Visibility';
import VisibilityOffIcon      from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon          from '@mui/icons-material/ArrowBack';
import EmailOutlinedIcon      from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon       from '@mui/icons-material/LockOutlined';
import LockResetIcon          from '@mui/icons-material/LockReset';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '@store/useAuth';
import { authApi } from '@services/api';

type Screen = 'login' | 'forgot' | 'forgot-sent' | 'must-change';

// ── LEFT PANEL — matches Image 1 (vThink timesheet reference) ────────
const LeftPanel: React.FC = () => (
  <Box sx={{
    display: { xs: 'none', md: 'flex' },
    width: '45%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    p: 5,
    background: 'linear-gradient(135deg, #4F38F6 0%, #3B24E0 50%, #2910C8 100%)',
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* Decorative circles */}
    <Box sx={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, borderRadius: '50%', border: '1px solid rgba(255,255,255,.08)', pointerEvents: 'none' }} />
    <Box sx={{ position: 'absolute', top: -50, right: -50,  width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,.05)', pointerEvents: 'none' }} />
    <Box sx={{ position: 'absolute', bottom: -150, left: -80, width: 450, height: 450, borderRadius: '50%', border: '1px solid rgba(255,255,255,.06)', pointerEvents: 'none' }} />

    {/* ── Logo + status — grouped together at top, tight spacing ── */}
    <Box sx={{ zIndex: 1 }}>
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0, mb: 1.25 }}>
        <Typography component="span" sx={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>v</Typography>
        <Typography component="span" sx={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>Think</Typography>
        <Typography component="span" sx={{ fontSize: 16, fontWeight: 700, color: '#f87171', lineHeight: 1 }}>*</Typography>
        <Typography component="sup" sx={{ fontSize: 9, color: 'rgba(255,255,255,.5)', ml: 0.25 }}>®</Typography>
      </Box>

      {/* All Systems Operational pill — immediately below logo */}
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 1,
        px: 1.75, py: 0.6,
        bgcolor: 'rgba(255,255,255,.12)',
        border: '1px solid rgba(255,255,255,.15)',
        borderRadius: 99,
        mb: 0.75,
      }}>
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#4ade80', flexShrink: 0 }} />
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>All Systems Operational</Typography>
      </Box>

      {/* App type label — tight below the pill */}
      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,.6)', mb: 3 }}>
        Issue / Project Tracking Application
      </Typography>

      {/* Hero headline */}
      <Typography sx={{ fontSize: 34, fontWeight: 700, color: '#fff', lineHeight: 1.25, mb: 1.5 }}>
        One platform.<br />
        <Box component="span" sx={{
          background: 'linear-gradient(to right, #fff 0%, rgba(255,255,255,.65) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Track. Plan. Deliver.
        </Box>
      </Typography>

      {/* Subtitle */}
      <Typography sx={{ fontSize: 13, color: 'rgba(198,210,255,.85)', lineHeight: 1.75, maxWidth: 340, mb: 4 }}>
        Unified issue tracking, project planning, and real-time collaboration — everything your team needs from initiation to closure.
      </Typography>

      {/* Stats grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25 }}>
        {[
          { n: '24',  l: 'Active Projects', d: '+3'   },
          { n: '128', l: 'Team Members',    d: '+12'  },
          { n: '87%', l: 'Issues Resolved', d: '+5%'  },
        ].map((s) => (
          <Box key={s.l} sx={{
            bgcolor: 'rgba(255,255,255,.1)',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 2,
            p: 1.5,
          }}>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.n}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,.65)' }}>{s.l}</Typography>
              <Typography sx={{ fontSize: 10, color: '#86efac', fontWeight: 700 }}>{s.d}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>

    {/* ── Footer ───────────────────────────────────────────────── */}
    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,.35)', zIndex: 1 }}>
      © {new Date().getFullYear()} vThink. All rights reserved.
    </Typography>
  </Box>
);

// ── Shared input sx — matches right panel style ──────────────────
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: '#F9FAFB',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#9CA3AF' },
    '&.Mui-focused fieldset': { borderColor: '#4F38F6', borderWidth: '1.5px' },
  },
  '& .MuiInputBase-input': { fontSize: 14, color: '#07003C', padding: '11px 14px' },
  '& .MuiInputBase-input::placeholder': { color: '#9CA3AF', opacity: 1 },
  '& .MuiInputLabel-root': { display: 'none' },
};

// ── Field label ──────────────────────────────────────────────────
const FL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#07003C', mb: 0.75 }}>
    {children}
  </Typography>
);

// ────────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [screen, setScreen] = useState<Screen>('login');

  // Login
  const [credential, setCredential] = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError]     = useState('');

  // Forgot password
  const [forgotCred, setForgotCred]       = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError]     = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  // Must-change-password
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showNewPw, setShowNewPw]   = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError]     = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);
  const [tempPassword, setTempPassword]   = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim() || !password.trim()) {
      setLoginError('Please enter your email / employee number and password');
      return;
    }
    setLoginLoading(true); setLoginError('');
    try {
      const { mustChangePassword } = await login(credential.trim(), password);
      if (mustChangePassword) {
        setTempPassword(password);
        setNewPw(''); setConfirmPw(''); setChangeError(''); setChangeSuccess(false);
        setScreen('must-change');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setLoginError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Invalid credentials',
      );
    } finally { setLoginLoading(false); }
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
    if (!newPw.trim())          { setChangeError('Please enter a new password'); return; }
    if (newPw.length < 6)       { setChangeError('Password must be at least 6 characters'); return; }
    if (newPw !== confirmPw)    { setChangeError('Passwords do not match'); return; }
    if (newPw === tempPassword) { setChangeError('New password must be different from your temporary password'); return; }
    setChangeLoading(true); setChangeError('');
    try {
      await authApi.changePassword(tempPassword, newPw);
      setChangeSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err: unknown) {
      setChangeError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to change password',
      );
    } finally { setChangeLoading(false); }
  };

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
    return            { score: s, label: 'Strong', color: '#4F38F6' };
  })();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#F0F2F5' }}>
      {/* ── Left panel ───────────────────────────────────────────── */}
      <LeftPanel />

      {/* ── Right panel ──────────────────────────────────────────── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        bgcolor: '#F0F2F5',
      }}>
        <Box sx={{ width: '100%', maxWidth: 440 }}>

          {/* ── Brand mark above the card (right side) ───────────── */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0, mb: 0.5 }}>
              <Typography component="span" sx={{ fontSize: 26, fontWeight: 800, color: '#E53E3E', lineHeight: 1 }}>v</Typography>
              <Typography component="span" sx={{ fontSize: 26, fontWeight: 800, color: '#07003C', lineHeight: 1 }}>Think</Typography>
              <Typography component="span" sx={{ fontSize: 13, fontWeight: 700, color: '#07003C', lineHeight: 1, ml: 0.25 }}>®</Typography>
            </Box>
          </Box>

          {/* ── White card ───────────────────────────────────────── */}
          <Box sx={{
            bgcolor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
            p: { xs: 3, sm: 4 },
          }}>

            {/* ══ LOGIN ══════════════════════════════════════════ */}
            {screen === 'login' && (
              <>
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#07003C', textAlign: 'center', mb: 0.5 }}>
                  Welcome back
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#6B7280', textAlign: 'center', mb: 3 }}>
                  Sign in to your account to continue
                </Typography>

                {loginError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{loginError}</Alert>}

                <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                  {/* Employee ID or Email */}
                  <Box>
                    <FL>Employee ID or Email</FL>
                    <TextField
                      fullWidth
                      placeholder="VT001 or you@vthink.co.in"
                      value={credential}
                      onChange={(e) => setCredential(e.target.value)}
                      autoComplete="username"
                      sx={inputSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ fontSize: 18, color: '#9CA3AF', ml: 0.5 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Password */}
                  <Box>
                    <FL>Password</FL>
                    <TextField
                      fullWidth
                      type={showPw ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={rememberMe ? 'current-password' : 'off'}
                      sx={inputSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ fontSize: 18, color: '#9CA3AF', ml: 0.5 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPw(v => !v)} edge="end" sx={{ mr: 0.25 }}>
                              {showPw
                                ? <VisibilityOffIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                                : <VisibilityIcon   sx={{ fontSize: 18, color: '#9CA3AF' }} />
                              }
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Sign in button */}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loginLoading}
                    sx={{
                      py: 1.5,
                      fontSize: 15,
                      fontWeight: 600,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #4F38F6 0%, #3B24E0 100%)',
                      boxShadow: '0 4px 14px rgba(79,56,246,0.35)',
                      mt: 0.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #3B24E0 0%, #2E1BB8 100%)',
                        boxShadow: '0 6px 20px rgba(79,56,246,0.45)',
                      },
                      '&:disabled': { background: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
                    }}
                  >
                    {loginLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign in →'}
                  </Button>

                  {/* Forgot Password link */}
                  <Box sx={{ textAlign: 'center', mt: -0.5 }}>
                    <Link
                      component="button"
                      type="button"
                      onClick={() => { setScreen('forgot'); setForgotError(''); setForgotCred(''); }}
                      sx={{ fontSize: 13, fontWeight: 600, color: '#4F38F6', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Forgot Password / Reset Password
                    </Link>
                  </Box>
                </Box>

                {/* Contact admin note */}
                <Typography sx={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', mt: 2.5, fontStyle: 'italic' }}>
                  Contact your administrator if you need access
                </Typography>
              </>
            )}

            {/* ══ MUST CHANGE PASSWORD ═══════════════════════════ */}
            {screen === 'must-change' && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, mb: 3, borderRadius: 2, bgcolor: '#fffbeb', border: '1px solid #FDE68A' }}>
                  <LockResetIcon sx={{ color: '#F59E0B', fontSize: 22, mt: 0.25, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#92400E', mb: 0.25 }}>Password change required</Typography>
                    <Typography sx={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
                      You are using a temporary password. Please set a new password before continuing.
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#07003C', mb: 0.5 }}>Set Your New Password</Typography>
                <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 3 }}>Choose a secure password for your account.</Typography>
                {changeError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{changeError}</Alert>}
                {changeSuccess ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                      <CheckCircleOutlineIcon sx={{ color: '#16A34A', fontSize: 32 }} />
                    </Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#07003C', mb: 0.75 }}>Password Updated!</Typography>
                    <Typography sx={{ fontSize: 13, color: '#6B7280' }}>Redirecting to dashboard…</Typography>
                    <CircularProgress size={20} sx={{ mt: 2, color: '#4F38F6' }} />
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleMustChange} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <FL>New Password</FL>
                      <TextField fullWidth autoFocus type={showNewPw ? 'text' : 'password'} placeholder="Enter new password"
                        value={newPw} onChange={(e) => setNewPw(e.target.value)} sx={inputSx}
                        InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton size="small" onClick={() => setShowNewPw(v => !v)} edge="end">{showNewPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}</IconButton></InputAdornment>) }}
                      />
                      {newPw && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                            {[1,2,3,4].map((i) => (
                              <Box key={i} sx={{ flex: 1, height: 4, borderRadius: 99, bgcolor: i <= strength.score ? strength.color : '#E5E7EB', transition: 'background 200ms' }} />
                            ))}
                          </Box>
                          <Typography sx={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <FL>Confirm New Password</FL>
                      <TextField fullWidth type={showConfPw ? 'text' : 'password'} placeholder="Confirm new password"
                        value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                        error={confirmPw.length > 0 && confirmPw !== newPw}
                        helperText={confirmPw.length > 0 && confirmPw !== newPw ? 'Passwords do not match' : ''}
                        sx={inputSx}
                        InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton size="small" onClick={() => setShowConfPw(v => !v)} edge="end">{showConfPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}</IconButton></InputAdornment>) }}
                      />
                    </Box>
                    <Button type="submit" variant="contained" fullWidth disabled={changeLoading}
                      sx={{ py: 1.5, fontSize: 14, fontWeight: 600, borderRadius: '10px', background: 'linear-gradient(135deg,#4F38F6,#3B24E0)', '&:hover': { background: 'linear-gradient(135deg,#3B24E0,#2E1BB8)' } }}>
                      {changeLoading ? <CircularProgress size={20} color="inherit" /> : 'Set Password & Enter App →'}
                    </Button>
                    <Button onClick={() => { setScreen('login'); setPassword(''); }} sx={{ fontSize: 13, color: '#6B7280' }}>
                      ← Back to Sign In
                    </Button>
                  </Box>
                )}
              </>
            )}

            {/* ══ FORGOT PASSWORD ════════════════════════════════ */}
            {screen === 'forgot' && (
              <>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setScreen('login')}
                  sx={{ mb: 2.5, color: '#6B7280', p: 0, '&:hover': { background: 'transparent', color: '#4F38F6' } }}>
                  Back to login
                </Button>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#EBE8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <EmailOutlinedIcon sx={{ color: '#4F38F6', fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#07003C' }}>Forgot Password?</Typography>
                    <Typography sx={{ fontSize: 12, fontStyle: 'italic', color: '#9CA3AF' }}>We'll send a reset link to your email</Typography>
                  </Box>
                </Box>
                {forgotError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{forgotError}</Alert>}
                <Box component="form" onSubmit={handleForgot} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <FL>Email Address or Employee Number</FL>
                    <TextField fullWidth autoFocus placeholder="your@email.com or VT001"
                      value={forgotCred} onChange={(e) => setForgotCred(e.target.value)} sx={inputSx} />
                    <Typography sx={{ fontSize: 11, fontStyle: 'italic', color: '#9CA3AF', mt: 0.75 }}>
                      If not found in the system, please contact your Administrator.
                    </Typography>
                  </Box>
                  <Button type="submit" variant="contained" fullWidth disabled={forgotLoading}
                    sx={{ py: 1.5, fontSize: 14, fontWeight: 600, borderRadius: '10px', background: 'linear-gradient(135deg,#4F38F6,#3B24E0)', '&:hover': { background: 'linear-gradient(135deg,#3B24E0,#2E1BB8)' } }}>
                    {forgotLoading ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Link'}
                  </Button>
                </Box>
              </>
            )}

            {/* ══ FORGOT SENT ════════════════════════════════════ */}
            {screen === 'forgot-sent' && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <EmailOutlinedIcon sx={{ color: '#16A34A', fontSize: 32 }} />
                </Box>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#07003C', mb: 1 }}>Check Your Email</Typography>
                <Typography sx={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, mb: 3 }}>{forgotMessage}</Typography>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2, textAlign: 'left', fontSize: 13 }}>
                  The reset link is valid for <strong>1 hour</strong>. Check your spam folder if you don't see it.
                </Alert>
                <Button variant="outlined" fullWidth onClick={() => setScreen('login')}
                  sx={{ py: 1.25, fontSize: 14, fontWeight: 600, borderRadius: '10px' }}>
                  Back to Sign In
                </Button>
                <Button fullWidth onClick={() => { setScreen('forgot'); setForgotCred(''); }}
                  sx={{ mt: 1, fontSize: 13, color: '#6B7280' }}>
                  Resend reset link
                </Button>
              </Box>
            )}

          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
