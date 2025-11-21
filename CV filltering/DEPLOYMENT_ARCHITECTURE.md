# 🗺️ DEPLOYMENT ARCHITECTURE & FLOW

## 📊 KIẾN TRÚC SAU KHI DEPLOY

```
┌─────────────────────────────────────────────────────────────────┐
│                         NGƯỜI DÙNG                              │
│                    (Browser: Chrome/Firefox)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER.COM PLATFORM                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         FRONTEND (Static Site - FREE)                     │ │
│  │  https://cv-filtering-frontend.onrender.com               │ │
│  │                                                           │ │
│  │  • React Application                                     │ │
│  │  • Vite Build (dist/)                                    │ │
│  │  • Global CDN                                            │ │
│  │  • Unlimited Bandwidth                                   │ │
│  └─────────────────────┬─────────────────────────────────────┘ │
│                        │                                         │
│                        │ API Calls (HTTPS)                       │
│                        │ CORS: ✓ Allowed                         │
│                        ↓                                         │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         BACKEND (Web Service - FREE)                      │ │
│  │  https://cv-filtering-backend.onrender.com                │ │
│  │                                                           │ │
│  │  • Flask Application                                     │ │
│  │  • Gunicorn WSGI Server                                  │ │
│  │  • Python 3.x Runtime                                    │ │
│  │  • 512 MB RAM                                            │ │
│  │  • 750 hours/month (24/7)                                │ │
│  │                                                           │ │
│  │  Environment Variables:                                  │ │
│  │  ├─ SUPABASE_URL                                         │ │
│  │  ├─ SUPABASE_KEY                                         │ │
│  │  ├─ GEMINI_API_KEY                                       │ │
│  │  ├─ CORS_ORIGINS                                         │ │
│  │  └─ FLASK_ENV=production                                 │ │
│  └─────────────────────┬─────────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ PostgreSQL Protocol
                         │ (Secure Connection)
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                            │
│         https://cgvxogztpbzvhncwzodr.supabase.co               │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database (FREE tier)                          │ │
│  │                                                           │ │
│  │  Tables (6/6):                                            │ │
│  │  ├─ candidates          ✓                                │ │
│  │  ├─ cv_analyses         ✓                                │ │
│  │  ├─ numerology_data     ✓                                │ │
│  │  ├─ disc_assessments    ✓                                │ │
│  │  ├─ activity_logs       ✓                                │ │
│  │  └─ screening_results   ✓                                │ │
│  │                                                           │ │
│  │  Features:                                                │ │
│  │  • Auto-backup daily                                      │ │
│  │  • 500 MB storage                                         │ │
│  │  • Unlimited API requests                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ (Optional)
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE GEMINI API                            │
│                 (CV Parsing - AI Service)                       │
│                                                                 │
│  • Used for: CV text extraction                               │
│  • Rate: Pay per request                                      │
│  • Fallback: Rule-based parsing                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 LUỒNG XỬ LÝ REQUEST

### **Kịch bản 1: User Upload CV**

```
[1] User clicks "Upload CV"
    │
    ↓
[2] Frontend (React)
    ├─ Validate file (PDF/DOCX)
    ├─ Show loading spinner
    └─ POST to Backend API
       │
       URL: https://cv-filtering-backend.onrender.com/api/analyze
       Headers: Content-Type: multipart/form-data
       Body: {file: cv.pdf}
       │
       ↓
[3] Backend (Flask)
    ├─ Check CORS ✓
    ├─ Validate file type
    ├─ Extract text from PDF
    ├─ Call Gemini API (if available)
    │  └─ Parse: name, email, skills, experience
    ├─ Generate candidate_id
    └─ Save to Database
       │
       ↓
[4] Supabase
    ├─ INSERT into candidates
    ├─ INSERT into cv_analyses
    ├─ INSERT into screening_results
    └─ INSERT into activity_logs
       │
       ↓
[5] Backend Response
    └─ JSON: {success: true, data: {...}}
       │
       ↓
