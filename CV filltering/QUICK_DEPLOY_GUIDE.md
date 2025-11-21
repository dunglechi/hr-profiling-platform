# 🚀 Quick Deploy Guide - 15 Minutes to Production!

**CV Filtering Backend - From Local to Live in 3 Steps**

---

## ⏱️ Time Required

- **Step 1:** Supabase Setup (2-3 minutes)
- **Step 2:** Run Integration Tests (5 minutes)
- **Step 3:** Deploy to Render (5-10 minutes)

**Total:** ~15 minutes to production! 🎉

---

## 📋 Prerequisites

Before starting, make sure you have:
- [ ] GitHub account
- [ ] Supabase account (free tier)
- [ ] Render account (free tier)
- [ ] Code pushed to GitHub repository

---

## Step 1: Create Supabase Tables (2-3 minutes)

### 1.1 Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project or select existing project
3. Go to **Settings** → **API**
4. Copy these values:
   ```
   Project URL: https://your-project.supabase.co
   anon/public key: eyJhbGci...
   ```

### 1.2 Create Database Tables

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire content from `docs/supabase-schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Wait ~10 seconds for completion

### 1.3 Verify Tables Created

Run this verification query:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Result:** You should see these 6 tables:
- `activity_logs`
- `candidates`
- `cv_analyses`
- `disc_assessments`
- `numerology_data`
- `screening_results`

✅ **Step 1 Complete!**

---

## Step 2: Run Integration Tests (5 minutes)

### 2.1 Configure Local Environment

1. Create `.env` file (if not exists):
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials to `.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=eyJhbGci...
   ```

### 2.2 Run Integration Test

```bash
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run integration test
python test-supabase-integration.py
```

### 2.3 Expected Output

```
============================================================
  SUPABASE INTEGRATION TEST SUITE
============================================================

============================================================
  Test 1: Connection Test
============================================================

✅ Connected to Supabase successfully!

============================================================
  Test 2: CV Parsing Data
============================================================

✅ CV data saved for candidate: TEST-CV-20251022143000
   - Name: Nguyễn Văn Test
   - Email: test@example.com
   - Skills: Python, JavaScript, SQL

============================================================
  Test 3: Numerology Data
============================================================

✅ Numerology data saved for: Nguyễn Văn Test
   - Life Path: 8
   - Soul Urge: 9
   - Expression: 4

============================================================
  Test 4: DISC Assessment Data
============================================================

✅ DISC data saved
   - Profile: D/I
   - Scores: D=65, I=55, S=40, C=50

============================================================
  Test 5: Data Retrieval
============================================================

✅ Retrieved 4 recent analyses

1. Candidate: TEST-CV-20251022143000
   Source: cv_parsing
   Created: 2025-10-22T14:30:00...

============================================================
  Test Summary
============================================================
✅ All tests completed!

Test Candidate ID: TEST-CV-20251022143000

Next steps:
1. Check Supabase dashboard to verify data
2. Run integration tests: python -m pytest backend/src/__tests__/
3. Test functional endpoints: python tools/run-functional-tests.py
```

✅ **Step 2 Complete!**

---

## Step 3: Deploy to Render (5-10 minutes)

### Method A: One-Click Deploy (Easiest)

1. Click this button:

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

2. Connect your GitHub repository
3. Render will auto-detect `render.yaml`
4. Add environment variables in Render dashboard:
   - `SUPABASE_URL`: (from Step 1.1)
   - `SUPABASE_KEY`: (from Step 1.1)
   - `GEMINI_API_KEY`: (your Gemini API key)
5. Click **Apply**
6. Wait ~5 minutes for deployment

### Method B: Manual Deploy

#### 3.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select your repository: `CV filltering`

#### 3.2 Configure Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| Name | `cv-filtering-backend` |
| Region | `Singapore` |
| Branch | `main` (or `develop` for staging) |
| Runtime | `Python 3` |
| Build Command | `pip install -r backend/requirements.txt` |
| Start Command | `gunicorn --chdir backend/src --bind 0.0.0.0:$PORT app:app` |
| Plan | `Free` |

#### 3.3 Add Environment Variables

Click **Advanced** → **Add Environment Variable**

Add these variables:

```env
# Flask
FLASK_ENV=production
DEBUG=False
SECRET_KEY=[Auto-generated by Render]

# Supabase (from Step 1)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGci...

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# DISC Configuration
DISC_CSV_MAX_ROWS=1000
TESSERACT_CONFIG=--oem 3 --psm 6

# File Upload
MAX_CONTENT_LENGTH=16777216
ALLOWED_EXTENSIONS=pdf,docx,csv,xlsx,png,jpg,jpeg

# CORS (update after getting Render URL)
CORS_ORIGINS=http://localhost:3000
```

#### 3.4 Deploy!

1. Click **Create Web Service**
2. Render will:
   - Clone your repository
   - Install dependencies
   - Start your application
   - Generate a URL: `https://cv-filtering-backend.onrender.com`

⏱️ **Wait ~5-7 minutes for first deployment**

#### 3.5 Monitor Deployment

Watch the logs in real-time:
- Render dashboard shows build logs
- Look for: `✅ Build successful`
- Then: `✅ Deploy successful`

✅ **Step 3 Complete!**

---

## 🎯 Verify Deployment

### Check Health Endpoint

Once deployment completes, test your API:

```bash
# Replace with your actual Render URL
curl https://cv-filtering-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T14:30:00.000000",
  "version": "1.0.0",
  "database": "connected",
  "services": {
    "cv_parsing": "ready",
    "numerology": "ready",
    "disc_pipeline": "ready"
  }
}
```

### Test DISC API

```bash
curl https://cv-filtering-backend.onrender.com/api/disc/test
```

**Expected Response:**
```json
{
  "success": true,
  "test_status": "passed",
  "service": "DISC Pipeline",
  "timestamp": "2025-10-22T14:30:00.000000"
}
```

### Monitor with Script

Use our monitoring tool:

```bash
python monitor_staging.py --url https://cv-filtering-backend.onrender.com
```

---

## 🔗 Your Deployment URLs

After deployment, you'll have:

**Backend API:**
```
https://cv-filtering-backend.onrender.com
```

**API Endpoints:**
- Health: `/health`
- DISC Test: `/api/disc/test`
- DISC Manual: `/api/disc/manual-input` (POST)
- DISC CSV: `/api/disc/upload-csv` (POST)
- DISC OCR: `/api/disc/upload-ocr-image` (POST)
- DISC Status: `/api/disc/status/<id>` (GET)

**Supabase Dashboard:**
```
https://supabase.com/dashboard/project/your-project
```

---

## 🎊 Post-Deployment Checklist

After successful deployment:

### Immediate (Today)
- [ ] ✅ Health check passing
- [ ] ✅ DISC test endpoint working
- [ ] ✅ Verify data in Supabase
- [ ] ✅ Update CORS_ORIGINS with actual URL
- [ ] ✅ Test all API endpoints

### Short-term (This Week)
- [ ] ✅ Monitor for 24-48 hours
- [ ] ✅ Check error logs in Render
- [ ] ✅ Verify database performance
- [ ] ✅ Test with real data
- [ ] ✅ Share URL with team

### Medium-term (Next Week)
- [ ] ✅ Set up custom domain (optional)
- [ ] ✅ Configure alerting
- [ ] ✅ Performance optimization
- [ ] ✅ Frontend deployment

---

## 🐛 Troubleshooting

### Issue: Build Failed

**Error:** `pip install failed`

**Solution:**
```bash
# Check requirements.txt includes gunicorn
echo "gunicorn==21.2.0" >> backend/requirements.txt
git add backend/requirements.txt
git commit -m "Add gunicorn"
git push
```

