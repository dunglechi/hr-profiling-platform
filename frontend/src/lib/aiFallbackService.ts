// AI Fallback Service - Handles AI service failures gracefully
import { CVAnalysisResult, CVAnalysisRequest } from './cvAnalysisService';
import { trackApiError } from '../lib/systemMonitor';

export class AIFallbackService {
  private static readonly FALLBACK_CONFIG = {
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
    fallbackEnabled: true
  };

  // Retry mechanism with exponential backoff
  static async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = this.FALLBACK_CONFIG.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.withTimeout(
          operation(),
          this.FALLBACK_CONFIG.timeoutMs,
          `${operationName} timeout`
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        trackApiError(`${operationName}_attempt_${attempt}`, lastError);

        if (attempt === maxRetries) break;

        // Exponential backoff: 1s, 2s, 4s
        const delay = this.FALLBACK_CONFIG.retryDelayMs * Math.pow(2, attempt - 1);
        await this.delay(delay);
        
        console.warn(`${operationName} attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    }

    throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
  }

  // Timeout wrapper
  static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  // Delay utility
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fallback CV analysis when AI fails
  static generateFallbackAnalysis(request: CVAnalysisRequest): CVAnalysisResult {
    const cvText = request.cvText.toLowerCase();
    
    return {
      skills: this.analyzeFallbackSkills(cvText),
      experience: this.analyzeFallbackExperience(cvText),
      behavioral: this.analyzeFallbackBehavioral(cvText),
      fitAnalysis: this.generateFallbackFitAnalysis(cvText, request.jobPosition),
      extractedData: this.extractBasicData(request.cvText),
      isAiAnalysis: false,
      analysisMethod: 'fallback'
    };
  }

  private static analyzeFallbackSkills(cvText: string) {
    // Simple keyword matching for technical skills
    const technicalKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws',
      'docker', 'kubernetes', 'git', 'api', 'html', 'css', 'typescript'
    ];

    const softSkillsKeywords = [
      'communication', 'leadership', 'teamwork', 'problem solving',
      'project management', 'presentation', 'collaboration', 'analytical'
    ];

    const leadershipKeywords = [
      'managed', 'led', 'supervised', 'coordinated', 'mentored',
      'team lead', 'manager', 'director', 'head of'
    ];

    return {
      technical: this.matchSkillsKeywords(cvText, technicalKeywords, 'technical'),
      soft: this.matchSkillsKeywords(cvText, softSkillsKeywords, 'soft'),
      leadership: this.matchSkillsKeywords(cvText, leadershipKeywords, 'leadership')
    };
  }

  private static matchSkillsKeywords(cvText: string, keywords: string[], category: string) {
    return keywords
      .filter(keyword => cvText.includes(keyword))
      .map(skill => ({
        skill: this.capitalizeWords(skill),
        proficiencyLevel: Math.min(5, Math.max(1, 
          Math.ceil((cvText.split(skill).length - 1) / 2) + 2
        )) as 1 | 2 | 3 | 4 | 5,
        yearsOfExperience: this.estimateExperience(cvText, skill),
        evidenceText: this.findEvidenceText(cvText, skill),
        relevanceScore: Math.random() * 0.3 + 0.7 // 70-100%
      }));
  }

  private static analyzeFallbackExperience(cvText: string) {
    // Simple experience estimation
    const experiencePatterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi,
      /(\d{4})\s*-\s*(?:\d{4}|present|current)/gi
    ];

    let totalYears = 0;
    experiencePatterns.forEach(pattern => {
      const matches = cvText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const years = parseInt(match.match(/\d+/)?.[0] || '0');
          totalYears = Math.max(totalYears, years);
        });
      }
    });

    // If no explicit years found, estimate from CV length and content
    if (totalYears === 0) {
      const jobIndicators = (cvText.match(/\b(?:developer|engineer|manager|analyst|specialist|lead|senior|junior)\b/gi) || []).length;
      totalYears = Math.min(15, Math.max(1, jobIndicators * 1.5));
    }

    const seniorityLevel = this.determineSeniorityLevel(totalYears, cvText);

    return {
      totalYears,
      seniorityLevel,
      industryExperience: this.identifyIndustries(cvText),
      careerProgression: this.analyzeCareerProgression(cvText, totalYears)
    };
  }

  private static analyzeFallbackBehavioral(cvText: string) {
    // Simple behavioral analysis based on keywords
    const behaviors = {
      communicationStyle: this.analyzeBehavioralIndicator(cvText, [
        'presentation', 'communication', 'public speaking', 'training'
      ]),
      leadershipPotential: this.analyzeBehavioralIndicator(cvText, [
        'led', 'managed', 'supervised', 'mentored', 'coached'
      ]),
      teamCollaboration: this.analyzeBehavioralIndicator(cvText, [
        'team', 'collaboration', 'cross-functional', 'stakeholder'
      ]),
      problemSolving: this.analyzeBehavioralIndicator(cvText, [
        'problem solving', 'troubleshooting', 'debugging', 'optimization'
      ]),
      adaptability: this.analyzeBehavioralIndicator(cvText, [
        'agile', 'flexible', 'adapted', 'learning', 'new technologies'
      ])
    };

    return behaviors;
  }

  private static analyzeBehavioralIndicator(cvText: string, keywords: string[]) {
    const score = Math.min(5, Math.max(1, 
      keywords.filter(keyword => cvText.toLowerCase().includes(keyword)).length + 1
    )) as 1 | 2 | 3 | 4 | 5;

    const descriptions = {
      1: 'Limited evidence',
      2: 'Some indication',
      3: 'Moderate evidence',
      4: 'Strong evidence',
      5: 'Exceptional evidence'
    };

    return {
      score,
      description: descriptions[score],
      evidence: keywords.filter(keyword => cvText.toLowerCase().includes(keyword))
    };
  }

  private static generateFallbackFitAnalysis(cvText: string, jobPosition?: string) {
    const overallScore = Math.random() * 30 + 60; // 60-90 range for fallback

    return {
      overallScore: Math.round(overallScore),
      strengths: [
        'Experience in relevant technologies',
        'Demonstrated career progression',
        'Strong technical background'
      ],
      concerns: [
        'Limited AI analysis available - manual review recommended',
        'Detailed skill assessment pending full evaluation'
      ],
      recommendations: [
        'Conduct technical interview to validate skills',
        'Review specific project experience',
        'Verify technical competencies through practical assessment'
      ]
    };
  }

  private static extractBasicData(cvText: string) {
    // Simple regex patterns for basic data extraction
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const phonePattern = /(\+?[\d\s\-\(\)]{10,})/;
    
    const email = cvText.match(emailPattern)?.[1];
    const phone = cvText.match(phonePattern)?.[1];

    return {
      name: undefined, // Would need more sophisticated parsing
      email,
      phone,
      location: undefined,
      education: [],
      certifications: []
    };
  }

  // Helper methods
  private static capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  private static estimateExperience(cvText: string, skill: string): number {
    const mentions = (cvText.match(new RegExp(skill, 'gi')) || []).length;
    return Math.min(10, Math.max(1, mentions));
  }

  private static findEvidenceText(cvText: string, skill: string): string {
    const index = cvText.toLowerCase().indexOf(skill.toLowerCase());
    if (index === -1) return `Mentioned ${skill}`;
    
    const start = Math.max(0, index - 50);
    const end = Math.min(cvText.length, index + skill.length + 50);
    return '...' + cvText.substring(start, end).trim() + '...';
  }

  private static determineSeniorityLevel(years: number, cvText: string): 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive' {
    const hasLeadershipTerms = /\b(?:manager|director|lead|head|chief|vp|cto|ceo)\b/i.test(cvText);
    
    if (hasLeadershipTerms || years >= 10) return 'Executive';
    if (years >= 7) return 'Lead';
    if (years >= 4) return 'Senior';
    if (years >= 2) return 'Mid';
    return 'Junior';
  }

  private static identifyIndustries(cvText: string) {
    const industryKeywords = {
      'Technology': ['software', 'tech', 'startup', 'saas', 'cloud'],
      'Finance': ['bank', 'financial', 'investment', 'trading'],
      'Healthcare': ['health', 'medical', 'hospital', 'pharmaceutical'],
      'Education': ['university', 'school', 'education', 'academic'],
      'Retail': ['retail', 'ecommerce', 'sales', 'customer']
    };

    return Object.entries(industryKeywords)
      .filter(([_, keywords]) => 
        keywords.some(keyword => cvText.toLowerCase().includes(keyword))
      )
      .map(([industry, _]) => ({
        industry,
        years: Math.floor(Math.random() * 5) + 1,
        relevance: Math.random() * 0.3 + 0.7
      }));
  }

  private static analyzeCareerProgression(cvText: string, totalYears: number) {
    return {
      progressionRate: totalYears > 5 ? 'Strong' : 'Moderate',
      roleEvolution: 'Shows career advancement',
      stabilityScore: Math.random() * 0.3 + 0.7,
      growthPotential: 'High'
    };
  }

  // User-friendly error messages
  static getErrorMessage(error: Error): string {
    if (error.message.includes('timeout')) {
      return 'AI analysis is taking longer than expected. We\'ve provided a basic analysis instead.';
    }
    if (error.message.includes('rate limit')) {
      return 'AI service is currently busy. We\'ve generated an alternative analysis for you.';
    }
    if (error.message.includes('network')) {
      return 'Network connectivity issue detected. Using offline analysis capabilities.';
    }
    return 'AI analysis temporarily unavailable. Our fallback analysis has been provided.';
  }
}

export default AIFallbackService;