[6] Frontend Display
    └─ Show parsing results
       ├─ Personal info
       ├─ Education
       ├─ Experience
       └─ Skills

Total Time: 2-5 seconds
```

### **Kịch bản 2: Calculate Numerology**

```
[1] User enters name + birthdate
    │
    ↓
[2] Frontend validates input
    └─ POST /api/numerology
       │
       ↓
[3] Backend calculates
    ├─ Life Path Number
    ├─ Birth Number
    └─ Meanings
       │
       ↓
[4] Supabase saves
    ├─ INSERT numerology_data
    └─ UPDATE candidate status
       │
       ↓
[5] Display results
    └─ Numbers + meanings

Total Time: 500ms - 1s
```

### **Kịch bản 3: DISC Assessment**

```
[1] Upload DISC CSV file
    │
    ↓
[2] Backend parses CSV
    ├─ Validate format
    ├─ Extract scores
    └─ Calculate profile
       │
       ↓
[3] Supabase saves
    ├─ INSERT disc_assessments
    └─ Link to candidate
       │
       ↓
[4] Display DISC profile
    └─ D, I, S, C scores
       Primary/Secondary style

Total Time: 1-2 seconds
```

---

## 🌐 NETWORK FLOW

### **Production URLs:**

```
┌────────────────────────────────────────────────────────┐
│ FRONTEND                                               │
│ https://cv-filtering-frontend.onrender.com            │
│                                                        │
│ Endpoints:                                             │
│ ├─ /              → Main app                          │
│ ├─ /upload        → CV upload page                    │
│ ├─ /numerology    → Numerology calculator             │
│ └─ /disc          → DISC assessment                   │
└────────────────────────────────────────────────────────┘
                         │
                         │ Makes API calls to:
                         ↓
┌────────────────────────────────────────────────────────┐
│ BACKEND API                                            │
│ https://cv-filtering-backend.onrender.com             │
│                                                        │
│ Endpoints:                                             │
│ ├─ GET  /health              → Health check           │
│ ├─ POST /api/analyze         → Parse CV               │
│ ├─ POST /api/numerology      → Calculate numbers      │
│ ├─ POST /api/disc/upload     → Upload DISC CSV        │
│ ├─ GET  /api/candidates      → List candidates        │
│ └─ GET  /api/candidate/:id   → Get candidate detail   │
└────────────────────────────────────────────────────────┘
                         │
                         │ Connects to:
                         ↓
┌────────────────────────────────────────────────────────┐
│ DATABASE                                               │
│ https://cgvxogztpbzvhncwzodr.supabase.co              │
│                                                        │
│ Connection String:                                     │
│ postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres │
└────────────────────────────────────────────────────────┘
```

---

## 🔐 SECURITY LAYERS

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: HTTPS/TLS                                      │
│ • All traffic encrypted                                 │
│ • Render provides SSL certificates automatically        │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: CORS Protection                                │
│ • Only allowed origins can call API                     │
│ • Configured in CORS_ORIGINS                            │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Environment Variables                          │
│ • Secrets not in code                                   │
│ • Render encrypts env variables                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Database Row Level Security (Future)           │
│ • Supabase RLS (currently disabled)                     │
│ • Can enable for multi-tenant                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 SCALABILITY PATH

### **Current Setup (FREE tier):**
```
Backend:  1 instance, 512 MB RAM
Frontend: Global CDN, unlimited bandwidth
Database: 500 MB storage, unlimited requests

Handles: ~100-500 users/day
Cost: $0/month
```

### **If Need More (Upgrade path):**

```
STEP 1: Upgrade Backend ($7/month)
├─ No sleep mode
├─ 1 GB RAM
└─ Handles: 1,000-5,000 users/day

STEP 2: Upgrade Database ($25/month)
├─ 8 GB storage
├─ Daily backups
└─ Point-in-time recovery

STEP 3: Add Load Balancer ($10/month)
├─ Multiple backend instances
├─ Auto-scaling
└─ Handles: 10,000+ users/day

