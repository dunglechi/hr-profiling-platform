# Dpia
**Version**: 4.7.0
**Date**: October 11, 2025
**Status**: ACTIVE
**Project**: HR Profiling & Assessment Platform
**Framework**: SDLC 4.7 Compliant

# DATA PROCESSING IMPACT ASSESSMENT (DPIA)
## HR Profiling Platform - Personality Assessments
### Version 0.1 | December 2024

---

## EXECUTIVE SUMMARY

**Processing Activity:** Personality assessment data collection and analysis for HR profiling
**Risk Level:** HIGH - Special category data with discrimination potential
**Recommendation:** Implement with Reference-Only framework and enhanced safeguards

---

## 1. PROCESSING OVERVIEW

### 1.1 Purpose & Scope
- **Primary Purpose:** Professional development insights (Reference Only)
- **Secondary Purpose:** Team dynamics understanding
- **Prohibited Use:** Employment decision-making, candidate screening
- **Data Types:** MBTI profiles, DISC assessments, numerology calculations
- **Geographic Scope:** Vietnam, EU, US (multi-regional compliance)

### 1.2 Legal Basis
- **Primary:** Explicit consent (GDPR Art. 6(1)(a), Art. 9(2)(a))
- **Fallback:** Legitimate interest for reference insights only
- **Retention:** 24 months maximum, with earlier deletion upon consent withdrawal

---

## 2. NECESSITY & PROPORTIONALITY ASSESSMENT

### 2.1 Necessity Analysis
| Criterion | Assessment | Justification |
|-----------|------------|---------------|
| Purpose Achievement | ⚠️ PARTIAL | Personality insights can aid team dynamics but have limited scientific validity |
| Less Intrusive Alternatives | ❌ NOT EXPLORED | Skills assessments, work samples more relevant for hiring |
| Proportionate Benefits | ⚠️ QUESTIONABLE | Potential team benefits vs. discrimination risks |

### 2.2 Proportionality Safeguards
- ✅ Reference-Only classification prevents hiring use
- ✅ Explicit bias warnings on all outputs
- ✅ Regional toggle system for compliance variations
- ✅ Kill-switch for emergency data access termination

---

## 3. RISK ASSESSMENT MATRIX

### 3.1 Identified Risks

| Risk Category | Impact | Likelihood | Risk Level | Mitigation |
|---------------|--------|------------|------------|------------|
| **Discrimination** | HIGH | MEDIUM | 🔴 HIGH | Reference-Only + bias warnings |
| **Cultural Bias** | HIGH | HIGH | 🔴 HIGH | Regional disclaimers + cultural context |
| **Gender Bias** | MEDIUM | HIGH | 🟡 MEDIUM | Statistical bias detection + warnings |
| **Data Breach** | HIGH | LOW | 🟡 MEDIUM | Encryption + access controls |
| **Consent Coercion** | MEDIUM | MEDIUM | 🟡 MEDIUM | Anonymous withdrawal + clear opt-out |
| **Scientific Misuse** | HIGH | MEDIUM | 🔴 HIGH | Validity warnings + disclaimer |

### 3.2 Specific Risk Details

#### 3.2.1 Discrimination Risk (CRITICAL)
- **Nature:** Personality traits may correlate with protected characteristics
- **Impact:** Potential violation of employment discrimination laws
- **Evidence:** Research shows MBTI bias against neurodivergent individuals
- **Mitigation:** Strict Reference-Only enforcement with technical controls

#### 3.2.2 Cultural Bias Risk (HIGH)
- **Nature:** Western-developed assessments may disadvantage non-Western candidates
- **Impact:** Systematic bias against Vietnamese cultural norms
- **Evidence:** DISC assessment assumes Western communication styles
- **Mitigation:** Regional adaptation + cultural competency warnings

#### 3.2.3 Scientific Validity Risk (HIGH)
- **Nature:** Limited scientific evidence for personality-job performance correlation
- **Impact:** False sense of predictive accuracy in HR decisions
- **Evidence:** Meta-analyses show weak personality-performance correlations
- **Mitigation:** Prominent scientific limitation disclaimers

---

## 4. DATA SUBJECT RIGHTS ANALYSIS

### 4.1 Rights Implementation

| Right | Implementation | Compliance Level |
|-------|----------------|------------------|
| **Information** | Transparent consent flow with detailed purposes | ✅ FULL |
| **Access** | Transparency report generation | ✅ FULL |
| **Rectification** | Assessment retake functionality | ✅ FULL |
| **Erasure** | Automated deletion upon consent withdrawal | ✅ FULL |
| **Portability** | JSON export with metadata | ✅ FULL |
| **Objection** | Granular purpose-based opt-out | ✅ FULL |
| **Automated Decision-Making** | N/A - Reference Only processing | ✅ N/A |

