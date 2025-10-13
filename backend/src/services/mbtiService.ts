/**
 * MBTI Assessment Service
 * 
 * Implementation of Myers-Briggs Type Indicator assessment based on Carl Jung's 
 * psychological types and expanded by Katherine Briggs and Isabel Briggs Myers.
 * 
 * MBTI Dimensions:
 * - E/I (Extraversion/Introversion): Where you focus your attention
 * - S/N (Sensing/Intuition): How you take in information
 * - T/F (Thinking/Feeling): How you make decisions
 * - J/P (Judging/Perceiving): How you deal with the world
 */

export interface MBTIQuestion {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  direction: 'positive' | 'negative'; // positive = first letter, negative = second letter
  weight: number; // 1-3 for question importance
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
  E: number;  // Extraversion score (0-100)
  I: number;  // Introversion score (0-100)
  S: number;  // Sensing score (0-100)
  N: number;  // Intuition score (0-100)
  T: number;  // Thinking score (0-100)
  F: number;  // Feeling score (0-100)
  J: number;  // Judging score (0-100)
  P: number;  // Perceiving score (0-100)
}

export interface CognitiveFunctions {
  dominant: string;
  auxiliary: string;
  tertiary: string;
  inferior: string;
}

export interface MBTIResult {
  type: string; // e.g., "ENFP"
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
}

/**
 * MBTI Assessment Questions (60 questions total)
 * Based on validated psychometric instruments
 */
