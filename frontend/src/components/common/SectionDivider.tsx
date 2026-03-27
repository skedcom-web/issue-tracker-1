import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** Accent colour for the left bar. Defaults to primary indigo. */
  color?: string;
}

/**
 * A clearly styled section divider for forms.
 * Renders as a coloured left-bar + bold heading so it can NEVER be
 * mistaken for a form field or placeholder.
 */
const SectionDivider: React.FC<Props> = ({
  title, subtitle, icon, color = '#4F38F6',
}) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1.25,
    mt: 1,
    mb: 2,
    pt: 1.5,
    borderTop: '1px solid #F3F4F6',
  }}>
    {/* Accent bar */}
    <Box sx={{
      width: 4,
      minHeight: 20,
      borderRadius: 99,
      bgcolor: color,
      flexShrink: 0,
      mt: 0.25,
    }} />

    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {icon && <Box sx={{ color, display: 'flex', alignItems: 'center', fontSize: 15 }}>{icon}</Box>}
        <Typography sx={{
          fontSize: 12,
          fontWeight: 800,
          color: '#07003C',
          letterSpacing: '0.04em',
          lineHeight: 1,
        }}>
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography sx={{ fontSize: 11, color: '#9CA3AF', mt: 0.4, lineHeight: 1.4 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

export default SectionDivider;
