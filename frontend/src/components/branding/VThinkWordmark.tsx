import React from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';

export type VThinkWordmarkSize = 'lg' | 'md' | 'sm' | 'xs';

const SIZE_MAP: Record<
  VThinkWordmarkSize,
  { fs: number; regSize: number; regRaise: number }
> = {
  lg: { fs: 28, regSize: 13, regRaise: -12 },
  md: { fs: 26, regSize: 12, regRaise: -10 },
  sm: { fs: 22, regSize: 11, regRaise: -9 },
  xs: { fs: 14, regSize: 9, regRaise: -6 },
};

export interface VThinkWordmarkProps {
  size?: VThinkWordmarkSize;
  /** Light rounded panel (e.g. login hero on purple). */
  pill?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Official-style wordmark: orange-red v, navy Think, ® superscript (raised, readable size).
 */
const VThinkWordmark: React.FC<VThinkWordmarkProps> = ({
  size = 'md',
  pill = false,
  sx,
}) => {
  const { fs, regSize, regRaise } = SIZE_MAP[size];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        fontFamily: '"Inter", system-ui, sans-serif',
        ...(pill
          ? {
              bgcolor: 'rgba(255,255,255,0.96)',
              borderRadius: 2,
              px: 2.5,
              py: 1.5,
              boxShadow: '0 1px 3px rgba(0,0,0,.08)',
            }
          : {}),
        ...sx,
      }}
    >
      <Typography component="span" sx={{ fontSize: fs, fontWeight: 800, color: '#E6392E', lineHeight: 1 }}>
        v
      </Typography>
      <Typography component="span" sx={{ fontSize: fs, fontWeight: 800, color: '#0F2749', lineHeight: 1 }}>
        Think
      </Typography>
      <Box
        component="span"
        aria-hidden
        sx={{
          fontSize: regSize,
          fontWeight: 700,
          color: '#0F2749',
          lineHeight: 1,
          position: 'relative',
          top: regRaise,
          ml: '3px',
          display: 'inline-block',
        }}
      >
        ®
      </Box>
    </Box>
  );
};

export default VThinkWordmark;
