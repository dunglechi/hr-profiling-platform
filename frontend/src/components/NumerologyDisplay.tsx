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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

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

interface NumerologyDisplayProps {
  result: NumerologyResult;
}

const NumberCard: React.FC<{ number: number; title: string; description?: string }> = ({ 
  number, 
  title, 
  description 
}) => (
  <Card sx={{ height: '100%', textAlign: 'center' }}>
    <CardContent>
      <Typography variant="h2" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
        {number}
      </Typography>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium' }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const CompatibilityBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" color="primary">{value}%</Typography>
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={value} 
      sx={{ 
        height: 8, 
        borderRadius: 4,
        backgroundColor: 'grey.200',
        '& .MuiLinearProgress-bar': {
          borderRadius: 4
        }
      }} 
    />
  </Box>
);

const NumerologyDisplay: React.FC<NumerologyDisplayProps> = ({ result }) => {
  const { t } = useTranslation('numerology');
  const [expanded, setExpanded] = useState<string | false>('core');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
        📊 Kết Quả Thần Số Học Pythagoras
      </Typography>

      {/* Core Numbers */}
      <Accordion expanded={expanded === 'core'} onChange={handleChange('core')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">🔢 Các Số Cốt Lõi</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <NumberCard 
                number={result.lifePathNumber} 
                title={t('results.lifePathNumber')}
                description="Con số định hướng cuộc đời"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <NumberCard 
                number={result.destinyNumber} 
                title={t('results.destinyNumber')}
                description="Mục tiêu cuộc đời"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <NumberCard 
                number={result.personalityNumber} 
                title={t('results.personalityNumber')}
                description="Cách thể hiện bên ngoài"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <NumberCard 
                number={result.soulUrgeNumber} 
                title={t('results.soulNumber')}
                description="Khao khát nội tâm"
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <NumberCard 
                number={result.attitudeLessonNumber} 
                title="Thái Độ" 
                description="Cách tiếp cận vấn đề"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <NumberCard 
                number={result.birthDayNumber} 
                title="Ngày Sinh" 
                description="Tài năng đặc biệt"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <NumberCard 
                number={result.personalYearNumber} 
                title="Năm Cá Nhân" 
                description="Năm hiện tại"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Core Traits */}
      <Accordion expanded={expanded === 'traits'} onChange={handleChange('traits')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">🎯 Đặc Điểm Tính Cách</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="success.main" gutterBottom>
                {t('results.coreTraits.strengths')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {result.coreTraits.positive.map((trait, index) => (
                  <Chip 
                    key={index} 
                    label={trait} 
                    color="success" 
                    variant="outlined" 
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="warning.main" gutterBottom>
                {t('results.coreTraits.challenges')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {result.coreTraits.negative.map((trait, index) => (
                  <Chip 
                    key={index} 
                    label={trait} 
                    color="warning" 
                    variant="outlined" 
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="primary" gutterBottom>
                🏷️ Từ Khóa
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {result.coreTraits.keywords.map((keyword, index) => (
                  <Chip 
                    key={index} 
                    label={keyword} 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Career Guidance */}
      <Accordion expanded={expanded === 'career'} onChange={handleChange('career')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">💼 {t('results.career.title')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>{t('results.career.suitableCareers')}</Typography>
              {result.careerGuidance.suitableCareers.map((career, index) => (
                <Alert key={index} severity="info" sx={{ mb: 1 }}>
                  {career}
                </Alert>
              ))}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('results.career.workStyle')}</Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Phong cách:</strong> {result.careerGuidance.workStyle}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Lãnh đạo:</strong> {result.careerGuidance.leadershipStyle}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Vai trò nhóm:</strong> {result.careerGuidance.teamRole}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Compatibility Analysis */}
      <Accordion expanded={expanded === 'compatibility'} onChange={handleChange('compatibility')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">📈 Phân Tích Tương Thích Công Việc</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Điểm Số Tương Thích</Typography>
              <CompatibilityBar label="Khả năng lãnh đạo" value={result.compatibility.leadership} />
              <CompatibilityBar label="Làm việc nhóm" value={result.compatibility.teamwork} />
              <CompatibilityBar label="Giao tiếp" value={result.compatibility.communication} />
              <CompatibilityBar label="Sáng tạo" value={result.compatibility.innovation} />
              <CompatibilityBar label="Phân tích" value={result.compatibility.analytical} />
              <Divider sx={{ my: 2 }} />
              <CompatibilityBar label="Tổng thể" value={result.compatibility.overall} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Số Thách Thức & Đỉnh Cao</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Loại</TableCell>
                      <TableCell>Giai Đoạn 1</TableCell>
                      <TableCell>Giai Đoạn 2</TableCell>
                      <TableCell>Giai Đoạn 3</TableCell>
                      <TableCell>Giai Đoạn 4</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Thách Thức</strong></TableCell>
                      {result.challengeNumbers.map((num, index) => (
                        <TableCell key={index}>{num}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Đỉnh Cao</strong></TableCell>
                      {result.pinnacleNumbers.map((num, index) => (
                        <TableCell key={index}>{num}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Life Cycles */}
      <Accordion expanded={expanded === 'lifecycle'} onChange={handleChange('lifecycle')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">🔄 Chu Kỳ Cuộc Đời</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    🌱 Giai Đoạn Trẻ (0-27 tuổi)
                  </Typography>
                  <Typography variant="body2">
                    {result.lifeCycle.youthPhase}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    🌳 Giai Đoạn Trưởng Thành (28-54 tuổi)
                  </Typography>
                  <Typography variant="body2">
                    {result.lifeCycle.adulthoodPhase}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    🏛️ Giai Đoạn Chín Muồi (55+ tuổi)
                  </Typography>
                  <Typography variant="body2">
                    {result.lifeCycle.maturityPhase}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Detailed Analysis */}
      <Accordion expanded={expanded === 'analysis'} onChange={handleChange('analysis')}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">📝 Phân Tích Chi Tiết</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                🎭 Phân Tích Tổng Quan Theo Pythagoras
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {result.analysis}
              </Typography>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default NumerologyDisplay;