/**
 * AI Service - Frontend Integration
 * 
 * Service for AI-powered CV analysis and job matching
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface CVAnalysisRequest {
  assessmentId: string;
  cvFile: File;
  jobPositionId?: string;
  includePersonalityIntegration?: boolean;
}

export interface CVAnalysisResult {
  analysisId: string;
  candidateInfo: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    summary: string;
  };
  experience: {
    totalYears: number;
    positions: Array<{
      title: string;
      company: string;
      duration: string;
      responsibilities: string[];
      achievements: string[];
    }>;
    industries: string[];
    skillsProgression: string[];
  };
  education: {
    degrees: Array<{
      degree: string;
      institution: string;
      year?: string;
      gpa?: string;
    }>;
    certifications: string[];
    continuingEducation: string[];
  };
  skills: {
    technical: Array<{
      skill: string;
      proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
      yearsExperience?: number;
    }>;
    soft: string[];
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
  };
  achievements: {
    awards: string[];
    publications: string[];
    projects: string[];
    leadership: string[];
  };
  jobCompatibility?: {
    overallScore: number;
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    culturalFit: number;
    growthPotential: number;
    recommendations: string[];
    gaps: string[];
  };
  personalityIntegration?: {
    discAlignment: string;
    mbtiSynergy: string;
    numerologyInsights: string;
    holisticProfile: string;
  };
  aiInsights: {
    strengths: string[];
    areasForImprovement: string[];
    careerTrajectory: string;
    recommendedRoles: string[];
    developmentSuggestions: string[];
  };
}

export interface JobCompatibilityResult {
  overallCompatibility: number;
  strengthsAlignment: string[];
  skillsGap: string[];
  culturalFit: string;
  growthPotential: string;
  riskFactors: string[];
  recommendations: string[];
  interviewFocus: string[];
}

export interface BulkAnalysisResult {
  totalFiles: number;
  successfulAnalyses: number;
  results: Array<{
    filename: string;
    candidateInfo?: any;
    jobCompatibility?: any;
    aiInsights?: any;
    error?: string;
    success: boolean;
  }>;
}

class AIService {
  /**
   * Upload and analyze CV using AI
   */
  async analyzeCVWithAI(request: CVAnalysisRequest): Promise<CVAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('cv', request.cvFile);
      formData.append('assessmentId', request.assessmentId);
      
      if (request.jobPositionId) {
        formData.append('jobPositionId', request.jobPositionId);
      }
      
      if (request.includePersonalityIntegration) {
        formData.append('includePersonalityIntegration', 'true');
      }

      const response = await fetch(`${BACKEND_URL}/api/ai/cv-analysis`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze CV');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error analyzing CV:', error);
      throw error;
    }
  }

  /**
   * Get CV analysis results for an assessment
   */
  async getCVAnalysis(assessmentId: string): Promise<CVAnalysisResult | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/cv-analysis/${assessmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch CV analysis');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching CV analysis:', error);
      throw error;
    }
  }

  /**
   * Calculate AI-enhanced job compatibility
   */
  async calculateJobCompatibility(
    assessmentId: string,
    jobPositionId: string
  ): Promise<JobCompatibilityResult> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/job-compatibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId,
          jobPositionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate job compatibility');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error calculating job compatibility:', error);
      throw error;
    }
  }

  /**
   * Bulk analyze multiple CVs
   */
  async bulkAnalyzeCVs(
    cvFiles: File[],
    jobPositionId?: string
  ): Promise<BulkAnalysisResult> {
    try {
      const formData = new FormData();
      
      cvFiles.forEach(file => {
        formData.append('cvs', file);
      });
      
      if (jobPositionId) {
        formData.append('jobPositionId', jobPositionId);
      }

      const response = await fetch(`${BACKEND_URL}/api/ai/bulk-analysis`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform bulk analysis');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error in bulk CV analysis:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analysis summary for a candidate
   */
  async getAnalysisSummary(candidateId: string): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/analysis-summary/${candidateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analysis summary');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching analysis summary:', error);
      throw error;
    }
  }

  /**
   * Validate CV file before upload
   */
  validateCVFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'File size exceeds 10MB limit'
      };
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain', 'text/rtf'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only PDF and text files are supported'
      };
    }

    return { isValid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get compatibility level description
   */
  getCompatibilityLevel(score: number): { level: string; color: string; description: string } {
    if (score >= 90) {
      return {
        level: 'Excellent',
        color: '#4caf50',
        description: 'Outstanding match for this position'
      };
    } else if (score >= 75) {
      return {
        level: 'Very Good',
        color: '#8bc34a',
        description: 'Strong candidate with good alignment'
      };
    } else if (score >= 60) {
      return {
        level: 'Good',
        color: '#ffc107',
        description: 'Suitable candidate with some areas for development'
      };
    } else if (score >= 40) {
      return {
        level: 'Fair',
        color: '#ff9800',
        description: 'Potential candidate requiring additional assessment'
      };
    } else {
      return {
        level: 'Poor',
        color: '#f44336',
        description: 'Limited alignment with position requirements'
      };
    }
  }
}

const aiService = new AIService();
export default aiService;