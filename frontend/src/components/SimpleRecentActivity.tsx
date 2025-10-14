import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { Psychology, BarChart, Work } from '@mui/icons-material';
import { numerologyAPI, assessmentAPI } from '../lib/supabase';

interface Activity {
  id: string;
  type: string;
  user_name: string;
  timestamp: string;
  result_summary?: string;
}

const SimpleRecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        setLoading(true);
        
        // Get recent numerology results
        const numerologyResults = await numerologyAPI.getResults();
        const numerologyActivities: Activity[] = numerologyResults.slice(0, 3).map(result => ({
          id: result.id,
          type: 'Thần Số Học',
          user_name: result.user_name,
          timestamp: result.created_at,
          result_summary: `Số đường đời: ${result.calculation_data?.lifePathNumber || 'N/A'}`
        }));

        // Get recent assessment results
        const assessmentResults = await assessmentAPI.getAllAssessments();
        const assessmentActivities: Activity[] = assessmentResults.slice(0, 3).map(result => ({
          id: result.id,
          type: result.assessment_type,
          user_name: result.user_id.startsWith('anonymous_') ? 'Người dùng ẩn danh' : result.user_id,
          timestamp: result.created_at,
          result_summary: getAssessmentSummary(result.assessment_type, result.result_data)
        }));

        // Combine and sort by timestamp
        const allActivities = [...numerologyActivities, ...assessmentActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5); // Show last 5 activities

        setActivities(allActivities);
      } catch (error) {
        console.warn('Could not load recent activities:', error);
        // Show empty state
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivities();
  }, []);

  const getAssessmentSummary = (type: string, data: any): string => {
    if (type === 'DISC') {
      return `Phong cách chính: ${data?.primaryStyle || 'N/A'}`;
    }
    if (type === 'MBTI') {
      return `Loại tính cách: ${data?.type || 'N/A'}`;
    }
    return 'Đánh giá hoàn thành';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Thần Số Học':
        return <Psychology sx={{ color: '#667eea' }} />;
      case 'DISC':
        return <BarChart sx={{ color: '#e91e63' }} />;
      case 'MBTI':
        return <Work sx={{ color: '#4caf50' }} />;
      default:
        return <Psychology sx={{ color: '#757575' }} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'Thần Số Học':
        return '#667eea';
      case 'DISC':
        return '#e91e63';
      case 'MBTI':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }}>Đang tải hoạt động gần đây...</Typography>
      </Paper>
    );
  }

  if (activities.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Không có hoạt động gần đây để hiển thị.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Hãy thử thực hiện một đánh giá để xem kết quả tại đây.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          📈 Hoạt Động Gần Đây
        </Typography>
      </Box>
      
      <List sx={{ p: 0 }}>
        {activities.map((activity, index) => (
          <ListItem
            key={activity.id}
            divider={index < activities.length - 1}
            sx={{
              py: 2,
              '&:hover': { bgcolor: 'grey.50' },
              transition: 'background-color 0.2s'
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: `${getActivityColor(activity.type)}20` }}>
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {activity.user_name}
                  </Typography>
                  <Chip
                    label={activity.type}
                    size="small"
                    sx={{
                      bgcolor: getActivityColor(activity.type),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '11px'
                    }}
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {activity.result_summary}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {formatTimestamp(activity.timestamp)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default SimpleRecentActivity;