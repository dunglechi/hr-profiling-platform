/**
 * DISC Assessment API Routes
 * 
 * Endpoints for DISC behavioral assessment functionality:
 * - Get DISC questions
 * - Submit DISC assessment
 * - Retrieve DISC results
 * - Calculate compatibility
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  calculateDISCAssessment,
  getDISCQuestions,
  validateDISCResponses,
  DISCResponse 
} from '../services/discService';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/disc/questions
 * Get all DISC assessment questions
 */
router.get('/questions', async (req, res) => {
  try {
    const questions = getDISCQuestions();
    
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
          title: "DISC Behavioral Assessment",
          description: "This assessment helps identify your behavioral style and preferences. For each statement, select the option that best describes you:",
          options: [
            { value: "mostLike", label: "Most like me", description: "This statement describes you very well" },
            { value: "neutral", label: "Somewhat like me", description: "This statement somewhat describes you" },
            { value: "leastLike", label: "Least like me", description: "This statement does not describe you well" }
          ],
          timeEstimate: "15-20 minutes",
          tips: [
            "Answer based on your natural tendencies, not how you think you should behave",
            "Consider your behavior in most situations, not just work",
            "Be honest - there are no right or wrong answers",
            "Trust your first instinct when answering"
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching DISC questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DISC questions'
    });
  }
});

/**
 * POST /api/disc/submit
 * Submit DISC assessment responses and calculate results
 * 
 * Body: {
 *   assessmentId: string,
 *   responses: DISCResponse[]
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
    const validation = validateDISCResponses(responses);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid responses',
        details: validation.errors
      });
    }

    // Calculate DISC results
    const discResult = calculateDISCAssessment(responses);

    // Save to database
    const savedResult = await prisma.dISCResult.create({
      data: {
        assessmentId: assessmentId,
        dScore: discResult.scores.D,
        iScore: discResult.scores.I,
        sScore: discResult.scores.S,
        cScore: discResult.scores.C,
        primaryStyle: discResult.primaryStyle,
        analysis: JSON.stringify({
          secondaryStyle: discResult.secondaryStyle,
          intensity: discResult.intensity,
          analysis: discResult.analysis,
          behavioralTraits: discResult.behavioralTraits,
          compatibility: discResult.compatibility
        })
      }
    });

    // Update assessment status
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { 
        status: 'DISC_COMPLETED',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        id: savedResult.id,
        scores: discResult.scores,
        primaryStyle: discResult.primaryStyle,
        secondaryStyle: discResult.secondaryStyle,
        intensity: discResult.intensity,
        analysis: discResult.analysis,
        behavioralTraits: discResult.behavioralTraits,
        compatibility: discResult.compatibility,
        assessmentId: assessmentId
      },
      message: 'DISC assessment completed successfully'
    });

  } catch (error) {
    console.error('Error submitting DISC assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process DISC assessment'
    });
  }
});

/**
 * GET /api/disc/results/:assessmentId
 * Get DISC results for a specific assessment
 */
router.get('/results/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const discResult = await prisma.dISCResult.findUnique({
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

    if (!discResult) {
      return res.status(404).json({
        success: false,
        error: 'DISC results not found for this assessment'
      });
    }

    // Parse stored analysis JSON
    const analysisData = JSON.parse(discResult.analysis || '{}');

    res.json({
      success: true,
      data: {
        id: discResult.id,
        scores: {
          D: discResult.dScore,
          I: discResult.iScore,
          S: discResult.sScore,
          C: discResult.cScore
        },
        primaryStyle: discResult.primaryStyle,
        secondaryStyle: analysisData.secondaryStyle,
        intensity: analysisData.intensity,
        analysis: analysisData.analysis,
        behavioralTraits: analysisData.behavioralTraits,
        compatibility: analysisData.compatibility,
        createdAt: discResult.createdAt,
        candidate: {
          id: discResult.assessment.candidate.id,
          fullName: discResult.assessment.candidate.fullName
        },
        jobPosition: {
          id: discResult.assessment.jobPosition.id,
          title: discResult.assessment.jobPosition.title
        }
      }
    });

  } catch (error) {
    console.error('Error fetching DISC results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DISC results'
    });
  }
});

/**
 * GET /api/disc/compatibility/:assessmentId/:jobPositionId
 * Calculate DISC compatibility with job position requirements
 */
