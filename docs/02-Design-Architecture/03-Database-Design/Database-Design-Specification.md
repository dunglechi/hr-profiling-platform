# SDLC 4.7 - Database Design Specification
## Project: HR Profiling Platform - Database Architecture
### Document ID: DB-DESIGN-001
### Version: 1.0.0
### Date: October 12, 2025
### Status: ACTIVE

---

## 1. Database Overview

### 1.1 Database Architecture Strategy
- **Primary Database**: PostgreSQL 15 for ACID compliance and complex queries
- **Caching Layer**: Redis 7 for session management and high-frequency data
- **Search Engine**: Elasticsearch 8 for full-text search and analytics
- **File Storage**: AWS S3 for document storage with CloudFront CDN
- **Cultural Data**: Specialized schemas for Vietnamese cultural intelligence

### 1.2 Database Design Principles
- **Normalization**: 3NF for core entities, selective denormalization for performance
- **Cultural Sensitivity**: Vietnamese-specific data types and constraints
- **Scalability**: Horizontal partitioning strategy for large datasets
- **Security**: Row-level security and data encryption
- **Audit Trail**: Complete change tracking for compliance
- **Multi-tenancy**: Flexible schema design for future SaaS expansion

## 2. Core Database Schema

### 2.1 User Management Schema

#### 2.1.1 Users Table
```sql
-- =============================================
-- Users Table: Core user information
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    
    -- Vietnamese name support with proper collation
    first_name VARCHAR(100) NOT NULL COLLATE "vi_VN",
    last_name VARCHAR(100) NOT NULL COLLATE "vi_VN", 
    middle_name VARCHAR(100) COLLATE "vi_VN",
    display_name VARCHAR(300) GENERATED ALWAYS AS (
        CASE 
            WHEN middle_name IS NOT NULL THEN 
                last_name || ' ' || middle_name || ' ' || first_name
            ELSE 
                last_name || ' ' || first_name
        END
    ) STORED,
    
    -- Cultural and preference data
    cultural_preferences JSONB DEFAULT '{
        "language": "vi",
        "numerologyEnabled": true,
        "culturalDepth": "detailed",
        "useTraditionalValues": true,
        "preferredDateFormat": "dd/mm/yyyy"
    }'::jsonb,
    
    -- Role and status
    role user_role DEFAULT 'employee',
    status user_status DEFAULT 'active',
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    -- Soft delete
    deleted_at TIMESTAMP,
    deleted_by UUID REFERENCES users(id)
);

-- Custom types for user management
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'admin', 
    'hr_manager',
    'hr_specialist',
    'team_lead',
    'employee',
    'consultant',
    'viewer'
);

CREATE TYPE user_status AS ENUM (
    'active',
    'inactive', 
    'pending_verification',
    'suspended',
    'archived'
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_cultural_lang ON users USING GIN ((cultural_preferences->'language'));
CREATE INDEX idx_users_created_at ON users(created_at);

-- Vietnamese name search index
CREATE INDEX idx_users_display_name_gin ON users USING GIN (to_tsvector('vietnamese', display_name));
```

#### 2.1.2 User Profiles Table
```sql
-- =============================================
-- User Profiles: Extended user information
-- =============================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal information
    birth_date DATE,
    birth_place VARCHAR(200) COLLATE "vi_VN",
    phone_number VARCHAR(20),
    address JSONB, -- Structured Vietnamese address
    
    -- Professional information
    job_title VARCHAR(200) COLLATE "vi_VN",
    department VARCHAR(200) COLLATE "vi_VN",
    company VARCHAR(200) COLLATE "vi_VN",
    employee_id VARCHAR(50),
    hire_date DATE,
    
    -- Vietnamese cultural data
    vietnamese_cultural_data JSONB DEFAULT '{}'::jsonb,
    numerology_data JSONB DEFAULT '{}'::jsonb,
    
    -- Profile completion and quality
    profile_completion_percentage INTEGER DEFAULT 0,
    profile_quality_score DECIMAL(3,2) DEFAULT 0.00,
    
    -- Privacy settings
    privacy_settings JSONB DEFAULT '{
        "showBirthDate": false,
        "showPhone": false,
        "showAddress": false,
        "allowNumerologyAnalysis": true,
        "allowCulturalAnalysis": true
    }'::jsonb,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id)
);

-- Indexes
CREATE INDEX idx_user_profiles_birth_date ON user_profiles(birth_date);
CREATE INDEX idx_user_profiles_company ON user_profiles(company);
CREATE INDEX idx_user_profiles_completion ON user_profiles(profile_completion_percentage);
CREATE INDEX idx_user_profiles_cultural_data ON user_profiles USING GIN (vietnamese_cultural_data);
```

