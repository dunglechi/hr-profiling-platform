import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Assessment from './components/Assessment';
import NumerologyPage from './pages/NumerologyPage';
import DISCPage from './pages/DISCPage';
import MBTIPage from './components/MBTI/MBTIPage';
import LanguageSwitcher from './components/common/LanguageSwitcher';

// Import i18n configuration
import './i18n';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              HR Profiling Platform
            </Typography>
            <LanguageSwitcher />
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/assessment/:id" element={<Assessment />} />
              <Route path="/numerology" element={<NumerologyPage />} />
              <Route path="/disc" element={<DISCPage />} />
              <Route path="/mbti" element={<MBTIPage />} />
            </Routes>
          </ErrorBoundary>
        </Container>
      </Box>
    </Router>
  );
}

export default App;