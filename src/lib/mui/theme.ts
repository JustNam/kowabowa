import { createTheme } from '@mui/material/styles'

/**
 * Project palette, sourced from the design export — see ARCHITECTURE.md#styling.
 * Only the tokens with clear project-specific values are set; everything
 * else falls back to MUI's defaults.
 */
export const theme = createTheme({
  palette: {
    primary: { main: '#3A3A3A' },
    error: { main: '#B42318' },
    text: { primary: '#1B1D22', secondary: '#4A4D55' },
    background: { default: '#F5F5F5', paper: '#FFFFFF' },
    divider: '#E0E0E0',
  },
  shape: {
    borderRadius: 8,
  },
})
