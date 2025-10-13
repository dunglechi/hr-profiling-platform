/**
 * Consent & Transparency Center
 * 
 * CPO Requirement: Explicit consent before showing Reference insights
 * - Opt-in consent management
 * - Consent history tracking
 * - Right to erasure (GDPR)
 * - Transparency reporting
 */

import { PrismaClient } from '@prisma/client';
import { killSwitchService, Region } from './killSwitchService';

const prisma = new PrismaClient();

export enum ConsentPurpose {
  REFERENCE_INSIGHTS = 'reference_insights',
  TEAM_DEVELOPMENT = 'team_development',
  PERSONAL_GROWTH = 'personal_growth',
  RESEARCH_ANALYTICS = 'research_analytics'
}

export enum ConsentStatus {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED'
}

export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  consentText: string;
  grantedAt?: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  tenantId: string;
  region: Region;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentRequest {
  userId: string;
  purposes: ConsentPurpose[];
  tenantId: string;
  region: Region;
  ipAddress?: string;
  userAgent?: string;
}

export interface TransparencyReport {
  userId: string;
  dataCollected: string[];
  purposesGranted: ConsentPurpose[];
  dataRetentionDays: number;
  lastAccessed: Date;
  canWithdraw: boolean;
  canErase: boolean;
}

export class ConsentService {
  
  /**
   * CPO Requirement: Request explicit consent before showing insights
   */
  async requestConsent(request: ConsentRequest): Promise<{
    success: boolean;
    consentId?: string;
    requiresAction: boolean;
  }> {
    const { userId, purposes, tenantId, region } = request;
    
    // Check if consent already exists and is valid
    const existingConsents = await this.getActiveConsents(userId, tenantId);
    const alreadyGranted = purposes.every(purpose => 
      existingConsents.some(consent => 
        consent.purpose === purpose && consent.status === ConsentStatus.GRANTED
      )
    );
    
    if (alreadyGranted) {
      return {
        success: true,
        requiresAction: false
      };
    }
    
    // Get regional compliance requirements
    const complianceConfig = await killSwitchService.getRegionalCompliance(region);
    
    if (!complianceConfig.explicitConsentRequired) {
      // For regions that don't require explicit consent, auto-grant
      const grantResult = await this.grantConsent(userId, purposes, tenantId, 'AUTO_GRANTED_REGION');
      return {
        success: grantResult.success,
        consentId: grantResult.consentId,
        requiresAction: false
      };
    }
    
    return {
      success: false,
      requiresAction: true
    };
  }
  
  /**
   * Grant consent for specific purposes
   */
  async grantConsent(
    userId: string,
    purposes: ConsentPurpose[],
    tenantId: string,
    consentText: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<{
    success: boolean;
    consentId?: string;
    expiresAt?: Date;
  }> {
    try {
      const tenantSettings = await killSwitchService.getTenantSettings(tenantId);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + tenantSettings.dataRetentionDays);
      
      const consentRecords = await Promise.all(
        purposes.map(async (purpose) => {
          // Withdraw any existing consent for this purpose
          await this.withdrawConsentForPurpose(userId, purpose, tenantId);
          
          // Create new consent record
          const result = await prisma.$executeRaw`
            INSERT INTO consent_records (
              id,
              user_id,
              purpose,
              status,
              consent_text,
              granted_at,
              expires_at,
              tenant_id,
              region,
              ip_address,
              user_agent
            ) VALUES (
              gen_random_uuid(),
              ${userId},
              ${purpose},
              ${ConsentStatus.GRANTED},
              ${consentText},
              NOW(),
              ${expiresAt},
              ${tenantId},
              ${tenantSettings.region},
              ${metadata?.ipAddress || null},
              ${metadata?.userAgent || null}
            )
            RETURNING id
          `;
          
          return result;
        })
      );
      
      // Audit the consent grant
      await this.auditConsentAction(
        userId,
        'CONSENT_GRANTED',
        purposes,
        tenantId,
        `Granted for purposes: ${purposes.join(', ')}`
      );
      
      return {
        success: true,
        consentId: consentRecords[0]?.toString(),
        expiresAt
      };
      
    } catch (error) {
      console.error('Error granting consent:', error);
      return { success: false };
    }
  }
  
