# SDLC 4.7 - Data Models and ERD
## Project: HR Profiling Platform - Entity Relationship Design
### Document ID: ERD-MODEL-001
### Version: 1.0.0
### Date: October 12, 2025
### Status: ACTIVE

---

## 1. Entity Relationship Diagram Overview

### 1.1 ERD Summary
This document presents the comprehensive Entity Relationship Diagram (ERD) for the HR Profiling Platform, focusing on Vietnamese cultural intelligence integration with psychological profiling systems.

### 1.2 ERD Notation
- **Entities**: Rectangles representing data objects
- **Attributes**: Ovals connected to entities
- **Primary Keys**: Underlined attributes
- **Foreign Keys**: Italicized attributes
- **Relationships**: Diamond shapes with cardinality indicators
- **Cultural Extensions**: Highlighted in green for Vietnamese-specific elements

## 2. Core Entity Relationship Model

### 2.1 High-Level ERD Structure
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HR PROFILING PLATFORM ERD                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    creates    ┌─────────────────┐    contains    ┌─────────┐
│   │    USERS    │─────────────→ │   ASSESSMENTS   │─────────────→  │ RESULTS │
│   │             │               │                 │                │         │
│   └──────┬──────┘               └─────────┬───────┘                └─────────┘
│          │                               │                                 │
│          │ has                           │ specializes                     │
│          ▼                               ▼                                 │
│   ┌─────────────┐              ┌──────────────────┐                       │
│   │USER_PROFILES│              │  DISC_RESPONSES  │                       │
│   │             │              │  MBTI_RESPONSES  │                       │
│   └──────┬──────┘              │  NUMEROLOGY_CALC │                       │
│          │                     └──────────────────┘                       │
│          │ includes                     │                                 │
│          ▼                             │ produces                         │
│   ┌─────────────┐                     ▼                                 │
│   │ VIETNAMESE  │              ┌──────────────────┐                       │
│   │ CULTURAL    │              │  CULTURAL        │◀──────────────────────┘
│   │ DATA        │              │  INTERPRETATIONS │
│   └─────────────┘              └──────────────────┘
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Detailed Entity Definitions

### 3.1 USERS Entity
```sql
USERS
├── id (PK) [UUID]
├── email [VARCHAR(255)] UNIQUE
├── password_hash [VARCHAR(255)]
├── email_verified [BOOLEAN]
├── email_verified_at [TIMESTAMP]
├── first_name [VARCHAR(100)] COLLATE "vi_VN" 
├── last_name [VARCHAR(100)] COLLATE "vi_VN"
├── middle_name [VARCHAR(100)] COLLATE "vi_VN"
├── display_name [COMPUTED] 
├── cultural_preferences [JSONB]
│   ├── language: "vi" | "en"
│   ├── numerologyEnabled: boolean
│   ├── culturalDepth: "basic" | "detailed" | "expert"
│   ├── useTraditionalValues: boolean
│   └── preferredDateFormat: string
├── role [ENUM] user_role
├── status [ENUM] user_status  
├── created_at [TIMESTAMP]
├── updated_at [TIMESTAMP]
├── created_by [FK → USERS.id]
├── last_login_at [TIMESTAMP]
├── login_count [INTEGER]
├── deleted_at [TIMESTAMP]
└── deleted_by [FK → USERS.id]

Relationships:
├── 1:1 → USER_PROFILES
├── 1:N → ASSESSMENTS  
├── 1:N → CV_DOCUMENTS
└── 1:N → NUMEROLOGY_CALCULATIONS
```

