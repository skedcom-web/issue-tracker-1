import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, CircularProgress,
  Select, MenuItem, FormControl,
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
import { dashboardApi, projectsApi } from '@services/api';
import type { DashboardStats, Project } from '@app-types/index';
import { useAuth } from '@store/useAuth';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, iconBg }) => (
  <Paper sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F38F6' }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#07003C', lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: 13, color: '#6B6B8A' }}>{label}</Typography>
  </Paper>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] ?? 'User';

  const loadStats = async (pid?: number) => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStats(pid);
      setStats(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    projectsApi.getAll().then((r) => setProjects(r.data.data));
    loadStats();
  }, []);

  const handleProjectChange = (val: string) => {
    setSelectedProject(val);
    loadStats(val === 'All' ? undefined : Number(val));
  };

  const statCards = stats ? [
    { icon: <ComputerIcon />, value: stats.total, label: 'Total Issues', iconBg: '#EBE8FC' },
    { icon: <ErrorOutlineIcon sx={{ color: '#DC2626' }} />, value: stats.open, label: 'Open', iconBg: '#fef2f2' },
    { icon: <AccessTimeIcon sx={{ color: '#F59E0B' }} />, value: stats.inProgress, label: 'In Progress', iconBg: '#fff7ed' },
    { icon: <CheckCircleOutlineIcon sx={{ color: '#16A34A' }} />, value: stats.resolved, label: 'Resolved', iconBg: '#f0fdf4' },
    { icon: <TaskAltIcon sx={{ color: '#6B6B8A' }} />, value: stats.closed, label: 'Closed', iconBg: '#F3F4F6' },
    { icon: <ReportProblemOutlinedIcon sx={{ color: '#DC2626' }} />, value: stats.critical, label: 'Critical', iconBg: '#fef2f2' },
    { icon: <WatchLaterOutlinedIcon sx={{ color: '#F59E0B' }} />, value: stats.overdue, label: 'Overdue', iconBg: '#fff7ed' },
    { icon: <PersonOutlineIcon />, value: stats.myIssues ?? 0, label: 'My Issues', iconBg: '#EBE8FC' },
  ] : [];

  const pieData = stats ? [
    { id: 0, value: stats.open, label: 'Open', color: '#fef9c3' },
    { id: 1, value: stats.inProgress, label: 'In Progress', color: '#EBE8FC' },
    { id: 2, value: stats.resolved, label: 'Resolved', color: '#f0fdf4' },
    { id: 3, value: stats.closed, label: 'Closed', color: '#F3F4F6' },
  ] : [];

  const barData = stats ? Object.entries(stats.byPriority).map(([k, v]) => ({ priority: k, count: v })) : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#07003C' }}>
              Welcome back, {firstName}
            </Typography>
            <Box sx={{ px: 1.5, py: 0.25, bgcolor: '#EBE8FC', color: '#4F38F6', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
              {user?.role}
            </Box>
          </Box>
          <Typography sx={{ fontSize: 12, fontStyle: 'italic', color: '#9CA3AF' }}>Here&apos;s what&apos;s happening across all your projects.</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select value={selectedProject} onChange={(e) => handleProjectChange(e.target.value as string)}>
            <MenuItem value="All">All Projects</MenuItem>
            {projects.map((p) => <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statCards.map((card) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={card.label}>
                <StatCard {...card} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#07003C', mb: 0.5 }}>Issues by Status</Typography>
                <Typography sx={{ fontSize: 12, color: '#6B6B8A', mb: 2 }}>Current distribution</Typography>
                {pieData.some((d) => d.value > 0) ? (
                  <PieChart
                    series={[{ data: pieData, innerRadius: 50, outerRadius: 100, paddingAngle: 3, cornerRadius: 4 }]}
                    height={240}
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: '#6B6B8A', fontSize: 13 }}>
                    No data available
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#07003C', mb: 0.5 }}>Issues by Priority</Typography>
                <Typography sx={{ fontSize: 12, color: '#6B6B8A', mb: 2 }}>Breakdown</Typography>
                {barData.length > 0 ? (
                  <BarChart
                    dataset={barData}
                    xAxis={[{ scaleType: 'band', dataKey: 'priority' }]}
                    series={[{ dataKey: 'count', color: '#4F38F6' }]}
                    height={240}
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, color: '#6B6B8A', fontSize: 13 }}>
                    No data available
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Recent Activity */}
            {stats?.activity && stats.activity.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#07003C', mb: 2 }}>Recent Activity</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {stats.activity.slice(0, 8).map((log) => (
                      <Box key={log.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: '1px solid #F3F4F6' }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4F38F6', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 13, color: '#07003C', flex: 1 }}>{log.message}</Typography>
                        <Typography sx={{ fontSize: 11, color: '#6B6B8A', flexShrink: 0 }}>
                          {new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
