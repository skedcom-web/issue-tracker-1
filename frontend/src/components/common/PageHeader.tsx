import React from 'react';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface PageHeaderProps {
  breadcrumbs: string[];
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ breadcrumbs, title, subtitle, actions }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
    <Box>
      {/* Breadcrumb trail */}
      <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 12, color: '#C4B5FD' }} />} sx={{ mb: 0.75 }}>
        {breadcrumbs.map((crumb, i) => (
          <Typography key={i} sx={{
            fontSize: 11,
            fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
            color: i === breadcrumbs.length - 1 ? '#4F38F6' : '#9CA3AF',
            textTransform: i === breadcrumbs.length - 1 ? 'none' : 'none',
          }}>
            {crumb}
          </Typography>
        ))}
      </Breadcrumbs>

      {/* Page title — large, bold, clearly a heading not a field */}
      <Typography sx={{
        fontSize: 24, fontWeight: 800, color: '#07003C', lineHeight: 1.2, letterSpacing: '-0.01em',
      }}>
        {title}
      </Typography>

      {subtitle && (
        <Typography sx={{
          fontSize: 13, color: '#9CA3AF', mt: 0.5, lineHeight: 1.5,
        }}>
          {subtitle}
        </Typography>
      )}
    </Box>

    {actions && (
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexShrink: 0, mt: 0.5 }}>
        {actions}
      </Box>
    )}
  </Box>
);

export default PageHeader;
