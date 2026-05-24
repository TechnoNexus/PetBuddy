import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#7c3aed', // Deep Purple
      light: '#8b5cf6',
      dark: '#6d28d9',
    },
    secondary: {
      main: '#f43f5e', // Vibrant Coral
      light: '#fb7185',
      dark: '#e11d48',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#334155',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600, fontSize: '2.5rem' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '0.6rem 1.5rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
  },
});
