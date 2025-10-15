import React, { useState } from 'react';
import styles from '../styles/ShortlistRankingEnhanced.module.css';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  cvFileName: string;
  cvMatchScore: number; // 85% weight
  discScore?: number; // 15% weight (if available)
  numerologyInsight?: string; // Reference only
  finalScore: number;
  status: 'eligible' | 'shortlisted' | 'rejected' | 'pending-data';
  missingData: string[];
  decisionReason: string;
  recruiterNotes: string;
  uploadedAt: Date;
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    phone: '+84 901 234 567',
    cvFileName: 'NguyenVanAn_CV.pdf',
    cvMatchScore: 92,
    discScore: 85,
    numerologyInsight: 'Số chủ đạo 7 - Thích nghiên cứu, phân tích sâu',
    finalScore: 91, // (92 * 0.85) + (85 * 0.15) = 91
    status: 'shortlisted',
    missingData: [],
    decisionReason: 'Kinh nghiệm vượt trội, kỹ năng phù hợp hoàn hảo',
    recruiterNotes: 'Ứng viên xuất sắc, đáp ứng 95% yêu cầu',
    uploadedAt: new Date('2025-10-15T10:30:00')
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    email: 'tranthib@email.com',
    phone: '+84 902 345 678',
    cvFileName: 'TranThiBinh_CV.pdf',
    cvMatchScore: 78,
    discScore: undefined, // Missing DISC
    numerologyInsight: undefined, // Missing numerology
    finalScore: 78, // Only CV score (78 * 1.0)
    status: 'eligible',
    missingData: ['DISC Assessment', 'Thần số học'],
    decisionReason: 'CV tốt nhưng thiếu dữ liệu phụ trợ',
    recruiterNotes: 'Cần bổ sung đánh giá DISC trước khi shortlist',
    uploadedAt: new Date('2025-10-15T11:15:00')
  },
  {
    id: '3',
    name: 'Lê Văn Cường',
    email: 'levanc@email.com',
    phone: '+84 903 456 789',
    cvFileName: 'LeVanCuong_CV.pdf',
    cvMatchScore: 85,
    discScore: 72,
    numerologyInsight: 'Số chủ đạo 3 - Sáng tạo, giao tiếp tốt',
    finalScore: 83, // (85 * 0.85) + (72 * 0.15) = 83
    status: 'eligible',
    missingData: [],
    decisionReason: 'Đạt tiêu chuẩn, cần xem xét thêm',
    recruiterNotes: 'Kỹ năng tốt, cần test thực tế',
    uploadedAt: new Date('2025-10-15T09:45:00')
  },
  {
    id: '4',
    name: 'Phạm Thị Dung',
    email: 'phamthid@email.com',
    phone: '+84 904 567 890',
    cvFileName: 'PhamThiDung_CV.pdf',
    cvMatchScore: 65,
    discScore: undefined,
    numerologyInsight: 'Số chủ đạo 8 - Tham vọng, lãnh đạo',
    finalScore: 65,
    status: 'rejected',
    missingData: ['DISC Assessment'],
    decisionReason: 'CV không đạt ngưỡng tối thiểu (70%)',
    recruiterNotes: 'Kinh nghiệm chưa phù hợp với vị trí',
    uploadedAt: new Date('2025-10-15T14:20:00')
  }
];