export const MBTI_QUESTIONS: MBTIQuestion[] = [
  // Extraversion/Introversion Questions (15 questions)
  { id: 1, text: "I enjoy being the center of attention at social gatherings", dimension: 'EI', direction: 'positive', weight: 3 },
  { id: 2, text: "I prefer working in teams rather than alone", dimension: 'EI', direction: 'positive', weight: 2 },
  { id: 3, text: "I feel energized after spending time with large groups of people", dimension: 'EI', direction: 'positive', weight: 3 },
  { id: 4, text: "I think out loud and process ideas by talking about them", dimension: 'EI', direction: 'positive', weight: 2 },
  { id: 5, text: "I need quiet time alone to recharge my energy", dimension: 'EI', direction: 'negative', weight: 3 },
  { id: 6, text: "I prefer deep conversations with a few close friends", dimension: 'EI', direction: 'negative', weight: 2 },
  { id: 7, text: "I often feel drained after social events", dimension: 'EI', direction: 'negative', weight: 2 },
  { id: 8, text: "I make friends easily and quickly", dimension: 'EI', direction: 'positive', weight: 2 },
  { id: 9, text: "I prefer to observe before participating in new situations", dimension: 'EI', direction: 'negative', weight: 2 },
  { id: 10, text: "I am comfortable initiating conversations with strangers", dimension: 'EI', direction: 'positive', weight: 2 },
  { id: 11, text: "I prefer written communication over verbal communication", dimension: 'EI', direction: 'negative', weight: 1 },
  { id: 12, text: "I enjoy networking events and meeting new people", dimension: 'EI', direction: 'positive', weight: 2 },
  { id: 13, text: "I need time to think before responding to questions", dimension: 'EI', direction: 'negative', weight: 2 },
  { id: 14, text: "I feel comfortable speaking up in large group discussions", dimension: 'EI', direction: 'positive', weight: 2 },
  { id: 15, text: "I prefer having a few close relationships rather than many acquaintances", dimension: 'EI', direction: 'negative', weight: 2 },

  // Sensing/Intuition Questions (15 questions)
  { id: 16, text: "I focus on concrete facts and details rather than abstract concepts", dimension: 'SN', direction: 'positive', weight: 3 },
  { id: 17, text: "I prefer step-by-step instructions and clear procedures", dimension: 'SN', direction: 'positive', weight: 2 },
  { id: 18, text: "I trust my past experience more than theoretical possibilities", dimension: 'SN', direction: 'positive', weight: 2 },
  { id: 19, text: "I enjoy exploring new ideas and future possibilities", dimension: 'SN', direction: 'negative', weight: 3 },
  { id: 20, text: "I prefer practical, hands-on learning approaches", dimension: 'SN', direction: 'positive', weight: 2 },
  { id: 21, text: "I often see patterns and connections that others miss", dimension: 'SN', direction: 'negative', weight: 3 },
  { id: 22, text: "I focus on what is rather than what could be", dimension: 'SN', direction: 'positive', weight: 2 },
  { id: 23, text: "I enjoy brainstorming and generating new concepts", dimension: 'SN', direction: 'negative', weight: 2 },
  { id: 24, text: "I prefer concrete examples over theoretical explanations", dimension: 'SN', direction: 'positive', weight: 2 },
  { id: 25, text: "I often get insights and hunches about situations", dimension: 'SN', direction: 'negative', weight: 2 },
  { id: 26, text: "I notice details that others often overlook", dimension: 'SN', direction: 'positive', weight: 2 },
  { id: 27, text: "I enjoy exploring innovative solutions to problems", dimension: 'SN', direction: 'negative', weight: 2 },
  { id: 28, text: "I prefer realistic and achievable goals", dimension: 'SN', direction: 'positive', weight: 2 },
  { id: 29, text: "I often think about future implications and possibilities", dimension: 'SN', direction: 'negative', weight: 2 },
  { id: 30, text: "I value precision and accuracy in my work", dimension: 'SN', direction: 'positive', weight: 2 },

  // Thinking/Feeling Questions (15 questions)
  { id: 31, text: "I make decisions based on logical analysis rather than personal values", dimension: 'TF', direction: 'positive', weight: 3 },
  { id: 32, text: "I prioritize objective facts over personal feelings when solving problems", dimension: 'TF', direction: 'positive', weight: 3 },
  { id: 33, text: "I consider how decisions will affect people's feelings", dimension: 'TF', direction: 'negative', weight: 3 },
  { id: 34, text: "I prefer to maintain harmony and avoid conflict", dimension: 'TF', direction: 'negative', weight: 2 },
  { id: 35, text: "I critique ideas and look for flaws in reasoning", dimension: 'TF', direction: 'positive', weight: 2 },
  { id: 36, text: "I make decisions based on what feels right to me", dimension: 'TF', direction: 'negative', weight: 2 },
  { id: 37, text: "I value competence and achievement over personal relationships", dimension: 'TF', direction: 'positive', weight: 2 },
  { id: 38, text: "I am motivated by helping others and making a positive impact", dimension: 'TF', direction: 'negative', weight: 2 },
  { id: 39, text: "I can make tough decisions even if they hurt people's feelings", dimension: 'TF', direction: 'positive', weight: 2 },
  { id: 40, text: "I seek consensus and agreement before making decisions", dimension: 'TF', direction: 'negative', weight: 2 },
  { id: 41, text: "I focus on fairness and justice in decision-making", dimension: 'TF', direction: 'positive', weight: 2 },
  { id: 42, text: "I consider the personal impact of decisions on individuals", dimension: 'TF', direction: 'negative', weight: 2 },
  { id: 43, text: "I prefer clear, direct feedback even if it's critical", dimension: 'TF', direction: 'positive', weight: 1 },
  { id: 44, text: "I value empathy and understanding in relationships", dimension: 'TF', direction: 'negative', weight: 2 },
  { id: 45, text: "I analyze pros and cons before making important decisions", dimension: 'TF', direction: 'positive', weight: 2 },

  // Judging/Perceiving Questions (15 questions)
  { id: 46, text: "I prefer planned and organized approaches to work", dimension: 'JP', direction: 'positive', weight: 3 },
  { id: 47, text: "I like to have closure and finalize decisions quickly", dimension: 'JP', direction: 'positive', weight: 2 },
  { id: 48, text: "I work best with deadlines and clear timelines", dimension: 'JP', direction: 'positive', weight: 2 },
  { id: 49, text: "I prefer to keep my options open and adapt as needed", dimension: 'JP', direction: 'negative', weight: 3 },
  { id: 50, text: "I like to have a structured schedule and stick to it", dimension: 'JP', direction: 'positive', weight: 2 },
  { id: 51, text: "I enjoy spontaneous activities and last-minute changes", dimension: 'JP', direction: 'negative', weight: 2 },
  { id: 52, text: "I prefer to complete tasks well before deadlines", dimension: 'JP', direction: 'positive', weight: 2 },
  { id: 53, text: "I work well under pressure and tight deadlines", dimension: 'JP', direction: 'negative', weight: 2 },
  { id: 54, text: "I like to make lists and follow organized systems", dimension: 'JP', direction: 'positive', weight: 2 },
  { id: 55, text: "I prefer flexible work arrangements and variety", dimension: 'JP', direction: 'negative', weight: 2 },
  { id: 56, text: "I feel uncomfortable with unfinished projects", dimension: 'JP', direction: 'positive', weight: 2 },
  { id: 57, text: "I adapt easily to changing circumstances", dimension: 'JP', direction: 'negative', weight: 2 },
  { id: 58, text: "I prefer to plan ahead and prepare for contingencies", dimension: 'JP', direction: 'positive', weight: 2 },
  { id: 59, text: "I enjoy exploring multiple options before deciding", dimension: 'JP', direction: 'negative', weight: 2 },
  { id: 60, text: "I like to have clear goals and milestones", dimension: 'JP', direction: 'positive', weight: 2 }
];