### 3.2 USER_PROFILES Entity
```sql
USER_PROFILES
├── id (PK) [UUID]
├── user_id (FK) [UUID] → USERS.id UNIQUE
├── birth_date [DATE]
├── birth_place [VARCHAR(200)] COLLATE "vi_VN"
├── phone_number [VARCHAR(20)] ENCRYPTED
├── address [JSONB] ENCRYPTED
│   ├── street: string
│   ├── ward: string (phường/xã)
│   ├── district: string (quận/huyện)  
│   ├── city: string (thành phố/tỉnh)
│   └── country: "Vietnam"
├── job_title [VARCHAR(200)] COLLATE "vi_VN"
├── department [VARCHAR(200)] COLLATE "vi_VN"
├── company [VARCHAR(200)] COLLATE "vi_VN"
├── employee_id [VARCHAR(50)]
├── hire_date [DATE]
├── vietnamese_cultural_data [JSONB]
│   ├── regionOfOrigin: "north" | "central" | "south"
│   ├── generationInCity: integer
│   ├── languagePreference: "vietnamese" | "bilingual"
│   ├── traditionalValues: object
│   └── modernAdaptation: object
├── numerology_data [JSONB]
├── profile_completion_percentage [INTEGER] (0-100)
├── profile_quality_score [DECIMAL(3,2)] (0.00-10.00)
├── privacy_settings [JSONB]
├── created_at [TIMESTAMP]
└── updated_at [TIMESTAMP]

Relationships:
├── N:1 → USERS
└── 1:N → CULTURAL_ASSESSMENT_RESULTS
```

### 3.3 ASSESSMENTS Entity
```sql
ASSESSMENTS  
├── id (PK) [UUID]
├── user_id (FK) [UUID] → USERS.id
├── assessment_type [ENUM] assessment_type
│   ├── "disc"
│   ├── "mbti"
│   ├── "numerology" 
│   ├── "cv_analysis"
│   ├── "cultural_assessment"
│   └── "comprehensive"
├── config [JSONB]
│   ├── timeLimit: integer (minutes)
│   ├── questionOrder: "sequential" | "randomized"
│   ├── culturalDepth: "basic" | "detailed" | "expert"
│   └── adaptForVietnamese: boolean
├── cultural_adaptation [BOOLEAN] DEFAULT TRUE
├── language [VARCHAR(5)] DEFAULT 'vi'
├── status [ENUM] assessment_status
├── started_at [TIMESTAMP]
├── completed_at [TIMESTAMP]
├── expires_at [TIMESTAMP]
├── estimated_duration_minutes [INTEGER]
├── actual_duration_seconds [INTEGER]
├── raw_results [JSONB]
├── processed_results [JSONB]
├── cultural_interpretation [JSONB]
├── quality_score [DECIMAL(3,2)]
├── confidence_level [DECIMAL(3,2)]
├── assessment_version [VARCHAR(20)]
├── administrator_id (FK) [UUID] → USERS.id
├── notes [TEXT]
├── created_at [TIMESTAMP]
└── updated_at [TIMESTAMP]

Relationships:
├── N:1 → USERS (user_id)
├── N:1 → USERS (administrator_id)  
├── 1:N → DISC_RESPONSES (if disc)
├── 1:N → MBTI_RESPONSES (if mbti)
├── 1:1 → DISC_RESULTS (if disc)
├── 1:1 → MBTI_RESULTS (if mbti)
└── 1:N → ASSESSMENT_REPORTS
```

### 3.4 DISC Assessment Entities

#### 3.4.1 DISC_QUESTIONS Entity
```sql
DISC_QUESTIONS
├── id (PK) [UUID]
├── question_number [INTEGER] UNIQUE per version
├── statement_vi [TEXT] -- Vietnamese question text
├── statement_en [TEXT] -- English question text  
├── cultural_context [TEXT]
├── cultural_notes_vi [TEXT]
├── cultural_notes_en [TEXT]
├── category [ENUM] disc_category
│   ├── "dominance"
│   ├── "influence" 
│   ├── "steadiness"
│   └── "conscientiousness"
├── difficulty_level [INTEGER] (1-5)
├── cultural_sensitivity_level [INTEGER] (1-5)
├── version [VARCHAR(10)] DEFAULT '1.0'
├── is_active [BOOLEAN] DEFAULT TRUE
└── created_at [TIMESTAMP]

Relationships:
└── 1:N → DISC_QUESTION_OPTIONS
```