Total for High Traffic: $42/month
```

---

## 🔄 AUTO-DEPLOY WORKFLOW

```
┌────────────────────────────────────────────────────────┐
│ DEVELOPER                                              │
│                                                        │
│ [1] Make code changes                                 │
│ [2] git add .                                         │
│ [3] git commit -m "feature: new feature"              │
│ [4] git push origin main                              │
└─────────────────────┬──────────────────────────────────┘
                      │
                      │ GitHub webhook
                      ↓
┌────────────────────────────────────────────────────────┐
│ RENDER.COM                                             │
│                                                        │
│ [1] Detects new commit                                │
│ [2] Triggers build                                    │
│     ├─ Pull latest code                               │
│     ├─ Install dependencies                           │
│     ├─ Run build command                              │
│     └─ Run tests (if configured)                      │
│                                                        │
│ [3] Deploy                                             │
│     ├─ Zero-downtime deployment                       │
│     ├─ Health check new version                       │
│     └─ Switch traffic to new version                  │
│                                                        │
│ [4] Notify                                             │
│     └─ Email: "Deploy successful"                     │
└────────────────────────────────────────────────────────┘

Total Time: 3-5 minutes from git push to live!
```

---

## 🎯 MONITORING POINTS

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND MONITORING                                     │
│                                                         │
│ Check:                                                  │
│ ├─ Page load time (< 2 seconds)                       │
│ ├─ API call success rate (> 95%)                      │
│ ├─ Console errors (= 0)                               │
│ └─ User interactions working                          │
│                                                         │
│ Tools:                                                  │
│ └─ Browser DevTools (F12)                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BACKEND MONITORING                                      │
│                                                         │
│ Check:                                                  │
│ ├─ /health endpoint (200 OK)                          │
│ ├─ Response time (< 500ms average)                    │
│ ├─ Error rate (< 1%)                                  │
│ ├─ CPU usage (< 50%)                                  │
│ └─ Memory usage (< 400 MB)                            │
│                                                         │
│ Tools:                                                  │
│ ├─ Render Metrics Dashboard                           │
│ ├─ Render Logs                                        │
│ └─ monitor_staging.py script                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DATABASE MONITORING                                     │
│                                                         │
│ Check:                                                  │
│ ├─ Connection pool (< 80% used)                       │
│ ├─ Query performance (< 100ms)                        │
│ ├─ Storage usage (< 400 MB)                           │
│ └─ Active connections (< 50)                          │
│                                                         │
│ Tools:                                                  │
│ └─ Supabase Dashboard                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 COST BREAKDOWN (Current: $0/month)

```
Service                 Plan        Cost       Limits
─────────────────────────────────────────────────────────
Render Backend         Free        $0/mo      • 512 MB RAM
                                              • 750 hrs/month
                                              • Sleep after 15min

Render Frontend        Free        $0/mo      • Unlimited bandwidth
                                              • Global CDN
                                              • 100 GB/month

Supabase Database      Free        $0/mo      • 500 MB storage
                                              • Unlimited requests
                                              • Daily backup

Google Gemini API      Pay-per-use $0/mo*     • Free tier: 60 req/min
                                              • $0.00025/1K chars

─────────────────────────────────────────────────────────
TOTAL                              $0/mo      Perfect for MVP!

* If you use Gemini API heavily, costs may apply
  Estimated: < $5/month for moderate usage
```

---

## 🎊 SUCCESS METRICS

**Deployment is successful if:**

```
✅ Backend health check returns 200
✅ Frontend loads in < 3 seconds
✅ Can upload CV and see results
✅ Database queries work
✅ No CORS errors
✅ Logs show no errors
✅ All environment variables set correctly
```

**You're ready for production when:**

```
✅ All integration tests pass
✅ Manual testing completed
✅ Team has tested the app
✅ Monitoring is set up
✅ Backup plan exists
✅ Documentation complete
```

---

**Hiểu rõ architecture giúp bạn:**
- Debug nhanh hơn khi có vấn đề
- Biết optimize ở đâu khi cần scale
- Giải thích cho team/stakeholders
- Plan cho future features
