import React from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Psychology, Assessment, Work } from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        HR Profiling Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Candidates
              </Typography>
              <Typography variant="h4">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Assessments
              </Typography>
              <Typography variant="h4">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Job Positions
              </Typography>
              <Typography variant="h4">
                0
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
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { elevation: 4 } }}
                  onClick={() => navigate('/numerology')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Psychology sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  🔮 {t('quickActions.numerology.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('quickActions.numerology.description')}
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} fullWidth>
                  {t('quickActions.startButton')}
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
                  📊 Test DISC
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đánh giá phong cách hành vi
                </Typography>
                <Button variant="contained" color="secondary" sx={{ mt: 2 }} fullWidth>
                  Bắt Đầu
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
      
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Typography color="textSecondary">
          No recent activity to display.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;