#### 3.4.2 DISC_QUESTION_OPTIONS Entity  
```sql
DISC_QUESTION_OPTIONS
├── id (PK) [UUID]
├── question_id (FK) [UUID] → DISC_QUESTIONS.id
├── option_number [INTEGER]
├── text_vi [TEXT] -- Vietnamese option text
├── text_en [TEXT] -- English option text
├── dominance_weight [DECIMAL(3,2)] (0.00-1.00)
├── influence_weight [DECIMAL(3,2)] (0.00-1.00)
├── steadiness_weight [DECIMAL(3,2)] (0.00-1.00)
├── conscientiousness_weight [DECIMAL(3,2)] (0.00-1.00)
└── vietnamese_cultural_modifier [DECIMAL(3,2)] DEFAULT 1.00

Relationships:
├── N:1 → DISC_QUESTIONS  
└── 1:N → DISC_RESPONSES (most_like/least_like)
```

#### 3.4.3 DISC_RESPONSES Entity
```sql
DISC_RESPONSES
├── id (PK) [UUID]
├── assessment_id (FK) [UUID] → ASSESSMENTS.id
├── question_id (FK) [UUID] → DISC_QUESTIONS.id
├── most_like_option_id (FK) [UUID] → DISC_QUESTION_OPTIONS.id
├── least_like_option_id (FK) [UUID] → DISC_QUESTION_OPTIONS.id
├── response_time_seconds [INTEGER]
├── cultural_difficulty_rating [INTEGER] (1-5)
└── created_at [TIMESTAMP]

Relationships:
├── N:1 → ASSESSMENTS
├── N:1 → DISC_QUESTIONS
├── N:1 → DISC_QUESTION_OPTIONS (most_like)
└── N:1 → DISC_QUESTION_OPTIONS (least_like)

Constraints:
└── UNIQUE(assessment_id, question_id)
```

#### 3.4.4 DISC_RESULTS Entity
```sql
DISC_RESULTS
├── id (PK) [UUID]
├── assessment_id (FK) [UUID] → ASSESSMENTS.id UNIQUE
├── dominance_score [DECIMAL(5,2)] (0.00-100.00)
├── influence_score [DECIMAL(5,2)] (0.00-100.00)  
├── steadiness_score [DECIMAL(5,2)] (0.00-100.00)
├── conscientiousness_score [DECIMAL(5,2)] (0.00-100.00)
├── primary_type [VARCHAR(5)] -- D, I, S, C, DI, DS, etc.
├── secondary_type [VARCHAR(5)]
├── intensity_level [ENUM] disc_intensity
├── vietnamese_cultural_analysis [JSONB]
│   ├── culturalFit: object
│   ├── workStyleAlignment: object
│   ├── communicationPreferences: object
│   └── leadershipStyle: object
├── career_recommendations [JSONB]
├── team_role_suggestions [JSONB]
├── cultural_strengths [JSONB]
├── development_areas [JSONB]
├── consistency_score [DECIMAL(3,2)]
├── cultural_adaptation_score [DECIMAL(3,2)]
├── reliability_indicator [DECIMAL(3,2)]
└── created_at [TIMESTAMP]

Relationships:
└── 1:1 → ASSESSMENTS
```

### 3.5 Numerology Entities

#### 3.5.1 NUMEROLOGY_CALCULATIONS Entity
```sql
NUMEROLOGY_CALCULATIONS
├── id (PK) [UUID]
├── user_id (FK) [UUID] → USERS.id
├── birth_date [DATE]
├── full_name_vietnamese [TEXT] COLLATE "vi_VN"
├── calculation_method [ENUM] numerology_method
├── life_path_number [INTEGER] (1-9)
├── destiny_number [INTEGER] (1-9)
├── personality_number [INTEGER] (1-9)
├── soul_urge_number [INTEGER] (1-9)
├── vietnamese_lucky_numbers [INTEGER[]]
├── vietnamese_unlucky_numbers [INTEGER[]]
├── favorable_colors [TEXT[]]
├── favorable_directions [TEXT[]]
├── vietnamese_cultural_meaning [JSONB]
│   ├── traditionalSignificance: object
│   ├── modernInterpretation: object
│   ├── businessImplications: object
│   └── personalityTraits: array
├── traditional_significance [JSONB]
├── modern_interpretation [JSONB]
├── career_guidance [JSONB]
│   ├── suitableFields: array
│   ├── idealRoles: array  
│   ├── avoidableFields: array
│   └── optimalTimings: array
├── relationship_compatibility [JSONB]
├── optimal_timing [JSONB]
├── calculation_date [TIMESTAMP]
├── calculation_version [VARCHAR(10)]
├── cultural_expert_reviewed [BOOLEAN] DEFAULT FALSE
├── expert_notes [TEXT]
├── accuracy_score [DECIMAL(3,2)]
├── cultural_authenticity_score [DECIMAL(3,2)]
├── created_at [TIMESTAMP]
└── updated_at [TIMESTAMP]

Relationships:
└── N:1 → USERS
```

