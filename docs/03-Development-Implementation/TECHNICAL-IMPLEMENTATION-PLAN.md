---
SDLC_VERSION: "4.7.0"
DOCUMENT_TYPE: "Technical"
COMPONENT: "HR-Platform"
STATUS: "ACTIVE"
AUTHORITY: "CTO Approved"
LAST_UPDATED: "2025-10-11"
---

# Technical Implementation Plan - HR Profiling Platform
**Framework**: SDLC 4.7 Compliant

# TECHNICAL IMPLEMENTATION PLAN - CPO COMPLIANCE FRAMEWORK

## 🎯 Executive Response to CPO Recommendations

**FULL ACCEPTANCE** của CPO framework với timeline 90 ngày và technical implementation chi tiết như sau:

---

## 📊 IMPACT ASSESSMENT

### Current Codebase Analysis
- **Total LOC**: ~15,000 lines (Backend: 8,000 | Frontend: 7,000)
- **Affected Components**: 75% cần modification, 25% rebuild hoàn toàn
- **Reusable Assets**: 85% assessment logic, 90% UI components
- **Migration Effort**: ~6-8 weeks with 3 developers

### Risk-Benefit Analysis
| Risk Factor | Impact | Mitigation | Timeline |
|-------------|--------|------------|----------|
| Legal Non-compliance | HIGH | Schema Guards + Regional Toggles | Week 1-2 |
| Data Leakage | HIGH | Reference Store Separation | Week 1 |
| User Confusion | MEDIUM | Watermarks + Training | Week 3-4 |
| Technical Debt | LOW | Refactor vs Rebuild | Week 5-6 |

---

## 🏗️ TECHNICAL ARCHITECTURE CHANGES

### 1. Database Schema Refactoring

**Current Schema** → **New Compliance Schema**

```sql
-- OLD: Mixed assessment data
CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  user_id UUID,
  assessment_type VARCHAR(50), -- 'mbti', 'disc', 'numerology'
  results JSONB,
  scores JSONB,
  created_at TIMESTAMP
);

-- NEW: Separated with compliance flags
CREATE TABLE decision_assessments (
  id UUID PRIMARY KEY,
  user_id UUID,
  assessment_type VARCHAR(50), -- 'skills', 'work_sample', 'interview'
  results JSONB,
  job_relevance_score INTEGER,
  validity_coefficient DECIMAL,
  used_for_decision BOOLEAN DEFAULT TRUE,
  audit_trail JSONB,
  created_at TIMESTAMP
);

CREATE TABLE reference_assessments (
  id UUID PRIMARY KEY,
  user_id UUID,
  assessment_type VARCHAR(50), -- 'mbti', 'disc', 'numerology'
  results JSONB,
  reference_only BOOLEAN DEFAULT TRUE,
  consent_given BOOLEAN,
  consent_timestamp TIMESTAMP,
  watermark_shown BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  
  -- Compliance constraints
  CONSTRAINT no_decision_use CHECK (reference_only = TRUE),
  CONSTRAINT consent_required CHECK (consent_given = TRUE)
);

-- Schema Guards - Prevent accidental joins
CREATE POLICY reference_isolation ON reference_assessments
  FOR ALL TO decision_engine_role
  USING (FALSE); -- Completely block access

-- Audit table for compliance tracking
CREATE TABLE compliance_audit (
  id UUID PRIMARY KEY,
  action VARCHAR(100),
  user_id UUID,
  data_accessed TEXT[],
  decision_rationale TEXT,
  human_override BOOLEAN,
  region VARCHAR(10),
  created_at TIMESTAMP
);
```

### 2. Service Layer Separation

**File Structure Changes:**
```
backend/src/
├── services/
│   ├── decision/           # ✅ Job-relevant only
│   │   ├── skillsService.ts
│   │   ├── workSampleService.ts
│   │   ├── interviewService.ts
│   │   └── decisionEngine.ts
│   ├── reference/          # 🚫 Reference-only
│   │   ├── mbtiService.ts
│   │   ├── discService.ts
│   │   └── numerologyService.ts
│   └── compliance/         # 🛡️ Compliance layer
│       ├── consentService.ts
│       ├── biasMonitoringService.ts
│       ├── auditService.ts
│       └── regionalToggleService.ts
```

