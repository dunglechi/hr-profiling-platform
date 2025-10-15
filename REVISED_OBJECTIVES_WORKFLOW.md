# 📋 HR SCREENING TOOL - REVISED OBJECTIVES & WORKFLOW

**Date**: October 15, 2025  
**Revision**: Major Scope Adjustment  
**Prepared for**: CTO Review  
**Status**: PENDING CTO APPROVAL

---

## 🎯 REVISED PROJECT OBJECTIVES

### **Primary Objective**
Phát triển một **công cụ hỗ trợ sàng lọc CV thông minh** để giúp nhà tuyển dụng **lọc ứng viên ban đầu** và **đưa ra khuyến nghị mức độ phù hợp** với các vị trí công việc.

### **Scope Adjustment**
- ❌ **KHÔNG phải**: Nền tảng tuyển dụng đầy đủ (full recruitment platform)
- ✅ **LÀ**: Tool hỗ trợ nhỏ (supporting tool) trong quy trình tuyển dụng hiện có
- ✅ **MỤC ĐÍCH**: Sàng lọc hồ sơ ban đầu → chọn nhóm phỏng vấn vòng tiếp theo

---

## 🏢 BUSINESS CASE (REVISED)

### **Problem Statement**
- **Manual CV Review**: HR phải đọc và phân tích từng CV thủ công (30-60 phút/CV)
- **Inconsistent Screening**: Các HR specialist áp dụng tiêu chí khác nhau
- **Limited Insights**: Thiếu thông tin về tính cách và cultural fit
- **Time Bottleneck**: Quá trình sàng lọc ban đầu tốn quá nhiều thời gian

### **Solution Value**
- **Automated CV Parsing**: Tự động trích xuất thông tin từ CV (multiple formats)
- **Personality Insights**: Thần số học + DISC assessment cho cultural/behavioral fit
- **Standardized Screening**: Consistent evaluation criteria
- **Time Reduction**: Giảm 80% thời gian sàng lọc ban đầu

### **ROI Projection (Revised)**
- **Investment**: Significantly reduced scope → Lower development cost
- **Time Savings**: 4-6 hours/day per HR specialist
- **Efficiency**: Increase daily CV processing capacity by 300%
- **Quality**: Improve screening consistency by 60%

---

## 🔄 REVISED WORKFLOW (3 STEPS)

### **STEP 1: HR MANAGER - JOB SETUP & CV UPLOAD**
**Duration**: 15-30 minutes  
**Performer**: Hiring Manager/HR Specialist

#### Process:
1. **Login to system** với existing credentials
2. **Create job requisition** với basic job description và requirements
3. **Bulk CV upload** - Multiple formats support:
   - PDF files
   - DOC/DOCX documents  
   - Various presentation formats
   - Drag & drop interface
4. **Configure screening criteria** (weights cho các factors)

#### Technical Features:
- ✅ Multi-format CV parsing (PDF, DOC, DOCX)
- ✅ Bulk upload capability
- ✅ Job description templates
- ✅ Screening criteria configuration

---

### **STEP 2: AUTOMATED PROCESSING & CANDIDATE OUTREACH**
**Duration**: 2-5 minutes per CV (Automated)  
**Performer**: AI System

#### Automated CV Analysis:
1. **Parse uploaded CVs** with AI-powered extraction
2. **Extract key information**:
   - Full name (Họ tên)
   - Date of birth (Ngày tháng năm sinh)
   - Contact information (Email, phone)
   - Skills and experience
   - Education background
3. **Generate Numerology Analysis** automatically from birth date
4. **Create candidate profiles** with unique candidate IDs

#### Automated DISC Invitation:
1. **Generate unique assessment links** với candidate ID embedded
2. **Send email invitations** to candidates automatically
3. **Email template includes**:
   - Professional invitation
   - Assessment instructions
   - Estimated time (15-20 minutes)
   - Deadline information
4. **Track invitation status** (sent, opened, completed)

