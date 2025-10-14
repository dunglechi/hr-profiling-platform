import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Grid,
  Backdrop,
  CircularProgress,
  Divider
} from '@mui/material';
import { Psychology, Person, CalendarToday, AutoAwesome } from '@mui/icons-material';
import { numerologyAPI } from '../lib/supabase';

interface NumerologyResult {
  lifePathNumber: number;
  destinyNumber: number;
  personalityNumber: number;
  soulUrgeNumber: number;
  birthDayNumber: number;
  analysis: string;
  strengths: string[];
  challenges: string[];
  careerGuidance: {
    suitableCareers: string[];
    workStyle: string;
  };
}

const SimpleNumerology: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<NumerologyResult | null>(null);

  const validateInputs = () => {
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return false;
    }
    if (!birthDate) {
      setError('Vui lòng chọn ngày sinh');
      return false;
    }
    if (fullName.trim().length < 2) {
      setError('Tên phải có ít nhất 2 ký tự');
      return false;
    }
    
    const dateObj = new Date(birthDate);
    if (dateObj > new Date()) {
      setError('Ngày sinh không thể là tương lai');
      return false;
    }
    
    setError('');
    return true;
  };

  const generateMockResult = (name: string, date: Date): NumerologyResult => {
    const nameSum = name.replace(/\s/g, '').split('').reduce((sum, char) => {
      return sum + char.charCodeAt(0);
    }, 0);
    
    const dateSum = date.getDate() + date.getMonth() + 1 + date.getFullYear();
    
    return {
      lifePathNumber: (dateSum % 9) + 1,
      destinyNumber: (nameSum % 9) + 1,
      personalityNumber: ((nameSum + dateSum) % 9) + 1,
      soulUrgeNumber: (nameSum % 8) + 1,
      birthDayNumber: date.getDate(),
      analysis: `Dựa trên tên "${name}" và ngày sinh ${date.toLocaleDateString('vi-VN')}, bạn thể hiện những đặc điểm độc đáo và có tiềm năng phát triển mạnh mẽ.`,
      strengths: ['Tư duy logic', 'Khả năng lãnh đạo', 'Sáng tạo', 'Quyết đoán'],
      challenges: ['Cần cải thiện kiên nhẫn', 'Học cách lắng nghe', 'Cân bằng cuộc sống'],
      careerGuidance: {
        suitableCareers: ['Quản lý', 'Tư vấn', 'Giáo dục', 'Công nghệ', 'Kinh doanh'],
        workStyle: 'Độc lập, sáng tạo và có tính chỉ đạo cao'
      }
    };
  };

  const handleCalculate = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError('');
    
    try {
      // Simulate calculation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const dateObj = new Date(birthDate);
      const mockResult = generateMockResult(fullName, dateObj);
      
      // Save to database
      try {
        await numerologyAPI.saveCalculation({
          user_name: fullName,
          birth_date: birthDate,
          calculation_data: mockResult
        });
      } catch (saveError) {
        console.warn('Could not save to database:', saveError);
        // Continue with local result
      }
      
      setResult(mockResult);
      
    } catch (error) {
      setError('Có lỗi xảy ra khi tính toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFullName('');
    setBirthDate('');
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)'
        }}
        open={loading}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: '#667eea', mb: 2 }} />
          <Typography variant="h6">🔮 Đang phân tích thần số học...</Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Vui lòng chờ trong giây lát
          </Typography>
        </Box>
      </Backdrop>

      {/* Header */}
      <Paper
        elevation={8}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          mb: 4
        }}
      >
        <Psychology sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          🌟 Thần Số Học Nâng Cao
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Khám phá con số định mệnh và đặc điểm cá nhân của bạn
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!result ? (
        /* Input Form */
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            📝 Nhập Thông Tin Của Bạn
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên đầy đủ"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                inputProps={{
                  autoComplete: 'new-password',
                  'data-form-type': 'other',
                  'data-lpignore': 'true'
                }}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'primary.main' }} />
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ngày sinh"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleCalculate}
                disabled={loading}
                startIcon={<AutoAwesome />}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              >
                🔮 Phân Tích Thần Số Học
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        /* Results Display */
        <Box>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              📊 Kết Quả Phân Tích
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
              Tên: <strong>{fullName}</strong> • Ngày sinh: <strong>{new Date(birthDate).toLocaleDateString('vi-VN')}</strong>
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: 'Số Đường Đời', value: result.lifePathNumber, color: '#e53e3e' },
                { label: 'Số Sứ Mệnh', value: result.destinyNumber, color: '#3182ce' },
                { label: 'Số Tính Cách', value: result.personalityNumber, color: '#38a169' },
                { label: 'Số Linh Hồn', value: result.soulUrgeNumber, color: '#d69e2e' },
                { label: 'Số Ngày Sinh', value: result.birthDayNumber, color: '#9f7aea' }
              ].map((item, index) => (
                <Grid item xs={6} md={2.4} key={index}>
                  <Card sx={{ textAlign: 'center', bgcolor: `${item.color}15`, border: `2px solid ${item.color}` }}>
                    <CardContent>
                      <Typography variant="h3" sx={{ color: item.color, fontWeight: 'bold' }}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              🔍 Phân Tích Chi Tiết
            </Typography>
            <Typography paragraph sx={{ fontSize: '16px', lineHeight: 1.7 }}>
              {result.analysis}
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#f0fff4', border: '1px solid #38a169' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#38a169', fontWeight: 'bold' }}>
                    💪 Điểm Mạnh
                  </Typography>
                  {result.strengths.map((strength, index) => (
                    <Typography key={index} sx={{ mb: 1 }}>
                      • {strength}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#fff5f5', border: '1px solid #e53e3e' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#e53e3e', fontWeight: 'bold' }}>
                    🎯 Thử Thách
                  </Typography>
                  {result.challenges.map((challenge, index) => (
                    <Typography key={index} sx={{ mb: 1 }}>
                      • {challenge}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 3, mt: 3, bgcolor: '#f7fafc', border: '1px solid #3182ce' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#3182ce', fontWeight: 'bold' }}>
                💼 Hướng Dẫn Nghề Nghiệp
              </Typography>
              <Typography sx={{ mb: 2 }}>
                <strong>Phong cách làm việc:</strong> {result.careerGuidance.workStyle}
              </Typography>
              <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Nghề nghiệp phù hợp:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {result.careerGuidance.suitableCareers.map((career, index) => (
                  <Paper key={index} sx={{ px: 2, py: 1, bgcolor: '#3182ce', color: 'white', borderRadius: 2 }}>
                    <Typography variant="body2">{career}</Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleReset}
                sx={{
                  px: 4,
                  py: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #e53e3e, #9f7aea)',
                  fontWeight: 'bold'
                }}
              >
                🔄 Phân Tích Mới
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default SimpleNumerology;