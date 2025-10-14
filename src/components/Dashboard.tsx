import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Psychology, Assessment, Work } from '@mui/icons-material';
import { useSecureTranslation } from '../hooks/useSecureTranslation';
import { TranslationLoading, TranslationError } from './common/TranslationHelpers';
import { numerologyAPI, assessmentAPI } from '../lib/supabase';
import RecentActivity from './RecentActivity';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, ready, error, isLoading } = useSecureTranslation('dashboard');
  const [stats, setStats] = useState({ assessments: 0, users: 0, totalActivities: 0 });

  // Load real stats from database
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get numerology results
        const numerologyResults = await numerologyAPI.getResults();
        const numerologyUsers = new Set(numerologyResults.map(r => r.user_name));

        // Get assessment results
        const assessmentResults = await assessmentAPI.getAllAssessments();
        const assessmentUsers = new Set(assessmentResults.map(r => r.user_id));

        // Combine unique users
        const allUsers = new Set([...numerologyUsers, ...assessmentUsers]);
        const totalAssessments = numerologyResults.length + assessmentResults.length;

        setStats({
          assessments: numerologyResults.length,
          users: allUsers.size,
          totalActivities: totalAssessments
        });
      } catch (error) {
        console.warn('Could not load stats:', error);
        // Keep default stats
      }
    };

    if (ready) {
      loadStats();
    }
  }, [ready]);

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Dashboard translation state:', { ready, error, isLoading });
  }

  // Show loading state
  if (isLoading) {
    return <TranslationLoading message="Đang tải bảng điều khiển..." />;
  }

  // Show error state
  if (error) {
    return <TranslationError error={error} retry={() => window.location.reload()} />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('title')}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('stats.candidates')}
              </Typography>
              <Typography variant="h4">
                {stats.users}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('stats.assessments')}
              </Typography>
              <Typography variant="h4">
                {stats.assessments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng hoạt động
              </Typography>
              <Typography variant="h4">
                {stats.totalActivities}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🚀 {t('quickActions.title')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              height: '100%', 
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': { 
                elevation: 6,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}
                  onClick={() => navigate('/numerology-enhanced')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Psychology sx={{ fontSize: 48, color: 'white', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  ✨ {t('assessments.numerology.title')}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {t('assessments.numerology.description')}
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    mt: 2,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { background: 'rgba(255,255,255,0.3)' }
                  }} 
                  fullWidth
                >
                  🚀 {t('quickActions.startButton')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { elevation: 4 } }}
                  onClick={() => navigate('/disc')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Assessment sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  📊 {t('quickActions.disc.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('quickActions.disc.description')}
                </Typography>
                <Button variant="contained" color="secondary" sx={{ mt: 2 }} fullWidth>
                  {t('quickActions.startButton')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { elevation: 4 } }}
                  onClick={() => navigate('/mbti')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Work sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  🧠 {t('quickActions.mbti.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('quickActions.mbti.description')}
                </Typography>
                <Button variant="contained" color="success" sx={{ mt: 2 }} fullWidth>
                  {t('quickActions.startButton')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <RecentActivity />
    </Box>
  );
};

export default Dashboard;