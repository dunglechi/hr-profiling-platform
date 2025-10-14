import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Autocomplete,
  InputAdornment,
  Chip,
  Typography,
  Paper,
  Tooltip,
  LinearProgress,
  IconButton,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Person,
  CalendarToday,
  AutoAwesome,
  Psychology,
  Lightbulb,
  CheckCircle,
  Clear,
  History,
  Star
} from '@mui/icons-material';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SmartInputProps {
  onSubmit: (data: { fullName: string; birthDate: Date }) => void;
  loading?: boolean;
}

interface NameSuggestion {
  name: string;
  popularity: number;
  meaning?: string;
  origin?: string;
}

interface DateSuggestion {
  date: string;
  description: string;
  significance?: string;
}

// Enhanced name database with meanings
const enhancedNameSuggestions: NameSuggestion[] = [
  { name: 'Nguyễn Văn An', popularity: 95, meaning: 'Bình an, tĩnh lặng', origin: 'Việt Nam' },
  { name: 'Trần Thị Bình', popularity: 90, meaning: 'Hòa bình, cân bằng', origin: 'Việt Nam' },
  { name: 'Lê Văn Cường', popularity: 85, meaning: 'Mạnh mẽ, cương quyết', origin: 'Việt Nam' },
  { name: 'Phạm Thị Dung', popularity: 88, meaning: 'Dũng cảm, can đảm', origin: 'Việt Nam' },
  { name: 'Hoàng Văn Em', popularity: 80, meaning: 'Khiêm tốn, nhẹ nhàng', origin: 'Việt Nam' },
  { name: 'Vũ Thị Phương', popularity: 85, meaning: 'Hương thơm, duyên dáng', origin: 'Việt Nam' },
  { name: 'Đặng Văn Giang', popularity: 82, meaning: 'Sông nước, rộng lớn', origin: 'Việt Nam' },
  { name: 'Bùi Thị Hoa', popularity: 92, meaning: 'Hoa đẹp, tinh khôi', origin: 'Việt Nam' },
  { name: 'Đinh Văn Inh', popularity: 75, meaning: 'Anh dũng, kiên cường', origin: 'Việt Nam' },
  { name: 'Lý Thị Kim', popularity: 89, meaning: 'Vàng quý, giá trị', origin: 'Việt Nam' }
];

