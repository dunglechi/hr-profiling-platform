import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Box,
  Typography,
  Button
} from '@mui/material';
import {
  Close,
  Error as ErrorIcon,
  Warning,
  Info,
  CheckCircle,
  Refresh
} from '@mui/icons-material';

export type NotificationSeverity = 'error' | 'warning' | 'info' | 'success';

export interface Notification {
  id: string;
  message: string;
  severity: NotificationSeverity;
  title?: string;
  autoHideDuration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  clearNotifications: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useNotification must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      autoHideDuration: notification.autoHideDuration ?? (notification.severity === 'error' ? 6000 : 4000)
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const showError = (message: string, title?: string) => {
    showNotification({
      message,
      title: title || 'Lỗi',
      severity: 'error',
      persistent: true,
      action: {
        label: 'Thử lại',
        onClick: () => window.location.reload()
      }
    });
  };

  const showSuccess = (message: string, title?: string) => {
    showNotification({
      message,
      title: title || 'Thành công',
      severity: 'success'
    });
  };

  const showWarning = (message: string, title?: string) => {
    showNotification({
      message,
      title: title || 'Cảnh báo',
      severity: 'warning'
    });
  };

  const showInfo = (message: string, title?: string) => {
    showNotification({
      message,
      title: title || 'Thông tin',
      severity: 'info'
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleClose = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <Warning />;
      case 'success':
        return <CheckCircle />;
      case 'info':
      default:
        return <Info />;
    }
  };

  return (
    <ErrorContext.Provider
      value={{
        showNotification,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        clearNotifications
      }}
    >
      {children}
      
      {/* Render notifications */}
      <Box sx={{ position: 'fixed', top: 80, right: 16, zIndex: 9999 }}>
        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={true}
            autoHideDuration={notification.persistent ? null : notification.autoHideDuration}
            onClose={() => handleClose(notification.id)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ position: 'relative', mb: 1 }}
          >
            <Alert
              severity={notification.severity}
              onClose={() => handleClose(notification.id)}
              variant="filled"
              icon={getIcon(notification.severity)}
              action={
                <Box display="flex" alignItems="center" gap={1}>
                  {notification.action && (
                    <Button
                      color="inherit"
                      size="small"
                      startIcon={<Refresh />}
                      onClick={notification.action.onClick}
                      sx={{ mr: 1 }}
                    >
                      {notification.action.label}
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => handleClose(notification.id)}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{
                minWidth: 350,
                boxShadow: 3,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              {notification.title && (
                <AlertTitle>{notification.title}</AlertTitle>
              )}
              <Typography variant="body2">
                {notification.message}
              </Typography>
            </Alert>
          </Snackbar>
        ))}
      </Box>
    </ErrorContext.Provider>
  );
};