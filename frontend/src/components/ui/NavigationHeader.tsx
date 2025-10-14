import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useTheme,
  alpha,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Psychology,
  Home,
  Assessment,
  Work,
  Person,
  Login,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthDialog from '../AuthDialog';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavigationHeaderProps {
  onMenuClick?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  
  // State for auth dialog and user menu
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

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
    },
    {
      path: '/cv-analysis',
      icon: <Assessment />,
      label: 'CV AI',
      title: 'Phân Tích CV Bằng AI'
    },
    {
      path: '/job-matching',
      icon: <Work />,
      label: 'Việc Làm',
      title: 'Gợi Ý Việc Làm Thông Minh'
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

          {/* User Auth Section */}
          {user ? (
            <>
              <IconButton
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                sx={{
                  ml: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.15)
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    color: 'white',
                    fontSize: '0.9rem'
                  }}
                >
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => { navigate('/profile'); setUserMenuAnchor(null); }}>
                  <Person sx={{ mr: 2 }} />
                  Hồ Sơ Cá Nhân
                </MenuItem>
                <Divider />
                <MenuItem onClick={async () => { await signOut(); setUserMenuAnchor(null); }}>
                  <Logout sx={{ mr: 2 }} />
                  Đăng Xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<Login />}
              onClick={() => setAuthDialogOpen(true)}
              sx={{
                ml: 1,
                color: 'white',
                borderColor: alpha(theme.palette.common.white, 0.5),
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: alpha(theme.palette.common.white, 0.1)
                }
              }}
            >
              Đăng Nhập
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        initialTab="signin"
      />
    </AppBar>
  );
};

export default NavigationHeader;