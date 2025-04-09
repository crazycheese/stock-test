'use client';

import { Button, Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Hello MUI</Typography>
      <Button variant="contained" color="primary">Click Me</Button>
    </Box>
  );
}
