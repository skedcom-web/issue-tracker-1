import React from 'react';
import { Box, Avatar, Tooltip } from '@mui/material';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { issueListColors } from './issueListTokens';

const TYPE_STYLE: Record<
  string,
  { bg: string; Icon: React.ElementType }
> = {
  Bug: { bg: '#DE350B', Icon: BugReportOutlinedIcon },
  Task: { bg: '#0052CC', Icon: CheckOutlinedIcon },
  FeatureRequest: { bg: '#6554C0', Icon: StarOutlineOutlinedIcon },
  Improvement: { bg: '#36B37E', Icon: TrendingUpOutlinedIcon },
};

/** Small Jira-style type glyph (colored tile + white icon). */
export const IssueTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  const meta = TYPE_STYLE[type] ?? { bg: '#6B778C', Icon: CheckOutlinedIcon };
  const { bg, Icon } = meta;
  return (
    <Tooltip title={type === 'FeatureRequest' ? 'Feature Request' : type} placement="top" arrow>
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '4px',
          bgcolor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 14, color: '#fff' }} />
      </Box>
    </Tooltip>
  );
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Avatar + name, Jira-style assignee/reporter column. */
export const PersonCell: React.FC<{ name: string; kind?: 'assignee' | 'reporter' }> = ({
  name,
  kind = 'reporter',
}) => {
  const display = name?.trim() && name !== '—' ? name : '—';
  if (display === '—') {
    const emptyLabel = kind === 'assignee' ? 'Unassigned' : '—';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar
          sx={{
            width: 28,
            height: 28,
            fontSize: '0.65rem',
            bgcolor: '#DFE1E6',
            color: issueListColors.textSecondary,
          }}
        >
          {kind === 'assignee' ? '?' : '—'}
        </Avatar>
        <Box component="span" sx={{ color: issueListColors.textSecondary, fontSize: '0.875rem' }}>
          {emptyLabel}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Avatar
        sx={{
          width: 28,
          height: 28,
          fontSize: '0.65rem',
          fontWeight: 600,
          bgcolor: '#DFE1E6',
          color: '#42526E',
        }}
      >
        {initials(display)}
      </Avatar>
      <Box
        component="span"
        sx={{
          color: issueListColors.text,
          fontSize: '0.875rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {display}
      </Box>
    </Box>
  );
};

/** Monospace issue key (Jira “Key” column). */
export const IssueKeyCell: React.FC<{ defectNo: string }> = ({ defectNo }) => (
  <Box
    component="span"
    sx={{
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: issueListColors.text,
      letterSpacing: '0.02em',
    }}
  >
    {defectNo}
  </Box>
);

/** Blue summary text (clickable row still navigates). */
export const IssueSummaryCell: React.FC<{ title: string }> = ({ title }) => (
  <Box
    component="span"
    sx={{
      color: issueListColors.link,
      fontWeight: 400,
      fontSize: '0.875rem',
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: 420,
    }}
  >
    {title}
  </Box>
);
