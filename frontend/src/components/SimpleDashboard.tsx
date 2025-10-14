import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Psychology, Assessment, Work, BarChart } from '@mui/icons-material';
import { numerologyAPI, assessmentAPI } from '../lib/supabase';
import RecentActivity from './RecentActivity';

const SimpleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ assessments: 0, users: 0, totalActivities: 0 });
  const [loading, setLoading] = useState(true);

  // Load real stats from database
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const assessmentTools = [
    {
      id: 'numerology',
      title: 'Thần Số Học Nâng Cao',
      description: 'Tìm hiểu con số định mệnh và đặc điểm cá nhân',
      icon: <Psychology sx={{ fontSize: 40, color: '#667eea' }} />,
      path: '/numerology',
      color: '#667eea',
      bgColor: '#f3f4ff'
    },
    {
      id: 'disc',
      title: 'Đánh Giá DISC',
      description: 'Đánh giá phong cách hành vi',
      icon: <BarChart sx={{ fontSize: 40, color: '#e91e63' }} />,
      path: '/disc',
      color: '#e91e63',
      bgColor: '#fff0f5'
    },
    {
      id: 'mbti',
      title: 'Phân Loại MBTI',
      description: 'Phân loại tính cách Myers-Briggs',
      icon: <Work sx={{ fontSize: 40, color: '#4caf50' }} />,
      path: '/mbti',
      color: '#4caf50',
      bgColor: '#f1f8e9'
    }
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 4 }}>
        Bảng Điều Khiển HR
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tổng Ứng Viên
              </Typography>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                {loading ? '...' : stats.users}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Đánh Giá Đang Thực Hiện
              </Typography>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                {loading ? '...' : stats.assessments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tổng hoạt động
              </Typography>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                {loading ? '...' : stats.totalActivities}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assessment Tools */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        🚀 Bắt Đầu Đánh Giá
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {assessmentTools.map((tool) => (
          <Grid item xs={12} md={4} key={tool.id}>
            <Card 
              elevation={4}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
              onClick={() => navigate(tool.path)}
            >
              <CardContent sx={{ 
                textAlign: 'center', 
                p: 4,
                backgroundColor: tool.bgColor,
                '&:last-child': { pb: 4 }
              }}>
                <Box sx={{ mb: 2 }}>
                  {tool.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: tool.color }}>
                  {tool.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                  {tool.description}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: tool.color,
                    '&:hover': { bgcolor: tool.color, opacity: 0.8 },
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 'bold'
                  }}
                >
                  BẮT ĐẦU
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        Hoạt Động Gần Đây
      </Typography>
      <RecentActivity />
    </Box>
  );
};

export default SimpleDashboard;