### 2.2 Assessment Schema

#### 2.2.1 Assessments Table
```sql
-- =============================================
-- Assessments: Core assessment tracking
-- =============================================
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_type assessment_type NOT NULL,
    
    -- Assessment configuration
    config JSONB DEFAULT '{}'::jsonb,
    cultural_adaptation BOOLEAN DEFAULT TRUE,
    language VARCHAR(5) DEFAULT 'vi',
    
    -- Status and timing
    status assessment_status DEFAULT 'created',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    estimated_duration_minutes INTEGER,
    actual_duration_seconds INTEGER,
    
    -- Results and scoring
    raw_results JSONB,
    processed_results JSONB,
    cultural_interpretation JSONB,
    quality_score DECIMAL(3,2),
    confidence_level DECIMAL(3,2),
    
    -- Metadata
    assessment_version VARCHAR(20) DEFAULT '1.0',
    administrator_id UUID REFERENCES users(id),
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment types
CREATE TYPE assessment_type AS ENUM (
    'disc',
    'mbti', 
    'numerology',
    'cv_analysis',
    'cultural_assessment',
    'comprehensive'
);

-- Assessment status
CREATE TYPE assessment_status AS ENUM (
    'created',
    'in_progress',
    'paused',
    'completed',
    'expired',
    'cancelled',
    'under_review'
);

-- Indexes
CREATE INDEX idx_assessments_user_type ON assessments(user_id, assessment_type);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_created_at ON assessments(created_at);
CREATE INDEX idx_assessments_cultural ON assessments(cultural_adaptation) WHERE cultural_adaptation = TRUE;
```

