import { createTheme, type PaletteMode } from '@mui/material/styles'

export function createMuiTheme(mode: PaletteMode) {
  const isLight = mode === 'light'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? '#15803d' : '#4ade80',
        light: '#22c55e',
        dark: '#14532d',
        contrastText: isLight ? '#ffffff' : '#0f1a14',
      },
      secondary: {
        main: isLight ? '#166534' : '#86efac',
        light: '#4ade80',
        dark: '#052e16',
        contrastText: isLight ? '#ffffff' : '#0f1a14',
      },
      error: {
        main: isLight ? '#dc2626' : '#f87171',
      },
      background: {
        default: isLight ? '#f7faf5' : '#0f1a14',
        paper: isLight ? '#ffffff' : '#162019',
      },
      text: {
        primary: isLight ? '#14532d' : '#ecfdf5',
        secondary: isLight ? '#4d7c5c' : '#86efac',
      },
      divider: isLight ? '#d1e7d5' : '#1e3a28',
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily:
        'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isLight ? '#f7faf5' : '#0f1a14',
          },
        },
      },
    },
  })
}
