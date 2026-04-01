import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NewIssueModal from '@features/issues/components/NewIssueModal';

// ── Custom DOM event — issue listing pages listen to this to auto-refresh ──
// Exported so AllIssuesPage and MyIssuesPage can subscribe without prop-drilling.
export const ISSUE_CREATED_EVENT = 'vthink:issue-created';

const MainLayout: React.FC = () => {
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  // Called by NewIssueModal after user clicks OK on the success dialog
  const handleIssueCreated = useCallback(() => {
    // Fire custom event — AllIssuesPage & MyIssuesPage listen and reload their data
    window.dispatchEvent(new CustomEvent(ISSUE_CREATED_EVENT));

    // If user is NOT already on an issues page, navigate there so they see the new entry
    const onIssuesPage =
      location.pathname === '/issues' ||
      location.pathname === '/my-issues';

    if (!onIssuesPage) {
      navigate('/issues');
    }
  }, [navigate, location.pathname]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#EBE8FC' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onNewIssue={() => setNewIssueOpen(true)} />
        <Box component="main" sx={{ flex: 1, p: 3.5, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>

      <NewIssueModal
        open={newIssueOpen}
        onClose={() => setNewIssueOpen(false)}
        onCreated={handleIssueCreated}
      />
    </Box>
  );
};

export default MainLayout;
