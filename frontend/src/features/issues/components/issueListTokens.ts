/** Jira-inspired palette for issue listing tables (reference: #172B4D text, #0052CC links, #DEEBFF row hover). */
export const issueListColors = {
  text: '#172B4D',
  textSecondary: '#6B778C',
  link: '#0052CC',
  rowHover: '#DEEBFF',
  border: '#DFE1E6',
  filterBarBg: '#F4F5F7',
  headerBg: '#FFFFFF',
  tableBg: '#FFFFFF',
} as const;

export const filterBarPaperSx = {
  p: 1.5,
  mb: 2,
  bgcolor: issueListColors.filterBarBg,
  border: `1px solid ${issueListColors.border}`,
  borderRadius: 1,
  boxShadow: 'none',
} as const;

export const tableSurfacePaperSx = {
  border: `1px solid ${issueListColors.border}`,
  borderRadius: 1,
  boxShadow: '0 1px 1px rgba(9, 30, 66, 0.13)',
  overflow: 'hidden',
  bgcolor: issueListColors.tableBg,
} as const;

/** TableHead — Jira-style column labels (sentence case, gray, no vertical rules). */
export const listTableHeadSx = {
  '& .MuiTableCell-head': {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: issueListColors.textSecondary,
    textTransform: 'none' as const,
    letterSpacing: '0',
    py: 1.5,
    px: 2,
    borderBottom: `1px solid ${issueListColors.border}`,
    bgcolor: issueListColors.headerBg,
    whiteSpace: 'nowrap' as const,
  },
};

const listTableBodyCellBase = {
  fontSize: '0.875rem',
  color: issueListColors.text,
  py: 2,
  px: 2,
  borderBottom: `1px solid ${issueListColors.border}`,
  borderLeft: 'none',
  borderRight: 'none',
  verticalAlign: 'middle' as const,
};

/** TableBody row — airy padding, Jira blue hover (cell-level so theme `td:hover` does not win). */
export const listTableBodyRowSx = {
  '& .MuiTableCell-body': { ...listTableBodyCellBase },
  '&:hover .MuiTableCell-body': {
    bgcolor: issueListColors.rowHover,
  },
};

export const listTableOverdueRowSx = {
  '& .MuiTableCell-body': {
    ...listTableBodyCellBase,
    bgcolor: 'rgba(255, 171, 0, 0.08)',
  },
  '&:hover .MuiTableCell-body': {
    bgcolor: 'rgba(255, 171, 0, 0.14)',
  },
};
