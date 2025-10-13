/**
 * Compliance API Routes
 * 
 * CPO T+30 Requirements:
 * - Kill-switch & Regional toggles
 * - Consent management
 * - Export compliance
 * - Audit logging
 */

import express from 'express';
import { killSwitchService, Region } from '../services/compliance/killSwitchService';
import { consentService, ConsentPurpose } from '../services/compliance/consentService';

const router = express.Router();

// =================== KILL-SWITCH ENDPOINTS ===================

/**
 * CPO Requirement: Tenant-level kill-switch for Insights tab
 */
router.post('/kill-switch/:tenantId/disable', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { reason, authorizedBy } = req.body;
    
    if (!reason || !authorizedBy) {
      return res.status(400).json({
        success: false,
        error: 'Reason and authorizedBy are required'
      });
    }
    
    await killSwitchService.disableInsightsTab(tenantId, `${reason} - Authorized by ${authorizedBy}`);
    
    res.json({
      success: true,
      message: 'Insights tab disabled for tenant',
      tenantId,
      disabledAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Kill-switch disable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable insights tab'
    });
  }
});

/**
 * Enable insights tab with compliance validation
 */
router.post('/kill-switch/:tenantId/enable', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { authorizedBy } = req.body;
    
    if (!authorizedBy) {
      return res.status(400).json({
        success: false,
        error: 'authorizedBy is required'
      });
    }
    
    // Validate compliance before enabling
    const compliance = await killSwitchService.validateTenantCompliance(tenantId);
    if (!compliance.compliant) {
      return res.status(400).json({
        success: false,
        error: 'Cannot enable: compliance violations',
        violations: compliance.violations
      });
    }
    
    await killSwitchService.enableInsightsTab(tenantId, authorizedBy);
    
    res.json({
      success: true,
      message: 'Insights tab enabled for tenant',
      tenantId,
      enabledAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Kill-switch enable error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enable insights tab'
    });
  }
});

/**
 * Check insights tab status
 */
router.get('/kill-switch/:tenantId/status', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const enabled = await killSwitchService.isInsightsTabEnabled(tenantId);
    const settings = await killSwitchService.getTenantSettings(tenantId);
    
    res.json({
      success: true,
      tenantId,
      insightsTabEnabled: enabled,
      settings: {
        region: settings.region,
        explicitConsentRequired: settings.explicitConsentRequired,
        biasAuditMandatory: settings.biasAuditMandatory,
        exportIncludesReference: settings.exportIncludesReference,
        emergencyDisabled: settings.emergencyDisabled
      }
    });
    
  } catch (error) {
    console.error('Kill-switch status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get insights tab status'
    });
  }
});

// =================== REGIONAL TOGGLES ===================

/**
 * CPO Requirement: Configure tenant compliance by region
 */
router.post('/regional-toggles/:tenantId/configure', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { region } = req.body;
    
    if (!Object.values(Region).includes(region)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid region',
        validRegions: Object.values(Region)
      });
    }
    
    const settings = await killSwitchService.configureTenantCompliance(tenantId, region);
    
    res.json({
      success: true,
      message: 'Tenant compliance configured',
      settings
    });
    
  } catch (error) {
    console.error('Regional toggle configuration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to configure regional compliance'
    });
  }
});

/**
 * Get regional compliance requirements
 */
router.get('/regional-toggles/requirements/:region', async (req, res) => {
  try {
    const { region } = req.params;
    
    if (!Object.values(Region).includes(region as Region)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid region',
        validRegions: Object.values(Region)
      });
    }
    
    const requirements = await killSwitchService.getRegionalCompliance(region as Region);
    
    res.json({
      success: true,
      region,
      requirements
    });
    
  } catch (error) {
    console.error('Regional requirements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get regional requirements'
    });
  }
});

// =================== CONSENT MANAGEMENT ===================

/**
 * CPO Requirement: Request explicit consent
 */
router.post('/consent/request', async (req, res) => {
  try {
    const { userId, purposes, tenantId, region, ipAddress, userAgent } = req.body;
    
    if (!userId || !purposes || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'userId, purposes, and tenantId are required'
      });
    }
    
    const result = await consentService.requestConsent({
      userId,
      purposes,
      tenantId,
      region: region || Region.GLOBAL,
      ipAddress,
      userAgent
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Consent request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process consent request'
    });
  }
});

/**
 * Grant consent with explicit text
 */