**Decision Engine - Compliance Version:**
```typescript
// backend/src/services/decision/decisionEngine.ts
import { JobRelevantData, JobMatchScore } from '../types/decision';
// ❌ FORBIDDEN: No imports from ../reference/

interface DecisionEngineService {
  calculateJobMatch(candidateId: string, jobId: string): Promise<JobMatchScore>;
  explainDecision(decisionId: string): Promise<DecisionExplanation>;
  requiresHumanReview(score: JobMatchScore): boolean;
}

export class ComplianceDecisionEngine implements DecisionEngineService {
  async calculateJobMatch(candidateId: string, jobId: string): Promise<JobMatchScore> {
    // ✅ ONLY use job-relevant data
    const skills = await this.skillsService.analyzeSkills(candidateId);
    const workSample = await this.workSampleService.getScore(candidateId, jobId);
    const interview = await this.interviewService.getStructuredScore(candidateId);
    
    // ❌ NEVER access: mbtiService, discService, numerologyService
    
    const score = this.weightedScore({
      skills: skills.score * 0.4,        // 40%
      workSample: workSample.score * 0.35, // 35%  
      interview: interview.score * 0.25     // 25%
    });
    
    // Audit every decision
    await this.auditService.logDecision({
      candidateId,
      jobId,
      score,
      features: { skills, workSample, interview },
      humanReviewRequired: this.requiresHumanReview(score)
    });
    
    return score;
  }
}
```

### 3. Reference Service Isolation

```typescript
// backend/src/services/reference/referenceService.ts
interface ReferenceService {
  getMBTIInsights(candidateId: string): Promise<MBTIResult & ReferenceMetadata>;
  getDISCInsights(candidateId: string): Promise<DISCResult & ReferenceMetadata>;
  getNumerologyInsights(candidateId: string): Promise<NumerologyResult & ReferenceMetadata>;
}

interface ReferenceMetadata {
  reference_only: true;
  watermark: string;
  disclaimer: string;
  consent_required: boolean;
  never_export_to_scoring: true;
}

export class IsolatedReferenceService implements ReferenceService {
  async getMBTIInsights(candidateId: string): Promise<MBTIResult & ReferenceMetadata> {
    // Check consent first
    const hasConsent = await this.consentService.hasConsent(
      candidateId, 
      ConsentPurpose.REFERENCE_INSIGHTS
    );
    
    if (!hasConsent) {
      throw new Error('Consent required for Reference insights');
    }
    
    const result = await this.mbtiService.getResult(candidateId);
    
    return {
      ...result,
      reference_only: true,
      watermark: "THAM KHẢO - KHÔNG DÙNG CHO QUYẾT ĐỊNH TUYỂN DỤNG",
      disclaimer: "Chỉ phục vụ mục đích đối thoại phát triển cá nhân",
      consent_required: true,
      never_export_to_scoring: true
    };
  }
}
```

---

## 🎨 FRONTEND COMPLIANCE REFACTOR

### 1. New Tab Structure

```tsx
// frontend/src/components/ComplianceDashboard.tsx
import React from 'react';
import { Tabs, Tab, Box, Alert } from '@mui/material';
import DecisionTab from './DecisionTab';
import ReferenceTab from './ReferenceTab';

export default function ComplianceDashboard() {
  const [tabValue, setTabValue] = useState(0);
  
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Quyết định tuyển dụng chỉ dựa trên Tab "Đánh giá Công việc". 
        Tab "Insights (Tham khảo)" không ảnh hưởng đến kết quả.
      </Alert>
      
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
        <Tab label="📋 Đánh giá Công việc" />
        <Tab label="💡 Insights (Tham khảo)" />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        <DecisionTab /> {/* ✅ Skills, Work Sample, Interview */}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <ReferenceTab /> {/* 🚫 MBTI, DISC, Numerology with watermarks */}
      </TabPanel>
    </Box>
  );
}
```

### 2. Watermark Component

