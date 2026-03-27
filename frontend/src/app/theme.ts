import { createTheme } from '@mui/material/styles';

const OMS_PRIMARY = '#4F38F6';
const OMS_PRIMARY_DARK = '#3B24E0';
const OMS_TEXT_1 = '#07003C';
const OMS_TEXT_2 = '#6B6B8A';
const OMS_BG = '#EBE8FC';
const OMS_WHITE = '#FFFFFF';
const OMS_GRAY_100 = '#F3F4F6';
const OMS_GRAY_200 = '#E5E7EB';

export const theme = createTheme({
  palette: {
    primary: {
      main: OMS_PRIMARY,
      dark: OMS_PRIMARY_DARK,
      contrastText: '#fff',
    },
    background: {
      default: OMS_BG,
      paper: OMS_WHITE,
    },
    text: {
      primary: OMS_TEXT_1,
      secondary: OMS_TEXT_2,
    },
    divider: OMS_GRAY_200,
    error: { main: '#DC2626' },
    warning: { main: '#F59E0B' },
    success: { main: '#16A34A' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    h1: { fontSize: '1.75rem', fontWeight: 700, color: OMS_TEXT_1 },
    h2: { fontSize: '1.4rem', fontWeight: 700, color: OMS_TEXT_1 },
    h3: { fontSize: '1.2rem', fontWeight: 600, color: OMS_TEXT_1 },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8rem', color: OMS_TEXT_2 },
    caption: { fontSize: '0.75rem', color: OMS_TEXT_2 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          borderRadius: 10,
          padding: '7px 16px',
        },
        containedPrimary: {
          background: OMS_PRIMARY,
          '&:hover': { background: OMS_PRIMARY_DARK },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgba(79,56,246,.08), 0 1px 2px -1px rgba(79,56,246,.04)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& th': {
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: OMS_TEXT_2,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '10px 16px',
            borderBottom: `1px solid ${OMS_GRAY_200}`,
            background: OMS_WHITE,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover td': { background: OMS_GRAY_100 },
          cursor: 'pointer',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          fontSize: '0.8125rem',
          borderBottom: `1px solid ${OMS_GRAY_100}`,
        },
      },
    },
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
    MuiInputBase: {
      styleOverrides: {
        root: { fontSize: '0.875rem' },
        input: {
          '&::placeholder': {
            color: '#B0B7C3',
            opacity: 1,
            fontStyle: 'italic',
            fontSize: '0.8125rem',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: OMS_TEXT_2,
          '&.Mui-focused': { color: OMS_PRIMARY, fontWeight: 600 },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { fontSize: '0.6875rem', marginTop: 3 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: OMS_WHITE,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: OMS_PRIMARY,
          },
        },
        notchedOutline: { borderColor: OMS_GRAY_200 },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { fontSize: '0.8125rem' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: OMS_WHITE,
          borderRight: `1px solid ${OMS_GRAY_200}`,
          boxShadow: 'none',
        },
      },
    },
  },
});
