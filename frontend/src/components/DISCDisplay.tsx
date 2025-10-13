/**
 * DISC Results Display Component
 * 
 * Professional visualization of DISC assessment results
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Container,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Psychology,
  TrendingUp,
  Warning,
  Forum,
  Work,
  Person,
  Speed,
  Groups,
  Assessment,
  Download,
  Share,
  CheckCircle
} from '@mui/icons-material';
import {
  getDISCStyleColor,
  getDISCStyleDescription,
  formatDISCScore,
  type DISCResult,
  type DISCScores
} from '../services/discService';

interface DISCDisplayProps {
  result: DISCResult;
  candidateName?: string;
  onExport?: () => void;
  onShare?: () => void;
}

const DISCDisplay: React.FC<DISCDisplayProps> = ({
  result,
  candidateName,
  onExport,
  onShare
}) => {
  const [expanded, setExpanded] = useState<string>('overview');

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : '');
  };

  const renderScoreBar = (label: string, score: number, dimension: string) => (
    <Box mb={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight="bold">
          {label} ({dimension})
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            {score}/100
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({formatDISCScore(score)})
          </Typography>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 12,
          borderRadius: 6,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getDISCStyleColor(dimension),
            borderRadius: 6
          }
        }}
      />
    </Box>
  );

  const renderListSection = (
    title: string,
    items: string[],
    icon: React.ReactElement,
    color: 'success' | 'warning' | 'info' | 'error' = 'info'
  ) => (
    <Box mb={3}>
      <Box display="flex" alignItems="center" mb={2}>
        {React.cloneElement(icon, { sx: { mr: 1, color: `${color}.main` } })}
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      <List dense>
        {items.map((item, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircle sx={{ fontSize: 16, color: `${color}.main` }} />
            </ListItemIcon>
            <ListItemText
              primary={item}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const intensityColor = result.intensity === 'High' ? 'error' : 
                        result.intensity === 'Moderate' ? 'warning' : 'info';

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item>
            <Psychology sx={{ fontSize: 60, color: 'primary.main' }} />
          </Grid>
          <Grid item flex={1}>
            <Typography variant="h4" gutterBottom>
              DISC Assessment Results
            </Typography>
            {candidateName && (
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {candidateName}
              </Typography>
            )}
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip
                label={`Primary: ${result.primaryStyle}`}
                sx={{
                  backgroundColor: getDISCStyleColor(result.primaryStyle),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              {result.secondaryStyle && (
                <Chip
                  label={`Secondary: ${result.secondaryStyle}`}
                  sx={{
                    backgroundColor: getDISCStyleColor(result.secondaryStyle),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                  variant="outlined"
                />
              )}
              <Chip
                label={`${result.intensity} Intensity`}
                color={intensityColor}
                variant="outlined"
              />
            </Box>
          </Grid>
          <Grid item>
            <Box display="flex" gap={1}>
              {onExport && (
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={onExport}
                  size="small"
                >
                  Export
                </Button>
              )}
              {onShare && (
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={onShare}
                  size="small"
                >
                  Share
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Overview Accordion */}
      <Accordion
        expanded={expanded === 'overview'}
        onChange={handleAccordionChange('overview')}
        elevation={2}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center">
            <Assessment sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">DISC Scores Overview</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              {renderScoreBar('Dominance', result.scores.D, 'D')}
              {renderScoreBar('Influence', result.scores.I, 'I')}
              {renderScoreBar('Steadiness', result.scores.S, 'S')}
              {renderScoreBar('Conscientiousness', result.scores.C, 'C')}
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 3, height: 'fit-content' }}>
                <Typography variant="h6" gutterBottom>
                  Primary Style: {result.primaryStyle}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {getDISCStyleDescription(result.primaryStyle)}
                </Typography>
                {result.secondaryStyle && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Secondary Style: {result.secondaryStyle}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {getDISCStyleDescription(result.secondaryStyle)}
                    </Typography>
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Behavioral Traits Accordion */}
      <Accordion
        expanded={expanded === 'traits'}
        onChange={handleAccordionChange('traits')}
        elevation={2}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center">
            <Psychology sx={{ mr: 2, color: 'secondary.main' }} />
            <Typography variant="h6">Behavioral Traits</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              {renderListSection(
                'Natural Behavior',
                result.behavioralTraits.natural,
                <TrendingUp />,
                'success'
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderListSection(
                'Adapted Behavior',
                result.behavioralTraits.adapted,
                <Speed />,
                'info'
              )}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Strengths & Challenges Accordion */}
      <Accordion
        expanded={expanded === 'strengths'}
        onChange={handleAccordionChange('strengths')}
        elevation={2}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
            <Typography variant="h6">Strengths & Development Areas</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              {renderListSection(
                'Key Strengths',
                result.analysis.strengths,
                <CheckCircle />,
                'success'
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderListSection(
                'Development Areas',
                result.analysis.challenges,
                <Warning />,
                'warning'
              )}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Work Style Accordion */}
      <Accordion
        expanded={expanded === 'workstyle'}
        onChange={handleAccordionChange('workstyle')}
        elevation={2}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center">
            <Work sx={{ mr: 2, color: 'info.main' }} />
            <Typography variant="h6">Work Style & Environment</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Forum sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Communication Style</Typography>
                </Box>
                <Typography variant="body1">{result.analysis.communication}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Work sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Ideal Work Environment</Typography>
                </Box>
                <Typography variant="body1">{result.analysis.workEnvironment}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Motivation Factors</Typography>
                </Box>
                <Typography variant="body1">{result.analysis.motivation}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Warning sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">Stress Response</Typography>
                </Box>
                <Typography variant="body1">{result.analysis.stressResponse}</Typography>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Leadership & Decision Making Accordion */}
      <Accordion
        expanded={expanded === 'leadership'}
        onChange={handleAccordionChange('leadership')}
        elevation={2}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center">
            <Person sx={{ mr: 2, color: 'warning.main' }} />
            <Typography variant="h6">Leadership & Decision Making</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Person sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">Leadership Style</Typography>
                </Box>
                <Typography variant="body1">{result.analysis.leadership}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Speed sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="h6">Decision Making</Typography>
                </Box>
                <Typography variant="body1">{result.analysis.decisionMaking}</Typography>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Compatibility Accordion */}
      <Accordion
        expanded={expanded === 'compatibility'}
        onChange={handleAccordionChange('compatibility')}
        elevation={2}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center">
            <Groups sx={{ mr: 2, color: 'secondary.main' }} />
            <Typography variant="h6">Team Compatibility</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              {renderListSection(
                'Works Well With',
                result.compatibility.worksWith,
                <CheckCircle />,
                'success'
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderListSection(
                'May Challenge With',
                result.compatibility.challengesWith,
                <Warning />,
                'warning'
              )}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Summary Alert */}
      <Alert
        severity="info"
        sx={{ mt: 3 }}
        action={
          <Button size="small" onClick={() => setExpanded('')}>
            Collapse All
          </Button>
        }
      >
        <Typography variant="body2">
          This DISC assessment provides insights into behavioral preferences and working styles. 
          Results should be used as a guide for development and team optimization, not as absolute definitions.
        </Typography>
      </Alert>
    </Container>
  );
};

export default DISCDisplay;