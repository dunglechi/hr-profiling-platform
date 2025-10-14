import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider } from './context/ErrorContext';
import { AuthProvider } from './context/AuthContext';
import NavigationHeader from './components/ui/NavigationHeader';

// Import monitoring services
import { initSentry } from './lib/monitoring';
import { systemMonitor } from './lib/systemMonitor';
import { ErrorBoundary as SentryErrorBoundary } from './components/SentryErrorBoundary';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/SimpleDashboard'));
const SimpleNumerology = lazy(() => import('./components/SimpleNumerology'));
const SimpleDISC = lazy(() => import('./components/SimpleDISC'));
const SimpleMBTI = lazy(() => import('./components/SimpleMBTI'));
const SimpleCVAnalysis = lazy(() => import('./components/SimpleCVAnalysis'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const JobMatching = lazy(() => import('./components/JobMatching'));
// Keep old components for reference, but use Simple versions
const DatabaseSetup = lazy(() => import('./components/DatabaseSetup'));

// Import i18n configuration
import './i18n';

// Loading component for lazy-loaded routes
const LoadingFallback: React.FC = () => (
  <Box 
    display="flex" 
    flexDirection="column" 
    alignItems="center" 
    justifyContent="center" 
    minHeight="60vh"
    gap={2}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" color="text.secondary">
      Đang tải...
    </Typography>
  </Box>
);

function App() {
  // Initialize monitoring services
  useEffect(() => {
    // Initialize Sentry for error tracking
    if (import.meta.env.PROD) {
      initSentry();
    }
    
    // Start system monitoring
    systemMonitor.startMonitoring();
    
    // Log app initialization
    console.log('🚀 HR Profiling Platform initialized with monitoring');
  }, []);

  return (
    <SentryErrorBoundary>
      <AuthProvider>
        <ErrorProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <NavigationHeader />
              
              <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <ErrorBoundary>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/numerology" element={<SimpleNumerology />} />
                      <Route path="/disc" element={<SimpleDISC />} />
                      <Route path="/mbti" element={<SimpleMBTI />} />
                      <Route path="/cv-analysis" element={<SimpleCVAnalysis />} />
                      <Route path="/job-matching" element={<JobMatching />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/database-setup" element={<DatabaseSetup />} />
                      
                    {/* Redirect old enhanced routes to simple versions */}
                    <Route path="/numerology-enhanced" element={<SimpleNumerology />} />
                    <Route path="/numerology-old" element={<SimpleNumerology />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Container>
          </Box>
        </Router>
      </ErrorProvider>
    </AuthProvider>
    </SentryErrorBoundary>
  );
}

export default App;