### Issue: Application Crashed

**Error:** `Application failed to start`

**Solution:**
1. Check logs in Render dashboard
2. Verify Start Command: `gunicorn --chdir backend/src --bind 0.0.0.0:$PORT app:app`
3. Check if `app.py` has `app` variable: `app = Flask(__name__)`

### Issue: Health Check Failing

**Error:** `Health check timeout`

**Solution:**
1. Verify health endpoint exists in `app.py`
2. Check if port binding is correct: `0.0.0.0:$PORT`
3. Ensure Flask app starts: Look for "Booting worker" in logs

### Issue: Database Connection Failed

**Error:** `Supabase connection failed`

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_KEY` in environment variables
2. Check Supabase project is active (not paused)
3. Verify credentials are correct (no extra spaces)

### Issue: CORS Errors

**Error:** `CORS policy blocked`

**Solution:**
1. Update `CORS_ORIGINS` environment variable
2. Add your frontend URL
3. Redeploy service

---

## 📊 Render Free Tier Limits

Your free tier includes:
- ✅ 750 hours/month (enough for 24/7)
- ✅ Automatic SSL certificates
- ✅ Automatic deploys from GitHub
- ✅ Custom domains
- ⚠️ Sleeps after 15 minutes of inactivity
- ⚠️ Cold start time: ~30 seconds

**Tip:** Use a ping service (like UptimeRobot) to keep it awake.

---

## 🔄 Update Deployment

### Auto-Deploy (Recommended)

Render auto-deploys when you push to GitHub:

```bash
git add .
git commit -m "Update: New features"
git push origin main
```

Render will automatically:
1. Detect the push
2. Pull latest code
3. Rebuild and redeploy
4. Zero-downtime deployment

### Manual Deploy

In Render dashboard:
1. Go to your service
2. Click **Manual Deploy** → **Deploy latest commit**

---

## 🎯 Next Steps After Deployment

### 1. Update Frontend Configuration

If you have a frontend, update API URL:

```js
// In frontend .env or config
VITE_API_URL=https://cv-filtering-backend.onrender.com/api
```

### 2. Test All Endpoints

Use Postman or curl:

```bash
# DISC Manual Input
curl -X POST https://cv-filtering-backend.onrender.com/api/disc/manual-input \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": "TEST-001",
    "d_score": 8,
    "i_score": 6,
    "s_score": 7,
    "c_score": 5
  }'

# Expected: {"success": true, ...}
```

### 3. Monitor Performance

```bash
# Use our monitoring script
python monitor_staging.py --url https://cv-filtering-backend.onrender.com --interval 60
```

### 4. Share with Team

Your live API is ready! Share the URL:
```
🚀 Backend API: https://cv-filtering-backend.onrender.com
📊 Health Check: https://cv-filtering-backend.onrender.com/health
📖 API Docs: https://cv-filtering-backend.onrender.com/api/docs (if configured)
```

---

## 🎊 Congratulations!

You now have:
- ✅ Production database (Supabase)
- ✅ Live backend API (Render)
- ✅ Automated deployments (GitHub → Render)
- ✅ Health monitoring
- ✅ SSL certificate (HTTPS)

**Your backend is LIVE and ready for production use!** 🚀

---

## 📞 Support

### Render Issues
- Dashboard: https://dashboard.render.com
- Logs: Click your service → **Logs** tab
- Docs: https://render.com/docs

### Supabase Issues
- Dashboard: https://supabase.com/dashboard
- SQL Editor: Test queries
- Logs: **Database** → **Logs**

### Application Issues
- Check logs: Render dashboard
- Monitor: `python monitor_staging.py`
- Health: `/health` endpoint

---

**Deployment Guide Version:** 1.0
**Last Updated:** 2025-10-22
**Estimated Time:** 15 minutes
**Difficulty:** Easy 🟢

**Happy Deploying!** 🚀✨
