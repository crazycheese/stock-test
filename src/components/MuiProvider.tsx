'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from '../lib/theme';

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
