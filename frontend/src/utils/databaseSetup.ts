import { supabase } from '../lib/supabase';

// Database migration script
export async function createTables() {
  try {
    console.log('🚀 Creating database tables...');

    // Create numerology_results table
    const { error: numerologyError } = await supabase.rpc('create_numerology_table');
    if (numerologyError && !numerologyError.message.includes('already exists')) {
      console.error('Error creating numerology table:', numerologyError);
    }

    // Create users table
    const { error: usersError } = await supabase.rpc('create_users_table');
    if (usersError && !usersError.message.includes('already exists')) {
      console.error('Error creating users table:', usersError);
    }

    // Create assessment_results table
    const { error: assessmentError } = await supabase.rpc('create_assessment_table');
    if (assessmentError && !assessmentError.message.includes('already exists')) {
      console.error('Error creating assessment table:', assessmentError);
    }

    console.log('✅ Database setup complete!');
    return true;

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

// Test database connection
export async function testConnection() {
  try {
    const { error } = await supabase.from('numerology_results').select('count').limit(1);
    
    if (error) {
      console.log('🔄 Tables not created yet, will create them...');
      return false;
    }
    
    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}