  /**
   * Check if user has valid consent for specific purpose
   */
  async hasConsent(
    userId: string,
    purpose: ConsentPurpose,
    tenantId: string
  ): Promise<boolean> {
    const result = await prisma.$queryRaw<[{count: number}]>`
      SELECT COUNT(*) as count
      FROM consent_records
      WHERE user_id = ${userId}
        AND purpose = ${purpose}
        AND tenant_id = ${tenantId}
        AND status = ${ConsentStatus.GRANTED}
        AND (expires_at IS NULL OR expires_at > NOW())
    `;
    
    return result[0].count > 0;
  }
  
  /**
   * Get all active consents for user
   */
  async getActiveConsents(
    userId: string,
    tenantId: string
  ): Promise<ConsentRecord[]> {
    const results = await prisma.$queryRaw<ConsentRecord[]>`
      SELECT 
        id,
        user_id as "userId",
        purpose,
        status,
        consent_text as "consentText",
        granted_at as "grantedAt",
        withdrawn_at as "withdrawnAt",
        expires_at as "expiresAt",
        tenant_id as "tenantId",
        region,
        ip_address as "ipAddress",
        user_agent as "userAgent"
      FROM consent_records
      WHERE user_id = ${userId}
        AND tenant_id = ${tenantId}
        AND status = ${ConsentStatus.GRANTED}
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY granted_at DESC
    `;
    
    return results;
  }
  
  /**
   * CPO Requirement: Withdraw consent (right to withdraw)
   */
  async withdrawConsent(
    userId: string,
    purposes: ConsentPurpose[],
    tenantId: string,
    reason?: string
  ): Promise<{
    success: boolean;
    withdrawnCount: number;
  }> {
    try {
      let withdrawnCount = 0;
      
      for (const purpose of purposes) {
        const result = await prisma.$executeRaw`
          UPDATE consent_records
          SET status = ${ConsentStatus.WITHDRAWN},
              withdrawn_at = NOW()
          WHERE user_id = ${userId}
            AND purpose = ${purpose}
            AND tenant_id = ${tenantId}
            AND status = ${ConsentStatus.GRANTED}
        `;
        
        withdrawnCount += result as number;
      }
      
      // Audit the withdrawal
      await this.auditConsentAction(
        userId,
        'CONSENT_WITHDRAWN',
        purposes,
        tenantId,
        reason || 'User requested withdrawal'
      );
      
      // If Reference insights consent is withdrawn, hide the data immediately
      if (purposes.includes(ConsentPurpose.REFERENCE_INSIGHTS)) {
        await this.hideReferenceData(userId, tenantId);
      }
      
      return {
        success: true,
        withdrawnCount
      };
      
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      return { success: false, withdrawnCount: 0 };
    }
  }
  
  /**
   * Withdraw consent for specific purpose (internal helper)
   */
  private async withdrawConsentForPurpose(
    userId: string,
    purpose: ConsentPurpose,
    tenantId: string
  ): Promise<void> {
    await prisma.$executeRaw`
      UPDATE consent_records
      SET status = ${ConsentStatus.WITHDRAWN},
          withdrawn_at = NOW()
      WHERE user_id = ${userId}
        AND purpose = ${purpose}
        AND tenant_id = ${tenantId}
        AND status = ${ConsentStatus.GRANTED}
    `;
  }
  
