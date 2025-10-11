import { Router } from 'express';
import numerologyService from '../services/numerologyService';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/numerology/calculate
router.post('/calculate', async (req, res) => {
  try {
    const { assessmentId, fullName, birthDate } = req.body;

    if (!assessmentId || !fullName || !birthDate) {
      return res.status(400).json({
        error: 'Missing required fields: assessmentId, fullName, birthDate'
      });
    }

    // Validate birth date
    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      return res.status(400).json({
        error: 'Invalid birth date format'
      });
    }

    // Calculate numerology
    const calculation = numerologyService.calculateNumerology(fullName, birthDateObj);

    // Save to database
    const numerologyResult = await prisma.numerologyResult.create({
      data: {
        assessmentId,
        lifePathNumber: calculation.lifePathNumber,
        destinyNumber: calculation.destinyNumber,
        personalityNumber: calculation.personalityNumber,
        soulUrgeNumber: calculation.soulUrgeNumber,
        attitudeLessonNumber: calculation.attitudeLessonNumber,
        birthDayNumber: calculation.birthDayNumber,
        challengeNumbers: JSON.stringify(calculation.challengeNumbers),
        pinnacleNumbers: JSON.stringify(calculation.pinnacleNumbers),
        personalYearNumber: calculation.personalYearNumber,
        coreTraits: JSON.stringify(calculation.coreTraits),
        strengths: JSON.stringify(calculation.strengths),
        challenges: JSON.stringify(calculation.challenges),
        careerGuidance: JSON.stringify(calculation.careerGuidance),
        relationships: JSON.stringify(calculation.relationships),
        lifeCycle: JSON.stringify(calculation.lifeCycle),
        analysis: calculation.analysis,
        compatibility: JSON.stringify(calculation.compatibility)
      }
    });

    res.json({
      message: 'Numerology calculation completed successfully',
      data: {
        ...calculation,
        id: numerologyResult.id
      }
    });

  } catch (error) {
    console.error('Numerology calculation error:', error);
    res.status(500).json({
      error: 'Internal server error during numerology calculation'
    });
  }
});

// GET /api/numerology/assessment/:assessmentId
router.get('/assessment/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const numerologyResult = await prisma.numerologyResult.findUnique({
      where: {
        assessmentId
      }
    });

    if (!numerologyResult) {
      return res.status(404).json({
        error: 'Numerology result not found for this assessment'
      });
    }

    // Parse JSON fields
    const result = {
      ...numerologyResult,
      challengeNumbers: JSON.parse(numerologyResult.challengeNumbers),
      pinnacleNumbers: JSON.parse(numerologyResult.pinnacleNumbers),
      coreTraits: JSON.parse(numerologyResult.coreTraits),
      strengths: JSON.parse(numerologyResult.strengths),
      challenges: JSON.parse(numerologyResult.challenges),
      careerGuidance: JSON.parse(numerologyResult.careerGuidance),
      relationships: JSON.parse(numerologyResult.relationships),
      lifeCycle: JSON.parse(numerologyResult.lifeCycle),
      compatibility: JSON.parse(numerologyResult.compatibility)
    };

    res.json({
      message: 'Numerology result retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Get numerology result error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /api/numerology/quick-calculate
router.post('/quick-calculate', async (req, res) => {
  try {
    const { fullName, birthDate } = req.body;

    if (!fullName || !birthDate) {
      return res.status(400).json({
        error: 'Missing required fields: fullName, birthDate'
      });
    }

    // Validate birth date
    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      return res.status(400).json({
        error: 'Invalid birth date format'
      });
    }

    // Calculate numerology without saving to database
    const calculation = numerologyService.calculateNumerology(fullName, birthDateObj);

    res.json({
      message: 'Quick numerology calculation completed',
      data: calculation
    });

  } catch (error) {
    console.error('Quick numerology calculation error:', error);
    res.status(500).json({
      error: 'Internal server error during calculation'
    });
  }
});

// GET /api/numerology/life-path/:number
router.get('/life-path/:number', async (req, res) => {
  try {
    const { number } = req.params;
    const lifePathNumber = parseInt(number);

    if (isNaN(lifePathNumber) || lifePathNumber < 1 || lifePathNumber > 33) {
      return res.status(400).json({
        error: 'Invalid life path number. Must be between 1 and 33'
      });
    }

    const coreTraits = numerologyService.getCoreTraits(lifePathNumber);
    const careerGuidance = numerologyService.getCareerGuidance(lifePathNumber, lifePathNumber, []);
    
    // Mock harmony analysis
    const mockBirthDate = new Date('2000-01-01');
    const harmonyAnalysis = numerologyService.getHarmonyOfSpheres(lifePathNumber, mockBirthDate);

    res.json({
      message: 'Life path information retrieved',
      data: {
        lifePathNumber,
        coreTraits,
        careerGuidance,
        harmonyAnalysis
      }
    });

  } catch (error) {
    console.error('Get life path info error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /api/numerology/compatibility
router.get('/compatibility', async (req, res) => {
  try {
    const { lifePath, destiny, personality, masterNumbers } = req.query;

    const lifePathNumber = parseInt(lifePath as string);
    const destinyNumber = parseInt(destiny as string);
    const personalityNumber = parseInt(personality as string);
    const masterNumbersArray = masterNumbers ? 
      (masterNumbers as string).split(',').map(n => parseInt(n)) : [];

    if (isNaN(lifePathNumber) || isNaN(destinyNumber) || isNaN(personalityNumber)) {
      return res.status(400).json({
        error: 'Invalid number parameters'
      });
    }

    const compatibility = numerologyService.calculateJobCompatibility(
      lifePathNumber, 
      destinyNumber, 
      personalityNumber, 
      masterNumbersArray
    );

    res.json({
      message: 'Job compatibility calculated',
      data: compatibility
    });

  } catch (error) {
    console.error('Calculate compatibility error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;