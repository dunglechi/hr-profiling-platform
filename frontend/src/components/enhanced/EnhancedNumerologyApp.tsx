import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Backdrop,
  Typography
} from '@mui/material';
import EnhancedLayout from './EnhancedLayout';
import EnhancedNumerologyForm from './EnhancedNumerologyForm';
import EnhancedNumerologyDisplay from './EnhancedNumerologyDisplay';
import MobileOptimizedContainer from './MobileOptimizedContainer';
import MobileActionMenu from './MobileActionMenu';
import { useNotification } from '../../context/ErrorContext';
// Removed unused import

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

// Mock numerology calculation function
const generateMockNumerologyResult = (fullName: string, birthDate: Date): NumerologyResult => {
  const nameSum = fullName.replace(/\s/g, '').split('').reduce((sum, char) => {
    return sum + char.charCodeAt(0);
  }, 0);
  
  const dateSum = birthDate.getDate() + birthDate.getMonth() + 1 + birthDate.getFullYear();
  
  return {
    lifePathNumber: (dateSum % 9) + 1,
    destinyNumber: (nameSum % 9) + 1,
    personalityNumber: ((nameSum + dateSum) % 9) + 1,
    soulUrgeNumber: (nameSum % 8) + 1,
    attitudeLessonNumber: (dateSum % 7) + 1,
    birthDayNumber: birthDate.getDate(),
    challengeNumbers: [1, 3, 5],
    pinnacleNumbers: [2, 4, 6, 8],
    personalYearNumber: ((new Date().getFullYear() + dateSum) % 9) + 1,
    coreTraits: {
      positive: ['Sáng tạo', 'Lãnh đạo', 'Quyết đoán'],
      negative: ['Cầu toàn', 'Cứng nhắc'],
      keywords: ['Thành công', 'Tiềm năng', 'Phát triển']
    },
    strengths: ['Tư duy logic', 'Khả năng phân tích', 'Giao tiếp tốt'],
    challenges: ['Cần cải thiện kiên nhẫn', 'Học cách lắng nghe'],
    careerGuidance: {
      suitableCareers: ['Quản lý', 'Tư vấn', 'Giáo dục', 'Công nghệ'],
      workStyle: 'Độc lập và sáng tạo',
      leadershipStyle: 'Dân chủ và khuyến khích',
      teamRole: 'Người dẫn dắt ý tưởng'
    },
    relationships: {
      compatibility: ['Số 2', 'Số 6', 'Số 9'],
      challenges: ['Cần học cách thỏa hiệp', 'Tránh quá kiểm soát'],
      advice: ['Lắng nghe đối tác', 'Chia sẻ cảm xúc']
    },
    lifeCycle: {
      youthPhase: 'Giai đoạn khám phá và học hỏi',
      adulthoodPhase: 'Thời kỳ phát triển sự nghiệp',
      maturityPhase: 'Giai đoạn chia sẻ kinh nghiệm'
    },
    analysis: `Dựa trên tên ${fullName} và ngày sinh ${birthDate.toLocaleDateString('vi-VN')}, bạn thể hiện những đặc điểm độc đáo...`,
    compatibility: {
      leadership: Math.floor(Math.random() * 30) + 70,
      teamwork: Math.floor(Math.random() * 30) + 70,
      communication: Math.floor(Math.random() * 30) + 70,
      innovation: Math.floor(Math.random() * 30) + 70,
      analytical: Math.floor(Math.random() * 30) + 70,
      overall: Math.floor(Math.random() * 20) + 80
    }
  };
};

const EnhancedNumerologyApp: React.FC = () => {
  const { showError, showSuccess, showInfo } = useNotification();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    fullName: string;
    birthDate: Date;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Removed unused error state

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode]);

  // Removed useEffects - handling in calculate function directly

  const handleCalculate = useCallback(async (fullName: string, birthDate: Date) => {
    setLoading(true);
    setError(null);
    setCurrentUser({ fullName, birthDate });

    try {
      // Add small delay to simulate calculation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock numerology calculation
      const calculatedResult = generateMockNumerologyResult(fullName, birthDate);
      
      setResult(calculatedResult);
      showSuccess('Phân tích thành công! Hãy khám phá kết quả bên dưới.', 'Hoàn thành');
      
      // Smooth scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
      
    } catch (error) {
      console.error('Numerology calculation error:', error);
      setError('Có lỗi xảy ra khi tính toán thần số học. Vui lòng thử lại.');
      showError('Có lỗi xảy ra khi tính toán thần số học. Vui lòng thử lại.', 'Lỗi Tính Toán');
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const handleNewAnalysis = useCallback(() => {
    setResult(null);
    setCurrentUser(null);
    
    showInfo('Bắt đầu phân tích mới', 'Làm mới');

    // Smooth scroll to form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [showInfo]);

  // Mobile action handlers
  const handleMobileShare = useCallback(() => {
    if (navigator.share && result) {
      navigator.share({
        title: 'Báo cáo Thần số học',
        text: `Báo cáo thần số học của ${currentUser?.fullName}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      showInfo('Tính năng chia sẻ không được hỗ trợ trên thiết bị này', 'Thông báo');
    }
  }, [result, currentUser, showInfo]);

  const handleMobileScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleMobileRefresh = useCallback(() => {
    handleNewAnalysis();
  }, [handleNewAnalysis]);

  // Memoized props for performance optimization
  const formProps = useMemo(() => ({
    onCalculate: handleCalculate,
    loading
  }), [handleCalculate, loading]);

  const resultDisplayProps = useMemo(() => {
    if (!result || !currentUser) return null;
    return {
      result,
      fullName: currentUser.fullName,
      birthDate: currentUser.birthDate
    };
  }, [result, currentUser]);

  const debugState = useMemo(() => ({
    loading,
    hasResult: !!result,
    hasCurrentUser: !!currentUser,
    resultKeys: result ? Object.keys(result).length : 0
  }), [loading, result, currentUser]);

  return (
    <EnhancedLayout darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode}>
      <MobileOptimizedContainer>
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
          <EnhancedNumerologyForm {...formProps} />
        </Box>

        {/* Debug State Display */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>🔍 Debug State:</Typography>
          <Typography variant="body2">
            - Loading: {debugState.loading ? 'true' : 'false'}<br/>
            - Has Result: {debugState.hasResult ? 'true' : 'false'}<br/>
            - Has CurrentUser: {debugState.hasCurrentUser ? 'true' : 'false'}<br/>
            - Notifications: Handled by global system
          </Typography>
          {debugState.hasResult && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              - Result has {debugState.resultKeys} properties
            </Typography>
          )}
        </Box>

        {/* Results Section */}
        
        {result && currentUser && resultDisplayProps ? (
          <Box id="results-section" sx={{ mt: 6 }}>
            <EnhancedNumerologyDisplay
              {...resultDisplayProps}
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
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              🔍 Debug: result={result ? 'exists' : 'null'}, currentUser={currentUser ? 'exists' : 'null'}
            </Typography>
          </Box>
        )}

        {/* Success/Error Notifications */}
{/* Notifications are handled by the global notification system */}

        {/* Mobile Action Menu */}
        <MobileActionMenu
          onShare={handleMobileShare}
          onScrollToTop={handleMobileScrollToTop}
          onRefresh={handleMobileRefresh}
          open={mobileMenuOpen}
          onToggle={setMobileMenuOpen}
        />
        </Box>
      </MobileOptimizedContainer>
    </EnhancedLayout>
  );
};

export default React.memo(EnhancedNumerologyApp);