/**
 * MBTI Cognitive Functions mapping
 */
const COGNITIVE_FUNCTIONS: Record<string, CognitiveFunctions> = {
  'ENFP': { dominant: 'Extraverted Intuition (Ne)', auxiliary: 'Introverted Feeling (Fi)', tertiary: 'Extraverted Thinking (Te)', inferior: 'Introverted Sensing (Si)' },
  'INFP': { dominant: 'Introverted Feeling (Fi)', auxiliary: 'Extraverted Intuition (Ne)', tertiary: 'Introverted Sensing (Si)', inferior: 'Extraverted Thinking (Te)' },
  'ENFJ': { dominant: 'Extraverted Feeling (Fe)', auxiliary: 'Introverted Intuition (Ni)', tertiary: 'Extraverted Sensing (Se)', inferior: 'Introverted Thinking (Ti)' },
  'INFJ': { dominant: 'Introverted Intuition (Ni)', auxiliary: 'Extraverted Feeling (Fe)', tertiary: 'Introverted Thinking (Ti)', inferior: 'Extraverted Sensing (Se)' },
  'ENTP': { dominant: 'Extraverted Intuition (Ne)', auxiliary: 'Introverted Thinking (Ti)', tertiary: 'Extraverted Feeling (Fe)', inferior: 'Introverted Sensing (Si)' },
  'INTP': { dominant: 'Introverted Thinking (Ti)', auxiliary: 'Extraverted Intuition (Ne)', tertiary: 'Introverted Sensing (Si)', inferior: 'Extraverted Feeling (Fe)' },
  'ENTJ': { dominant: 'Extraverted Thinking (Te)', auxiliary: 'Introverted Intuition (Ni)', tertiary: 'Extraverted Sensing (Se)', inferior: 'Introverted Feeling (Fi)' },
  'INTJ': { dominant: 'Introverted Intuition (Ni)', auxiliary: 'Extraverted Thinking (Te)', tertiary: 'Introverted Feeling (Fi)', inferior: 'Extraverted Sensing (Se)' },
  'ESFP': { dominant: 'Extraverted Sensing (Se)', auxiliary: 'Introverted Feeling (Fi)', tertiary: 'Extraverted Thinking (Te)', inferior: 'Introverted Intuition (Ni)' },
  'ISFP': { dominant: 'Introverted Feeling (Fi)', auxiliary: 'Extraverted Sensing (Se)', tertiary: 'Introverted Intuition (Ni)', inferior: 'Extraverted Thinking (Te)' },
  'ESFJ': { dominant: 'Extraverted Feeling (Fe)', auxiliary: 'Introverted Sensing (Si)', tertiary: 'Extraverted Intuition (Ne)', inferior: 'Introverted Thinking (Ti)' },
  'ISFJ': { dominant: 'Introverted Sensing (Si)', auxiliary: 'Extraverted Feeling (Fe)', tertiary: 'Introverted Thinking (Ti)', inferior: 'Extraverted Intuition (Ne)' },
  'ESTP': { dominant: 'Extraverted Sensing (Se)', auxiliary: 'Introverted Thinking (Ti)', tertiary: 'Extraverted Feeling (Fe)', inferior: 'Introverted Intuition (Ni)' },
  'ISTP': { dominant: 'Introverted Thinking (Ti)', auxiliary: 'Extraverted Sensing (Se)', tertiary: 'Introverted Intuition (Ni)', inferior: 'Extraverted Feeling (Fe)' },
  'ESTJ': { dominant: 'Extraverted Thinking (Te)', auxiliary: 'Introverted Sensing (Si)', tertiary: 'Extraverted Intuition (Ne)', inferior: 'Introverted Feeling (Fi)' },
  'ISTJ': { dominant: 'Introverted Sensing (Si)', auxiliary: 'Extraverted Thinking (Te)', tertiary: 'Introverted Feeling (Fi)', inferior: 'Extraverted Intuition (Ne)' }
};

