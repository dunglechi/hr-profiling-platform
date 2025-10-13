/**
 * AI-Powered CV Analysis API Routes
 * 
 * Endpoints for AI-powered CV analysis and job matching:
 * - Upload and analyze CV
 * - Get CV analysis results
 * - Calculate AI job compatibility
 */

import express from 'express';
import multer from 'multer';
import pdf from 'pdf-parse';
import { PrismaClient } from '@prisma/client';
import aiService from '../services/aiService';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('text/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'));
    }
  }
});

/**
 * POST /api/ai/cv-analysis
 * Upload and analyze CV using AI
 */
router.post('/cv-analysis', upload.single('cv'), async (req, res) => {
  try {
    const { assessmentId, jobPositionId, includePersonalityIntegration } = req.body;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        error: 'Assessment ID is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'CV file is required'
      });
    }

    // Verify assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { candidate: true }
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    // Extract text from uploaded file
    let cvText = '';
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdf(req.file.buffer);
      cvText = pdfData.text;
    } else {
      cvText = req.file.buffer.toString('utf-8');
    }

    if (!cvText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'No text could be extracted from the uploaded file'
      });
    }

    // Perform AI analysis
    const analysisResult = await aiService.analyzeCVWithAI({
      candidateId: assessment.candidateId,
      cvText,
      jobPositionId,
      includePersonalityIntegration: includePersonalityIntegration === 'true'
    });

    // Save analysis to database
    const savedAnalysisId = await aiService.saveCVAnalysis(
      assessmentId,
      analysisResult,
      cvText
    );

    res.json({
      success: true,
      data: {
        analysisId: savedAnalysisId,
        candidateInfo: analysisResult.candidateInfo,
        experience: analysisResult.experience,
        education: analysisResult.education,
        skills: analysisResult.skills,
        achievements: analysisResult.achievements,
        jobCompatibility: analysisResult.jobCompatibility,
        personalityIntegration: analysisResult.personalityIntegration,
        aiInsights: analysisResult.aiInsights
      },
      message: 'CV analysis completed successfully'
    });

  } catch (error) {
    console.error('Error in CV analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze CV'
    });
  }
});

/**
 * GET /api/ai/cv-analysis/:assessmentId
 * Get CV analysis results for an assessment
 */
router.get('/cv-analysis/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const analysis = await aiService.getCVAnalysis(assessmentId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'CV analysis not found for this assessment'
      });
    }

    res.json({
      success: true,
      data: {
        id: analysis.id,
        assessmentId: analysis.assessmentId,
        candidateInfo: {
          name: analysis.assessment.candidate.fullName,
          summary: analysis.aiSummary
        },
        skills: analysis.skillsData,
        experience: analysis.experienceData,
        education: analysis.educationData,
        behavioralIndicators: analysis.behavioralData,
        compatibility: analysis.compatibilityData,
        createdAt: analysis.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching CV analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch CV analysis'
    });
  }
});

/**
 * POST /api/ai/job-compatibility
 * Calculate AI-enhanced job compatibility
 */
router.post('/job-compatibility', async (req, res) => {
  try {
    const { assessmentId, jobPositionId } = req.body;

    if (!assessmentId || !jobPositionId) {
      return res.status(400).json({
        success: false,
        error: 'Assessment ID and Job Position ID are required'
      });
    }

    const compatibility = await aiService.calculateAIJobCompatibility(
      assessmentId,
      jobPositionId
    );

    res.json({
      success: true,
      data: compatibility,
      message: 'Job compatibility analysis completed'
    });

  } catch (error) {
    console.error('Error calculating job compatibility:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate job compatibility'
    });
  }
});

/**
 * POST /api/ai/bulk-analysis
 * Analyze multiple CVs in batch
 */
router.post('/bulk-analysis', upload.array('cvs', 10), async (req, res) => {
  try {
    const { jobPositionId } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one CV file is required'
      });
    }

    const results = [];

    for (const file of files) {
      try {
        // Extract text from file
        let cvText = '';
        if (file.mimetype === 'application/pdf') {
          const pdfData = await pdf(file.buffer);
          cvText = pdfData.text;
        } else {
          cvText = file.buffer.toString('utf-8');
        }

        // Quick analysis (without saving to database)
        const analysisResult = await aiService.analyzeCVWithAI({
          candidateId: 'temp', // Temporary for bulk analysis
          cvText,
          jobPositionId,
          includePersonalityIntegration: false
        });

        results.push({
          filename: file.originalname,
          candidateInfo: analysisResult.candidateInfo,
          jobCompatibility: analysisResult.jobCompatibility,
          aiInsights: analysisResult.aiInsights,
          success: true
        });

      } catch (fileError) {
        results.push({
          filename: file.originalname,
          error: fileError instanceof Error ? fileError.message : 'Analysis failed',
          success: false
        });
      }
    }

    res.json({
      success: true,
      data: {
        totalFiles: files.length,
        successfulAnalyses: results.filter(r => r.success).length,
        results
      },
      message: 'Bulk CV analysis completed'
    });

  } catch (error) {
    console.error('Error in bulk CV analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk CV analysis'
    });
  }
});

/**
 * GET /api/ai/analysis-summary/:candidateId
 * Get comprehensive analysis summary for a candidate
 */
router.get('/analysis-summary/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Get all assessments for the candidate
    const assessments = await prisma.assessment.findMany({
      where: { candidateId },
      include: {
        candidate: true,
        discResult: true,
        mbtiResult: true,
        numerologyResult: true,
        cvAnalysis: true,
        jobPosition: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (assessments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No assessments found for this candidate'
      });
    }

    const candidate = assessments[0].candidate;
    const summary = {
      candidate: {
        id: candidate.id,
        name: candidate.fullName,
        assessmentCount: assessments.length
      },
      assessments: assessments.map(assessment => ({
        id: assessment.id,
        jobPosition: assessment.jobPosition.title,
        status: assessment.status,
        scores: {
          disc: assessment.discResult ? {
            primaryStyle: assessment.discResult.primaryStyle,
            scores: {
              D: assessment.discResult.dScore,
              I: assessment.discResult.iScore,
              S: assessment.discResult.sScore,
              C: assessment.discResult.cScore
            }
          } : null,
          mbti: assessment.mbtiResult ? {
            type: assessment.mbtiResult.type
          } : null,
          numerology: assessment.numerologyResult ? {
            lifePathNumber: assessment.numerologyResult.lifePathNumber,
            destinyNumber: assessment.numerologyResult.destinyNumber
          } : null
        },
        cvAnalysis: assessment.cvAnalysis ? {
          hasCVAnalysis: true,
          summary: assessment.cvAnalysis.aiSummary
        } : null,
        createdAt: assessment.createdAt
      }))
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching analysis summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis summary'
    });
  }
});

export default router;