router.post('/consent/grant', async (req, res) => {
  try {
    const { userId, purposes, tenantId, consentText, ipAddress, userAgent } = req.body;
    
    if (!userId || !purposes || !tenantId || !consentText) {
      return res.status(400).json({
        success: false,
        error: 'userId, purposes, tenantId, and consentText are required'
      });
    }
    
    const result = await consentService.grantConsent(
      userId,
      purposes,
      tenantId,
      consentText,
      { ipAddress, userAgent }
    );
    
    res.json(result);
    
  } catch (error) {
    console.error('Consent grant error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to grant consent'
    });
  }
});

/**
 * Check if user has consent for purpose
 */
router.get('/consent/:userId/:tenantId/check', async (req, res) => {
  try {
    const { userId, tenantId } = req.params;
    const { purpose } = req.query;
    
    if (!purpose || !Object.values(ConsentPurpose).includes(purpose as ConsentPurpose)) {
      return res.status(400).json({
        success: false,
        error: 'Valid purpose parameter is required',
        validPurposes: Object.values(ConsentPurpose)
      });
    }
    
    const hasConsent = await consentService.hasConsent(
      userId,
      purpose as ConsentPurpose,
      tenantId
    );
    
    res.json({
      success: true,
      userId,
      tenantId,
      purpose,
      hasConsent
    });
    
  } catch (error) {
    console.error('Consent check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check consent'
    });
  }
});

/**
 * CPO Requirement: Withdraw consent (right to withdraw)
 */
router.post('/consent/:userId/:tenantId/withdraw', async (req, res) => {
  try {
    const { userId, tenantId } = req.params;
    const { purposes, reason } = req.body;
    
    if (!purposes || !Array.isArray(purposes)) {
      return res.status(400).json({
        success: false,
        error: 'purposes array is required'
      });
    }
    
    const result = await consentService.withdrawConsent(
      userId,
      purposes,
      tenantId,
      reason
    );
    
    res.json({
      success: result.success,
      withdrawnCount: result.withdrawnCount,
      message: `Withdrawn consent for ${result.withdrawnCount} purposes`
    });
    
  } catch (error) {
    console.error('Consent withdrawal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to withdraw consent'
    });
  }
});

/**
 * Get user consent history
 */
router.get('/consent/:userId/:tenantId/history', async (req, res) => {
  try {
    const { userId, tenantId } = req.params;
    
    const consents = await consentService.getActiveConsents(userId, tenantId);
    
    res.json({
      success: true,
      userId,
      tenantId,
      consents
    });
    
  } catch (error) {
    console.error('Consent history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get consent history'
    });
  }
});

// =================== DATA ERASURE ===================

/**
 * CPO Requirement: Right to erasure (GDPR)
 */
router.post('/data-erasure/:userId/:tenantId', async (req, res) => {
  try {
    const { userId, tenantId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Reason for data erasure is required'
      });
    }
    
    const result = await consentService.requestDataErasure(userId, tenantId, reason);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Data erasure completed',
        erasedDataTypes: result.erasedDataTypes,
        userId,
        tenantId,
        erasedAt: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Data erasure failed',
        details: result.erasedDataTypes
      });
    }
    
  } catch (error) {
    console.error('Data erasure error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process data erasure'
    });
  }
});

// =================== TRANSPARENCY REPORTING ===================

/**
 * Generate transparency report for user
 */
router.get('/transparency/:userId/:tenantId', async (req, res) => {
  try {
    const { userId, tenantId } = req.params;
    
    const report = await consentService.generateTransparencyReport(userId, tenantId);
    
    res.json({
      success: true,
      report
    });
    
  } catch (error) {
    console.error('Transparency report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate transparency report'
    });
  }
});

// =================== EXPORT COMPLIANCE ===================

/**
 * CPO Requirement: Check if export should include reference data
 */
router.get('/export/:tenantId/policy', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const includeReference = await killSwitchService.shouldExportIncludeReference(tenantId);
    const settings = await killSwitchService.getTenantSettings(tenantId);
    
    res.json({
      success: true,
      tenantId,
      exportPolicy: {
        includeReference,
        defaultHide: !includeReference,
        watermarkRequired: true,
        disclaimerRequired: true,
        auditRequired: true
      },
      settings: {
        region: settings.region,
        exportIncludesReference: settings.exportIncludesReference,
        emergencyDisabled: settings.emergencyDisabled
      }
    });
    
  } catch (error) {
    console.error('Export policy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get export policy'
    });
  }
});

// =================== HEALTH CHECK ===================

/**
 * Compliance service health check
 */
router.get('/health', async (req, res) => {
  try {
    const health = await killSwitchService.healthCheck();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json({
      service: 'compliance',
      status: health.status,
      checks: health.checks,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Compliance health check error:', error);
    res.status(503).json({
      service: 'compliance',
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;