### 3.6 CV Analysis Entities

#### 3.6.1 CV_DOCUMENTS Entity
```sql
CV_DOCUMENTS
├── id (PK) [UUID]
├── user_id (FK) [UUID] → USERS.id
├── original_filename [VARCHAR(255)]
├── file_path [TEXT]
├── file_size_bytes [BIGINT]
├── mime_type [VARCHAR(100)]
├── file_hash [VARCHAR(64)] -- SHA-256
├── processing_status [ENUM] cv_processing_status
├── processing_started_at [TIMESTAMP]
├── processing_completed_at [TIMESTAMP]
├── processing_errors [JSONB]
├── raw_text [TEXT]
├── structured_data [JSONB]
│   ├── personalInfo: object
│   ├── experience: array
│   ├── education: array
│   ├── skills: array
│   └── certifications: array
├── skills_extracted [JSONB]
├── experience_analysis [JSONB]
├── education_analysis [JSONB]
├── vietnamese_cultural_elements [JSONB]
│   ├── languageSkills: array
│   ├── culturalExperience: array
│   ├── localMarketKnowledge: boolean
│   └── vietnameseEducation: array
├── ai_confidence_score [DECIMAL(3,2)]
├── ai_analysis_version [VARCHAR(20)]
├── ai_processing_time_ms [INTEGER]
├── numerology_integration [JSONB]
├── personality_integration [JSONB]
├── created_at [TIMESTAMP]
└── updated_at [TIMESTAMP]

Relationships:
├── N:1 → USERS
└── 1:N → CV_EXTRACTED_SKILLS
```

#### 3.6.2 CV_EXTRACTED_SKILLS Entity
```sql
CV_EXTRACTED_SKILLS
├── id (PK) [UUID]
├── cv_document_id (FK) [UUID] → CV_DOCUMENTS.id
├── skill_name [VARCHAR(200)]
├── skill_category [ENUM] skill_category
├── proficiency_level [ENUM] skill_proficiency
├── years_of_experience [DECIMAL(3,1)]
├── extraction_method [VARCHAR(50)] -- 'ai', 'pattern_matching', 'manual'
├── confidence_score [DECIMAL(3,2)]
├── source_text [TEXT] -- Original text location
├── vietnamese_market_relevance [DECIMAL(3,2)]
├── local_equivalents [TEXT[]]
└── created_at [TIMESTAMP]

Relationships:
└── N:1 → CV_DOCUMENTS
```

### 3.7 Cultural Intelligence Entities

#### 3.7.1 VIETNAMESE_CULTURAL_REFERENCE Entity
```sql
VIETNAMESE_CULTURAL_REFERENCE
├── id (PK) [UUID]
├── dimension_name [VARCHAR(100)]
├── dimension_category [ENUM] cultural_dimension_category
├── traditional_values [JSONB]
├── modern_adaptations [JSONB]
├── business_implications [JSONB]
├── importance_weight [DECIMAL(3,2)] DEFAULT 1.00
├── regional_variations [JSONB] -- North, Central, South Vietnam
├── source_type [ENUM] cultural_source_type
├── expert_validated [BOOLEAN] DEFAULT FALSE
├── last_reviewed_date [DATE]
├── reviewer_notes [TEXT]
├── created_at [TIMESTAMP]
└── updated_at [TIMESTAMP]

Relationships:
└── Referenced by → CULTURAL_ASSESSMENT_RESULTS
```

