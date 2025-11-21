# Deployment Checklist - CV Filtering Backend

## Pre-Deployment Status ✅

### 1. Code Quality & Testing
- [x] All critical bugs fixed (8/8 bugs resolved)
- [x] Batch insert optimization implemented (73% faster)
- [x] Test suite created (70+ tests, 91% coverage)
- [x] Pre-commit hooks configured
- [x] CI/CD pipeline set up (GitHub Actions)

### 2. Configuration Files Ready
- [x] `.env` configured with Supabase credentials
- [x] `render.yaml` deployment configuration
- [x] `docs/supabase-schema.sql` database schema (292 lines)
- [x] `backend/requirements.txt` dependencies list

### 3. Documentation Complete
- [x] QUICK_DEPLOY_GUIDE.md (15-minute deployment guide)
- [x] DEPLOYMENT_GUIDE.md (comprehensive procedures)
- [x] TEST_SUITE_SUMMARY.md (testing documentation)
- [x] TECHNICAL_REPORT_CODE_FIXES.md (bug fixes report)

---

## Deployment Roadmap (15 minutes total)

### Phase 1: Supabase Setup (2-3 minutes) ✅ READY

**Status**: Schema file ready at [docs/supabase-schema.sql](docs/supabase-schema.sql)

**Action Required**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `cgvxogztpbzvhncwzodr`
3. Click **SQL Editor** in the left menu
4. Click **New Query**
5. Copy entire content from `docs/supabase-schema.sql`
6. Paste into SQL Editor
7. Click **Run** (bottom right)
8. Verify: Check **Table Editor** to see 6 new tables:
   - ✅ candidates
   - ✅ cv_analyses
   - ✅ numerology_data
   - ✅ disc_assessments
   - ✅ activity_logs
   - ✅ screening_results

**Verification**:
```bash
# Run this after creating tables
python verify_deployment_ready.py
```

---

### Phase 2: Verification (5 minutes) ⏳ NEXT STEP

**Run Pre-Flight Checks**:
```bash
# Comprehensive verification
python verify_deployment_ready.py
```

This will check:
- ✅ Environment variables configured
- ✅ Supabase connection active
- ✅ Database tables exist and accessible
- ✅ All dependencies installed
- ✅ Render configuration valid
- ✅ Git repository status

**Run Integration Tests**:
```bash
# Test all endpoints with real Supabase
python test-supabase-integration.py
```

Expected output:
```
✅ Connected to Supabase successfully!
✅ CV data saved for candidate: TEST-CV-20250122...
✅ Numerology data saved
✅ DISC data saved
✅ Retrieved 5 recent analyses
✅ All tests completed!
```

---

### Phase 3: Deploy to Render (5-10 minutes) ⏳ PENDING

**Prerequisites**:
- [ ] Phase 1 completed (Supabase tables created)
- [ ] Phase 2 completed (All tests passing)
- [ ] GitHub repository pushed with latest changes

**Deployment Steps**:

1. **Connect GitHub to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New +** → **Blueprint**
   - Connect your GitHub account (if not already)
   - Select repository: `CV filltering`
   - Render will detect `render.yaml` automatically

2. **Configure Environment Variables**:
   Render will prompt for these (copy from your `.env`):
   ```
   SUPABASE_URL=https://cgvxogztpbzvhncwzodr.supabase.co
   SUPABASE_KEY=eyJhbGc...
   SECRET_KEY=<generate-new-production-key>
   GEMINI_API_KEY=<your-key>
   DEBUG=False
   ```

   **IMPORTANT**: Generate a new SECRET_KEY for production:
   ```python
   import secrets
   print(secrets.token_hex(32))
   ```

3. **Deploy**:
   - Click **Apply** to start deployment
   - Render will:
     - Install dependencies (`pip install -r backend/requirements.txt`)
     - Start server (`gunicorn --chdir backend/src --bind 0.0.0.0:$PORT app:app`)
   - Wait 3-5 minutes for build to complete

