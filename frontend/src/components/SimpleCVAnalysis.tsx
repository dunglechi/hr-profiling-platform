import React, { useState, useCallback } from 'react';
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
  Backdrop,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CloudUpload,
  Description,
  CheckCircle,
  Warning,
  TrendingUp,
  Work,
  School,
  Psychology,
  ExpandMore,
  Assessment,
  Star,
  Person
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { cvAnalysisService, CVAnalysisResult } from '../services/cvAnalysisService';
import { extractTextFromFile, validateFile } from '../utils/fileExtraction';

const SimpleCVAnalysis: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // File upload handling with react-dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'File không hợp lệ');
        return;
      }
      
      setUploadedFile(file);
      setError('');
      analyzeCV(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // Extract text from uploaded file
  const analyzeCV = async (file: File) => {
    try {
      setUploading(true);
      setAnalyzing(true);
      setError('');

      // Extract text from file using utility function
      const cvText = await extractTextFromFile(file);
      
      setUploading(false);
      
      // Analyze with AI service
      const result = await cvAnalysisService.analyzCV({
        cvText,
        analysisType: 'comprehensive'
      });
      
      setAnalysisResult(result);
      
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi phân tích CV. Vui lòng thử lại.');
      console.error('CV Analysis error:', err);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setUploadedFile(null);
    setError('');
  };

  // Render loading screen
  if (analyzing) {
    return (
      <Backdrop open={true} style={{ zIndex: 1000, color: '#fff' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            🤖 AI đang phân tích CV của bạn...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Đang trích xuất kỹ năng, kinh nghiệm và đánh giá phù hợp
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  // Render analysis results
  if (analysisResult) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Paper 
          elevation={4}
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            color: 'white',
            textAlign: 'center',
            borderRadius: 3
          }}
        >
          <Assessment sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            🤖 Phân Tích CV Bằng AI
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Kết quả phân tích cho: {uploadedFile?.name}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
            Điểm tổng thể: <strong>{analysisResult.fitAnalysis.overallScore}/100</strong>
          </Typography>
        </Paper>

        {/* Overall Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Person sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Thông Tin Cơ Bản
                </Typography>
                <Typography variant="body2">
                  <strong>Tên:</strong> {analysisResult.extractedData.name || 'Không xác định'}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {analysisResult.extractedData.email || 'Không có'}
                </Typography>
                <Typography variant="body2">
                  <strong>Điện thoại:</strong> {analysisResult.extractedData.phone || 'Không có'}
                </Typography>
                <Typography variant="body2">
                  <strong>Địa điểm:</strong> {analysisResult.extractedData.location || 'Không có'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Kinh Nghiệm
                </Typography>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {analysisResult.experience.totalYears} năm
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Cấp độ: <strong>{analysisResult.experience.seniorityLevel}</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Quỹ đạo: {analysisResult.experience.careerProgression.trajectory}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Star sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Điểm Phù Hợp
                </Typography>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {analysisResult.fitAnalysis.overallScore}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysisResult.fitAnalysis.overallScore} 
                  sx={{ mt: 2, height: 8, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Skills Analysis */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
              🛠️ Phân Tích Kỹ Năng
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Kỹ Năng Kỹ Thuật ({analysisResult.skills.technical.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {analysisResult.skills.technical.map((skill, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {skill.skill}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Typography variant="body2">Trình độ:</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={skill.proficiencyLevel * 20} 
                            sx={{ flexGrow: 1, height: 6 }}
                          />
                          <Typography variant="body2">{skill.proficiencyLevel}/5</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {skill.yearsOfExperience} năm kinh nghiệm
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Kỹ Năng Mềm ({analysisResult.skills.soft.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {analysisResult.skills.soft.map((skill, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {skill.skill}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={skill.proficiencyLevel * 20} 
                          sx={{ mt: 1, height: 6 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Độ phù hợp: {skill.relevanceScore}/10
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Kỹ Năng Lãnh Đạo ({analysisResult.skills.leadership.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {analysisResult.skills.leadership.map((skill, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {skill.skill}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={skill.proficiencyLevel * 20} 
                          sx={{ mt: 1, height: 6 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {skill.evidenceText}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Behavioral Analysis */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
              🧠 Phân Tích Hành Vi
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(analysisResult.behavioral).map(([key, behavior]) => (
                <Grid item xs={12} md={6} key={key}>
                  <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {key === 'communicationStyle' && '💬 Phong Cách Giao Tiếp'}
                      {key === 'leadershipPotential' && '👑 Tiềm Năng Lãnh Đạo'}
                      {key === 'teamCollaboration' && '🤝 Hợp Tác Nhóm'}
                      {key === 'problemSolving' && '🧩 Giải Quyết Vấn Đề'}
                      {key === 'adaptability' && '🔄 Khả Năng Thích Ứng'}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Typography variant="body2">Điểm:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={behavior.score * 10} 
                        sx={{ flexGrow: 1, height: 8 }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {behavior.score}/10
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {behavior.reasoning}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Độ tin cậy: {behavior.confidence}%
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Fit Analysis */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="success.main" fontWeight="bold">
                  💪 Điểm Mạnh
                </Typography>
                <List>
                  {analysisResult.fitAnalysis.strengths.map((strength, index) => (
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
                <Typography variant="h5" gutterBottom color="warning.main" fontWeight="bold">
                  ⚠️ Điểm Cần Lưu Ý
                </Typography>
                <List>
                  {analysisResult.fitAnalysis.concerns.map((concern, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={concern} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recommendations */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
              💡 Khuyến Nghị
            </Typography>
            <List>
              {analysisResult.fitAnalysis.recommendations.map((recommendation, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Psychology color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Education & Certifications */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                  🎓 Học Vấn
                </Typography>
                {analysisResult.extractedData.education.map((edu, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Typography variant="h6">{edu.degree}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {edu.institution} {edu.year && `(${edu.year})`}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Typography variant="body2">Độ phù hợp:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={edu.relevanceScore * 10} 
                        sx={{ flexGrow: 1, height: 6 }}
                      />
                      <Typography variant="body2">{edu.relevanceScore}/10</Typography>
                    </Box>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                  🏆 Chứng Chỉ
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {analysisResult.extractedData.certifications.map((cert, index) => (
                    <Chip 
                      key={index} 
                      label={cert} 
                      color="primary" 
                      variant="outlined"
                      icon={<CheckCircle />}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box textAlign="center">
          <Button
            variant="outlined"
            onClick={resetAnalysis}
            sx={{ mr: 2 }}
          >
            Phân Tích CV Khác
          </Button>
          <Button
            variant="contained"
            onClick={() => window.print()}
          >
            In Báo Cáo
          </Button>
        </Box>
      </Container>
    );
  }

  // Render upload screen
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper 
        elevation={4}
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
          color: 'white',
          textAlign: 'center',
          borderRadius: 3
        }}
      >
        <CloudUpload sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h3" gutterBottom fontWeight="bold">
          🤖 Phân Tích CV Bằng AI
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Tải lên CV để nhận phân tích chi tiết về kỹ năng, kinh nghiệm và độ phù hợp
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Paper 
        {...getRootProps()}
        elevation={3} 
        sx={{ 
          p: 6, 
          textAlign: 'center',
          border: isDragActive ? '2px dashed #ff6b6b' : '2px dashed #ccc',
          backgroundColor: isDragActive ? '#fff5f5' : '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            borderColor: '#ff6b6b'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 64, color: '#ff6b6b', mb: 2 }} />
        
        {isDragActive ? (
          <Typography variant="h6" color="primary">
            Thả file CV vào đây...
          </Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Kéo thả file CV hoặc click để chọn
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Hỗ trợ: PDF, DOCX, DOC, TXT (Tối đa 10MB)
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{ mt: 2, bgcolor: '#ff6b6b', '&:hover': { bgcolor: '#ee5a52' } }}
            >
              Chọn File CV
            </Button>
          </>
        )}
      </Paper>

      {/* Features Overview */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Phân Tích Kỹ Năng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trích xuất và đánh giá tất cả kỹ năng kỹ thuật, mềm và lãnh đạo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Đánh Giá Kinh Nghiệm
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phân tích quỹ đạo nghề nghiệp và cấp độ kinh nghiệm
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Psychology sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Chỉ Số Hành Vi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đánh giá phong cách giao tiếp và tiềm năng lãnh đạo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SimpleCVAnalysis;