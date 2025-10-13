import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop,
  useMediaQuery,
  useTheme
} from '@mui/material';
import EnhancedLayout from './EnhancedLayout';
import EnhancedNumerologyForm from './EnhancedNumerologyForm';
import EnhancedNumerologyDisplay from './EnhancedNumerologyDisplay';

interface NumerologyResult {
  lifePathNumber: number;
  destinyNumber: number;
  personalityNumber: number;
  soulUrgeNumber: number;
  attitudeLessonNumber: number;
  birthDayNumber: number;
  challengeNumbers: number[];
  pinnacleNumbers: number[];
  personalYearNumber: number;
  coreTraits: {
    positive: string[];
    negative: string[];
    keywords: string[];
  };
  strengths: string[];
  challenges: string[];
  careerGuidance: {
    suitableCareers: string[];
    workStyle: string;
    leadershipStyle: string;
    teamRole: string;
  };
  relationships: {
    compatibility: string[];
    challenges: string[];
    advice: string[];
  };
  lifeCycle: {
    youthPhase: string;
    adulthoodPhase: string;
    maturityPhase: string;
  };
  analysis: string;
  compatibility: {
    leadership: number;
    teamwork: number;
    communication: number;
    innovation: number;
    analytical: number;
    overall: number;
  };
}

const EnhancedNumerologyApp: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<{
    fullName: string;
    birthDate: Date;
  } | null>(null);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleCalculate = async (fullName: string, birthDate: Date) => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Simulate API call with enhanced loading experience
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch('/api/numerology/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          birthDate: birthDate.toISOString().split('T')[0],
          language: 'vi'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
        setCurrentUser({ fullName, birthDate });
        setSuccess('Phân tích thành công! Hãy khám phá kết quả bên dưới.');
        
        // Save to history (localStorage for demo)
        const history = JSON.parse(localStorage.getItem('numerologyHistory') || '[]');
        history.unshift({
          id: Date.now(),
          fullName,
          birthDate: birthDate.toISOString(),
          result: data.result,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('numerologyHistory', JSON.stringify(history.slice(0, 10))); // Keep last 10
        
        // Smooth scroll to results
        setTimeout(() => {
          const resultsElement = document.getElementById('results-section');
          if (resultsElement) {
            resultsElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500);
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra khi tính toán');
      }
    } catch (error) {
      console.error('Error calculating numerology:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Không thể kết nối với máy chủ. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setCurrentUser(null);
    setError('');
    setSuccess('');
    
    // Smooth scroll to form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <EnhancedLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        {/* Enhanced Loading Backdrop */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0,0,0,0.7)'
          }}
          open={loading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{
                color: '#2196F3',
                mb: 2
              }}
            />
            <Box sx={{ mt: 2 }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                background: 'linear-gradient(45deg, #2196F3, #9C27B0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                🔮 Đang phân tích thần số học...
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {loading && (
                  <div>
                    <div>📊 Tính toán các số cốt lõi</div>
                    <div style={{ marginTop: '4px' }}>🎯 Phân tích tính cách và nghề nghiệp</div>
                    <div style={{ marginTop: '4px' }}>✨ Tạo báo cáo chi tiết</div>
                  </div>
                )}
              </div>
            </Box>
          </Box>
        </Backdrop>

        {/* Main Form Section */}
        <Box sx={{ mb: 4 }}>
          <EnhancedNumerologyForm
            onCalculate={handleCalculate}
            loading={loading}
            error={error}
          />
        </Box>

        {/* Results Section */}
        {result && currentUser && (
          <Box id="results-section" sx={{ mt: 6 }}>
            <EnhancedNumerologyDisplay
              result={result}
              fullName={currentUser.fullName}
              birthDate={currentUser.birthDate}
            />
            
            {/* New Analysis Button */}
            <Box sx={{ textAlign: 'center', mt: 4, mb: 6 }}>
              <button
                onClick={handleNewAnalysis}
                style={{
                  background: 'linear-gradient(45deg, #2196F3, #9C27B0)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
                }}
              >
                🔄 Phân Tích Mới
              </button>
            </Box>
          </Box>
        )}

        {/* Success/Error Notifications */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="success" 
            variant="filled"
            sx={{ 
              borderRadius: 2,
              fontWeight: 'medium',
              '& .MuiAlert-icon': {
                fontSize: '1.2rem'
              }
            }}
          >
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={8000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="error" 
            variant="filled"
            sx={{ 
              borderRadius: 2,
              fontWeight: 'medium',
              '& .MuiAlert-icon': {
                fontSize: '1.2rem'
              }
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </EnhancedLayout>
  );
};

export default EnhancedNumerologyApp;