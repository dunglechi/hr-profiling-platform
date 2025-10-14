/**
 * MBTI Assessment Frontend Service
 * 
 * Service for handling MBTI assessment API calls from the frontend
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface MBTIQuestion {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
}

export interface MBTIResponse {
  questionId: number;
  stronglyAgree: boolean;
  agree: boolean;
  neutral: boolean;
  disagree: boolean;
  stronglyDisagree: boolean;
}

export interface MBTIScores {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

export interface CognitiveFunctions {
  dominant: string;
  auxiliary: string;
  tertiary: string;
  inferior: string;
}

export interface MBTIResult {
  id: string;
  type: string;
  scores: MBTIScores;
  cognitiveFunctions: CognitiveFunctions;
  analysis: {
    overview: string;
    strengths: string[];
    challenges: string[];
    workPreferences: string;
    communicationStyle: string;
    leadershipStyle: string;
    decisionMaking: string;
    stressResponse: string;
    careerFit: string[];
    teamRole: string;
  };
  relationships: {
    romantic: string[];
    friendship: string[];
    workCollaboration: string[];
  };
  development: {
    growthAreas: string[];
    recommendations: string[];
  };
  assessmentId: string;
  createdAt?: string;
}

export interface MBTIInstructions {
  title: string;
  description: string;
  dimensions: Array<{
    code: string;
    name: string;
    description: string;
  }>;
  options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  timeEstimate: string;
  tips: string[];
}

export interface MBTIQuestionsResponse {
  success: boolean;
  data: {
    questions: MBTIQuestion[];
    totalQuestions: number;
    instructions: MBTIInstructions;
  };
  error?: string;
}

export interface MBTISubmitResponse {
  success: boolean;
  data?: MBTIResult;
  error?: string;
  details?: string[];
}

export interface MBTIType {
  code: string;
  name: string;
  category: string;
}

export interface MBTITypesResponse {
  success: boolean;
  data: {
    types: MBTIType[];
    categories: Record<string, {
      description: string;
      color: string;
    }>;
  };
  error?: string;
}

/**
 * Fetch MBTI assessment questions
 */
export async function fetchMBTIQuestions(): Promise<MBTIQuestionsResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/mbti/questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching MBTI questions:', error);
    return {
      success: false,
      data: {
        questions: [],
        totalQuestions: 0,
        instructions: {
          title: '',
          description: '',
          dimensions: [],
          options: [],
          timeEstimate: '',
          tips: []
        }
      },
      error: error instanceof Error ? error.message : 'Failed to fetch MBTI questions'
    };
  }
}

/**
 * Submit MBTI assessment responses
 */
