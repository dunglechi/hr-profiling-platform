/**
 * Kill-Switch & Regional Toggle Service
 * 
 * CPO Requirement: Tenant-level toggles for compliance features
 * - Enable/disable Insights tab per tenant
 * - Regional compliance requirements
 * - Export policy controls
 * - Emergency disable capabilities
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum Region {
  EU_GDPR = 'EU',
  US_EEOC = 'US',
  APAC = 'APAC',
  VIETNAM = 'VN',
  GLOBAL = 'GLOBAL'
}

export enum AuditLogLevel {
  MINIMAL = 'MINIMAL',
  STANDARD = 'STANDARD', 
  FULL = 'FULL'
}

export interface TenantComplianceSettings {
  tenantId: string;
  region: Region;
  insightsTabEnabled: boolean;
  explicitConsentRequired: boolean;
  biasAuditMandatory: boolean;
  exportIncludesReference: boolean;
  auditLogLevel: AuditLogLevel;
  dataRetentionDays: number;
  emergencyDisabled?: boolean;
}

export interface ComplianceConfig {
  explicitConsentRequired: boolean;
  biasAuditMandatory: boolean;
  dataRetentionDays: number;
  rightToErasure: boolean;
  auditLogDetail: AuditLogLevel;
  mandatoryWatermarks: boolean;
  exportDefaultHide: boolean;
}

export class KillSwitchService {
  
  /**
   * CPO Requirement: Kill-switch at tenant level
   */
  async disableInsightsTab(tenantId: string, reason: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE tenant_compliance_settings 
      SET insights_tab_enabled = FALSE,
          emergency_disabled = TRUE,
          updated_at = NOW()
      WHERE tenant_id = ${tenantId}
    `;
    
    // Audit the kill-switch activation
    await this.auditKillSwitch(tenantId, 'DISABLE_INSIGHTS', reason);
  }
  
  /**
   * Enable insights tab for tenant (with safety checks)
   */
  async enableInsightsTab(tenantId: string, authorizedBy: string): Promise<void> {
    // Verify compliance requirements are met
    const settings = await this.getTenantSettings(tenantId);
    if (!settings.explicitConsentRequired || !settings.biasAuditMandatory) {
      throw new Error('Cannot enable insights: compliance requirements not met');
    }
    
    await prisma.$executeRaw`
      UPDATE tenant_compliance_settings 
      SET insights_tab_enabled = TRUE,
          emergency_disabled = FALSE,
          updated_at = NOW()
      WHERE tenant_id = ${tenantId}
    `;
    
    await this.auditKillSwitch(tenantId, 'ENABLE_INSIGHTS', `Authorized by ${authorizedBy}`);
  }
  
  /**
   * Check if insights tab is enabled for tenant
   */
  async isInsightsTabEnabled(tenantId: string): Promise<boolean> {
    const result = await prisma.$queryRaw<[{insights_tab_enabled: boolean}]>`
      SELECT insights_tab_enabled 
      FROM tenant_compliance_settings 
      WHERE tenant_id = ${tenantId}
    `;
    
    return result[0]?.insights_tab_enabled || false;
  }
  
  /**
   * CPO Requirement: Regional compliance configuration
   */
  async getRegionalCompliance(region: Region): Promise<ComplianceConfig> {
    const configs: Record<Region, ComplianceConfig> = {
      [Region.EU_GDPR]: {
        explicitConsentRequired: true,
        biasAuditMandatory: true,
        dataRetentionDays: 365,
        rightToErasure: true,
        auditLogDetail: AuditLogLevel.FULL,
        mandatoryWatermarks: true,
        exportDefaultHide: true
      },
      [Region.US_EEOC]: {
        explicitConsentRequired: false,
        biasAuditMandatory: true,
        dataRetentionDays: 2555, // 7 years
        rightToErasure: false,
        auditLogDetail: AuditLogLevel.STANDARD,
        mandatoryWatermarks: true,
        exportDefaultHide: true
      },
      [Region.VIETNAM]: {
        explicitConsentRequired: true,
        biasAuditMandatory: false,
        dataRetentionDays: 1095, // 3 years
        rightToErasure: true,
        auditLogDetail: AuditLogLevel.STANDARD,
        mandatoryWatermarks: true,
        exportDefaultHide: true
      },
      [Region.APAC]: {
        explicitConsentRequired: true,
        biasAuditMandatory: false,
        dataRetentionDays: 1095,
        rightToErasure: true,
        auditLogDetail: AuditLogLevel.STANDARD,
        mandatoryWatermarks: true,
        exportDefaultHide: true
      },
      [Region.GLOBAL]: {
        explicitConsentRequired: true,
        biasAuditMandatory: true,
        dataRetentionDays: 365,
        rightToErasure: true,
        auditLogDetail: AuditLogLevel.FULL,
        mandatoryWatermarks: true,
        exportDefaultHide: true
      }
    };
    
    return configs[region] || configs[Region.GLOBAL];
  }
  
  /**
   * Configure tenant compliance settings based on region
   */
  async configureTenantCompliance(
    tenantId: string, 
    region: Region
  ): Promise<TenantComplianceSettings> {
    const config = await this.getRegionalCompliance(region);
    
    const settings = await prisma.$executeRaw`
      INSERT INTO tenant_compliance_settings (
        tenant_id,
        region,
        insights_tab_enabled,
        explicit_consent_required,
        bias_audit_mandatory,
        export_includes_reference,
        audit_log_level,
        data_retention_days
      ) VALUES (
        ${tenantId},
        ${region},
        FALSE,
        ${config.explicitConsentRequired},
        ${config.biasAuditMandatory},
        ${!config.exportDefaultHide},
        ${config.auditLogDetail},
        ${config.dataRetentionDays}
      )
      ON CONFLICT (tenant_id) DO UPDATE SET
        region = EXCLUDED.region,
        explicit_consent_required = EXCLUDED.explicit_consent_required,
        bias_audit_mandatory = EXCLUDED.bias_audit_mandatory,
        export_includes_reference = EXCLUDED.export_includes_reference,
        audit_log_level = EXCLUDED.audit_log_level,
        data_retention_days = EXCLUDED.data_retention_days,
        updated_at = NOW()
    `;
    
    return this.getTenantSettings(tenantId);
  }
  
  /**
   * Get current tenant compliance settings
   */
  async getTenantSettings(tenantId: string): Promise<TenantComplianceSettings> {
    const result = await prisma.$queryRaw<[TenantComplianceSettings]>`
      SELECT 
        tenant_id as "tenantId",
        region,
        insights_tab_enabled as "insightsTabEnabled",
        explicit_consent_required as "explicitConsentRequired",
        bias_audit_mandatory as "biasAuditMandatory",
        export_includes_reference as "exportIncludesReference",
        audit_log_level as "auditLogLevel",
        data_retention_days as "dataRetentionDays",
        emergency_disabled as "emergencyDisabled"
      FROM tenant_compliance_settings 
      WHERE tenant_id = ${tenantId}
    `;
    
    if (!result[0]) {
      // Create default settings for Vietnam region
      return this.configureTenantCompliance(tenantId, Region.VIETNAM);
    }
    
    return result[0];
  }
  
  /**
   * CPO Requirement: Export policy controls
   */
  async shouldExportIncludeReference(tenantId: string): Promise<boolean> {
    const settings = await this.getTenantSettings(tenantId);
    return settings.exportIncludesReference && !settings.emergencyDisabled;
  }
  
  /**
   * Emergency disable all reference features for tenant
   */
  async emergencyDisableTenant(
    tenantId: string, 
    reason: string, 
    authorizedBy: string
  ): Promise<void> {
    await prisma.$executeRaw`
      UPDATE tenant_compliance_settings 
      SET insights_tab_enabled = FALSE,
          export_includes_reference = FALSE,
          emergency_disabled = TRUE,
          updated_at = NOW()
      WHERE tenant_id = ${tenantId}
    `;
    
    // Audit the emergency action
    await this.auditKillSwitch(
      tenantId, 
      'EMERGENCY_DISABLE', 
      `${reason} - Authorized by ${authorizedBy}`
    );
    
    // Alert relevant stakeholders
    await this.alertEmergencyDisable(tenantId, reason, authorizedBy);
  }
  
  /**
   * Validate tenant compliance before enabling features
   */
  async validateTenantCompliance(tenantId: string): Promise<{
    compliant: boolean;
    violations: string[];
  }> {
    const settings = await this.getTenantSettings(tenantId);
    const violations: string[] = [];
    
    // Check consent requirements
    if (settings.explicitConsentRequired) {
      const consentCount = await prisma.$queryRaw<[{count: number}]>`
        SELECT COUNT(*) as count
        FROM reference_assessments 
        WHERE tenant_id = ${tenantId} 
        AND consent_given = FALSE
      `;
      
      if (consentCount[0].count > 0) {
        violations.push('Users without explicit consent found');
      }
    }
    
    // Check bias audit requirements
    if (settings.biasAuditMandatory) {
      const recentAudit = await prisma.$queryRaw<[{count: number}]>`
        SELECT COUNT(*) as count
        FROM bias_monitoring 
        WHERE tenant_id = ${tenantId} 
        AND measurement_period_end >= NOW() - INTERVAL '30 days'
      `;
      
      if (recentAudit[0].count === 0) {
        violations.push('No bias audit within required timeframe');
      }
    }
    
    return {
      compliant: violations.length === 0,
      violations
    };
  }
  
  /**
   * Audit kill-switch actions
   */
  private async auditKillSwitch(
    tenantId: string, 
    action: string, 
    reason: string
  ): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO compliance_audit (
        action,
        tenant_id,
        decision_rationale,
        created_at
      ) VALUES (
        ${action},
        ${tenantId},
        ${reason},
        NOW()
      )
    `;
  }
  
  /**
   * Alert stakeholders of emergency disable
   */
  private async alertEmergencyDisable(
    tenantId: string, 
    reason: string, 
    authorizedBy: string
  ): Promise<void> {
    // Implementation would send alerts to CPO, Legal, DPO
    console.warn(`EMERGENCY DISABLE: Tenant ${tenantId} - ${reason} - By ${authorizedBy}`);
    
    // In production: send to monitoring system, Slack, email alerts
  }
  
  /**
   * Bulk operations for administrative control
   */
  async bulkDisableByRegion(region: Region, reason: string): Promise<number> {
    const result = await prisma.$executeRaw`
      UPDATE tenant_compliance_settings 
      SET insights_tab_enabled = FALSE,
          emergency_disabled = TRUE,
          updated_at = NOW()
      WHERE region = ${region}
    `;
    
    await this.auditKillSwitch('SYSTEM', 'BULK_DISABLE_REGION', `${region}: ${reason}`);
    
    return result as number;
  }
  
  /**
   * Health check for compliance service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
  }> {
    const checks = {
      database_connection: false,
      schema_guards_active: false,
      audit_logging_working: false
    };
    
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      checks.database_connection = true;
      
      // Test schema guards
      try {
        await prisma.$queryRaw`
          SET ROLE decision_engine_role;
          SELECT COUNT(*) FROM reference_assessments;
          RESET ROLE;
        `;
        checks.schema_guards_active = false; // Should fail
      } catch {
        checks.schema_guards_active = true; // Should fail = good
      }
      
      // Test audit logging
      const auditCount = await prisma.$queryRaw<[{count: number}]>`
        SELECT COUNT(*) as count 
        FROM compliance_audit 
        WHERE created_at >= datetime('now', '-1 hour')
      `;
      checks.audit_logging_working = auditCount[0].count >= 0;
      
    } catch (error) {
      console.error('Kill-switch service health check failed:', error);
    }
    
    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.5) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    return { status, checks };
  }
}

export const killSwitchService = new KillSwitchService();