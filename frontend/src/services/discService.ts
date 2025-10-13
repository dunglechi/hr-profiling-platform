/**
 * DISC Assessment Frontend Service
 * 
 * Service for handling DISC assessment API calls from the frontend
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface DISCQuestion {
  id: number;
  text: string;
  dimension: 'D' | 'I' | 'S' | 'C';
}

export interface DISCResponse {
  questionId: number;
  mostLike: boolean;
  leastLike: boolean;
  neutral: boolean;
}

export interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DISCResult {
  id: string;
  scores: DISCScores;
  primaryStyle: string;
  secondaryStyle?: string;
  intensity: 'High' | 'Moderate' | 'Low';
  analysis: {
    strengths: string[];
    challenges: string[];
    communication: string;
    motivation: string;
    workEnvironment: string;
    leadership: string;
    decisionMaking: string;
    stressResponse: string;
  };
  behavioralTraits: {
    natural: string[];
    adapted: string[];
  };
  compatibility: {
    worksWith: string[];
    challengesWith: string[];
  };
  assessmentId: string;
  createdAt?: string;
}

export interface DISCInstructions {
  title: string;
  description: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  timeEstimate: string;
  tips: string[];
}

export interface DISCQuestionsResponse {
  success: boolean;
  data: {
    questions: DISCQuestion[];
    totalQuestions: number;
    instructions: DISCInstructions;
  };
  error?: string;
}

export interface DISCSubmitResponse {
  success: boolean;
  data?: DISCResult;
  error?: string;
  details?: string[];
}

/**
 * Fetch DISC assessment questions
 */
export async function fetchDISCQuestions(): Promise<DISCQuestionsResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/disc/questions`, {
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
    console.error('Error fetching DISC questions:', error);
    return {
      success: false,
      data: {
        questions: [],
        totalQuestions: 0,
        instructions: {
          title: '',
          description: '',
          options: [],
          timeEstimate: '',
          tips: []
        }
      },
      error: error instanceof Error ? error.message : 'Failed to fetch DISC questions'
    };
  }
}

/**
 * Submit DISC assessment responses
 */
export async function submitDISCAssessment(
  assessmentId: string,
  responses: DISCResponse[]
): Promise<DISCSubmitResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/disc/submit`, {
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
    console.error('Error submitting DISC assessment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit DISC assessment'
    };
  }
}

/**
 * Fetch DISC results for an assessment
 */
export async function fetchDISCResults(assessmentId: string): Promise<DISCSubmitResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/disc/results/${assessmentId}`, {
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
    console.error('Error fetching DISC results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch DISC results'
    };
  }
}

/**
 * Calculate DISC compatibility with job position
 */
export async function calculateDISCCompatibility(
  assessmentId: string,
  jobPositionId: string
): Promise<any> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/disc/compatibility/${assessmentId}/${jobPositionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calculating DISC compatibility:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate DISC compatibility'
    };
  }
}

/**
 * Validate DISC responses on frontend
 */
export function validateDISCResponses(responses: DISCResponse[]): { 
  isValid: boolean; 
  errors: string[];
  progress: number;
} {
  const errors: string[] = [];
  let completedQuestions = 0;

  // Check if all 28 questions are answered
  for (let i = 1; i <= 28; i++) {
    const response = responses.find(r => r.questionId === i);
    if (response) {
      // Check if exactly one option is selected
      const selectedCount = [response.mostLike, response.leastLike, response.neutral]
        .filter(Boolean).length;
      
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

  const progress = Math.round((completedQuestions / 28) * 100);

  return {
    isValid: errors.length === 0 && completedQuestions === 28,
    errors,
    progress
  };
}

/**
 * Get DISC style color for UI
 */
export function getDISCStyleColor(style: string): string {
  const colors = {
    D: '#FF6B6B', // Red - Dominance
    I: '#4ECDC4', // Teal - Influence  
    S: '#45B7D1', // Blue - Steadiness
    C: '#96CEB4'  // Green - Conscientiousness
  };
  return colors[style as keyof typeof colors] || '#757575';
}

/**
 * Get DISC style description
 */
export function getDISCStyleDescription(style: string): string {
  const descriptions = {
    D: 'Dominance - Direct, Results-Oriented, Decisive',
    I: 'Influence - Enthusiastic, Social, Persuasive',
    S: 'Steadiness - Patient, Loyal, Consistent',
    C: 'Conscientiousness - Analytical, Precise, Systematic'
  };
  return descriptions[style as keyof typeof descriptions] || 'Unknown Style';
}

/**
 * Format DISC score for display
 */
export function formatDISCScore(score: number): string {
  if (score >= 80) return 'Very High';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Low';
  return 'Very Low';
}

/**
 * Create sample assessment for testing (development only)
 */
export function createSampleAssessment(): { assessmentId: string } {
  // In a real application, this would create an actual assessment
  // For now, return a mock ID for testing
  return {
    assessmentId: 'sample-assessment-' + Date.now()
  };
}