export async function submitMBTIAssessment(
  assessmentId: string,
  responses: MBTIResponse[]
): Promise<MBTISubmitResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/mbti/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessmentId,
        responses
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`,
        details: errorData.details
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting MBTI assessment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit MBTI assessment'
    };
  }
}

/**
 * Fetch MBTI results for an assessment
 */
export async function fetchMBTIResults(assessmentId: string): Promise<MBTISubmitResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/mbti/results/${assessmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching MBTI results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch MBTI results'
    };
  }
}

/**
 * Fetch all MBTI types information
 */
export async function fetchMBTITypes(): Promise<MBTITypesResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/mbti/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching MBTI types:', error);
    return {
      success: false,
      data: {
        types: [],
        categories: {}
      },
      error: error instanceof Error ? error.message : 'Failed to fetch MBTI types'
    };
  }
}

/**
 * Validate MBTI responses on frontend
 */
export function validateMBTIResponses(responses: MBTIResponse[]): { 
  isValid: boolean; 
  errors: string[];
  progress: number;
} {
  const errors: string[] = [];
  let completedQuestions = 0;

  // Check if all 60 questions are answered
  for (let i = 1; i <= 60; i++) {
    const response = responses.find(r => r.questionId === i);
    if (response) {
      // Check if exactly one option is selected
      const selectedCount = [
        response.stronglyAgree,
        response.agree,
        response.neutral,
        response.disagree,
        response.stronglyDisagree
      ].filter(Boolean).length;
      
      if (selectedCount === 1) {
        completedQuestions++;
      } else if (selectedCount === 0) {
        errors.push(`Question ${i}: Please select an option`);
      } else {
        errors.push(`Question ${i}: Please select only one option`);
      }
    } else {
      errors.push(`Question ${i}: No response provided`);
    }
  }

  const progress = Math.round((completedQuestions / 60) * 100);

  return {
    isValid: errors.length === 0 && completedQuestions === 60,
    errors,
    progress
  };
}

/**
 * Get MBTI type color for UI
 */
export function getMBTITypeColor(type: string): string {
  const category = getMBTITypeCategory(type);
  const colors = {
    'Analyst': '#6B73FF',
    'Diplomat': '#16A085', 
    'Sentinel': '#F39C12',
    'Explorer': '#E74C3C'
  };
  return colors[category as keyof typeof colors] || '#757575';
}

/**
 * Get MBTI type category
 */
export function getMBTITypeCategory(type: string): string {
  if (!type || type.length !== 4) return 'Unknown';
  
  const isNT = type.includes('N') && type.includes('T');
  const isNF = type.includes('N') && type.includes('F');
  const isSJ = type.includes('S') && type.includes('J');
  const isSP = type.includes('S') && type.includes('P');
  
  if (isNT) return 'Analyst';
  if (isNF) return 'Diplomat';
  if (isSJ) return 'Sentinel';
  if (isSP) return 'Explorer';
  
  return 'Unknown';
}

/**
 * Get MBTI type description
 */
export function getMBTITypeDescription(type: string): string {
  const descriptions = {
    'ENFP': 'The Campaigner - Enthusiastic, creative, and sociable free spirits',
    'INFP': 'The Mediator - Poetic, kind, and altruistic people',
    'ENFJ': 'The Protagonist - Charismatic and inspiring leaders',
    'INFJ': 'The Advocate - Creative and insightful idealists',
    'ENTP': 'The Debater - Smart and curious thinkers who love intellectual challenges',
    'INTP': 'The Thinker - Innovative inventors with an unquenchable thirst for knowledge',
    'ENTJ': 'The Commander - Bold, imaginative, and strong-willed leaders',
    'INTJ': 'The Architect - Imaginative and strategic thinkers with a plan for everything',
    'ESFP': 'The Entertainer - Spontaneous, energetic, and enthusiastic entertainers',
    'ISFP': 'The Adventurer - Flexible and charming artists ready to explore new possibilities',
    'ESTP': 'The Entrepreneur - Smart, energetic, and perceptive negotiators',
    'ISTP': 'The Virtuoso - Bold and practical experimenters and masters of tools',
    'ESFJ': 'The Consul - Extraordinarily caring, social, and popular people',
    'ISFJ': 'The Protector - Warm-hearted and dedicated protectors',
    'ESTJ': 'The Executive - Excellent administrators, unsurpassed at managing people',
    'ISTJ': 'The Logistician - Practical and fact-minded, reliable achievers'
  };
  return descriptions[type as keyof typeof descriptions] || 'Unknown Type';
}

/**
 * Format dimension preference for display
 */
export function formatDimensionPreference(scores: MBTIScores, dimension: 'EI' | 'SN' | 'TF' | 'JP'): string {
  const [first, second] = dimension.split('') as [keyof MBTIScores, keyof MBTIScores];
  const firstScore = scores[first];
  const secondScore = scores[second];
  
  if (firstScore > secondScore) {
    const strength = firstScore > 70 ? 'Strong' : firstScore > 55 ? 'Moderate' : 'Slight';
    return `${strength} ${first}`;
  } else {
    const strength = secondScore > 70 ? 'Strong' : secondScore > 55 ? 'Moderate' : 'Slight';
    return `${strength} ${second}`;
  }
}

/**
 * Create sample assessment for testing (development only)
 */
export function createSampleMBTIAssessment(): { assessmentId: string } {
  // In a real application, this would create an actual assessment
  // For now, return a mock ID for testing
  return {
    assessmentId: 'sample-mbti-assessment-' + Date.now()
  };
}