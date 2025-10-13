import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Info,
  Visibility,
  ExpandMore,
  Download,
  Security
} from '@mui/icons-material';

interface ReferenceWatermarkProps {
  visible: boolean;
  data: any;
  region: string;
  tenantId: string;
}

interface WatermarkConfig {
  position: 'top' | 'bottom' | 'overlay';
  opacity: number;
  text: string;
  disclaimerRequired: boolean;
  auditRequired: boolean;
}

interface ComplianceWarning {
  level: 'info' | 'warning' | 'error';
  message: string;
  action?: string;
}

const ReferenceWatermark: React.FC<ReferenceWatermarkProps> = ({
  visible,
  data,
  region,
  tenantId
}) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showDataSource, setShowDataSource] = useState(false);
  const [warnings, setWarnings] = useState<ComplianceWarning[]>([]);
  
  const watermarkConfig: WatermarkConfig = {
    position: 'top',
    opacity: 0.8,
    text: 'REFERENCE ONLY - NOT FOR EMPLOYMENT DECISIONS',
    disclaimerRequired: true,
    auditRequired: true
  };

  useEffect(() => {
    // Generate compliance warnings based on data and region
    generateComplianceWarnings();
    
    // Log watermark display for audit
    if (visible && data) {
      logWatermarkDisplay();
    }
  }, [visible, data, region]);

  const generateComplianceWarnings = () => {
    const newWarnings: ComplianceWarning[] = [];

    // Check for bias risks
    if (data?.mbti_type) {
      newWarnings.push({
        level: 'warning',
        message: 'MBTI assessments may contain cultural and gender biases',
        action: 'Review with diversity considerations'
      });
    }

    if (data?.disc_style) {
      newWarnings.push({
        level: 'warning', 
        message: 'DISC profiles should not determine job suitability',
        action: 'Use only for team dynamics reference'
      });
    }

    if (data?.numerology_score) {
      newWarnings.push({
        level: 'error',
        message: 'Numerology has no scientific basis for employment',
        action: 'Consider removing from consideration'
      });
    }

    // Regional compliance warnings
    if (region === 'VN') {
      newWarnings.push({
        level: 'info',
        message: 'Vietnam labor law prohibits discrimination based on personality traits',
        action: 'Ensure compliance with Decree 152/2020/ND-CP'
      });
    }

    setWarnings(newWarnings);
  };

  const logWatermarkDisplay = async () => {
    try {
      // In real implementation, log to compliance audit service
      console.log('Watermark displayed:', {
        tenantId,
        userId: 'current_user',
        timestamp: new Date().toISOString(),
        dataTypes: Object.keys(data || {}),
        region,
        action: 'reference_data_displayed'
      });
    } catch (error) {
      console.error('Failed to log watermark display:', error);
    }
  };

  const handleExportWithWatermark = () => {
    // Create export with embedded watermarks and disclaimers
    const exportData = {
      ...data,
      _compliance: {
        watermark: watermarkConfig.text,
        disclaimer: 'This data is for reference only and contains potential biases',
        exportedAt: new Date().toISOString(),
        region,
        warnings: warnings.map(w => w.message)
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reference-data-${tenantId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!visible) {
    return null;
  }

  return (
    <Box>
      {/* Main Watermark Banner */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 2, 
          mb: 2, 
          background: 'linear-gradient(45deg, #ff9800, #f57c00)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Warning />
            <Typography variant="h6" fontWeight="bold">
              {watermarkConfig.text}
            </Typography>
          </Box>
          <Chip 
            label={`Region: ${region}`} 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </Box>
        
        {/* Diagonal watermark overlay */}
        <Typography
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.1)',
            pointerEvents: 'none',
            zIndex: 0,
            whiteSpace: 'nowrap'
          }}
        >
          REFERENCE ONLY
        </Typography>
      </Paper>

      {/* Compliance Warnings */}
      {warnings.length > 0 && (
        <Box mb={2}>
          {warnings.map((warning, index) => (
            <Alert 
              key={index}
              severity={warning.level}
              sx={{ mb: 1 }}
              action={
                warning.action && (
                  <Button size="small" color="inherit">
                    {warning.action}
                  </Button>
                )
              }
            >
              {warning.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Data Display with Overlay Watermarks */}
      <Grid container spacing={2}>
        {data && Object.entries(data).map(([key, value]) => (
          <Grid item xs={12} md={6} key={key}>
            <Paper 
              sx={{ 
                p: 2, 
                position: 'relative',
                '&::before': {
                  content: '"REFERENCE"',
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  fontSize: '0.8rem',
                  color: 'rgba(0,0,0,0.3)',
                  fontWeight: 'bold',
                  transform: 'rotate(45deg)',
                  transformOrigin: 'center',
                  pointerEvents: 'none'
                }
              }}
            >
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {key.replace(/_/g, ' ').toUpperCase()}
              </Typography>
              <Typography variant="body1">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Box display="flex" gap={2} mt={3}>
        <Button
          variant="outlined"
          startIcon={<Info />}
          onClick={() => setShowDisclaimer(true)}
        >
          View Full Disclaimer
        </Button>
        <Button
          variant="outlined"
          startIcon={<Visibility />}
          onClick={() => setShowDataSource(true)}
        >
          Data Sources
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExportWithWatermark}
          sx={{ bgcolor: '#ff9800' }}
        >
          Export with Watermark
        </Button>
      </Box>

      {/* Full Disclaimer Dialog */}
      <Dialog 
        open={showDisclaimer} 
        onClose={() => setShowDisclaimer(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Security />
            Legal Disclaimer & Compliance Notice
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Bias & Limitations Warning</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                <strong>CRITICAL:</strong> Personality assessments contain inherent biases and should 
                never be used as the primary or sole basis for employment decisions.
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Warning color="warning" /></ListItemIcon>
                  <ListItemText primary="Cultural bias: Assessments may favor certain cultural backgrounds" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Warning color="warning" /></ListItemIcon>
                  <ListItemText primary="Gender bias: Results may reflect societal gender stereotypes" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Warning color="warning" /></ListItemIcon>
                  <ListItemText primary="Socioeconomic bias: May correlate with privilege rather than ability" />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Legal Compliance</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                Use of this data must comply with all applicable employment laws:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Vietnam: Decree 152/2020/ND-CP prohibits personality-based discrimination" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="EU: GDPR requires explicit consent and data minimization" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="US: ADA and Title VII prohibit discriminatory hiring practices" />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Recommended Usage</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                Appropriate uses for reference data:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                  <ListItemText primary="Team building and communication style awareness" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                  <ListItemText primary="Professional development planning" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                  <ListItemText primary="Workplace training and coaching" />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisclaimer(false)}>
            I Understand
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Sources Dialog */}
      <Dialog 
        open={showDataSource} 
        onClose={() => setShowDataSource(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Data Sources & Methodology</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Assessment Sources:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="MBTI Assessment"
                secondary="Based on Jung's psychological types (1921) - Limited scientific validation"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="DISC Profile"
                secondary="Behavioral assessment tool - Industry standard with cultural limitations"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Numerology Analysis"
                secondary="Pythagorean system - NO scientific basis, entertainment only"
              />
            </ListItem>
          </List>
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            These tools have varying degrees of scientific validity and should be 
            interpreted with extreme caution in professional contexts.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDataSource(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReferenceWatermark;