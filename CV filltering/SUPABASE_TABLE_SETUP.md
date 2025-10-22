# 🗄️ Supabase Database Setup - Quick Guide
**Priority #2: Step 2 - Create Database Tables**

**Status:** 🔄 IN PROGRESS  
**Expected Time:** 2-3 minutes  
**Dashboard:** [Supabase SQL Editor](https://app.supabase.com/project/cgvxogztpbzvhncwzodr/editor)

---

## ✅ Prerequisites (COMPLETED)

- [x] **.env configured** with real Supabase credentials
- [x] **Connection verified** (test successful)
- [x] **SQL schema ready** (`docs/supabase-schema.sql`)
- [x] **TESSERACT_CONFIG** added to .env.example

---

## 📋 Step-by-Step Instructions

### **Step 1: Open Supabase SQL Editor** (30 seconds)

1. Navigate to: https://app.supabase.com/project/cgvxogztpbzvhncwzodr/editor
2. Log in if needed
3. You should see the SQL Editor interface

---

### **Step 2: Open SQL Schema File** (30 seconds)

**Option A - From VS Code:**
```
File location: docs/supabase-schema.sql
Lines: 300+ lines
```

**Option B - From File Explorer:**
```
c:\Users\Admin\Projects\CV filltering\docs\supabase-schema.sql
```

---

### **Step 3: Copy SQL Content** (15 seconds)

1. Open `docs/supabase-schema.sql` in VS Code
2. Press `Ctrl+A` to select all
3. Press `Ctrl+C` to copy

**What you're copying:**
- 6 table definitions
- Indexes for performance
- Views for data aggregation
- Triggers for auto-update
- Sample data (optional)

---

### **Step 4: Execute SQL** (1 minute)

1. Go back to Supabase SQL Editor
2. Paste SQL content (`Ctrl+V`)
3. Click **"Run"** button (or press `Ctrl+Enter`)
4. Wait for execution...

**Expected Result:**
```
✅ Success. No rows returned
```

**If you see this, CONGRATULATIONS!** 🎉 All tables created successfully!

---

### **Step 5: Verify Tables Created** (30 seconds)

**Quick Visual Check:**
1. In Supabase dashboard, go to **"Table Editor"** tab
2. You should see 6 tables in the left sidebar:
   - ✅ `candidates`
   - ✅ `cv_analyses`
   - ✅ `numerology_data`
   - ✅ `disc_assessments`
   - ✅ `activity_logs`
   - ✅ `screening_results`

**Automated Verification:**
After visual check, we'll run:
```bash
python check-supabase-tables.py
```
Expected output: `✅ 6/6 tables found`

---

## 📊 What Gets Created

### **Tables (6 total):**

#### 1. `candidates` (Master Data)
**Purpose:** Store candidate master information
**Columns:**
- `id` (UUID, primary key)
- `full_name` (text)
- `email` (text, unique)
- `phone` (text)
- `created_at`, `updated_at` (timestamps)

#### 2. `cv_analyses` (CV Parsing Results)
**Purpose:** Store complete CV parsing data from Gemini AI
**Columns:**
- `id` (UUID, primary key)
- `candidate_id` (foreign key → candidates)
- `file_name` (text)
- `parsing_method` (text: 'gemini' or 'rule-based')
- `ai_used` (boolean)
- `personal_info` (JSONB)
- `education` (JSONB array)
- `experience` (JSONB array)
- `skills` (JSONB array)
- `source_info` (JSONB)
- `raw_response` (JSONB - complete Gemini response)
- `created_at` (timestamp)

**Key Feature:** Stores **raw_data** for all fields (verified correct by Gemini review #2)

#### 3. `numerology_data` (Numerology Calculations)
**Purpose:** Store numerology profile data
**Columns:**
- `id` (UUID, primary key)
- `candidate_id` (foreign key → candidates)
- `full_name` (text)
- `date_of_birth` (date)
- `life_path_number` (integer)
- `destiny_number` (integer)
- `soul_number` (integer)
- `personality_number` (integer)
- `maturity_number` (integer)
- `interpretation` (text)
- `created_at` (timestamp)

#### 4. `disc_assessments` (DISC Profiles)
**Purpose:** Store DISC personality assessment results
**Columns:**
- `id` (UUID, primary key)
- `candidate_id` (foreign key → candidates)
- `assessment_type` (text: 'form' or 'csv')
- `d_score` (integer, 0-100)
- `i_score` (integer, 0-100)
- `s_score` (integer, 0-100)
- `c_score` (integer, 0-100)
- `primary_type` (text: D/I/S/C)
- `secondary_type` (text, nullable)
- `profile_description` (text)
- `raw_data` (JSONB - original assessment data)
- `created_at` (timestamp)

#### 5. `activity_logs` (Audit Trail)
**Purpose:** Track all system activities for audit
**Columns:**
- `id` (UUID, primary key)
- `candidate_id` (foreign key → candidates, nullable)
- `activity_type` (text: 'cv_upload', 'numerology_calc', etc.)
- `description` (text)
- `metadata` (JSONB)
- `created_at` (timestamp)

#### 6. `screening_results` (Overall Results)
**Purpose:** Store final screening decisions
**Columns:**
- `id` (UUID, primary key)
- `candidate_id` (foreign key → candidates)
- `overall_score` (numeric)
- `cv_score` (numeric, nullable)
- `numerology_score` (numeric, nullable)
- `disc_score` (numeric, nullable)
- `status` (text: 'pending', 'approved', 'rejected')
- `notes` (text)
- `screened_by` (text, nullable)
- `screened_at` (timestamp)
- `created_at`, `updated_at` (timestamps)

---

### **Views (1 total):**

#### `candidate_profiles` (Aggregated View)
**Purpose:** One-stop view for complete candidate information
**Combines:**
- Candidate basic info
- Latest CV analysis
- Latest numerology data
- Latest DISC assessment
- Latest screening result

**Usage:**
```sql
SELECT * FROM candidate_profiles WHERE full_name LIKE '%John%';
```

---

### **Indexes (Performance Optimization):**

1. `idx_cv_analyses_candidate_id` - Fast CV lookups by candidate
2. `idx_numerology_candidate_id` - Fast numerology lookups
3. `idx_disc_assessments_candidate_id` - Fast DISC lookups
4. `idx_activity_logs_candidate_id` - Fast activity history
5. `idx_activity_logs_type` - Fast activity filtering
6. `idx_screening_results_candidate_id` - Fast screening lookups
7. `idx_candidates_email` - Fast email searches (already unique)

---

### **Triggers (Auto-Update):**

1. **`update_candidates_updated_at`**
   - Auto-updates `updated_at` timestamp on candidates table
   
2. **`update_screening_results_updated_at`**
   - Auto-updates `updated_at` timestamp on screening_results table

---

## 🔧 Troubleshooting

### **Error: "relation already exists"**
**Cause:** Tables already created from previous attempt

**Solution:**
1. Drop existing tables first (if you want fresh start):
   ```sql
   DROP TABLE IF EXISTS activity_logs CASCADE;
   DROP TABLE IF EXISTS screening_results CASCADE;
   DROP TABLE IF EXISTS disc_assessments CASCADE;
   DROP TABLE IF EXISTS numerology_data CASCADE;
   DROP TABLE IF EXISTS cv_analyses CASCADE;
   DROP TABLE IF EXISTS candidates CASCADE;
   ```
2. Then run the full schema again

---

### **Error: "permission denied"**
**Cause:** Insufficient database permissions

**Solution:**
- Ensure you're using the correct Supabase project
- Verify you're logged in with admin/owner role
- Check `SUPABASE_KEY` is the service role key (not anon key) if needed

---

### **Error: "syntax error"**
**Cause:** SQL copied incorrectly or incomplete

**Solution:**
- Ensure entire file copied (300+ lines)
- Check for copy/paste corruption
- Re-copy from `docs/supabase-schema.sql`

---

## ✅ Success Verification

After successful execution, you should have:

**In Supabase Dashboard → Table Editor:**
- [x] 6 tables visible in left sidebar
- [x] Each table shows structure when clicked
- [x] No error messages

**Via Python Script:**
```bash
python check-supabase-tables.py
```
**Expected Output:**
```
✅ Checking Supabase tables...
✅ candidates: EXISTS
✅ cv_analyses: EXISTS
✅ numerology_data: EXISTS
✅ disc_assessments: EXISTS
✅ activity_logs: EXISTS
✅ screening_results: EXISTS

📊 Result: 6/6 tables found!
```

---

## 🎯 What's Next

After tables are created successfully:

### **Immediate (5 minutes):**
1. ✅ Run `python check-supabase-tables.py` to verify
2. ✅ Run `python test-supabase-integration.py` for comprehensive tests
3. ✅ Check Supabase Table Editor for test data

### **Short-term (This week):**
1. 🚀 Deploy to staging with `python deploy_staging.py`
2. 📊 Monitor with `python monitor_staging.py`
3. 🧪 Run full integration test suite

---

## 📚 Documentation References

**For this step:**
- `docs/supabase-schema.sql` - Complete SQL schema
- `docs/SUPABASE_SETUP.md` - Detailed setup guide
- `check-supabase-tables.py` - Table verification script

**For next steps:**
- `test-supabase-integration.py` - Integration tests
- `deploy_staging.py` - Deployment automation (by Claude AI)
- `monitor_staging.py` - Monitoring dashboard (by Claude AI)

---

## 💡 Pro Tips

1. **Keep Dashboard Open:** Easier to verify results immediately
2. **Copy Entire File:** Don't try to copy sections - get all 300+ lines
3. **Check Success Message:** "Success. No rows returned" means perfect execution
4. **Visual Verification:** Quick check in Table Editor before running scripts
5. **Save SQL Editor Content:** Supabase SQL Editor has history if you need to re-run

---

## 🎊 Ready?

When you're ready to proceed:
1. Open the Supabase SQL Editor link above
2. Copy SQL from `docs/supabase-schema.sql`
3. Paste and click Run
4. Verify success! ✅

**Let's create these tables and see our complete system come to life!** 🚀

---

**Created by:** GitHub Copilot  
**Date:** October 22, 2025  
**Part of:** Priority #2 - Supabase Integration  
**Status:** Step 2 of 4 (Create Tables → Test → Deploy → Monitor)
