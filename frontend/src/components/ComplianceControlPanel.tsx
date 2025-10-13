import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Security,
  Warning,
  CheckCircle,
  Cancel,
  Download,
  Delete,
  Info
} from '@mui/icons-material';
import { complianceApi } from '../services/complianceApi';

interface ComplianceControlPanelProps {
  tenantId: string;
  userId: string;
  region: string;
  onComplianceChange?: (isCompliant: boolean) => void;
}

interface ComplianceStatus {
  insightsTabEnabled: boolean;
  hasValidConsent: boolean;
  settings: {
    region: string;
    dataRetentionDays: number;
    requiresExplicitConsent: boolean;
  };
  violations: string[];
}

interface ConsentDetails {
  consentId: string;
  purposes: string[];
  grantedAt: string;
  expiresAt: string;
  version: string;
  canWithdraw: boolean;
}

const ComplianceControlPanel: React.FC<ComplianceControlPanelProps> = ({
  tenantId,
  userId,
  region,
  onComplianceChange
}) => {
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [consentDetails, setConsentDetails] = useState<ConsentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showDataExportDialog, setShowDataExportDialog] = useState(false);
  const [insightsVisible, setInsightsVisible] = useState(false);

  useEffect(() => {
    loadComplianceStatus();
    loadConsentDetails();
  }, [tenantId, userId]);

  useEffect(() => {
    if (status && onComplianceChange) {
      onComplianceChange(status.insightsTabEnabled && status.hasValidConsent);
    }
  }, [status, onComplianceChange]);

  const loadComplianceStatus = async () => {
    try {
      const response = await complianceApi.getKillSwitchStatus(tenantId);
      if (response.success) {
        setStatus({
          insightsTabEnabled: response.insightsTabEnabled,
          hasValidConsent: false, // Will be updated by consent check
          settings: response.settings,
          violations: response.violations || []
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadConsentDetails = async () => {
    try {
      const response = await complianceApi.checkConsent(userId, tenantId, 'reference_insights');
      if (response.success) {
        setStatus(prev => prev ? { ...prev, hasValidConsent: response.hasConsent } : null);
        
        if (response.hasConsent && response.consentDetails) {
          setConsentDetails(response.consentDetails);
        }
      }
    } catch (err: any) {
      console.warn('Consent check failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConsent = async () => {
    try {
      const response = await complianceApi.withdrawConsent(
        userId, 
        tenantId, 
        ['reference_insights'],
        'User requested withdrawal'
      );
      
      if (response.success) {
        setConsentDetails(null);
        setStatus(prev => prev ? { ...prev, hasValidConsent: false } : null);
        setShowWithdrawDialog(false);
        setInsightsVisible(false);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await complianceApi.getTransparencyReport(userId, tenantId);
      if (response.success) {
        // Create and download the report
        const reportData = JSON.stringify(response.report, null, 2);
        const blob = new Blob([reportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transparency-report-${userId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowDataExportDialog(false);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInsightsToggle = (visible: boolean) => {
    setInsightsVisible(visible);
    // In real implementation, this would control whether insights are displayed
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading compliance status...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <Security color={status?.insightsTabEnabled ? 'success' : 'error'} />
              Compliance Status
            </Typography>
            <Chip 
              label={region} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {status && (
            <Box>
              {/* Overall Status */}
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  {status.insightsTabEnabled ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Cancel color="error" />
                  )}
                  <Typography variant="body2">
                    System Status: {status.insightsTabEnabled ? 'Active' : 'Disabled'}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  {status.hasValidConsent ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Warning color="warning" />
                  )}
                  <Typography variant="body2">
                    Consent: {status.hasValidConsent ? 'Valid' : 'Required'}
                  </Typography>
                </Box>
              </Box>

              {/* Violations Alert */}
              {status.violations.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Compliance Violations:</Typography>
                  <List dense>
                    {status.violations.map((violation, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText primary={violation} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}

              {/* Insights Control */}
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={insightsVisible && status.insightsTabEnabled && status.hasValidConsent}
                      onChange={(e) => handleInsightsToggle(e.target.checked)}
                      disabled={!status.insightsTabEnabled || !status.hasValidConsent}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Show Personality Insights
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reference only - not for employment decisions
                      </Typography>
                    </Box>
                  }
                />
                
                {insightsVisible && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Info fontSize="small" />
                      <Typography variant="caption">
                        FOR REFERENCE ONLY - These insights contain potential biases and should 
                        not be used for employment decisions
                      </Typography>
                    </Box>
                  </Alert>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Consent Details */}
              {consentDetails && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Current Consent:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Granted: {new Date(consentDetails.grantedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires: {new Date(consentDetails.expiresAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Purposes: {consentDetails.purposes.join(', ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Version: {consentDetails.version}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Control Actions */}
              <Box display="flex" gap={1} flexWrap="wrap">
                {status.hasValidConsent && (
                  <Button
                    size="small"
                    startIcon={<Cancel />}
                    onClick={() => setShowWithdrawDialog(true)}
                    color="warning"
                  >
                    Withdraw Consent
                  </Button>
                )}

                <Button
                  size="small"
                  startIcon={<Download />}
                  onClick={() => setShowDataExportDialog(true)}
                  variant="outlined"
                >
                  Export My Data
                </Button>
              </Box>

              {/* Regional Settings Info */}
              <Box sx={{ mt: 2, p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Regional Settings:</strong> {status.settings.region} | 
                  Retention: {status.settings.dataRetentionDays} days | 
                  Explicit Consent: {status.settings.requiresExplicitConsent ? 'Required' : 'Not Required'}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Consent Dialog */}
      <Dialog open={showWithdrawDialog} onClose={() => setShowWithdrawDialog(false)}>
        <DialogTitle>Withdraw Consent</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to withdraw your consent for personality insights?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><Cancel color="warning" /></ListItemIcon>
              <ListItemText primary="Hide all personality insights immediately" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Delete color="error" /></ListItemIcon>
              <ListItemText primary="Schedule deletion of your assessment data" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText primary="Prevent future personality-based processing" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWithdrawDialog(false)}>Cancel</Button>
          <Button onClick={handleWithdrawConsent} color="warning" variant="contained">
            Withdraw Consent
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Export Dialog */}
      <Dialog open={showDataExportDialog} onClose={() => setShowDataExportDialog(false)}>
        <DialogTitle>Export Personal Data</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Download a complete report of your personal data and processing activities.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The report will include:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><Info color="info" /></ListItemIcon>
              <ListItemText primary="Assessment responses and results" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Security color="primary" /></ListItemIcon>
              <ListItemText primary="Consent history and current status" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Download color="action" /></ListItemIcon>
              <ListItemText primary="Data processing activities log" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDataExportDialog(false)}>Cancel</Button>
          <Button onClick={handleDataExport} color="primary" variant="contained">
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ComplianceControlPanel;