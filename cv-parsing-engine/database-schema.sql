-- CV Parsing Engine Database Schema
-- Supabase SQL for CTO-approved HR Screening Tool
-- 
-- Tables: job_requisitions, candidates, screening_results
-- Features: RLS policies, proper indexing, constraints

-- =====================================================
-- 1. JOB REQUISITIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS job_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requirements JSONB DEFAULT '{}',
  screening_criteria JSONB DEFAULT '{
    "cv_weight": 40,
    "disc_weight": 35, 
    "numerology_weight": 25,
    "minimum_score": 60
  }',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for job_requisitions
CREATE INDEX IF NOT EXISTS idx_job_requisitions_created_by ON job_requisitions(created_by);
CREATE INDEX IF NOT EXISTS idx_job_requisitions_status ON job_requisitions(status);
CREATE INDEX IF NOT EXISTS idx_job_requisitions_created_at ON job_requisitions(created_at DESC);

-- =====================================================
-- 2. CANDIDATES TABLE  
-- =====================================================

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_requisition_id UUID REFERENCES job_requisitions(id) ON DELETE CASCADE,
  
  -- Basic candidate info (extracted from CV)
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  birth_date DATE,
  
  -- CV parsing results
  cv_data JSONB DEFAULT '{}', -- {experience, skills, education, processingMetadata}
  cv_file_name VARCHAR(255),
  cv_file_size INTEGER,
  cv_processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Numerology analysis
  numerology_data JSONB DEFAULT '{}', -- {lifePathNumber, destinyNumber, interpretation, etc.}
  
  -- DISC assessment (will be populated later)
  disc_data JSONB DEFAULT '{}', -- {assessment_id, scores, profile, etc.}
  disc_assessment_sent_at TIMESTAMP WITH TIME ZONE,
  disc_assessment_completed_at TIMESTAMP WITH TIME ZONE,
  disc_assessment_link VARCHAR(500),
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'cv_parsed' CHECK (status IN (
    'cv_parsed', 'disc_invited', 'disc_completed', 'screening_complete'
  )),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for candidates
CREATE INDEX IF NOT EXISTS idx_candidates_job_requisition ON candidates(job_requisition_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates USING GIN (to_tsvector('english', name));

-- =====================================================
-- 3. SCREENING RESULTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS screening_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  job_requisition_id UUID REFERENCES job_requisitions(id) ON DELETE CASCADE,
  
  -- Individual scores (0-100 scale)
  cv_score INTEGER CHECK (cv_score >= 0 AND cv_score <= 100),
  numerology_score INTEGER CHECK (numerology_score >= 0 AND numerology_score <= 100),
  disc_score INTEGER CHECK (disc_score >= 0 AND disc_score <= 100),
  
  -- Calculated overall score
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- Screening recommendation
  recommendation VARCHAR(50) CHECK (recommendation IN (
    'strong_hire', 'hire', 'consider', 'follow_up', 'not_recommended'
  )),
  
  -- Analysis details
  analysis_details JSONB DEFAULT '{}', -- {strengths, concerns, cultural_fit, etc.}
  recommendations TEXT,
  
  -- Processing metadata
  analysis_type VARCHAR(50) DEFAULT 'partial' CHECK (analysis_type IN ('complete', 'partial')),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for screening_results
CREATE INDEX IF NOT EXISTS idx_screening_results_candidate ON screening_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_job ON screening_results(job_requisition_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_overall_score ON screening_results(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_screening_results_recommendation ON screening_results(recommendation);
CREATE INDEX IF NOT EXISTS idx_screening_results_processed_at ON screening_results(processed_at DESC);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE job_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;

-- Job Requisitions RLS Policies
CREATE POLICY "Users can view their own job requisitions" ON job_requisitions
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create job requisitions" ON job_requisitions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own job requisitions" ON job_requisitions
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own job requisitions" ON job_requisitions
  FOR DELETE USING (auth.uid() = created_by);

-- Candidates RLS Policies
CREATE POLICY "Users can view candidates for their jobs" ON candidates
  FOR SELECT USING (
    job_requisition_id IN (
      SELECT id FROM job_requisitions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert candidates for their jobs" ON candidates
  FOR INSERT WITH CHECK (
    job_requisition_id IN (
      SELECT id FROM job_requisitions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update candidates for their jobs" ON candidates
  FOR UPDATE USING (
    job_requisition_id IN (
      SELECT id FROM job_requisitions WHERE created_by = auth.uid()
    )
  );

-- Screening Results RLS Policies  
CREATE POLICY "Users can view screening results for their jobs" ON screening_results
  FOR SELECT USING (
    job_requisition_id IN (
      SELECT id FROM job_requisitions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert screening results for their jobs" ON screening_results
  FOR INSERT WITH CHECK (
    job_requisition_id IN (
      SELECT id FROM job_requisitions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update screening results for their jobs" ON screening_results
  FOR UPDATE USING (
    job_requisition_id IN (
      SELECT id FROM job_requisitions WHERE created_by = auth.uid()
    )
  );

-- =====================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for each table
CREATE TRIGGER update_job_requisitions_updated_at
    BEFORE UPDATE ON job_requisitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screening_results_updated_at
    BEFORE UPDATE ON screening_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. USEFUL VIEWS FOR REPORTING
-- =====================================================

-- View for candidate summary with scores
CREATE OR REPLACE VIEW candidate_summary AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.status,
  jr.title as job_title,
  sr.overall_score,
  sr.cv_score,
  sr.numerology_score,
  sr.disc_score,
  sr.recommendation,
  c.created_at,
  sr.processed_at
FROM candidates c
JOIN job_requisitions jr ON c.job_requisition_id = jr.id
LEFT JOIN screening_results sr ON c.id = sr.candidate_id
ORDER BY sr.overall_score DESC NULLS LAST, c.created_at DESC;

-- View for job requisition stats
CREATE OR REPLACE VIEW job_stats AS
SELECT 
  jr.id,
  jr.title,
  jr.status,
  COUNT(c.id) as total_candidates,
  COUNT(CASE WHEN c.status = 'disc_completed' THEN 1 END) as completed_assessments,
  AVG(sr.overall_score) as average_score,
  COUNT(CASE WHEN sr.recommendation = 'strong_hire' THEN 1 END) as strong_hires,
  COUNT(CASE WHEN sr.recommendation = 'hire' THEN 1 END) as hires,
  jr.created_at
FROM job_requisitions jr
LEFT JOIN candidates c ON jr.id = c.job_requisition_id
LEFT JOIN screening_results sr ON c.id = sr.candidate_id
GROUP BY jr.id, jr.title, jr.status, jr.created_at
ORDER BY jr.created_at DESC;

-- =====================================================
-- 7. SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- Insert sample job requisition (will use actual user_id in production)
-- INSERT INTO job_requisitions (title, description, requirements, created_by)
-- VALUES (
--   'Senior Software Engineer',
--   'We are looking for an experienced software engineer...',
--   '{"skills": ["JavaScript", "React", "Node.js"], "experience": "3+ years"}',
--   auth.uid() -- This will be replaced with actual user ID
-- );

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Database setup complete!
-- Run this script in Supabase SQL Editor to create the schema.