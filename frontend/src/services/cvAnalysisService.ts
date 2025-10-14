// AI-powered CV Analysis Service
// Integrates with OpenAI for comprehensive resume analysis

export interface CVAnalysisRequest {
  cvText: string;
  jobPosition?: string;
  analysisType: 'skills' | 'experience' | 'behavioral' | 'comprehensive';
}

export interface CVAnalysisResult {
  skills: {
    technical: SkillAnalysis[];
    soft: SkillAnalysis[];
    leadership: SkillAnalysis[];
  };
  experience: {
    totalYears: number;
    seniorityLevel: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
    industryExperience: IndustryExperience[];
    careerProgression: CareerProgression;
  };
  behavioral: {
    communicationStyle: BehavioralIndicator;
    leadershipPotential: BehavioralIndicator;
    teamCollaboration: BehavioralIndicator;
    problemSolving: BehavioralIndicator;
    adaptability: BehavioralIndicator;
  };
  fitAnalysis: {
    overallScore: number;
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  extractedData: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    education: EducationEntry[];
    certifications: string[];
  };
}

interface SkillAnalysis {
  skill: string;
  proficiencyLevel: 1 | 2 | 3 | 4 | 5;
  yearsOfExperience: number;
  evidenceText: string;
  relevanceScore: number;
}

interface IndustryExperience {
  industry: string;
  yearsInIndustry: number;
  roles: string[];
  relevanceToPosition: number;
}

interface CareerProgression {
  trajectory: 'Ascending' | 'Lateral' | 'Declining' | 'Mixed';
  progressionRate: 'Fast' | 'Normal' | 'Slow';
  leadershipGrowth: boolean;
  roleComplexityIncrease: boolean;
}

interface BehavioralIndicator {
  score: number; // 1-10
  confidence: number; // 1-100%
  evidencePoints: string[];
  reasoning: string;
}

interface EducationEntry {
  degree: string;
  institution: string;
  year?: number;
  relevanceScore: number;
}

