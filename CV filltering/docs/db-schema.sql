-- docs/db-schema.sql
-- Schema for the screening_results table in Supabase

CREATE TABLE screening_results (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    candidate_id VARCHAR(255),
    source_type VARCHAR(50) NOT NULL, -- 'cv_parsing', 'disc_csv', 'disc_ocr', etc.
    raw_data JSONB, -- The full result from the service
    summary JSONB, -- Key extracted fields (e.g., name, email, disc scores)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_by VARCHAR(100) -- Identifier for the service/model version
);

-- Optional: Add an index for faster lookups
CREATE INDEX idx_candidate_id ON screening_results(candidate_id);
CREATE INDEX idx_source_type ON screening_results(source_type);

-- Enable Row-Level Security (RLS)
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;

-- Create policies for access
-- This policy allows public read access (anon key)
CREATE POLICY "Allow public read access" ON screening_results
    FOR SELECT
    USING (true);

-- This policy allows authenticated users to insert their own data
-- You might want to restrict this further based on your auth setup
CREATE POLICY "Allow insert for authenticated users" ON screening_results
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
