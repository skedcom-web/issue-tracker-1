import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PageHeader from '@components/common/PageHeader';

const ProjectTrackingPage: React.FC = () => (
  <Box>
    <PageHeader breadcrumbs={['Tracking', 'Project Tracking']} title="Project Tracking" />
    <Paper sx={{ borderRadius: 3, p: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#EBE8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
        <RocketLaunchIcon sx={{ fontSize: 32, color: '#4F38F6' }} />
      </Box>
      <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#07003C', mb: 1 }}>Project Tracking</Typography>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: '#EBE8FC', color: '#4F38F6', px: 2, py: 0.5, borderRadius: 99, fontSize: 12, fontWeight: 700, mb: 2 }}>
        🚀 Coming Soon
      </Box>
      <Typography sx={{ fontSize: 14, color: '#6B6B8A', maxWidth: 440, lineHeight: 1.7, mb: 1 }}>
        Full agile project tracking with Epics, User Stories, Tasks, Sprints and Kanban board is currently under development.
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#6B6B8A', maxWidth: 400, lineHeight: 1.6 }}>
        This will include Sprint planning, Burn-down charts, Velocity tracking and full project lifecycle from initiation to closure.
      </Typography>
    </Paper>
  </Box>
);

export default ProjectTrackingPage;
