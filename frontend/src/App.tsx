import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider } from './context/ErrorContext';
import NavigationHeader from './components/ui/NavigationHeader';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/SimpleDashboard'));
const SimpleNumerology = lazy(() => import('./components/SimpleNumerology'));
const SimpleDISC = lazy(() => import('./components/SimpleDISC'));
const SimpleMBTI = lazy(() => import('./components/SimpleMBTI'));
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
                  <Route path="/numerology" element={<SimpleNumerology />} />
                  <Route path="/disc" element={<SimpleDISC />} />
                  <Route path="/mbti" element={<SimpleMBTI />} />
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