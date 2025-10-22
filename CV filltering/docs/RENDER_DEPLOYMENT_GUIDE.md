# 🚀 Render Deployment Guide
**HR Profiling Platform - Complete Deployment to Render.com**

**Status:** ✅ READY TO DEPLOY  
**Platform:** Render.com (FREE TIER)  
**Expected Time:** 15-20 minutes  
**Date:** October 22, 2025

---

## 🎯 What You'll Deploy

### **Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    RENDER.COM (FREE)                        │
│                                                             │
│  ┌──────────────────────┐      ┌────────────────────────┐  │
│  │  Backend Service     │      │  Frontend Static Site  │  │
│  │  (Flask/Python)      │◄─────┤  (React/Vite)          │  │
│  │                      │      │                        │  │
│  │  Free Web Service    │      │  Free Static Hosting   │  │
│  │  750 hours/month     │      │  Unlimited             │  │
│  │  Singapore region    │      │  Global CDN            │  │
│  └──────────┬───────────┘      └────────────────────────┘  │
└─────────────┼──────────────────────────────────────────────┘
              │
              ↓
     ┌────────────────────────┐
     │  SUPABASE DATABASE     │
     │  (Your existing setup) │
     │  cgvxogztpbzvhncwzodr  │
     └────────────────────────┘
```

### **Cost Breakdown:**
```
✅ Backend:       $0/month (750 hours FREE)
✅ Frontend:      $0/month (Unlimited FREE)
✅ Database:      $0/month (Supabase free tier)
✅ SSL/HTTPS:     $0/month (Auto-included)
✅ Custom Domain: $0/month (Optional)

💰 TOTAL:         $0/month
```

---

## 📋 Prerequisites (COMPLETED ✅)

- [x] GitHub repository: `hr-profiling-platform`
- [x] Supabase database configured
- [x] Environment variables documented
- [x] `render.yaml` configuration created
- [x] Gunicorn added to requirements.txt
- [x] CORS configured for production
- [x] Health check endpoint ready

---

## 🚀 DEPLOYMENT STEPS

### **PHASE 1: Render Account Setup** (5 minutes)

#### **Step 1.1: Create Render Account**
1. Go to: https://render.com/
2. Click **"Get Started"** or **"Sign Up"**
3. Choose: **"Sign up with GitHub"** (recommended)
4. Authorize Render to access your GitHub

**✅ No credit card required for free tier!**

#### **Step 1.2: Connect Repository**
1. In Render Dashboard, click **"New +"**
2. Select **"Blueprint"**
3. Connect your GitHub account
4. Select repository: **`hr-profiling-platform`**
5. Branch: **`main`**
6. Click **"Apply"**

**What happens:**
- Render reads your `render.yaml` file
- Creates 2 services automatically:
  - `cv-filtering-backend` (Web Service)
  - `cv-filtering-frontend` (Static Site)

---

### **PHASE 2: Backend Configuration** (5 minutes)

#### **Step 2.1: Configure Environment Variables**

In Render Dashboard → **cv-filtering-backend** → **Environment**:

**Add these variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `FLASK_ENV` | `production` | Auto-set by render.yaml |
| `DEBUG` | `false` | Auto-set by render.yaml |
| `SECRET_KEY` | (auto-generated) | Auto-set by render.yaml |
| `SUPABASE_URL` | `https://cgvxogztpbzvhncwzodr.supabase.co` | **ADD THIS** |
| `SUPABASE_KEY` | `your_supabase_anon_key` | **ADD THIS** (from .env) |
| `GEMINI_API_KEY` | `your_gemini_api_key` | **ADD THIS** (from .env) |
| `CORS_ORIGINS` | (update after frontend) | Auto-set, update later |
| `DISC_CSV_MAX_ROWS` | `1000` | Auto-set by render.yaml |
| `TESSERACT_CONFIG` | `--oem 3 --psm 6` | Auto-set by render.yaml |

**How to add:**
1. Click **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Enter Key and Value
4. Click **"Save Changes"**

**📝 Get values from your `.env` file:**
```bash
# Open your .env file
code .env

# Copy these values:
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSy...
```

#### **Step 2.2: Deploy Backend**

1. After adding environment variables
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Watch build logs (takes ~3-5 minutes)

**Expected output:**
```
==> Building...
✓ Installing dependencies from requirements.txt
✓ Starting service with gunicorn
✓ Health check passed: /health

==> Deploying...
✓ Your service is live at https://cv-filtering-backend.onrender.com
```

**🎉 Success indicators:**
- ✅ Build Status: **Live**
- ✅ Health Check: **Passing**
- ✅ Last Deploy: **Success**

#### **Step 2.3: Test Backend**

Open in browser:
```
https://cv-filtering-backend.onrender.com/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T...",
  "services": {
    "numerology": "operational",
    "disc_pipeline": "operational",
    "database": "connected"
  }
}
```

---

### **PHASE 3: Frontend Configuration** (5 minutes)

#### **Step 3.1: Update Frontend Environment**

In Render Dashboard → **cv-filtering-frontend** → **Environment**:

