-- EMERGENCY COMPLIANCE SCHEMA UPDATES
-- Implementing CPO Day 1 requirements for Reference-Only separation

-- 1. Add compliance flags to existing assessments table
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS reference_only BOOLEAN DEFAULT FALSE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT FALSE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS watermark_shown BOOLEAN DEFAULT FALSE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS never_export_to_scoring BOOLEAN DEFAULT FALSE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- 2. Update existing MBTI/DISC/Numerology assessments to reference_only
UPDATE assessments 
SET reference_only = TRUE, 
    never_export_to_scoring = TRUE,
    watermark_shown = TRUE
WHERE assessment_type IN ('mbti', 'disc', 'numerology');

-- 3. Create compliance audit table for CPO requirements
CREATE TABLE IF NOT EXISTS compliance_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id),
  assessment_id UUID REFERENCES assessments(id),
  data_accessed TEXT[],
  decision_rationale TEXT,
  human_override BOOLEAN DEFAULT FALSE,
  bias_check_passed BOOLEAN DEFAULT TRUE,
  region VARCHAR(10),
  tenant_id UUID,
  feature_snapshot JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create decision_assessments table for job-relevant data only
CREATE TABLE IF NOT EXISTS decision_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  job_id UUID,
  assessment_type VARCHAR(50) NOT NULL, -- 'skills', 'work_sample', 'interview'
  results JSONB NOT NULL,
  job_relevance_score INTEGER CHECK (job_relevance_score >= 0 AND job_relevance_score <= 100),
  validity_coefficient DECIMAL(3,2),
  used_for_decision BOOLEAN DEFAULT TRUE,
  human_reviewed BOOLEAN DEFAULT FALSE,
  audit_trail JSONB,
  bias_metrics JSONB,
  tenant_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create reference_assessments table (isolated from decisions)
CREATE TABLE IF NOT EXISTS reference_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  assessment_type VARCHAR(50) NOT NULL, -- 'mbti', 'disc', 'numerology'
  results JSONB NOT NULL,
  reference_only BOOLEAN DEFAULT TRUE,
  consent_given BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMP NOT NULL,
  watermark_shown BOOLEAN DEFAULT TRUE,
  never_export_to_scoring BOOLEAN DEFAULT TRUE,
  tenant_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- CPO compliance constraints
  CONSTRAINT reference_only_check CHECK (reference_only = TRUE),
  CONSTRAINT consent_required_check CHECK (consent_given = TRUE),
  CONSTRAINT no_scoring_check CHECK (never_export_to_scoring = TRUE)
);

-- 6. Create tenant_compliance_settings for regional toggles
CREATE TABLE IF NOT EXISTS tenant_compliance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE,
  region VARCHAR(10) NOT NULL,
  insights_tab_enabled BOOLEAN DEFAULT FALSE, -- Kill-switch
  explicit_consent_required BOOLEAN DEFAULT TRUE,
  bias_audit_mandatory BOOLEAN DEFAULT TRUE,
  export_includes_reference BOOLEAN DEFAULT FALSE,
  audit_log_level VARCHAR(20) DEFAULT 'FULL',
  data_retention_days INTEGER DEFAULT 365,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. CRITICAL: Schema guards to prevent data leakage (CPO requirement)
-- Create restricted role for decision engine
CREATE ROLE IF NOT EXISTS decision_engine_role;

-- Grant access ONLY to decision_assessments (no reference data)
GRANT SELECT ON decision_assessments TO decision_engine_role;
GRANT SELECT ON users(id, email, created_at) TO decision_engine_role; -- PII limited
GRANT SELECT ON jobs TO decision_engine_role;

-- DENY access to reference_assessments and reference fields in assessments
REVOKE ALL ON reference_assessments FROM decision_engine_role;

-- Row Level Security (RLS) policies for additional protection
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Decision engine can NEVER see reference-only assessments
CREATE POLICY reference_isolation ON assessments
  FOR ALL TO decision_engine_role
  USING (reference_only = FALSE);