#### Technical Implementation:
```typescript
// CV Processing Pipeline
const cvData = await parseCV(uploadedFile);
const candidateProfile = {
  id: generateUniqueId(),
  name: cvData.extractedName,
  birthDate: cvData.extractedBirthDate,
  skills: cvData.extractedSkills,
  experience: cvData.extractedExperience
};

// Auto-generate Numerology
const numerologyAnalysis = calculateNumerology(candidateProfile.birthDate);

// Send DISC Assessment
const assessmentLink = generateAssessmentLink(candidateProfile.id);
await sendEmailInvitation(candidateProfile.email, assessmentLink);
```

---

### **STEP 3: DUAL-SCENARIO ANALYSIS & RECOMMENDATIONS**
**Duration**: <30 seconds per candidate (Automated)  
**Performer**: AI Analysis Engine

#### Scenario A: Complete Analysis (CV + Numerology + DISC)
**When**: Candidate completed DISC assessment

**Analysis Components**:
1. **CV Skills Match** (40% weight)
   - Technical skills alignment
   - Experience level compatibility
   - Education relevance

2. **DISC Behavioral Fit** (35% weight)
   - Job role compatibility
   - Team dynamics fit
   - Communication style match

3. **Numerology Cultural Fit** (25% weight)
   - Vietnamese cultural alignment
   - Work style preferences
   - Career path compatibility

**Output**: Comprehensive screening score (0-100) với detailed breakdown

#### Scenario B: Limited Analysis (CV + Numerology Only)
**When**: Candidate has not completed DISC assessment (yet)

**Analysis Components**:
1. **CV Skills Match** (70% weight)
   - Enhanced focus on technical qualifications
   - Experience depth analysis
   - Education and certification review

2. **Numerology Cultural Fit** (30% weight)
   - Basic cultural alignment
   - Work style indicators
   - Potential team fit

**Output**: Preliminary screening score (0-100) với "Pending DISC" indicator

---

## 📊 SCREENING OUTPUT & RECOMMENDATIONS

### **Dashboard for HR Managers**

#### **Candidate Ranking Table**
| Rank | Name | CV Score | DISC Score | Numerology | Overall | Status | Action |
|------|------|----------|------------|------------|---------|---------|---------|
| 1 | Nguyễn A | 95% | 88% | 92% | **92%** | Complete | **INTERVIEW** |
| 2 | Trần B | 87% | Pending | 85% | **86%** | Partial | **FOLLOW UP** |
| 3 | Lê C | 82% | 79% | 88% | **83%** | Complete | **CONSIDER** |
| 4 | Phạm D | 75% | Pending | 70% | **73%** | Partial | **WAIT** |

#### **Filtering & Sorting Options**
- **By completion status**: Complete vs Partial analysis
- **By score range**: High (80-100), Medium (60-79), Low (<60)
- **By response time**: DISC completion rate
- **By specific criteria**: Skills, experience, cultural fit

#### **Recommendation Categories**
1. **IMMEDIATE INTERVIEW** (80-100%): Strong candidates for next round
2. **CONSIDER FOR INTERVIEW** (60-79%): Potential candidates pending review
3. **FOLLOW UP REQUIRED** (60%+ but missing DISC): Send reminder for assessment
4. **NOT RECOMMENDED** (<60%): Lower priority candidates

---

## 🎯 TOOL LIMITATIONS & BOUNDARIES

### **What This Tool DOES**
✅ **Initial CV screening** và parsing  
✅ **Basic behavioral assessment** via DISC  
✅ **Cultural fit indicators** via numerology  
✅ **Automated candidate ranking** với scoring  
✅ **Integration-ready** với existing HR systems  

### **What This Tool DOES NOT DO**
❌ **Full recruitment management** (not an ATS replacement)  
❌ **Interview scheduling** (use existing tools)  
❌ **Background checks** (external verification needed)  
❌ **Final hiring decisions** (human review required)  
❌ **Onboarding processes** (HR platform handles this)  

### **Integration Points**
- **Export to existing ATS**: CSV/Excel export của candidate rankings
- **API integration**: RESTful APIs cho data exchange
- **Single Sign-On**: Integration với existing HR systems
- **Workflow handoff**: Seamless transition to existing recruitment tools

---

