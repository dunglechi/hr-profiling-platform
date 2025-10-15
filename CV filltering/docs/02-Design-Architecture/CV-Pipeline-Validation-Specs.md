# Pipeline CV với Validation Bắt Buộc - Đặc Tả Kỹ Thuật

## 🎯 **OVERVIEW - QUY TRÌNH MỚI**

### **NGUYÊN TẮC CHÍNH**
- **CV Matching = 85%** - Tiêu chí quyết định
- **DISC Assessment = 15%** - Yếu tố phụ trợ (không bắt buộc)
- **Thần số học = Tham khảo** - Insight bổ sung (không bắt buộc)

---

## 📋 **CV PIPELINE - TRÍCH XUẤT BẮT BUỘC**

### **Required Fields (Bắt buộc)**
1. **Họ tên** (`name`) - String
2. **Email** (`email`) - String với validation
3. **Số điện thoại** (`phone`) - String với format validation
4. **Ngày sinh** (`birthDate`) - Date cho tính Thần số học
5. **Kinh nghiệm chính** (`experience`) - Text summary

### **Validation Logic**
```typescript
interface CVData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  experience: string | null;
  skills: string[];
  cvFileName: string;
  status: 'pending' | 'processing' | 'analyzed' | 'error';
  missingFields: string[];           // Array of missing required fields
  cvMatchScore: number;              // 85% weight in final scoring
  numerologyStatus: 'available' | 'missing-data' | 'not-calculated';
  discStatus: 'available' | 'missing' | 'pending';
  warnings: string[];                // User-facing warning messages
  uploadedAt: Date;
  canProceedToShortlist: boolean;    // True if all required fields present
}
```

### **Warning System**
- ⚠️ **Thiếu trường bắt buộc**: Hiển thị ngay trên candidate card
- 📝 **Activity Log**: Ghi lại mọi cảnh báo với timestamp
- ✏️ **Manual Input**: Cho phép recruiter nhập tay bổ sung

---

## 🔢 **THẦN SỐ HỌC - AUTO CALCULATION**

### **Logic**
```typescript
const calculateNumerologyStatus = (name: string | null, birthDate: string | null): NumerologyStatus => {
  if (!name || !birthDate) {
    return 'missing-data';
  }
  // Auto calculate from name + birthDate
  return 'available';
};
```

### **Fallback UI**
- **Thiếu dữ liệu**: "Thiếu dữ liệu – không tính Thần Số Học"
- **Manual Input**: Button "➕ Nhập tay" mở form
- **Status**: Icon 🔢 với tooltip thông tin

---

## 🎭 **DISC ASSESSMENT - EXTERNAL DATA ONLY**

### **Input Sources**
1. **File Upload**: CSV, PDF, Excel
2. **Manual Input**: Form nhập điểm trực tiếp
3. **OCR Processing**: In bảng hỏi → Chụp ảnh → OCR

### **Print Template Feature**
```typescript
interface DISCPrintTemplate {
  generatePrintableForm(): void;     // Tạo form PDF có thể in
  ocrInstructions: string[];         // Hướng dẫn chụp rõ cho OCR
  uploadOCRImage(image: File): void; // Upload ảnh để OCR xử lý
}
```

### **DISC UI Flow**
- **Tab 1**: Upload file (CSV/PDF/Excel)
- **Tab 2**: Manual input form
- **Tab 3**: Print template + OCR upload

---

## 🏆 **SCORING ALGORITHM - 85/15 SPLIT**

### **Final Score Calculation**
```typescript
const calculateFinalScore = (cvScore: number, discScore?: number): number => {
  if (discScore !== undefined) {
    return Math.round((cvScore * 0.85) + (discScore * 0.15));
  }
  return cvScore; // 100% CV score if DISC not available
};
```

### **Shortlist Logic**
- **Minimum CV Score**: 70/100 để vào shortlist
- **Missing DISC**: Vẫn có thể shortlist, gắn label "Thiếu dữ liệu phụ trợ"
- **Missing Numerology**: Không ảnh hưởng shortlist, chỉ hiện "Tham khảo"

---

## 🚨 **STATUS INDICATORS**

### **Candidate Card Badges**
- ✅ **Đầy đủ**: Tất cả dữ liệu có sẵn
- ⚠️ **Thiếu dữ liệu bắt buộc**: Blocking shortlist
- 🔢 **Thiếu Thần số học**: Non-blocking
- 🎭 **Thiếu DISC**: Non-blocking nhưng ảnh hưởng điểm

### **Activity Logging**
```typescript
interface ActivityLog {
  timestamp: Date;
  type: 'cv_upload' | 'missing_field' | 'manual_input' | 'disc_update';
  candidateId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}
```

---

## 📊 **UI ENHANCEMENT SUMMARY**

### **Component Updates**
1. **CandidateManagerEnhanced.tsx**
   - Validation pipeline
   - Missing field warnings
   - Manual input forms
   - Status indicators

2. **ShortlistRankingEnhanced.tsx**
   - 85/15 scoring display
   - Missing data labels
   - Recruiter notes (mandatory)
   - Decision reasons

### **New Features**
- **Real-time validation**: Instant feedback on missing fields
- **Progressive enhancement**: App works without DISC/Numerology
- **Security logging**: All activities tracked
- **Mobile responsive**: Works on all devices

---

## 🔧 **TECHNICAL IMPLEMENTATION STATUS**

### ✅ **COMPLETED**
- Enhanced CV pipeline with validation
- 85/15 scoring algorithm
- Status indicator system
- Build validation passing
- TypeScript strict compliance

### 🚧 **IN PROGRESS**
- Auto numerology calculation
- DISC external data pipeline
- OCR integration planning

### 📋 **NEXT PHASE**
- Backend API integration
- Security audit logging
- Performance optimization
- CTO demo preparation

---

## 🎯 **CTO DEMO READINESS**

**URL**: http://localhost:3000

**Key Features to Demo**:
1. CV upload với instant validation warnings
2. Missing field manual input
3. Scoring system 85% CV / 15% DISC
4. Shortlist với "Thiếu dữ liệu phụ trợ" labels
5. Activity logging và recruiter notes

**Build Status**: ✅ PASSING
**Components**: ✅ ALL FUNCTIONAL
**Pipeline**: ✅ VALIDATION READY