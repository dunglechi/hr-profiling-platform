import React, { useState } from 'react';
import { Box, Container, CssBaseline, ThemeProvider, createTheme, Alert } from '@mui/material';
import SimpleEnhancedForm from './SimpleEnhancedForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#9C27B0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const SimpleTestApp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = async (fullName: string, birthDate: Date) => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setResult(`✅ Phân tích hoàn thành cho ${fullName} - Ngày sinh: ${birthDate.toLocaleDateString('vi-VN')}`);
    } catch (err) {
      setError('Có lỗi xảy ra khi phân tích. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4
      }}>
        <Container maxWidth="lg">
          <SimpleEnhancedForm
            onCalculate={handleCalculate}
            loading={loading}
            error={error}
          />
          
          {result && (
            <Box sx={{ mt: 4 }}>
              <Alert severity="success" sx={{ borderRadius: 2, fontSize: '1.1rem' }}>
                {result}
              </Alert>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default SimpleTestApp;