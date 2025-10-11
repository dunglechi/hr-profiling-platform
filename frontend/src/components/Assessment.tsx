import React from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Stepper, Step, StepLabel } from '@mui/material';

const Assessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeStep, setActiveStep] = React.useState(0);
  
  const steps = [
    'DISC Assessment',
    'MBTI Test',
    'Numerology Analysis',
    'CV Upload',
    'Results'
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Assessment #{id}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {steps[activeStep]}
        </Typography>
        <Typography color="textSecondary">
          Assessment content will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Assessment;