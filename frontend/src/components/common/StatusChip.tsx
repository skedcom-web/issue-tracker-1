import React from 'react';
import { Chip } from '@mui/material';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Open:       { bg: '#fef9c3', color: '#854d0e' },
  InProgress: { bg: '#EBE8FC', color: '#4F38F6' },
  InReview:   { bg: '#faf5ff', color: '#7c3aed' },
  Resolved:   { bg: '#f0fdf4', color: '#16A34A' },
  Closed:     { bg: '#F3F4F6', color: '#6B6B8A' },
  Reopened:   { bg: '#fef2f2', color: '#DC2626' },
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  Critical: { bg: '#fef2f2', color: '#DC2626' },
  High:     { bg: '#fff7ed', color: '#F97316' },
  Medium:   { bg: '#fef9c3', color: '#854d0e' },
  Low:      { bg: '#F3F4F6', color: '#6B6B8A' },
};

const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  Critical: { bg: '#fef2f2', color: '#DC2626' },
  Blocker:  { bg: '#fff7ed', color: '#F97316' },
  Major:    { bg: '#fef9c3', color: '#854d0e' },
  Minor:    { bg: '#F3F4F6', color: '#6B6B8A' },
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Bug:            { bg: '#fef2f2', color: '#DC2626' },
  Task:           { bg: '#EBE8FC', color: '#4F38F6' },
  FeatureRequest: { bg: '#f0fdf4', color: '#16A34A' },
  Improvement:    { bg: '#faf5ff', color: '#7c3aed' },
};

const TYPE_LABELS: Record<string, string> = {
  Bug: '🐛 Bug',
  Task: '✅ Task',
  FeatureRequest: '⭐ Feature Request',
  Improvement: '🔧 Improvement',
};

const STATUS_LABELS: Record<string, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  InReview: 'In Review',
  Resolved: 'Resolved',
  Closed: 'Closed',
  Reopened: 'Reopened',
};

interface StatusChipProps {
  type: 'status' | 'priority' | 'severity' | 'type';
  value: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ type, value }) => {
  const map = type === 'status' ? STATUS_COLORS
    : type === 'priority' ? PRIORITY_COLORS
    : type === 'severity' ? SEVERITY_COLORS
    : TYPE_COLORS;

  const colors = map[value] ?? { bg: '#F3F4F6', color: '#6B6B8A' };
  const label = type === 'type' ? TYPE_LABELS[value] ?? value
    : type === 'status' ? STATUS_LABELS[value] ?? value
    : value;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: 11,
        height: 22,
        borderRadius: '99px',
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
};

export default StatusChip;