/**
 * Calculate MBTI scores from assessment responses
 */
export function calculateMBTIScores(responses: MBTIResponse[]): MBTIScores {
  const dimensionScores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  };

  responses.forEach(response => {
    const question = MBTI_QUESTIONS.find(q => q.id === response.questionId);
    if (!question) return;

    let scoreValue = 0;
    if (response.stronglyAgree) {
      scoreValue = 4;
    } else if (response.agree) {
      scoreValue = 2;
    } else if (response.neutral) {
      scoreValue = 0;
    } else if (response.disagree) {
      scoreValue = -2;
    } else if (response.stronglyDisagree) {
      scoreValue = -4;
    }

    // Apply question weight
    scoreValue *= question.weight;

    // Assign to appropriate dimension
    const dimension = question.dimension;
    if (question.direction === 'positive') {
      // Positive direction (first letter of dimension)
      if (dimension === 'EI') {
        dimensionScores.E += scoreValue;
        dimensionScores.I -= scoreValue;
      } else if (dimension === 'SN') {
        dimensionScores.S += scoreValue;
        dimensionScores.N -= scoreValue;
      } else if (dimension === 'TF') {
        dimensionScores.T += scoreValue;
        dimensionScores.F -= scoreValue;
      } else if (dimension === 'JP') {
        dimensionScores.J += scoreValue;
        dimensionScores.P -= scoreValue;
      }
    } else {
      // Negative direction (second letter of dimension)
      if (dimension === 'EI') {
        dimensionScores.I += scoreValue;
        dimensionScores.E -= scoreValue;
      } else if (dimension === 'SN') {
        dimensionScores.N += scoreValue;
        dimensionScores.S -= scoreValue;
      } else if (dimension === 'TF') {
        dimensionScores.F += scoreValue;
        dimensionScores.T -= scoreValue;
      } else if (dimension === 'JP') {
        dimensionScores.P += scoreValue;
        dimensionScores.J -= scoreValue;
      }
    }
  });

  // Normalize scores to 0-100 scale
  const maxPossibleScore = 15 * 4 * 3; // 15 questions per dimension * max score * max weight
  const minPossibleScore = -maxPossibleScore;

  const normalizedScores: MBTIScores = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
  };

  Object.keys(dimensionScores).forEach(key => {
    const rawScore = dimensionScores[key as keyof typeof dimensionScores];
    const normalizedScore = Math.max(0, Math.min(100, 
      ((rawScore - minPossibleScore) / (maxPossibleScore - minPossibleScore)) * 100
    ));
    normalizedScores[key as keyof MBTIScores] = Math.round(normalizedScore);
  });

  return normalizedScores;
}

/**
 * Determine MBTI type from scores
 */
export function determineMBTIType(scores: MBTIScores): string {
  const type = [
    scores.E > scores.I ? 'E' : 'I',
    scores.S > scores.N ? 'S' : 'N',
    scores.T > scores.F ? 'T' : 'F',
    scores.J > scores.P ? 'J' : 'P'
  ].join('');

  return type;
}

/**
 * Generate detailed MBTI analysis
 */
