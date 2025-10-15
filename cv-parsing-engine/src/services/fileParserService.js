/**
 * File Parser Service
 * Handles multi-format CV file parsing (.pdf, .docx)
 */

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { logger } = require('../utils/logger');

class FileParserService {
  /**
   * Extract text from uploaded CV file
   * @param {string} filePath - Path to uploaded file
   * @returns {string} Extracted text content
   */
  static async extractText(filePath) {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileExtension = path.extname(filePath).toLowerCase();
      logger.debug('Extracting text from file', { filePath, extension: fileExtension });

      let extractedText = '';

      switch (fileExtension) {
        case '.pdf':
          extractedText = await this.parsePDF(filePath);
          break;
        
        case '.doc':
        case '.docx':
          extractedText = await this.parseDocx(filePath);
          break;
        
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      // Clean and validate extracted text
      extractedText = this.cleanText(extractedText);
      
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Insufficient text content extracted from file');
      }

      logger.info('Text extraction successful', { 
        filePath,
        textLength: extractedText.length 
      });

      return extractedText;

    } catch (error) {
      logger.error('Text extraction failed', { 
        filePath,
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Parse PDF file
   * @param {string} filePath - Path to PDF file
   * @returns {string} Extracted text
   */
  static async parsePDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      return data.text;

    } catch (error) {
      logger.error('PDF parsing failed', { 
        filePath,
        error: error.message 
      });
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Parse DOCX file
   * @param {string} filePath - Path to DOCX file
   * @returns {string} Extracted text
   */
  static async parseDocx(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text content found in DOCX');
      }

      // Log any warnings from mammoth
      if (result.messages && result.messages.length > 0) {
        logger.warn('DOCX parsing warnings', { 
          warnings: result.messages.map(m => m.message) 
        });
      }

      return result.value;

    } catch (error) {
      logger.error('DOCX parsing failed', { 
        filePath,
        error: error.message 
      });
      throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
  }

  /**
   * Clean extracted text
   * @param {string} text - Raw extracted text
   * @returns {string} Cleaned text
   */
  static cleanText(text) {
    if (!text) return '';

    return text
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove multiple newlines
      .replace(/\n+/g, '\n')
      // Remove special characters that might interfere with AI
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Trim whitespace
      .trim();
  }

  /**
   * Get file info for debugging
   * @param {string} filePath - Path to file
   * @returns {Object} File information
   */
  static getFileInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        extension: path.extname(filePath).toLowerCase(),
        name: path.basename(filePath),
        modifiedAt: stats.mtime
      };
    } catch (error) {
      logger.error('Failed to get file info', { filePath, error: error.message });
      return null;
    }
  }
}

module.exports = FileParserService;