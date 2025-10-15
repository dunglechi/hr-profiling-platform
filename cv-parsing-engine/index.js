require('dotenv').config();

/**
 * CV Parsing Engine - Main Entry Point
 * CTO-approved project for HR screening tool
 * 
 * Architecture Overview:
 * - File parsing: PDF, DOCX support
 * - AI extraction: Gemini API integration
 * - Database: Supabase with RLS
 * - Output: Structured JSON + Numerology
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const CVParsingEngine = require('./src/services/cvParsingEngine');
const DatabaseService = require('./src/services/databaseService');
const { logger } = require('./src/utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'CV Parsing Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// CV parsing endpoint
app.post('/api/parse-cv', upload.single('cv'), async (req, res) => {
  try {
    logger.info('CV parsing request received', { 
      filename: req.file?.originalname,
      size: req.file?.size 
    });

    if (!req.file) {
      return res.status(400).json({ 
        error: 'No CV file uploaded' 
      });
    }

    // Parse CV using AI engine
    const result = await CVParsingEngine.parseCV(req.file.path);
    
    // Save to database
    const candidateId = await DatabaseService.saveCandidate(result);
    
    logger.info('CV parsed successfully', { 
      candidateId,
      filename: req.file.originalname 
    });

    res.json({
      success: true,
      candidateId,
      data: result
    });

  } catch (error) {
    logger.error('CV parsing failed', { 
      error: error.message,
      stack: error.stack 
    });

    res.status(500).json({ 
      error: 'Failed to parse CV',
      message: error.message 
    });
  }
});

// Get candidate data
app.get('/api/candidates/:id', async (req, res) => {
  try {
    const candidate = await DatabaseService.getCandidate(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ 
        error: 'Candidate not found' 
      });
    }

    res.json({ 
      success: true, 
      data: candidate 
    });

  } catch (error) {
    logger.error('Failed to retrieve candidate', { 
      candidateId: req.params.id,
      error: error.message 
    });

    res.status(500).json({ 
      error: 'Failed to retrieve candidate' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`CV Parsing Engine started on port ${PORT}`);
  console.log('🚀 CV Parsing Engine started');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🧪 Quick test: npm run test`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

module.exports = app;