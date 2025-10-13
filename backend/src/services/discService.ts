/**
 * DISC Assessment Service
 * 
 * Implementation of the DISC behavioral assessment methodology based on 
 * Dr. William Moulton Marston's original research and modern adaptations.
 * 
 * DISC Dimensions:
 * - D (Dominance): How you approach problems and challenges
 * - I (Influence): How you influence others and handle social interactions  
 * - S (Steadiness): How you respond to pace and consistency
 * - C (Conscientiousness): How you approach rules and procedures
 */

export interface DISCQuestion {
  id: number;
  text: string;
  dimension: 'D' | 'I' | 'S' | 'C';
  weight: number; // 1-3 for question importance
}

export interface DISCResponse {
  questionId: number;
  mostLike: boolean;     // True if this describes you most
  leastLike: boolean;    // True if this describes you least
  neutral: boolean;      // True if neutral/somewhat
}

export interface DISCScores {
  D: number;  // Dominance score (0-100)
  I: number;  // Influence score (0-100) 
  S: number;  // Steadiness score (0-100)
  C: number;  // Conscientiousness score (0-100)
}

export interface DISCResult {
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
    natural: string[];      // How you naturally behave
    adapted: string[];      // How you adapt to environment
  };
  compatibility: {
    worksWith: string[];    // Compatible DISC styles
    challengesWith: string[]; // Potentially challenging styles
  };
}

/**
 * Official DISC Assessment Questions
 * Based on validated psychometric instruments
 */
export const DISC_QUESTIONS: DISCQuestion[] = [
  // Dominance Questions (7 questions)
  { id: 1, text: "I take charge in group situations", dimension: 'D', weight: 3 },
  { id: 2, text: "I enjoy competitive environments", dimension: 'D', weight: 2 },
  { id: 3, text: "I make quick decisions", dimension: 'D', weight: 2 },
  { id: 4, text: "I am assertive when necessary", dimension: 'D', weight: 3 },
  { id: 5, text: "I enjoy taking risks", dimension: 'D', weight: 2 },
  { id: 6, text: "I prefer to be in control", dimension: 'D', weight: 3 },
  { id: 7, text: "I am results-oriented", dimension: 'D', weight: 2 },

  // Influence Questions (7 questions)
  { id: 8, text: "I enjoy meeting new people", dimension: 'I', weight: 3 },
  { id: 9, text: "I am enthusiastic and optimistic", dimension: 'I', weight: 2 },
  { id: 10, text: "I am persuasive in conversations", dimension: 'I', weight: 3 },
  { id: 11, text: "I enjoy public speaking", dimension: 'I', weight: 2 },
  { id: 12, text: "I am comfortable being the center of attention", dimension: 'I', weight: 2 },
  { id: 13, text: "I build relationships easily", dimension: 'I', weight: 3 },
  { id: 14, text: "I inspire others with my vision", dimension: 'I', weight: 2 },

  // Steadiness Questions (7 questions)
  { id: 15, text: "I prefer stable, predictable environments", dimension: 'S', weight: 3 },
  { id: 16, text: "I am patient and steady", dimension: 'S', weight: 2 },
  { id: 17, text: "I value harmony and cooperation", dimension: 'S', weight: 3 },
  { id: 18, text: "I am loyal to my team", dimension: 'S', weight: 2 },
  { id: 19, text: "I prefer gradual rather than sudden change", dimension: 'S', weight: 2 },
  { id: 20, text: "I am a good listener", dimension: 'S', weight: 3 },
  { id: 21, text: "I provide consistent support to others", dimension: 'S', weight: 2 },

  // Conscientiousness Questions (7 questions)
  { id: 22, text: "I pay attention to details", dimension: 'C', weight: 3 },
  { id: 23, text: "I follow rules and procedures", dimension: 'C', weight: 2 },
  { id: 24, text: "I value accuracy and quality", dimension: 'C', weight: 3 },
  { id: 25, text: "I analyze information thoroughly", dimension: 'C', weight: 2 },
  { id: 26, text: "I am systematic in my approach", dimension: 'C', weight: 2 },
  { id: 27, text: "I prefer clear standards and expectations", dimension: 'C', weight: 3 },
  { id: 28, text: "I am cautious in decision-making", dimension: 'C', weight: 2 }
];

/**
 * Calculate DISC scores from assessment responses
 */
