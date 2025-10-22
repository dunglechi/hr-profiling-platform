# 🚀 QUICK START: Setup Supabase Database

**Status**: ✅ Credentials Received & Configured  
**Next Step**: Create Database Tables

---

## ⚡ IMMEDIATE ACTION REQUIRED

### Step 1: Open Supabase SQL Editor

**Direct Link**: https://app.supabase.com/project/cgvxogztpbzvhncwzodr/editor

Or manually:
1. Go to https://app.supabase.com
2. Select project: `cgvxogztpbzvhncwzodr`
3. Click **SQL Editor** in left sidebar

---

### Step 2: Copy SQL Schema

**File Location**: `C:\Users\Admin\Projects\CV filltering\docs\supabase-schema.sql`

The schema file is **300+ lines** and creates:
- ✅ 6 main tables
- ✅ Foreign keys
- ✅ Indexes for performance
- ✅ Views for joined data
- ✅ Triggers for auto-updates
- ✅ Sample test data

---

### Step 3: Execute SQL

1. In SQL Editor, click **New Query**
2. Paste the ENTIRE content from `supabase-schema.sql`
3. Click **Run** (or press Ctrl+Enter)
4. Wait for "Success" message

**Expected Output**:
```
Success. No rows returned.
```

---

### Step 4: Verify Tables Created

After running SQL, you should see 6 new tables in **Table Editor**:

- ✅ `candidates` - Master candidate data
- ✅ `cv_analyses` - CV parsing results  
- ✅ `numerology_data` - Thần số học calculations
- ✅ `disc_assessments` - DISC personality profiles
- ✅ `activity_logs` - Audit trail
- ✅ `screening_results` - Legacy compatibility

---

### Step 5: Run Integration Tests

After tables are created, run:

```powershell
cd "C:\Users\Admin\Projects\CV filltering"
python test-supabase-integration.py
```

**Expected Results**:
- ✅ Connection Test: PASS
- ✅ CV Parsing Data: PASS  
- ✅ Numerology Data: PASS
- ✅ DISC Assessment Data: PASS
- ✅ Data Retrieval: PASS

---

## 📋 Current Status

**Connection**: ✅ **VERIFIED**
```
URL: https://cgvxogztpbzvhncwzodr.supabase.co
Status: Connected successfully!
```

**Tables**: ❌ **NOT CREATED YET**
```
Missing: 6/6 tables
Action: Execute docs/supabase-schema.sql
```

**Credentials**: ✅ **CONFIGURED**
```
File: .env
SUPABASE_URL=https://cgvxogztpbzvhncwzodr.supabase.co
SUPABASE_KEY=eyJhbGc...dXiF4
```

---

## 🔍 Verification Commands

**Check Tables**:
```powershell
python check-supabase-tables.py
```

**Test Connection**:
```powershell
python -c "from backend.src.services.database_service import DatabaseService; db = DatabaseService(); print('Connected!' if not db.is_stub() else 'Stub mode')"
```

**Run Full Tests**:
```powershell
python test-supabase-integration.py
```

---

## 📞 Need Help?

**Schema File**: `docs/supabase-schema.sql`  
**Setup Guide**: `docs/SUPABASE_SETUP.md`  
**Dashboard**: https://app.supabase.com/project/cgvxogztpbzvhncwzodr

---

## ⏱️ Estimated Time

- SQL Execution: **2-3 minutes**
- Verification: **1-2 minutes**
- Integration Tests: **2-3 minutes**

**Total**: ~5-8 minutes to complete setup!

---

**Last Updated**: 2025-10-22  
**Status**: Ready to execute SQL schema
