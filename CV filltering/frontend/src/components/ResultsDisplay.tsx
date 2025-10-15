import React from 'react';

interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  experience: Array<{
    position: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  numerologyInsights: {
    lifePath: number;
    personality: string;
    careerFit: string;
    compatibilityScore: number;
  };
}

interface ResultsDisplayProps {
  cvData: CVData | null;
  isLoading?: boolean;
  error?: string | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  cvData, 
  isLoading = false, 
  error 
}) => {
  if (isLoading) {
    return (
      <div className="results-container loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Analyzing CV with AI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-container error">
        <div className="error-message">
          <h3>❌ Processing Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="results-container empty">
        <div className="empty-state">
          <h3>📊 Analysis Results</h3>
          <p>Upload a CV to see detailed analysis results here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <h2>CV Analysis Results</h2>
      
      {/* Personal Information */}
      <section className="section">
        <h3>👤 Personal Information</h3>
        <div className="info-grid">
          <div><strong>Name:</strong> {cvData.personalInfo.name}</div>
          <div><strong>Email:</strong> {cvData.personalInfo.email}</div>
          <div><strong>Phone:</strong> {cvData.personalInfo.phone}</div>
          {cvData.personalInfo.address && (
            <div><strong>Address:</strong> {cvData.personalInfo.address}</div>
          )}
        </div>
      </section>

      {/* Experience */}
      <section className="section">
        <h3>💼 Work Experience</h3>
        {cvData.experience.map((exp, index) => (
          <div key={index} className="experience-item">
            <h4>{exp.position} at {exp.company}</h4>
            <p className="duration">{exp.duration}</p>
            <p className="description">{exp.description}</p>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="section">
        <h3>🎓 Education</h3>
        {cvData.education.map((edu, index) => (
          <div key={index} className="education-item">
            <h4>{edu.degree}</h4>
            <p>{edu.institution} ({edu.year})</p>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="section">
        <h3>🛠️ Skills</h3>
        <div className="skills-list">
          {cvData.skills.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>
      </section>

      {/* Numerology Insights */}
      <section className="section numerology">
        <h3>🔮 Numerology Analysis</h3>
        <div className="numerology-grid">
          <div className="numerology-item">
            <strong>Life Path Number:</strong> {cvData.numerologyInsights.lifePath}
          </div>
          <div className="numerology-item">
            <strong>Personality:</strong> {cvData.numerologyInsights.personality}
          </div>
          <div className="numerology-item">
            <strong>Career Fit:</strong> {cvData.numerologyInsights.careerFit}
          </div>
          <div className="numerology-item">
            <strong>Compatibility Score:</strong> 
            <span className={`score score-${cvData.numerologyInsights.compatibilityScore >= 80 ? 'high' : cvData.numerologyInsights.compatibilityScore >= 60 ? 'medium' : 'low'}`}>
              {cvData.numerologyInsights.compatibilityScore}%
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};