**Add this variable:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://cv-filtering-backend.onrender.com/api` |
| `NODE_VERSION` | `18` |

**Important:** Use your actual backend URL from Step 2.2!

#### **Step 3.2: Update CORS in Backend**

Go back to **cv-filtering-backend** → **Environment**:

**Update `CORS_ORIGINS`:**
```
https://cv-filtering-frontend.onrender.com
```

(Use your actual frontend URL once deployed)

Click **"Save Changes"** → Backend will auto-redeploy

#### **Step 3.3: Deploy Frontend**

1. Go to **cv-filtering-frontend** service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Watch build logs (takes ~2-3 minutes)

**Expected output:**
```
==> Building...
✓ npm install
✓ npm run build
✓ Optimizing assets...

==> Deploying...
✓ Your site is live at https://cv-filtering-frontend.onrender.com
```

#### **Step 3.4: Test Frontend**

Open in browser:
```
https://cv-filtering-frontend.onrender.com
```

**✅ You should see:** CV Filtering Dashboard UI

---

### **PHASE 4: Verification** (3 minutes)

#### **Step 4.1: Check All Services**

**Backend:**
- [ ] Health check: https://your-backend.onrender.com/health
- [ ] Status: Live (green dot)
- [ ] Build time: ~3-5 minutes
- [ ] Free tier: 750 hours remaining

**Frontend:**
- [ ] Homepage loads: https://your-frontend.onrender.com
- [ ] Assets loading (no 404s)
- [ ] Can see UI components
- [ ] Free tier: Unlimited

**Database:**
- [ ] Supabase dashboard accessible
- [ ] Tables exist (if created)
- [ ] Connection from backend works

#### **Step 4.2: Test Integration**

**Test CV Upload:**
1. Go to your frontend URL
2. Try uploading a test CV
3. Check if backend processes it
4. Verify data in Supabase (if tables created)

**Test API Endpoints:**
```bash
# Numerology endpoint
curl https://your-backend.onrender.com/api/numerology/calculate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Nguyen Van A","date_of_birth":"1990-01-01"}'

# Expected: JSON response with numerology calculations
```

---

## 🔧 Post-Deployment Configuration

### **1. Enable Auto-Deploy**

Both services have auto-deploy enabled by default:
- ✅ Push to `main` branch → Auto-redeploy
- ✅ Pull request → Preview deployment (paid)

**To verify:**
1. Go to service → **Settings**
2. Check **"Auto-Deploy"**: ✅ Yes

### **2. Configure Custom Domain** (Optional)

**Free Custom Domain:**
1. Go to service → **Settings** → **Custom Domain**
2. Add your domain (e.g., `cv-screening.yourdomain.com`)
3. Update DNS records as shown
4. Render provides FREE SSL certificate

**Cost:** $0 (domain registration costs separately)

### **3. Setup Notifications**

**Email Alerts:**
1. Go to service → **Settings** → **Notifications**
2. Enable: "Notify on deploy failures"
3. Add your email

**Discord/Slack:** (Optional)
- Add webhook URL for deploy notifications

---

## 📊 Monitoring & Maintenance

### **1. View Logs**

**Backend Logs:**
1. Go to **cv-filtering-backend**
2. Click **"Logs"** tab
3. See real-time application logs

**Frontend Logs:**
1. Static sites have minimal logs
2. Check browser console for client errors

### **2. Resource Usage**

**Free Tier Limits:**
```
Backend:
✅ 750 hours/month (enough for 24/7)
✅ 512 MB RAM
✅ Shared CPU
✅ Sleep after 15 min idle → 30s wake

Frontend:
✅ Unlimited bandwidth (100 GB/month)
✅ Global CDN
✅ Always on (no sleep)
```

**Monitor Usage:**
1. Dashboard → Service → **Metrics**
2. See: CPU, Memory, Request count

### **3. Performance Optimization**

**Keep Backend Awake:**
- External ping service (e.g., UptimeRobot)
- Ping `/health` every 10 minutes
- FREE tier available

**Example cron job:**
```bash
*/10 * * * * curl https://your-backend.onrender.com/health
```

---

## 🐛 Troubleshooting

### **Issue 1: Backend Build Failed**

**Symptoms:**
- Build logs show errors
- Service not deploying

**Solutions:**
1. Check `requirements.txt` syntax
2. Verify Python version (3.9+ required)
3. Check build command in render.yaml
4. Look for missing dependencies

**Debug:**
```bash
# Test locally first
pip install -r backend/requirements.txt
python backend/src/app.py
```

### **Issue 2: Frontend Build Failed**

**Symptoms:**
- npm errors in build logs
- Assets not found

**Solutions:**
1. Check `package.json` syntax
2. Verify Node version (18+ required)
3. Check build command
4. Clear cache and rebuild

**Debug:**
```bash
# Test locally
cd frontend
npm install
npm run build
```

### **Issue 3: Environment Variables Not Working**

**Symptoms:**
- Backend can't connect to Supabase
- Missing API keys errors

**Solutions:**
1. Verify all env vars added in Dashboard
2. Check for typos in keys
3. Ensure no quotes around values
4. Redeploy after adding vars

**Verify:**
```bash
# Check which env vars are set
curl https://your-backend.onrender.com/health
# Should show service statuses
```

### **Issue 4: CORS Errors**

**Symptoms:**
- Frontend can't call backend APIs
- Browser console shows CORS errors

**Solutions:**
1. Verify `CORS_ORIGINS` includes frontend URL
2. Check both http/https
3. Ensure no trailing slashes
4. Redeploy backend after changing

**Fix:**
```bash
# Correct format
CORS_ORIGINS=https://your-frontend.onrender.com

# NOT:
CORS_ORIGINS=https://your-frontend.onrender.com/
```

### **Issue 5: Cold Start Delays**

**Symptoms:**
- First request takes 30+ seconds
- Backend "spinning up" message

**Solutions:**
1. This is normal for free tier
2. Use external ping to keep alive
3. Or upgrade to paid tier ($7/month, no sleep)

**Workaround:**
- Setup UptimeRobot to ping every 10 min
- FREE tier available: https://uptimerobot.com

---

## 📝 Important URLs

### **Your Deployed Services:**

**Backend:**
```
Live URL:    https://cv-filtering-backend.onrender.com
Health:      https://cv-filtering-backend.onrender.com/health
API Docs:    https://cv-filtering-backend.onrender.com/api
Dashboard:   https://dashboard.render.com/web/YOUR_SERVICE_ID
```

**Frontend:**
```
Live URL:    https://cv-filtering-frontend.onrender.com
Dashboard:   https://dashboard.render.com/static/YOUR_SERVICE_ID
```

**Database:**
```
Supabase:    https://app.supabase.com/project/cgvxogztpbzvhncwzodr
SQL Editor:  https://app.supabase.com/project/cgvxogztpbzvhncwzodr/editor
Tables:      https://app.supabase.com/project/cgvxogztpbzvhncwzodr/editor
```

### **Render Resources:**

- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs
- Blueprint Spec: https://render.com/docs/blueprint-spec
- Free Tier: https://render.com/docs/free
- Status: https://status.render.com

---

## 🎯 Next Steps After Deployment

### **Immediate (Today):**
1. ✅ Test all endpoints
2. ✅ Verify health checks
3. ✅ Check logs for errors
4. ✅ Test CV upload flow

### **Short-term (This Week):**
1. 🔄 Create Supabase tables (if not done)
2. 🔄 Run integration tests
3. 🔄 Setup monitoring (UptimeRobot)
4. 🔄 Configure custom domain (optional)

### **Medium-term (Next Week):**
1. 📋 Monitor performance metrics
2. 📋 Optimize cold start times
3. 📋 Add more tests
4. 📋 OCR research

---

## 💡 Pro Tips

1. **Use Blueprint for Updates:**
   - Edit `render.yaml` in repo
   - Commit and push
   - Services auto-update

2. **Environment Variables:**
   - Never commit secrets to repo
   - Always use Render Dashboard for sensitive data
   - Use `.env.example` for documentation

3. **Logs are Your Friend:**
   - Check logs first when debugging
   - Real-time logs in Dashboard
   - Download logs for analysis

4. **Free Tier is Generous:**
   - 750 hours = ~31 days for 1 service
   - More than enough for this project
   - Frontend is truly unlimited

5. **Health Checks Matter:**
   - Keep `/health` endpoint fast (<1s)
   - Don't do heavy operations
   - Render uses it to monitor service

---

## 🎊 Success Criteria

Your deployment is successful when:

- [x] Backend URL returns health check JSON
- [x] Frontend URL shows CV Filtering UI
- [x] No CORS errors in browser console
- [x] Can upload test CV (if tables ready)
- [x] Logs show no critical errors
- [x] Both services show "Live" status
- [x] Free tier hours not exhausted

---

## 📞 Support

**Issues with Deployment?**

1. **Check Render Status:** https://status.render.com
2. **Read Logs:** Dashboard → Service → Logs
3. **Render Docs:** https://render.com/docs
4. **Community:** Render Community Forum

**Issues with Code?**

1. Check `EXECUTIVE_SUMMARY.md` for project overview
2. Review `TECHNICAL_REPORT_CODE_FIXES.md` for recent fixes
3. Run `python verify_fixes.py` locally
4. Check GitHub Issues in your repo

---

## 🎉 Congratulations!

You've successfully deployed a **production-ready, enterprise-grade** CV filtering platform to Render.com - **completely FREE!**

**What you achieved:**
- ✅ Full-stack deployment (Backend + Frontend)
- ✅ Zero cost ($0/month)
- ✅ Auto-deploy from GitHub
- ✅ HTTPS with free SSL
- ✅ Global CDN for frontend
- ✅ Production-ready monitoring

**Now go show it to your team!** 🚀

---

**Created by:** GitHub Copilot  
**Date:** October 22, 2025  
**Version:** 1.0  
**Status:** ✅ Ready to Deploy