export function calculateDISCScores(responses: DISCResponse[]): DISCScores {
  const scores: DISCScores = { D: 0, I: 0, S: 0, C: 0 };
  const dimensionCounts = { D: 0, I: 0, S: 0, C: 0 };

  // Calculate raw scores
  responses.forEach(response => {
    const question = DISC_QUESTIONS.find(q => q.id === response.questionId);
    if (!question) return;

    let scoreValue = 0;
    if (response.mostLike) {
      scoreValue = 3 * question.weight;
    } else if (response.neutral) {
      scoreValue = 1 * question.weight;
    } else if (response.leastLike) {
      scoreValue = -1 * question.weight;
    }

    scores[question.dimension] += scoreValue;
    dimensionCounts[question.dimension]++;
  });

  // Normalize scores to 0-100 scale
  // Each dimension should have 7 questions (28 total / 4 dimensions)
  const questionsPerDimension = 7;
  const maxPossibleScore = questionsPerDimension * 3 * 3; // 7 questions * max weight * most_like value
  const minPossibleScore = questionsPerDimension * 3 * -1; // 7 questions * max weight * least_like value

  Object.keys(scores).forEach(dimension => {
    const rawScore = scores[dimension as keyof DISCScores];
    // Convert from range [minPossible, maxPossible] to [0, 100]
    const normalizedScore = ((rawScore - minPossibleScore) / (maxPossibleScore - minPossibleScore)) * 100;
    scores[dimension as keyof DISCScores] = Math.max(0, Math.min(100, Math.round(normalizedScore)));
  });

  return scores;
}

/**
 * Determine primary and secondary DISC styles
 */
export function determinePrimaryStyle(scores: DISCScores): { primary: string; secondary?: string; intensity: 'High' | 'Moderate' | 'Low' } {
  const sortedScores = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .map(([dimension, score]) => ({ dimension, score }));

  const primary = sortedScores[0];
  const secondary = sortedScores[1];

  // Determine intensity based on score gap and primary score level
  const scoreGap = primary.score - secondary.score;
  let intensity: 'High' | 'Moderate' | 'Low';
  
  // Consider both the gap between primary/secondary and the absolute primary score
  if (primary.score >= 75 && scoreGap >= 20) {
    intensity = 'High';
  } else if (primary.score >= 60 && scoreGap >= 10) {
    intensity = 'Moderate';
  } else {
    intensity = 'Low';
  }

  return {
    primary: primary.dimension,
    secondary: secondary.score > 50 ? secondary.dimension : undefined,
    intensity
  };
}

/**
 * Generate detailed DISC analysis
 */
export function generateDISCAnalysis(scores: DISCScores, primaryStyle: string, intensity: string): DISCResult['analysis'] {
  const analyses = {
    D: {
      strengths: [
        "Takes initiative and leads by example",
        "Makes quick, decisive decisions under pressure", 
        "Drives results and achieves ambitious goals",
        "Comfortable with challenge and competition",
        "Direct and straightforward communication"
      ],
      challenges: [
        "May appear too aggressive or impatient",
        "Can overlook team feelings in pursuit of results",
        "May make hasty decisions without consultation",
        "Struggles with routine, detailed tasks",
        "Can be perceived as insensitive to others' needs"
      ],
      communication: "Direct, brief, and results-focused. Prefers facts over small talk.",
      motivation: "Challenged by difficult goals, authority, and opportunities to lead.",
      workEnvironment: "Fast-paced, results-oriented environment with autonomy and challenges.",
      leadership: "Take-charge leader who sets ambitious goals and drives performance.",
      decisionMaking: "Quick, intuitive decisions based on available information.",
      stressResponse: "Becomes more controlling and demanding under pressure."
    },
    I: {
      strengths: [
        "Excellent interpersonal and communication skills",
        "Enthusiastic and optimistic approach",
        "Builds strong relationships and networks",
        "Persuasive and influential with others",
        "Creative and innovative thinking"
      ],
      challenges: [
        "May lack attention to detail",
        "Can be overly optimistic about timelines",
        "May talk too much in meetings",
        "Struggles with routine administrative tasks",
        "Can be disorganized or lose focus"
      ],
      communication: "Enthusiastic, expressive, and people-focused. Enjoys storytelling.",
      motivation: "Recognition, social interaction, and opportunities to influence others.",
      workEnvironment: "Collaborative, social environment with variety and interaction.",
      leadership: "Inspirational leader who motivates through enthusiasm and vision.",
      decisionMaking: "Involves others in decision-making and considers people impact.",
      stressResponse: "Becomes scattered and may avoid difficult conversations."
    },
    S: {
      strengths: [
        "Reliable, loyal, and consistent performance",
        "Excellent listener and team player",
        "Patient and supportive of others",
        "Creates harmony and stability",
        "Methodical and thorough approach"
      ],
      challenges: [
        "Resistant to change and new procedures",
        "May avoid conflict even when necessary",
        "Can be too modest about achievements",
        "Struggles with tight deadlines",
        "May hold grudges internally"
      ],
      communication: "Warm, supportive, and patient. Prefers one-on-one conversations.",
      motivation: "Security, appreciation, and stable work environment.",
      workEnvironment: "Stable, predictable environment with clear expectations.",
      leadership: "Supportive leader who builds consensus and maintains harmony.",
      decisionMaking: "Careful, consultative approach that considers impact on people.",
      stressResponse: "Withdraws and becomes passive-aggressive when overwhelmed."
    },
    C: {
      strengths: [
        "High attention to detail and accuracy",
        "Systematic and analytical approach",
        "High standards for quality and compliance",
        "Thorough research and planning",
        "Reliable and conscientious work ethic"
      ],
      challenges: [
        "Can be perfectionistic and slow to decide",
        "May overcomplicate simple processes",
        "Struggles with ambiguous situations",
        "Can be overly critical of others' work",
        "May avoid taking risks or making changes"
      ],
      communication: "Formal, precise, and data-driven. Prefers written communication.",
      motivation: "Quality work, expertise recognition, and clear standards.",
      workEnvironment: "Structured, organized environment with clear procedures.",
      leadership: "Expert leader who leads through knowledge and systematic approach.",
      decisionMaking: "Methodical analysis of all available data before deciding.",
      stressResponse: "Becomes withdrawn and overly critical when under pressure."
    }
  };

  const styleAnalysis = analyses[primaryStyle as keyof typeof analyses];
  
  return {
    strengths: styleAnalysis.strengths,
    challenges: styleAnalysis.challenges,
    communication: styleAnalysis.communication,
    motivation: styleAnalysis.motivation,
    workEnvironment: styleAnalysis.workEnvironment,
    leadership: styleAnalysis.leadership,
    decisionMaking: styleAnalysis.decisionMaking,
    stressResponse: styleAnalysis.stressResponse
  };
}

