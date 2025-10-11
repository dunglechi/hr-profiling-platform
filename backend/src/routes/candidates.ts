import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all candidates (for admin/HR)
router.get('/', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        user: {
          select: { email: true, role: true }
        },
        assessments: {
          include: {
            jobPosition: {
              select: { title: true }
            }
          }
        }
      }
    });
    
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get candidate profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, role: true }
        },
        assessments: {
          include: {
            jobPosition: true,
            discResult: true,
            mbtiResult: true,
            numerologyResult: true,
            cvAnalysis: true
          }
        }
      }
    });
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update candidate profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, birthDate, phone } = req.body;
    
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: {
        fullName,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        phone
      },
      include: {
        user: {
          select: { email: true, role: true }
        }
      }
    });
    
    res.json(updatedCandidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;