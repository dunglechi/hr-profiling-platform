import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Alert,
  Fade,
  Slide,
  Grow,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Work,
  Psychology,
  TrendingUp,
  Star,
  AutoAwesome,
  Timeline,
  Group,
  Lightbulb,
  Share,
  Download
} from '@mui/icons-material';
import { CompatibilityRadarChart } from '../charts/CSPCompatibleChart';
// Temporarily disable recharts to avoid CSP eval issues
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface NumerologyResult {
  lifePathNumber: number;
  destinyNumber: number;
  personalityNumber: number;
  soulUrgeNumber: number;
  attitudeLessonNumber: number;
  birthDayNumber: number;
  challengeNumbers: number[];
  pinnacleNumbers: number[];
  personalYearNumber: number;
  coreTraits: {
    positive: string[];
    negative: string[];
    keywords: string[];
  };
  strengths: string[];
  challenges: string[];
  careerGuidance: {
    suitableCareers: string[];
    workStyle: string;
    leadershipStyle: string;
    teamRole: string;
  };
  relationships: {
    compatibility: string[];
    challenges: string[];
    advice: string[];
  };
  lifeCycle: {
    youthPhase: string;
    adulthoodPhase: string;
    maturityPhase: string;
  };
  analysis: string;
  compatibility: {
    leadership: number;
    teamwork: number;
    communication: number;
    innovation: number;
    analytical: number;
    overall: number;
  };
}

interface EnhancedNumerologyDisplayProps {
  result: NumerologyResult;
  fullName: string;
  birthDate: Date;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const NumberCard: React.FC<{ 
  number: number; 
  title: string; 
  description?: string;
  color?: string;
  delay?: number;
}> = ({ number, title, description, color = 'primary', delay = 0 }) => (
  <Grow in timeout={800 + delay}>
    <Card sx={{ 
      height: '100%', 
      textAlign: 'center',
      position: 'relative',
      overflow: 'visible',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
      },
      transition: 'all 0.3s ease'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: `linear-gradient(135deg, ${color === 'primary' ? '#2196F3, #21CBF3' : '#9C27B0, #E91E63'})`
          }}
        >
          {number}
        </Avatar>
        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  </Grow>
);

// CSP-compliant chart component using Chart.js
// Note: Original CompatibilityRadarChart now imported from charts/CSPCompatibleChart

const ProgressBar: React.FC<{ label: string; value: number; color?: string }> = ({ 
  label, 
  value, 
  color = 'primary' 
}) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2" fontWeight="medium">
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {value}%
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{
        height: 8,
        borderRadius: 4,
        backgroundColor: 'grey.200',
        '& .MuiLinearProgress-bar': {
          borderRadius: 4,
          background: color === 'primary' 
            ? 'linear-gradient(90deg, #2196F3, #21CBF3)'
            : 'linear-gradient(90deg, #9C27B0, #E91E63)'
        }
      }}
    />
  </Box>
);

