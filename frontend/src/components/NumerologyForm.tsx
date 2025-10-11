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
  Divider
} from '@mui/material';
import { format } from 'date-fns';

interface NumerologyFormProps {
  onCalculate: (fullName: string, birthDate: Date) => void;
  loading?: boolean;
  error?: string;
}

const NumerologyForm: React.FC<NumerologyFormProps> = ({ 
  onCalculate, 
  loading = false, 
  error 
}) => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthDateString, setBirthDateString] = useState('');
  const [nameError, setNameError] = useState('');
  const [dateError, setDateError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate full name
    if (!fullName.trim()) {
      setNameError('Vui lòng nhập họ và tên');
      isValid = false;
    } else if (fullName.trim().length < 2) {
      setNameError('Họ và tên phải có ít nhất 2 ký tự');
      isValid = false;
    } else if (!/^[a-zA-ZÀ-ỹĐđ\s]+$/.test(fullName.trim())) {
      setNameError('Họ và tên chỉ được chứa chữ cái và khoảng trắng');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate birth date
    if (!birthDate) {
      setDateError('Vui lòng nhập ngày sinh');
      isValid = false;
    } else if (birthDate > new Date()) {
      setDateError('Ngày sinh không thể trong tương lai');
      isValid = false;
    } else if (birthDate < new Date('1900-01-01')) {
      setDateError('Ngày sinh không hợp lệ');
      isValid = false;
    } else {
      setDateError('');
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && birthDate) {
      onCalculate(fullName.trim(), birthDate);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (nameError) setNameError('');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setBirthDateString(dateValue);
    
    if (dateValue) {
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        setBirthDate(parsedDate);
        if (dateError) setDateError('');
      } else {
        setBirthDate(null);
        setDateError('Ngày sinh không hợp lệ');
      }
    } else {
      setBirthDate(null);
      if (dateError) setDateError('');
    }
  };

  const calculateSamplePerson = () => {
    setFullName('Nguyễn Văn An');
    const sampleDate = new Date('1990-05-15');
    setBirthDate(sampleDate);
    setBirthDateString('1990-05-15');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
            🔮 Thần Số Học Pythagoras
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
            Khám phá bản thân qua các con số thiêng liêng theo học thuyết Pythagoras cổ đại
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ và Tên Đầy Đủ"
                  placeholder="VD: Nguyễn Văn An"
                  value={fullName}
                  onChange={handleNameChange}
                  error={!!nameError}
                  helperText={nameError || 'Nhập họ và tên như trong giấy khai sinh'}
                  variant="outlined"
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ngày Sinh"
                  type="date"
                  value={birthDateString}
                  onChange={handleDateChange}
                  error={!!dateError}
                  helperText={dateError || 'Chọn ngày sinh chính xác (DD/MM/YYYY)'}
                  variant="outlined"
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    max: format(new Date(), 'yyyy-MM-dd'),
                    min: '1900-01-01'
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                      flex: 1,
                      py: 1.5,
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)'
                      }
                    }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? 'Đang Tính Toán...' : '🔍 Phân Tích Thần Số'}
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={calculateSamplePerson}
                    disabled={loading}
                    sx={{ 
                      flex: { xs: 1, sm: 'auto' },
                      py: 1.5,
                      fontWeight: 'bold'
                    }}
                  >
                    📝 Ví Dụ
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom color="primary">
              ✨ Thông Tin Phân Tích
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  🔢 <strong>Các Số Cốt Lõi:</strong> Đường đời, Sứ mệnh, Nhân cách, Linh hồn
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  🎯 <strong>Hướng Nghiệp:</strong> Nghề phù hợp, phong cách làm việc
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  📈 <strong>Tương Thích:</strong> Điểm số khả năng lãnh đạo, teamwork
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  🔄 <strong>Chu Kỳ Đời:</strong> Giai đoạn phát triển theo tuổi
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {fullName && birthDate && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Thông tin nhập:</strong><br />
                👤 Họ tên: {fullName}<br />
                📅 Ngày sinh: {format(birthDate, 'dd/MM/yyyy')}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NumerologyForm;