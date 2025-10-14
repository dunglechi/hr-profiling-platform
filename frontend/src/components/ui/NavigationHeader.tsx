import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Psychology,
  Home,
  Assessment,
  Work
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

interface NavigationHeaderProps {
  onMenuClick?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      path: '/',
      icon: <Home />,
      label: 'Trang Chủ',
      title: 'Bảng Điều Khiển HR'
    },
    {
      path: '/numerology',
      icon: <Psychology />,
      label: 'Thần Số Học',
      title: 'Thần Số Học Nâng Cao'
    },
    {
      path: '/disc',
      icon: <Assessment />,
      label: 'DISC',
      title: 'Đánh Giá DISC'
    },
    {
      path: '/mbti',
      icon: <Work />,
      label: 'MBTI',
      title: 'Phân Loại MBTI'
    }
  ];

  const currentItem = navigationItems.find(item => item.path === location.pathname);
  const currentTitle = currentItem?.title || 'HR Profiling Platform';

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left: Logo and Title */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.1)
              }
            }}
          >
            <Psychology fontSize="large" />
          </IconButton>
          
          <Box>
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {currentTitle}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: alpha(theme.palette.common.white, 0.8),
                display: { xs: 'none', md: 'block' }
              }}
            >
              Khám phá tiềm năng qua khoa học tâm lý
            </Typography>
          </Box>
        </Box>

        {/* Right: Navigation and Language Switcher */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Quick Navigation */}
          <Box display="flex" gap={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navigationItems.map((item) => (
              <IconButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color: location.pathname === item.path 
                    ? 'white' 
                    : alpha(theme.palette.common.white, 0.7),
                  backgroundColor: location.pathname === item.path 
                    ? alpha(theme.palette.common.white, 0.2)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.15),
                    color: 'white'
                  },
                  transition: 'all 0.2s ease'
                }}
                title={item.title}
              >
                {item.icon}
              </IconButton>
            ))}
          </Box>

          {/* Language Switcher */}
          <LanguageSwitcher variant="icon" />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationHeader;