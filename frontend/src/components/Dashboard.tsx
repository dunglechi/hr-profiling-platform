import React from 'react';
import { Paper, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Psychology, Assessment, Work } from '@mui/icons-material';

const Dashboard: React.FC = () => {
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
          🚀 Bắt Đầu Đánh Giá
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { elevation: 4 } }}
                  onClick={() => navigate('/numerology')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Psychology sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  🔮 Thần Số Học
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phân tích tính cách qua Pythagoras
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} fullWidth>
                  Bắt Đầu
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', opacity: 0.6 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Assessment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  📊 Test DISC
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đánh giá phong cách hành vi
                </Typography>
                <Button variant="outlined" disabled sx={{ mt: 2 }} fullWidth>
                  Sắp Ra Mắt
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', opacity: 0.6 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Work sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  🧠 MBTI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phân loại tính cách Myers-Briggs
                </Typography>
                <Button variant="outlined" disabled sx={{ mt: 2 }} fullWidth>
                  Sắp Ra Mắt
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