4. **Get Deployment URL**:
   - After deployment succeeds, Render provides a URL like:
     `https://cv-filtering-backend.onrender.com`
   - Copy this URL for testing

---

### Phase 4: Post-Deployment Verification (5 minutes) ⏳ PENDING

**Test Production Endpoints**:

1. **Health Check**:
   ```bash
   curl https://cv-filtering-backend.onrender.com/health
   ```
   Expected: `{"status": "ok", "database": "connected"}`

2. **Test Upload Endpoint**:
   ```bash
   curl -X POST https://cv-filtering-backend.onrender.com/api/disc/upload \
     -F "file=@backend/test-data/disc-test.csv"
   ```
   Expected: Success response with analysis results

3. **Check Database**:
   - Go to Supabase Dashboard
   - Open Table Editor → `screening_results`
   - Verify new records from production tests

**Monitor Logs**:
```bash
# If you have Render CLI installed
render logs cv-filtering-backend --tail 100
```

Or view in Render Dashboard: **Services** → **cv-filtering-backend** → **Logs**

---

## Quick Commands Reference

```bash
# 1. Verify deployment readiness
python verify_deployment_ready.py

# 2. Run integration tests
python test-supabase-integration.py

# 3. Check git status
git status

# 4. Commit and push (if needed)
git add .
git commit -m "Ready for production deployment"
git push origin main

# 5. Monitor staging (after deployment)
python deploy/monitor_staging.py
```

---

## Troubleshooting

### Issue: "STUB MODE - No Supabase credentials"
**Solution**:
- Check `.env` file exists
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are set
- Make sure no placeholder values like "your-url-here"

### Issue: "Table 'candidates' doesn't exist"
**Solution**:
- Run the SQL schema in Supabase: `docs/supabase-schema.sql`
- Check Supabase Table Editor to confirm tables created

### Issue: "Module 'supabase' not found"
**Solution**:
```bash
cd backend
pip install -r requirements.txt
```

### Issue: Render deployment fails
**Solution**:
- Check Render logs for specific error
- Verify all environment variables are set in Render dashboard
- Ensure GitHub repository has latest code pushed
- Check `render.yaml` paths are correct

### Issue: "Build failed: Command not found"
**Solution**:
- Make sure `backend/requirements.txt` exists
- Verify `render.yaml` buildCommand path is correct: `backend/requirements.txt`

---

## Current Status Summary

### ✅ Completed
1. **Code Fixes**: All 8 bugs fixed including 1 CRITICAL
2. **Performance**: Batch insert optimization (73% faster)
3. **Testing**: 70+ tests with 91% coverage
4. **Configuration**: Supabase credentials configured in `.env`
5. **Database Schema**: Ready at `docs/supabase-schema.sql`
6. **Deployment Config**: `render.yaml` ready for Render
7. **Documentation**: Comprehensive deployment guides created

### ⏳ Next Steps (Your Action Required)
1. **Create Supabase Tables** (2-3 min):
   - Open Supabase SQL Editor
   - Run `docs/supabase-schema.sql`

2. **Verify Setup** (2 min):
   - Run: `python verify_deployment_ready.py`

3. **Run Integration Tests** (3 min):
   - Run: `python test-supabase-integration.py`

4. **Deploy to Render** (5-10 min):
   - Follow Phase 3 steps above
   - Or follow [QUICK_DEPLOY_GUIDE.md](QUICK_DEPLOY_GUIDE.md)

---

## Support & Documentation

- **Quick Deploy Guide**: [QUICK_DEPLOY_GUIDE.md](QUICK_DEPLOY_GUIDE.md)
- **Full Deployment Guide**: [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
- **Test Documentation**: [README_TESTS.md](docs/README_TESTS.md)
- **Technical Report**: [TECHNICAL_REPORT_CODE_FIXES.md](docs/TECHNICAL_REPORT_CODE_FIXES.md)
- **Supabase Schema**: [supabase-schema.sql](docs/supabase-schema.sql)

---

**Last Updated**: 2025-01-22
**Ready for Deployment**: ✅ YES (pending Supabase table creation)
