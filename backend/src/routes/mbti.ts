/**
 * MBTI Assessment API Routes
 * 
 * Endpoints for MBTI personality assessment functionality:
 * - Get MBTI questions
 * - Submit MBTI assessment  
 * - Retrieve MBTI results
 * - Calculate type compatibility
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  calculateMBTIAssessment,
  getMBTIQuestions,
  validateMBTIResponses,
  MBTIResponse 
} from '../services/mbtiService';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/mbti/questions
 * Get all MBTI assessment questions
 */
router.get('/questions', async (req, res) => {
  try {
    const questions = getMBTIQuestions();
    
    // Format questions for frontend (remove weights for security)
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      dimension: q.dimension
    }));

    res.json({
      success: true,
      data: {
        questions: formattedQuestions,
        totalQuestions: questions.length,
        instructions: {
          title: "MBTI Personality Assessment",
          description: "This assessment identifies your personality type based on the Myers-Briggs Type Indicator. For each statement, select how much you agree or disagree:",
          dimensions: [
            { code: "E/I", name: "Extraversion vs Introversion", description: "Where you focus your attention and get energy" },
            { code: "S/N", name: "Sensing vs Intuition", description: "How you take in and process information" },
            { code: "T/F", name: "Thinking vs Feeling", description: "How you make decisions and judgments" },
            { code: "J/P", name: "Judging vs Perceiving", description: "How you approach the outside world" }
          ],
          options: [
            { value: "stronglyAgree", label: "Strongly Agree", description: "This statement describes you very well" },
            { value: "agree", label: "Agree", description: "This statement mostly describes you" },
            { value: "neutral", label: "Neutral", description: "You are unsure or this sometimes applies" },
            { value: "disagree", label: "Disagree", description: "This statement mostly does not describe you" },
            { value: "stronglyDisagree", label: "Strongly Disagree", description: "This statement does not describe you at all" }
          ],
          timeEstimate: "20-25 minutes",
          tips: [
            "Answer based on your natural preferences, not learned behavior",
            "Consider how you typically behave, not how you think you should behave",
            "Think about your behavior across different situations, not just work",
            "Be honest - there are no right or wrong answers",
            "If unsure, choose the option that feels most natural to you"
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching MBTI questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch MBTI questions'
    });
  }
});

/**
 * POST /api/mbti/submit
 * Submit MBTI assessment responses and calculate results
 * 
 * Body: {
 *   assessmentId: string,
 *   responses: MBTIResponse[]
 * }
 */
router.post('/submit', async (req, res) => {
  try {
    const { assessmentId, responses } = req.body;

    // Validate request
    if (!assessmentId || !responses) {
      return res.status(400).json({
        success: false,
        error: 'Assessment ID and responses are required'
      });
    }

    // Validate assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { candidate: true, jobPosition: true }
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    // Validate responses
    const validation = validateMBTIResponses(responses);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid responses',
        details: validation.errors
      });
    }

    // Calculate MBTI results
    const mbtiResult = calculateMBTIAssessment(responses);

    // Save to database
    const savedResult = await prisma.mBTIResult.create({
      data: {
        assessmentId: assessmentId,
        type: mbtiResult.type,
        dimensions: JSON.stringify(mbtiResult.scores),
        analysis: JSON.stringify({
          cognitiveFunctions: mbtiResult.cognitiveFunctions,
          analysis: mbtiResult.analysis,
          relationships: mbtiResult.relationships,
          development: mbtiResult.development
        })
      }
    });

    // Update assessment status
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { 
        status: 'MBTI_COMPLETED',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        id: savedResult.id,
        type: mbtiResult.type,
        scores: mbtiResult.scores,
        cognitiveFunctions: mbtiResult.cognitiveFunctions,
        analysis: mbtiResult.analysis,
        relationships: mbtiResult.relationships,
        development: mbtiResult.development,
        assessmentId: assessmentId
      },
      message: 'MBTI assessment completed successfully'
    });

  } catch (error) {
    console.error('Error submitting MBTI assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process MBTI assessment'
    });
  }
});

/**
 * GET /api/mbti/results/:assessmentId
 * Get MBTI results for a specific assessment
 */