## 📈 SUCCESS METRICS (REVISED)

### **Efficiency Metrics**
- **CV Processing Time**: From 30-60 min → <5 min per CV (90% reduction)
- **Daily Capacity**: From 8-12 CVs → 50+ CVs per HR specialist (400% increase)
- **Screening Consistency**: 85%+ standardized evaluation criteria
- **Response Rate**: 70%+ DISC completion rate

### **Quality Metrics**
- **Screening Accuracy**: 85%+ correlation với final hiring decisions
- **False Positive Rate**: <15% of recommended candidates fail interviews
- **Cultural Fit Prediction**: 80%+ accuracy trong Vietnamese context
- **Time to First Interview**: 50% reduction trong initial screening phase

### **Business Impact**
- **Cost per Screen**: Reduce from $50-80 → $10-15 per candidate
- **HR Productivity**: 4-6 hours saved per day per specialist
- **Candidate Experience**: Professional, consistent communication
- **Integration Ease**: <2 weeks implementation với existing systems

---

## 🚀 DEPLOYMENT STRATEGY (REVISED)

### **Phase 1: Core Tool (4 weeks)**
- ✅ CV parsing và extraction
- ✅ Numerology calculation
- ✅ DISC assessment integration
- ✅ Basic scoring algorithm

### **Phase 2: Enhancement (2 weeks)**
- ✅ Dashboard và reporting
- ✅ Email automation
- ✅ Export capabilities
- ✅ Basic API endpoints

### **Phase 3: Integration (2 weeks)**
- ✅ Existing system integration
- ✅ SSO implementation
- ✅ Advanced reporting
- ✅ Performance optimization

**Total Development Time**: 8 weeks (significantly reduced)  
**Budget Impact**: 60% cost reduction due to focused scope  
**Integration Timeline**: 2 weeks post-development  

---

## 💡 STRATEGIC ADVANTAGES

### **Market Positioning**
- **Focused Solution**: Specialized screening tool, not generic platform
- **Quick Integration**: Enhances existing HR tech stack
- **Vietnamese Context**: Cultural intelligence built-in
- **Cost Effective**: Lower investment, faster ROI

### **Competitive Differentiation**
- **Multi-format CV Support**: Superior parsing capabilities
- **Cultural Intelligence**: Numerology + Vietnamese context
- **Dual Analysis**: Flexible workflow với/không DISC
- **Integration-First**: Designed to enhance, not replace

### **Technical Excellence**
- **Lightweight Architecture**: Fast deployment, easy maintenance
- **API-First Design**: Future integration capabilities
- **Scalable Processing**: Handle high-volume CV batches
- **Security Compliance**: Data protection và privacy controls

---

## 🎯 CTO REVIEW POINTS

### **Key Decision Points**
1. **Scope Approval**: Confirm revised scope alignment với business needs
2. **Technical Architecture**: Review simplified architecture cho focused tool
3. **Integration Strategy**: Validate compatibility với existing HR systems
4. **Budget Adjustment**: Approve reduced budget allocation
5. **Timeline Approval**: Confirm 8-week development timeline

### **Risk Mitigation**
- **Scope Creep**: Clear boundaries established
- **Integration Challenges**: Early compatibility testing
- **User Adoption**: Focused training on specific use cases
- **ROI Measurement**: Clear metrics for screening efficiency

### **Next Steps**
1. **CTO Approval**: Approve revised objectives và scope
2. **Technical Specification**: Detailed architecture review
3. **Integration Planning**: Compatibility assessment với existing systems
4. **Development Kickoff**: Begin focused development cycle

---

## 📋 CONCLUSION

**HR Screening Tool** được redefine như một **specialized supporting tool** thay vì comprehensive platform, focusing on:

✅ **Initial CV screening** efficiency  
✅ **Behavioral insights** for cultural fit  
✅ **Standardized evaluation** process  
✅ **Seamless integration** với existing HR infrastructure  

Approach này delivers **faster ROI**, **easier deployment**, và **immediate value** trong existing recruitment workflow without disrupting established processes.

**Awaiting CTO approval for revised scope và development approach.**