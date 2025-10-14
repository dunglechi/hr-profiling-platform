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
  Assessment
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useSecureTranslation } from '../../hooks/useSecureTranslation';

interface NavigationHeaderProps {
  onMenuClick?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSecureTranslation('common');

  const navigationItems = [
    {
      path: '/',
      icon: <Home />,
      label: t('navigation.home', 'Trang Chủ'),
      title: t('navigation.dashboard', 'Bảng Điều Khiển')
    },
    {
      path: '/numerology-enhanced',
      icon: <Psychology />,
      label: t('navigation.numerology', 'Thần Số Học'),
      title: t('navigation.numerologyAdvanced', 'Thần Số Học Nâng Cao')
    },
    {
      path: '/disc',
      icon: <Assessment />,
      label: t('navigation.assessments', 'Đánh Giá'),
      title: t('navigation.discAssessment', 'Đánh Giá DISC')
    }
  ];

  const currentItem = navigationItems.find(item => item.path === location.pathname);
  const currentTitle = currentItem?.title || t('app.title', 'HR Profiling Platform');

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
              {t('app.subtitle', 'Khám phá tiềm năng qua khoa học tâm lý')}
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
          <Box 
            sx={{ 
              color: 'white',
              '& .MuiIconButton-root': {
                color: 'white'
              }
            }}
          >
            <LanguageSwitcher variant="icon" size="medium" />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationHeader;