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
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Work, 
  Psychology, 
  CheckCircle, 
  Warning, 
  Favorite,
  ExpandMore,
  TrendingUp,
  Group,
  School,
  Business
} from '@mui/icons-material';
import { assessmentAPI } from '../lib/supabase';
import MBTICalculator, { 
  MBTI_QUESTIONS, 
  MBTIResult as ComprehensiveMBTIResult,
  MBTIPersonalityType 
} from '../services/mbtiCalculator';

const SimpleMBTI: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ComprehensiveMBTIResult | null>(null);
  const [userName, setUserName] = useState('');

  const progress = ((currentQuestion + 1) / MBTI_QUESTIONS.length) * 100;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResult = async () => {
    try {
      setLoading(true);
      setError('');

      // Calculate MBTI result using comprehensive calculator
      const mbtiResult = MBTICalculator.calculateType(answers);
      setResult(mbtiResult);

      // Save to database
      const userId = userName || `mbti-user-${Date.now()}`;
      await assessmentAPI.saveAssessment({
        user_id: userId,
        assessment_type: 'MBTI',
        result_data: {
          personalityType: mbtiResult.type,
          scores: mbtiResult.scores,
          cognitiveFunctions: mbtiResult.cognitiveFunctions,
          description: mbtiResult.description,
          careerRecommendations: mbtiResult.careerRecommendations,
          strengths: mbtiResult.strengths,
          challenges: mbtiResult.challenges,
          relationships: mbtiResult.relationships,
          answers: answers,
          timestamp: new Date().toISOString()
        }
      });

    } catch (err: any) {
      setError('Có lỗi xảy ra khi tính toán kết quả. Vui lòng thử lại.');
      console.error('MBTI calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setError('');
    setUserName('');
  };

  // Render loading screen
  if (loading) {
    return (
      <Backdrop open={true} style={{ zIndex: 1000, color: '#fff' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Đang phân tích tính cách của bạn...
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  // Render result screen
  if (result) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Paper 
          elevation={4}
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            borderRadius: 3
          }}
        >
          <Psychology sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            🎭 {result.type} - {result.description.nickname}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {result.description.summary}
          </Typography>
        </Paper>

        {/* Main Result Content */}
        <Grid container spacing={3}>
          {/* Personality Description */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                  📋 Mô Tả Tính Cách
                </Typography>
                <Typography variant="body1" paragraph>
                  {result.description.detailedDescription}
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      💬 Phong Cách Giao Tiếp
                    </Typography>
                    <Typography variant="body2">
                      {result.description.communicationStyle}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      🏢 Phong Cách Làm Việc
                    </Typography>
                    <Typography variant="body2">
                      {result.description.workStyle}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      📚 Phong Cách Học Tập
                    </Typography>
                    <Typography variant="body2">
                      {result.description.learningStyle}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Dimension Scores */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                  📊 Điểm Số Các Chiều
                </Typography>
                {Object.entries(result.scores).map(([dimension, score]) => {
                  const labels = {
                    EI: ['Extraversion', 'Introversion'],
                    SN: ['Sensing', 'Intuition'], 
                    TF: ['Thinking', 'Feeling'],
                    JP: ['Judging', 'Perceiving']
                  };
                  const [pos, neg] = labels[dimension as keyof typeof labels];
                  const percentage = ((score + 4) / 8) * 100; // Normalize to 0-100%
                  
                  return (
                    <Box key={dimension} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="bold">
                          {dimension}: {score > 0 ? pos : neg}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.abs(score)}/4
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 1,
                          backgroundColor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: score > 0 ? '#4caf50' : '#2196f3'
                          }
                        }} 
                      />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          {/* Cognitive Functions */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                  🧠 Các Chức Năng Nhận Thức
                </Typography>
                <List>
                  {result.cognitiveFunctions.map((func, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <Chip 
                          label={func.position} 
                          size="small" 
                          color={index === 0 ? 'primary' : index === 1 ? 'secondary' : 'default'}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={func.name}
                        secondary={func.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Strengths & Challenges */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                  💪 Điểm Mạnh
                </Typography>
                <List>
                  {result.strengths.map((strength, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary={strength} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="warning" fontWeight="bold">
                  ⚠️ Thách Thức Cần Phát Triển
                </Typography>
                <List>
                  {result.challenges.map((challenge, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={challenge} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Career Recommendations */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                  🚀 Gợi Ý Nghề Nghiệp
                </Typography>
                <Grid container spacing={2}>
                  {result.careerRecommendations.map((career, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Business color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" color="primary">
                              {career.category}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {career.reasoning}
                          </Typography>
                          <Typography variant="subtitle2" gutterBottom>
                            Nghề nghiệp phù hợp:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {career.jobs.map((job, jobIndex) => (
                              <Chip key={jobIndex} label={job} size="small" variant="outlined" />
                            ))}
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                            <strong>Môi trường:</strong> {career.workEnvironment}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Relationship Style */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                  💕 Phong Cách Quan Hệ
                </Typography>
                <Typography variant="body1" paragraph>
                  {result.relationships.approach}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      🌟 Tương Thích Tốt Nhất
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {result.relationships.compatibility.best.map((type, index) => (
                        <Chip key={index} label={type} color="success" size="small" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" color="info.main" gutterBottom>
                      👍 Tương Thích Tốt
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {result.relationships.compatibility.good.map((type, index) => (
                        <Chip key={index} label={type} color="info" size="small" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      🤔 Cần Nỗ Lực
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {result.relationships.compatibility.challenging.map((type, index) => (
                        <Chip key={index} label={type} color="warning" size="small" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }} color="primary">
                  💡 Lời Khuyên Quan Hệ
                </Typography>
                <List>
                  {result.relationships.tips.map((tip, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Favorite color="secondary" />
                      </ListItemIcon>
                      <ListItemText primary={tip} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box textAlign="center" sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={resetTest}
                sx={{ mr: 2 }}
              >
                Làm Lại Test
              </Button>
              <Button
                variant="contained"
                onClick={() => window.print()}
              >
                In Kết Quả
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Render question screen
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper 
        elevation={4}
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          borderRadius: 3
        }}
      >
        <Psychology sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h3" gutterBottom fontWeight="bold">
          🎭 MBTI Personality Test
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Khám phá 16 kiểu tính cách Myers-Briggs của bạn
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Progress */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Câu hỏi {currentQuestion + 1} / {MBTI_QUESTIONS.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}% hoàn thành
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Paper>

      {/* Current Question */}
      {currentQ && (
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {currentQ.question}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Chiều đánh giá: <strong>{currentQ.dimension}</strong>
          </Typography>
          
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswer(currentQ.id, parseInt(e.target.value))}
            >
              {currentQ.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option.score}
                  control={<Radio />}
                  label={
                    <Typography variant="body1" sx={{ py: 1 }}>
                      {option.text}
                    </Typography>
                  }
                  sx={{ 
                    mb: 1,
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'primary.main'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
      )}

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          ← Câu Trước
        </Button>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!hasAnswer}
        >
          {currentQuestion === MBTI_QUESTIONS.length - 1 ? 'Hoàn Thành' : 'Câu Tiếp Theo →'}
        </Button>
      </Box>
    </Container>
  );
};

export default SimpleMBTI;