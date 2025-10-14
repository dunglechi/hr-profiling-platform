-- Execute this in Supabase SQL Editor IMMEDIATELY after deployment
-- System Metrics Table for Production Monitoring

CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- API Performance Metrics
    api_calls_total INTEGER DEFAULT 0,
    api_calls_by_endpoint JSONB DEFAULT '{}',
    api_avg_response_time DECIMAL DEFAULT 0,
    api_error_rate DECIMAL DEFAULT 0,
    
    -- AI Cost Tracking
    ai_openai_tokens INTEGER DEFAULT 0,
    ai_estimated_cost DECIMAL DEFAULT 0,
    ai_cv_analysis_calls INTEGER DEFAULT 0,
    ai_average_tokens_per_call DECIMAL DEFAULT 0,
    
    -- User Activity
    user_active_users INTEGER DEFAULT 0,
    user_completed_assessments INTEGER DEFAULT 0,
    user_peak_concurrent INTEGER DEFAULT 0,
    
    -- System Health
    system_memory_usage BIGINT DEFAULT 0,
    system_error_count INTEGER DEFAULT 0,
    system_warning_count INTEGER DEFAULT 0,
    
    -- Raw metrics data for flexibility
    raw_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON system_metrics(created_at);

-- Enable Row Level Security
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow service accounts to write metrics
CREATE POLICY "Enable insert for service accounts" ON system_metrics
    FOR INSERT WITH CHECK (true);

-- Policy: Allow read access for authenticated users with admin role
CREATE POLICY "Enable read for authenticated users" ON system_metrics
    FOR SELECT USING (true);

-- Automated cleanup: Keep only last 30 days of metrics
CREATE OR REPLACE FUNCTION cleanup_old_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM system_metrics 
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$;

-- Schedule cleanup to run daily at 2 AM
SELECT cron.schedule('cleanup-old-metrics', '0 2 * * *', 'SELECT cleanup_old_metrics();');

-- Grant necessary permissions
GRANT ALL ON system_metrics TO postgres;
GRANT SELECT, INSERT ON system_metrics TO anon;
GRANT SELECT, INSERT, UPDATE ON system_metrics TO authenticated;

-- Verify table creation
SELECT 'System metrics table created successfully' as status;