router.get('/results/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const mbtiResult = await prisma.mBTIResult.findUnique({
      where: { assessmentId },
      include: {
        assessment: {
          include: {
            candidate: true,
            jobPosition: true
          }
        }
      }
    });

    if (!mbtiResult) {
      return res.status(404).json({
        success: false,
        error: 'MBTI results not found for this assessment'
      });
    }

    // Parse stored analysis JSON
    const analysisData = JSON.parse(mbtiResult.analysis || '{}');
    const scoresData = JSON.parse(mbtiResult.dimensions || '{}');

    res.json({
      success: true,
      data: {
        id: mbtiResult.id,
        type: mbtiResult.type,
        scores: scoresData,
        cognitiveFunctions: analysisData.cognitiveFunctions,
        analysis: analysisData.analysis,
        relationships: analysisData.relationships,
        development: analysisData.development,
        createdAt: mbtiResult.createdAt,
        candidate: {
          id: mbtiResult.assessment.candidate.id,
          fullName: mbtiResult.assessment.candidate.fullName
        },
        jobPosition: {
          id: mbtiResult.assessment.jobPosition.id,
          title: mbtiResult.assessment.jobPosition.title
        }
      }
    });

  } catch (error) {
    console.error('Error fetching MBTI results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch MBTI results'
    });
  }
});

/**
 * GET /api/mbti/compatibility/:assessmentId/:jobPositionId
 * Calculate MBTI compatibility with job position requirements
 */
router.get('/compatibility/:assessmentId/:jobPositionId', async (req, res) => {
  try {
    const { assessmentId, jobPositionId } = req.params;

    // Get MBTI results
    const mbtiResult = await prisma.mBTIResult.findUnique({
      where: { assessmentId }
    });

    if (!mbtiResult) {
      return res.status(404).json({
        success: false,
        error: 'MBTI results not found'
      });
    }

    // Get job position requirements
    const jobPosition = await prisma.jobPosition.findUnique({
      where: { id: jobPositionId }
    });

    if (!jobPosition) {
      return res.status(404).json({
        success: false,
        error: 'Job position not found'
      });
    }

    // Parse job requirements (if they include MBTI preferences)
    const requirements = JSON.parse(jobPosition.requirements || '{}');
    const idealMBTI = requirements.mbtiProfile || {};

    // Calculate compatibility score
    let compatibilityScore = 100; // Start with perfect score
    const candidateScores = JSON.parse(mbtiResult.dimensions || '{}');
    
    // Type match (exact type match gives bonus)
    if (idealMBTI.preferredTypes && idealMBTI.preferredTypes.includes(mbtiResult.type)) {
      compatibilityScore = 100;
    } else if (idealMBTI.preferredTypes) {
      // Partial match - check individual dimensions
      const candidateType = mbtiResult.type;
      let dimensionMatches = 0;
      
      for (const preferredType of idealMBTI.preferredTypes) {
        let matches = 0;
        for (let i = 0; i < 4; i++) {
          if (candidateType[i] === preferredType[i]) {
            matches++;
          }
        }
        dimensionMatches = Math.max(dimensionMatches, matches);
      }
      
      compatibilityScore = (dimensionMatches / 4) * 100;
    }

    // Dimension preferences (if specific dimension scores are preferred)
    if (idealMBTI.dimensionPreferences) {
      let dimensionScore = 0;
      let dimensionCount = 0;
      
      Object.keys(idealMBTI.dimensionPreferences).forEach(dimension => {
        const idealScore = idealMBTI.dimensionPreferences[dimension];
        const candidateScore = candidateScores[dimension];
        
        if (candidateScore !== undefined) {
          const diff = Math.abs(candidateScore - idealScore);
          const dimensionCompatibility = Math.max(0, 100 - (diff * 2)); // 2% penalty per point difference
          dimensionScore += dimensionCompatibility;
          dimensionCount++;
        }
      });
      
      if (dimensionCount > 0) {
        compatibilityScore = (compatibilityScore + (dimensionScore / dimensionCount)) / 2;
      }
    }

    const finalScore = Math.round(Math.max(0, Math.min(100, compatibilityScore)));

    res.json({
      success: true,
      data: {
        compatibilityScore: finalScore,
        candidateType: mbtiResult.type,
        candidateScores: candidateScores,
        idealProfile: idealMBTI,
        analysis: {
          typeMatch: idealMBTI.preferredTypes ? idealMBTI.preferredTypes.includes(mbtiResult.type) : null,
          dimensionAnalysis: idealMBTI.dimensionPreferences ? 
            Object.keys(idealMBTI.dimensionPreferences).map(dim => ({
              dimension: dim,
              candidate: candidateScores[dim],
              ideal: idealMBTI.dimensionPreferences[dim],
              compatibility: candidateScores[dim] ? 
                Math.max(0, 100 - (Math.abs(candidateScores[dim] - idealMBTI.dimensionPreferences[dim]) * 2)) : 0
            })) : null
        }
      }
    });

  } catch (error) {
    console.error('Error calculating MBTI compatibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate MBTI compatibility'
    });
  }
});

