import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider } from './context/ErrorContext';
import NavigationHeader from './components/ui/NavigationHeader';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Assessment = lazy(() => import('./components/Assessment'));
const NumerologyPage = lazy(() => import('./pages/NumerologyPage'));
const DISCPage = lazy(() => import('./pages/DISCPage'));
const MBTIPage = lazy(() => import('./components/MBTI/MBTIPage'));
const EnhancedApp = lazy(() => import('./pages/EnhancedApp'));
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

  return (
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
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/assessment/:id" element={<Assessment />} />
                  <Route path="/numerology" element={<NumerologyPage />} />
              <Route path="/numerology-enhanced" element={<EnhancedApp />} />
                  <Route path="/disc" element={<DISCPage />} />
                  <Route path="/mbti" element={<MBTIPage />} />
                  <Route path="/database-setup" element={<DatabaseSetup />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Container>
        </Box>
      </Router>
    </ErrorProvider>
  );
}

export default App;