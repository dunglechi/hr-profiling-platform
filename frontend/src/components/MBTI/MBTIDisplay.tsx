import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology,
  TrendingUp,
  Warning,
  Work,
  People,
  Favorite,
  EmojiEvents,
  Assessment,
  Share,
  Download,
  Info
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  MBTIResult, 
  getMBTITypeColor, 
  getMBTITypeCategory, 
  getMBTITypeDescription,
  formatDimensionPreference 
} from '../../services/mbtiService';

interface MBTIDisplayProps {
  result: MBTIResult;
  showActions?: boolean;
  onShare?: () => void;
  onDownload?: () => void;
}

const MBTIDisplay: React.FC<MBTIDisplayProps> = ({ 
  result, 
  showActions = true,
  onShare,
  onDownload 
}) => {
  const [expandedSection, setExpandedSection] = useState<string>('overview');
  const [showCompatibilityDialog, setShowCompatibilityDialog] = useState(false);

  const typeColor = getMBTITypeColor(result.type);
  const typeCategory = getMBTITypeCategory(result.type);
  const typeDescription = getMBTITypeDescription(result.type);

  // Prepare data for charts
  const dimensionData = [
    {
      dimension: 'Extraversion vs Introversion',
      preference: formatDimensionPreference(result.scores, 'EI'),
      E: result.scores.E,
      I: result.scores.I
    },
    {
      dimension: 'Sensing vs Intuition',
      preference: formatDimensionPreference(result.scores, 'SN'),
      S: result.scores.S,
      N: result.scores.N
    },
    {
      dimension: 'Thinking vs Feeling',
      preference: formatDimensionPreference(result.scores, 'TF'),
      T: result.scores.T,
      F: result.scores.F
    },
    {
      dimension: 'Judging vs Perceiving',
      preference: formatDimensionPreference(result.scores, 'JP'),
      J: result.scores.J,
      P: result.scores.P
    }
  ];

  const radarData = [
    { dimension: 'E', score: result.scores.E },
    { dimension: 'I', score: result.scores.I },
    { dimension: 'S', score: result.scores.S },
    { dimension: 'N', score: result.scores.N },
    { dimension: 'T', score: result.scores.T },
    { dimension: 'F', score: result.scores.F },
    { dimension: 'J', score: result.scores.J },
    { dimension: 'P', score: result.scores.P }
  ];

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedSection(isExpanded ? panel : '');
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality
      const shareData = {
        title: `My MBTI Result: ${result.type}`,
        text: `I just completed an MBTI assessment and got ${result.type} - ${typeDescription}`,
        url: window.location.href
      };
      
      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Results copied to clipboard!');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center', background: `linear-gradient(135deg, ${typeColor}20, ${typeColor}10)` }}>
        <Avatar
          sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: typeColor, 
            margin: '0 auto 16px',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}
        >
          {result.type}
        </Avatar>
        
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: typeColor }}>
          {result.type}
        </Typography>
        
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {typeDescription}
        </Typography>
        
        <Box display="flex" justifyContent="center" gap={1} mt={2}>
          <Chip 
            label={typeCategory} 
            sx={{ bgcolor: typeColor, color: 'white' }}
          />
          <Chip 
            label="Cognitive Type"
            variant="outlined"
            color="primary"
          />
        </Box>

        {showActions && (
          <Box mt={3} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={handleShare}
            >
              Share Results
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={onDownload}
            >
              Download Report
            </Button>
          </Box>
        )}
      </Paper>

      {/* Cognitive Functions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
          Cognitive Functions Stack
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(result.cognitiveFunctions).map(([position, functionName], index) => (
            <Grid item xs={12} sm={6} md={3} key={position}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%',
                  background: index === 0 ? `${typeColor}15` : 'transparent'
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize', color: typeColor }}>
                    {position}
                  </Typography>
                  <Typography variant="h4" gutterBottom>
                    {functionName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {index === 0 && 'Primary driving force'}
                    {index === 1 && 'Supporting function'}
                    {index === 2 && 'Relief function'}
                    {index === 3 && 'Aspirational function'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Dimension Scores */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Dimension Analysis
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dimensionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="E" fill="#FF6B6B" name="Extraversion" />
                <Bar dataKey="I" fill="#4ECDC4" name="Introversion" />
                <Bar dataKey="S" fill="#45B7D1" name="Sensing" />
                <Bar dataKey="N" fill="#96CEB4" name="Intuition" />
                <Bar dataKey="T" fill="#FFEAA7" name="Thinking" />
                <Bar dataKey="F" fill="#DDA0DD" name="Feeling" />
                <Bar dataKey="J" fill="#98D8C8" name="Judging" />
                <Bar dataKey="P" fill="#F7DC6F" name="Perceiving" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                <Radar
                  name="Scores"
                  dataKey="score"
                  stroke={typeColor}
                  fill={typeColor}
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>

        <Box mt={2}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Dimension</TableCell>
                  <TableCell>Preference</TableCell>
                  <TableCell align="right">Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dimensionData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.dimension}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.preference} 
                        size="small"
                        sx={{ bgcolor: `${typeColor}20`, color: typeColor }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {item.preference.includes('E') ? `${item.E}%` :
                       item.preference.includes('I') ? `${item.I}%` :
                       item.preference.includes('S') ? `${item.S}%` :
                       item.preference.includes('N') ? `${item.N}%` :
                       item.preference.includes('T') ? `${item.T}%` :
                       item.preference.includes('F') ? `${item.F}%` :
                       item.preference.includes('J') ? `${item.J}%` :
                       `${item.P}%`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Detailed Analysis Sections */}
      <Paper sx={{ mb: 3 }}>
        {/* Overview */}
        <Accordion 
          expanded={expandedSection === 'overview'} 
          onChange={handleAccordionChange('overview')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
              Personality Overview
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              {result.analysis.overview}
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Strengths */}
        <Accordion 
          expanded={expandedSection === 'strengths'} 
          onChange={handleAccordionChange('strengths')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Strengths & Talents
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {result.analysis.strengths.map((strength, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1">
                        <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle', color: 'gold' }} />
                        {strength}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Challenges */}
        <Accordion 
          expanded={expandedSection === 'challenges'} 
          onChange={handleAccordionChange('challenges')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
              Growth Areas & Challenges
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {result.analysis.challenges.map((challenge, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    {challenge}
                  </Alert>
                </Grid>
              ))}
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Development Recommendations
            </Typography>
            <List>
              {result.development.recommendations.map((rec, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <TrendingUp color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={rec} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Work Style */}
        <Accordion 
          expanded={expandedSection === 'work'} 
          onChange={handleAccordionChange('work')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
              Work & Career
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Work Preferences</Typography>
                <Typography variant="body1" paragraph>
                  {result.analysis.workPreferences}
                </Typography>
                
                <Typography variant="h6" gutterBottom>Leadership Style</Typography>
                <Typography variant="body1" paragraph>
                  {result.analysis.leadershipStyle}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Career Fit</Typography>
                <List dense>
                  {result.analysis.careerFit.map((career, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Work color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={career} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Team Role</Typography>
            <Alert severity="success">
              {result.analysis.teamRole}
            </Alert>
          </AccordionDetails>
        </Accordion>

        {/* Communication & Relationships */}
        <Accordion 
          expanded={expandedSection === 'relationships'} 
          onChange={handleAccordionChange('relationships')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <People sx={{ mr: 1, verticalAlign: 'middle' }} />
              Communication & Relationships
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom>Communication Style</Typography>
            <Typography variant="body1" paragraph>
              {result.analysis.communicationStyle}
            </Typography>
            
            <Typography variant="h6" gutterBottom>Decision Making</Typography>
            <Typography variant="body1" paragraph>
              {result.analysis.decisionMaking}
            </Typography>
            
            <Box mt={3}>
              <Button
                variant="outlined"
                onClick={() => setShowCompatibilityDialog(true)}
                sx={{ mb: 2 }}
              >
                View Compatibility Analysis
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Compatibility Dialog */}
      <Dialog
        open={showCompatibilityDialog}
        onClose={() => setShowCompatibilityDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Favorite sx={{ mr: 1, verticalAlign: 'middle' }} />
          Relationship Compatibility
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Romantic</Typography>
              <List dense>
                {result.relationships.romantic.map((type, index) => (
                  <ListItem key={index}>
                    <Chip 
                      label={type} 
                      size="small" 
                      sx={{ bgcolor: getMBTITypeColor(type), color: 'white' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Friendship</Typography>
              <List dense>
                {result.relationships.friendship.map((type, index) => (
                  <ListItem key={index}>
                    <Chip 
                      label={type} 
                      size="small" 
                      sx={{ bgcolor: getMBTITypeColor(type), color: 'white' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Work Collaboration</Typography>
              <List dense>
                {result.relationships.workCollaboration.map((type, index) => (
                  <ListItem key={index}>
                    <Chip 
                      label={type} 
                      size="small" 
                      sx={{ bgcolor: getMBTITypeColor(type), color: 'white' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompatibilityDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MBTIDisplay;