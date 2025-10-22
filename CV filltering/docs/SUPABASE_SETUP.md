# Supabase Integration Setup Guide

## 📋 Prerequisites

1. Supabase account with a project created
2. Project URL and Anon Key from Supabase dashboard

## 🚀 Step-by-Step Setup

### 1. Create Database Schema

1. Log in to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Open the file `docs/supabase-schema.sql`
4. Copy the entire SQL content
5. Paste into Supabase SQL Editor
6. Click **Run** to execute
7. Verify tables created: Go to **Table Editor** - you should see:
   - `candidates`
   - `cv_analyses`
   - `numerology_data`
   - `disc_assessments`
   - `activity_logs`
   - `screening_results`

### 2. Get Your Credentials

1. In Supabase dashboard, click **Settings** (⚙️) in the left sidebar
2. Click **API** under Project Settings
3. Copy the following:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configure Environment Variables

1. In the project root, create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **IMPORTANT**: Never commit `.env` to git! It's already in `.gitignore`.

### 4. Install Python Dependencies

Make sure `supabase` package is installed:

```bash
# Activate virtual environment first
.\.venv\Scripts\Activate.ps1

# Install supabase client
pip install supabase
```

### 5. Verify Connection

Run the database service test:

```bash
python -c "from backend.src.services.database_service import DatabaseService; db = DatabaseService(); print('✅ Stub mode' if db.is_stub() else '✅ Connected to Supabase!')"
```

Expected output:
- If credentials are correct: `✅ Connected to Supabase!`
- If credentials missing/wrong: `✅ Stub mode`

### 6. Test Database Operations

Create a test script `test-supabase.py`:

```python
from backend.src.services.database_service import DatabaseService

db = DatabaseService()

# Test 1: Check connection
print(f"Is stub mode: {db.is_stub()}")

# Test 2: Save analysis
result = db.save_analysis(
    candidate_id="TEST-DB-001",
    source_type="cv_parsing",
    raw_data={"test": "data"},
    summary={"name": "Test Candidate"}
)
print(f"Save result: {result}")

# Test 3: Get recent analyses
recent = db.get_recent_analyses(limit=5)
print(f"Recent analyses: {recent}")
```

Run it:
```bash
python test-supabase.py
```

## 🔍 Troubleshooting

### Issue: "Stub mode" even with correct credentials

**Solution**: Check if credentials contain "your_supabase" placeholder text. The service checks for this and switches to stub mode.

### Issue: Connection timeout or error

**Solutions**:
1. Verify Supabase project is active (not paused)
2. Check firewall settings allow connections to Supabase
3. Verify URL format: `https://xxxxx.supabase.co` (no trailing slash)
4. Verify anon key is the **public anon key**, not service role key

### Issue: Permission denied on tables

**Solution**: 
1. In Supabase, go to **Authentication** → **Policies**
2. Make sure RLS (Row Level Security) policies are correctly set
3. For development, you can temporarily disable RLS:
   ```sql
   ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
   -- Repeat for other tables
   ```

## 📊 Database Schema Overview

### Main Tables

- **candidates**: Master data for all candidates
- **cv_analyses**: CV parsing results (Gemini/rule-based)
- **numerology_data**: Thần số học calculations
- **disc_assessments**: DISC profile assessments
- **activity_logs**: System activity tracking
- **screening_results**: Legacy support for current stub code

### Views

- **candidate_profiles**: Combined view of all candidate data

## 🔐 Security Best Practices

1. **Never** commit `.env` to git
2. Use **anon key** for frontend/backend, **service role key** only for admin operations
3. Enable **Row Level Security (RLS)** in production
4. Rotate keys periodically
5. Monitor API usage in Supabase dashboard

## 📈 Next Steps After Setup

1. Run integration tests: `python -m pytest backend/src/__tests__/`
2. Test functional endpoints: `python tools/run-functional-tests.py`
3. Verify data in Supabase Table Editor
4. Check activity logs for debugging

## 💡 Useful Supabase SQL Queries

```sql
-- View all candidates
SELECT * FROM candidates ORDER BY created_at DESC LIMIT 10;

-- View complete profiles
SELECT * FROM candidate_profiles LIMIT 5;

-- Check recent activity
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 20;

-- Count records by type
SELECT source_type, COUNT(*) 
FROM screening_results 
GROUP BY source_type;

-- Find candidates missing DISC data
SELECT c.candidate_id, c.name 
FROM candidates c 
LEFT JOIN disc_assessments d ON c.candidate_id = d.candidate_id 
WHERE d.id IS NULL;
```

## 📞 Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check backend logs: `backend/app.log`
3. Enable debug logging in `.env`: `DEBUG=True`
4. Contact backend team with error logs

---

**Last Updated**: 2025-10-22  
**Version**: 1.0  
**Status**: Ready for Production Integration