export function generateMBTIAnalysis(type: string): MBTIResult['analysis'] {
  const analyses: Record<string, MBTIResult['analysis']> = {
    'ENFP': {
      overview: "ENFPs are enthusiastic, creative, and people-focused individuals who see life as full of possibilities. They are inspiring and energetic leaders who use their charm and charisma to motivate others.",
      strengths: ["Enthusiastic and inspiring", "Creative and innovative", "Excellent people skills", "Flexible and adaptable", "Strong communication abilities"],
      challenges: ["May struggle with routine tasks", "Can be disorganized", "May avoid difficult conversations", "Tendency to procrastinate", "May struggle with follow-through"],
      workPreferences: "Collaborative, creative environments with variety and opportunities for personal growth and helping others.",
      communicationStyle: "Warm, enthusiastic, and inspiring. Enjoys brainstorming and exploring possibilities with others.",
      leadershipStyle: "Inspirational leader who motivates through enthusiasm and vision. Focuses on developing people and fostering creativity.",
      decisionMaking: "Considers people impact and possibilities. May delay decisions to explore more options.",
      stressResponse: "May become scattered and lose focus. Benefits from breaking tasks into smaller steps.",
      careerFit: ["Human Resources", "Marketing", "Teaching", "Counseling", "Creative Arts", "Entrepreneurship"],
      teamRole: "The Inspirational Motivator - brings energy, creativity, and people focus to teams."
    },
    'INFP': {
      overview: "INFPs are idealistic, loyal to their values, and seek to help others achieve their potential. They are creative, independent, and driven by their personal values.",
      strengths: ["Strong personal values", "Creative and imaginative", "Empathetic and understanding", "Flexible and open-minded", "Passionate about meaningful work"],
      challenges: ["May be too idealistic", "Can be overly sensitive to criticism", "May avoid conflict", "Tendency to procrastinate", "May struggle with practical details"],
      workPreferences: "Independent work environment that aligns with personal values and allows for creativity and helping others.",
      communicationStyle: "Thoughtful, authentic, and values-based. Prefers deep, meaningful conversations.",
      leadershipStyle: "Values-driven leader who leads by example and inspires through authenticity and passion.",
      decisionMaking: "Makes decisions based on personal values and what feels right. Takes time to consider all perspectives.",
      stressResponse: "May withdraw and become overly critical of themselves. Benefits from support and encouragement.",
      careerFit: ["Writing", "Psychology", "Social Work", "Art", "Non-profit Work", "Education"],
      teamRole: "The Values Guardian - ensures team actions align with values and maintains harmony."
    },
    // Add more types...
    'ENTJ': {
      overview: "ENTJs are natural leaders who see the big picture and organize people and processes to achieve goals. They are strategic, decisive, and focus on efficiency and results.",
      strengths: ["Natural leadership abilities", "Strategic thinking", "Decisive and confident", "Excellent organizers", "Results-oriented"],
      challenges: ["May be too direct or blunt", "Can be impatient with inefficiency", "May overlook emotional needs", "Tendency to be controlling", "May struggle with work-life balance"],
      workPreferences: "Leadership roles with autonomy, strategic challenges, and opportunities to drive organizational success.",
      communicationStyle: "Direct, confident, and focused on results. Enjoys strategic discussions and problem-solving.",
      leadershipStyle: "Commanding leader who sets vision, organizes resources, and drives execution toward goals.",
      decisionMaking: "Makes quick decisions based on logical analysis and strategic considerations.",
      stressResponse: "May become more controlling and demanding. Benefits from delegation and stress management.",
      careerFit: ["Executive Leadership", "Management Consulting", "Entrepreneurship", "Finance", "Law", "Strategic Planning"],
      teamRole: "The Strategic Director - provides vision, organization, and drives team toward ambitious goals."
    },
    'ISFJ': {
      overview: "ISFJs are warm, responsible, and dedicated to helping others. They are detail-oriented, reliable, and work quietly behind the scenes to support others and maintain harmony.",
      strengths: ["Reliable and responsible", "Detail-oriented and thorough", "Supportive and caring", "Good at remembering personal details", "Practical and realistic"],
      challenges: ["May neglect own needs", "Can be overly modest", "May avoid conflict", "Tendency to take on too much", "May resist change"],
      workPreferences: "Stable, supportive environment where they can help others and work with clear expectations and procedures.",
      communicationStyle: "Warm, supportive, and considerate. Focuses on practical needs and personal details.",
      leadershipStyle: "Supportive leader who leads by example and ensures everyone's needs are met.",
      decisionMaking: "Considers impact on people and past experience. Takes time to ensure all details are considered.",
      stressResponse: "May become overwhelmed and withdraw. Benefits from support and clear priorities.",
      careerFit: ["Healthcare", "Education", "Social Services", "Administration", "Customer Service", "Human Resources"],
      teamRole: "The Supportive Caretaker - ensures team needs are met and maintains group harmony."
    }
  };

  return analyses[type] || {
    overview: "A unique personality type with their own strengths and characteristics.",
    strengths: ["Unique perspective", "Individual strengths"],
    challenges: ["Individual growth areas"],
    workPreferences: "Work environment that matches individual preferences.",
    communicationStyle: "Individual communication approach.",
    leadershipStyle: "Personal leadership approach.",
    decisionMaking: "Individual decision-making style.",
    stressResponse: "Personal stress management approach.",
    careerFit: ["Various career options"],
    teamRole: "Unique team contribution."
  };
}