// OpenAI Integration Service
class CVAnalysisService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured. CV analysis will use mock data.');
    }
  }

  // Main analysis method
  async analyzCV(request: CVAnalysisRequest): Promise<CVAnalysisResult> {
    try {
      if (!this.apiKey) {
        return this.getMockAnalysis(request);
      }

      const prompt = this.buildAnalysisPrompt(request);
      const response = await this.callOpenAI(prompt);
      return this.parseOpenAIResponse(response);
      
    } catch (error) {
      console.error('CV Analysis error:', error);
      // Fallback to mock analysis
      return this.getMockAnalysis(request);
    }
  }

  // Build comprehensive analysis prompt
  private buildAnalysisPrompt(request: CVAnalysisRequest): string {
    const { cvText, jobPosition } = request;
    
    const basePrompt = `
You are an expert HR analyst with 15+ years of experience in talent assessment. Analyze the following CV and provide a comprehensive evaluation.

CV TEXT:
${cvText}

${jobPosition ? `TARGET POSITION: ${jobPosition}` : ''}

ANALYSIS REQUIREMENTS:
Provide a detailed JSON response with the following structure:

{
  "skills": {
    "technical": [
      {
        "skill": "skill name",
        "proficiencyLevel": 1-5,
        "yearsOfExperience": number,
        "evidenceText": "specific evidence from CV",
        "relevanceScore": 1-10
      }
    ],
    "soft": [...],
    "leadership": [...]
  },
  "experience": {
    "totalYears": number,
    "seniorityLevel": "Junior|Mid|Senior|Lead|Executive",
    "industryExperience": [
      {
        "industry": "industry name",
        "yearsInIndustry": number,
        "roles": ["role1", "role2"],
        "relevanceToPosition": 1-10
      }
    ],
    "careerProgression": {
      "trajectory": "Ascending|Lateral|Declining|Mixed",
      "progressionRate": "Fast|Normal|Slow",
      "leadershipGrowth": true/false,
      "roleComplexityIncrease": true/false
    }
  },
  "behavioral": {
    "communicationStyle": {
      "score": 1-10,
      "confidence": 1-100,
      "evidencePoints": ["evidence1", "evidence2"],
      "reasoning": "detailed explanation"
    },
    "leadershipPotential": {...},
    "teamCollaboration": {...},
    "problemSolving": {...},
    "adaptability": {...}
  },
  "fitAnalysis": {
    "overallScore": 1-100,
    "strengths": ["strength1", "strength2"],
    "concerns": ["concern1", "concern2"],
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "extractedData": {
    "name": "extracted name",
    "email": "extracted email",
    "phone": "extracted phone",
    "location": "extracted location",
    "education": [
      {
        "degree": "degree name",
        "institution": "institution name",
        "year": year,
        "relevanceScore": 1-10
      }
    ],
    "certifications": ["cert1", "cert2"]
  }
}

ANALYSIS FOCUS:
- Extract specific evidence for all assessments
- Provide quantitative scores where possible
- Consider cultural context (Vietnamese market)
- Focus on job-relevant skills and experience
- Identify potential red flags or concerns
- Suggest actionable improvements

RESPONSE FORMAT: Valid JSON only, no additional text.
`;

    return basePrompt;
  }

  // Call OpenAI API
  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst specializing in comprehensive CV analysis. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Parse OpenAI response
  private parseOpenAIResponse(response: string): CVAnalysisResult {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from AI analysis');
    }
  }

  // Mock analysis for development/fallback
  private getMockAnalysis(_request: CVAnalysisRequest): CVAnalysisResult {
    return {
      skills: {
        technical: [
          {
            skill: 'JavaScript',
            proficiencyLevel: 4,
            yearsOfExperience: 3,
            evidenceText: 'Developed multiple React applications',
            relevanceScore: 9
          },
          {
            skill: 'Python',
            proficiencyLevel: 3,
            yearsOfExperience: 2,
            evidenceText: 'Built data analysis scripts',
            relevanceScore: 7
          }
        ],
        soft: [
          {
            skill: 'Communication',
            proficiencyLevel: 4,
            yearsOfExperience: 5,
            evidenceText: 'Led team meetings and presentations',
            relevanceScore: 8
          }
        ],
        leadership: [
          {
            skill: 'Team Leadership',
            proficiencyLevel: 3,
            yearsOfExperience: 2,
            evidenceText: 'Managed team of 3 developers',
            relevanceScore: 8
          }
        ]
      },
      experience: {
        totalYears: 5,
        seniorityLevel: 'Mid',
        industryExperience: [
          {
            industry: 'Technology',
            yearsInIndustry: 5,
            roles: ['Software Developer', 'Senior Developer'],
            relevanceToPosition: 9
          }
        ],
        careerProgression: {
          trajectory: 'Ascending',
          progressionRate: 'Normal',
          leadershipGrowth: true,
          roleComplexityIncrease: true
        }
      },
      behavioral: {
        communicationStyle: {
          score: 8,
          confidence: 85,
          evidencePoints: ['Presentation experience', 'Team collaboration'],
          reasoning: 'Strong evidence of communication through leadership roles'
        },
        leadershipPotential: {
          score: 7,
          confidence: 75,
          evidencePoints: ['Team management experience', 'Project ownership'],
          reasoning: 'Demonstrated leadership capabilities with room for growth'
        },
        teamCollaboration: {
          score: 8,
          confidence: 80,
          evidencePoints: ['Cross-functional projects', 'Mentoring experience'],
          reasoning: 'Strong collaborative working style evident'
        },
        problemSolving: {
          score: 8,
          confidence: 85,
          evidencePoints: ['Complex technical solutions', 'Process improvements'],
          reasoning: 'Excellent problem-solving demonstrated through technical achievements'
        },
        adaptability: {
          score: 7,
          confidence: 70,
          evidencePoints: ['Technology transitions', 'Role changes'],
          reasoning: 'Good adaptability shown through career progression'
        }
      },
      fitAnalysis: {
        overallScore: 82,
        strengths: [
          'Strong technical foundation',
          'Leadership experience',
          'Good communication skills',
          'Ascending career trajectory'
        ],
        concerns: [
          'Limited experience in specific domain',
          'Could benefit from more senior-level exposure'
        ],
        recommendations: [
          'Consider leadership development program',
          'Provide mentorship for domain-specific knowledge',
          'Assign challenging technical projects'
        ]
      },
      extractedData: {
        name: 'Nguyen Van An',
        email: 'nguyen.an@email.com',
        phone: '+84 123 456 789',
        location: 'Ho Chi Minh City, Vietnam',
        education: [
          {
            degree: 'Bachelor of Computer Science',
            institution: 'Ho Chi Minh University of Technology',
            year: 2019,
            relevanceScore: 9
          }
        ],
        certifications: [
          'AWS Certified Developer',
          'Scrum Master Certified'
        ]
      }
    };
  }

  // Quick skill extraction only
  async extractSkills(cvText: string): Promise<SkillAnalysis[]> {
    const result = await this.analyzCV({
      cvText,
      analysisType: 'skills'
    });
    
    return [
      ...result.skills.technical,
      ...result.skills.soft,
      ...result.skills.leadership
    ];
  }

  // Experience level assessment
  async assessExperience(cvText: string): Promise<{
    level: string;
    years: number;
    suitability: number;
  }> {
    const result = await this.analyzCV({
      cvText,
      analysisType: 'experience'
    });

    return {
      level: result.experience.seniorityLevel,
      years: result.experience.totalYears,
      suitability: result.fitAnalysis.overallScore
    };
  }
}

// Export singleton instance
export const cvAnalysisService = new CVAnalysisService();
export default cvAnalysisService;