#### 2.2.2 DISC Assessment Tables
```sql
-- =============================================
-- DISC Questions: Culturally adapted questions
-- =============================================
CREATE TABLE disc_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_number INTEGER NOT NULL,
    
    -- Multi-language support
    statement_vi TEXT NOT NULL,
    statement_en TEXT NOT NULL,
    
    -- Cultural adaptation
    cultural_context TEXT,
    cultural_notes_vi TEXT,
    cultural_notes_en TEXT,
    
    -- Question metadata
    category disc_category,
    difficulty_level INTEGER DEFAULT 1,
    cultural_sensitivity_level INTEGER DEFAULT 1,
    
    -- Version control
    version VARCHAR(10) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT disc_questions_number_version UNIQUE (question_number, version)
);

CREATE TYPE disc_category AS ENUM ('dominance', 'influence', 'steadiness', 'conscientiousness');

-- =============================================
-- DISC Question Options
-- =============================================
CREATE TABLE disc_question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES disc_questions(id) ON DELETE CASCADE,
    option_number INTEGER NOT NULL,
    
    -- Multi-language options
    text_vi TEXT NOT NULL,
    text_en TEXT NOT NULL,
    
    -- Scoring weights for each DISC dimension
    dominance_weight DECIMAL(3,2) DEFAULT 0.00,
    influence_weight DECIMAL(3,2) DEFAULT 0.00,
    steadiness_weight DECIMAL(3,2) DEFAULT 0.00,
    conscientiousness_weight DECIMAL(3,2) DEFAULT 0.00,
    
    -- Cultural adjustment factors
    vietnamese_cultural_modifier DECIMAL(3,2) DEFAULT 1.00,
    
    CONSTRAINT disc_options_question_number UNIQUE (question_id, option_number)
);

-- =============================================
-- DISC Responses: User answers
-- =============================================
CREATE TABLE disc_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES disc_questions(id),
    
    -- User selections (for forced ranking questions)
    most_like_option_id UUID REFERENCES disc_question_options(id),
    least_like_option_id UUID REFERENCES disc_question_options(id),
    
    -- Response metadata
    response_time_seconds INTEGER,
    cultural_difficulty_rating INTEGER, -- 1-5 scale
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT disc_responses_assessment_question UNIQUE (assessment_id, question_id)
);

-- =============================================
-- DISC Results: Calculated scores and interpretations
-- =============================================
CREATE TABLE disc_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    
    -- Core DISC scores (0-100)
    dominance_score DECIMAL(5,2) NOT NULL,
    influence_score DECIMAL(5,2) NOT NULL,
    steadiness_score DECIMAL(5,2) NOT NULL,
    conscientiousness_score DECIMAL(5,2) NOT NULL,
    
    -- Derived metrics
    primary_type VARCHAR(5) NOT NULL, -- D, I, S, C, DI, DS, etc.
    secondary_type VARCHAR(5),
    intensity_level disc_intensity,
    
    -- Cultural interpretation
    vietnamese_cultural_analysis JSONB,
    career_recommendations JSONB,
    team_role_suggestions JSONB,
    cultural_strengths JSONB,
    development_areas JSONB,
    
    -- Quality metrics
    consistency_score DECIMAL(3,2),
    cultural_adaptation_score DECIMAL(3,2),
    reliability_indicator DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT disc_results_assessment_unique UNIQUE (assessment_id)
);

CREATE TYPE disc_intensity AS ENUM ('low', 'moderate', 'high', 'very_high');
```

### 2.3 Numerology Schema

#### 2.3.1 Numerology Calculations Table
```sql
-- =============================================
-- Numerology Calculations: Vietnamese numerology data
-- =============================================
CREATE TABLE numerology_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Input data
    birth_date DATE NOT NULL,
    full_name_vietnamese TEXT NOT NULL COLLATE "vi_VN",
    calculation_method numerology_method DEFAULT 'pythagorean_vietnamese',
    
    -- Core numbers
    life_path_number INTEGER NOT NULL CHECK (life_path_number BETWEEN 1 AND 9),
    destiny_number INTEGER NOT NULL CHECK (destiny_number BETWEEN 1 AND 9),
    personality_number INTEGER NOT NULL CHECK (personality_number BETWEEN 1 AND 9),
    soul_urge_number INTEGER NOT NULL CHECK (soul_urge_number BETWEEN 1 AND 9),
    
    -- Vietnamese-specific calculations
    vietnamese_lucky_numbers INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    vietnamese_unlucky_numbers INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    favorable_colors TEXT[] DEFAULT ARRAY[]::TEXT[],
    favorable_directions TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Cultural interpretation
    vietnamese_cultural_meaning JSONB,
    traditional_significance JSONB,
    modern_interpretation JSONB,
    
    -- Career and life guidance
    career_guidance JSONB,
    relationship_compatibility JSONB,
    optimal_timing JSONB,
    
    -- Calculation metadata
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculation_version VARCHAR(10) DEFAULT '1.0',
    cultural_expert_reviewed BOOLEAN DEFAULT FALSE,
    expert_notes TEXT,
    
    -- Quality assurance
    accuracy_score DECIMAL(3,2),
    cultural_authenticity_score DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE numerology_method AS ENUM (
    'pythagorean_vietnamese',
    'chaldean_vietnamese', 
    'traditional_vietnamese',
    'modern_hybrid'
);

-- Indexes for numerology
CREATE INDEX idx_numerology_user_id ON numerology_calculations(user_id);
CREATE INDEX idx_numerology_life_path ON numerology_calculations(life_path_number);
CREATE INDEX idx_numerology_birth_date ON numerology_calculations(birth_date);
CREATE INDEX idx_numerology_lucky_numbers ON numerology_calculations USING GIN (vietnamese_lucky_numbers);
```

