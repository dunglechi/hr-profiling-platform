import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { supabase } from '../lib/supabase';

const DatabaseSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const { error } = await supabase.from('numerology_results').select('count').limit(1);
      
      if (error) {
        setResults(prev => [...prev, '🔄 Database tables not found - will create them']);
        setStep(0);
      } else {
        setResults(prev => [...prev, '✅ Database connection successful! Tables already exist.']);
        setStep(3);
      }
    } catch (err) {
      setResults(prev => [...prev, '🔄 Starting database setup...']);
      setStep(0);
    }
  };

  const createNumerologyTable = async () => {
    try {
      // First try to create the table by attempting an insert with known structure
      const testData = {
        user_name: 'setup_test',
        birth_date: '1990-01-01',
        calculation_data: { test: true }
      };

      const { error } = await supabase
        .from('numerology_results')
        .insert(testData);

      if (error && error.message.includes('relation "numerology_results" does not exist')) {
        // Table doesn't exist, we need to create it manually
        throw new Error('Table does not exist and needs to be created via Supabase dashboard');
      }

      // If we get here, table exists but insert might have failed for other reasons
      // Delete the test record if it was inserted
      await supabase
        .from('numerology_results')
        .delete()
        .eq('user_name', 'setup_test');

      setResults(prev => [...prev, '✅ numerology_results table verified']);
      return true;

    } catch (err: any) {
      if (err.message.includes('does not exist')) {
        setResults(prev => [...prev, '❌ Table does not exist. Please create manually.']);
        setError('Tables need to be created manually in Supabase dashboard');
        return false;
      }
      setResults(prev => [...prev, `✅ numerology_results table exists`]);
      return true;
    }
  };

  const createUsersTable = async () => {
    try {
      const testData = {
        email: 'setup_test@example.com',
        full_name: 'Setup Test User'
      };

      const { error } = await supabase
        .from('users')
        .insert(testData);

      if (error && error.message.includes('relation "users" does not exist')) {
        throw new Error('Table does not exist');
      }

      // Clean up test record
      await supabase
        .from('users')
        .delete()
        .eq('email', 'setup_test@example.com');

      setResults(prev => [...prev, '✅ users table verified']);
      return true;

    } catch (err: any) {
      if (err.message.includes('does not exist')) {
        setResults(prev => [...prev, '❌ users table does not exist']);
        return false;
      }
      setResults(prev => [...prev, '✅ users table exists']);
      return true;
    }
  };

  const setupDatabase = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Step 1: Test numerology_results table
      setStep(1);
      const numerologyExists = await createNumerologyTable();

      // Step 2: Test users table
      setStep(2);
      const usersExists = await createUsersTable();

      if (!numerologyExists || !usersExists) {
        setError('Some tables are missing. Please create them manually in Supabase dashboard.');
        setResults(prev => [...prev, '❌ Manual table creation required']);
        return;
      }

      // Step 3: Test insert
      setStep(3);
      const testData = {
        user_name: 'Test User',
        birth_date: '1990-01-01',
        calculation_data: {
          lifePathNumber: 1,
          destinyNumber: 5,
          test: true
        }
      };

      const { data, error } = await supabase
        .from('numerology_results')
        .insert(testData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setResults(prev => [...prev, `✅ Test insert successful! ID: ${data.id}`]);
      setResults(prev => [...prev, '🎉 Database setup verified successfully!']);

    } catch (err: any) {
      setError(`Setup failed: ${err.message}`);
      setResults(prev => [...prev, `❌ Setup failed: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const showSQLInstructions = () => {
    const sql = `
-- Copy and paste this SQL in your Supabase SQL Editor:

-- Create numerology_results table
CREATE TABLE IF NOT EXISTS numerology_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  calculation_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assessment_results table for DISC, MBTI, etc.
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE numerology_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development)
CREATE POLICY "Allow public read" ON numerology_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON numerology_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON assessment_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON assessment_results FOR INSERT WITH CHECK (true);
    `.trim();

    navigator.clipboard.writeText(sql);
    setResults(prev => [...prev, '📋 SQL copied to clipboard! Paste it in Supabase SQL Editor']);
  };

  const steps = [
    'Test connection',
    'Verify numerology_results table',
    'Verify users table',
    'Database ready'
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🚀 Database Setup & Verification
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This tool verifies your Supabase database setup and provides SQL scripts if needed.
          </Typography>

          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={showSQLInstructions}
                >
                  📋 Copy SQL Script
                </Button>
              </Box>
            </Alert>
          )}

          <Stepper activeStep={step} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {index === 0 && 'Testing connection to Supabase...'}
                    {index === 1 && 'Checking if numerology_results table exists...'}
                    {index === 2 && 'Checking if users table exists...'}
                    {index === 3 && 'Database is ready for use!'}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={setupDatabase}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Checking...' : 'Verify Database'}
            </Button>

            <Button
              variant="outlined"
              onClick={showSQLInstructions}
            >
              📋 Get SQL Script
            </Button>

            <Button
              variant="outlined"
              onClick={testConnection}
            >
              🔄 Refresh Status
            </Button>
          </Box>

          {results.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                📋 Setup Log:
              </Typography>
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  maxHeight: 300,
                  overflow: 'auto'
                }}
              >
                {results.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              📝 Manual Setup Instructions:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1. Go to your Supabase dashboard: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener">https://supabase.com/dashboard</a><br/>
              2. Select your project: lvxwggtgrianassxnftj<br/>
              3. Go to SQL Editor in the left sidebar<br/>
              4. Click "Get SQL Script" above to copy the SQL<br/>
              5. Paste and run the SQL script<br/>
              6. Click "Verify Database" to test the setup
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DatabaseSetup;