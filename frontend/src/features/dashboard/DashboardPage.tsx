import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Skeleton,
  Stack,
  Chip,
  alpha,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import ComputerIcon from '@mui/icons-material/Computer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import { dashboardApi, projectsApi } from '@services/api';
import type { DashboardStats, Project, ActivityLog } from '@app-types/index';
import { useAuth } from '@store/useAuth';

// ── Palette: refined slate + brand violet (works on app lavender page bg) ──
const ink = { main: '#0f172a', soft: '#475569', muted: '#94a3b8' };
const brand = { main: '#4F38F6', deep: '#3730a3', light: '#a5b4fc' };

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  gradient: string;
  featured?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  gradient,
  featured,
  onClick,
}) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: featured ? 2.75 : 2.25,
      height: '100%',
      borderRadius: 3,
      border: '1px solid',
      borderColor: alpha('#0f172a', 0.06),
      background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(79, 56, 246, 0.06)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      '&::after': featured
        ? {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: gradient,
            opacity: 0.85,
          }
        : {},
      '&:hover': {
        transform: onClick || featured ? 'translateY(-3px)' : 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08), 0 16px 40px rgba(79, 56, 246, 0.12)',
      },
    }}
  >
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
      <Box>
        <Typography
          sx={{
            fontSize: featured ? 40 : 30,
            fontWeight: 800,
            color: ink.main,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            fontFeatureSettings: '"tnum"',
          }}
        >
          {value.toLocaleString()}
        </Typography>
        <Typography
          sx={{
            mt: 0.75,
            fontSize: featured ? 14 : 13,
            fontWeight: 600,
            color: ink.soft,
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          width: featured ? 52 : 44,
          height: featured ? 52 : 44,
          borderRadius: 2.5,
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(79, 56, 246, 0.25)',
          '& svg': { fontSize: featured ? 26 : 22 },
        }}
      >
        {icon}
      </Box>
    </Stack>
  </Paper>
);

function activityIcon(type: string) {
  const sx = { fontSize: 20 };
  if (type === 'issue_created') return <AddCircleOutlineIcon sx={{ ...sx, color: '#059669' }} />;
  if (type === 'issue_updated') return <EditOutlinedIcon sx={{ ...sx, color: brand.main }} />;
  if (type === 'status_change') return <SwapHorizIcon sx={{ ...sx, color: '#d97706' }} />;
  if (type === 'comment') return <ChatBubbleOutlineIcon sx={{ ...sx, color: '#6366f1' }} />;
  return <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: alpha(brand.main, 0.2) }} />;
}

function formatActivityWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const ChartCard: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.5, md: 3 },
      height: '100%',
      borderRadius: 3,
      border: '1px solid',
      borderColor: alpha('#0f172a', 0.06),
      background: '#fff',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.06)',
    }}
  >
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2.5 }}>
      <Box>
        <Typography sx={{ fontSize: 17, fontWeight: 700, color: ink.main, letterSpacing: '-0.02em' }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 13, color: ink.muted, mt: 0.35 }}>{subtitle}</Typography>
      </Box>
    </Stack>
    <Box
      sx={{
        borderRadius: 2,
        bgcolor: alpha('#f8fafc', 0.9),
        border: `1px solid ${alpha('#0f172a', 0.04)}`,
        px: 1,
        py: 0.5,
      }}
    >
      {children}
    </Box>
  </Paper>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] ?? 'User';
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const loadStats = async (pid?: number) => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStats(pid);
      setStats(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    projectsApi.getAll().then((r) => setProjects(r.data.data));
    loadStats();
  }, []);

  const handleProjectChange = (val: string) => {
    setSelectedProject(val);
    loadStats(val === 'All' ? undefined : Number(val));
  };

  const gradients = {
    total: 'linear-gradient(135deg, #4F38F6 0%, #7c3aed 100%)',
    open: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    progress: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
    resolved: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    closed: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    critical: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    overdue: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    mine: 'linear-gradient(135deg, #6366f1 0%, #4F38F6 100%)',
    week: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  };

  const pieData = stats
    ? [
        { id: 0, value: stats.open, label: 'Open', color: '#fbbf24' },
        { id: 1, value: stats.inProgress, label: 'In Progress', color: '#6366f1' },
        { id: 2, value: stats.resolved, label: 'Resolved', color: '#34d399' },
        { id: 3, value: stats.closed, label: 'Closed', color: '#94a3b8' },
      ]
    : [];

  const barDataset = stats
    ? Object.entries(stats.byPriority).map(([k, v]) => ({ priority: k, count: v }))
    : [];

  const priorityColors: Record<string, string> = {
    Critical: '#ef4444',
    High: '#f97316',
    Medium: '#eab308',
    Low: '#94a3b8',
  };

  const onActivityClick = (log: ActivityLog) => {
    if (log.issueId) navigate(`/issues/${log.issueId}`);
  };

  return (
    <Box sx={{ pb: 2 }}>
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          mb: 3,
          p: { xs: 2.5, md: 3.25 },
          background: `linear-gradient(125deg, ${brand.deep} 0%, ${brand.main} 42%, #8b5cf6 100%)`,
          color: '#fff',
          boxShadow: '0 20px 50px rgba(79, 56, 246, 0.35)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -20,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: alpha('#fff', 0.08),
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: '30%',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: alpha('#fff', 0.05),
            pointerEvents: 'none',
          }}
        />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                }}
              >
                Welcome back, {firstName}
              </Typography>
              <Chip
                label={user?.role ?? '—'}
                size="small"
                sx={{
                  bgcolor: alpha('#fff', 0.2),
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 11,
                  height: 26,
                  border: `1px solid ${alpha('#fff', 0.35)}`,
                }}
              />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: alpha('#fff', 0.85) }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{today}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 14, mt: 1.25, color: alpha('#fff', 0.88), maxWidth: 520, lineHeight: 1.5 }}>
              Your live overview of workload, risk, and momentum across projects.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
            <FilterListIcon sx={{ fontSize: 22, color: alpha('#fff', 0.9), flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
            <FormControl
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: alpha('#fff', 0.15),
                  color: '#fff',
                  borderRadius: 2,
                  '& fieldset': { borderColor: alpha('#fff', 0.35) },
                  '&:hover fieldset': { borderColor: alpha('#fff', 0.55) },
                  '&.Mui-focused fieldset': { borderColor: '#fff' },
                },
                '& .MuiSelect-icon': { color: alpha('#fff', 0.9) },
              }}
            >
              <Select value={selectedProject} onChange={(e) => handleProjectChange(e.target.value as string)} displayEmpty>
                <MenuItem value="All">All projects</MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {loading ? (
        <Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={4} md={4} key={`t-${i}`}>
                <Skeleton variant="rounded" height={128} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={6} sm={4} md={2} key={`s-${i}`}>
                <Skeleton variant="rounded" height={112} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Box>
      ) : stats ? (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <StatCard
                icon={<ComputerIcon />}
                value={stats.total}
                label="Total issues"
                gradient={gradients.total}
                featured
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <StatCard
                icon={<ErrorOutlineIcon />}
                value={stats.open}
                label="Open"
                gradient={gradients.open}
                onClick={() => navigate('/issues')}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <StatCard
                icon={<AccessTimeIcon />}
                value={stats.inProgress}
                label="In progress"
                gradient={gradients.progress}
                onClick={() => navigate('/issues')}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon={<CheckCircleOutlineIcon />}
                value={stats.resolved}
                label="Resolved"
                gradient={gradients.resolved}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon={<TaskAltIcon />}
                value={stats.closed}
                label="Closed"
                gradient={gradients.closed}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon={<ReportProblemOutlinedIcon />}
                value={stats.critical}
                label="Critical"
                gradient={gradients.critical}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon={<WatchLaterOutlinedIcon />}
                value={stats.overdue}
                label="Overdue"
                gradient={gradients.overdue}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon={<PersonOutlineIcon />}
                value={stats.myIssues ?? 0}
                label="My issues"
                gradient={gradients.mine}
                onClick={() => navigate('/my-issues')}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon={<TrendingUpIcon />}
                value={stats.thisWeek}
                label="New this week"
                gradient={gradients.week}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <ChartCard title="Issues by status" subtitle="Share of pipeline across open → closed">
                {pieData.some((d) => d.value > 0) ? (
                  <PieChart
                    series={[
                      {
                        data: pieData,
                        innerRadius: 58,
                        outerRadius: 100,
                        paddingAngle: 2.5,
                        cornerRadius: 4,
                        highlightScope: { fade: 'global', highlight: 'item' },
                      },
                    ]}
                    height={260}
                    slotProps={{
                      legend: {
                        direction: 'row',
                        position: { vertical: 'bottom', horizontal: 'middle' },
                        padding: { top: 16 },
                        labelStyle: { fontSize: 12, fill: ink.soft, fontWeight: 500 },
                      },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 240,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: ink.muted,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    No issues yet — data will appear here once issues exist.
                  </Box>
                )}
              </ChartCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <ChartCard title="Issues by priority" subtitle="Where attention is concentrated">
                {barDataset.length > 0 ? (
                  <BarChart
                    dataset={barDataset}
                    xAxis={[
                      {
                        scaleType: 'band',
                        dataKey: 'priority',
                        tickLabelStyle: { fontSize: 11, fill: ink.soft, fontWeight: 600 },
                      },
                    ]}
                    series={[
                      {
                        dataKey: 'count',
                        label: 'Count',
                        color: brand.main,
                        valueFormatter: (v) => (v == null ? '' : String(v)),
                      },
                    ]}
                    height={260}
                    colors={barDataset.map((row) => priorityColors[row.priority] ?? brand.main)}
                    borderRadius={6}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 240,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: ink.muted,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    No priority breakdown available.
                  </Box>
                )}
              </ChartCard>
            </Grid>

            {stats.activity && stats.activity.length > 0 && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: alpha('#0f172a', 0.06),
                    background: '#fff',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <Typography
                    sx={{ fontSize: 17, fontWeight: 700, color: ink.main, mb: 0.5, letterSpacing: '-0.02em' }}
                  >
                    Recent activity
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: ink.muted, mb: 2.5 }}>
                    Latest updates from your workspace
                  </Typography>
                  <Box
                    sx={{
                      pl: { xs: 0, sm: 1 },
                      borderLeft: { xs: 'none', sm: `2px solid ${alpha(brand.main, 0.15)}` },
                      ml: { sm: 1 },
                    }}
                  >
                    {stats.activity.slice(0, 10).map((log, idx, arr) => (
                      <Box
                        key={log.id}
                        onClick={() => onActivityClick(log)}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          py: 1.75,
                          borderBottom: idx < arr.length - 1 ? `1px solid ${alpha('#0f172a', 0.06)}` : 'none',
                          cursor: log.issueId ? 'pointer' : 'default',
                          transition: 'background 0.15s',
                          borderRadius: 1,
                          mx: -1,
                          px: 1,
                          '&:hover': log.issueId
                            ? { bgcolor: alpha(brand.main, 0.04) }
                            : {},
                        }}
                      >
                        <Box sx={{ pt: 0.25, flexShrink: 0 }}>{activityIcon(log.type)}</Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 14, color: ink.main, fontWeight: 500, lineHeight: 1.45 }}>
                            {log.message}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: ink.muted, mt: 0.35 }}>
                            {formatActivityWhen(log.createdAt)}
                            {log.issueId ? ' · View issue' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: brand.main }} />
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
