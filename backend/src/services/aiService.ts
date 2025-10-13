/**
 * AI-Powered CV Analysis Service
 * 
 * Uses OpenAI GPT-4 for intelligent CV parsing, analysis, and job matching.
 * Integrates with DISC, MBTI, and Numerology assessments for comprehensive profiling.
 */

import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CVAnalysisRequest {
  candidateId: string;
  cvText: string;
  jobPositionId?: string;
  includePersonalityIntegration?: boolean;
}

export interface CVAnalysisResult {
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
  rawAnalysis: string;
}

/**
 * Analyze CV using OpenAI GPT-4
 */
export async function analyzeCVWithAI(request: CVAnalysisRequest): Promise<CVAnalysisResult> {
  try {
    // Get job position details if provided
    let jobContext = '';
    if (request.jobPositionId) {
      const jobPosition = await prisma.jobPosition.findUnique({
        where: { id: request.jobPositionId }
      });
      
      if (jobPosition) {
        jobContext = `
TARGET JOB POSITION:
Title: ${jobPosition.title}
Requirements: ${jobPosition.requirements}
Description: ${jobPosition.description}
`;
      }
    }

    // Get existing personality assessments for integration
    let personalityContext = '';
    if (request.includePersonalityIntegration) {
      const assessments = await prisma.assessment.findMany({
        where: { candidateId: request.candidateId },
        include: {
          discResult: true,
          mbtiResult: true,
          numerologyResult: true
        }
      });

      if (assessments.length > 0) {
        const latest = assessments[0];
        personalityContext = `
EXISTING PERSONALITY ASSESSMENTS:
${latest.discResult ? `DISC Profile: ${latest.discResult.primaryStyle} (D:${latest.discResult.dScore}, I:${latest.discResult.iScore}, S:${latest.discResult.sScore}, C:${latest.discResult.cScore})` : ''}
${latest.mbtiResult ? `MBTI Type: ${latest.mbtiResult.type}` : ''}
${latest.numerologyResult ? `Numerology: Life Path ${latest.numerologyResult.lifePathNumber}, Destiny ${latest.numerologyResult.destinyNumber}` : ''}
`;
      }
    }

    const prompt = `
You are an expert HR analyst with deep expertise in CV analysis, personality psychology, and job matching. Analyze the following CV comprehensively and provide structured insights.

${jobContext}
${personalityContext}

CV TO ANALYZE:
${request.cvText}

Please provide a comprehensive analysis in the following JSON format:
{
  "candidateInfo": {
    "name": "Full name extracted from CV",
    "email": "Email if found",
    "phone": "Phone if found", 
    "location": "Location if found",
    "summary": "Professional summary in your own words"
  },
  "experience": {
    "totalYears": "Total years of professional experience (number)",
    "positions": [
      {
        "title": "Job title",
        "company": "Company name",
        "duration": "Time period",
        "responsibilities": ["Key responsibility 1", "Key responsibility 2"],
        "achievements": ["Achievement 1", "Achievement 2"]
      }
    ],
    "industries": ["Industry 1", "Industry 2"],
    "skillsProgression": ["How skills have evolved over time"]
  },
  "education": {
    "degrees": [
      {
        "degree": "Degree type and field",
        "institution": "Institution name", 
        "year": "Graduation year if available",
        "gpa": "GPA if mentioned"
      }
    ],
    "certifications": ["Certification 1", "Certification 2"],
    "continuingEducation": ["Training programs", "Workshops"]
  },
  "skills": {
    "technical": [
      {
        "skill": "Skill name",
        "proficiency": "Beginner|Intermediate|Advanced|Expert",
        "yearsExperience": "Years if determinable"
      }
    ],
    "soft": ["Communication", "Leadership", "etc"],
    "languages": [
      {
        "language": "Language name",
        "proficiency": "Proficiency level"
      }
    ]
  },
  "achievements": {
    "awards": ["Award 1", "Award 2"],
    "publications": ["Publication 1", "Publication 2"],
    "projects": ["Notable project 1", "Notable project 2"],
    "leadership": ["Leadership experience 1", "Leadership experience 2"]
  },
  ${request.jobPositionId ? `
  "jobCompatibility": {
    "overallScore": "Score from 0-100",
    "skillsMatch": "Score from 0-100",
    "experienceMatch": "Score from 0-100", 
    "educationMatch": "Score from 0-100",
    "culturalFit": "Score from 0-100",
    "growthPotential": "Score from 0-100",
    "recommendations": ["Why they would be good for this role"],
    "gaps": ["Areas where they might need development"]
  },` : ''}
  ${request.includePersonalityIntegration && personalityContext ? `
  "personalityIntegration": {
    "discAlignment": "How their DISC profile aligns with the role and CV content",
    "mbtiSynergy": "How their MBTI type complements their professional experience",
    "numerologyInsights": "How numerology numbers reflect in their career choices",
    "holisticProfile": "Integrated view of personality and professional background"
  },` : ''}
  "aiInsights": {
    "strengths": ["Top strength 1", "Top strength 2", "Top strength 3"],
    "areasForImprovement": ["Area 1", "Area 2"],
    "careerTrajectory": "Analysis of their career progression and direction",
    "recommendedRoles": ["Role type 1", "Role type 2"],
    "developmentSuggestions": ["Suggestion 1", "Suggestion 2"]
  }
}

Provide ONLY the JSON response, no additional text.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR analyst specializing in CV analysis and job matching. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    const analysisText = response.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let analysis: any;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', analysisText);
      throw new Error('Invalid JSON response from AI analysis');
    }

    // Add raw analysis for debugging
    analysis.rawAnalysis = analysisText;

    return analysis as CVAnalysisResult;

  } catch (error) {
    console.error('Error in AI CV analysis:', error);
    throw error;
  }
}

/**
 * Save CV analysis results to database
 */
export async function saveCVAnalysis(
  assessmentId: string, 
  analysisResult: CVAnalysisResult,
  originalCVText: string
): Promise<string> {
  try {
    const cvAnalysis = await prisma.cVAnalysis.create({
      data: {
        assessmentId,
        skills: JSON.stringify(analysisResult.skills),
        experience: JSON.stringify(analysisResult.experience),
        education: JSON.stringify(analysisResult.education),
        behavioralIndicators: JSON.stringify(analysisResult.aiInsights),
        keywordMatches: JSON.stringify(analysisResult.jobCompatibility || {}),
        aiSummary: analysisResult.candidateInfo.summary
      }
    });

    return cvAnalysis.id;
  } catch (error) {
    console.error('Error saving CV analysis:', error);
    throw error;
  }
}

/**
 * Get CV analysis by assessment ID
 */
export async function getCVAnalysis(assessmentId: string) {
  try {
    const analysis = await prisma.cVAnalysis.findUnique({
      where: { assessmentId },
      include: {
        assessment: {
          include: {
            candidate: true
          }
        }
      }
    });

    if (!analysis) {
      return null;
    }

    // Parse JSON fields
    const parsedAnalysis = {
      ...analysis,
      skillsData: JSON.parse(analysis.skills || '{}'),
      experienceData: JSON.parse(analysis.experience || '{}'),
      educationData: JSON.parse(analysis.education || '{}'),
      behavioralData: JSON.parse(analysis.behavioralIndicators || '{}'),
      compatibilityData: JSON.parse(analysis.keywordMatches || '{}')
    };

    return parsedAnalysis;
  } catch (error) {
    console.error('Error retrieving CV analysis:', error);
    throw error;
  }
}

/**
 * Enhanced job matching with AI insights
 */
export async function calculateAIJobCompatibility(
  assessmentId: string,
  jobPositionId: string
): Promise<any> {
  try {
    const cvAnalysis = await getCVAnalysis(assessmentId);
    if (!cvAnalysis) {
      throw new Error('No CV analysis found for assessment');
    }

    const jobPosition = await prisma.jobPosition.findUnique({
      where: { id: jobPositionId }
    });

    if (!jobPosition) {
      throw new Error('Job position not found');
    }

    // Use AI to provide enhanced compatibility analysis
    const prompt = `
As an expert HR analyst, provide an enhanced job compatibility analysis.

CANDIDATE PROFILE:
Skills: ${JSON.stringify(cvAnalysis.skillsData, null, 2)}
Experience: ${JSON.stringify(cvAnalysis.experienceData, null, 2)}
Education: ${JSON.stringify(cvAnalysis.educationData, null, 2)}
Behavioral Indicators: ${JSON.stringify(cvAnalysis.behavioralData, null, 2)}

TARGET JOB:
Title: ${jobPosition.title}
Requirements: ${jobPosition.requirements}
Description: ${jobPosition.description}

Provide detailed compatibility analysis in JSON format:
{
  "overallCompatibility": "Score 0-100",
  "strengthsAlignment": ["How candidate strengths align with role"],
  "skillsGap": ["Skills candidate needs to develop"],
  "culturalFit": "Assessment of cultural alignment",
  "growthPotential": "Potential for growth in this role",
  "riskFactors": ["Potential challenges or risks"],
  "recommendations": ["Specific hiring recommendations"],
  "interviewFocus": ["Key areas to explore in interviews"]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system', 
          content: 'You are an expert HR analyst. Respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const analysisText = response.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(analysisText);

  } catch (error) {
    console.error('Error in AI job compatibility analysis:', error);
    throw error;
  }
}

export default {
  analyzeCVWithAI,
  saveCVAnalysis,
  getCVAnalysis,
  calculateAIJobCompatibility
};