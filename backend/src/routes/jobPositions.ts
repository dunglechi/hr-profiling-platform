import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all job positions
router.get('/', async (req, res) => {
  try {
    const jobPositions = await prisma.jobPosition.findMany({
      where: { isActive: true },
      include: {
        assessments: {
          select: { id: true, status: true, totalScore: true }
        }
      }
    });
    
    res.json(jobPositions);
  } catch (error) {
    console.error('Error fetching job positions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new job position
router.post('/', async (req, res) => {
  try {
    const { title, description, requirements, weights } = req.body;
    
    const jobPosition = await prisma.jobPosition.create({
      data: {
        title,
        description,
        requirements,
        weights
      }
    });
    
    res.status(201).json(jobPosition);
  } catch (error) {
    console.error('Error creating job position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get job position by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const jobPosition = await prisma.jobPosition.findUnique({
      where: { id },
      include: {
        assessments: {
          include: {
            candidate: {
              select: { fullName: true, id: true }
            }
          }
        }
      }
    });
    
    if (!jobPosition) {
      return res.status(404).json({ error: 'Job position not found' });
    }
    
    res.json(jobPosition);
  } catch (error) {
    console.error('Error fetching job position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update job position
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements, weights, isActive } = req.body;
    
    const updatedJobPosition = await prisma.jobPosition.update({
      where: { id },
      data: {
        title,
        description,
        requirements,
        weights,
        isActive
      }
    });
    
    res.json(updatedJobPosition);
  } catch (error) {
    console.error('Error updating job position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;