/**
 * Generate relationship compatibility
 */
export function generateMBTIRelationships(type: string): MBTIResult['relationships'] {
  // Simplified compatibility matrix
  const compatibilityMap: Record<string, MBTIResult['relationships']> = {
    'ENFP': {
      romantic: ["INTJ", "INFJ", "ENTP", "ENFJ"],
      friendship: ["INFP", "ENFJ", "ENTP", "ISFP"],
      workCollaboration: ["INTJ", "ENTJ", "INFJ", "ENTP"]
    },
    'INTJ': {
      romantic: ["ENFP", "ENTP", "INFJ", "ENTJ"],
      friendship: ["INTP", "ENTJ", "INFJ", "ENFP"],
      workCollaboration: ["ENTJ", "ENFP", "INTP", "ENTP"]
    },
    // Add more as needed...
  };

  return compatibilityMap[type] || {
    romantic: ["Compatible types vary"],
    friendship: ["Various friendship types"],
    workCollaboration: ["Different collaboration styles"]
  };
}

/**
 * Generate development recommendations
 */
export function generateMBTIDevelopment(type: string): MBTIResult['development'] {
  const developmentMap: Record<string, MBTIResult['development']> = {
    'ENFP': {
      growthAreas: ["Attention to detail", "Follow-through on projects", "Time management", "Constructive criticism handling"],
      recommendations: ["Use project management tools", "Set regular check-in deadlines", "Practice mindfulness", "Seek feedback regularly"]
    },
    'INTJ': {
      growthAreas: ["Interpersonal skills", "Flexibility", "Emotional expression", "Team collaboration"],
      recommendations: ["Practice active listening", "Schedule social interactions", "Express appreciation more often", "Consider others' perspectives"]
    },
    // Add more as needed...
  };

  return developmentMap[type] || {
    growthAreas: ["Personal development areas"],
    recommendations: ["Individual growth recommendations"]
  };
}

/**
 * Complete MBTI assessment calculation
 */
export function calculateMBTIAssessment(responses: MBTIResponse[]): MBTIResult {
  // Validate responses
  if (responses.length !== 60) {
    throw new Error('MBTI assessment requires responses to all 60 questions');
  }

  // Calculate scores
  const scores = calculateMBTIScores(responses);
  
  // Determine type
  const type = determineMBTIType(scores);
  
  // Get cognitive functions
  const cognitiveFunctions = COGNITIVE_FUNCTIONS[type];
  
  // Generate analysis
  const analysis = generateMBTIAnalysis(type);
  const relationships = generateMBTIRelationships(type);
  const development = generateMBTIDevelopment(type);

  return {
    type,
    scores,
    cognitiveFunctions,
    analysis,
    relationships,
    development
  };
}

/**
 * Get MBTI assessment questions for frontend
 */
export function getMBTIQuestions(): MBTIQuestion[] {
  return MBTI_QUESTIONS;
}

/**
 * Validate MBTI responses
 */
export function validateMBTIResponses(responses: MBTIResponse[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (responses.length !== 60) {
    errors.push('Must answer all 60 questions');
  }

  responses.forEach((response, index) => {
    const selectedCount = [
      response.stronglyAgree,
      response.agree,
      response.neutral,
      response.disagree,
      response.stronglyDisagree
    ].filter(Boolean).length;
    
    if (selectedCount !== 1) {
      errors.push(`Question ${index + 1}: Must select exactly one option`);
    }
  });

  // Check if all questions are answered
  for (let i = 1; i <= 60; i++) {
    const response = responses.find(r => r.questionId === i);
    if (!response) {
      errors.push(`Missing response for question ${i}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}