/**
 * GET /api/mbti/types
 * Get information about all 16 MBTI types
 */
router.get('/types', async (req, res) => {
  try {
    const types = [
      { code: 'ENFP', name: 'The Campaigner', category: 'Diplomat' },
      { code: 'INFP', name: 'The Mediator', category: 'Diplomat' },
      { code: 'ENFJ', name: 'The Protagonist', category: 'Diplomat' },
      { code: 'INFJ', name: 'The Advocate', category: 'Diplomat' },
      { code: 'ENTP', name: 'The Debater', category: 'Analyst' },
      { code: 'INTP', name: 'The Thinker', category: 'Analyst' },
      { code: 'ENTJ', name: 'The Commander', category: 'Analyst' },
      { code: 'INTJ', name: 'The Architect', category: 'Analyst' },
      { code: 'ESFP', name: 'The Entertainer', category: 'Explorer' },
      { code: 'ISFP', name: 'The Adventurer', category: 'Explorer' },
      { code: 'ESTP', name: 'The Entrepreneur', category: 'Explorer' },
      { code: 'ISTP', name: 'The Virtuoso', category: 'Explorer' },
      { code: 'ESFJ', name: 'The Consul', category: 'Sentinel' },
      { code: 'ISFJ', name: 'The Protector', category: 'Sentinel' },
      { code: 'ESTJ', name: 'The Executive', category: 'Sentinel' },
      { code: 'ISTJ', name: 'The Logistician', category: 'Sentinel' }
    ];

    res.json({
      success: true,
      data: {
        types,
        categories: {
          'Analyst': { description: 'Intuitive (N) and Thinking (T) - Rationalist and competent', color: '#6B73FF' },
          'Diplomat': { description: 'Intuitive (N) and Feeling (F) - Empathetic and diplomatic', color: '#16A085' },
          'Sentinel': { description: 'Observant (S) and Judging (J) - Cooperative and practical', color: '#F39C12' },
          'Explorer': { description: 'Observant (S) and Prospecting (P) - Spontaneous and adaptable', color: '#E74C3C' }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching MBTI types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch MBTI types'
    });
  }
});

/**
 * GET /api/mbti/summary/:candidateId
 * Get MBTI assessment summary for a candidate across all assessments
 */
router.get('/summary/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;

    const mbtiResults = await prisma.mBTIResult.findMany({
      where: {
        assessment: {
          candidateId: candidateId
        }
      },
      include: {
        assessment: {
          include: {
            jobPosition: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (mbtiResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No MBTI results found for this candidate'
      });
    }

    // Find most common type
    const typeCounts = mbtiResults.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Calculate average dimension scores
    const totalScores = mbtiResults.reduce((acc, result) => {
      const scores = JSON.parse(result.dimensions || '{}');
      Object.keys(scores).forEach(dimension => {
        acc[dimension] = (acc[dimension] || 0) + scores[dimension];
      });
      return acc;
    }, {} as Record<string, number>);

    const avgScores = {} as Record<string, number>;
    Object.keys(totalScores).forEach(dimension => {
      avgScores[dimension] = Math.round(totalScores[dimension] / mbtiResults.length);
    });

    res.json({
      success: true,
      data: {
        candidateId,
        totalAssessments: mbtiResults.length,
        mostCommonType,
        averageScores: avgScores,
        assessmentHistory: mbtiResults.map(result => ({
          id: result.id,
          assessmentId: result.assessmentId,
          type: result.type,
          scores: JSON.parse(result.dimensions || '{}'),
          jobPosition: result.assessment.jobPosition.title,
          createdAt: result.createdAt
        })),
        consistency: {
          isConsistent: mbtiResults.every(r => r.type === mostCommonType),
          typeVariations: Object.keys(typeCounts).length,
          dominantTypePercentage: Math.round((typeCounts[mostCommonType] / mbtiResults.length) * 100)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching MBTI summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch MBTI summary'
    });
  }
});

export default router;