### 2.4 CV Analysis Schema

#### 2.4.1 CV Documents Table
```sql
-- =============================================
-- CV Documents: Uploaded CV files and metadata
-- =============================================
CREATE TABLE cv_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- File information
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for deduplication
    
    -- Processing status
    processing_status cv_processing_status DEFAULT 'uploaded',
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    processing_errors JSONB,
    
    -- Extracted content
    raw_text TEXT,
    structured_data JSONB,
    
    -- Analysis results
    skills_extracted JSONB,
    experience_analysis JSONB,
    education_analysis JSONB,
    vietnamese_cultural_elements JSONB,
    
    -- AI analysis
    ai_confidence_score DECIMAL(3,2),
    ai_analysis_version VARCHAR(20),
    ai_processing_time_ms INTEGER,
    
    -- Integration with assessments
    numerology_integration JSONB,
    personality_integration JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE cv_processing_status AS ENUM (
    'uploaded',
    'queued',
    'processing',
    'completed',
    'failed',
    'requires_review'
);

-- =============================================
-- Extracted Skills: Skills identified from CVs
-- =============================================
CREATE TABLE cv_extracted_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_document_id UUID NOT NULL REFERENCES cv_documents(id) ON DELETE CASCADE,
    
    -- Skill information
    skill_name VARCHAR(200) NOT NULL,
    skill_category skill_category,
    proficiency_level skill_proficiency,
    years_of_experience DECIMAL(3,1),
    
    -- Extraction metadata
    extraction_method VARCHAR(50), -- 'ai', 'pattern_matching', 'manual'
    confidence_score DECIMAL(3,2),
    source_text TEXT, -- Original text where skill was found
    
    -- Vietnamese market relevance
    vietnamese_market_relevance DECIMAL(3,2),
    local_equivalents TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE skill_category AS ENUM (
    'technical',
    'soft_skills',
    'language',
    'certification',
    'tool_software',
    'domain_knowledge',
    'leadership',
    'cultural_competency'
);

CREATE TYPE skill_proficiency AS ENUM (
    'beginner',
    'intermediate', 
    'advanced',
    'expert',
    'native'
);
```

### 2.5 Cultural Intelligence Schema

#### 2.5.1 Vietnamese Cultural Data
```sql
-- =============================================
-- Vietnamese Cultural Intelligence Reference Data
-- =============================================
CREATE TABLE vietnamese_cultural_reference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Cultural dimension
    dimension_name VARCHAR(100) NOT NULL,
    dimension_category cultural_dimension_category,
    
    -- Values and interpretations
    traditional_values JSONB NOT NULL,
    modern_adaptations JSONB NOT NULL,
    business_implications JSONB NOT NULL,
    
    -- Scoring and weights
    importance_weight DECIMAL(3,2) DEFAULT 1.00,
    regional_variations JSONB, -- North, Central, South Vietnam
    
    -- Source and validation
    source_type cultural_source_type,
    expert_validated BOOLEAN DEFAULT FALSE,
    last_reviewed_date DATE,
    reviewer_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE cultural_dimension_category AS ENUM (
    'power_distance',
    'individualism_collectivism',
    'uncertainty_avoidance',
    'long_term_orientation',
    'masculinity_femininity',
    'indulgence_restraint',
    'face_saving',
    'hierarchy_respect',
    'family_orientation',
    'work_life_balance'
);

CREATE TYPE cultural_source_type AS ENUM (
    'academic_research',
    'expert_consultation',
    'survey_data',
    'anthropological_study',
    'business_practice',
    'traditional_wisdom'
);

-- =============================================
-- Cultural Assessment Results
-- =============================================
CREATE TABLE cultural_assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL,
    
    -- Cultural dimension scores
    cultural_scores JSONB NOT NULL,
    cultural_profile JSONB NOT NULL,
    
    -- Interpretations
    strengths JSONB,
    development_areas JSONB,
    cultural_fit_analysis JSONB,
    
    -- Recommendations
    career_recommendations JSONB,
    team_integration_advice JSONB,
    leadership_style_suggestions JSONB,
    
    -- Quality metrics
    assessment_quality_score DECIMAL(3,2),
    cultural_authenticity_score DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3. Data Relationships and Constraints

### 3.1 Foreign Key Relationships
```sql
-- =============================================
-- Foreign Key Constraints Summary
-- =============================================

