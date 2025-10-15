/**
 * Database Service
 * Supabase integration for CV parsing data
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

class DatabaseService {
  constructor() {
    // Only initialize Supabase if credentials are provided
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
      this.isConfigured = true;
    } else {
      this.supabase = null;
      this.isConfigured = false;
      logger.warn('Supabase credentials not provided - database features disabled');
    }
  }

  /**
   * Save candidate data to database
   * @param {Object} cvData - Parsed CV data
   * @returns {string} Candidate ID
   */
  async saveCandidate(cvData) {
    if (!this.isConfigured) {
      logger.warn('Database not configured - returning mock candidate ID');
      return 'mock-candidate-' + Date.now();
    }

    try {
      const candidateId = uuidv4();
      
      logger.debug('Saving candidate to database', { candidateId });

      // Prepare candidate data
      const candidateRecord = {
        id: candidateId,
        name: cvData.candidateInfo.name,
        email: cvData.candidateInfo.email,
        phone: cvData.candidateInfo.phone,
        birth_date: cvData.candidateInfo.birthDate,
        cv_data: {
          experience: cvData.experience,
          skills: cvData.skills,
          education: cvData.education,
          processingMetadata: cvData.processingMetadata
        },
        numerology_data: cvData.numerology,
        created_at: new Date().toISOString()
      };

      // Insert candidate
      const { data, error } = await this.supabase
        .from('candidates')
        .insert([candidateRecord])
        .select();

      if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
      }

      logger.info('Candidate saved successfully', { candidateId });
      return candidateId;

    } catch (error) {
      logger.error('Failed to save candidate', { 
        error: error.message,
        candidateName: cvData.candidateInfo?.name 
      });
      throw error;
    }
  }

  /**
   * Get candidate by ID
   * @param {string} candidateId - Candidate ID
   * @returns {Object} Candidate data
   */
  async getCandidate(candidateId) {
    try {
      logger.debug('Retrieving candidate', { candidateId });

      const { data, error } = await this.supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Database query failed: ${error.message}`);
      }

      logger.debug('Candidate retrieved', { candidateId });
      return data;

    } catch (error) {
      logger.error('Failed to retrieve candidate', { 
        candidateId,
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Save job requisition
   * @param {Object} jobData - Job requisition data
   * @returns {string} Job ID
   */
  async saveJobRequisition(jobData) {
    try {
      const jobId = uuidv4();
      
      logger.debug('Saving job requisition', { jobId });

      const jobRecord = {
        id: jobId,
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        created_by: jobData.createdBy,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('job_requisitions')
        .insert([jobRecord])
        .select();

      if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
      }

      logger.info('Job requisition saved', { jobId });
      return jobId;

    } catch (error) {
      logger.error('Failed to save job requisition', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Save screening results
   * @param {Object} screeningData - Screening results
   * @returns {string} Result ID
   */
  async saveScreeningResult(screeningData) {
    try {
      const resultId = uuidv4();
      
      logger.debug('Saving screening result', { resultId });

      const resultRecord = {
        id: resultId,
        candidate_id: screeningData.candidateId,
        job_requisition_id: screeningData.jobId,
        cv_score: screeningData.cvScore,
        numerology_score: screeningData.numerologyScore,
        disc_score: screeningData.discScore,
        overall_score: screeningData.overallScore,
        recommendations: screeningData.recommendations,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('screening_results')
        .insert([resultRecord])
        .select();

      if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
      }

      logger.info('Screening result saved', { resultId });
      return resultId;

    } catch (error) {
      logger.error('Failed to save screening result', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get candidates for job
   * @param {string} jobId - Job requisition ID
   * @returns {Array} List of candidates
   */
  async getCandidatesForJob(jobId) {
    try {
      logger.debug('Getting candidates for job', { jobId });

      const { data, error } = await this.supabase
        .from('candidates')
        .select(`
          *,
          screening_results (*)
        `)
        .eq('job_requisition_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      logger.debug('Candidates retrieved', { 
        jobId, 
        count: data?.length || 0 
      });
      
      return data || [];

    } catch (error) {
      logger.error('Failed to get candidates for job', { 
        jobId,
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Test database connection
   * @returns {boolean} Connection status
   */
  async testConnection() {
    if (!this.isConfigured) {
      logger.info('Database not configured - skipping connection test');
      return false;
    }

    try {
      const { data, error } = await this.supabase
        .from('candidates')
        .select('count', { count: 'exact', head: true });

      if (error) {
        throw new Error(`Connection test failed: ${error.message}`);
      }

      logger.info('Database connection successful');
      return true;

    } catch (error) {
      logger.error('Database connection failed', { 
        error: error.message 
      });
      return false;
    }
  }
}

module.exports = new DatabaseService();