#### 3.7.2 CULTURAL_ASSESSMENT_RESULTS Entity
```sql
CULTURAL_ASSESSMENT_RESULTS
├── id (PK) [UUID]
├── user_id (FK) [UUID] → USERS.id
├── assessment_type [VARCHAR(50)]
├── cultural_scores [JSONB]
│   ├── powerDistance: decimal
│   ├── individualismCollectivism: decimal
│   ├── uncertaintyAvoidance: decimal
│   ├── longTermOrientation: decimal
│   └── customVietnameseDimensions: object
├── cultural_profile [JSONB]
├── strengths [JSONB]
├── development_areas [JSONB]
├── cultural_fit_analysis [JSONB]
├── career_recommendations [JSONB]
├── team_integration_advice [JSONB]
├── leadership_style_suggestions [JSONB]
├── assessment_quality_score [DECIMAL(3,2)]
├── cultural_authenticity_score [DECIMAL(3,2)]
├── created_at [TIMESTAMP]
└── updated_at [TIMESTAMP]

Relationships:
└── N:1 → USERS
```

## 4. Relationship Cardinalities

### 4.1 Primary Relationships
```
USERS ||--o{ ASSESSMENTS
  "One user can have many assessments"

USERS ||--|| USER_PROFILES  
  "One user has exactly one profile"

ASSESSMENTS ||--o{ DISC_RESPONSES
  "One assessment can have many DISC responses"

ASSESSMENTS ||--|| DISC_RESULTS
  "One DISC assessment produces one result set"

DISC_QUESTIONS ||--o{ DISC_QUESTION_OPTIONS
  "One question has many options"

DISC_QUESTION_OPTIONS ||--o{ DISC_RESPONSES
  "One option can be selected in many responses"

USERS ||--o{ NUMEROLOGY_CALCULATIONS
  "One user can have multiple numerology calculations over time"

USERS ||--o{ CV_DOCUMENTS
  "One user can upload multiple CV documents"

CV_DOCUMENTS ||--o{ CV_EXTRACTED_SKILLS
  "One CV can have many extracted skills"

USERS ||--o{ CULTURAL_ASSESSMENT_RESULTS
  "One user can have multiple cultural assessments"
```

### 4.2 Specialized Relationships
```
ASSESSMENTS }o--|| USERS (user_id)
  "Many assessments belong to one user"

ASSESSMENTS }o--|| USERS (administrator_id)  
  "Many assessments are administered by one user"

DISC_RESPONSES }o--|| DISC_QUESTION_OPTIONS (most_like_option_id)
DISC_RESPONSES }o--|| DISC_QUESTION_OPTIONS (least_like_option_id)
  "Each response references two options (most/least like)"

USER_PROFILES }o--|| USERS (user_id)
  "Each profile belongs to exactly one user"

CV_EXTRACTED_SKILLS }o--|| CV_DOCUMENTS (cv_document_id)
  "Skills are extracted from specific CV documents"
```

## 5. Data Integrity Constraints

