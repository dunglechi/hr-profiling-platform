import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all assessments
router.get('/', async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        candidate: {
          select: { fullName: true, id: true }
        },
        jobPosition: {
          select: { title: true, id: true }
        },
        discResult: true,
        mbtiResult: true,
        numerologyResult: true,
        cvAnalysis: true
      }
    });
    
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new assessment
router.post('/', async (req, res) => {
  try {
    const { candidateId, jobPositionId } = req.body;
    
    const assessment = await prisma.assessment.create({
      data: {
        candidateId,
        jobPositionId,
        status: 'PENDING'
      },
      include: {
        candidate: true,
        jobPosition: true
      }
    });
    
    res.status(201).json(assessment);
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assessment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        candidate: true,
        jobPosition: true,
        discResult: true,
        mbtiResult: true,
        numerologyResult: true,
        cvAnalysis: true
      }
    });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit DISC test results
router.post('/:id/disc', async (req, res) => {
  try {
    const { id } = req.params;
    const { dScore, iScore, sScore, cScore, primaryStyle, analysis } = req.body;
    
    const discResult = await prisma.dISCResult.create({
      data: {
        assessmentId: id,
        dScore,
        iScore,
        sScore,
        cScore,
        primaryStyle,
        analysis
      }
    });
    
    res.status(201).json(discResult);
  } catch (error) {
    console.error('Error saving DISC results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit MBTI test results
router.post('/:id/mbti', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, dimensions, analysis } = req.body;
    
    const mbtiResult = await prisma.mBTIResult.create({
      data: {
        assessmentId: id,
        type,
        dimensions,
        analysis
      }
    });
    
    res.status(201).json(mbtiResult);
  } catch (error) {
    console.error('Error saving MBTI results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;