```tsx
// frontend/src/components/compliance/Watermark.tsx
interface WatermarkProps {
  children: React.ReactNode;
  text?: string;
  severity?: 'warning' | 'info';
}

export default function Watermark({ 
  children, 
  text = "THAM KHẢO - KHÔNG DÙNG CHO QUYẾT ĐỊNH TUYỂN DỤNG",
  severity = "warning" 
}: WatermarkProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Persistent watermark overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bgcolor: severity === 'warning' ? 'warning.main' : 'info.main',
          color: 'white',
          px: 2,
          py: 1,
          fontSize: '0.75rem',
          fontWeight: 'bold',
          zIndex: 1000,
          borderRadius: '0 0 0 8px'
        }}
      >
        {text}
      </Box>
      
      {/* Disclaimer banner */}
      <Alert severity={severity} sx={{ mb: 2 }}>
        <strong>Lưu ý:</strong> Nội dung dưới đây chỉ phục vụ tham khảo cho mục đích 
        đối thoại phát triển cá nhân/đội ngũ. Không sử dụng để sàng lọc hay quyết định tuyển dụng.
      </Alert>
      
      {children}
    </Box>
  );
}
```

### 3. Consent Management

```tsx
// frontend/src/components/compliance/ConsentManager.tsx
interface ConsentManagerProps {
  userId: string;
  purpose: ConsentPurpose;
  children: React.ReactNode;
}

export default function ConsentManager({ userId, purpose, children }: ConsentManagerProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkConsent();
  }, [userId, purpose]);
  
  const requestConsent = async () => {
    const granted = await consentService.requestConsent(userId, [purpose]);
    setHasConsent(granted);
  };
  
  if (loading) return <CircularProgress />;
  
  if (!hasConsent) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Psychology sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Cần Đồng Ý Để Xem Insights
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Tôi đồng ý cung cấp dữ liệu tự khai để hiển thị Insights (tham khảo), 
          không dùng cho ra quyết định tuyển dụng. Tôi có thể rút lại đồng ý 
          và yêu cầu xoá bất kỳ lúc nào.
        </Typography>
        <Button variant="contained" onClick={requestConsent}>
          Đồng Ý & Tiếp Tục
        </Button>
      </Paper>
    );
  }
  
  return <>{children}</>;
}
```

---

## 🛡️ COMPLIANCE SERVICES IMPLEMENTATION

### 1. Bias Monitoring Service

```typescript
// backend/src/services/compliance/biasMonitoringService.ts
export class BiasMonitoringService {
  async calculateImpactRatio(
    feature: string, 
    protectedGroup: string, 
    referenceGroup: string,
    timeRange: DateRange
  ): Promise<number> {
    const protectedSelectionRate = await this.getSelectionRate(
      protectedGroup, feature, timeRange
    );
    const referenceSelectionRate = await this.getSelectionRate(
      referenceGroup, feature, timeRange
    );
    
    const impactRatio = protectedSelectionRate / referenceSelectionRate;
    
    // Alert if below 80% rule
    if (impactRatio < 0.8) {
      await this.alertService.sendBiasAlert({
        feature,
        impactRatio,
        severity: 'HIGH',
        requiresAction: true
      });
    }
    
    return impactRatio;
  }
  
  async generateBiasAuditReport(jobId: string): Promise<BiasAuditReport> {
    const features = await this.getDecisionFeatures(jobId);
    const demographics = await this.getDemographicGroups();
    
    const biasMetrics = await Promise.all(
      features.map(feature => 
        demographics.map(group => 
          this.calculateImpactRatio(feature, group.protected, group.reference, 
            { start: subMonths(new Date(), 6), end: new Date() }
          )
        )
      )
    );
    
    return {
      jobId,
      auditDate: new Date(),
      impactRatios: biasMetrics,
      compliant: biasMetrics.every(ratio => ratio >= 0.8),
      recommendations: this.generateRecommendations(biasMetrics)
    };
  }
}
```

### 2. Regional Compliance Service

