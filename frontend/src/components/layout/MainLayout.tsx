import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NewIssueModal from '@features/issues/components/NewIssueModal';

const MainLayout: React.FC = () => {
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#EBE8FC' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onNewIssue={() => setNewIssueOpen(true)} />
        <Box component="main" sx={{ flex: 1, p: 3.5, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
      <NewIssueModal open={newIssueOpen} onClose={() => setNewIssueOpen(false)} />
    </Box>
  );
};

export default MainLayout;
