import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Fade,
  Paper,
  Chip
} from '@mui/material';
import { Psychology, Person, CalendarToday, AutoAwesome } from '@mui/icons-material';
import { format } from 'date-fns';

interface SimpleEnhancedFormProps {
  onCalculate: (fullName: string, birthDate: Date) => void;
  loading?: boolean;
  error?: string;
}

const SimpleEnhancedForm: React.FC<SimpleEnhancedFormProps> = ({ 
  onCalculate, 
  loading = false, 
  error 
}) => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nameError, setNameError] = useState('');
  const [dateError, setDateError] = useState('');

  const validateName = (name: string): boolean => {
    if (!name.trim()) {
      setNameError('Vui lòng nhập họ tên');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Họ tên phải có ít nhất 2 ký tự');
      return false;
    }
    if (!/^[a-zA-ZÀ-ỹĐđ\s]+$/.test(name.trim())) {
      setNameError('Họ tên chỉ được chứa chữ cái và khoảng trắng');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateDate = (dateString: string): boolean => {
    if (!dateString) {
      setDateError('Vui lòng chọn ngày sinh');
      return false;
    }
    const date = new Date(dateString);
    if (date > new Date()) {
      setDateError('Ngày sinh không thể là tương lai');
      return false;
    }
    if (date < new Date('1900-01-01')) {
      setDateError('Ngày sinh không hợp lệ');
      return false;
    }
    setDateError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameValid = validateName(fullName);
    const dateValid = validateDate(birthDate);
    
    if (nameValid && dateValid) {
      onCalculate(fullName.trim(), new Date(birthDate));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    if (nameError && value) {
      setNameError('');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthDate(value);
    if (dateError && value) {
      setDateError('');
    }
  };

  const clearForm = () => {
    setFullName('');
    setBirthDate('');
    setNameError('');
    setDateError('');
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Fade in timeout={800}>
        <Card elevation={8} sx={{ 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          mb: 3
        }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Psychology sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
              ✨ Thần Số Học AI Pro
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 500, mx: 'auto' }}>
              Trải nghiệm nâng cấp với UI/UX hiện đại và phân tích thông minh
            </Typography>
          </CardContent>
        </Card>
      </Fade>

      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Fade in>
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3, textAlign: 'center' }}>
            <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
            Bắt Đầu Phân Tích Thần Số Học
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ và tên đầy đủ"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={fullName}
                  onChange={handleNameChange}
                  error={!!nameError}
                  helperText={nameError || 'Nhập họ tên như trong giấy tờ tùy thân'}
                  variant="outlined"
                  disabled={loading}
                  InputProps={{
                    startAdornment: <Person color="primary" sx={{ mr: 1 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ngày sinh"
                  type="date"
                  value={birthDate}
                  onChange={handleDateChange}
                  error={!!dateError}
                  helperText={dateError || 'Chọn ngày sinh chính xác để có kết quả tốt nhất'}
                  variant="outlined"
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <CalendarToday color="primary" sx={{ mr: 1 }} />,
                  }}
                  inputProps={{
                    max: format(new Date(), 'yyyy-MM-dd'),
                    min: '1900-01-01'
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                />
              </Grid>

              {fullName && birthDate && !nameError && !dateError && (
                <Grid item xs={12}>
                  <Fade in timeout={600}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.50' }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Sẵn Sàng Phân Tích
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<Person />}
                          label={`Họ tên: ${fullName}`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<CalendarToday />}
                          label={`Ngày sinh: ${new Date(birthDate).toLocaleDateString('vi-VN')}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        🔍 <strong>Phân tích sẽ bao gồm:</strong><br />
                        • Các số cốt lõi (Đường đời, Sứ mệnh, Nhân cách, Linh hồn)<br />
                        • Tư vấn nghề nghiệp và phong cách làm việc<br />
                        • Phân tích tương thích và khả năng lãnh đạo<br />
                        • Chu kỳ phát triển theo từng giai đoạn cuộc đời
                      </Typography>
                    </Paper>
                  </Fade>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !fullName || !birthDate || !!nameError || !!dateError}
                    sx={{ 
                      flex: 1,
                      py: 1.5,
                      fontWeight: 'bold',
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                        transform: 'translateY(-1px)',
                        boxShadow: 4
                      },
                      transition: 'all 0.3s ease'
                    }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                  >
                    {loading ? 'Đang phân tích...' : '🔮 Bắt Đầu Phân Tích'}
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={clearForm}
                    disabled={loading}
                    sx={{ 
                      py: 1.5,
                      fontWeight: 'bold',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🔄 Làm lại
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
              ✨ Tính Năng Nâng Cấp
            </Typography>
            
            <Grid container spacing={3}>
              {[
                { icon: '🎯', title: 'AI Thông Minh', desc: 'Phân tích sâu với công nghệ AI hiện đại' },
                { icon: '📊', title: 'Biểu Đồ Trực Quan', desc: 'Hiển thị kết quả qua charts và infographics' },
                { icon: '💫', title: 'UX Hiện Đại', desc: 'Giao diện mượt mà với animations và transitions' },
                { icon: '🌐', title: 'Đa Ngôn Ngữ', desc: 'Hỗ trợ tiếng Việt, Anh và mở rộng thêm' }
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      borderRadius: 2,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        elevation: 4,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {item.icon}
                    </Typography>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      <strong>{item.title}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleEnhancedForm;