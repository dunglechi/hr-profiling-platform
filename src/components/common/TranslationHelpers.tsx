import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface TranslationLoadingProps {
  message?: string;
}

export const TranslationLoading: React.FC<TranslationLoadingProps> = ({ 
  message = 'Đang tải ngôn ngữ...' 
}) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="200px"
      gap={2}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

interface TranslationErrorProps {
  error?: string;
  retry?: () => void;
}

export const TranslationError: React.FC<TranslationErrorProps> = ({ 
  error = 'Lỗi tải ngôn ngữ',
  retry 
}) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="200px"
      gap={2}
      p={3}
    >
      <Typography variant="h6" color="error" gutterBottom>
        ⚠️ {error}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Không thể tải nội dung ngôn ngữ. Vui lòng thử lại.
      </Typography>
      {retry && (
        <button 
          onClick={retry}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            background: '#2196F3',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Thử lại
        </button>
      )}
    </Box>
  );
};