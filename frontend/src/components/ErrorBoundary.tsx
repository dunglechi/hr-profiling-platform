import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Filter out browser extension errors
    if (
      error.message.includes('runtime.lastError') ||
      error.message.includes('Receiving end does not exist') ||
      error.message.includes('Could not establish connection')
    ) {
      // Don't show error boundary for extension errors
      this.setState({ hasError: false });
      return;
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              🚨 Đã Xảy Ra Lỗi
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
            </Typography>
            {this.state.error && (
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                {this.state.error.message}
              </Typography>
            )}
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={this.handleReset}>
              🔄 Thử Lại
            </Button>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              🏠 Tải Lại Trang
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;