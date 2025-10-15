# API → UI Architecture Mapping
## CV Screening Platform Full Stack Integration

### 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React + TS    │◄──►│   Flask + API   │◄──►│   Supabase      │
│   Port: 3000    │    │   Port: 5000    │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📊 **API ENDPOINT MAPPING**

### **1. NUMEROLOGY SERVICE**

#### **Auto Calculation**
```typescript
// Frontend Call
const response = await apiClient.calculateNumerology({
  name: "Nguyễn Văn An",
  birth_date: "1990-05-15", 
  candidate_id: "candidate_123"
});

// Backend Endpoint
POST /api/numerology/calculate
Request: { name, birth_date, candidate_id }
Response: {
  success: boolean,
  status: "available" | "missing-data" | "not-calculated",
  data: NumerologyData,
  warnings: string[]
}
```

#### **Manual Input Fallback**
```typescript
// Frontend Call
const response = await apiClient.manualInputNumerology({
  candidate_id: "candidate_123",
  manual_name: "Corrected Name",
  manual_birth_date: "1990-05-15",
  recruiter_notes: "Manual correction"
});

// Backend Endpoint  
POST /api/numerology/manual-input
Request: { candidate_id, manual_name, manual_birth_date, recruiter_notes }
Response: { success, data: NumerologyData, manual_input_log }
```

---

### **2. DISC EXTERNAL PIPELINE**

#### **CSV File Upload**
```typescript
// Frontend Call
const response = await apiClient.uploadDISCCsv(candidateId, csvFile);

// Backend Endpoint
POST /api/disc/upload-csv
Content-Type: multipart/form-data
Form: { candidate_id, file }
Response: {
  success: boolean,
  data: DISCData,
  source: "csv_upload",
  warnings: string[]
}
```

#### **Manual Score Input**
```typescript
// Frontend Call
const response = await apiClient.manualInputDISC({
  candidate_id: "candidate_123",
  d_score: 75,
  i_score: 65,
  s_score: 55,
  c_score: 80,
  notes: "Assessment completed"
});

// Backend Endpoint
POST /api/disc/manual-input
Request: { candidate_id, d_score, i_score, s_score, c_score, notes }
Response: { success, data: DISCData, source: "manual_input" }
```

#### **Printable Survey Generation**
```typescript
// Frontend Call
const response = await apiClient.generateDISCSurvey();

// Backend Endpoint
GET /api/disc/generate-survey
Response: {
  success: boolean,
  survey_template: SurveyTemplate,
  metadata: { total_questions, estimated_time, ocr_ready }
}
```

#### **OCR Image Processing**
```typescript
// Frontend Call
const response = await apiClient.uploadDISCOcrImage(candidateId, imageFile);

// Backend Endpoint
POST /api/disc/upload-ocr-image
Content-Type: multipart/form-data
Form: { candidate_id, image }
Response: {
  success: boolean,
  data: DISCData,
  ocr_metadata: { confidence, low_confidence_items },
  manual_review_required?: boolean
}
```

---

## 🚨 **VALIDATION & WARNING SYSTEM**

### **Frontend Validation States**
```typescript
interface CVData {
  missingFields: string[];           // Real-time validation
  cvMatchScore: number;              // 85% weight 
  numerologyStatus: 'available' | 'missing-data' | 'not-calculated';
  discStatus: 'available' | 'missing' | 'pending';
  warnings: string[];                // User-facing messages
  canProceedToShortlist: boolean;    // Gate keeper
}
```

### **API Response Patterns**
```typescript
// Success Response
{
  success: true,
  data: T,
  warnings?: string[],
  timestamp: string
}

// Error Response
{
  success: false,
  error: string,
  details?: string[],
  status: "missing-data" | "validation-failed" | "server-error"
}
```

---

## 📝 **ACTIVITY LOGGING FLOW**

### **Frontend → Backend Log Chain**
```typescript
// 1. Frontend Action
activityLogger.log({
  type: 'cv_upload',
  candidateId: 'candidate_123',
  message: 'CV uploaded successfully',
  severity: 'info'
});

// 2. Backend API Call
const response = await apiClient.calculateNumerology(data);

// 3. Backend Service Log
logger.info(f"Numerology calculation request - Candidate ID: {candidate_id}");

// 4. Database Activity Record (TODO: Supabase integration)
INSERT INTO activity_logs (timestamp, type, candidate_id, message, severity)
```

---

## 🏆 **SCORING ALGORITHM INTEGRATION**

