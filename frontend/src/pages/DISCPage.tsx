/**
 * DISC Assessment Page
 * 
 * Main page component that handles the complete DISC assessment workflow
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Fade
} from '@mui/material';
import {
  Psychology,
  RestartAlt,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import DISCForm from '../components/DISCForm';
import DISCDisplay from '../components/DISCDisplay';
import { type DISCResult } from '../services/discService';

const DISCPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [discResult, setDiscResult] = useState<DISCResult | null>(null);
  const [error, setError] = useState<string>('');

  const steps = ['Introduction', 'Assessment', 'Results'];

  const handleAssessmentComplete = (result: DISCResult) => {
    setDiscResult(result);
    setCurrentStep(2);
    setError('');
  };

  const handleStartAssessment = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setDiscResult(null);
    setError('');
  };

  const handleBackToIntro = () => {
    setCurrentStep(0);
    setError('');
  };

  const handleExportResults = () => {
    // Implementation for PDF export
    console.log('Exporting DISC results...');
    // TODO: Implement PDF generation
  };

  const handleShareResults = () => {
    // Implementation for sharing results
    console.log('Sharing DISC results...');
    // TODO: Implement sharing functionality
  };

  const renderIntroduction = () => (
    <Fade in timeout={600}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Psychology sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
          
          <Typography variant="h3" gutterBottom color="primary">
            DISC Behavioral Assessment
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            Discover your behavioral style and working preferences
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto' }}>
            The DISC assessment is a behavioral profiling tool that helps you understand your
            natural behavioral style and how you adapt to different environments. It measures
            four key dimensions: Dominance, Influence, Steadiness, and Conscientiousness.
          </Typography>

          <Grid container spacing={3} sx={{ my: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: '#FF6B6B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Typography variant="h4" color="white" fontWeight="bold">
                      D
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Dominance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Direct, results-oriented, decisive
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: '#4ECDC4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Typography variant="h4" color="white" fontWeight="bold">
                      I
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Influence
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enthusiastic, social, persuasive
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: '#45B7D1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Typography variant="h4" color="white" fontWeight="bold">
                      S
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Steadiness
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patient, loyal, consistent
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: '#96CEB4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Typography variant="h4" color="white" fontWeight="bold">
                      C
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Conscientiousness
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Analytical, precise, systematic
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Assessment Details:</strong><br />
              • 28 behavioral statements to evaluate<br />
              • Estimated time: 15-20 minutes<br />
              • No right or wrong answers - answer honestly<br />
              • Results provide insights for personal and professional development
            </Typography>
          </Alert>

          <Button
            variant="contained"
            size="large"
            onClick={handleStartAssessment}
            startIcon={<Psychology />}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            Start DISC Assessment
          </Button>
        </Paper>
      </Container>
    </Fade>
  );

  const renderAssessment = () => (
    <Fade in timeout={600}>
      <Box>
        <DISCForm onComplete={handleAssessmentComplete} />
        <Container maxWidth="md" sx={{ mt: 3 }}>
          <Box textAlign="center">
            <Button
              variant="outlined"
              onClick={handleBackToIntro}
              startIcon={<ArrowBack />}
            >
              Back to Introduction
            </Button>
          </Box>
        </Container>
      </Box>
    </Fade>
  );

  const renderResults = () => (
    <Fade in timeout={600}>
      <Box>
        {discResult && (
          <>
            <Container maxWidth="md" sx={{ mb: 3 }}>
              <Alert
                severity="success"
                icon={<CheckCircle />}
                action={
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleRestart}
                      startIcon={<RestartAlt />}
                    >
                      Retake Assessment
                    </Button>
                  </Box>
                }
              >
                <Typography variant="body1">
                  <strong>Assessment Complete!</strong> Your DISC profile has been successfully analyzed.
                  Review your behavioral style and development insights below.
                </Typography>
              </Alert>
            </Container>
            
            <DISCDisplay
              result={discResult}
              candidateName="Demo User" // In real app, get from user context
              onExport={handleExportResults}
              onShare={handleShareResults}
            />
          </>
        )}
      </Box>
    </Fade>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50', py: 3 }}>
      {/* Header with Stepper */}
      <Container maxWidth="lg" sx={{ mb: 3 }}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h4" textAlign="center" gutterBottom color="primary">
            DISC Behavioral Assessment
          </Typography>
          <Stepper activeStep={currentStep} alternativeLabel sx={{ mt: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Container>

      {/* Error Display */}
      {error && (
        <Container maxWidth="md" sx={{ mb: 3 }}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Container>
      )}

      {/* Step Content */}
      <Box>
        {currentStep === 0 && renderIntroduction()}
        {currentStep === 1 && renderAssessment()}
        {currentStep === 2 && renderResults()}
      </Box>
    </Box>
  );
};

export default DISCPage;