-- User-centric relationships
ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE assessments ADD CONSTRAINT fk_assessments_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE numerology_calculations ADD CONSTRAINT fk_numerology_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Assessment relationships
ALTER TABLE disc_responses ADD CONSTRAINT fk_disc_responses_assessment_id 
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;

ALTER TABLE disc_results ADD CONSTRAINT fk_disc_results_assessment_id 
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;

-- Referential integrity for CV analysis
ALTER TABLE cv_documents ADD CONSTRAINT fk_cv_documents_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE cv_extracted_skills ADD CONSTRAINT fk_cv_skills_document_id 
    FOREIGN KEY (cv_document_id) REFERENCES cv_documents(id) ON DELETE CASCADE;
```

### 3.2 Data Validation Constraints
```sql
-- =============================================
-- Business Logic Constraints
-- =============================================

-- Ensure Vietnamese names are properly formatted
ALTER TABLE users ADD CONSTRAINT chk_users_vietnamese_name 
    CHECK (first_name ~ '^[a-zA-ZÀ-ỹ\s]+$' AND last_name ~ '^[a-zA-ZÀ-ỹ\s]+$');

-- Validate email format for Vietnamese context
ALTER TABLE users ADD CONSTRAINT chk_users_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure DISC scores are within valid range
ALTER TABLE disc_results ADD CONSTRAINT chk_disc_scores_range 
    CHECK (
        dominance_score BETWEEN 0 AND 100 AND
        influence_score BETWEEN 0 AND 100 AND
        steadiness_score BETWEEN 0 AND 100 AND
        conscientiousness_score BETWEEN 0 AND 100
    );

-- Validate numerology numbers
ALTER TABLE numerology_calculations ADD CONSTRAINT chk_numerology_valid_numbers 
    CHECK (
        life_path_number BETWEEN 1 AND 9 AND
        destiny_number BETWEEN 1 AND 9 AND
        personality_number BETWEEN 1 AND 9 AND
        soul_urge_number BETWEEN 1 AND 9
    );

-- Ensure birth dates are reasonable for Vietnamese workforce
ALTER TABLE user_profiles ADD CONSTRAINT chk_birth_date_reasonable 
    CHECK (
        birth_date >= '1950-01-01' AND 
        birth_date <= CURRENT_DATE - INTERVAL '16 years'
    );
```

## 4. Database Performance Optimization

### 4.1 Indexing Strategy
```sql
-- =============================================
-- Performance Indexes
-- =============================================

-- Composite indexes for common queries
CREATE INDEX idx_assessments_user_type_status 
    ON assessments(user_id, assessment_type, status);

CREATE INDEX idx_disc_results_scores 
    ON disc_results(dominance_score, influence_score, steadiness_score, conscientiousness_score);

-- Full-text search indexes for Vietnamese content
CREATE INDEX idx_users_fulltext_vietnamese 
    ON users USING GIN (to_tsvector('vietnamese', display_name || ' ' || email));

CREATE INDEX idx_cv_fulltext_vietnamese 
    ON cv_documents USING GIN (to_tsvector('vietnamese', raw_text));

-- JSONB indexes for cultural data
CREATE INDEX idx_cultural_preferences_gin 
    ON users USING GIN (cultural_preferences);

