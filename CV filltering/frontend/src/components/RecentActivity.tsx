import React, { useState } from 'react';

interface Activity {
  id: string;
  type: 'cv_upload' | 'cv_analysis' | 'disc_completed' | 'candidate_shortlisted' | 'candidate_rejected';
  candidateName: string;
  jobTitle: string;
  timestamp: Date;
  details: string;
}

export const RecentActivity: React.FC = () => {
  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'cv_upload',
      candidateName: 'Nguyễn Văn Minh',
      jobTitle: 'Senior Frontend Developer',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      details: 'CV đã được tải lên và phân tích bằng AI'
    },
    {
      id: '2', 
      type: 'disc_completed',
      candidateName: 'Trần Thị Lan',
      jobTitle: 'UX/UI Designer',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      details: 'Hoàn thành bài test DISC - Loại hành vi: DI (Người truyền cảm hứng)'
    },
    {
      id: '3',
      type: 'candidate_shortlisted',
      candidateName: 'Phạm Văn Hùng', 
      jobTitle: 'Backend Developer',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      details: 'Được thêm vào danh sách ứng viên được chọn với tổng điểm 88/100'
    },
    {
      id: '4',
      type: 'cv_analysis',
      candidateName: 'Lê Thị Mai',
      jobTitle: 'Product Manager',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago  
      details: 'Phân tích CV hoàn tất - Điểm CV: 82/100, Thần số học: 76/100'
    },
    {
      id: '5',
      type: 'candidate_rejected',
      candidateName: 'Hoàng Văn Nam',
      jobTitle: 'DevOps Engineer', 
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      details: 'Bị loại - Lý do: Không đủ kinh nghiệm với Kubernetes'
    }
  ]);

  const [filter, setFilter] = useState<'all' | Activity['type']>('all');

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'cv_upload': return '📄';
      case 'cv_analysis': return '🔍';
      case 'disc_completed': return '📊';
      case 'candidate_shortlisted': return '✅';
      case 'candidate_rejected': return '❌';
      default: return '📋';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'cv_upload': return '#007bff';
      case 'cv_analysis': return '#17a2b8';
      case 'disc_completed': return '#6f42c1';
      case 'candidate_shortlisted': return '#28a745';
      case 'candidate_rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getActivityTitle = (type: Activity['type']) => {
    switch (type) {
      case 'cv_upload': return 'CV được tải lên';
      case 'cv_analysis': return 'Phân tích CV hoàn tất';
      case 'disc_completed': return 'Test DISC hoàn thành';
      case 'candidate_shortlisted': return 'Ứng viên được chọn';
      case 'candidate_rejected': return 'Ứng viên bị loại';
      default: return 'Hoạt động khác';
    }
  };

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours} giờ trước`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} phút trước`;
    } else {
      return 'Vừa xong';
    }
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const activityTypeCount = (type: Activity['type']) => 
    activities.filter(a => a.type === type).length;

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#333', margin: 0 }}>📈 Hoạt động gần đây</h3>
        
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Tổng cộng: {activities.length} hoạt động trong 24h qua
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '20px', 
        flexWrap: 'wrap',
        paddingBottom: '15px',
        borderBottom: '1px solid #eee'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 12px',
            backgroundColor: filter === 'all' ? '#007bff' : '#f8f9fa',
            color: filter === 'all' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Tất cả ({activities.length})
        </button>
        
        <button
          onClick={() => setFilter('cv_upload')}
          style={{
            padding: '6px 12px',
            backgroundColor: filter === 'cv_upload' ? '#007bff' : '#f8f9fa',
            color: filter === 'cv_upload' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          📄 Upload CV ({activityTypeCount('cv_upload')})
        </button>

        <button
          onClick={() => setFilter('disc_completed')}
          style={{
            padding: '6px 12px',
            backgroundColor: filter === 'disc_completed' ? '#6f42c1' : '#f8f9fa',
            color: filter === 'disc_completed' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          📊 DISC ({activityTypeCount('disc_completed')})
        </button>

        <button
          onClick={() => setFilter('candidate_shortlisted')}
          style={{
            padding: '6px 12px',
            backgroundColor: filter === 'candidate_shortlisted' ? '#28a745' : '#f8f9fa',
            color: filter === 'candidate_shortlisted' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          ✅ Được chọn ({activityTypeCount('candidate_shortlisted')})
        </button>

        <button
          onClick={() => setFilter('candidate_rejected')}
          style={{
            padding: '6px 12px',
            backgroundColor: filter === 'candidate_rejected' ? '#dc3545' : '#f8f9fa',
            color: filter === 'candidate_rejected' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          ❌ Bị loại ({activityTypeCount('candidate_rejected')})
        </button>
      </div>

      {/* Activity List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {filteredActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Không có hoạt động nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div>
            {filteredActivities.map((activity, index) => (
              <div 
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '15px',
                  padding: '15px 0',
                  borderBottom: index < filteredActivities.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: getActivityColor(activity.type) + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}
                >
                  {getActivityIcon(activity.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                    <h4 style={{ 
                      margin: 0, 
                      fontSize: '0.95rem', 
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {getActivityTitle(activity.type)}
                    </h4>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: '#666',
                      flexShrink: 0,
                      marginLeft: '10px'
                    }}>
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#333' }}>
                      {activity.candidateName}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>
                      {' • '}{activity.jobTitle}
                    </span>
                  </div>

                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.85rem', 
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {activity.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};