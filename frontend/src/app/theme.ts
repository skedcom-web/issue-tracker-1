import { createTheme } from '@mui/material/styles';

// ── Brand colours (unchanged) ──────────────────────────────────────
const PRIMARY      = '#4F38F6';
const PRIMARY_DARK = '#3B24E0';
const TEXT_DARK    = '#07003C';   // headings, field values
const TEXT_MID     = '#374151';   // field values, body text
const TEXT_MUTED   = '#6B7280';   // secondary data (email, dates in lists)
const TEXT_HINT    = '#9CA3AF';   // hint text — clearly softest
const BG_PAGE      = '#EBE8FC';   // page background (your brand lavender)
const WHITE        = '#FFFFFF';
const GRAY_50      = '#F9FAFB';
const GRAY_100     = '#F3F4F6';
const GRAY_200     = '#E5E7EB';
const GRAY_300     = '#D1D5DB';

export const theme = createTheme({
  palette: {
    primary:    { main: PRIMARY, dark: PRIMARY_DARK, contrastText: '#fff' },
    background: { default: BG_PAGE, paper: WHITE },
    text:       { primary: TEXT_DARK, secondary: TEXT_MUTED },
    divider:    GRAY_200,
    error:      { main: '#DC2626' },
    warning:    { main: '#F59E0B' },
    success:    { main: '#16A34A' },
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    h1: { fontSize: '1.5rem',   fontWeight: 800, color: TEXT_DARK, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.25rem',  fontWeight: 700, color: TEXT_DARK },
    h3: { fontSize: '1.05rem',  fontWeight: 700, color: TEXT_DARK },
    body1: { fontSize: '0.875rem', lineHeight: 1.6, color: TEXT_DARK },
    body2: { fontSize: '0.8rem',   color: TEXT_MUTED, lineHeight: 1.5 },
    caption: { fontSize: '0.6875rem', color: TEXT_HINT },
  },

  shape: { borderRadius: 8 },

  components: {
    // ── Buttons ────────────────────────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          borderRadius: 8,
          padding: '7px 18px',
        },
        containedPrimary: {
          background: PRIMARY,
          '&:hover': { background: PRIMARY_DARK },
        },
      },
    },

    // ── Paper ─────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        },
      },
    },

    // ── Tables ────────────────────────────────────────────────────
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& th': {
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: TEXT_MUTED,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '10px 16px',
            borderBottom: `1px solid ${GRAY_200}`,
            background: WHITE,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover td': { background: GRAY_50 },
          cursor: 'pointer',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '11px 16px',
          fontSize: '0.8125rem',
          color: TEXT_DARK,
          borderBottom: `1px solid ${GRAY_100}`,
        },
      },
    },

    // ── Chips ─────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.6875rem',
          fontWeight: 600,
          height: 22,
          borderRadius: 99,
        },
      },
    },

    // ── Input BASE ── the value the user types ─────────────────────
    // Bold enough to be clearly "primary" content vs label
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 400,
          color: TEXT_DARK,
        },
        input: {
          padding: '9px 12px',
          '&::placeholder': {
            color: TEXT_HINT,
            opacity: 1,
            fontStyle: 'italic',
            fontSize: '0.8125rem',
          },
        },
      },
    },

    // ── Floating MUI label ──────────────────────────────────────
    // IMPORTANT: In this design labels sit ABOVE fields (shrink always true).
    // We keep InputLabel but style it to look like the reference — bold, dark,
    // positioned above, NOT floating inside the box.
    MuiInputLabel: {
      defaultProps: { shrink: true },
      styleOverrides: {
        root: {
          // Position: static above the field (not floating inside)
          position: 'static',
          transform: 'none',
          fontSize: '0.8125rem',   // 13px
          fontWeight: 600,
          color: TEXT_MID,         // dark grey — clearly a label
          letterSpacing: 0,
          marginBottom: '6px',
          lineHeight: 1.4,
          '&.Mui-focused': { color: TEXT_MID },
          // Required asterisk — red like reference
          '& .MuiFormLabel-asterisk': { color: '#DC2626' },
        },
      },
    },

    // ── Outlined input wrapper ─────────────────────────────────────
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: WHITE,
          // Adjust notch — since label is above, no notch cut needed
          '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' },
          '& .MuiOutlinedInput-notchedOutline': { top: 0 },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: GRAY_300 },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: PRIMARY,
            borderWidth: '1.5px',
          },
        },
        notchedOutline: { borderColor: GRAY_200 },
        input: { padding: '9px 12px' },
      },
    },

    // ── Select ────────────────────────────────────────────────────
    MuiSelect: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: TEXT_DARK,
        },
        select: {
          padding: '9px 12px',
          // Empty (placeholder) state — italic hint grey
          '&[data-value=""]': {
            color: TEXT_HINT,
            fontStyle: 'italic',
          },
        },
      },
    },

    // ── FormControl — give it top margin so stacked fields breathe ─
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root + .MuiOutlinedInput-root': {
            marginTop: 0,
          },
        },
      },
    },

    // ── Helper text ─ clearly softest text in the form ─────────────
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '0.6875rem',
          fontStyle: 'italic',
          color: TEXT_HINT,
          marginTop: '4px',
          marginLeft: 0,
        },
      },
    },

    // ── Dialog ────────────────────────────────────────────────────
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          fontWeight: 700,
          color: TEXT_DARK,
        },
      },
    },

    // ── Drawer ────────────────────────────────────────────────────
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: WHITE,
          borderRight: `1px solid ${GRAY_200}`,
          boxShadow: 'none',
        },
      },
    },
  },
});
