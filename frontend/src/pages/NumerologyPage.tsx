import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Backdrop,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Download, Share } from '@mui/icons-material';
import NumerologyForm from '../components/NumerologyForm';
import NumerologyDisplay from '../components/NumerologyDisplay';
import numerologyService, { NumerologyResult } from '../services/numerologyService';

const NumerologyPage: React.FC = () => {
  const { t } = useTranslation('numerology');
  const steps = [t('steps.enterInfo'), t('steps.results')];
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<NumerologyResult | null>(null);

  const handleCalculate = async (fullName: string, birthDate: Date) => {
    setLoading(true);
    setError('');

    try {
      // Validate inputs
      const nameValidation = numerologyService.validateFullName(fullName);
      if (!nameValidation.isValid) {
        setError(nameValidation.error || 'Tên không hợp lệ');
        return;
      }

      const dateValidation = numerologyService.validateBirthDate(birthDate);
      if (!dateValidation.isValid) {
        setError(dateValidation.error || 'Ngày sinh không hợp lệ');
        return;
      }

      // Call API
      const calculationResult = await numerologyService.quickCalculate({
        fullName,
        birthDate: numerologyService.formatDateForApi(birthDate)
      });

      setResult(calculationResult);
      setActiveStep(1);
    } catch (err: any) {
      setError(err.message || t('errors.calculationError'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
    setResult(null);
    setError('');
  };

  const handleExportResult = () => {
    if (!result) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      coreNumbers: {
        lifePathNumber: result.lifePathNumber,
        destinyNumber: result.destinyNumber,
        personalityNumber: result.personalityNumber,
        soulUrgeNumber: result.soulUrgeNumber
      },
      compatibility: result.compatibility,
      analysis: result.analysis,
      careerGuidance: result.careerGuidance
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `numerology-result-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleShareResult = async () => {
    if (!result) return;

    const shareText = `
🔮 Kết Quả Thần Số Học

🔢 Các Số Cốt Lõi:
• Đường Đời: ${result.lifePathNumber}
• Sứ Mệnh: ${result.destinyNumber}
• Nhân Cách: ${result.personalityNumber}
• Linh Hồn: ${result.soulUrgeNumber}

📈 Tương Thích Công Việc: ${result.compatibility.overall}%

💼 Nghề Nghiệp Phù Hợp:
${result.careerGuidance.suitableCareers.slice(0, 3).map(career => `• ${career}`).join('\n')}

Được tạo bởi HR Profiling Platform
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kết Quả Thần Số Học',
          text: shareText
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        // You could show a toast notification here
        alert(t('actions.copySuccess'));
      } catch (err) {
        console.error('Failed to copy to clipboard');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          🔮 {t('title')}
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          {t('subtitle')}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {activeStep === 0 && (
        <NumerologyForm
          onCalculate={handleCalculate}
          loading={loading}
          error={error}
        />
      )}

      {activeStep === 1 && result && (
        <Box>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleBack}
                size="large"
              >
                Tính Toán Lại
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExportResult}
                  size="large"
                >
                  Xuất Kết Quả
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<Share />}
                  onClick={handleShareResult}
                  size="large"
                >
                  Chia Sẻ
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={2}>
            <NumerologyDisplay result={result} />
          </Paper>
        </Box>
      )}

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Đang phân tích thần số học...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Vui lòng đợi trong giây lát
          </Typography>
        </Box>
      </Backdrop>
    </Container>
  );
};

export default NumerologyPage;