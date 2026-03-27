import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, ListItemButton, ListItemIcon, ListItemText,
  Typography, Collapse, Tooltip,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '@store/useAuth';

const SB_EXPANDED = 260;
const SB_COLLAPSED = 64;

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: { label: string; path: string; icon: React.ReactNode }[];
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Platform',
    icon: <></>,
    children: [
      { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Tracking',
    icon: <></>,
    children: [
      { label: 'Issue Tracking', path: '__group__', icon: <BugReportOutlinedIcon fontSize="small" /> },
      { label: 'All Issues', path: '/issues', icon: <FormatListBulletedIcon fontSize="small" /> },
      { label: 'My Issues', path: '/my-issues', icon: <PersonOutlineIcon fontSize="small" /> },
      { label: 'Project Tracking', path: '/project-tracking', icon: <FolderOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Administration',
    icon: <></>,
    adminOnly: true,
    children: [
      { label: 'Project Setup', path: '/project-setup', icon: <SettingsOutlinedIcon fontSize="small" /> },
      { label: 'Employee Setup', path: '/employee-setup', icon: <PeopleOutlineIcon fontSize="small" /> },
      { label: 'User Management', path: '/user-management', icon: <ShieldOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Account',
    icon: <></>,
    children: [
      { label: 'Change Password', path: '/change-password', icon: <LockOutlinedIcon fontSize="small" /> },
    ],
  },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [issueGroupOpen, setIssueGroupOpen] = useState(true);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Manager';
  const isActive = (path: string) => location.pathname === path;

  const sbWidth = collapsed ? SB_COLLAPSED : SB_EXPANDED;

  const avatarColor = ['#4F38F6','#16A34A','#F59E0B','#DC2626','#7C3AED'][
    (user?.name?.charCodeAt(0) ?? 0) % 5
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sbWidth,
        flexShrink: 0,
        transition: 'width 250ms ease',
        '& .MuiDrawer-paper': {
          width: sbWidth,
          overflowX: 'hidden',
          transition: 'width 250ms ease',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #E5E7EB',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{
        px: collapsed ? 1 : 2, py: 2.5,
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 64, flexShrink: 0,
      }}>
        {!collapsed && (
          <Box>
            <Typography component="div" sx={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#4F38F6' }}>v</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#07003C' }}>Think</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>*</span>
              <sup style={{ fontSize: 9, color: '#6B6B8A', marginLeft: 1 }}>®</sup>
            </Typography>
            <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#6B6B8A', mt: 0.25 }}>
              Project & Issue Tracker
            </Typography>
          </Box>
        )}
        {collapsed && (
          <Typography component="div" sx={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#4F38F6' }}>v</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>*</span>
          </Typography>
        )}
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, px: 1 }}>
        {NAV_ITEMS.map((group) => {
          if (group.adminOnly && !isAdmin) return null;
          return (
            <Box key={group.label} sx={{ mb: 0.5 }}>
              {!collapsed && (
                <Typography sx={{
                  fontSize: 10, fontWeight: 700, color: '#6B6B8A',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  px: 1.5, pt: 2, pb: 0.5, display: 'block',
                }}>
                  {group.label}
                </Typography>
              )}

              {group.children?.map((item) => {
                if (item.path === '__group__') {
                  // Issue Tracking expandable group
                  if (collapsed) return null;
                  return (
                    <ListItemButton
                      key={item.label}
                      onClick={() => setIssueGroupOpen((o) => !o)}
                      sx={{
                        borderRadius: 1.25, px: 1.5, py: 1.1, mb: 0.25,
                        '&:hover': { bgcolor: '#F9FAFB' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: '#6B6B8A' }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: 13.5, fontWeight: 500, color: '#6B6B8A' }}
                      />
                      {issueGroupOpen ? <ExpandLessIcon sx={{ fontSize: 16, color: '#6B6B8A' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: '#6B6B8A' }} />}
                    </ListItemButton>
                  );
                }

                // Sub-items under Issue Tracking
                const isSubItem = ['/issues', '/my-issues'].includes(item.path);
                if (isSubItem && !collapsed) {
                  return (
                    <Collapse key={item.path} in={issueGroupOpen} timeout="auto" unmountOnExit>
                      <NavItemButton item={item} active={isActive(item.path)} collapsed={collapsed} indent navigate={navigate} />
                    </Collapse>
                  );
                }

                return (
                  <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
                    <span>
                      <NavItemButton item={item} active={isActive(item.path)} collapsed={collapsed} navigate={navigate} />
                    </span>
                  </Tooltip>
                );
              })}
            </Box>
          );
        })}
      </Box>

      {/* Bottom — user + logout + collapse */}
      <Box sx={{ borderTop: '1px solid #E5E7EB', p: 1, flexShrink: 0 }}>
        {/* User */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.25,
          px: 1.5, py: 1, borderRadius: 1.25,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '50%',
            background: avatarColor, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Box>
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#07003C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#6B6B8A' }}>{user?.role}</Typography>
            </Box>
          )}
        </Box>

        {/* Logout */}
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
          <ListItemButton
            onClick={logout}
            sx={{ borderRadius: 1.25, px: 1.5, py: 1, mb: 0.25, color: '#DC2626', justifyContent: collapsed ? 'center' : 'flex-start', '&:hover': { bgcolor: '#fef2f2' } }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 32, color: '#DC2626' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: '#DC2626' }} />}
          </ListItemButton>
        </Tooltip>

        {/* Collapse toggle */}
        <ListItemButton
          onClick={() => setCollapsed((c) => !c)}
          sx={{ borderRadius: 1.25, px: 1.5, py: 1, color: '#6B6B8A', justifyContent: collapsed ? 'center' : 'flex-start', '&:hover': { bgcolor: '#F9FAFB' } }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 32, color: '#6B6B8A' }}>
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Collapse" primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} />}
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

interface NavItemButtonProps {
  item: { label: string; path: string; icon: React.ReactNode };
  active: boolean;
  collapsed: boolean;
  indent?: boolean;
  navigate: (path: string) => void;
}

const NavItemButton: React.FC<NavItemButtonProps> = ({ item, active, collapsed, indent = false, navigate }) => (
  <ListItemButton
    onClick={() => navigate(item.path)}
    sx={{
      borderRadius: 1.25,
      px: collapsed ? 1 : indent ? 2 : 1.5,
      py: 1.1,
      mb: 0.25,
      ml: indent && !collapsed ? 1.5 : 0,
      justifyContent: collapsed ? 'center' : 'flex-start',
      bgcolor: active ? '#EBE8FC' : 'transparent',
      borderLeft: active ? '3px solid #4F38F6' : '3px solid transparent',
      '&:hover': { bgcolor: active ? '#EBE8FC' : '#F9FAFB' },
    }}
  >
    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 32, color: active ? '#4F38F6' : '#6B6B8A' }}>
      {item.icon}
    </ListItemIcon>
    {!collapsed && (
      <ListItemText
        primary={item.label}
        primaryTypographyProps={{
          fontSize: 13.5,
          fontWeight: active ? 600 : 500,
          color: active ? '#4F38F6' : '#6B6B8A',
        }}
      />
    )}
  </ListItemButton>
);

export default Sidebar;