const EnhancedNumerologyDisplay: React.FC<EnhancedNumerologyDisplayProps> = ({ 
  result, 
  fullName, 
  birthDate 
}) => {
  const { t } = useTranslation('numerology');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tabValue, setTabValue] = useState(0);

  // Debug removed to avoid CSP eval issues
  if (!result) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">❌ Không có kết quả để hiển thị</Typography>
        <Typography variant="body2">Result object is null or undefined</Typography>
      </Box>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const coreNumbers = [
    { number: result.lifePathNumber, title: 'Số Đường Đời', description: 'Mục đích cuộc sống và hướng đi chính' },
    { number: result.destinyNumber, title: 'Số Sứ Mệnh', description: 'Tài năng và khả năng thiên bẩm' },
    { number: result.personalityNumber, title: 'Số Nhân Cách', description: 'Cách thể hiện bản thân ra bên ngoài' },
    { number: result.soulUrgeNumber, title: 'Số Linh Hồn', description: 'Động lực và mong muốn sâu sắc' }
  ];

  const compatibilityData = [
    { name: 'Tổng thể', value: result.compatibility.overall, color: '#2196F3' },
    { name: 'Lãnh đạo', value: result.compatibility.leadership, color: '#4CAF50' },
    { name: 'Teamwork', value: result.compatibility.teamwork, color: '#FF9800' },
    { name: 'Giao tiếp', value: result.compatibility.communication, color: '#9C27B0' },
    { name: 'Sáng tạo', value: result.compatibility.innovation, color: '#F44336' }
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header Section */}
      <Slide in direction="down" timeout={600}>
        <Paper elevation={4} sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <Grid container spacing={isMobile ? 2 : 3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                fontWeight="bold" 
                gutterBottom
                sx={{ fontSize: isMobile ? '24px' : '32px' }}
              >
                <Psychology sx={{ mr: isMobile ? 1 : 2, verticalAlign: 'middle' }} />
                {t('results.reportTitle', 'Báo Cáo Thần Số Học')}
              </Typography>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                sx={{ 
                  opacity: 0.9, 
                  mb: 2,
                  fontSize: isMobile ? '16px' : '20px'
                }}
              >
                👤 {fullName}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                📅 {t('results.birthDate', 'Ngày sinh')}: {birthDate.toLocaleDateString('vi-VN')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {result.lifePathNumber}
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Số Đường Đời Chính
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Slide>

      {/* Main Content Tabs */}
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontSize: isMobile ? '14px' : '16px',
                minHeight: isMobile ? 40 : 48,
                px: isMobile ? 2 : 3
              }
            }}
          >
            <Tab icon={<Star />} label="Tổng Quan" />
            <Tab icon={<Psychology />} label="Tính Cách" />
            <Tab icon={<Work />} label="Nghề Nghiệp" />
            <Tab icon={<Group />} label="Tương Thích" />
            <Tab icon={<Timeline />} label="Chu Kỳ Đời" />
          </Tabs>
        </Box>

        {/* Tab 1: Overview */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Core Numbers */}
            <Grid item xs={12}>
              <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
                Các Số Cốt Lõi
              </Typography>
              <Grid container spacing={3}>
                {coreNumbers.map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <NumberCard
                      number={item.number}
                      title={item.title}
                      description={item.description}
                      delay={index * 200}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Quick Analysis */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
                Phân Tích Tổng Quan
              </Typography>
              <Fade in timeout={1000}>
                <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                  <Typography variant="body1">
                    {result.analysis}
                  </Typography>
                </Alert>
              </Fade>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Personality */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Điểm Mạnh
              </Typography>
              <List>
                {result.coreTraits.positive.map((trait, index) => (
                  <Grow in timeout={600 + index * 200} key={index}>
                    <ListItem sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <Star color="success" />
                      </ListItemIcon>
                      <ListItemText primary={trait} />
                    </ListItem>
                  </Grow>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" color="warning.main" gutterBottom>
                <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
                Thách Thức & Phát Triển
              </Typography>
              <List>
                {result.coreTraits.negative.map((trait, index) => (
                  <Grow in timeout={800 + index * 200} key={index}>
                    <ListItem sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <Lightbulb color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={trait} />
                    </ListItem>
                  </Grow>
                ))}
              </List>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                🏷️ Từ Khóa Đặc Trưng
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {result.coreTraits.keywords.map((keyword, index) => (
                  <Grow in timeout={1000 + index * 100} key={index}>
                    <Chip
                      label={keyword}
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        fontWeight: 'medium',
                        '&:hover': { 
                          backgroundColor: 'primary.50',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </Grow>
                ))}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Career */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                Nghề Nghiệp Phù Hợp
              </Typography>
              <List>
                {result.careerGuidance.suitableCareers.map((career, index) => (
                  <Grow in timeout={600 + index * 200} key={index}>
                    <ListItem sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <Work color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={career} />
                    </ListItem>
                  </Grow>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  💼 Phong Cách Làm Việc
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Cách làm việc:</strong> {result.careerGuidance.workStyle}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Phong cách lãnh đạo:</strong> {result.careerGuidance.leadershipStyle}
                </Typography>
                <Typography variant="body1">
                  <strong>Vai trò trong nhóm:</strong> {result.careerGuidance.teamRole}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: Compatibility */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                📊 Biểu Đồ Khả Năng
              </Typography>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <CompatibilityRadarChart data={result.compatibility} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                📈 Chi Tiết Đánh Giá
              </Typography>
              <Box sx={{ mt: 2 }}>
                {compatibilityData.map((item, index) => (
                  <Fade in timeout={800 + index * 200} key={index}>
                    <Box>
                      <ProgressBar
                        label={item.name}
                        value={item.value}
                        color="primary"
                      />
                    </Box>
                  </Fade>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                💡 Lời Khuyên Phát Triển
              </Typography>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body1">
                  Dựa trên phân tích, bạn có điểm mạnh về{' '}
                  <strong>
                    {compatibilityData
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 2)
                      .map(item => item.name.toLowerCase())
                      .join(' và ')
                    }
                  </strong>
                  . Nên tập trung phát triển thêm về{' '}
                  <strong>
                    {compatibilityData
                      .sort((a, b) => a.value - b.value)
                      .slice(0, 1)
                      .map(item => item.name.toLowerCase())
                      .join('')
                    }
                  </strong>{' '}
                  để cân bằng và hoàn thiện bản thân.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5: Life Cycle */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  🌱 Giai Đoạn Trẻ (0-27 tuổi)
                </Typography>
                <Typography variant="body1">
                  {result.lifeCycle.youthPhase}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  🌳 Giai Đoạn Trưởng Thành (28-54 tuổi)
                </Typography>
                <Typography variant="body1">
                  {result.lifeCycle.adulthoodPhase}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  🌺 Giai Đoạn Trưởng Thành (55+ tuổi)
                </Typography>
                <Typography variant="body1">
                  {result.lifeCycle.maturityPhase}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                <Typography variant="body1">
                  <strong>💫 Năm Cá Nhân Hiện Tại: {result.personalYearNumber}</strong>
                  <br />
                  Đây là năm mang năng lượng số {result.personalYearNumber}, phù hợp cho{' '}
                  {result.personalYearNumber === 1 ? 'khởi đầu mới và lãnh đạo' :
                   result.personalYearNumber === 2 ? 'hợp tác và cân bằng' :
                   result.personalYearNumber === 3 ? 'sáng tạo và giao tiếp' :
                   result.personalYearNumber === 4 ? 'xây dựng nền tảng vững chắc' :
                   result.personalYearNumber === 5 ? 'thay đổi và khám phá' :
                   result.personalYearNumber === 6 ? 'chăm sóc và trách nhiệm' :
                   result.personalYearNumber === 7 ? 'nghiên cứu và phát triển tâm linh' :
                   result.personalYearNumber === 8 ? 'thành tựu vật chất và quyền lực' :
                   'hoàn thành và chuẩn bị chu kỳ mới'}.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Action Buttons */}
      <Fade in timeout={1500}>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Share />}
            sx={{ mr: 2, borderRadius: 2 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: t('results.reportTitle', 'Báo Cáo Thần Số Học'),
                  text: t('results.shareText', `Báo cáo thần số học của ${fullName}`),
                  url: window.location.href
                });
              }
            }}
          >
            {t('actions.share', 'Chia Sẻ')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            sx={{ borderRadius: 2 }}
            onClick={() => {
              // Implement PDF download functionality
              console.log('Download PDF');
            }}
          >
            Tải PDF
          </Button>
        </Box>
      </Fade>
    </Box>
  );
};

export default EnhancedNumerologyDisplay;