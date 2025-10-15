# HR SCREENING PLATFORM - REDESIGNED USER FLOW

## 🎯 APPROVED WORKFLOW SCOPE

### ❌ REMOVED FEATURES
- MBTI assessment module (completely eliminated)
- Multi-module dashboard concept
- Generic "HR platform" positioning

### ✅ CORE PRODUCT FLOW

```
1. JOB REQUIREMENT INPUT
   ├── Job title, description, requirements
   ├── Required skills & experience level
   ├── Company culture fit criteria
   └── Hiring manager notes

2. CV COLLECTION & PARSING
   ├── Bulk upload CVs (PDF/DOCX)
   ├── GenAI extraction (Gemini)
   ├── Structured data output
   └── Auto-match vs job requirements

3. DISC ASSESSMENT
   ├── Option A: Import existing DISC results (CSV/PDF)
   ├── Option B: Generate assessment link → send to candidate
   ├── Process DISC scores (D-I-S-C behavioral mapping)
   └── Cultural fit analysis

4. NUMEROLOGY ANALYSIS
   ├── Vietnamese numerology calculation
   ├── Career compatibility scoring
   ├── Personality insights
   └── Cultural fit assessment

5. SHORTLIST RANKING
   ├── Combined scoring algorithm:
   │   ├── CV fit score (40%)
   │   ├── DISC behavioral match (35%)
   │   └── Numerology compatibility (25%)
   ├── Ranking table with notes
   ├── Recruiter decision: Accept/Reject/Pending
   └── Reason tracking for each decision
```

## 📊 DATA MODEL DESIGN

### Job Requirements Table
```sql
job_requirements (
  id: uuid PRIMARY KEY,
  title: varchar NOT NULL,
  description: text,
  required_skills: jsonb,
  experience_level: varchar,
  culture_criteria: jsonb,
  hiring_manager_id: uuid,
  status: varchar DEFAULT 'active',
  created_at: timestamp,
  updated_at: timestamp
)
```

### Candidates Table
```sql
candidates (
  id: uuid PRIMARY KEY,
  job_requirement_id: uuid REFERENCES job_requirements(id),
  name: varchar NOT NULL,
  email: varchar,
  phone: varchar,
  cv_file_path: varchar,
  cv_parsed_data: jsonb,
  status: varchar DEFAULT 'pending', -- pending/shortlisted/rejected
  recruiter_notes: text,
  decision_reason: varchar,
  created_at: timestamp
)
```

### Assessments Table
```sql
assessments (
  id: uuid PRIMARY KEY,
  candidate_id: uuid REFERENCES candidates(id),
  assessment_type: varchar, -- 'cv_analysis', 'disc', 'numerology'
  raw_data: jsonb,
  processed_results: jsonb,
  score: integer,
  confidence_level: float,
  processed_at: timestamp
)
```

### DISC Tests Table
```sql
disc_tests (
  id: uuid PRIMARY KEY,
  candidate_id: uuid REFERENCES candidates(id),
  test_token: varchar UNIQUE,
  test_link: varchar,
  status: varchar DEFAULT 'pending', -- pending/completed/expired
  raw_results: jsonb,
  d_score: integer,
  i_score: integer,
  s_score: integer,
  c_score: integer,
  behavioral_type: varchar,
  expires_at: timestamp,
  completed_at: timestamp
)
```

## 🎯 NEW DASHBOARD SECTIONS

1. **Job Management Hub**
   - Active job postings
   - Candidate pipeline status
   - Hiring progress tracking

2. **DISC Assessment Center**
   - Import results interface
   - Generate test links
   - Behavioral analysis dashboard

3. **Shortlist Recommendation Engine**
   - Combined scoring algorithm
   - Ranking visualization
   - Decision tracking system

4. **Recent Activity Feed**
   - CV uploads
   - Assessment completions
   - Recruiter decisions
   - Filter by date/job/status

## 🔄 USER JOURNEY FLOW

```
RECRUITER LOGIN
    ↓
CREATE NEW JOB POSTING
    ↓
UPLOAD CANDIDATE CVS (bulk)
    ↓
SYSTEM AUTO-PROCESSES → CV Analysis + Numerology
    ↓
RECRUITER SENDS DISC LINKS → Candidates complete tests
    ↓
SYSTEM GENERATES SHORTLIST → Combined scoring
    ↓
RECRUITER REVIEWS → Add notes + make decisions
    ↓
FINAL HIRING RECOMMENDATIONS
```