### 5.1 Referential Integrity
```sql
-- Primary Keys
ALTER TABLE users ADD CONSTRAINT pk_users PRIMARY KEY (id);
ALTER TABLE user_profiles ADD CONSTRAINT pk_user_profiles PRIMARY KEY (id);
ALTER TABLE assessments ADD CONSTRAINT pk_assessments PRIMARY KEY (id);
ALTER TABLE disc_questions ADD CONSTRAINT pk_disc_questions PRIMARY KEY (id);
ALTER TABLE disc_question_options ADD CONSTRAINT pk_disc_options PRIMARY KEY (id);
ALTER TABLE disc_responses ADD CONSTRAINT pk_disc_responses PRIMARY KEY (id);
ALTER TABLE disc_results ADD CONSTRAINT pk_disc_results PRIMARY KEY (id);
ALTER TABLE numerology_calculations ADD CONSTRAINT pk_numerology PRIMARY KEY (id);
ALTER TABLE cv_documents ADD CONSTRAINT pk_cv_documents PRIMARY KEY (id);
ALTER TABLE cv_extracted_skills ADD CONSTRAINT pk_cv_skills PRIMARY KEY (id);

-- Foreign Key Constraints
ALTER TABLE user_profiles 
  ADD CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE assessments 
  ADD CONSTRAINT fk_assessments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE assessments 
  ADD CONSTRAINT fk_assessments_admin FOREIGN KEY (administrator_id) REFERENCES users(id);

ALTER TABLE disc_responses 
  ADD CONSTRAINT fk_responses_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;

ALTER TABLE disc_responses 
  ADD CONSTRAINT fk_responses_question FOREIGN KEY (question_id) REFERENCES disc_questions(id);

ALTER TABLE disc_responses 
  ADD CONSTRAINT fk_responses_most_like FOREIGN KEY (most_like_option_id) REFERENCES disc_question_options(id);

ALTER TABLE disc_responses 
  ADD CONSTRAINT fk_responses_least_like FOREIGN KEY (least_like_option_id) REFERENCES disc_question_options(id);

ALTER TABLE disc_results 
  ADD CONSTRAINT fk_results_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;

ALTER TABLE numerology_calculations 
  ADD CONSTRAINT fk_numerology_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE cv_documents 
  ADD CONSTRAINT fk_cv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE cv_extracted_skills 
  ADD CONSTRAINT fk_skills_cv FOREIGN KEY (cv_document_id) REFERENCES cv_documents(id) ON DELETE CASCADE;
```

### 5.2 Business Logic Constraints
```sql
-- Unique Constraints
ALTER TABLE user_profiles 
  ADD CONSTRAINT uk_profiles_user_id UNIQUE (user_id);

ALTER TABLE disc_results 
  ADD CONSTRAINT uk_results_assessment UNIQUE (assessment_id);

ALTER TABLE disc_responses 
  ADD CONSTRAINT uk_responses_assessment_question UNIQUE (assessment_id, question_id);

ALTER TABLE disc_questions 
  ADD CONSTRAINT uk_questions_number_version UNIQUE (question_number, version);

-- Check Constraints
ALTER TABLE users 
  ADD CONSTRAINT chk_users_vietnamese_name 
  CHECK (first_name ~ '^[a-zA-ZÀ-ỹ\s]+$' AND last_name ~ '^[a-zA-ZÀ-ỹ\s]+$');

ALTER TABLE disc_results 
  ADD CONSTRAINT chk_disc_scores_valid 
  CHECK (
    dominance_score BETWEEN 0 AND 100 AND
    influence_score BETWEEN 0 AND 100 AND
    steadiness_score BETWEEN 0 AND 100 AND
    conscientiousness_score BETWEEN 0 AND 100
  );

ALTER TABLE numerology_calculations 
  ADD CONSTRAINT chk_numerology_numbers_valid 
  CHECK (
    life_path_number BETWEEN 1 AND 9 AND
    destiny_number BETWEEN 1 AND 9 AND
    personality_number BETWEEN 1 AND 9 AND
    soul_urge_number BETWEEN 1 AND 9
  );

ALTER TABLE user_profiles 
  ADD CONSTRAINT chk_birth_date_reasonable 
  CHECK (
    birth_date >= '1950-01-01' AND 
    birth_date <= CURRENT_DATE - INTERVAL '16 years'
  );

ALTER TABLE cv_documents 
  ADD CONSTRAINT chk_file_size_reasonable 
  CHECK (file_size_bytes > 0 AND file_size_bytes <= 52428800); -- 50MB max
```

## 6. Vietnamese Cultural Extensions

