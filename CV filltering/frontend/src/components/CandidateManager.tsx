import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import styles from '../styles/CandidateManager.module.css';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  cvFileName: string;
  status: 'pending' | 'analyzed' | 'shortlisted' | 'rejected';
  cvScore?: number;
  uploadedAt: Date;
}

export const CandidateManager: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    // Simulate CV processing
    setTimeout(() => {
      const newCandidate: Candidate = {
        id: Date.now().toString(),
        name: `Ứng viên ${candidates.length + 1}`,
        email: 'candidate@email.com',
        phone: '+84 901 234 567',
        cvFileName: file.name,
        status: 'analyzed',
        cvScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100
        uploadedAt: new Date()
      };
      
      setCandidates(prev => [newCandidate, ...prev]);
      setIsProcessing(false);
    }, 3000);
  };

  const updateCandidateStatus = (id: string, status: Candidate['status']) => {
    setCandidates(prev => 
      prev.map(c => c.id === id ? { ...c, status } : c)
    );
  };

  const getStatusColor = (status: Candidate['status']) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'analyzed': return '#17a2b8';
      case 'shortlisted': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: Candidate['status']) => {
    switch (status) {
      case 'pending': return 'Đang xử lý';
      case 'analyzed': return 'Đã phân tích';
      case 'shortlisted': return 'Được chọn';
      case 'rejected': return 'Bị loại';
      default: return 'Không xác định';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadSection}>
        <FileUpload 
          onFileSelect={handleFileUpload}
          isProcessing={isProcessing}
        />
        <div className={styles.uploadInfo}>
          <p>💡 Tải lên CV định dạng PDF hoặc DOCX</p>
          <p>📊 Hệ thống sẽ tự động phân tích và chấm điểm</p>
        </div>
      </div>

      <div className={styles.candidateList}>
        <div className={styles.listHeader}>
          <h3>📋 Danh sách ứng viên ({candidates.length})</h3>
        </div>
        
        {candidates.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Chưa có ứng viên nào. Hãy tải lên CV đầu tiên!</p>
          </div>
        ) : (
          <div className={styles.candidates}>
            {candidates.map((candidate) => (
              <div key={candidate.id} className={styles.candidateCard}>
                <div className={styles.candidateInfo}>
                  <h4>{candidate.name}</h4>
                  <p className={styles.contactInfo}>
                    📧 {candidate.email} • 📞 {candidate.phone}
                  </p>
                  <p className={styles.fileName}>📄 {candidate.cvFileName}</p>
                  <p className={styles.uploadTime}>
                    ⏰ {candidate.uploadedAt.toLocaleDateString('vi-VN')}
                  </p>
                </div>
                
                <div className={styles.candidateScore}>
                  {candidate.cvScore && (
                    <div className={styles.scoreDisplay}>
                      <span className={styles.scoreValue}>{candidate.cvScore}</span>
                      <span className={styles.scoreLabel}>điểm CV</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.candidateStatus}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(candidate.status) }}
                  >
                    {getStatusText(candidate.status)}
                  </span>
                </div>
                
                <div className={styles.candidateActions}>
                  <button 
                    onClick={() => updateCandidateStatus(candidate.id, 'shortlisted')}
                    className={`${styles.actionBtn} ${styles.approveBtn}`}
                    disabled={candidate.status === 'shortlisted'}
                  >
                    ✅ Chọn
                  </button>
                  <button 
                    onClick={() => updateCandidateStatus(candidate.id, 'rejected')}
                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
                    disabled={candidate.status === 'rejected'}
                  >
                    ❌ Loại
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