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
  Box
} from '@mui/material';
import { Psychology } from '@mui/icons-material';
import { useSecureTranslation } from '../hooks/useSecureTranslation';
import { numerologyAPI, assessmentAPI } from '../lib/supabase';

interface NumerologyActivityItem {
  id: string;
  user_name: string;
  created_at: string;
  calculation_data: any;
  type: 'numerology';
}

interface AssessmentActivityItem {
  id: string;
  user_id: string;
  assessment_type: string;
  created_at: string;
  result_data: any;
  type: 'assessment';
}

type RecentActivityItem = NumerologyActivityItem | AssessmentActivityItem;

const RecentActivity: React.FC = () => {
  const { t } = useSecureTranslation('dashboard');
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        // Get numerology results
        const numerologyResults = await numerologyAPI.getResults(3);
        const numerologyActivities: NumerologyActivityItem[] = numerologyResults.map(result => ({
          ...result,
          type: 'numerology' as const
        }));

        // Get assessment results
        const assessmentResults = await assessmentAPI.getAllAssessments(undefined, 3);
        const assessmentActivities: AssessmentActivityItem[] = assessmentResults.map(result => ({
          ...result,
          type: 'assessment' as const
        }));

        // Combine and sort by date
        const allActivities = [...numerologyActivities, ...assessmentActivities]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5); // Take top 5

        setActivities(allActivities);
      } catch (error) {
        console.warn('Could not load recent activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivities();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLifePathNumber = (calculationData: any) => {
    return calculationData?.lifePathNumber || calculationData?.coreNumbers?.lifePathNumber || 'N/A';
  };

  const getActivityInfo = (activity: RecentActivityItem) => {
    if (activity.type === 'numerology') {
      return {
        name: activity.user_name,
        subtitle: `📊 Hoàn thành thần số học • ${formatDate(activity.created_at)}`,
        chip: `Số đường đời: ${getLifePathNumber(activity.calculation_data)}`,
        icon: <Psychology />
      };
    } else {
      return {
        name: activity.user_id.replace('anonymous_', 'User ').substring(0, 20),
        subtitle: `${activity.assessment_type === 'DISC' ? '🎯 DISC' : '🧠 MBTI'} Assessment • ${formatDate(activity.created_at)}`,
        chip: activity.assessment_type,
        icon: <Psychology />
      };
    }
  };

  if (loading) {
    return (
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('recentActivity.title')}
        </Typography>
        <Typography color="textSecondary">
          Đang tải hoạt động gần đây...
        </Typography>
      </Paper>
    );
  }

  if (activities.length === 0) {
    return (
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('recentActivity.title')}
        </Typography>
        <Typography color="textSecondary">
          {t('recentActivity.noData')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        🕒 {t('recentActivity.title')} 
        <Chip 
          label={`${activities.length} hoạt động gần đây`} 
          size="small" 
          sx={{ ml: 2 }} 
        />
      </Typography>
      
      <List>
        {activities.map((activity) => {
          const activityInfo = getActivityInfo(activity);
          return (
            <ListItem key={activity.id} divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {activityInfo.icon}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography component="span" fontWeight="medium">
                      {activityInfo.name}
                    </Typography>
                    <Chip 
                      label={activityInfo.chip}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {activityInfo.subtitle}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default RecentActivity;