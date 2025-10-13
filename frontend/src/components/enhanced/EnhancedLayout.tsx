import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fab,
  Zoom,
  useScrollTrigger,
  Slide,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Paper,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Psychology,
  Language,
  DarkMode,
  LightMode,
  Home,
  Info,
  ContactSupport,
  KeyboardArrowUp,
  Brightness4,
  Brightness7,
  Analytics,
  History,
  Settings,
  NotificationsActive
} from '@mui/icons-material';

interface EnhancedLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

interface ScrollToTopProps {
  children: React.ReactElement;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ children }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  );
};

const HideOnScroll: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const EnhancedLayout: React.FC<EnhancedLayoutProps> = ({ 
  children, 
  darkMode, 
  onToggleDarkMode 
}) => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notifications] = useState(2); // Demo notification count
  const isMobile = useMediaQuery('(max-width:600px)');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196F3',
        light: '#64B5F6',
        dark: '#1976D2',
      },
      secondary: {
        main: '#9C27B0',
        light: '#BA68C8',
        dark: '#7B1FA2',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    handleLanguageMenuClose();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    { icon: <Home />, text: 'Trang Chủ', path: '/' },
    { icon: <Psychology />, text: 'Phân Tích Mới', path: '/analysis' },
    { icon: <History />, text: 'Lịch Sử', path: '/history' },
    { icon: <Analytics />, text: 'Thống Kê', path: '/stats' },
    { icon: <Info />, text: 'Thông Tin', path: '/about' },
    { icon: <ContactSupport />, text: 'Hỗ Trợ', path: '/support' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Enhanced Header */}
        <HideOnScroll>
          <AppBar 
            position="fixed" 
            elevation={0}
            sx={{ 
              backdropFilter: 'blur(20px)',
              backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              color: darkMode ? 'white' : 'black',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Toolbar>
              {isMobile && (
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={toggleMobileMenu}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              <Psychology sx={{ mr: 2, color: 'primary.main' }} />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #2196F3, #9C27B0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NumerologyAI Pro
              </Typography>

              {!isMobile && (
                <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                  {menuItems.slice(0, 4).map((item, index) => (
                    <Button
                      key={index}
                      color="inherit"
                      startIcon={item.icon}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'primary.50',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
              )}

              {/* Notifications */}
              <Tooltip title="Thông báo">
                <IconButton color="inherit" sx={{ mr: 1 }}>
                  <Badge badgeContent={notifications} color="error">
                    <NotificationsActive />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Language Selector */}
              <Tooltip title="Chọn ngôn ngữ">
                <IconButton
                  color="inherit"
                  onClick={handleLanguageMenuOpen}
                  sx={{ mr: 1 }}
                >
                  <Language />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={languageMenuAnchor}
                open={Boolean(languageMenuAnchor)}
                onClose={handleLanguageMenuClose}
              >
                <MenuItem onClick={() => changeLanguage('vi')}>
                  🇻🇳 Tiếng Việt
                </MenuItem>
                <MenuItem onClick={() => changeLanguage('en')}>
                  🇺🇸 English
                </MenuItem>
              </Menu>

              {/* Dark Mode Toggle */}
              <Tooltip title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
                <IconButton color="inherit" onClick={onToggleDarkMode} sx={{ mr: 1 }}>
                  {darkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>

              {/* User Menu */}
              <Tooltip title="Tài khoản">
                <IconButton onClick={handleUserMenuOpen}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      background: 'linear-gradient(45deg, #2196F3, #9C27B0)'
                    }}
                  >
                    U
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={handleUserMenuClose}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Cài đặt
                </MenuItem>
                <MenuItem onClick={handleUserMenuClose}>
                  <ListItemIcon>
                    <History fontSize="small" />
                  </ListItemIcon>
                  Lịch sử
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleUserMenuClose}>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
        </HideOnScroll>

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={toggleMobileMenu}
          PaperProps={{
            sx: {
              width: 280,
              background: darkMode 
                ? 'linear-gradient(180deg, #1e1e1e 0%, #2d2d2d 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
            }
          }}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Psychology sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              NumerologyAI Pro
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Khám phá bản thân qua số học
            </Typography>
          </Box>
          
          <Divider />
          
          <List>
            {menuItems.map((item, index) => (
              <ListItem 
                button 
                key={index}
                onClick={toggleMobileMenu}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.50',
                    transform: 'translateX(8px)',
                  },
                  transition: 'all 0.2s ease',
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 'auto', p: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={onToggleDarkMode}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {darkMode ? <Brightness4 /> : <Brightness7 />}
                  Chế độ {darkMode ? 'tối' : 'sáng'}
                </Box>
              }
            />
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            {children}
          </Container>
        </Box>

        {/* Enhanced Footer */}
        <Paper 
          component="footer" 
          elevation={8}
          sx={{ 
            mt: 'auto',
            background: darkMode 
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 0
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Psychology sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6" fontWeight="bold">
                      NumerologyAI Pro
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 300 }}>
                    Ứng dụng thần số học hiện đại với công nghệ AI, 
                    giúp bạn khám phá bản thân và phát triển tiềm năng.
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Tính Năng
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      • Phân tích thần số học chuyên sâu
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      • Tư vấn nghề nghiệp và tình cảm
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      • Báo cáo chi tiết với biểu đồ
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      • Hỗ trợ đa ngôn ngữ (Việt/Anh)
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Liên Hệ
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      📧 support@numerologyai.pro
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      🌐 www.numerologyai.pro
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      📱 +84 123 456 789
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2
              }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  © 2025 NumerologyAI Pro. Tất cả quyền được bảo lưu.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    size="small" 
                    sx={{ color: 'white', opacity: 0.8 }}
                  >
                    Điều khoản
                  </Button>
                  <Button 
                    size="small" 
                    sx={{ color: 'white', opacity: 0.8 }}
                  >
                    Bảo mật
                  </Button>
                  <Button 
                    size="small" 
                    sx={{ color: 'white', opacity: 0.8 }}
                  >
                    Liên hệ
                  </Button>
                </Box>
              </Box>
            </Box>
          </Container>
        </Paper>

        {/* Scroll to Top Button */}
        <ScrollToTop>
          <Fab 
            color="primary" 
            size="medium"
            sx={{
              background: 'linear-gradient(45deg, #2196F3, #9C27B0)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2, #7B1FA2)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </ScrollToTop>
      </Box>
    </ThemeProvider>
  );
};

export default EnhancedLayout;