# ✅ Render Deployment Checklist
**Quick reference for deploying to Render.com**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [x] **render.yaml** created
- [x] **gunicorn** added to requirements.txt
- [x] **CORS** configured for production
- [x] **/health** endpoint ready
- [ ] **Supabase tables** created (optional, can do after)
- [ ] **Environment variables** documented in .env.example

---

## 🚀 DEPLOYMENT STEPS (15-20 minutes)

### **Phase 1: Render Setup** (5 min)
- [ ] Go to https://render.com
- [ ] Sign up with GitHub
- [ ] Click "New +" → "Blueprint"
- [ ] Select repository: `hr-profiling-platform`
- [ ] Branch: `main`
- [ ] Click "Apply"

**Result:** 2 services created automatically

---

### **Phase 2: Backend Config** (5 min)

Go to **cv-filtering-backend** → **Environment** → Add:

- [ ] `SUPABASE_URL` = `https://cgvxogztpbzvhncwzodr.supabase.co`
- [ ] `SUPABASE_KEY` = (your anon key from .env)
- [ ] `GEMINI_API_KEY` = (your key from .env)

Then:
- [ ] Click "Save Changes"
- [ ] Click "Manual Deploy" → "Deploy latest commit"
- [ ] Wait 3-5 minutes for build
- [ ] Verify: https://cv-filtering-backend.onrender.com/health

**Expected:** JSON with `"status": "healthy"`

---

### **Phase 3: Frontend Config** (5 min)

Go to **cv-filtering-frontend** → **Environment** → Add:

- [ ] `VITE_API_URL` = `https://cv-filtering-backend.onrender.com/api`
- [ ] `NODE_VERSION` = `18`

Then:
- [ ] Click "Save Changes"
- [ ] Click "Manual Deploy" → "Deploy latest commit"  
- [ ] Wait 2-3 minutes for build
- [ ] Verify: https://cv-filtering-frontend.onrender.com

**Expected:** CV Filtering Dashboard UI

---

### **Phase 4: Update CORS** (2 min)

Go back to **cv-filtering-backend** → **Environment**:

- [ ] Update `CORS_ORIGINS` = `https://cv-filtering-frontend.onrender.com`
- [ ] Click "Save Changes" (auto-redeploy)

---

### **Phase 5: Final Tests** (3 min)

- [ ] Backend health check returns JSON
- [ ] Frontend loads without errors
- [ ] No CORS errors in browser console
- [ ] Both services show "Live" status
- [ ] Check logs for any errors

---

## 📝 IMPORTANT INFO TO SAVE

**Backend URL:**
```
https://cv-filtering-backend.onrender.com
```

**Frontend URL:**
```
https://cv-filtering-frontend.onrender.com
```

**Health Check:**
```
https://cv-filtering-backend.onrender.com/health
```

**Dashboard:**
```
https://dashboard.render.com
```

---

## ⚠️ COMMON ISSUES & FIXES

**Build Failed?**
- Check logs in Render Dashboard
- Verify requirements.txt syntax
- Ensure Python 3.9+ / Node 18+

**CORS Errors?**
- Verify CORS_ORIGINS matches exact frontend URL
- Include https:// prefix
- No trailing slash
- Redeploy backend after change

**Environment Variables Not Working?**
- Check spelling in Dashboard
- No quotes around values
- Redeploy after adding

**Cold Start (30s delay)?**
- Normal for free tier
- Use UptimeRobot to ping every 10 min (keeps warm)

---

## 💰 FREE TIER LIMITS

**Backend:**
- 750 hours/month (enough for 24/7!)
- 512 MB RAM
- Sleep after 15 min idle

**Frontend:**
- Unlimited hosting
- 100 GB bandwidth/month
- Always on (no sleep)

**Total Cost:** $0/month 🎉

---

## 📚 Full Documentation

For detailed instructions, see:
- `docs/RENDER_DEPLOYMENT_GUIDE.md` - Complete guide
- `render.yaml` - Blueprint configuration
- `.env.example` - Environment variables template

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. ✅ Test all endpoints
2. 🔄 Create Supabase tables (if not done)
3. 🔄 Run integration tests
4. 🔄 Setup monitoring (UptimeRobot - optional)
5. 🔄 Configure custom domain (optional)

---

## ✅ SUCCESS CRITERIA

Deployment successful when:
- ✅ Backend health check returns JSON
- ✅ Frontend shows UI
- ✅ No errors in browser console
- ✅ Both services "Live" in Dashboard
- ✅ Can test CV upload (if DB tables exist)

---

**Ready? Let's deploy!** 🚀

**Estimated Time:** 15-20 minutes  
**Cost:** $0/month  
**Difficulty:** Easy (just follow checklist!)
