import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  Psychology,
  Assessment,
  Analytics,
  Home,
  RestartAlt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MBTIForm from './MBTIForm';
import MBTIDisplay from './MBTIDisplay';
import { 
  MBTIResult, 
  createSampleMBTIAssessment,
  getMBTITypeCategory 
} from '../../services/mbtiService';

type MBTIPageState = 'intro' | 'assessment' | 'results';

const MBTIPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState<MBTIPageState>('intro');
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [result, setResult] = useState<MBTIResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const handleStartAssessment = () => {
    try {
      const assessment = createSampleMBTIAssessment();
      setAssessmentId(assessment.assessmentId);
      setCurrentState('assessment');
      setError('');
    } catch (error) {
      setError('Failed to initialize assessment');
      console.error('Error starting MBTI assessment:', error);
    }
  };

  const handleAssessmentComplete = (mbtiResult: MBTIResult) => {
    setResult(mbtiResult);
    setCurrentState('results');
    setProgress(100);
  };

  const handleRestart = () => {
    setCurrentState('intro');
    setResult(null);
    setProgress(0);
    setAssessmentId('');
    setError('');
  };

  const handleShare = () => {
    if (!result) return;
    
    const shareData = {
      title: `My MBTI Result: ${result.type}`,
      text: `I just completed an MBTI assessment and got ${result.type} - ${getMBTITypeCategory(result.type)}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        .then(() => alert('Results copied to clipboard!'))
        .catch(() => setError('Failed to copy to clipboard'));
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    // Create a simple text report
    const report = `
MBTI Personality Assessment Report
=====================================

Type: ${result.type}
Category: ${getMBTITypeCategory(result.type)}
Assessment Date: ${new Date().toLocaleDateString()}

Cognitive Functions:
- Dominant: ${result.cognitiveFunctions.dominant}
- Auxiliary: ${result.cognitiveFunctions.auxiliary}
- Tertiary: ${result.cognitiveFunctions.tertiary}
- Inferior: ${result.cognitiveFunctions.inferior}

Overview:
${result.analysis.overview}

Strengths:
${result.analysis.strengths.map((s: string) => `- ${s}`).join('\n')}

Growth Areas:
${result.analysis.challenges.map((c: string) => `- ${c}`).join('\n')}

Work Preferences:
${result.analysis.workPreferences}

Communication Style:
${result.analysis.communicationStyle}

Leadership Style:
${result.analysis.leadershipStyle}

Career Fit:
${result.analysis.careerFit.map((c: string) => `- ${c}`).join('\n')}

Development Recommendations:
${result.development.recommendations.map((r: string) => `- ${r}`).join('\n')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MBTI_Report_${result.type}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepIndex = () => {
    switch (currentState) {
      case 'intro': return 0;
      case 'assessment': return 1;
      case 'results': return 2;
      default: return 0;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3 }}>
        <Container maxWidth="lg">
          <Breadcrumbs 
            aria-label="breadcrumb" 
            sx={{ color: 'white', mb: 2 }}
            separator="›"
          >
            <Link 
              color="inherit" 
              href="#" 
              onClick={() => navigate('/')}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Link 
              color="inherit" 
              href="#" 
              onClick={() => navigate('/assessments')}
            >
              Assessments
            </Link>
            <Typography color="inherit">MBTI</Typography>
          </Breadcrumbs>
          
          <Box display="flex" alignItems="center" mb={2}>
            <Psychology sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h3" component="h1">
                MBTI Personality Assessment
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Discover your psychological preferences and personality type
              </Typography>
            </Box>
          </Box>

          {/* Progress Stepper */}
          <Stepper activeStep={getStepIndex()} sx={{ mt: 3 }}>
            <Step completed={currentState !== 'intro'}>
              <StepLabel 
                icon={<Psychology />}
                sx={{ 
                  '& .MuiStepLabel-label': { color: 'white' },
                  '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiStepIcon-root.Mui-active': { color: 'white' },
                  '& .MuiStepIcon-root.Mui-completed': { color: 'white' }
                }}
              >
                Introduction
              </StepLabel>
            </Step>
            <Step completed={currentState === 'results'}>
              <StepLabel 
                icon={<Assessment />}
                sx={{ 
                  '& .MuiStepLabel-label': { color: 'white' },
                  '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiStepIcon-root.Mui-active': { color: 'white' },
                  '& .MuiStepIcon-root.Mui-completed': { color: 'white' }
                }}
              >
                Assessment ({progress}%)
              </StepLabel>
            </Step>
            <Step>
              <StepLabel 
                icon={<Analytics />}
                sx={{ 
                  '& .MuiStepLabel-label': { color: 'white' },
                  '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiStepIcon-root.Mui-active': { color: 'white' },
                  '& .MuiStepIcon-root.Mui-completed': { color: 'white' }
                }}
              >
                Results
              </StepLabel>
            </Step>
          </Stepper>
        </Container>
      </Box>

      {/* Error Display */}
      {error && (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Container>
      )}

      {/* Content */}
      <Box sx={{ py: 2 }}>
        {/* Introduction State */}
        {currentState === 'intro' && (
          <Fade in={true}>
            <Container maxWidth="md">
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Psychology sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                
                <Typography variant="h4" component="h2" gutterBottom>
                  Myers-Briggs Type Indicator
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  The MBTI assessment helps you understand your personality preferences across four key dimensions:
                  how you focus your attention, take in information, make decisions, and approach the outside world.
                </Typography>

                <Box display="flex" justifyContent="center" gap={2} my={4} flexWrap="wrap">
                  <Chip 
                    label="Extraversion vs Introversion" 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontSize: '0.9rem', py: 2 }}
                  />
                  <Chip 
                    label="Sensing vs Intuition" 
                    color="secondary" 
                    variant="outlined"
                    sx={{ fontSize: '0.9rem', py: 2 }}
                  />
                  <Chip 
                    label="Thinking vs Feeling" 
                    color="success" 
                    variant="outlined"
                    sx={{ fontSize: '0.9rem', py: 2 }}
                  />
                  <Chip 
                    label="Judging vs Perceiving" 
                    color="warning" 
                    variant="outlined"
                    sx={{ fontSize: '0.9rem', py: 2 }}
                  />
                </Box>

                <Box sx={{ backgroundColor: 'background.paper', p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    What You'll Discover:
                  </Typography>
                  <Box textAlign="left" display="inline-block">
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      • Your 4-letter personality type (e.g., INFP, ESTJ)
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      • Cognitive functions stack and mental processes
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      • Strengths, growth areas, and development recommendations
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      • Work preferences and career fit analysis
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                      • Communication style and relationship compatibility
                    </Typography>
                    <Typography variant="body2" component="div">
                      • Leadership style and team role insights
                    </Typography>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
                  <Typography variant="body2">
                    <strong>Time Required:</strong> 15-20 minutes<br />
                    <strong>Questions:</strong> 60 carefully crafted items<br />
                    <strong>Note:</strong> Answer honestly based on your natural preferences, not what you think is expected.
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartAssessment}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    boxShadow: 3 
                  }}
                >
                  Start MBTI Assessment
                </Button>
              </Paper>
            </Container>
          </Fade>
        )}

        {/* Assessment State */}
        {currentState === 'assessment' && (
          <Fade in={true}>
            <div>
              <MBTIForm
                assessmentId={assessmentId}
                onComplete={handleAssessmentComplete}
                onProgress={setProgress}
              />
            </div>
          </Fade>
        )}

        {/* Results State */}
        {currentState === 'results' && result && (
          <Fade in={true}>
            <div>
              <MBTIDisplay
                result={result}
                onShare={handleShare}
                onDownload={handleDownload}
              />
              
              {/* Action Buttons */}
              <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    What's Next?
                  </Typography>
                  <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      startIcon={<RestartAlt />}
                      onClick={handleRestart}
                    >
                      Take Again
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/assessments')}
                    >
                      Try Other Assessments
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard')}
                    >
                      View Dashboard
                    </Button>
                  </Box>
                </Paper>
              </Container>
            </div>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default MBTIPage;