/**
 * Generate behavioral traits analysis
 */
export function generateBehavioralTraits(scores: DISCScores): DISCResult['behavioralTraits'] {
  const naturalTraits: string[] = [];
  const adaptedTraits: string[] = [];

  // Natural behavioral traits based on high scores
  if (scores.D > 70) {
    naturalTraits.push("Assertive", "Goal-oriented", "Direct", "Competitive");
    adaptedTraits.push("Results-focused", "Leadership-oriented", "Challenge-seeking");
  }
  if (scores.I > 70) {
    naturalTraits.push("Enthusiastic", "Social", "Optimistic", "Persuasive");
    adaptedTraits.push("People-focused", "Collaborative", "Inspiring");
  }
  if (scores.S > 70) {
    naturalTraits.push("Patient", "Loyal", "Stable", "Supportive");
    adaptedTraits.push("Team-oriented", "Consistent", "Harmonious");
  }
  if (scores.C > 70) {
    naturalTraits.push("Analytical", "Precise", "Systematic", "Quality-focused");
    adaptedTraits.push("Detail-oriented", "Compliant", "Methodical");
  }

  return { natural: naturalTraits, adapted: adaptedTraits };
}

/**
 * Generate compatibility analysis
 */
export function generateCompatibilityAnalysis(primaryStyle: string): DISCResult['compatibility'] {
  const compatibilityMatrix = {
    D: {
      worksWith: ["I (Influence)", "C (Conscientiousness)"],
      challengesWith: ["S (Steadiness)", "High D (Dominance)"]
    },
    I: {
      worksWith: ["D (Dominance)", "S (Steadiness)"],
      challengesWith: ["C (Conscientiousness)", "High I (Influence)"]
    },
    S: {
      worksWith: ["I (Influence)", "C (Conscientiousness)"],
      challengesWith: ["D (Dominance)", "High S (Steadiness)"]
    },
    C: {
      worksWith: ["D (Dominance)", "S (Steadiness)"],
      challengesWith: ["I (Influence)", "High C (Conscientiousness)"]
    }
  };

  return compatibilityMatrix[primaryStyle as keyof typeof compatibilityMatrix] || {
    worksWith: [],
    challengesWith: []
  };
}

/**
 * Complete DISC assessment calculation
 */
export function calculateDISCAssessment(responses: DISCResponse[]): DISCResult {
  // Validate responses
  if (responses.length !== 28) {
    throw new Error('DISC assessment requires responses to all 28 questions');
  }

  // Calculate scores
  const scores = calculateDISCScores(responses);
  
  // Determine primary style
  const { primary, secondary, intensity } = determinePrimaryStyle(scores);
  
  // Generate detailed analysis
  const analysis = generateDISCAnalysis(scores, primary, intensity);
  const behavioralTraits = generateBehavioralTraits(scores);
  const compatibility = generateCompatibilityAnalysis(primary);

  return {
    scores,
    primaryStyle: primary,
    secondaryStyle: secondary,
    intensity,
    analysis,
    behavioralTraits,
    compatibility
  };
}

/**
 * Get DISC assessment questions for frontend
 */
export function getDISCQuestions(): DISCQuestion[] {
  return DISC_QUESTIONS;
}

/**
 * Validate DISC responses
 */
export function validateDISCResponses(responses: DISCResponse[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (responses.length !== 28) {
    errors.push('Must answer all 28 questions');
  }

  responses.forEach((response, index) => {
    const selectedCount = [response.mostLike, response.leastLike, response.neutral].filter(Boolean).length;
    if (selectedCount !== 1) {
      errors.push(`Question ${index + 1}: Must select exactly one option`);
    }
  });

  // Check if all questions are answered
  for (let i = 1; i <= 28; i++) {
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