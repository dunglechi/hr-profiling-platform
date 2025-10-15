import React, { useState } from 'react';

interface DISCResult {
  candidateId: string;
  candidateName: string;
  dScore: number;
  iScore: number;
  sScore: number;
  cScore: number;
  behavioralType: string;
  resultSource: 'imported' | 'test-completed';
  importedAt?: Date;
  completedAt?: Date;
}

export const DISCAssessment: React.FC = () => {
  const [discResults] = useState<DISCResult[]>([
    {
      candidateId: '1',
      candidateName: 'Nguyễn Văn Minh',
      dScore: 75,
      iScore: 60,
      sScore: 45,
      cScore: 80,
      behavioralType: 'DC - Nhà lãnh đạo quyết đoán',
      resultSource: 'imported',
      importedAt: new Date()
    }
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [testLinks, setTestLinks] = useState<{ candidateId: string; link: string; expires: Date }[]>([]);

  const handleImportResults = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Importing DISC results from:', file.name);
      // TODO: Process CSV/PDF file
    }
  };

  const generateTestLink = () => {
    if (!selectedCandidate) return;
    
    const link = `https://disc-test.com/assessment/${Date.now()}`;
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 days expiry
    
    setTestLinks(prev => [...prev, {
      candidateId: selectedCandidate,
      link,
      expires
    }]);
    
    console.log(`DISC test link generated for candidate ${selectedCandidate}: ${link}`);
  };

  const getBehavioralDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      'DC': 'Nhà lãnh đạo quyết đoán - Thích thử thách, hướng kết quả',
      'DI': 'Người truyền cảm hứng - Năng động, tự tin, giao tiếp tốt',
      'DS': 'Người hỗ trợ kiên định - Bền bỉ, đáng tin cậy',
      'CS': 'Người phân tích thận trọng - Tỉ mỉ, chính xác, có hệ thống',
      'CI': 'Người sáng tạo độc lập - Tư duy phản biện, yêu thích độc lập',
      'SI': 'Người hòa hợp linh hoạt - Thân thiện, kiên nhẫn, dễ thích nghi'
    };
    return descriptions[type] || 'Chưa xác định được mô tả';
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', marginBottom: '20px' }}>📊 Quản lý kết quả DISC</h3>
        
        {/* Import Results Section */}
        <div style={{ marginBottom: '20px', padding: '15px', border: '2px dashed #ddd', borderRadius: '8px' }}>
          <h4>📁 Nhập kết quả có sẵn</h4>
          <input
            type="file"
            accept=".csv,.pdf,.xlsx"
            onChange={handleImportResults}
            style={{ marginBottom: '10px' }}
          />
          <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
            Hỗ trợ: CSV, PDF, Excel từ các nhà cung cấp DISC uy tín
          </p>
        </div>

        {/* Generate Test Link Section */}
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>🔗 Tạo link test DISC</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <select 
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Chọn ứng viên...</option>
              <option value="candidate-1">Nguyễn Thị Lan</option>
              <option value="candidate-2">Trần Văn Hùng</option>
              <option value="candidate-3">Phạm Thị Mai</option>
            </select>
            <button 
              onClick={generateTestLink}
              disabled={!selectedCandidate}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedCandidate ? '#28a745' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedCandidate ? 'pointer' : 'not-allowed'
              }}
            >
              Tạo Link
            </button>
          </div>
          
          {/* Test Links List */}
          {testLinks.length > 0 && (
            <div>
              <h5>🔗 Link đã tạo:</h5>
              {testLinks.map((testLink, index) => (
                <div key={index} style={{ padding: '8px', backgroundColor: 'white', borderRadius: '4px', marginBottom: '5px' }}>
                  <div><strong>Ứng viên:</strong> {testLink.candidateId}</div>
                  <div><strong>Link:</strong> <a href={testLink.link} target="_blank" rel="noopener noreferrer">{testLink.link}</a></div>
                  <div><strong>Hết hạn:</strong> {testLink.expires.toLocaleDateString('vi-VN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      <div>
        <h3 style={{ color: '#333', marginBottom: '20px' }}>📈 Kết quả DISC hiện có</h3>
        {discResults.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            Chưa có kết quả DISC nào. Hãy nhập kết quả hoặc gửi link test cho ứng viên.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {discResults.map((result, index) => (
              <div 
                key={index} 
                style={{ 
                  border: '1px solid #e1e5e9', 
                  borderRadius: '8px', 
                  padding: '20px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{result.candidateName}</h4>
                    <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                      {result.resultSource === 'imported' ? '📁 Đã nhập' : '✅ Hoàn thành test'} • 
                      {result.importedAt?.toLocaleDateString('vi-VN') || result.completedAt?.toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  
                  <div>
                    <h5 style={{ margin: '0 0 8px 0' }}>Điểm DISC:</h5>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem' }}>
                      <span style={{ background: '#e3f2fd', padding: '4px 8px', borderRadius: '4px' }}>
                        D: {result.dScore}
                      </span>
                      <span style={{ background: '#fff3e0', padding: '4px 8px', borderRadius: '4px' }}>
                        I: {result.iScore}
                      </span>
                      <span style={{ background: '#e8f5e8', padding: '4px 8px', borderRadius: '4px' }}>
                        S: {result.sScore}
                      </span>
                      <span style={{ background: '#fce4ec', padding: '4px 8px', borderRadius: '4px' }}>
                        C: {result.cScore}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h5 style={{ margin: '0 0 8px 0' }}>Loại hành vi:</h5>
                    <p style={{ margin: '0', fontWeight: '600', color: '#333' }}>{result.behavioralType}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                      {getBehavioralDescription(result.behavioralType.split(' - ')[0])}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};