  /**
   * CPO Requirement: Right to erasure (GDPR compliance)
   */
  async requestDataErasure(
    userId: string,
    tenantId: string,
    reason: string
  ): Promise<{
    success: boolean;
    erasedDataTypes: string[];
    retentionPeriodOverride?: boolean;
  }> {
    try {
      const tenantSettings = await killSwitchService.getTenantSettings(tenantId);
      const complianceConfig = await killSwitchService.getRegionalCompliance(tenantSettings.region as Region);
      
      if (!complianceConfig.rightToErasure) {
        throw new Error('Data erasure not available in this region');
      }
      
      const erasedDataTypes: string[] = [];
      
      // 1. Erase reference assessments
      const referenceResult = await prisma.$executeRaw`
        DELETE FROM reference_assessments
        WHERE user_id = ${userId} AND tenant_id = ${tenantId}
      `;
      
      if (referenceResult) {
        erasedDataTypes.push('Reference Assessments (MBTI/DISC/Numerology)');
      }
      
      // 2. Withdraw all consents
      await prisma.$executeRaw`
        UPDATE consent_records
        SET status = ${ConsentStatus.WITHDRAWN},
            withdrawn_at = NOW()
        WHERE user_id = ${userId} AND tenant_id = ${tenantId}
      `;
      erasedDataTypes.push('Consent Records');
      
      // 3. Erase PII (keep decision data for legal retention)
      await prisma.$executeRaw`
        UPDATE users
        SET email = 'erased@privacy.local',
            name = 'Data Erased',
            phone = NULL,
            date_of_birth = NULL
        WHERE id = ${userId}
      `;
      erasedDataTypes.push('Personal Information');
      
      // Audit the erasure
      await this.auditConsentAction(
        userId,
        'DATA_ERASED',
        [ConsentPurpose.REFERENCE_INSIGHTS],
        tenantId,
        `Data erasure requested: ${reason}`
      );
      
      return {
        success: true,
        erasedDataTypes
      };
      
    } catch (error) {
      console.error('Error processing data erasure:', error);
      return { success: false, erasedDataTypes: [] };
    }
  }
  
  /**
   * Generate transparency report for user
   */
  async generateTransparencyReport(
    userId: string,
    tenantId: string
  ): Promise<TransparencyReport> {
    const activeConsents = await this.getActiveConsents(userId, tenantId);
    const tenantSettings = await killSwitchService.getTenantSettings(tenantId);
    const complianceConfig = await killSwitchService.getRegionalCompliance(tenantSettings.region as Region);
    
    // Get data collected
    const dataTypes: string[] = [];
    
    const referenceAssessments = await prisma.$queryRaw<[{count: number}]>`
      SELECT COUNT(*) as count
      FROM reference_assessments
      WHERE user_id = ${userId} AND tenant_id = ${tenantId}
    `;
    
    if (referenceAssessments[0].count > 0) {
      dataTypes.push('Personality Assessments (Reference Only)');
    }
    
    const decisionAssessments = await prisma.$queryRaw<[{count: number}]>`
      SELECT COUNT(*) as count
      FROM decision_assessments
      WHERE user_id = ${userId} AND tenant_id = ${tenantId}
    `;
    
    if (decisionAssessments[0].count > 0) {
      dataTypes.push('Job-Relevant Assessments');
    }
    
    // Get last access time
    const lastAccess = await prisma.$queryRaw<[{last_access: Date}]>`
      SELECT MAX(created_at) as last_access
      FROM compliance_audit
      WHERE user_id = ${userId} AND tenant_id = ${tenantId}
    `;
    
    return {
      userId,
      dataCollected: dataTypes,
      purposesGranted: activeConsents.map(c => c.purpose),
      dataRetentionDays: tenantSettings.dataRetentionDays,
      lastAccessed: lastAccess[0]?.last_access || new Date(),
      canWithdraw: true,
      canErase: complianceConfig.rightToErasure
    };
  }
  
