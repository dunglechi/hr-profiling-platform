---
SDLC_VERSION: "4.7.0"
DOCUMENT_TYPE: "Technical"
COMPONENT: "Compliance-Framework"
STATUS: "ACTIVE"
AUTHORITY: "CTO Approved"
LAST_UPDATED: "2025-10-11"
---

# Compliance Architecture - HR Profiling Platform
**Framework**: SDLC 4.7 Compliant

# COMPLIANCE ARCHITECTURE - REFERENCE-ONLY FRAMEWORK

## 🎯 Overview
Implementing CPO recommendations for Reference-Only positioning of personality assessments with Compliance-by-Design architecture.

## 🏗️ Data Architecture

### 1. Data Store Separation
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PII Vault     │    │ Decision Store  │    │ Reference Store │
│ (Encrypted)     │    │ (Job-Relevant)  │    │ (MBTI/DISC/NUM) │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│• Personal Info  │    │• Skills         │    │• Personality    │
│• Contact Data   │    │• Work Samples   │    │• DISC Scores    │
│• Demographics   │    │• Interview      │    │• MBTI Types     │
│• RBAC Access    │    │• Performance    │    │• Numerology     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                               │
                    ┌─────────────────┐
                    │ Decision Engine │
                    │ (Job-Only Data) │
                    └─────────────────┘
```

### 2. Service Layer Architecture
```typescript
// ✅ Allowed - Decision Services
interface JobRelevantService {
  skillsAnalysis(): SkillsScore;
  workSampleEvaluation(): PerformanceScore;
  structuredInterview(): InterviewScore;
  experienceMatching(): ExperienceScore;
}

// 🚫 Isolated - Reference Services  
interface ReferenceOnlyService {
  mbtiAssessment(): MBTIResult & { reference_only: true };
  discAssessment(): DISCResult & { reference_only: true };
  numerologyProfile(): NumerologyResult & { reference_only: true };
}

// 🔒 Never Mix
class DecisionEngine {
  calculateJobMatch(data: JobRelevantData): JobMatchScore {
    // ❌ FORBIDDEN: Cannot access ReferenceOnlyService
    // ✅ ONLY: JobRelevantService data
  }
}
```

## 🛡️ Compliance Features

### 1. Schema Guards
```sql
-- Prevent Reference data from entering Decision queries
CREATE POLICY reference_isolation ON assessments
  FOR SELECT TO decision_engine_role
  USING (assessment_type != 'reference_only');

-- Unit test CI/CD
ASSERT decision_features NOT CONTAINS ['mbti_type', 'disc_quadrant', 'numerology_score']
```

### 2. Consent & Transparency Center
```typescript
interface ConsentService {
  requestConsent(userId: string, purposes: ConsentPurpose[]): Promise<boolean>;
  revokeConsent(userId: string, purpose: ConsentPurpose): Promise<void>;
  getConsentHistory(userId: string): ConsentRecord[];
}

enum ConsentPurpose {
  REFERENCE_INSIGHTS = 'reference_insights',
  TEAM_DEVELOPMENT = 'team_development', 
  PERSONAL_GROWTH = 'personal_growth'
}
```

### 3. Bias Monitoring Dashboard
```typescript
interface BiasMonitoringService {
  calculateImpactRatio(feature: string, period: DateRange): number; // Must be >= 0.8
  generateBiasAuditReport(jobId: string): BiasAuditReport;
  trackSelectionRates(demographics: DemographicGroup[]): SelectionMetrics;
  alertOnBiasThreshold(threshold: number): BiasAlert[];
}
```

### 4. Audit Log & Model Card
```typescript
interface AuditService {
  logDecision(decision: HiringDecision): void;
  trackFeatureUsage(features: DecisionFeature[]): void;
  recordHumanOverride(override: HumanOverride): void;
  generateModelCard(model: DecisionModel): ModelCard;
}

interface ModelCard {
  purpose: string;
  limitations: string[];
  dataSource: string;
  validityMetrics: ValidityScore;
  fairnessMetrics: FairnessScore;
  humanInLoopRequired: boolean;
}
```

## 🌍 Regional Compliance
```typescript
interface RegionalToggleService {
  getComplianceRequirements(region: Region): ComplianceConfig;
  enableAuditLogging(region: Region): boolean;
  requireExplicitConsent(region: Region): boolean;
  mandatoryBiasReporting(region: Region): boolean;
}

enum Region {
  EU_GDPR = 'eu',
  US_EEOC = 'us', 
  APAC = 'apac',
  VIETNAM = 'vn'
}
```

## 🎨 UI/UX Compliance Design

### 1. Reference-Only Tab
```tsx
// ❌ OLD: Mixed in main dashboard
<Dashboard>
  <CandidateScoring mbti={mbtiScore} disc={discScore} />
</Dashboard>

// ✅ NEW: Separated Reference tab
<Dashboard>
  <DecisionTab skills={skills} workSample={workSample} />
  <ReferenceTab disclaimer={REFERENCE_ONLY_DISCLAIMER}>
    <Watermark text="THAM KHẢO - KHÔNG DÙNG CHO QUYẾT ĐỊNH TUYỂN DỤNG">
      <MBTIInsights />
      <DISCInsights />
    </Watermark>
  </ReferenceTab>
</Dashboard>
```

### 2. Watermarks & Disclaimers
```tsx
const REFERENCE_WATERMARK = "THAM KHẢO - KHÔNG DÙNG CHO QUYẾT ĐỊNH TUYỂN DỤNG";

const CONSENT_TEXT = `
Tôi đồng ý cung cấp dữ liệu tự khai để hiển thị Insights (tham khảo), 
không dùng cho ra quyết định tuyển dụng. Tôi có thể rút lại đồng ý 
và yêu cầu xoá bất kỳ lúc nào.
`;
```

## 🔄 Migration Strategy

### Phase 1: Data Separation (Week 1-2)
1. Create Reference Store with `reference_only` flags
2. Implement Schema Guards in database
3. Refactor services to separate Decision vs Reference

### Phase 2: Compliance Features (Week 3-4)  
1. Build Consent & Transparency Center
2. Implement Bias Monitoring Dashboard
3. Add Audit Logging throughout application

### Phase 3: UI Refactor (Week 5-6)
1. Move MBTI/DISC/Numerology to Reference tab
2. Add watermarks and disclaimers
3. Implement regional toggles

### Phase 4: Testing & Validation (Week 7-8)
1. Schema guard testing (no leakage)
2. Bias monitoring validation
3. Regional compliance verification

## ✅ Success Criteria

### Technical Compliance
- [ ] 100% separation of Reference vs Decision data
- [ ] Schema guards prevent data leakage
- [ ] All decisions have human-in-the-loop capability
- [ ] Audit logs track every decision with rationale

### Legal Compliance  
- [ ] Explicit consent before showing Reference insights
- [ ] Regional toggles working for all supported regions
- [ ] Bias monitoring meets 80% rule (impact ratio >= 0.8)
- [ ] Export/reports default hide Reference data

### User Experience
- [ ] Clear watermarks on all Reference content
- [ ] Easy consent management interface
- [ ] Transparent explanation of what's used for decisions
- [ ] Professional disclaimer text throughout

## 🚨 Risk Mitigation

1. **Data Leakage**: Schema guards + CI/CD tests
2. **Legal Non-compliance**: Regional toggles + legal review
3. **User Confusion**: Clear watermarks + training materials
4. **Bias Detection**: Automated monitoring + quarterly reviews

---

*This architecture ensures MBTI/DISC/Numerology remain valuable for personal development while meeting the highest standards of fair and legal hiring practices.*