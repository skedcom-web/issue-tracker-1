import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface State { hasError: boolean; error: string }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 2, p: 4 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ErrorOutlineIcon sx={{ color: '#DC2626', fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#07003C' }}>Something went wrong</Typography>
          <Typography sx={{ fontSize: 13, color: '#6B6B8A', textAlign: 'center', maxWidth: 400 }}>
            {this.state.error || 'An unexpected error occurred loading this page.'}
          </Typography>
          <Button variant="outlined" onClick={() => this.setState({ hasError: false, error: '' })}>
            Try Again
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