  /**
   * Hide reference data immediately when consent is withdrawn
   */
  private async hideReferenceData(userId: string, tenantId: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE reference_assessments
      SET consent_given = FALSE
      WHERE user_id = ${userId} AND tenant_id = ${tenantId}
    `;
  }
  
  /**
   * Audit consent actions for compliance
   */
  private async auditConsentAction(
    userId: string,
    action: string,
    purposes: ConsentPurpose[],
    tenantId: string,
    rationale: string
  ): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO compliance_audit (
        action,
        user_id,
        data_accessed,
        decision_rationale,
        tenant_id
      ) VALUES (
        ${action},
        ${userId},
        ${purposes},
        ${rationale},
        ${tenantId}
      )
    `;
  }
  
  /**
   * Get consent text template by region
   */
  getConsentText(region: Region, purposes: ConsentPurpose[]): string {
    const templates: Record<Region, string> = {
      [Region.EU_GDPR]: `
        Tôi đồng ý cho phép xử lý dữ liệu cá nhân của tôi cho các mục đích sau: ${purposes.join(', ')}.
        
        Tôi hiểu rằng:
        - Dữ liệu này chỉ được sử dụng để tham khảo và phát triển cá nhân
        - Dữ liệu không được sử dụng cho quyết định tuyển dụng
        - Tôi có thể rút lại đồng ý bất kỳ lúc nào
        - Tôi có quyền yêu cầu xóa dữ liệu cá nhân
        - Dữ liệu sẽ được lưu trữ theo quy định GDPR
      `,
      [Region.VIETNAM]: `
        Tôi đồng ý cung cấp dữ liệu để hiển thị Insights (tham khảo) cho mục đích ${purposes.join(', ')}.
        
        Tôi xác nhận rằng:
        - Thông tin này chỉ phục vụ tham khảo và phát triển bản thân
        - Không sử dụng cho quyết định tuyển dụng
        - Tôi có thể rút lại đồng ý và yêu cầu xóa dữ liệu
        - Dữ liệu được bảo mật theo luật Việt Nam
      `,
      [Region.US_EEOC]: `
        I consent to the collection and use of my data for: ${purposes.join(', ')}.
        
        I understand that:
        - This data is for reference and development purposes only
        - This data will not be used for hiring decisions
        - I can withdraw consent at any time
        - Data is protected under applicable US privacy laws
      `,
      [Region.APAC]: `
        I consent to the processing of my personal data for: ${purposes.join(', ')}.
        
        I acknowledge that:
        - This data is for reference and personal development only
        - This data will not influence hiring decisions
        - I can withdraw consent and request data deletion
        - Data is protected according to applicable privacy laws
      `,
      [Region.GLOBAL]: `
        I consent to the processing of my personal data for: ${purposes.join(', ')}.
        
        I acknowledge that:
        - This data is for reference and personal development only
        - This data will not influence hiring decisions
        - I can withdraw consent and request data deletion
        - Data is protected according to applicable privacy laws
      `
    };
    
    return templates[region] || templates[Region.GLOBAL];
  }
  
  /**
   * Cleanup expired consents (automated task)
   */
  async cleanupExpiredConsents(): Promise<number> {
    const result = await prisma.$executeRaw`
      UPDATE consent_records
      SET status = ${ConsentStatus.EXPIRED}
      WHERE expires_at < NOW() 
        AND status = ${ConsentStatus.GRANTED}
    `;
    
    return result as number;
  }
}

// Create consent records table if not exists
export const initConsentTable = async () => {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS consent_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      purpose VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL,
      consent_text TEXT NOT NULL,
      granted_at TIMESTAMP,
      withdrawn_at TIMESTAMP,
      expires_at TIMESTAMP,
      tenant_id UUID NOT NULL,
      region VARCHAR(10),
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_consent_user_purpose ON consent_records(user_id, purpose, tenant_id);
    CREATE INDEX IF NOT EXISTS idx_consent_status ON consent_records(status, expires_at);
  `;
};

export const consentService = new ConsentService();