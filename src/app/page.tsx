'use client';

import dynamic from 'next/dynamic';
import { Button, Typography, Box } from '@mui/material';

const EChartsClient = dynamic(() => import('../components/EChartsClient'), {
  ssr: false,
});


export default function Home() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Hello MUI</Typography>
      <Button variant="contained" color="primary">Click Me</Button>
    </Box>
  );
}
