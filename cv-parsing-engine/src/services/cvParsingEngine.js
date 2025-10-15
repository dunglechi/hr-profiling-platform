/**
 * CV Parsing Engine Core Service
 * AI-powered CV parsing using Gemini API
 * 
 * CTO Requirements:
 * - Multi-format support (.pdf, .docx)
 * - Gemini API integration
 * - Structured JSON output
 * - Error handling
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const FileParserService = require('./fileParserService');
const NumerologyService = require('./numerologyService');
const { logger } = require('../utils/logger');

class CVParsingEngine {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * Main CV parsing function
   * @param {string} filePath - Path to uploaded CV file
   * @returns {Object} Parsed CV data with numerology
   */
  async parseCV(filePath) {
    try {
      logger.info('Starting CV parsing', { filePath });

      // Step 1: Extract text from file
      const extractedText = await FileParserService.extractText(filePath);
      logger.debug('Text extracted', { textLength: extractedText.length });

      // Step 2: AI-powered information extraction
      const parsedData = await this.extractInformationWithAI(extractedText);
      logger.debug('AI extraction completed', { parsedData });

      // Step 3: Generate numerology analysis if birth date available
      let numerologyData = null;
      if (parsedData.candidateInfo.birthDate) {
        numerologyData = NumerologyService.calculateNumerology(
          parsedData.candidateInfo.birthDate,
          parsedData.candidateInfo.name
        );
        logger.debug('Numerology calculated', { numerologyData });
      }

      // Step 4: Combine results
      const result = {
        ...parsedData,
        numerology: numerologyData,
        processingMetadata: {
          processedAt: new Date().toISOString(),
          textLength: extractedText.length,
          hasNumerology: !!numerologyData
        }
      };

      logger.info('CV parsing completed successfully');
      return result;

    } catch (error) {
      logger.error('CV parsing failed', { 
        error: error.message,
        filePath 
      });
      throw error;
    }
  }

  /**
   * Extract structured information using Gemini AI
   * @param {string} text - Raw CV text
   * @returns {Object} Structured CV data
   */
  async extractInformationWithAI(text) {
    const prompt = `
    Analyze this CV text and extract the following information in JSON format.
    Return ONLY valid JSON without any explanation or markdown formatting.

    Required structure:
    {
      "candidateInfo": {
        "name": "Full name",
        "email": "email@example.com",
        "phone": "phone number",
        "birthDate": "YYYY-MM-DD or null if not found"
      },
      "experience": {
        "years": number_of_years,
        "positions": [
          {
            "title": "Job title",
            "company": "Company name",
            "duration": "Duration",
            "description": "Brief description"
          }
        ],
        "industries": ["industry1", "industry2"]
      },
      "skills": {
        "technical": ["skill1", "skill2"],
        "soft": ["skill1", "skill2"],
        "languages": ["language1", "language2"]
      },
      "education": [
        {
          "degree": "Degree name",
          "institution": "Institution name",
          "year": year_or_null,
          "major": "Major/Field of study"
        }
      ]
    }

    CV Text:
    ${text}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const extractedText = response.text();

      // Clean the response (remove markdown formatting if present)
      const cleanedText = extractedText.replace(/```json\n?|\n?```/g, '').trim();
      
      // Parse JSON
      const parsedData = JSON.parse(cleanedText);
      
      // Validate required structure
      this.validateParsedData(parsedData);
      
      return parsedData;

    } catch (error) {
      logger.error('AI extraction failed', { 
        error: error.message 
      });
      
      // Return default structure if AI fails
      return this.getDefaultStructure();
    }
  }

  /**
   * Validate parsed data structure
   * @param {Object} data - Parsed data to validate
   */
  validateParsedData(data) {
    const required = ['candidateInfo', 'experience', 'skills', 'education'];
    
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate candidateInfo
    if (!data.candidateInfo.name) {
      throw new Error('Candidate name is required');
    }

    // Ensure arrays exist
    data.experience.positions = data.experience.positions || [];
    data.experience.industries = data.experience.industries || [];
    data.skills.technical = data.skills.technical || [];
    data.skills.soft = data.skills.soft || [];
    data.skills.languages = data.skills.languages || [];
    data.education = data.education || [];
  }

  /**
   * Get default structure when AI extraction fails
   * @returns {Object} Default CV structure
   */
  getDefaultStructure() {
    return {
      candidateInfo: {
        name: "Unknown",
        email: null,
        phone: null,
        birthDate: null
      },
      experience: {
        years: 0,
        positions: [],
        industries: []
      },
      skills: {
        technical: [],
        soft: [],
        languages: []
      },
      education: []
    };
  }
}

module.exports = new CVParsingEngine();