import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  Autocomplete,
  Fade,
  Slide,
  Chip,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Tooltip,
  FormHelperText
} from '@mui/material';
import {
  Person,
  CalendarToday,
  AutoAwesome,
  Clear,
  Help,
  CheckCircle,
  Psychology
} from '@mui/icons-material';
import { format, isValid, parseISO } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface EnhancedNumerologyFormProps {
  onCalculate: (fullName: string, birthDate: Date) => void;
  loading?: boolean;
  error?: string;
}

// Common Vietnamese names for autocomplete
const vietnameseNames = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung',
  'Hoàng Văn Em', 'Vũ Thị Phương', 'Đặng Văn Giang', 'Bùi Thị Hoa',
  'Đinh Văn Inh', 'Lý Thị Kim', 'Ngô Văn Long', 'Dương Thị Mai',
  'Chu Văn Nam', 'Võ Thị Oanh', 'Phan Văn Phúc', 'Lưu Thị Quỳnh'
];

const steps = [
  'Nhập họ tên',
  'Chọn ngày sinh',
  'Xem kết quả'
];

const EnhancedNumerologyForm: React.FC<EnhancedNumerologyFormProps> = ({ 
  onCalculate, 
  loading = false, 
  error 
}) => {
  const { t, i18n } = useTranslation('numerology');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthDateString, setBirthDateString] = useState('');
  const [nameError, setNameError] = useState('');
  const [dateError, setDateError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [showPreview, setShowPreview] = useState(false);

  const locale = i18n.language === 'vi' ? vi : enUS;

  // Real-time validation with debounce
  const validateName = useCallback((name: string): boolean => {
    if (!name.trim()) {
      setNameError(t('form.validation.nameRequired'));
      return false;
    }
    if (name.trim().length < 2) {
      setNameError(t('form.validation.nameMinLength'));
      return false;
    }
    if (!/^[a-zA-ZÀ-ỹĐđ\s]+$/.test(name.trim())) {
      setNameError(t('form.validation.nameInvalidCharacters'));
      return false;
    }
    setNameError('');
    return true;
  }, [t]);

  const validateDate = useCallback((date: Date | null): boolean => {
    if (!date) {
      setDateError(t('form.validation.dateRequired'));
      return false;
    }
    if (date > new Date()) {
      setDateError(t('form.validation.dateFuture'));
      return false;
    }
    if (date < new Date('1900-01-01')) {
      setDateError(t('form.validation.invalidDate'));
      return false;
    }
    setDateError('');
    return true;
  }, [t]);

  // Auto-advance steps when fields are valid
  useEffect(() => {
    if (activeStep === 0 && fullName && !nameError) {
      setTimeout(() => setActiveStep(1), 500);
    }
    if (activeStep === 1 && birthDate && !dateError) {
      setTimeout(() => {
        setActiveStep(2);
        setShowPreview(true);
      }, 500);
    }
  }, [fullName, nameError, birthDate, dateError, activeStep]);

  // Real-time validation
  useEffect(() => {
    if (fullName) {
      setValidationStatus('validating');
      const timer = setTimeout(() => {
        const isValid = validateName(fullName);
        setValidationStatus(isValid ? 'valid' : 'invalid');
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setValidationStatus('idle');
    }
  }, [fullName, validateName]);

  const handleNameChange = (event: React.SyntheticEvent, value: string | null) => {
    const newName = value || '';
    setFullName(newName);
    if (nameError && newName) setNameError('');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setBirthDateString(dateValue);
    
    if (dateValue) {
      const parsedDate = new Date(dateValue);
      if (isValid(parsedDate)) {
        setBirthDate(parsedDate);
        validateDate(parsedDate);
      } else {
        setBirthDate(null);
        setDateError(t('form.validation.invalidDate'));
      }
    } else {
      setBirthDate(null);
      setDateError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameValid = validateName(fullName);
    const dateValid = validateDate(birthDate);
    
    if (nameValid && dateValid && birthDate) {
      onCalculate(fullName.trim(), birthDate);
    }
  };

  const clearForm = () => {
    setFullName('');
    setBirthDate(null);
    setBirthDateString('');
    setNameError('');
    setDateError('');
    setActiveStep(0);
    setShowPreview(false);
    setValidationStatus('idle');
  };

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <CircularProgress size={20} />;
      case 'valid':
        return <CheckCircle color="success" />;
      case 'invalid':
        return <Clear color="error" />;
      default:
        return null;
    }
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
              {t('title')}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 500, mx: 'auto' }}>
              {t('subtitle')}
            </Typography>
          </CardContent>
        </Card>
      </Fade>

      <Slide in direction="up" timeout={600}>
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            <Stepper activeStep={activeStep} orientation="vertical">
              {/* Step 1: Name Input */}
              <Step>
                <StepLabel>
                  <Typography variant="h6" color="primary">
                    <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {steps[0]}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <Autocomplete
                      freeSolo
                      options={vietnameseNames}
                      value={fullName}
                      onInputChange={handleNameChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          label={t('form.fullName')}
                          placeholder={t('form.fullNamePlaceholder')}
                          error={!!nameError}
                          helperText={nameError || t('form.nameHelper')}
                          variant="outlined"
                          disabled={loading}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="primary" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                {getValidationIcon()}
                              </InputAdornment>
                            )
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
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} sx={{ 
                          '&:hover': { backgroundColor: 'primary.50' }
                        }}>
                          <Person sx={{ mr: 1, color: 'primary.main' }} />
                          {option}
                        </Box>
                      )}
                    />
                    
                    {fullName && !nameError && (
                      <Fade in>
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            icon={<CheckCircle />}
                            label={`Họ tên: ${fullName}`}
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      </Fade>
                    )}
                  </Box>
                </StepContent>
              </Step>

              {/* Step 2: Date Input */}
              <Step>
                <StepLabel>
                  <Typography variant="h6" color="primary">
                    <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {steps[1]}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <TextField
                      fullWidth
                      label={t('form.birthDate')}
                      type="date"
                      value={birthDateString}
                      onChange={handleDateChange}
                      error={!!dateError}
                      helperText={dateError || t('form.birthDatePlaceholder')}
                      variant="outlined"
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday color="primary" />
                          </InputAdornment>
                        )
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
                    
                    {birthDate && !dateError && (
                      <Fade in>
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            icon={<CheckCircle />}
                            label={`Ngày sinh: ${format(birthDate, 'dd/MM/yyyy', { locale })}`}
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                      </Fade>
                    )}
                  </Box>
                </StepContent>
              </Step>

              {/* Step 3: Submit */}
              <Step>
                <StepLabel>
                  <Typography variant="h6" color="primary">
                    <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
                    {steps[2]}
                  </Typography>
                </StepLabel>
                <StepContent>
                  {showPreview && (
                    <Fade in timeout={800}>
                      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="h6" gutterBottom color="primary">
                          <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Thông tin sẽ được phân tích:
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1">
                              <strong>👤 Họ tên:</strong> {fullName}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body1">
                              <strong>📅 Ngày sinh:</strong> {birthDate && format(birthDate, 'dd/MM/yyyy', { locale })}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          <strong>🔍 Phân tích sẽ bao gồm:</strong>
                        </Typography>
                        <Grid container spacing={1}>
                          {[
                            '🔢 Các số cốt lõi và ý nghĩa',
                            '🎯 Hướng nghiệp phù hợp',
                            '💪 Điểm mạnh và thách thức',
                            '🔄 Chu kỳ phát triển cuộc đời'
                          ].map((item, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                              <Typography variant="body2" color="text.secondary">
                                {item}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    </Fade>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Button
                      onClick={handleSubmit}
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
                      {loading ? t('form.calculating') : `🔮 ${t('form.calculate')}`}
                    </Button>

                    <Tooltip title="Xóa tất cả và bắt đầu lại">
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
                        startIcon={<Clear />}
                      >
                        🔄 Làm lại
                      </Button>
                    </Tooltip>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>

            {/* Quick Info Section */}
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
                <Help sx={{ mr: 1, verticalAlign: 'middle' }} />
                ✨ Thông Tin Về Thần Số Học
              </Typography>
              
              <Grid container spacing={3}>
                {[
                  { icon: '🔢', title: 'Số Đường Đời', desc: 'Tiết lộ mục đích và hướng đi trong cuộc sống' },
                  { icon: '🎯', title: 'Số Sứ Mệnh', desc: 'Khám phá tài năng và khả năng thiên bẩm' },
                  { icon: '💼', title: 'Hướng Nghiệp', desc: 'Gợi ý nghề nghiệp phù hợp với bản thân' },
                  { icon: '📊', title: 'Phân Tích Tương Thích', desc: 'Đánh giá khả năng làm việc nhóm và lãnh đạo' }
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        height: '100%', 
                        borderRadius: 2,
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
      </Slide>
    </Box>
  );
};

export default EnhancedNumerologyForm;