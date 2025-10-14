import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Work,
  LocationOn,
  AttachMoney,
  Business,
  TrendingUp,
  Star,
  FilterList,
  Search,
  CheckCircle,
  Warning,
  Psychology,
  ExpandMore,
  Launch,
  Bookmark,
  Share,
  Info
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { jobMatchingService, JobMatch, JobPosition } from '../services/jobMatchingService';
import AuthDialog from './AuthDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const JobMatching: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [allJobs, setAllJobs] = useState<JobPosition[]>([]);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');

  // Search and filter states
  const [filters, setFilters] = useState({
    level: '',
    location: '',
    remoteOnly: false,
    salaryMin: 0,
    keywords: [] as string[]
  });
  const [searchKeyword, setSearchKeyword] = useState('');

  // Load data when component mounts
  useEffect(() => {
    if (user) {
      loadJobData();
    } else {
      loadAllJobs();
    }
  }, [user]);

  const loadJobData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Load personalized job matches and all jobs in parallel
      const [matches, jobs] = await Promise.all([
        jobMatchingService.findJobMatches(user.id, 20),
        jobMatchingService.searchJobs({})
      ]);

      setJobMatches(matches);
      setAllJobs(jobs);
    } catch (error) {
      console.error('Lỗi tải dữ liệu job:', error);
      setError('Không thể tải danh sách công việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadAllJobs = async () => {
    try {
      setLoading(true);
      const jobs = await jobMatchingService.searchJobs({});
      setAllJobs(jobs);
    } catch (error) {
      console.error('Lỗi tải danh sách job:', error);
      setError('Không thể tải danh sách công việc.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      const searchFilters = {
        ...filters,
        keywords: searchKeyword ? [searchKeyword] : []
      };

      const jobs = await jobMatchingService.searchJobs(searchFilters);
      setAllJobs(jobs);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      setError('Lỗi tìm kiếm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatNumber = (num: number) => {
      if (currency === 'VND') {
        return `${Math.round(num / 1000000)}M`;
      }
      return num.toLocaleString();
    };
    return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getJobLevelChipColor = (level: string) => {
    const colors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' } = {
      'entry': 'info',
      'junior': 'primary',
      'senior': 'warning',
      'lead': 'error',
      'manager': 'secondary',
      'director': 'success',
      'executive': 'error'
    };
    return colors[level] || 'default';
  };

  // Show auth dialog if not logged in
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Work sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Gợi Ý Việc Làm Thông Minh
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Đăng nhập để nhận gợi ý việc làm phù hợp dựa trên kết quả đánh giá của bạn
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setAuthDialogOpen(true)}
            sx={{ mt: 2 }}
          >
            Đăng Nhập Để Xem Gợi Ý
          </Button>
        </Paper>

        {/* Show all jobs for non-logged in users */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Tất Cả Việc Làm
          </Typography>
          <Grid container spacing={3}>
            {allJobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {job.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Business fontSize="small" color="action" />
                      <Typography variant="body2">{job.company}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2">{job.location}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <AttachMoney fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatSalary(job.salary_range.min, job.salary_range.max, job.salary_range.currency)}
                      </Typography>
                    </Box>
                    <Chip 
                      label={job.level} 
                      color={getJobLevelChipColor(job.level)}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <AuthDialog
          open={authDialogOpen}
          onClose={() => setAuthDialogOpen(false)}
          initialTab="signin"
        />
      </Container>
    );
  }

  if (loading && jobMatches.length === 0 && allJobs.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
          Đang phân tích hồ sơ và tìm việc phù hợp...
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

      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <TrendingUp sx={{ fontSize: 48 }} />
          <Typography variant="h3" fontWeight="bold">
            Gợi Ý Việc Làm Thông Minh
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Dựa trên kết quả đánh giá MBTI, DISC, Thần số học và CV của bạn
        </Typography>
      </Paper>

      {/* Search and Filter Bar */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo từ khóa..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
            >
              Tìm Kiếm
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterDialogOpen(true)}
            >
              Bộ Lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label={`Gợi Ý Cho Bạn (${jobMatches.length})`} 
            icon={<Star />} 
            iconPosition="start"
          />
          <Tab 
            label={`Tất Cả Việc Làm (${allJobs.length})`} 
            icon={<Work />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Job Recommendations Tab */}
      <TabPanel value={tabValue} index={0}>
        {jobMatches.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Psychology sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Chưa Có Gợi Ý Việc Làm
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Hoàn thành các bài đánh giá để nhận gợi ý việc làm phù hợp
            </Typography>
            <Button variant="contained" href="/mbti">
              Bắt Đầu Đánh Giá
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {jobMatches.map((match) => (
              <Grid item xs={12} key={match.job.id}>
                <Card 
                  elevation={3}
                  sx={{ 
                    border: match.match_score.overall_score >= 80 ? '2px solid #4caf50' : 'none',
                    position: 'relative'
                  }}
                >
                  {match.match_score.overall_score >= 80 && (
                    <Chip
                      label="TOP MATCH"
                      color="success"
                      size="small"
                      sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {/* Job Info */}
                      <Grid item xs={12} md={8}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                          {match.job.title}
                        </Typography>
                        
                        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Business fontSize="small" color="action" />
                            <Typography variant="body2">{match.job.company}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2">{match.job.location}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <AttachMoney fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatSalary(match.job.salary_range.min, match.job.salary_range.max, match.job.salary_range.currency)}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" paragraph>
                          {match.job.description}
                        </Typography>

                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                          <Chip label={match.job.level} color={getJobLevelChipColor(match.job.level)} size="small" />
                          <Chip label={match.job.department} variant="outlined" size="small" />
                          {match.job.work_environment.remote_friendly && (
                            <Chip label="Remote OK" color="primary" variant="outlined" size="small" />
                          )}
                        </Box>
                      </Grid>

                      {/* Match Score */}
                      <Grid item xs={12} md={4}>
                        <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                          <Typography variant="h6" gutterBottom textAlign="center">
                            Độ Phù Hợp
                          </Typography>
                          
                          <Box textAlign="center" mb={2}>
                            <Typography 
                              variant="h3" 
                              color={getMatchScoreColor(match.match_score.overall_score)}
                              fontWeight="bold"
                            >
                              {match.match_score.overall_score}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={match.match_score.overall_score}
                              color={getMatchScoreColor(match.match_score.overall_score)}
                              sx={{ height: 8, borderRadius: 1, mt: 1 }}
                            />
                          </Box>

                          {/* Score Breakdown */}
                          <Box>
                            {Object.entries(match.match_score.breakdown).map(([key, value]) => (
                              <Box key={key} mb={1}>
                                <Box display="flex" justifyContent="space-between">
                                  <Typography variant="caption">
                                    {key === 'personality_fit' && 'Tính cách'}
                                    {key === 'skills_match' && 'Kỹ năng'}
                                    {key === 'experience_fit' && 'Kinh nghiệm'}
                                    {key === 'cultural_fit' && 'Văn hóa'}
                                    {key === 'numerology_harmony' && 'Thần số'}
                                  </Typography>
                                  <Typography variant="caption">{value}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={value} 
                                  size="small"
                                  sx={{ height: 4 }}
                                />
                              </Box>
                            ))}
                          </Box>

                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => setSelectedJob(match)}
                            sx={{ mt: 2 }}
                          >
                            Xem Chi Tiết
                          </Button>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* All Jobs Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {allJobs.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job.id}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {job.title}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Business fontSize="small" color="action" />
                    <Typography variant="body2">{job.company}</Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2">{job.location}</Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <AttachMoney fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatSalary(job.salary_range.min, job.salary_range.max, job.salary_range.currency)}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {job.description}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip 
                      label={job.level} 
                      color={getJobLevelChipColor(job.level)}
                      size="small"
                    />
                    <Button size="small" variant="outlined">
                      Xem Thêm
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Job Detail Dialog */}
      <Dialog
        open={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { minHeight: '80vh' } }}
      >
        {selectedJob && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedJob.job.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {selectedJob.job.company} • {selectedJob.job.location}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {selectedJob.match_score.overall_score}%
                  </Typography>
                  <Typography variant="caption">Độ phù hợp</Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Grid container spacing={3}>
                {/* Job Details */}
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Mô Tả Công Việc
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedJob.job.description}
                  </Typography>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Yêu Cầu
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Kỹ năng kỹ thuật:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {selectedJob.job.requirements.technical_skills.map((skill) => (
                      <Chip key={skill} label={skill} variant="outlined" size="small" />
                    ))}
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Kỹ năng mềm:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {selectedJob.job.requirements.soft_skills.map((skill) => (
                      <Chip key={skill} label={skill} variant="outlined" size="small" />
                    ))}
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Kinh nghiệm: {selectedJob.job.requirements.experience_years} năm
                  </Typography>
                </Grid>

                {/* Match Analysis */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Phân Tích Độ Phù Hợp
                    </Typography>

                    {/* Strengths */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2" color="success.main">
                          Điểm Mạnh ({selectedJob.match_score.strengths.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {selectedJob.match_score.strengths.map((strength, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckCircle color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={strength} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    {/* Concerns */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2" color="warning.main">
                          Lưu Ý ({selectedJob.match_score.concerns.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {selectedJob.match_score.concerns.map((concern, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Warning color="warning" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={concern} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    {/* Application Tips */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2" color="primary">
                          Tips Ứng Tuyển
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {selectedJob.application_tips.map((tip, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Info color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={tip} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setSelectedJob(null)}>
                Đóng
              </Button>
              <Button variant="contained" startIcon={<Launch />}>
                Ứng Tuyển Ngay
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bộ Lọc Tìm Kiếm</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Cấp độ</InputLabel>
                <Select
                  value={filters.level}
                  onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="entry">Entry Level</MenuItem>
                  <MenuItem value="junior">Junior</MenuItem>
                  <MenuItem value="senior">Senior</MenuItem>
                  <MenuItem value="lead">Lead</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Địa điểm"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ho Chi Minh City, Hanoi..."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.remoteOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, remoteOnly: e.target.checked }))}
                  />
                }
                label="Chỉ việc làm remote"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lương tối thiểu (triệu VND)"
                type="number"
                value={filters.salaryMin / 1000000}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  salaryMin: parseFloat(e.target.value) * 1000000 || 0 
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={() => { 
              setFilterDialogOpen(false); 
              handleSearch(); 
            }}
          >
            Áp Dụng Bộ Lọc
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobMatching;