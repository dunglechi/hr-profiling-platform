# 🎯 Post-Supabase Setup - Quick Guide
**What to do after Claude AI completes table creation**

---

## ✅ STEP 1: Verify Tables Created (1 minute)

Run the verification script:
```bash
python check-supabase-tables.py
```

**Expected Output:**
```
✅ candidates: EXISTS
✅ cv_analyses: EXISTS
✅ numerology_data: EXISTS
✅ disc_assessments: EXISTS
✅ activity_logs: EXISTS
✅ screening_results: EXISTS

📊 Result: 6/6 tables found!
```

**If any table is missing:**
- Check Supabase SQL Editor for errors
- Re-run the SQL from `docs/supabase-schema.sql`
- Contact Claude AI for help

---

## 🧪 STEP 2: Run Integration Tests (10-15 minutes)

Run comprehensive integration tests:
```bash
python test-supabase-integration.py
```

**What this tests:**
1. ✅ Connection to Supabase
2. ✅ CV data save/retrieve
3. ✅ Numerology data save/retrieve
4. ✅ DISC assessment save/retrieve
5. ✅ Batch operations
6. ✅ Data integrity

**Expected Output:**
```
Test 1: Connection ................... PASS ✅
Test 2: Save CV Analysis ............. PASS ✅
Test 3: Retrieve CV Analysis ......... PASS ✅
Test 4: Save Numerology .............. PASS ✅
Test 5: Save DISC Assessment ......... PASS ✅
Test 6: Batch Save Operations ........ PASS ✅

📊 All tests passed! Database ready for production.
```

---

## 🚀 STEP 3: Deploy to Render (15-20 minutes)

Now that database is ready, deploy the full stack!

### **3.1 Go to Render.com**
```
https://render.com
```

### **3.2 Sign Up**
- Click "Sign up with GitHub"
- Authorize Render

### **3.3 Create Blueprint Deployment**
1. Click **"New +"** button
2. Select **"Blueprint"**
3. Connect your GitHub account (if not already)
4. Select repository: **`hr-profiling-platform`**
5. Branch: **`main`**
6. Click **"Apply"**

Render will automatically:
- Read `render.yaml`
- Create 2 services (backend + frontend)
- Set up auto-deploy

### **3.4 Add Environment Variables**

**For Backend Service (`cv-filtering-backend`):**

Go to service → **Environment** → Add these:

```bash
SUPABASE_URL=https://cgvxogztpbzvhncwzodr.supabase.co
SUPABASE_KEY=your_anon_key_from_.env_file
GEMINI_API_KEY=your_gemini_key_from_.env_file
```

**Important:** Copy exact values from your `.env` file!

### **3.5 Deploy Backend**
1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait 3-5 minutes (watch build logs)
3. Verify: `https://cv-filtering-backend.onrender.com/health`

**Expected:** JSON response with `"status": "healthy"`

### **3.6 Configure Frontend**

**For Frontend Service (`cv-filtering-frontend`):**

Go to service → **Environment** → Add:

```bash
VITE_API_URL=https://cv-filtering-backend.onrender.com/api
NODE_VERSION=18
```

### **3.7 Update CORS**

Go back to **Backend** → **Environment**:

Update `CORS_ORIGINS`:
```bash
CORS_ORIGINS=https://cv-filtering-frontend.onrender.com
```

Click **"Save Changes"** (backend will auto-redeploy)

### **3.8 Deploy Frontend**
1. Go to **Frontend** service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait 2-3 minutes
4. Verify: `https://cv-filtering-frontend.onrender.com`

**Expected:** CV Filtering Dashboard UI loads

---

## 📊 STEP 4: Final Verification (5 minutes)

### **4.1 Check Backend Health**
```bash
curl https://cv-filtering-backend.onrender.com/health
```

**Expected:** JSON with all services operational

### **4.2 Check Frontend**
Open in browser:
```
https://cv-filtering-frontend.onrender.com
```

**Expected:**
- ✅ UI loads
- ✅ No console errors
- ✅ Can navigate pages

### **4.3 Test Integration**

**Test CV Upload:**
1. Go to frontend URL
2. Upload a test CV (PDF or DOCX)
3. Should see parsing results
4. Check Supabase Table Editor for saved data

**Test Numerology:**
```bash
curl https://your-backend.onrender.com/api/numerology/calculate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Nguyen Van A","date_of_birth":"1990-01-01"}'
```

**Expected:** JSON with numerology calculations

---

## 📈 STEP 5: Monitor (Ongoing)

### **Use Claude's Monitoring Dashboard:**
```bash
python monitor_staging.py
```

**Monitors:**
- ✅ Health check status
- ✅ API response times
- ✅ Error rates
- ✅ Performance metrics

### **Render Dashboard:**
1. Go to: https://dashboard.render.com
2. Check both services show **"Live"** status
3. Review logs for any errors
4. Monitor resource usage

---

## 🎉 SUCCESS CRITERIA

Deployment is successful when:

- [x] All 6 Supabase tables exist
- [x] Integration tests pass (6/6)
- [x] Backend health check returns healthy
- [x] Frontend UI loads without errors
- [x] No CORS errors
- [x] Can upload CV and see results
- [x] Data saves to Supabase correctly
- [x] Both services show "Live" in Render

---

## ⏱️ TOTAL TIME ESTIMATE

```
✅ Verify tables:        1 minute
🧪 Integration tests:    10-15 minutes
🚀 Deploy to Render:     15-20 minutes
📊 Final verification:   5 minutes

TOTAL: 31-41 minutes (about 30-40 minutes)
```

---

## 💡 QUICK LINKS

**Supabase:**
- Dashboard: https://app.supabase.com/project/cgvxogztpbzvhncwzodr
- Table Editor: https://app.supabase.com/project/cgvxogztpbzvhncwzodr/editor

**Render:**
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs/blueprint-spec

**Your Deployment (after deploy):**
- Backend: https://cv-filtering-backend.onrender.com
- Frontend: https://cv-filtering-frontend.onrender.com
- Health: https://cv-filtering-backend.onrender.com/health

---

## 📚 DOCUMENTATION

**Detailed Guides:**
- `RENDER_DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `docs/RENDER_DEPLOYMENT_GUIDE.md` - Complete guide with troubleshooting
- `SUPABASE_TABLE_SETUP.md` - Database setup details
- `EXECUTIVE_SUMMARY.md` - Overall project summary

---

## 🐛 TROUBLESHOOTING

**Tables not found?**
- Verify SQL executed in Supabase SQL Editor
- Check for SQL execution errors
- Re-run `docs/supabase-schema.sql`

**Integration tests fail?**
- Check `.env` file has correct credentials
- Verify Supabase connection
- Check tables exist in Supabase dashboard

**Render deployment fails?**
- Check build logs in Render dashboard
- Verify environment variables added correctly
- Ensure no typos in env var values

**CORS errors?**
- Verify `CORS_ORIGINS` matches exact frontend URL
- Include `https://` prefix
- No trailing slash
- Redeploy backend after changing

---

## 🎯 NEXT AFTER DEPLOYMENT

1. **Monitor for 24-48 hours** with `monitor_staging.py`
2. **Test all features** (CV upload, numerology, DISC)
3. **Optional:** Add custom domain in Render
4. **Optional:** Setup UptimeRobot to keep backend awake
5. **Start OCR research** (due next week)
6. **Begin Priority #3:** Frontend-Backend integration improvements

---

**Status:** Ready to execute after Claude completes  
**Expected:** Smooth deployment with zero errors  
**Cost:** $0/month (completely FREE!)

🚀 **Let's ship it to production!** 🚀