### 4.2 Rights Exercise Mechanisms
- **Self-Service Portal:** Compliance control panel with real-time status
- **Contact Methods:** DPO email, support ticket system
- **Response Time:** 30 days maximum (EU), 7 days for urgent requests
- **Verification:** User authentication + security questions

---

## 5. TECHNICAL & ORGANIZATIONAL MEASURES

### 5.1 Technical Safeguards
- ✅ **Data Separation:** Reference store vs. decision store architecture
- ✅ **Access Controls:** Role-based permissions with audit logging
- ✅ **Encryption:** AES-256 at rest, TLS 1.3 in transit
- ✅ **Kill Switch:** Emergency disable for compliance violations
- ✅ **Schema Guards:** Prevent reference data leakage to decision systems

### 5.2 Organizational Measures
- ✅ **Staff Training:** Bias awareness + legal compliance training
- ✅ **Data Protection Officer:** Designated DPO with independence
- ✅ **Regular Audits:** Quarterly compliance reviews
- ✅ **Incident Response:** 72-hour breach notification procedures
- ✅ **Vendor Management:** Third-party processor agreements

---

## 6. REGIONAL COMPLIANCE ANALYSIS

### 6.1 Vietnam Compliance (Decree 152/2020/ND-CP)
- **Status:** ⚠️ HIGH RISK - Personality-based discrimination prohibited
- **Requirements:**
  - Explicit consent with clear withdrawal mechanism
  - Purpose limitation to non-employment decisions
  - Data minimization and retention limits
- **Mitigations:** Reference-Only classification + local language consent

### 6.2 EU Compliance (GDPR)
- **Status:** ✅ COMPLIANT with enhanced safeguards
- **Requirements:**
  - Article 9 explicit consent for personality data
  - Data Protection Impact Assessment (this document)
  - Data Protection Officer appointment
- **Mitigations:** Full GDPR compliance framework implemented

### 6.3 US Compliance (Various State Laws)
- **Status:** ⚠️ VARIABLE - Depends on state-specific requirements
- **Requirements:**
  - CCPA data rights for California residents
  - ADA compliance for accessibility
  - Title VII non-discrimination requirements
- **Mitigations:** Federal compliance baseline + state-specific adaptations

---

## 7. ALTERNATIVE SOLUTIONS ANALYSIS

### 7.1 Evaluated Alternatives

| Alternative | Pros | Cons | Feasibility |
|-------------|------|------|-------------|
| **Skills-Only Assessment** | Direct job relevance, lower bias risk | Less team insight | ✅ HIGH |
| **Structured Interviews** | Human judgment, cultural adaptation | Subjective, time-intensive | 🟡 MEDIUM |
| **Work Sampling** | Objective performance data | Resource intensive | 🟡 MEDIUM |
| **No Assessment** | Zero bias risk | Limited team insights | ✅ HIGH |

### 7.2 Recommendation
Implement hybrid approach:
1. **Primary:** Skills assessments + work samples for decisions
2. **Secondary:** Reference-Only personality insights for team development
3. **Safeguards:** Strict technical separation + bias warnings

---

## 8. MONITORING & REVIEW FRAMEWORK

### 8.1 Ongoing Monitoring
- **Technical Monitoring:** Automated compliance alerts
- **Usage Analytics:** Reference data access patterns
- **Bias Detection:** Statistical analysis of assessment outcomes
- **Complaint Tracking:** Data subject concerns and resolutions

### 8.2 Review Schedule
- **Quarterly:** Technical compliance review
- **Semi-Annual:** Risk assessment update
- **Annual:** Full DPIA review and update
- **Ad-hoc:** Upon legal/regulatory changes

---

## 9. CONCLUSIONS & RECOMMENDATIONS

### 9.1 Overall Assessment
**RISK LEVEL:** HIGH with effective mitigations
**VIABILITY:** Proceed with Reference-Only framework

### 9.2 Key Recommendations
1. ✅ **Implement Reference-Only architecture** to prevent hiring discrimination
2. ✅ **Deploy comprehensive bias warnings** on all personality outputs
3. ⚠️ **Consider skills-based alternatives** for hiring decisions
4. ✅ **Maintain strict consent management** with granular controls
5. ✅ **Establish regular bias auditing** of assessment outcomes

### 9.3 Go/No-Go Decision Framework
**GO Conditions:**
- Reference-Only technical controls validated
- Regional compliance frameworks active
- Staff bias training completed
- DPO approval obtained

**NO-GO Triggers:**
- Technical separation failures
- Legal prohibition in key markets
- Inability to manage bias risks
- Stakeholder privacy concerns

---

## 10. APPROVAL & SIGN-OFF

**Data Protection Officer:** [Pending signature]
**Legal Counsel:** [Pending review]
**Technical Lead:** [Implementation confirmed]
**CPO Approval:** [Pending T+30 review]

**Document Version:** 0.1
**Review Date:** March 2025
**Next Update:** Upon regulatory changes or risk materialization

---

*This DPIA serves as living documentation and will be updated based on implementation experience and regulatory developments.*