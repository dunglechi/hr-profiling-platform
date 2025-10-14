import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person,
  Edit,
  Assessment,
  Psychology,
  Work,
  Email,
  Phone,
  Business,
  CalendarToday,
  TrendingUp,
  Star,
  Delete,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userService, AssessmentHistory } from '../services/userService';
import AuthDialog from './AuthDialog';

const UserProfile: React.FC = () => {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    company: '',
    position: ''
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Sync edit form with profile data
  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        company: profile.company || '',
        position: profile.position || ''
      });
    }
  }, [profile]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load assessment history and stats in parallel
      const [history, stats] = await Promise.all([
        userService.getUserAssessmentHistory(user.id),
        userService.getUserStats(user.id)
      ]);

      setAssessmentHistory(history);
      setUserStats(stats);
    } catch (error) {
      console.error('Lỗi tải dữ liệu user:', error);
      setError('Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (!user) return;

    try {
      await updateProfile(editForm);
      setEditDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Lỗi cập nhật profile:', error);
      setError('Không thể cập nhật thông tin');
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa kết quả đánh giá này?')) {
      return;
    }

    try {
      await userService.deleteAssessment(assessmentId);
      await loadUserData(); // Reload data
    } catch (error) {
      console.error('Lỗi xóa đánh giá:', error);
      setError('Không thể xóa kết quả đánh giá');
    }
  };

  const getAssessmentTypeLabel = (type: string) => {
    switch (type) {
      case 'numerology': return 'Thần Số Học';
      case 'disc': return 'DISC';
      case 'mbti': return 'MBTI';
      case 'cv_analysis': return 'Phân Tích CV';
      default: return type;
    }
  };

  const getAssessmentIcon = (type: string) => {
    switch (type) {
      case 'numerology': return <Psychology color="primary" />;
      case 'disc': return <Assessment color="secondary" />;
      case 'mbti': return <Work color="success" />;
      case 'cv_analysis': return <Star color="warning" />;
      default: return <Assessment />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show auth dialog if not logged in
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Hồ Sơ Cá Nhân
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Vui lòng đăng nhập để xem và quản lý hồ sơ cá nhân của bạn
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setAuthDialogOpen(true)}
            sx={{ mt: 2 }}
          >
            Đăng Nhập
          </Button>
        </Paper>

        <AuthDialog
          open={authDialogOpen}
          onClose={() => setAuthDialogOpen(false)}
          initialTab="signin"
        />
      </Container>
    );
  }

  if (authLoading || loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
          Đang tải dữ liệu...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Grid>
          
          <Grid item xs>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {profile?.full_name || 'Người dùng'}
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2">{user.email}</Typography>
              </Box>
              
              {profile?.phone && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{profile.phone}</Typography>
                </Box>
              )}
              
              {profile?.company && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Business fontSize="small" color="action" />
                  <Typography variant="body2">{profile.company}</Typography>
                </Box>
              )}
              
              {profile?.position && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Work fontSize="small" color="action" />
                  <Typography variant="body2">{profile.position}</Typography>
                </Box>
              )}
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Tham gia: {formatDate(profile?.created_at || user.created_at)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditDialogOpen(true)}
            >
              Chỉnh Sửa
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics */}
      {userStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {userStats.totalAssessments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng Đánh Giá
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {userStats.averageScore.toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Điểm Trung Bình
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {Object.values(userStats.assessmentTypes).filter(count => count > 0).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Loại Đánh Giá
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  <TrendingUp />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tiến Độ Tốt
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Assessment History */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Lịch Sử Đánh Giá
        </Typography>
        
        {assessmentHistory.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Chưa có đánh giá nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bắt đầu với các bài đánh giá để khám phá tiềm năng của bạn
            </Typography>
          </Box>
        ) : (
          <List>
            {assessmentHistory.map((assessment, index) => (
              <React.Fragment key={assessment.id}>
                <ListItem
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 2,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon>
                    {getAssessmentIcon(assessment.assessment_type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h6">
                          {getAssessmentTypeLabel(assessment.assessment_type)}
                        </Typography>
                        {assessment.score && (
                          <Chip
                            label={`${assessment.score}%`}
                            color="primary"
                            size="small"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Hoàn thành: {formatDate(assessment.completed_at)}
                        </Typography>
                        {assessment.notes && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {assessment.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <Box display="flex" gap={1}>
                    <Tooltip title="Xem chi tiết">
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteAssessment(assessment.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                
                {index < assessmentHistory.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Chỉnh Sửa Thông Tin Cá Nhân
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Công ty"
                value={editForm.company}
                onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                InputProps={{
                  startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vị trí công việc"
                value={editForm.position}
                onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                InputProps={{
                  startAdornment: <Work sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleEditProfile}
          >
            Lưu Thay Đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;