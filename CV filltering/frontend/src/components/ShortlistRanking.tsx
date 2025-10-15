import React, { useState } from 'react';

interface ShortlistCandidate {
  id: string;
  name: string;
  email: string;
  cvScore: number;
  numerologyScore: number;
  discScore: number;
  totalScore: number;
  status: 'pending' | 'shortlisted' | 'rejected';
  recruiterNotes: string;
  decisionReason: string;
}

export const ShortlistRanking: React.FC = () => {
  const [candidates, setCandidates] = useState<ShortlistCandidate[]>([
    {
      id: '1',
      name: 'Nguyễn Văn Minh',
      email: 'minh.nguyen@email.com',
      cvScore: 87,
      numerologyScore: 78,
      discScore: 82,
      totalScore: 83,
      status: 'pending',
      recruiterNotes: '',
      decisionReason: ''
    },
    {
      id: '2', 
      name: 'Trần Thị Lan',
      email: 'lan.tran@email.com',
      cvScore: 92,
      numerologyScore: 85,
      discScore: 79,
      totalScore: 86,
      status: 'pending',
      recruiterNotes: '',
      decisionReason: ''
    },
    {
      id: '3',
      name: 'Phạm Văn Hùng',
      email: 'hung.pham@email.com', 
      cvScore: 75,
      numerologyScore: 68,
      discScore: 88,
      totalScore: 77,
      status: 'pending',
      recruiterNotes: '',
      decisionReason: ''
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'shortlisted' | 'rejected'>('all');

  const updateCandidateStatus = (id: string, status: ShortlistCandidate['status'], reason: string, notes: string) => {
    setCandidates(prev => 
      prev.map(c => 
        c.id === id 
          ? { ...c, status, decisionReason: reason, recruiterNotes: notes }
          : c
      )
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#28a745'; // Green
    if (score >= 70) return '#ffc107'; // Yellow  
    return '#dc3545'; // Red
  };

  const getStatusBadge = (status: ShortlistCandidate['status']) => {
    switch (status) {
      case 'shortlisted': return { text: '✅ Được chọn', color: '#28a745' };
      case 'rejected': return { text: '❌ Bị loại', color: '#dc3545' };
      default: return { text: '⏳ Chờ quyết định', color: '#ffc107' };
    }
  };

  const filteredCandidates = candidates
    .filter(c => filter === 'all' || c.status === filter)
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#333', margin: 0 }}>🏆 Bảng xếp hạng ứng viên</h3>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              backgroundColor: filter === 'all' ? '#007bff' : '#f8f9fa',
              color: filter === 'all' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Tất cả ({candidates.length})
          </button>
          <button 
            onClick={() => setFilter('pending')}
            style={{
              padding: '6px 12px',
              backgroundColor: filter === 'pending' ? '#ffc107' : '#f8f9fa',
              color: filter === 'pending' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Chờ duyệt ({candidates.filter(c => c.status === 'pending').length})
          </button>
          <button 
            onClick={() => setFilter('shortlisted')}
            style={{
              padding: '6px 12px',
              backgroundColor: filter === 'shortlisted' ? '#28a745' : '#f8f9fa',
              color: filter === 'shortlisted' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Đã chọn ({candidates.filter(c => c.status === 'shortlisted').length})
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Hạng</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Ứng viên</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>CV (40%)</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Thần số (25%)</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>DISC (35%)</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Tổng điểm</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Trạng thái</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((candidate, index) => (
              <CandidateRow 
                key={candidate.id} 
                candidate={candidate} 
                rank={index + 1}
                onUpdateStatus={updateCandidateStatus}
                getScoreColor={getScoreColor}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredCandidates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Không có ứng viên nào phù hợp với bộ lọc hiện tại.</p>
        </div>
      )}
    </div>
  );
};

interface CandidateRowProps {
  candidate: ShortlistCandidate;
  rank: number;
  onUpdateStatus: (id: string, status: ShortlistCandidate['status'], reason: string, notes: string) => void;
  getScoreColor: (score: number) => string;
  getStatusBadge: (status: ShortlistCandidate['status']) => { text: string; color: string };
}

const CandidateRow: React.FC<CandidateRowProps> = ({ 
  candidate, 
  rank, 
  onUpdateStatus, 
  getScoreColor, 
  getStatusBadge 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes] = useState(candidate.recruiterNotes);
  const [reason, setReason] = useState(candidate.decisionReason);

  const handleDecision = (status: ShortlistCandidate['status']) => {
    onUpdateStatus(candidate.id, status, reason, notes);
    setShowDetails(false);
  };

  const statusBadge = getStatusBadge(candidate.status);

  return (
    <>
      <tr style={{ borderBottom: '1px solid #eee' }}>
        <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>#{rank}</td>
        <td style={{ padding: '12px 8px' }}>
          <div>
            <div style={{ fontWeight: '600' }}>{candidate.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{candidate.email}</div>
          </div>
        </td>
        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
          <span style={{ 
            color: getScoreColor(candidate.cvScore), 
            fontWeight: '600' 
          }}>
            {candidate.cvScore}
          </span>
        </td>
        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
          <span style={{ 
            color: getScoreColor(candidate.numerologyScore), 
            fontWeight: '600' 
          }}>
            {candidate.numerologyScore}
          </span>
        </td>
        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
          <span style={{ 
            color: getScoreColor(candidate.discScore), 
            fontWeight: '600' 
          }}>
            {candidate.discScore}
          </span>
        </td>
        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
          <span style={{ 
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: getScoreColor(candidate.totalScore)
          }}>
            {candidate.totalScore}
          </span>
        </td>
        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '12px', 
            backgroundColor: statusBadge.color + '20',
            color: statusBadge.color,
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            {statusBadge.text}
          </span>
        </td>
        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {showDetails ? 'Ẩn' : 'Chi tiết'}
          </button>
        </td>
      </tr>
      
      {showDetails && (
        <tr>
          <td colSpan={8} style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Ghi chú của nhà tuyển dụng:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nhập ghi chú về ứng viên..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    minHeight: '80px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Lý do quyết định:
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do chọn/loại ứng viên..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    minHeight: '80px',
                    fontSize: '0.9rem'
                  }}
                />
                
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleDecision('shortlisted')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    ✅ Chọn ứng viên
                  </button>
                  <button
                    onClick={() => handleDecision('rejected')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    ❌ Loại ứng viên
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};