CREATE INDEX idx_numerology_cultural_gin 
    ON numerology_calculations USING GIN (vietnamese_cultural_meaning);

CREATE INDEX idx_disc_cultural_analysis_gin 
    ON disc_results USING GIN (vietnamese_cultural_analysis);

-- Partial indexes for active records
CREATE INDEX idx_users_active 
    ON users(id, email) WHERE deleted_at IS NULL AND status = 'active';

CREATE INDEX idx_assessments_completed 
    ON assessments(user_id, created_at) WHERE status = 'completed';
```

### 4.2 Partitioning Strategy
```sql
-- =============================================
-- Table Partitioning for Scalability
-- =============================================

-- Partition assessments by creation date (monthly)
CREATE TABLE assessments_partitioned (
    LIKE assessments INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE assessments_y2025m10 PARTITION OF assessments_partitioned
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE assessments_y2025m11 PARTITION OF assessments_partitioned
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- Partition CV documents by file size for optimization
CREATE TABLE cv_documents_partitioned (
    LIKE cv_documents INCLUDING ALL
) PARTITION BY RANGE (file_size_bytes);

CREATE TABLE cv_documents_small PARTITION OF cv_documents_partitioned
    FOR VALUES FROM (0) TO (1048576); -- 0-1MB

CREATE TABLE cv_documents_medium PARTITION OF cv_documents_partitioned
    FOR VALUES FROM (1048576) TO (10485760); -- 1-10MB

CREATE TABLE cv_documents_large PARTITION OF cv_documents_partitioned
    FOR VALUES FROM (10485760) TO (MAXVALUE); -- >10MB
```

## 5. Data Security and Privacy

### 5.1 Row-Level Security
```sql
-- =============================================
-- Row-Level Security Policies
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_documents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_self_access ON users
    FOR ALL TO authenticated_users
    USING (id = current_user_id());

-- HR managers can see their team members
CREATE POLICY hr_manager_access ON users
    FOR SELECT TO hr_managers
    USING (
        EXISTS (
            SELECT 1 FROM team_memberships tm
            WHERE tm.member_id = users.id 
            AND tm.manager_id = current_user_id()
        )
    );

-- Admins have full access
CREATE POLICY admin_full_access ON users
    FOR ALL TO admins
    USING (true);
```

### 5.2 Data Encryption
```sql
-- =============================================
-- Sensitive Data Encryption
-- =============================================

-- Encrypt PII fields
ALTER TABLE user_profiles 
    ALTER COLUMN phone_number TYPE TEXT USING pgp_sym_encrypt(phone_number, 'encryption_key');

ALTER TABLE user_profiles 
    ALTER COLUMN address TYPE TEXT USING pgp_sym_encrypt(address::text, 'encryption_key');

-- Create functions for encrypted data access
CREATE OR REPLACE FUNCTION get_decrypted_phone(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT pgp_sym_decrypt(phone_number::bytea, 'encryption_key')
        FROM user_profiles 
        WHERE user_profiles.user_id = get_decrypted_phone.user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 6. Backup and Recovery Strategy

### 6.1 Backup Configuration
```sql
-- =============================================
-- Backup and Recovery Setup
-- =============================================

-- Point-in-time recovery configuration
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET archive_mode = 'on';
ALTER SYSTEM SET archive_command = 'cp %p /backup/archive/%f';

-- Continuous archiving for Vietnamese cultural data
CREATE OR REPLACE FUNCTION backup_cultural_data()
RETURNS void AS $$
BEGIN
    -- Backup critical cultural reference data
    COPY vietnamese_cultural_reference TO '/backup/cultural/cultural_reference_' || 
         to_char(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS') || '.csv' 
         WITH CSV HEADER;
    
    -- Backup numerology calculations
    COPY numerology_calculations TO '/backup/numerology/numerology_' || 
         to_char(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS') || '.csv' 
         WITH CSV HEADER;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cultural data backup
SELECT cron.schedule('backup-cultural-data', '0 2 * * *', 'SELECT backup_cultural_data();');
```

## 7. Database Monitoring and Maintenance

### 7.1 Performance Monitoring Views
```sql
-- =============================================
-- Performance Monitoring Views
-- =============================================

-- View for slow queries
CREATE VIEW slow_queries_vietnamese AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE query ILIKE '%vietnamese%' 
   OR query ILIKE '%numerology%'
   OR query ILIKE '%disc%'
ORDER BY total_time DESC;

-- Assessment completion monitoring
CREATE VIEW assessment_completion_stats AS
SELECT 
    assessment_type,
    COUNT(*) as total_assessments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    AVG(actual_duration_seconds) as avg_duration,
    COUNT(CASE WHEN cultural_adaptation = true THEN 1 END) as cultural_adapted
FROM assessments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY assessment_type;

-- Cultural data usage statistics
CREATE VIEW cultural_data_usage AS
SELECT 
    'vietnamese_preferences' as data_type,
    COUNT(*) as usage_count,
    COUNT(CASE WHEN (cultural_preferences->>'numerologyEnabled')::boolean THEN 1 END) as numerology_enabled,
    COUNT(CASE WHEN cultural_preferences->>'language' = 'vi' THEN 1 END) as vietnamese_language
FROM users
WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'numerology_calculations',
    COUNT(*),
    COUNT(CASE WHEN cultural_expert_reviewed THEN 1 END),
    COUNT(CASE WHEN accuracy_score >= 0.8 THEN 1 END)
FROM numerology_calculations;
```

## 8. Data Migration and Seeding

### 8.1 Initial Data Seeding
```sql
-- =============================================
-- Seed Vietnamese Cultural Reference Data
-- =============================================

INSERT INTO vietnamese_cultural_reference (
    dimension_name, 
    dimension_category, 
    traditional_values, 
    modern_adaptations, 
    business_implications,
    importance_weight,
    source_type,
    expert_validated
) VALUES 
(
    'Hierarchy and Respect',
    'power_distance',
    '{"respect_for_elders": true, "formal_titles": true, "indirect_communication": true}',
    '{"mentorship_valued": true, "collaborative_leadership": true, "feedback_culture": "developing"}',
    '{"management_style": "consultative", "decision_making": "consensus_preferred", "conflict_resolution": "face_saving"}',
    0.95,
    'expert_consultation',
    true
),
(
    'Family and Community',
    'individualism_collectivism',
    '{"family_first": true, "group_harmony": true, "collective_responsibility": true}',
    '{"work_life_integration": true, "team_loyalty": true, "individual_growth": "within_community"}',
    '{"team_building": "essential", "individual_recognition": "group_context", "benefits": "family_inclusive"}',
    0.90,
    'anthropological_study',
    true
);

-- Seed DISC questions with Vietnamese cultural adaptation
INSERT INTO disc_questions (
    question_number,
    statement_vi,
    statement_en,
    cultural_context,
    cultural_notes_vi,
    category
) VALUES 
(
    1,
    'Tôi thường là người đưa ra quyết định nhanh chóng trong nhóm',
    'I usually make quick decisions in group settings',
    'vietnamese_leadership',
    'Trong văn hóa Việt Nam, việc ra quyết định nhanh cần cân bằng với tham vấn ý kiến tập thể',
    'dominance'
),
(
    2,
    'Tôi thích tạo không khí vui vẻ và gắn kết trong công việc',
    'I enjoy creating a fun and engaging work atmosphere',
    'vietnamese_workplace',
    'Việc tạo không khí tích cực phù hợp với văn hóa làm việc Việt Nam, nhấn mạnh mối quan hệ',
    'influence'
);
```

---

**Document Control:**
- Author: Database Architect
- Reviewer: Senior Backend Developer, Data Security Specialist
- Approved By: Technical Director
- Next Review: January 12, 2026
- Classification: INTERNAL USE