router.get('/compatibility/:assessmentId/:jobPositionId', async (req, res) => {
  try {
    const { assessmentId, jobPositionId } = req.params;

    // Get DISC results
    const discResult = await prisma.dISCResult.findUnique({
      where: { assessmentId }
    });

    if (!discResult) {
      return res.status(404).json({
        success: false,
        error: 'DISC results not found'
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

    // Parse job requirements (if they include DISC preferences)
    const requirements = JSON.parse(jobPosition.requirements || '{}');
    const idealDISC = requirements.discProfile || {};

    // Calculate compatibility score
    let compatibilityScore = 0;
    let maxScore = 0;

    if (idealDISC.D !== undefined) {
      maxScore += 25;
      const scoreDiff = Math.abs(discResult.dScore - idealDISC.D);
      compatibilityScore += Math.max(0, 25 - (scoreDiff * 0.25));
    }
    if (idealDISC.I !== undefined) {
      maxScore += 25;
      const scoreDiff = Math.abs(discResult.iScore - idealDISC.I);
      compatibilityScore += Math.max(0, 25 - (scoreDiff * 0.25));
    }
    if (idealDISC.S !== undefined) {
      maxScore += 25;
      const scoreDiff = Math.abs(discResult.sScore - idealDISC.S);
      compatibilityScore += Math.max(0, 25 - (scoreDiff * 0.25));
    }
    if (idealDISC.C !== undefined) {
      maxScore += 25;
      const scoreDiff = Math.abs(discResult.cScore - idealDISC.C);
      compatibilityScore += Math.max(0, 25 - (scoreDiff * 0.25));
    }

    const finalScore = maxScore > 0 ? Math.round((compatibilityScore / maxScore) * 100) : 0;

    res.json({
      success: true,
      data: {
        compatibilityScore: finalScore,
        candidateScores: {
          D: discResult.dScore,
          I: discResult.iScore,
          S: discResult.sScore,
          C: discResult.cScore
        },
        idealScores: idealDISC,
        analysis: {
          primaryMatch: discResult.primaryStyle === idealDISC.primaryStyle,
          scoreBreakdown: {
            D: idealDISC.D ? Math.max(0, 25 - (Math.abs(discResult.dScore - idealDISC.D) * 0.25)) : null,
            I: idealDISC.I ? Math.max(0, 25 - (Math.abs(discResult.iScore - idealDISC.I) * 0.25)) : null,
            S: idealDISC.S ? Math.max(0, 25 - (Math.abs(discResult.sScore - idealDISC.S) * 0.25)) : null,
            C: idealDISC.C ? Math.max(0, 25 - (Math.abs(discResult.cScore - idealDISC.C) * 0.25)) : null
          }
        }
      }
    });

  } catch (error) {
    console.error('Error calculating DISC compatibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate DISC compatibility'
    });
  }
});

/**
 * GET /api/disc/summary/:candidateId
 * Get DISC assessment summary for a candidate across all assessments
 */
router.get('/summary/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;

    const discResults = await prisma.dISCResult.findMany({
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

    if (discResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No DISC results found for this candidate'
      });
    }

    // Calculate average scores across all assessments
    const totalScores = discResults.reduce((acc, result) => {
      acc.D += result.dScore;
      acc.I += result.iScore;
      acc.S += result.sScore;
      acc.C += result.cScore;
      return acc;
    }, { D: 0, I: 0, S: 0, C: 0 });

    const avgScores = {
      D: Math.round(totalScores.D / discResults.length),
      I: Math.round(totalScores.I / discResults.length),
      S: Math.round(totalScores.S / discResults.length),
      C: Math.round(totalScores.C / discResults.length)
    };

    // Find most common primary style
    const styleCounts = discResults.reduce((acc, result) => {
      acc[result.primaryStyle] = (acc[result.primaryStyle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonStyle = Object.entries(styleCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    res.json({
      success: true,
      data: {
        candidateId,
        totalAssessments: discResults.length,
        averageScores: avgScores,
        mostCommonPrimaryStyle: mostCommonStyle,
        assessmentHistory: discResults.map(result => ({
          id: result.id,
          assessmentId: result.assessmentId,
          primaryStyle: result.primaryStyle,
          scores: {
            D: result.dScore,
            I: result.iScore,
            S: result.sScore,
            C: result.cScore
          },
          jobPosition: result.assessment.jobPosition.title,
          createdAt: result.createdAt
        })),
        consistency: {
          isConsistent: discResults.every(r => r.primaryStyle === mostCommonStyle),
          variabilityScore: Math.max(...Object.values(styleCounts)) / discResults.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching DISC summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DISC summary'
    });
  }
});

export default router;