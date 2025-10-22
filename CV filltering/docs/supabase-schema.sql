-- ================================================================
-- HR PROFILING PLATFORM - SUPABASE DATABASE SCHEMA
-- ================================================================
-- Version: 1.0
-- Date: 2025-10-22
-- Purpose: Complete database schema for CV screening and profiling
-- ================================================================

-- ================================================================
-- TABLE: candidates (Master data for all candidates)
-- ================================================================
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    birth_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, analyzed, rejected, shortlisted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_candidates_candidate_id ON candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);

-- ================================================================
-- TABLE: cv_analyses (CV Parsing Results)
-- ================================================================
CREATE TABLE IF NOT EXISTS cv_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id VARCHAR(100) NOT NULL,
    file_name VARCHAR(500),
    parsing_method VARCHAR(50), -- gemini, rule-based, manual
    ai_used BOOLEAN DEFAULT FALSE,
    
    -- Extracted data
    personal_info JSONB,  -- {name, email, phone, address}
    education JSONB,      -- Array of education entries
    experience JSONB,     -- Array of experience entries
    skills JSONB,         -- Array of skills
    
    -- Metadata
    source_info JSONB,    -- {type, aiUsed, warning}
    raw_response JSONB,   -- Complete raw parsing response
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by VARCHAR(100) DEFAULT 'backend-v1',
    
    -- Foreign key
    CONSTRAINT fk_cv_candidate FOREIGN KEY (candidate_id) 
        REFERENCES candidates(candidate_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cv_analyses_candidate_id ON cv_analyses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_ai_used ON cv_analyses(ai_used);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_created_at ON cv_analyses(created_at DESC);

-- ================================================================
-- TABLE: numerology_data (Thần số học calculations)
-- ================================================================
CREATE TABLE IF NOT EXISTS numerology_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id VARCHAR(100) NOT NULL,
    
    -- Calculation inputs
    name_used VARCHAR(255),
    birth_date_used DATE,
    
    -- Results
    life_path_number INTEGER,
    birth_number INTEGER,
    life_path_meaning TEXT,
    birth_meaning TEXT,
    compatibility_note TEXT,
    
    -- Calculation details
    name_calculation JSONB,   -- Detailed breakdown
    birth_calculation JSONB,  -- Detailed breakdown
    combined_insight JSONB,   -- Full insight data
    
    -- Status
    calculation_status VARCHAR(50), -- available, missing-data, not-calculated
    warnings JSONB,            -- Array of warning messages
    is_manual_input BOOLEAN DEFAULT FALSE,
    recruiter_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_by VARCHAR(100) DEFAULT 'backend-v1',
    
    -- Foreign key
    CONSTRAINT fk_numerology_candidate FOREIGN KEY (candidate_id) 
        REFERENCES candidates(candidate_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_numerology_candidate_id ON numerology_data(candidate_id);
CREATE INDEX IF NOT EXISTS idx_numerology_status ON numerology_data(calculation_status);
CREATE INDEX IF NOT EXISTS idx_numerology_created_at ON numerology_data(created_at DESC);

-- ================================================================
-- TABLE: disc_assessments (DISC Profile Data)
-- ================================================================
CREATE TABLE IF NOT EXISTS disc_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id VARCHAR(100) NOT NULL,
    
    -- DISC Scores
    d_score INTEGER CHECK (d_score BETWEEN 1 AND 10),
    i_score INTEGER CHECK (i_score BETWEEN 1 AND 10),
    s_score INTEGER CHECK (s_score BETWEEN 1 AND 10),
    c_score INTEGER CHECK (c_score BETWEEN 1 AND 10),
    
    -- Profile Analysis
    primary_style VARCHAR(50),
    secondary_style VARCHAR(50),
    style_intensity VARCHAR(50),
    behavioral_description TEXT,
    
    -- Source information
    upload_method VARCHAR(50), -- manual, csv_upload, ocr_upload, external_link
    source_file_name VARCHAR(500),
    row_index INTEGER,         -- For CSV uploads
    is_ocr_verified BOOLEAN DEFAULT FALSE,
    requires_manual_review BOOLEAN DEFAULT FALSE,
    
    -- Additional data
    raw_data JSONB,            -- Complete raw data
    notes TEXT,
    recruiter_id VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by VARCHAR(100) DEFAULT 'backend-v1',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(100),
    
    -- Foreign key
    CONSTRAINT fk_disc_candidate FOREIGN KEY (candidate_id) 
        REFERENCES candidates(candidate_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_disc_candidate_id ON disc_assessments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_disc_upload_method ON disc_assessments(upload_method);
CREATE INDEX IF NOT EXISTS idx_disc_requires_review ON disc_assessments(requires_manual_review);
CREATE INDEX IF NOT EXISTS idx_disc_created_at ON disc_assessments(created_at DESC);

-- ================================================================
-- TABLE: activity_logs (System Activity Tracking)
-- ================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id VARCHAR(100),
    activity_type VARCHAR(100) NOT NULL, -- cv_upload, numerology_calc, disc_input, etc.
    action VARCHAR(255) NOT NULL,
    status VARCHAR(50),  -- success, failed, pending
    
    -- Details
    details JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    
    -- User/system info
    performed_by VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_candidate_id ON activity_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ================================================================
-- TABLE: screening_results (Consolidated Analysis - LEGACY SUPPORT)
-- ================================================================
-- This table supports the existing stub code structure
CREATE TABLE IF NOT EXISTS screening_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- cv_parsing, numerology, disc_assessment
    raw_data JSONB NOT NULL,
    summary JSONB,
    processed_by VARCHAR(100) DEFAULT 'backend-v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_screening_candidate FOREIGN KEY (candidate_id) 
        REFERENCES candidates(candidate_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_screening_candidate_id ON screening_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_screening_source_type ON screening_results(source_type);
CREATE INDEX IF NOT EXISTS idx_screening_created_at ON screening_results(created_at DESC);

-- ================================================================
-- VIEWS: Convenient data access
-- ================================================================

-- View: Complete candidate profile
CREATE OR REPLACE VIEW candidate_profiles AS
SELECT 
    c.candidate_id,
    c.name,
    c.email,
    c.phone,
    c.birth_date,
    c.status,
    c.created_at,
    
    -- CV data
    cv.id as cv_analysis_id,
    cv.parsing_method,
    cv.ai_used as cv_ai_used,
    cv.personal_info as cv_personal_info,
    
    -- Numerology data
    n.id as numerology_id,
    n.life_path_number,
    n.birth_number,
    n.calculation_status as numerology_status,
    
    -- DISC data
    d.id as disc_id,
    d.d_score,
    d.i_score,
    d.s_score,
    d.c_score,
    d.primary_style as disc_primary_style,
    d.upload_method as disc_method
    
FROM candidates c
LEFT JOIN cv_analyses cv ON c.candidate_id = cv.candidate_id
LEFT JOIN numerology_data n ON c.candidate_id = n.candidate_id
LEFT JOIN disc_assessments d ON c.candidate_id = d.candidate_id;

-- ================================================================
-- FUNCTIONS: Auto-update timestamps
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) - Enable for production
-- ================================================================
-- Uncomment these lines when ready to enable RLS

-- ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cv_analyses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE numerology_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE disc_assessments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (customize based on your auth setup):
-- CREATE POLICY "Users can view their own candidates" ON candidates
--     FOR SELECT USING (auth.uid() = recruiter_id);

-- ================================================================
-- INITIAL DATA (Optional - for testing)
-- ================================================================

-- Sample candidate for testing
INSERT INTO candidates (candidate_id, name, email, status)
VALUES 
    ('TEST-001', 'Nguyễn Văn Test', 'test@example.com', 'pending')
ON CONFLICT (candidate_id) DO NOTHING;

-- ================================================================
-- END OF SCHEMA
-- ================================================================

-- Verification queries:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM candidate_profiles LIMIT 5;
