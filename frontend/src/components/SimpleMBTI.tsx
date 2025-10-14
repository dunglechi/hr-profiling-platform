import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  Card,
  CardContent,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Backdrop,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { Work, Psychology } from '@mui/icons-material';
import { assessmentAPI } from '../lib/supabase';

interface MBTIResult {
  type: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  careerSuggestions: string[];
  workPreferences: string[];
  communicationStyle: string;
}

const SimpleMBTI: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<MBTIResult | null>(null);

  const questions = [
    {
      id: 0,
      dimension: 'E/I',
      text: "Trong một bữa tiệc, bạn thường:",
      options: [
        { value: "E", text: "Tìm hiểu và trò chuyện với nhiều người mới" },
        { value: "I", text: "Nói chuyện sâu với một vài người quen" }
      ]
    },
    {
      id: 1,
      dimension: 'E/I',
      text: "Sau một ngày dài, bạn cảm thấy thoải mái nhất khi:",
      options: [
        { value: "E", text: "Gặp gỡ bạn bè hoặc tham gia hoạt động xã hội" },
        { value: "I", text: "Ở nhà một mình hoặc với người thân" }
      ]
    },
    {
      id: 2,
      dimension: 'S/N',
      text: "Khi học điều gì đó mới, bạn thích:",
      options: [
        { value: "S", text: "Tìm hiểu các bước cụ thể và ví dụ thực tế" },
        { value: "N", text: "Hiểu ý tưởng tổng quan và khả năng ứng dụng" }
      ]
    },
    {
      id: 3,
      dimension: 'S/N',
      text: "Bạn tin tưởng hơn vào:",
      options: [
        { value: "S", text: "Kinh nghiệm và dữ liệu cụ thể" },
        { value: "N", text: "Trực giác và khả năng sáng tạo" }
      ]
    },
    {
      id: 4,
      dimension: 'T/F',
      text: "Khi đưa ra quyết định quan trọng:",
      options: [
        { value: "T", text: "Phân tích logic và cân nhắc ưu nhược điểm" },
        { value: "F", text: "Cân nhắc cảm xúc và tác động đến mọi người" }
      ]
    },
    {
      id: 5,
      dimension: 'T/F',
      text: "Trong xung đột, điều quan trọng nhất là:",
      options: [
        { value: "T", text: "Tìm ra giải pháp công bằng và logic" },
        { value: "F", text: "Duy trì mối quan hệ và sự hòa hợp" }
      ]
    },
    {
      id: 6,
      dimension: 'J/P',
      text: "Bạn thích làm việc:",
      options: [
        { value: "J", text: "Theo kế hoạch chi tiết và deadline rõ ràng" },
        { value: "P", text: "Linh hoạt và thích nghi với tình huống" }
      ]
    },
    {
      id: 7,
      dimension: 'J/P',
      text: "Cuối tuần lý tưởng của bạn là:",
      options: [
        { value: "J", text: "Có lịch trình cụ thể và hoàn thành công việc" },
        { value: "P", text: "Tự do quyết định và khám phá điều mới" }
      ]
    }
  ];

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setError('');
  };

  const nextQuestion = () => {
    if (!answers[currentQuestion]) {
      setError('Vui lòng chọn một đáp án');
      return;
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async () => {
    setLoading(true);
    
    try {
      // Calculate MBTI type
      const dimensions = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
      
      Object.values(answers).forEach(answer => {
        dimensions[answer as keyof typeof dimensions]++;
      });

      const type = 
        (dimensions.E > dimensions.I ? 'E' : 'I') +
        (dimensions.S > dimensions.N ? 'S' : 'N') +
        (dimensions.T > dimensions.F ? 'T' : 'F') +
        (dimensions.J > dimensions.P ? 'J' : 'P');

      const typeDescriptions: Record<string, any> = {
        'ENTJ': {
          description: 'The Commander - Nhà lãnh đạo tự nhiên, quyết đoán và có tầm nhìn strategically',
          characteristics: ['Lãnh đạo mạnh mẽ', 'Tư duy chiến lược', 'Quyết đoán', 'Có tổ chức'],
          strengths: ['Khả năng lãnh đạo xuất sắc', 'Tư duy logic', 'Có tầm nhìn dài hạn', 'Quyết đoán'],
          challenges: ['Có thể quá nghiêm khắc', 'Thiếu kiên nhẫn', 'Ít chú ý đến cảm xúc'],
          careerSuggestions: ['CEO', 'Quản lý cấp cao', 'Tư vấn kinh doanh', 'Luật sư', 'Chính trị gia'],
          workPreferences: ['Môi trường thách thức', 'Vị trí lãnh đạo', 'Dự án chiến lược'],
          communicationStyle: 'Trực tiếp, rõ ràng và tập trung vào mục tiêu'
        },
        'ENTP': {
          description: 'The Debater - Sáng tạo, đổi mới và thích thử thách các ý tưởng',
          characteristics: ['Sáng tạo', 'Linh hoạt', 'Nhiệt tình', 'Thích tranh luận'],
          strengths: ['Tư duy sáng tạo', 'Thích nghi tốt', 'Truyền cảm hứng', 'Giải quyết vấn đề'],
          challenges: ['Dễ nhàm chán', 'Khó tập trung lâu', 'Tránh chi tiết'],
          careerSuggestions: ['Doanh nhân', 'Nhà sáng tạo', 'Tư vấn', 'Nhà nghiên cứu', 'Marketer'],
          workPreferences: ['Môi trường sáng tạo', 'Dự án đa dạng', 'Tự do sáng tạo'],
          communicationStyle: 'Nhiệt tình, sáng tạo và thích thảo luận ý tưởng'
        },
        'ENFJ': {
          description: 'The Protagonist - Truyền cảm hứng và hỗ trợ người khác phát triển',
          characteristics: ['Đồng cảm', 'Truyền cảm hứng', 'Có tổ chức', 'Quan tâm người khác'],
          strengths: ['Kỹ năng giao tiếp xuất sắc', 'Đồng cảm cao', 'Lãnh đạo tự nhiên', 'Động viên tốt'],
          challenges: ['Quá quan tâm người khác', 'Dễ bị stress', 'Khó từ chối'],
          careerSuggestions: ['Giáo viên', 'Tư vấn', 'HR Manager', 'Nhà tâm lý', 'Coach'],
          workPreferences: ['Làm việc với người', 'Phát triển nhân tài', 'Môi trường hỗ trợ'],
          communicationStyle: 'Ấm áp, khuyến khích và tập trung vào con người'
        },
        'ENFP': {
          description: 'The Campaigner - Nhiệt tình, sáng tạo và luôn tìm kiếm khả năng mới',
          characteristics: ['Nhiệt tình', 'Sáng tạo', 'Linh hoạt', 'Quan tâm người khác'],
          strengths: ['Sáng tạo', 'Giao tiếp tốt', 'Thích nghi cao', 'Truyền cảm hứng'],
          challenges: ['Dễ bị phân tâm', 'Khó tập trung', 'Tránh xung đột'],
          careerSuggestions: ['Nhà báo', 'Nghệ sĩ', 'Marketer', 'Tư vấn', 'Entrepreneur'],
          workPreferences: ['Môi trường sáng tạo', 'Linh hoạt thời gian', 'Tương tác với người'],
          communicationStyle: 'Nhiệt tình, sáng tạo và truyền cảm hứng'
        }
        // Có thể thêm các type khác...
      };

      const defaultResult = {
        description: 'Một nhân cách độc đáo với những đặc điểm riêng biệt',
        characteristics: ['Tư duy độc lập', 'Có cá tính riêng', 'Khả năng thích nghi'],
        strengths: ['Tư duy logic', 'Giao tiếp tốt', 'Làm việc nhóm', 'Sáng tạo'],
        challenges: ['Cần phát triển kỹ năng', 'Cải thiện giao tiếp', 'Quản lý thời gian'],
        careerSuggestions: ['Quản lý', 'Tư vấn', 'Giáo dục', 'Công nghệ', 'Kinh doanh'],
        workPreferences: ['Môi trường hỗ trợ', 'Cơ hội phát triển', 'Làm việc nhóm'],
        communicationStyle: 'Thân thiện và hiệu quả'
      };

      const calculatedResult: MBTIResult = {
        type,
        ...typeDescriptions[type] || defaultResult
      };

      // Save to database
      try {
        await assessmentAPI.saveResult({
          user_id: `anonymous_${Date.now()}`,
          assessment_type: 'MBTI',
          result_data: calculatedResult
        });
      } catch (saveError) {
        console.warn('Could not save to database:', saveError);
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResult(calculatedResult);
      
    } catch (error) {
      setError('Có lỗi xảy ra khi tính toán kết quả. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
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
          <CircularProgress size={60} sx={{ color: '#4caf50', mb: 2 }} />
          <Typography variant="h6">🧠 Đang phân tích tính cách MBTI...</Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Vui lòng chờ trong giây lát
          </Typography>
        </Box>
      </Backdrop>

      {/* Header */}
      <Paper
        elevation={8}
        sx={{
          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          mb: 4
        }}
      >
        <Work sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          🧠 Phân Loại MBTI
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Khám phá tính cách và phong cách làm việc Myers-Briggs
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!result ? (
        /* Assessment Questions */
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Câu hỏi {currentQuestion + 1} / {questions.length}
            </Typography>
            <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
              <Box
                sx={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  bgcolor: '#4caf50',
                  height: 8,
                  borderRadius: 1,
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          </Box>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            {questions[currentQuestion].text}
          </Typography>

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
            >
              {questions[currentQuestion].options.map((option, index) => (
                <Paper
                  key={index}
                  elevation={answers[currentQuestion] === option.value ? 3 : 1}
                  sx={{
                    p: 3,
                    mb: 2,
                    border: answers[currentQuestion] === option.value ? '2px solid #4caf50' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleAnswerChange(currentQuestion, option.value)}
                >
                  <FormControlLabel
                    value={option.value}
                    control={<Radio sx={{ color: '#4caf50' }} />}
                    label={
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {option.text}
                      </Typography>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              sx={{ px: 3 }}
            >
              Quay lại
            </Button>
            
            <Button
              variant="contained"
              onClick={nextQuestion}
              sx={{
                px: 4,
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#2e7d32' }
              }}
            >
              {currentQuestion === questions.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}
            </Button>
          </Box>
        </Paper>
      ) : (
        /* Results Display */
        <Box>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              🧠 Kết Quả Phân Tích MBTI
            </Typography>

            {/* MBTI Type */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Chip
                label={result.type}
                sx={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  height: 80,
                  bgcolor: '#4caf50',
                  color: 'white',
                  '& .MuiChip-label': { px: 4 }
                }}
              />
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: '#4caf50' }}>
                {result.description}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Characteristics */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#f1f8e9', border: '1px solid #4caf50' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                🌟 Đặc Điểm Nổi Bật
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {result.characteristics.map((char, index) => (
                  <Chip 
                    key={index} 
                    label={char} 
                    sx={{ bgcolor: '#4caf50', color: 'white' }}
                  />
                ))}
              </Box>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 3 }}>
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
                    ⚠️ Điểm Cần Phát Triển
                  </Typography>
                  {result.challenges.map((challenge, index) => (
                    <Typography key={index} sx={{ mb: 1 }}>
                      • {challenge}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 3, mb: 3, bgcolor: '#f7fafc', border: '1px solid #3182ce' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#3182ce', fontWeight: 'bold' }}>
                💼 Nghề Nghiệp Phù Hợp
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {result.careerSuggestions.map((career, index) => (
                  <Paper key={index} sx={{ px: 2, py: 1, bgcolor: '#3182ce', color: 'white', borderRadius: 2 }}>
                    <Typography variant="body2">{career}</Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#fffaf0', border: '1px solid #d69e2e' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d69e2e', fontWeight: 'bold' }}>
                    🏢 Môi Trường Làm Việc Lý Tưởng
                  </Typography>
                  {result.workPreferences.map((pref, index) => (
                    <Typography key={index} sx={{ mb: 1 }}>
                      • {pref}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#f3e8ff', border: '1px solid #9f7aea' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#9f7aea', fontWeight: 'bold' }}>
                    💬 Phong Cách Giao Tiếp
                  </Typography>
                  <Typography>
                    {result.communicationStyle}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={resetAssessment}
                sx={{
                  px: 4,
                  py: 2,
                  borderRadius: 2,
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#2e7d32' },
                  fontWeight: 'bold'
                }}
              >
                🔄 Làm Lại Đánh Giá
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default SimpleMBTI;