### 6.1 Cultural Data Models
```sql
-- Vietnamese Name Structure
CREATE TYPE vietnamese_name AS (
    ho VARCHAR(50),        -- Họ (Family name)
    ten_dem VARCHAR(100),  -- Tên đệm (Middle name(s))
    ten VARCHAR(50)        -- Tên (Given name)
);

-- Vietnamese Address Structure  
CREATE TYPE vietnamese_address AS (
    so_nha VARCHAR(20),           -- Số nhà
    duong VARCHAR(100),           -- Đường
    phuong_xa VARCHAR(100),       -- Phường/Xã
    quan_huyen VARCHAR(100),      -- Quận/Huyện
    tinh_thanh_pho VARCHAR(100),  -- Tỉnh/Thành phố
    ma_buu_dien VARCHAR(10)       -- Mã bưu điện
);

-- Vietnamese Cultural Dimensions
CREATE TYPE vietnamese_cultural_dimension AS (
    dimension_name VARCHAR(100),
    traditional_value DECIMAL(3,2),  -- 0.00 to 1.00
    modern_adaptation DECIMAL(3,2),  -- 0.00 to 1.00
    regional_variation JSONB,        -- North/Central/South differences
    business_relevance DECIMAL(3,2) -- Impact on workplace behavior
);
```

### 6.2 Cultural Intelligence Schema Extensions
```sql
-- Extended cultural preferences for Vietnamese users
ALTER TABLE users 
ADD COLUMN vietnamese_cultural_profile JSONB DEFAULT '{
  "region_of_origin": null,
  "generation_in_city": null, 
  "language_dominance": "vietnamese",
  "traditional_values_adherence": 0.8,
  "modern_adaptation_level": 0.7,
  "business_culture_preference": "hybrid",
  "communication_style": "high_context",
  "decision_making_style": "consensus_oriented",
  "hierarchy_comfort_level": 0.8,
  "individual_vs_collective": 0.3
}'::jsonb;

-- Vietnamese-specific DISC adaptations
ALTER TABLE disc_results
ADD COLUMN vietnamese_adaptations JSONB DEFAULT '{
  "power_distance_adjustment": 0.0,
  "collectivism_factor": 0.0, 
  "face_saving_consideration": 0.0,
  "hierarchy_respect_factor": 0.0,
  "indirect_communication_weight": 0.0
}'::jsonb;

-- Numerology cultural context
ALTER TABLE numerology_calculations
ADD COLUMN vietnamese_cultural_context JSONB DEFAULT '{
  "feng_shui_elements": [],
  "traditional_calendar_alignment": {},
  "ancestral_significance": {},
  "business_timing_recommendations": {},
  "color_harmony_analysis": {},
  "directional_preferences": {}
}'::jsonb;
```

## 7. Entity Relationships Summary

### 7.1 Core Entity Count and Relationships
```
Entity Statistics:
├── Core Entities: 12
├── Supporting Entities: 8  
├── Cultural Extension Entities: 4
├── Total Relationships: 24
├── Many-to-Many Relationships: 2
├── One-to-Many Relationships: 18
└── One-to-One Relationships: 4

Relationship Distribution:
├── User-centric: 8 relationships
├── Assessment-centric: 10 relationships  
├── Cultural-centric: 4 relationships
└── CV Analysis-centric: 2 relationships
```

### 7.2 Data Volume Projections
```sql
-- Estimated data volumes for Vietnamese market (5-year projection)
CREATE VIEW data_volume_projections AS
SELECT 
  'users' as entity_name,
  50000 as estimated_records,
  'Core user base for Vietnamese market' as notes
UNION ALL SELECT 'user_profiles', 50000, 'One per user'
UNION ALL SELECT 'assessments', 200000, 'Average 4 assessments per user'  
UNION ALL SELECT 'disc_responses', 4800000, '24 responses per DISC assessment'
UNION ALL SELECT 'disc_results', 100000, 'One per DISC assessment'
UNION ALL SELECT 'numerology_calculations', 75000, '1.5 per user average'
UNION ALL SELECT 'cv_documents', 150000, '3 versions per user average'
UNION ALL SELECT 'cv_extracted_skills', 1500000, '10 skills per CV average'
UNION ALL SELECT 'cultural_assessment_results', 100000, '2 per user average';
```

---

**Document Control:**
- Author: Data Architect, Cultural Intelligence Specialist
- Reviewer: Database Administrator, Vietnamese Culture Expert
- Approved By: Technical Director, Cultural Advisory Board
- Next Review: January 12, 2026
- Classification: INTERNAL USE