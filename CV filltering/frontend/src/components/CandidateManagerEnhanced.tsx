import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import styles from '../styles/CandidateManagerEnhanced.module.css';

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
  missingFields: string[];
  cvMatchScore: number; // 85% weight in final scoring
  numerologyStatus: 'available' | 'missing-data' | 'not-calculated';
  discStatus: 'available' | 'missing' | 'pending';
  warnings: string[];
  uploadedAt: Date;
  canProceedToShortlist: boolean;
}

const REQUIRED_FIELDS = ['name', 'email', 'phone', 'birthDate', 'experience'];

export const CandidateManagerEnhanced: React.FC = () => {
  const [candidates, setCandidates] = useState<CVData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<string | null>(null);

  const simulateCVExtraction = (_file: File): Partial<CVData> => {
    // Simulate CV data extraction with potential missing fields
    const mockData = [
      {
        name: 'Nguyễn Văn An',
        email: 'nguyenvanan@email.com',
        phone: '+84 901 234 567',
        birthDate: '1990-05-15',
        experience: 'Senior Software Engineer với 5 năm kinh nghiệm phát triển web'
      },
      {
        name: 'Trần Thị Bình',
        email: null, // Missing email
        phone: '+84 902 345 678',
        birthDate: null, // Missing birthdate
        experience: 'Marketing Manager với 3 năm kinh nghiệm'
      },
      {
        name: null, // Missing name
        email: 'candidate@email.com',
        phone: null, // Missing phone
        birthDate: '1988-12-20',
        experience: 'Business Analyst với 4 năm kinh nghiệm'
      }
    ];

    return mockData[Math.floor(Math.random() * mockData.length)];
  };

  const validateCVData = (data: Partial<CVData>): { missingFields: string[], warnings: string[] } => {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    REQUIRED_FIELDS.forEach(field => {
      if (!data[field as keyof CVData] || data[field as keyof CVData] === null) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      warnings.push(`Thiếu ${missingFields.length} trường bắt buộc: ${missingFields.join(', ')}`);
    }

    return { missingFields, warnings };
  };

  const calculateNumerologyStatus = (name: string | null | undefined, birthDate: string | null | undefined): CVData['numerologyStatus'] => {
    if (!name || !birthDate) {
      return 'missing-data';
    }
    return 'available';
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    // Simulate CV processing with validation
    setTimeout(() => {
      const extractedData = simulateCVExtraction(file);
      const { missingFields, warnings } = validateCVData(extractedData);
      
      const newCandidate: CVData = {
        id: Date.now().toString(),
        name: extractedData.name || null,
        email: extractedData.email || null,
        phone: extractedData.phone || null,
        birthDate: extractedData.birthDate || null,
        experience: extractedData.experience || null,
        skills: ['React', 'TypeScript', 'Node.js'], // Mock skills
        cvFileName: file.name,
        status: missingFields.length > 0 ? 'error' : 'analyzed',
        missingFields,
        cvMatchScore: Math.floor(Math.random() * 40) + 60, // 60-100 score
        numerologyStatus: calculateNumerologyStatus(extractedData.name, extractedData.birthDate),
        discStatus: 'missing',
        warnings,
        uploadedAt: new Date(),
        canProceedToShortlist: missingFields.length === 0
      };
      
      setCandidates(prev => [newCandidate, ...prev]);
      setIsProcessing(false);

      // Log activity for missing fields
      if (missingFields.length > 0) {
        console.log(`[ACTIVITY LOG] CV ${file.name} - Thiếu ${missingFields.length} trường bắt buộc: ${missingFields.join(', ')}`);
      }
    }, 3000);
  };

  const handleManualInput = (candidateId: string, field: string, value: string) => {
    setCandidates(prev => 
      prev.map(candidate => {
        if (candidate.id === candidateId) {
          const updated = { ...candidate, [field]: value };
          const { missingFields, warnings } = validateCVData(updated);
          
          return {
            ...updated,
            missingFields,
            warnings,
            status: missingFields.length === 0 ? 'analyzed' : 'error',
            numerologyStatus: calculateNumerologyStatus(updated.name, updated.birthDate),
            canProceedToShortlist: missingFields.length === 0
          };
        }
        return candidate;
      })
    );
  };

  const getStatusIcon = (candidate: CVData) => {
    if (candidate.missingFields.length > 0) return '⚠️';
    if (candidate.numerologyStatus === 'missing-data') return '🔢';
    if (candidate.discStatus === 'missing') return '🎭';
    return '✅';
  };

  const getStatusText = (candidate: CVData) => {
    if (candidate.missingFields.length > 0) {
      return `Thiếu ${candidate.missingFields.length} trường bắt buộc`;
    }
    if (candidate.numerologyStatus === 'missing-data') {
      return 'Thiếu dữ liệu Thần số học';
    }
    if (candidate.discStatus === 'missing') {
      return 'Thiếu đánh giá DISC';
    }
    return 'Dữ liệu đầy đủ';
  };

  return (
    <div className={styles.container}>
      {/* Upload Section */}
      <div className={styles.uploadSection}>
        <h3>📄 Upload CV Ứng Viên</h3>
        <FileUpload onFileSelect={handleFileUpload} />
        
        {isProcessing && (
          <div className={styles.processingIndicator}>
            <div className={styles.spinner}></div>
            <p>Đang phân tích CV và trích xuất thông tin...</p>
          </div>
        )}
        
        <div className={styles.uploadInfo}>
          <p><strong>Pipeline trích xuất tự động:</strong></p>
          <ul>
            <li>✅ Họ tên, Email, Số điện thoại</li>
            <li>✅ Ngày sinh, Kinh nghiệm chính</li>
            <li>⚠️ Cảnh báo nếu thiếu trường bắt buộc</li>
            <li>📝 Cho phép nhập tay bổ sung</li>
          </ul>
        </div>
      </div>

      {/* Candidate List */}
      <div className={styles.candidateList}>
        <div className={styles.listHeader}>
          <h3>👥 Danh Sách Ứng Viên ({candidates.length})</h3>
          <div className={styles.legend}>
            <span>⚠️ Thiếu dữ liệu bắt buộc</span>
            <span>🔢 Thiếu dữ liệu Thần số học</span>
            <span>🎭 Thiếu đánh giá DISC</span>
            <span>✅ Đầy đủ</span>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Chưa có ứng viên nào. Hãy upload CV để bắt đầu!</p>
          </div>
        ) : (
          <div className={styles.candidateGrid}>
            {candidates.map((candidate) => (
              <div key={candidate.id} className={styles.candidateCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.candidateInfo}>
                    <h4>{candidate.name || '❓ Thiếu họ tên'}</h4>
                    <p className={styles.fileName}>{candidate.cvFileName}</p>
                  </div>
                  <div className={styles.statusBadge}>
                    {getStatusIcon(candidate)}
                    <span className={styles.statusText}>
                      {getStatusText(candidate)}
                    </span>
                  </div>
                </div>

                {/* Required Fields Checklist */}
                <div className={styles.fieldChecklist}>
                  <h5>📋 Thông tin bắt buộc:</h5>
                  <div className={styles.fieldGrid}>
                    {[
                      { key: 'name', label: 'Họ tên', value: candidate.name },
                      { key: 'email', label: 'Email', value: candidate.email },
                      { key: 'phone', label: 'Số ĐT', value: candidate.phone },
                      { key: 'birthDate', label: 'Ngày sinh', value: candidate.birthDate },
                      { key: 'experience', label: 'Kinh nghiệm', value: candidate.experience }
                    ].map(({ key, label, value }) => (
                      <div key={key} className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>
                          {value ? '✅' : '❌'} {label}:
                        </span>
                        {editingCandidate === candidate.id ? (
                          <input
                            type={key === 'birthDate' ? 'date' : 'text'}
                            value={value || ''}
                            onChange={(e) => handleManualInput(candidate.id, key, e.target.value)}
                            className={styles.fieldInput}
                            placeholder={`Nhập ${label.toLowerCase()}`}
                          />
                        ) : (
                          <span className={value ? styles.fieldValue : styles.fieldMissing}>
                            {value || `Thiếu ${label.toLowerCase()}`}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CV Match Score */}
                <div className={styles.scoreSection}>
                  <div className={styles.cvScore}>
                    <strong>🎯 CV Matching: {candidate.cvMatchScore}/100</strong>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreProgress} 
                        style={{ width: `${candidate.cvMatchScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className={styles.auxiliaryScores}>
                    <div className={styles.auxScore}>
                      🔢 Thần số học: {candidate.numerologyStatus === 'available' ? 'Có' : 'Thiếu dữ liệu'}
                    </div>
                    <div className={styles.auxScore}>
                      🎭 DISC: {candidate.discStatus === 'available' ? 'Có' : 'Chưa có'}
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {candidate.warnings.length > 0 && (
                  <div className={styles.warningBox}>
                    {candidate.warnings.map((warning, index) => (
                      <p key={index} className={styles.warning}>⚠️ {warning}</p>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className={styles.cardActions}>
                  <button 
                    onClick={() => setEditingCandidate(
                      editingCandidate === candidate.id ? null : candidate.id
                    )}
                    className={styles.editButton}
                  >
                    {editingCandidate === candidate.id ? '💾 Lưu' : '✏️ Sửa'}
                  </button>
                  
                  <button 
                    className={`${styles.shortlistButton} ${
                      candidate.canProceedToShortlist ? styles.enabled : styles.disabled
                    }`}
                    disabled={!candidate.canProceedToShortlist}
                  >
                    {candidate.canProceedToShortlist ? '📋 Thêm vào Shortlist' : '🚫 Chưa đủ dữ liệu'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};