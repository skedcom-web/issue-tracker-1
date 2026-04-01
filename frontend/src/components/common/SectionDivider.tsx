import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string; // kept for API compat but ignored — plain style per design standard
}

/**
 * Section divider that matches company design standard:
 * - Title: 11px bold dark uppercase — clearly a HEADING, not a field
 * - Subtitle: 11px italic muted — clearly a HINT, never mistaken for a label
 * - No coloured accent bars — clean, minimal
 */
const SectionDivider: React.FC<Props> = ({ title, subtitle, icon }) => (
  <Box sx={{
    mt: 1.5,
    mb: 1.5,
    pt: 1.5,
    borderTop: '1px solid #E5E7EB',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      {icon && (
        <Box sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', fontSize: 14 }}>
          {icon}
        </Box>
      )}
      {/* Section title — bold, dark, uppercase = clearly a category heading */}
      <Typography sx={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#374151',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        lineHeight: 1,
      }}>
        {title}
      </Typography>
    </Box>

    {/* Subtitle — small italic grey = clearly a hint, never clickable */}
    {subtitle && (
      <Typography sx={{
        fontSize: '0.6875rem',
        fontWeight: 400,
        fontStyle: 'italic',
        color: '#9CA3AF',
        mt: 0.4,
        lineHeight: 1.4,
      }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);

export default SectionDivider;