### **Frontend Scoring Display**
```typescript
interface Candidate {
  cvMatchScore: number;              // 85% weight - từ CV analysis
  discScore?: number;                // 15% weight - từ DISC API
  numerologyInsight?: string;        // Tham khảo - từ Numerology API
  finalScore: number;                // Calculated: (CV * 0.85) + (DISC * 0.15)
  missingData: string[];             // ["DISC Assessment", "Thần số học"]
}
```

### **Score Calculation Logic**
```typescript
const calculateFinalScore = (cvScore: number, discScore?: number): number => {
  if (discScore !== undefined) {
    return Math.round((cvScore * 0.85) + (discScore * 0.15));
  }
  return cvScore; // 100% CV score if DISC not available
};
```

---

## 🔄 **STATE MANAGEMENT FLOW**

### **Candidate Data Flow**
```
1. CV Upload → Extract required fields → Validate → Show warnings
2. Auto Numerology → API call → Update status → Log activity  
3. DISC Input → Multiple methods → Validate scores → Update status
4. Final Scoring → Calculate → Display → Enable shortlist
5. Recruiter Notes → Mandatory → Save → Activity log
```

### **UI State Updates**
```typescript
// Real-time validation warnings
if (candidate.missingFields.length > 0) {
  showWarning(`Thiếu ${candidate.missingFields.length} trường bắt buộc`);
  disableShortlist();
}

// Auto numerology trigger
if (candidate.name && candidate.birthDate) {
  triggerNumerologyCalculation();
} else {
  showNumerologyManualInput();
}

// DISC status indicators
if (candidate.discStatus === 'missing') {
  showDISCInputOptions(); // CSV, Manual, OCR
}
```

---

## 🌐 **CROSS-ORIGIN & CORS**

### **Development Setup**
```python
# Backend CORS Configuration
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])

# Frontend API Base URL
const API_BASE_URL = 'http://localhost:5000/api';
```

### **Production Considerations**
```python
# Production CORS (TODO)
CORS(app, origins=['https://cv-screening.domain.com'])
```

---

## 🧪 **TESTING ENDPOINTS**

### **Health Check Chain**
```typescript
// Frontend Health Check
const isConnected = await isBackendConnected();

// Backend Health Endpoint
GET /health
Response: {
  status: "healthy",
  services: {
    numerology: "operational",
    disc_pipeline: "operational", 
    database: "connected"
  }
}
```

### **Service Test Endpoints**
```bash
# Numerology Service Test
GET /api/numerology/test

# DISC Pipeline Test  
GET /api/disc/test

# API Documentation
GET /api
```

---

## 📋 **ERROR HANDLING MATRIX**

| Scenario | Frontend Behavior | Backend Response | User Action |
|----------|-------------------|------------------|-------------|
| Missing CV fields | Show warning badges | 422 Validation Error | Manual input form |
| Numerology calc fails | Disable auto, show manual | 422 Missing Data | Manual name/date input |
| DISC file invalid | Show upload error | 400 Bad Request | Re-upload or manual input |
| OCR low confidence | Show review needed | 200 with warnings | Manual review/correction |
| Network error | Show connection error | N/A | Retry or manual fallback |

---

## 🚀 **DEPLOYMENT READINESS**

### ✅ **COMPLETED INTEGRATIONS**
- [x] Frontend API Client (`src/services/api.ts`)
- [x] Backend Flask App (`backend/src/app.py`)
- [x] Numerology Service + API (`routes/numerology_routes.py`)
- [x] DISC Pipeline + API (`routes/disc_routes.py`)
- [x] CORS Configuration
- [x] Error Handling
- [x] Activity Logging
- [x] Build Validation (Frontend + Backend)

### 🚧 **TODO FOR PRODUCTION**
- [ ] Supabase database integration
- [ ] Authentication & authorization
- [ ] File upload security validation
- [ ] Rate limiting
- [ ] API documentation (Swagger)
- [ ] Production CORS configuration
- [ ] Environment configuration
- [ ] Docker containerization

---

## 🎯 **CTO DEMO ENDPOINTS**

**Backend Running:** http://localhost:5000
**Frontend Running:** http://localhost:3000  
**Health Check:** http://localhost:5000/health
**API Docs:** http://localhost:5000/api

**Demo Flow:**
1. Upload CV → Auto validation warnings
2. Manual input missing fields
3. Auto numerology calculation  
4. DISC manual input/CSV upload
5. Final scoring & shortlist
6. Activity log review