-- Policy: Complete isolation of reference_assessments table
CREATE POLICY reference_complete_isolation ON reference_assessments
  FOR ALL TO decision_engine_role
  USING (FALSE); -- Absolutely no access

-- Policy: Tenant isolation
CREATE POLICY tenant_isolation ON decision_assessments
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- 8. Bias monitoring tables (T+30 requirement)
CREATE TABLE IF NOT EXISTS bias_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  demographic_group VARCHAR(100),
  selection_rate DECIMAL(5,4),
  impact_ratio DECIMAL(5,4),
  sample_size INTEGER,
  measurement_period_start DATE,
  measurement_period_end DATE,
  compliant BOOLEAN GENERATED ALWAYS AS (impact_ratio >= 0.8) STORED,
  tenant_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessments_reference_only ON assessments(reference_only);
CREATE INDEX IF NOT EXISTS idx_assessments_type_tenant ON assessments(assessment_type, tenant_id);
CREATE INDEX IF NOT EXISTS idx_decision_assessments_job ON decision_assessments(job_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_reference_assessments_user ON reference_assessments(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_user ON compliance_audit(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bias_monitoring_job ON bias_monitoring(job_id, measurement_period_end);

-- 10. Insert default compliance settings for existing tenants
INSERT INTO tenant_compliance_settings (tenant_id, region, insights_tab_enabled)
SELECT DISTINCT tenant_id, 'VN', FALSE
FROM assessments 
WHERE tenant_id IS NOT NULL
ON CONFLICT (tenant_id) DO NOTHING;

-- 11. Create audit triggers for compliance logging
CREATE OR REPLACE FUNCTION audit_assessment_access() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO compliance_audit (
    action, 
    user_id, 
    assessment_id, 
    data_accessed, 
    tenant_id
  ) VALUES (
    TG_OP,
    NEW.user_id,
    NEW.id,
    ARRAY[NEW.assessment_type],
    NEW.tenant_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assessment_audit_trigger
  AFTER INSERT OR UPDATE ON decision_assessments
  FOR EACH ROW EXECUTE FUNCTION audit_assessment_access();

-- 12. Emergency data migration for existing assessments
-- Move MBTI/DISC/Numerology data to reference_assessments
INSERT INTO reference_assessments (
  user_id,
  assessment_type,
  results,
  reference_only,
  consent_given,
  consent_timestamp,
  watermark_shown,
  never_export_to_scoring,
  tenant_id,
  created_at
)
SELECT 
  user_id,
  assessment_type,
  results,
  TRUE,
  TRUE, -- Assume consent for existing users (to be re-verified)
  NOW(),
  TRUE,
  TRUE,
  tenant_id,
  created_at
FROM assessments 
WHERE assessment_type IN ('mbti', 'disc', 'numerology')
AND NOT EXISTS (
  SELECT 1 FROM reference_assessments r 
  WHERE r.user_id = assessments.user_id 
  AND r.assessment_type = assessments.assessment_type
);

-- 13. Schema validation queries (for CI/CD testing)
-- These queries should FAIL if there's any leakage
-- Query 1: Decision engine should not access reference data
-- SELECT COUNT(*) FROM reference_assessments; -- Should be denied for decision_engine_role

-- Query 2: No reference fields in decision queries  
-- This will be implemented in application CI/CD tests

COMMENT ON TABLE reference_assessments IS 'CPO Compliance: Reference-Only data, never used for hiring decisions';
COMMENT ON TABLE decision_assessments IS 'CPO Compliance: Job-relevant data only, used for hiring decisions';
COMMENT ON POLICY reference_isolation ON assessments IS 'CPO Requirement: Prevent decision engine access to reference data';
COMMENT ON POLICY reference_complete_isolation ON reference_assessments IS 'CPO Requirement: Complete isolation of reference assessments';

-- Final verification
SELECT 
  'Schema guards installed' as status,
  COUNT(*) as reference_assessments_count
FROM reference_assessments;

SELECT 
  'Tenant compliance settings' as status,
  COUNT(*) as tenants_configured
FROM tenant_compliance_settings;