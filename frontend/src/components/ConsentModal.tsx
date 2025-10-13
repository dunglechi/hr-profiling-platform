import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Link
} from '@mui/material';
import { Shield, Info, Policy, Gavel } from '@mui/icons-material';
import { complianceApi } from '../services/complianceApi';

interface ConsentModalProps {
  open: boolean;
  onClose: () => void;
  onConsentGranted: (consentId: string) => void;
  userId: string;
  tenantId: string;
  purposes: string[];
  region: string;
}

interface ConsentRequirement {
  requiresAction: boolean;
  consentText?: string;
  version?: string;
  purposes: string[];
  legalBasis: string;
  retentionPeriod: string;
  dataTypes: string[];
}

const ConsentModal: React.FC<ConsentModalProps> = ({
  open,
  onClose,
  onConsentGranted,
  userId,
  tenantId,
  purposes,
  region
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentReq, setConsentReq] = useState<ConsentRequirement | null>(null);
  const [acceptedPurposes, setAcceptedPurposes] = useState<string[]>([]);
  const [acknowledgedRisks, setAcknowledgedRisks] = useState(false);
  const [readPrivacyPolicy, setReadPrivacyPolicy] = useState(false);

  // Fetch consent requirements when modal opens
  useEffect(() => {
    if (open && userId && tenantId) {
      fetchConsentRequirements();
    }
  }, [open, userId, tenantId, purposes, region]);

  const fetchConsentRequirements = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await complianceApi.requestConsent({
        userId,
        tenantId,
        purposes,
        region,
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent
      });

      if (response.success) {
        setConsentReq({
          requiresAction: response.requiresAction,
          consentText: response.consentText,
          version: response.version,
          purposes: response.purposes || purposes,
          legalBasis: response.legalBasis || 'Legitimate Interest (Reference Only)',
          retentionPeriod: response.retentionPeriod || '24 months',
          dataTypes: response.dataTypes || ['Assessment Responses', 'Profile Insights']
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch consent requirements');
    } finally {
      setLoading(false);
    }
  };

  const handlePurposeToggle = (purpose: string) => {
    setAcceptedPurposes(prev => 
      prev.includes(purpose) 
        ? prev.filter(p => p !== purpose)
        : [...prev, purpose]
    );
  };

  const handleGrantConsent = async () => {
    if (!consentReq || acceptedPurposes.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await complianceApi.grantConsent({
        userId,
        tenantId,
        purposes: acceptedPurposes,
        consentText: consentReq.consentText!,
        version: consentReq.version!,
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent
      });

      if (response.success) {
        onConsentGranted(response.consentId);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to grant consent');
    } finally {
      setLoading(false);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '127.0.0.1';
    }
  };

  const getPurposeDescription = (purpose: string): string => {
    const descriptions: Record<string, string> = {
      'reference_insights': 'Personality insights for professional development (Reference Only)',
      'job_matching': 'Job matching and recommendation services',
      'analytics': 'Usage analytics and platform improvement',
      'communication': 'Platform notifications and updates'
    };
    return descriptions[purpose] || purpose;
  };

  const isFormValid = () => {
    return acceptedPurposes.length > 0 && 
           acknowledgedRisks && 
           readPrivacyPolicy &&
           !loading;
  };

  if (loading && !consentReq) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading consent requirements...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!consentReq) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderTop: '4px solid #1976d2' }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#f5f5f5', pb: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Shield color="primary" />
          <Typography variant="h6" component="div">
            Data Processing Consent Required
          </Typography>
          <Chip 
            label={`Region: ${region}`} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Legal Basis Information */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Gavel color="warning" fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold">
              Legal Basis: {consentReq.legalBasis}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            This processing is based on your explicit consent. You can withdraw consent at any time.
          </Typography>
        </Box>

        {/* Data Types & Retention */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Data to be Processed:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {consentReq.dataTypes.map(type => (
              <Chip key={type} label={type} size="small" variant="outlined" />
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Retention Period:</strong> {consentReq.retentionPeriod}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Purpose Selection */}
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
          Processing Purposes:
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select the purposes for which you consent to data processing:
        </Typography>

        {consentReq.purposes.map(purpose => (
          <FormControlLabel
            key={purpose}
            control={
              <Checkbox
                checked={acceptedPurposes.includes(purpose)}
                onChange={() => handlePurposeToggle(purpose)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {purpose.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getPurposeDescription(purpose)}
                </Typography>
              </Box>
            }
            sx={{ display: 'block', mb: 1 }}
          />
        ))}

        <Divider sx={{ my: 2 }} />

        {/* Risk Acknowledgment */}
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <Info fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Important Disclaimer
          </Typography>
          <Typography variant="body2">
            Personality assessments are for reference only and should not be used as the sole basis 
            for employment decisions. These insights may contain biases and are not scientifically 
            validated for hiring purposes.
          </Typography>
        </Alert>

        <FormControlLabel
          control={
            <Checkbox
              checked={acknowledgedRisks}
              onChange={(e) => setAcknowledgedRisks(e.target.checked)}
              color="warning"
            />
          }
          label={
            <Typography variant="body2">
              I acknowledge the limitations and potential biases of personality assessments
            </Typography>
          }
          sx={{ mb: 2 }}
        />

        {/* Privacy Policy Acknowledgment */}
        <FormControlLabel
          control={
            <Checkbox
              checked={readPrivacyPolicy}
              onChange={(e) => setReadPrivacyPolicy(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              I have read and agree to the{' '}
              <Link href="/privacy-policy" target="_blank" rel="noopener">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/data-processing" target="_blank" rel="noopener">
                Data Processing Terms
              </Link>
            </Typography>
          }
          sx={{ mb: 2 }}
        />

        {/* Consent Text */}
        {consentReq.consentText && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Legal Consent Text (Version {consentReq.version}):
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {consentReq.consentText}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleGrantConsent}
          variant="contained"
          disabled={!isFormValid()}
          startIcon={loading ? <CircularProgress size={20} /> : <Shield />}
        >
          {loading ? 'Processing...' : 'Grant Consent'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsentModal;