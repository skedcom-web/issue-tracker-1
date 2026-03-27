import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useLocation } from 'react-router-dom';

interface TopbarProps {
  onNewIssue?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/issues': 'All Issues',
  '/my-issues': 'My Issues',
  '/project-tracking': 'Project Tracking',
  '/project-setup': 'Project Setup',
  '/employee-setup': 'Employee Setup',
  '/user-management': 'User Management',
  '/change-password': 'Change Password',
};

const SHOW_NEW_ISSUE = ['/issues', '/my-issues'];

const Topbar: React.FC<TopbarProps> = ({ onNewIssue }) => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'vThink Tracker';
  const showNewIssue = SHOW_NEW_ISSUE.includes(location.pathname);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        color: '#6B6B8A',
        zIndex: 40,
        height: 60,
        justifyContent: 'center',
      }}
    >
      <Toolbar sx={{ minHeight: '60px !important', px: 3.5, display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#6B6B8A' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {showNewIssue && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onNewIssue}
              sx={{ fontSize: 13, fontWeight: 600, px: 2, py: 0.875 }}
            >
              New Issue
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