```typescript
// backend/src/services/compliance/regionalToggleService.ts
export class RegionalToggleService {
  private regionalConfigs: Map<Region, ComplianceConfig> = new Map([
    [Region.EU_GDPR, {
      explicitConsentRequired: true,
      biasAuditMandatory: true,
      dataRetentionDays: 365,
      rightToBeErasure: true,
      auditLogDetail: 'FULL'
    }],
    [Region.US_EEOC, {
      explicitConsentRequired: false,
      biasAuditMandatory: true,
      dataRetentionDays: 2555, // 7 years
      rightToBeErasure: false,
      auditLogDetail: 'DECISION_ONLY'
    }],
    [Region.VIETNAM, {
      explicitConsentRequired: true,
      biasAuditMandatory: false,
      dataRetentionDays: 1095, // 3 years
      rightToBeErasure: true,
      auditLogDetail: 'STANDARD'
    }]
  ]);
  
  getComplianceConfig(region: Region): ComplianceConfig {
    return this.regionalConfigs.get(region) || this.getDefaultConfig();
  }
  
  async enableComplianceFeatures(userId: string, region: Region): Promise<void> {
    const config = this.getComplianceConfig(region);
    
    if (config.explicitConsentRequired) {
      await this.consentService.requireExplicitConsent(userId);
    }
    
    if (config.biasAuditMandatory) {
      await this.biasService.enableContinuousMonitoring(userId);
    }
    
    await this.auditService.setLogLevel(userId, config.auditLogDetail);
  }
}
```

---

## 📅 90-DAY IMPLEMENTATION TIMELINE

### Week 1-2: Data Architecture & Schema Guards
- [ ] Create separated database schemas
- [ ] Implement schema guards and policies
- [ ] Build basic consent service
- [ ] Unit tests for data isolation

### Week 3-4: Compliance Services
- [ ] Bias monitoring service
- [ ] Audit logging service  
- [ ] Regional toggle service
- [ ] Model card generation

### Week 5-6: Frontend Refactoring
- [ ] Tab-based UI separation
- [ ] Watermark and disclaimer components
- [ ] Consent management interface
- [ ] Export compliance (default hide Reference)

### Week 7-8: Testing & Validation
- [ ] Schema guard penetration testing
- [ ] Bias monitoring validation
- [ ] Regional compliance verification
- [ ] End-to-end compliance testing

### Week 9-10: Documentation & Training
- [ ] SOP for hiring managers
- [ ] Technical documentation
- [ ] Legal review and approval
- [ ] Staff training materials

### Week 11-12: Pilot & Rollout
- [ ] Pilot with 2-3 job positions
- [ ] Bias audit validation
- [ ] Performance monitoring
- [ ] Full production rollout

---

## ✅ SUCCESS METRICS

### Technical Compliance KPIs
- **Data Isolation**: 100% schema guard effectiveness (0 leakage incidents)
- **Consent Management**: 100% consent before Reference insights
- **Bias Monitoring**: Impact ratio ≥ 0.8 for all decision features
- **Audit Trail**: 100% decisions logged with human rationale

### Legal Compliance KPIs  
- **Regional Compliance**: 100% adherence to regional requirements
- **Right to Erasure**: Response within regulatory timeframes
- **Transparency**: Clear explanations for 100% of decisions
- **Human-in-Loop**: 100% decisions reviewable by humans

### Business Impact KPIs
- **Hiring Quality**: Maintain/improve job performance correlation
- **Process Efficiency**: Decision time ≤ current baseline
- **User Satisfaction**: ≥ 85% satisfaction with new interface
- **Legal Risk**: 0 compliance incidents

---

## 🚨 RISK MITIGATION MATRIX

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| Schema Guard Bypass | LOW | HIGH | CI/CD tests + penetration testing | Engineering |
| Regional Non-Compliance | MEDIUM | HIGH | Legal review + toggle testing | Legal/Product |
| User Experience Degradation | MEDIUM | MEDIUM | User testing + iterative design | UX/Product |
| Performance Impact | LOW | MEDIUM | Performance monitoring + optimization | Engineering |
| Training Resistance | HIGH | LOW | Change management + clear benefits | HR/Training |

---

## 📞 IMMEDIATE NEXT ACTIONS

1. **CPO Approval** ✅ (This document)
2. **Legal Review** (Week 1) - Schedule with DPO
3. **Architecture Review** (Week 1) - Technical team alignment  
4. **Resource Allocation** (Week 1) - 3 developers + 1 compliance expert
5. **Pilot Planning** (Week 2) - Select 2-3 test job positions

**Team is ready to begin implementation immediately upon CPO approval!** 🚀