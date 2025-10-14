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
  FormLabel,
  Backdrop,
  CircularProgress,
  Divider
} from '@mui/material';
import { BarChart, Psychology, AutoAwesome } from '@mui/icons-material';
import { assessmentAPI } from '../lib/supabase';

interface DISCResult {
  scores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  primaryStyle: string;
  description: string;
  strengths: string[];
  challenges: string[];
  workStyle: string;
  communicationStyle: string;
}

const SimpleDISC: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<DISCResult | null>(null);
  const [userName, setUserName] = useState('');

  const questions = [
    {
      id: 0,
      text: "Trong nhóm làm việc, bạn thường:",
      options: [
        { value: "D", text: "Dẫn dắt và đưa ra quyết định" },
        { value: "I", text: "Tạo không khí vui vẻ và hăng hái" },
        { value: "S", text: "Hỗ trợ và lắng nghe mọi người" },
        { value: "C", text: "Phân tích và đưa ra giải pháp chi tiết" }
      ]
    },
    {
      id: 1,
      text: "Khi đối mặt với thách thức:",
      options: [
        { value: "D", text: "Hành động ngay lập tức để giải quyết" },
        { value: "I", text: "Tìm kiếm sự hỗ trợ từ người khác" },
        { value: "S", text: "Cân nhắc kỹ lưỡng trước khi quyết định" },
        { value: "C", text: "Thu thập thông tin và phân tích kỹ càng" }
      ]
    },
    {
      id: 2,
      text: "Trong giao tiếp, bạn thích:",
      options: [
        { value: "D", text: "Nói thẳng, đi thẳng vào vấn đề" },
        { value: "I", text: "Trò chuyện thân thiện và nhiệt tình" },
        { value: "S", text: "Lắng nghe và thấu hiểu" },
        { value: "C", text: "Trình bày logic và có căn cứ" }
      ]
    },
    {
      id: 3,
      text: "Môi trường làm việc lý tưởng của bạn là:",
      options: [
        { value: "D", text: "Đầy thách thức và cạnh tranh" },
        { value: "I", text: "Năng động và có nhiều tương tác" },
        { value: "S", text: "Ổn định và hòa đồng" },
        { value: "C", text: "Có tổ chức và chính xác" }
      ]
    },
    {
      id: 4,
      text: "Khi làm việc trong dự án:",
      options: [
        { value: "D", text: "Muốn kiểm soát tiến độ và kết quả" },
        { value: "I", text: "Tập trung vào việc truyền cảm hứng cho team" },
        { value: "S", text: "Đảm bảo mọi người cảm thấy thoải mái" },
        { value: "C", text: "Chú ý đến chi tiết và chất lượng" }
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
      // Calculate DISC scores
      const scores = { D: 0, I: 0, S: 0, C: 0 };
      
      Object.values(answers).forEach(answer => {
        scores[answer as keyof typeof scores]++;
      });

      // Determine primary style
      const maxScore = Math.max(...Object.values(scores));
      const primaryStyle = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'D';
      
      const styleDescriptions = {
        D: 'Dominant - Bạn là người quyết đoán, thích lãnh đạo và đối mặt với thách thức',
        I: 'Influential - Bạn là người hướng ngoại, thích giao tiếp và truyền cảm hứng',
        S: 'Steady - Bạn là người ổn định, đáng tin cậy và hỗ trợ tốt',
        C: 'Compliant - Bạn là người cẩn thận, có tổ chức và chú ý chi tiết'
      };

      const styleStrengths = {
        D: ['Quyết đoán', 'Lãnh đạo', 'Dám chấp nhận rủi ro', 'Hành động nhanh'],
        I: ['Giao tiếp tốt', 'Lạc quan', 'Thuyết phục', 'Sáng tạo'],
        S: ['Kiên nhẫn', 'Đáng tin cậy', 'Hỗ trợ tốt', 'Lắng nghe'],
        C: ['Chính xác', 'Có tổ chức', 'Phân tích tốt', 'Chất lượng cao']
      };

      const styleChallenges = {
        D: ['Có thể quá cứng rắn', 'Thiếu kiên nhẫn', 'Ít chú ý đến cảm xúc'],
        I: ['Có thể thiếu chi tiết', 'Dễ bị phân tâm', 'Quá lạc quan'],
        S: ['Chậm thích nghi', 'Tránh xung đột', 'Khó từ chối'],
        C: ['Quá cầu toàn', 'Chậm quyết định', 'Tránh rủi ro']
      };

      const workStyles = {
        D: 'Làm việc độc lập, thích kiểm soát và đạt kết quả nhanh',
        I: 'Làm việc nhóm, thích môi trường sôi động và có nhiều tương tác',
        S: 'Làm việc ổn định, thích môi trường hòa đồng và hỗ trợ lẫn nhau',
        C: 'Làm việc cẩn thận, thích môi trường có quy trình và chuẩn mực cao'
      };

      const communicationStyles = {
        D: 'Trực tiếp, ngắn gọn, tập trung vào kết quả',
        I: 'Nhiệt tình, thân thiện, tập trung vào con người',
        S: 'Kiên nhẫn, lắng nghe, tập trung vào sự hòa hợp',
        C: 'Logic, chi tiết, tập trung vào dữ liệu và sự chính xác'
      };

      const calculatedResult: DISCResult = {
        scores,
        primaryStyle,
        description: styleDescriptions[primaryStyle as keyof typeof styleDescriptions],
        strengths: styleStrengths[primaryStyle as keyof typeof styleStrengths],
        challenges: styleChallenges[primaryStyle as keyof typeof styleChallenges],
        workStyle: workStyles[primaryStyle as keyof typeof workStyles],
        communicationStyle: communicationStyles[primaryStyle as keyof typeof communicationStyles]
      };

      // Save to database
      try {
        await assessmentAPI.saveResult({
          user_id: `anonymous_${Date.now()}`,
          assessment_type: 'DISC',
          result_data: calculatedResult
        });
      } catch (saveError) {
        console.warn('Could not save to database:', saveError);
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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

  const getStyleColor = (style: string) => {
    const colors = { D: '#e53e3e', I: '#d69e2e', S: '#38a169', C: '#3182ce' };
    return colors[style as keyof typeof colors] || '#718096';
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
          <CircularProgress size={60} sx={{ color: '#e91e63', mb: 2 }} />
          <Typography variant="h6">📊 Đang phân tích phong cách DISC...</Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Vui lòng chờ trong giây lát
          </Typography>
        </Box>
      </Backdrop>

      {/* Header */}
      <Paper
        elevation={8}
        sx={{
          background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          mb: 4
        }}
      >
        <BarChart sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          📊 Đánh Giá DISC
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Khám phá phong cách hành vi và giao tiếp của bạn
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
                  bgcolor: '#e91e63',
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
                    p: 2,
                    mb: 2,
                    border: answers[currentQuestion] === option.value ? '2px solid #e91e63' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleAnswerChange(currentQuestion, option.value)}
                >
                  <FormControlLabel
                    value={option.value}
                    control={<Radio sx={{ color: '#e91e63' }} />}
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
                bgcolor: '#e91e63',
                '&:hover': { bgcolor: '#ad1457' }
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
              📊 Kết Quả Đánh Giá DISC
            </Typography>

            {/* DISC Scores */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {Object.entries(result.scores).map(([style, score]) => (
                <Grid item xs={6} md={3} key={style}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    bgcolor: `${getStyleColor(style)}15`,
                    border: `2px solid ${getStyleColor(style)}`,
                    transform: style === result.primaryStyle ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <CardContent>
                      <Typography variant="h2" sx={{ 
                        color: getStyleColor(style), 
                        fontWeight: 'bold' 
                      }}>
                        {style}
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        color: getStyleColor(style),
                        fontWeight: 'bold',
                        mb: 1
                      }}>
                        {score}
                      </Typography>
                      {style === result.primaryStyle && (
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold',
                          color: getStyleColor(style)
                        }}>
                          Phong cách chính
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Primary Style Description */}
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: `${getStyleColor(result.primaryStyle)}15`,
              border: `2px solid ${getStyleColor(result.primaryStyle)}`
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                color: getStyleColor(result.primaryStyle),
                fontWeight: 'bold'
              }}>
                🎯 Phong Cách Chính: {result.primaryStyle}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '16px', lineHeight: 1.7 }}>
                {result.description}
              </Typography>
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
                    ⚠️ Điểm Cần Cải Thiện
                  </Typography>
                  {result.challenges.map((challenge, index) => (
                    <Typography key={index} sx={{ mb: 1 }}>
                      • {challenge}
                    </Typography>
                  ))}
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#f7fafc', border: '1px solid #3182ce' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#3182ce', fontWeight: 'bold' }}>
                    💼 Phong Cách Làm Việc
                  </Typography>
                  <Typography>
                    {result.workStyle}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#fffaf0', border: '1px solid #d69e2e' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d69e2e', fontWeight: 'bold' }}>
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
                  bgcolor: '#e91e63',
                  '&:hover': { bgcolor: '#ad1457' },
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

export default SimpleDISC;