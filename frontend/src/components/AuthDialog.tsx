import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Link,
  Divider,
  Grid
} from '@mui/material';
import {
  Close,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Business,
  Work
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

const AuthDialog: React.FC<AuthDialogProps> = ({ 
  open, 
  onClose, 
  initialTab = 'signin' 
}) => {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: '',
    position: ''
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      company: '',
      position: ''
    });
    setError('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'signin' | 'signup') => {
    setActiveTab(newValue);
    setError('');
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin email và mật khẩu');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (activeTab === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return false;
      }

      if (!formData.fullName.trim()) {
        setError('Vui lòng nhập họ tên');
        return false;
      }
    }

    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      await signIn(formData.email, formData.password);
      handleClose();
    } catch (error: any) {
      console.error('Đăng nhập thất bại:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không chính xác');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Vui lòng xác nhận email trước khi đăng nhập');
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const userData = {
        full_name: formData.fullName,
        company: formData.company || undefined,
        position: formData.position || undefined
      };

      await signUp(formData.email, formData.password, userData);
      
      // Switch to sign in tab with success message
      setActiveTab('signin');
      setError('');
      alert('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
      
    } catch (error: any) {
      console.error('Đăng ký thất bại:', error);
      
      if (error.message?.includes('User already registered')) {
        setError('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold" color="primary">
            HR Profiling Platform
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab 
              label="Đăng Nhập" 
              value="signin" 
              icon={<Email />}
              iconPosition="start"
            />
            <Tab 
              label="Đăng Ký" 
              value="signup" 
              icon={<Person />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp}>
          <Grid container spacing={2}>
            {/* Email Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Password Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Sign Up Additional Fields */}
            {activeTab === 'signup' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    required
                    disabled={loading}
                    error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
                    helperText={
                      formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                        ? 'Mật khẩu không khớp'
                        : ''
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
                    required
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Công ty (tùy chọn)"
                    value={formData.company}
                    onChange={handleInputChange('company')}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vị trí (tùy chọn)"
                    value={formData.position}
                    onChange={handleInputChange('position')}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* Sign In Link */}
          {activeTab === 'signin' && (
            <Box mt={2} textAlign="center">
              <Link 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement forgot password
                  alert('Tính năng quên mật khẩu sẽ được phát triển trong phiên bản tiếp theo');
                }}
                variant="body2"
              >
                Quên mật khẩu?
              </Link>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={activeTab === 'signin' ? handleSignIn : handleSignUp}
              disabled={loading}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              {loading ? 'Đang xử lý...' : (
                activeTab === 'signin' ? 'Đăng Nhập' : 'Đăng Ký'
              )}
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {activeTab === 'signin' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              </Typography>
            </Divider>
            
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => {
                setActiveTab(activeTab === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              disabled={loading}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              {activeTab === 'signin' ? 'Tạo tài khoản mới' : 'Đăng nhập ngay'}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default AuthDialog;