export const ShortlistRankingEnhanced: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [filter, setFilter] = useState<'all' | 'shortlisted' | 'eligible' | 'rejected' | 'pending-data'>('all');
  const [sortBy, setSortBy] = useState<'finalScore' | 'cvScore' | 'uploadedAt'>('finalScore');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  const updateCandidateStatus = (id: string, newStatus: Candidate['status'], reason: string) => {
    setCandidates(prev => 
      prev.map(c => 
        c.id === id 
          ? { ...c, status: newStatus, decisionReason: reason }
          : c
      )
    );
  };

  const updateRecruiterNotes = (id: string, notes: string) => {
    setCandidates(prev => 
      prev.map(c => 
        c.id === id 
          ? { ...c, recruiterNotes: notes }
          : c
      )
    );
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (filter === 'all') return true;
    if (filter === 'pending-data') return candidate.missingData.length > 0;
    return candidate.status === filter;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    switch (sortBy) {
      case 'finalScore':
        return b.finalScore - a.finalScore;
      case 'cvScore':
        return b.cvMatchScore - a.cvMatchScore;
      case 'uploadedAt':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      default:
        return 0;
    }
  });

  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#28a745'; // Green
    if (score >= 70) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const getStatusBadgeClass = (status: Candidate['status']): string => {
    switch (status) {
      case 'shortlisted': return styles.statusShortlisted;
      case 'eligible': return styles.statusEligible;
      case 'rejected': return styles.statusRejected;
      case 'pending-data': return styles.statusPending;
      default: return styles.statusDefault;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header with Controls */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3>🏆 Bảng Xếp Hạng Ứng Viên</h3>
          <div className={styles.scoringInfo}>
            <span className={styles.scoringLabel}>Thang điểm:</span>
            <span className={styles.scoringItem}>CV Matching (85%)</span>
            <span className={styles.scoringItem}>+ DISC (15%)</span>
            <span className={styles.scoringItem}>+ Thần số học (tham khảo)</span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <label>Lọc theo trạng thái:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="all">Tất cả ({candidates.length})</option>
              <option value="shortlisted">Shortlisted ({candidates.filter(c => c.status === 'shortlisted').length})</option>
              <option value="eligible">Đủ điều kiện ({candidates.filter(c => c.status === 'eligible').length})</option>
              <option value="pending-data">Thiếu dữ liệu ({candidates.filter(c => c.missingData.length > 0).length})</option>
              <option value="rejected">Loại bỏ ({candidates.filter(c => c.status === 'rejected').length})</option>
            </select>
          </div>

          <div className={styles.sortGroup}>
            <label>Sắp xếp theo:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.sortSelect}
            >
              <option value="finalScore">Điểm tổng</option>
              <option value="cvScore">Điểm CV</option>
              <option value="uploadedAt">Thời gian upload</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className={styles.tableContainer}>
        <table className={styles.candidatesTable}>
          <thead>
            <tr>
              <th>Xếp hạng</th>
              <th>Ứng viên</th>
              <th>Điểm CV (85%)</th>
              <th>DISC (15%)</th>
              <th>Thần số học</th>
              <th>Điểm tổng</th>
              <th>Trạng thái</th>
              <th>Lý do quyết định</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sortedCandidates.map((candidate, index) => (
              <tr key={candidate.id} className={styles.candidateRow}>
                <td className={styles.rankCell}>
                  <div className={styles.rank}>#{index + 1}</div>
                </td>
                
                <td className={styles.candidateCell}>
                  <div className={styles.candidateInfo}>
                    <strong>{candidate.name}</strong>
                    <div className={styles.candidateDetails}>
                      <span>{candidate.email}</span>
                      <span>{candidate.phone}</span>
                    </div>
                    <div className={styles.fileName}>{candidate.cvFileName}</div>
                  </div>
                </td>
                
                <td className={styles.scoreCell}>
                  <div className={styles.scoreContainer}>
                    <span 
                      className={styles.score}
                      style={{ color: getScoreColor(candidate.cvMatchScore) }}
                    >
                      {candidate.cvMatchScore}/100
                    </span>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreProgress}
                        style={{ 
                          width: `${candidate.cvMatchScore}%`,
                          backgroundColor: getScoreColor(candidate.cvMatchScore)
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                
                <td className={styles.scoreCell}>
                  {candidate.discScore !== undefined ? (
                    <div className={styles.scoreContainer}>
                      <span 
                        className={styles.score}
                        style={{ color: getScoreColor(candidate.discScore) }}
                      >
                        {candidate.discScore}/100
                      </span>
                      <div className={styles.scoreBar}>
                        <div 
                          className={styles.scoreProgress}
                          style={{ 
                            width: `${candidate.discScore}%`,
                            backgroundColor: getScoreColor(candidate.discScore)
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.missingData}>
                      <span>❌ Chưa có</span>
                      <button className={styles.addDataBtn}>+ Thêm</button>
                    </div>
                  )}
                </td>
                
                <td className={styles.numerologyCell}>
                  {candidate.numerologyInsight ? (
                    <div className={styles.numerologyInfo}>
                      <span className={styles.numerologyIcon}>🔢</span>
                      <span className={styles.numerologyText}>{candidate.numerologyInsight}</span>
                    </div>
                  ) : (
                    <div className={styles.missingData}>
                      <span>⚠️ Thiếu dữ liệu</span>
                    </div>
                  )}
                </td>
                
                <td className={styles.finalScoreCell}>
                  <div className={styles.finalScore}>
                    <span 
                      className={styles.finalScoreValue}
                      style={{ color: getScoreColor(candidate.finalScore) }}
                    >
                      {candidate.finalScore}
                    </span>
                    {candidate.missingData.length > 0 && (
                      <div className={styles.missingDataLabels}>
                        {candidate.missingData.map(item => (
                          <span key={item} className={styles.missingLabel}>
                            Thiếu {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className={styles.statusCell}>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(candidate.status)}`}>
                    {candidate.status === 'shortlisted' && '⭐ Shortlisted'}
                    {candidate.status === 'eligible' && '✅ Đủ điều kiện'}
                    {candidate.status === 'rejected' && '❌ Loại bỏ'}
                    {candidate.status === 'pending-data' && '⏳ Thiếu dữ liệu'}
                  </span>
                </td>
                
                <td className={styles.reasonCell}>
                  <div className={styles.reasonText}>{candidate.decisionReason}</div>
                </td>
                
                <td className={styles.notesCell}>
                  {editingNotes === candidate.id ? (
                    <div className={styles.notesEditContainer}>
                      <textarea
                        value={candidate.recruiterNotes}
                        onChange={(e) => updateRecruiterNotes(candidate.id, e.target.value)}
                        className={styles.notesTextarea}
                        placeholder="Nhập ghi chú..."
                      />
                      <button 
                        onClick={() => setEditingNotes(null)}
                        className={styles.saveNotesBtn}
                      >
                        💾 Lưu
                      </button>
                    </div>
                  ) : (
                    <div className={styles.notesContainer}>
                      <div className={styles.notesText}>{candidate.recruiterNotes}</div>
                      <button 
                        onClick={() => setEditingNotes(candidate.id)}
                        className={styles.editNotesBtn}
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </td>
                
                <td className={styles.actionsCell}>
                  <div className={styles.actionButtons}>
                    {candidate.status !== 'shortlisted' && candidate.cvMatchScore >= 70 && (
                      <button 
                        onClick={() => updateCandidateStatus(candidate.id, 'shortlisted', 'Được chọn vào shortlist')}
                        className={styles.shortlistBtn}
                      >
                        ⭐ Shortlist
                      </button>
                    )}
                    {candidate.status !== 'rejected' && (
                      <button 
                        onClick={() => updateCandidateStatus(candidate.id, 'rejected', 'Không phù hợp với yêu cầu')}
                        className={styles.rejectBtn}
                      >
                        ❌ Loại bỏ
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h4>📊 Thống kê tổng quan</h4>
          <div className={styles.summaryStats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Tổng ứng viên:</span>
              <span className={styles.statValue}>{candidates.length}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Shortlisted:</span>
              <span className={styles.statValue}>{candidates.filter(c => c.status === 'shortlisted').length}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Điểm CV trung bình:</span>
              <span className={styles.statValue}>
                {Math.round(candidates.reduce((sum, c) => sum + c.cvMatchScore, 0) / candidates.length)}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Thiếu dữ liệu phụ trợ:</span>
              <span className={styles.statValue}>{candidates.filter(c => c.missingData.length > 0).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};