// Load from localStorage for personalization
const getNameHistory = (): string[] => {
  try {
    const history = localStorage.getItem('nameSearchHistory');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

const saveNameToHistory = (name: string) => {
  try {
    const history = getNameHistory();
    const newHistory = [name, ...history.filter(h => h !== name)].slice(0, 10);
    localStorage.setItem('nameSearchHistory', JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error saving name history:', error);
  }
};

const SmartInputSystem: React.FC<SmartInputProps> = ({ onSubmit, loading = false }) => {
  const { i18n } = useTranslation('numerology');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [nameError, setNameError] = useState('');
  const [dateError, setDateError] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState<NameSuggestion[]>([]);
  const [showNameMeaning, setShowNameMeaning] = useState(false);
  const [selectedNameMeaning, setSelectedNameMeaning] = useState<NameSuggestion | null>(null);
  const [nameHistory] = useState<string[]>(getNameHistory());
  const [inputStrength, setInputStrength] = useState(0);
  const [datePreview, setDatePreview] = useState<string>('');

  // Smart name validation with AI-like scoring
  const analyzeNameInput = useCallback((name: string) => {
    let strength = 0;
    const trimmedName = name.trim();

    if (trimmedName.length >= 2) strength += 20;
    if (trimmedName.length >= 5) strength += 20;
    if (/^[a-zA-ZÀ-ỹĐđ\s]+$/.test(trimmedName)) strength += 30;
    if (trimmedName.includes(' ') && trimmedName.split(' ').length >= 2) strength += 20;
    if (trimmedName.split(' ').length >= 3) strength += 10;

    setInputStrength(strength);
    return strength >= 70;
  }, []);

  // Real-time name suggestions with fuzzy matching
  useEffect(() => {
    if (fullName.length >= 2) {
      const filtered = enhancedNameSuggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(fullName.toLowerCase()) ||
        suggestion.name.toLowerCase().includes(fullName.toLowerCase().replace(/\s+/g, ''))
      ).slice(0, 8);
      
      setNameSuggestions(filtered);
    } else {
      setNameSuggestions([]);
    }
  }, [fullName]);

  // Date preview and validation
  useEffect(() => {
    if (birthDate) {
      try {
        const date = parseISO(birthDate);
        if (isValid(date)) {
          setDatePreview(format(date, 'EEEE, dd MMMM yyyy', { locale: vi }));
          setDateError('');
        } else {
          setDatePreview('');
          setDateError('Ngày không hợp lệ');
        }
      } catch {
        setDatePreview('');
        setDateError('Định dạng ngày không đúng');
      }
    } else {
      setDatePreview('');
      setDateError('');
    }
  }, [birthDate]);

  const handleNameChange = (_event: React.SyntheticEvent, value: string | null) => {
    const newName = value || '';
    setFullName(newName);
    
    if (newName) {
      analyzeNameInput(newName);
      
      // Find meaning if exact match
      const meaningMatch = enhancedNameSuggestions.find(s => 
        s.name.toLowerCase() === newName.toLowerCase()
      );
      if (meaningMatch) {
        setSelectedNameMeaning(meaningMatch);
        setShowNameMeaning(true);
      } else {
        setShowNameMeaning(false);
      }
    } else {
      setInputStrength(0);
      setShowNameMeaning(false);
    }
    
    // Validation
    if (!newName.trim()) {
      setNameError('Vui lòng nhập họ tên');
    } else if (newName.trim().length < 2) {
      setNameError('Họ tên phải có ít nhất 2 ký tự');
    } else if (!/^[a-zA-ZÀ-ỹĐđ\s]+$/.test(newName.trim())) {
      setNameError('Họ tên chỉ được chứa chữ cái và khoảng trắng');
    } else {
      setNameError('');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setBirthDate(dateValue);
  };

  const handleSubmit = () => {
    if (fullName && birthDate && !nameError && !dateError) {
      const date = parseISO(birthDate);
      if (isValid(date)) {
        saveNameToHistory(fullName);
        onSubmit({ fullName: fullName.trim(), birthDate: date });
      }
    }
  };

  const clearInput = (field: 'name' | 'date') => {
    if (field === 'name') {
      setFullName('');
      setNameError('');
      setInputStrength(0);
      setShowNameMeaning(false);
    } else {
      setBirthDate('');
      setDateError('');
      setDatePreview('');
    }
  };

  const getStrengthColor = () => {
    if (inputStrength < 30) return 'error';
    if (inputStrength < 70) return 'warning';
    return 'success';
  };

  const getStrengthText = () => {
    if (inputStrength < 30) return 'Yếu';
    if (inputStrength < 50) return 'Trung bình';
    if (inputStrength < 70) return 'Tốt';
    return 'Xuất sắc';
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Smart Name Input */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
          Nhập Họ Tên Thông Minh
        </Typography>
        
        <Autocomplete
          freeSolo
          value={fullName}
          onInputChange={handleNameChange}
          options={[...nameHistory, ...nameSuggestions.map(s => s.name)]}
          groupBy={(option) => {
            if (nameHistory.includes(option)) return '📝 Đã từng nhập';
            if (nameSuggestions.some(s => s.name === option)) return '💡 Gợi ý phổ biến';
            return '';
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              label="Họ và tên đầy đủ"
              placeholder="Ví dụ: Nguyễn Văn An"
              error={!!nameError}
              helperText={nameError}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {fullName && (
                      <Tooltip title="Xóa">
                        <IconButton size="small" onClick={() => clearInput('name')}>
                          <Clear fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {inputStrength > 0 && (
                      <Tooltip title={`Chất lượng: ${getStrengthText()}`}>
                        <CheckCircle 
                          color={getStrengthColor()}
                          fontSize="small"
                        />
                      </Tooltip>
                    )}
                    {params.InputProps?.endAdornment}
                  </Box>
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
          renderOption={(props, option) => {
            const suggestion = nameSuggestions.find(s => s.name === option);
            const isHistory = nameHistory.includes(option);
            
            return (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {isHistory ? (
                    <History sx={{ mr: 2, color: 'text.secondary' }} />
                  ) : (
                    <Person sx={{ mr: 2, color: 'primary.main' }} />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1">
                      {option}
                    </Typography>
                    {suggestion && (
                      <Typography variant="caption" color="text.secondary">
                        {suggestion.meaning} • Phổ biến: {suggestion.popularity}%
                      </Typography>
                    )}
                  </Box>
                  {suggestion && (
                    <Star sx={{ color: 'gold', fontSize: 16 }} />
                  )}
                </Box>
              </Box>
            );
          }}
        />

        {/* Input Strength Indicator */}
        {fullName && (
          <Fade in>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Chất lượng nhập liệu:
                </Typography>
                <Typography variant="caption" color={`${getStrengthColor()}.main`} fontWeight="medium">
                  {getStrengthText()} ({inputStrength}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={inputStrength}
                color={getStrengthColor()}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
          </Fade>
        )}

        {/* Name Meaning Display */}
        {showNameMeaning && selectedNameMeaning && (
          <Fade in>
            <Paper elevation={1} sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'primary.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb color="primary" fontSize="small" />
                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                  Ý nghĩa tên:
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>{selectedNameMeaning.name}</strong> - {selectedNameMeaning.meaning}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Xuất xứ: {selectedNameMeaning.origin} • 
                Phổ biến: {selectedNameMeaning.popularity}%
              </Typography>
            </Paper>
          </Fade>
        )}
      </Box>

      {/* Smart Date Input */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
          <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
          Chọn Ngày Sinh Thông Minh
        </Typography>
        
        <TextField
          fullWidth
          label="Ngày sinh"
          type="date"
          value={birthDate}
          onChange={handleDateChange}
          error={!!dateError}
          helperText={dateError}
          variant="outlined"
          disabled={loading}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday color="primary" />
              </InputAdornment>
            ),
            endAdornment: birthDate && (
              <Tooltip title="Xóa ngày">
                <IconButton size="small" onClick={() => clearInput('date')}>
                  <Clear fontSize="small" />
                </IconButton>
              </Tooltip>
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

        {/* Date Preview */}
        {datePreview && (
          <Fade in>
            <Paper elevation={1} sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'success.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                  Ngày đã chọn:
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
                {datePreview}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                🎯 Phân tích sẽ dựa trên ngày này để tính toán các số cốt lõi
              </Typography>
            </Paper>
          </Fade>
        )}
      </Box>

      {/* Smart Submit Section */}
      {fullName && birthDate && !nameError && !dateError && (
        <Fade in timeout={600}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              border: '1px solid',
              borderColor: 'primary.200'
            }}
          >
            <Typography variant="h6" color="primary" gutterBottom>
              <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
              Sẵn Sàng Phân Tích
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                icon={<Person />}
                label={`Họ tên: ${fullName}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<CalendarToday />}
                label={`Ngày sinh: ${datePreview || birthDate}`}
                color="primary"
                variant="outlined"
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              🔍 <strong>Phân tích sẽ bao gồm:</strong><br />
              • Các số cốt lõi (Đường đời, Sứ mệnh, Nhân cách, Linh hồn)<br />
              • Tư vấn nghề nghiệp và phong cách làm việc<br />
              • Phân tích tương thích và khả năng lãnh đạo<br />
              • Chu kỳ phát triển theo từng giai đoạn cuộc đời
            </Typography>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                background: loading 
                  ? 'linear-gradient(45deg, #ccc, #ddd)'
                  : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading 
                  ? 'none'
                  : '0 4px 15px rgba(33, 150, 243, 0.3)',
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Đang phân tích...
                </Box>
              ) : (
                '🔮 Bắt Đầu Phân Tích Thần Số Học'
              )}
            </button>
          </Paper>
        </Fade>
      )}

      {/* Quick Tips */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <Psychology sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
          <strong>💡 Mẹo nhập liệu:</strong>
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            • Nhập họ tên đầy đủ như trong giấy tờ tùy thân
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • Chọn ngày sinh chính xác để có kết quả phân tích tốt nhất
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • Hệ thống sẽ gợi ý tên phổ biến và ý nghĩa
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SmartInputSystem;