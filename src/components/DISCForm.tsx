/**
 * DISC Assessment Form Component
 * 
 * Interactive questionnaire for DISC behavioral assessment
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  LinearProgress,
  Paper,
  Alert,
  Divider,
  Chip,
  Grid,
  Container,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Psychology,
  QuestionAnswer,
  Timer,
  NavigateNext,
  NavigateBefore,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Info
} from '@mui/icons-material';
import {
  fetchDISCQuestions,
  submitDISCAssessment,
  validateDISCResponses,
  getDISCStyleColor,
  createSampleAssessment,
  type DISCQuestion,
  type DISCResponse,
  type DISCInstructions
} from '../services/discService';

interface DISCFormProps {
  onComplete: (result: any) => void;
  assessmentId?: string;
}

const DISCForm: React.FC<DISCFormProps> = ({ onComplete, assessmentId }) => {
  const [questions, setQuestions] = useState<DISCQuestion[]>([]);
  const [instructions, setInstructions] = useState<DISCInstructions | null>(null);
  const [responses, setResponses] = useState<DISCResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentAssessmentId, setCurrentAssessmentId] = useState(assessmentId);

  // Pagination settings
  const questionsPerPage = 4;
  const totalPages = Math.ceil(28 / questionsPerPage);
  const currentPage = Math.floor(currentQuestionIndex / questionsPerPage);

  useEffect(() => {
    loadQuestions();
    if (!assessmentId) {
      // Create sample assessment for testing
      const { assessmentId: sampleId } = createSampleAssessment();
      setCurrentAssessmentId(sampleId);
    }
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetchDISCQuestions();
      if (response.success) {
        setQuestions(response.data.questions);
        setInstructions(response.data.instructions);
        // Initialize responses array
        setResponses(response.data.questions.map(q => ({
          questionId: q.id,
          mostLike: false,
          leastLike: false,
          neutral: false
        })));
      } else {
        setError(response.error || 'Failed to load questions');
      }
    } catch (err) {
      setError('Failed to load DISC questions');
    }
    setLoading(false);
  };

  const handleResponseChange = (questionId: number, responseType: 'mostLike' | 'leastLike' | 'neutral') => {
    setResponses(prev => prev.map(response =>
      response.questionId === questionId
        ? {
            ...response,
            mostLike: responseType === 'mostLike',
            leastLike: responseType === 'leastLike',
            neutral: responseType === 'neutral'
          }
        : response
    ));
  };

  const getSelectedValue = (questionId: number): string => {
    const response = responses.find(r => r.questionId === questionId);
    if (!response) return '';
    if (response.mostLike) return 'mostLike';
    if (response.leastLike) return 'leastLike';
    if (response.neutral) return 'neutral';
    return '';
  };

  const isQuestionAnswered = (questionId: number): boolean => {
    return getSelectedValue(questionId) !== '';
  };

  const getCurrentPageQuestions = () => {
    const startIndex = currentPage * questionsPerPage;
    const endIndex = Math.min(startIndex + questionsPerPage, questions.length);
    return questions.slice(startIndex, endIndex);
  };

  const canGoNext = (): boolean => {
    const currentPageQuestions = getCurrentPageQuestions();
    return currentPageQuestions.every(q => isQuestionAnswered(q.id));
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentQuestionIndex((currentPage + 1) * questionsPerPage);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentQuestionIndex((currentPage - 1) * questionsPerPage);
    }
  };

  const handleStartAssessment = () => {
    setShowInstructions(false);
    setStartTime(new Date());
  };

  const handleSubmit = async () => {
    if (!currentAssessmentId) {
      setError('No assessment ID available');
      return;
    }

    const validation = validateDISCResponses(responses);
    if (!validation.isValid) {
      setError(`Please complete all questions: ${validation.errors.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitDISCAssessment(currentAssessmentId, responses);
      if (result.success && result.data) {
        onComplete(result.data);
      } else {
        setError(result.error || 'Failed to submit assessment');
      }
    } catch (err) {
      setError('Failed to submit DISC assessment');
    }
    setSubmitting(false);
  };

  const getProgress = (): number => {
    const validation = validateDISCResponses(responses);
    return validation.progress;
  };

  const getElapsedTime = (): string => {
    if (!startTime) return '0:00';
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <LinearProgress sx={{ width: 200, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading DISC Assessment...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (showInstructions && instructions) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
          <Box textAlign="center" mb={3}>
            <Psychology sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="primary">
              {instructions.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              {instructions.description}
            </Typography>
          </Box>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Timer sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Time Required
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {instructions.timeEstimate}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <QuestionAnswer sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Questions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {questions.length} behavioral statements
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Assessment Type
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  DISC Behavioral Analysis
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Response Options:
          </Typography>
          <Grid container spacing={2} mb={3}>
            {instructions.options.map((option, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {option.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h6" gutterBottom>
            Important Tips:
          </Typography>
          <Box mb={3}>
            {instructions.tips.map((tip, index) => (
              <Box key={index} display="flex" alignItems="center" mb={1}>
                <Info sx={{ color: 'info.main', mr: 1, fontSize: 20 }} />
                <Typography variant="body2">{tip}</Typography>
              </Box>
            ))}
          </Box>

          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              onClick={handleStartAssessment}
              startIcon={<Psychology />}
              sx={{ px: 4, py: 1.5 }}
            >
              Start DISC Assessment
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Progress Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, position: 'sticky', top: 0, zIndex: 100 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              DISC Behavioral Assessment
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Page {currentPage + 1} of {totalPages}
              </Typography>
              <Chip
                label={`${getProgress()}% Complete`}
                color={getProgress() === 100 ? 'success' : 'primary'}
                size="small"
              />
              {startTime && (
                <Chip
                  label={`Time: ${getElapsedTime()}`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <LinearProgress
              variant="determinate"
              value={getProgress()}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Stepper */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stepper activeStep={currentPage} alternativeLabel>
          {Array.from({ length: totalPages }).map((_, index) => (
            <Step key={index}>
              <StepLabel>
                Questions {index * questionsPerPage + 1}-{Math.min((index + 1) * questionsPerPage, 28)}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Questions */}
      <Grid container spacing={3}>
        {getCurrentPageQuestions().map((question, index) => (
          <Grid item xs={12} md={6} key={question.id}>
            <Card
              elevation={isQuestionAnswered(question.id) ? 3 : 1}
              sx={{
                border: isQuestionAnswered(question.id) ? `2px solid ${getDISCStyleColor(question.dimension)}` : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip
                    label={question.dimension}
                    sx={{
                      backgroundColor: getDISCStyleColor(question.dimension),
                      color: 'white',
                      fontWeight: 'bold',
                      mr: 2
                    }}
                  />
                  <Typography variant="subtitle2" color="text.secondary">
                    Question {question.id}
                  </Typography>
                  {isQuestionAnswered(question.id) && (
                    <CheckCircle sx={{ ml: 'auto', color: 'success.main' }} />
                  )}
                </Box>
                
                <Typography variant="h6" paragraph>
                  {question.text}
                </Typography>

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={getSelectedValue(question.id)}
                    onChange={(e) => handleResponseChange(question.id, e.target.value as any)}
                  >
                    <FormControlLabel
                      value="mostLike"
                      control={<Radio />}
                      label="Most like me"
                    />
                    <FormControlLabel
                      value="neutral"
                      control={<Radio />}
                      label="Somewhat like me"
                    />
                    <FormControlLabel
                      value="leastLike"
                      control={<Radio />}
                      label="Least like me"
                    />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Navigation */}
      <Paper elevation={2} sx={{ p: 3, mt: 4, position: 'sticky', bottom: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentPage === 0}
            startIcon={<NavigateBefore />}
          >
            Previous
          </Button>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              {getCurrentPageQuestions().filter(q => isQuestionAnswered(q.id)).length} of{' '}
              {getCurrentPageQuestions().length} questions answered on this page
            </Typography>
          </Box>

          {currentPage < totalPages - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canGoNext()}
              endIcon={<NavigateNext />}
            >
              Next Page
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              disabled={getProgress() !== 100 || submitting}
              endIcon={submitting ? null : <CheckCircle />}
            >
              {submitting ? 'Submitting...' : 'Complete Assessment'}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default DISCForm;