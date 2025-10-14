import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology,
  Timer,
  CheckCircle,
  Info,
  NavigateNext,
  NavigateBefore
} from '@mui/icons-material';
import { 
  fetchMBTIQuestions, 
  submitMBTIAssessment, 
  validateMBTIResponses,
  MBTIQuestion, 
  MBTIResponse, 
  MBTIResult,
  MBTIInstructions
} from '../../services/mbtiService';

interface MBTIFormProps {
  assessmentId?: string;
  onComplete?: (result: MBTIResult) => void;
  onProgress?: (progress: number) => void;
}

const MBTIForm: React.FC<MBTIFormProps> = ({ 
  assessmentId, 
  onComplete, 
  onProgress 
}) => {
  const [questions, setQuestions] = useState<MBTIQuestion[]>([]);
  const [instructions, setInstructions] = useState<MBTIInstructions | null>(null);
  const [responses, setResponses] = useState<MBTIResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [validation, setValidation] = useState({ 
    isValid: false, 
    errors: [], 
    progress: 0 
  });

  const questionsPerPage = 10;
  const totalPages = Math.ceil(60 / questionsPerPage);
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  useEffect(() => {
    loadMBTIQuestions();
  }, []);

  useEffect(() => {
    const validationResult = validateMBTIResponses(responses);
    setValidation(validationResult);
    onProgress?.(validationResult.progress);
  }, [responses, onProgress]);

  const loadMBTIQuestions = async () => {
    try {
      setLoading(true);
      const result = await fetchMBTIQuestions();
      
      if (result.success) {
        setQuestions(result.data.questions);
        setInstructions(result.data.instructions);
        // Initialize responses array
        setResponses(result.data.questions.map(q => ({
          questionId: q.id,
          stronglyAgree: false,
          agree: false,
          neutral: false,
          disagree: false,
          stronglyDisagree: false
        })));
      } else {
        setError(result.error || 'Failed to load MBTI questions');
      }
    } catch (error) {
      setError('Network error loading MBTI questions');
      console.error('Error loading MBTI questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: number, option: keyof MBTIResponse) => {
    setResponses(prev => prev.map(response => {
      if (response.questionId === questionId) {
        return {
          questionId,
          stronglyAgree: option === 'stronglyAgree',
          agree: option === 'agree',
          neutral: option === 'neutral',
          disagree: option === 'disagree',
          stronglyDisagree: option === 'stronglyDisagree'
        };
      }
      return response;
    }));
  };

  const getCurrentResponse = (questionId: number): string => {
    const response = responses.find(r => r.questionId === questionId);
    if (!response) return '';
    
    if (response.stronglyAgree) return 'stronglyAgree';
    if (response.agree) return 'agree';
    if (response.neutral) return 'neutral';
    if (response.disagree) return 'disagree';
    if (response.stronglyDisagree) return 'stronglyDisagree';
    return '';
  };

  const handleSubmit = async () => {
    if (!validation.isValid) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const result = await submitMBTIAssessment(
        assessmentId || 'sample-assessment',
        responses
      );
      
      if (result.success && result.data) {
        onComplete?.(result.data);
      } else {
        setError(result.error || 'Failed to submit assessment');
      }
    } catch (error) {
      setError('Network error submitting assessment');
      console.error('Error submitting MBTI assessment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageCompletionStatus = (page: number): 'completed' | 'partial' | 'empty' => {
    const startQ = page * questionsPerPage + 1;
    const endQ = Math.min((page + 1) * questionsPerPage, 60);
    let completed = 0;
    
    for (let i = startQ; i <= endQ; i++) {
      const response = responses.find(r => r.questionId === i);
      if (response && getCurrentResponse(i)) {
        completed++;
      }
    }
    
    if (completed === questionsPerPage) return 'completed';
    if (completed > 0) return 'partial';
    return 'empty';
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading MBTI Assessment...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={loadMBTIQuestions}
          sx={{ mt: 2 }}
        >
          Retry Loading
        </Button>
      </Container>
    );
  }

  if (showInstructions && instructions) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Psychology sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              {instructions.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {instructions.description}
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={2} mb={3}>
              <Chip 
                icon={<Timer />} 
                label={instructions.timeEstimate}
                color="primary"
                variant="outlined"
              />
              <Chip 
                label={`${questions.length} Questions`}
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Box>

          <Grid container spacing={3} mb={4}>
            {instructions.dimensions.map((dimension, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {dimension.name} ({dimension.code})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dimension.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                Instructions & Tips
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {instructions.tips.map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
              
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Response Options:
                </Typography>
                <List dense>
                  {instructions.options.map((option, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={option.label}
                        secondary={option.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setShowInstructions(false)}
              sx={{ px: 4 }}
            >
              Start Assessment
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Progress Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1">
            MBTI Personality Assessment
          </Typography>
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              Progress: {validation.progress}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Page {currentPage + 1} of {totalPages}
            </Typography>
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={validation.progress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Page Navigation */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stepper nonLinear activeStep={currentPage} orientation="horizontal">
          {Array.from({ length: totalPages }, (_, index) => (
            <Step key={index} completed={getPageCompletionStatus(index) === 'completed'}>
              <StepLabel 
                onClick={() => goToPage(index)}
                sx={{ cursor: 'pointer' }}
                error={getPageCompletionStatus(index) === 'empty' && currentPage > index}
              >
                {`${index * questionsPerPage + 1}-${Math.min((index + 1) * questionsPerPage, 60)}`}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Questions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {currentQuestions.map((question, index) => {
          const questionNumber = currentPage * questionsPerPage + index + 1;
          const currentResponse = getCurrentResponse(question.id);
          
          return (
            <Box key={question.id} mb={4}>
              <Typography variant="h6" gutterBottom>
                Question {questionNumber}
                <Chip 
                  label={question.dimension}
                  size="small"
                  sx={{ ml: 1 }}
                  color="primary"
                  variant="outlined"
                />
              </Typography>
              <Typography variant="body1" paragraph>
                {question.text}
              </Typography>
              
              <RadioGroup
                value={currentResponse}
                onChange={(e) => handleResponseChange(question.id, e.target.value as keyof MBTIResponse)}
              >
                <FormControlLabel
                  value="stronglyAgree"
                  control={<Radio />}
                  label="Strongly Agree"
                />
                <FormControlLabel
                  value="agree"
                  control={<Radio />}
                  label="Agree"
                />
                <FormControlLabel
                  value="neutral"
                  control={<Radio />}
                  label="Neutral"
                />
                <FormControlLabel
                  value="disagree"
                  control={<Radio />}
                  label="Disagree"
                />
                <FormControlLabel
                  value="stronglyDisagree"
                  control={<Radio />}
                  label="Strongly Disagree"
                />
              </RadioGroup>
            </Box>
          );
        })}
      </Paper>

      {/* Navigation & Submit */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            startIcon={<NavigateBefore />}
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>

          <Box textAlign="center">
            {validation.progress < 100 && (
              <Typography variant="body2" color="text.secondary">
                {60 - Math.round(validation.progress * 60 / 100)} questions remaining
              </Typography>
            )}
            {validation.errors.length > 0 && currentPage === totalPages - 1 && (
              <Typography variant="body2" color="error">
                Please complete all questions
              </Typography>
            )}
          </Box>

          {currentPage < totalPages - 1 ? (
            <Button
              variant="contained"
              endIcon={<NavigateNext />}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!validation.isValid || submitting}
              sx={{ minWidth: 120 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit Assessment'}
            </Button>
          )}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default MBTIForm;