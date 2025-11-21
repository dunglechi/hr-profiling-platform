# ✅ DEPLOYMENT CHECKLIST - QUICK REFERENCE
**In trang này ra hoặc mở song song khi deploy!**

---

## 📋 BƯỚC 1: ĐĂNG KÝ RENDER (5 phút)

```
□ Vào https://render.com
□ Click "Get Started for Free"
□ Chọn "Sign up with GitHub"
□ Authorize Render
□ Chọn repository: hr-profiling-platform
□ Verify email
□ Đăng nhập Dashboard
```

---

## 📋 BƯỚC 2: DEPLOY BACKEND (10 phút)

```
□ Click "New +" → "Blueprint"
□ Chọn repo: hr-profiling-platform
□ Render đọc render.yaml
□ Verify service name: cv-filtering-backend

□ Add Environment Variables:
   □ SUPABASE_URL = https://cgvxogztpbzvhncwzodr.supabase.co
   □ SUPABASE_KEY = eyJh...iF4
   □ GEMINI_API_KEY = (your key)
   □ CORS_ORIGINS = http://localhost:3000,http://localhost:5173
   □ FLASK_ENV = production
   □ SECRET_KEY = (random string)

□ Chọn Plan: Free
□ Click "Create Web Service"
□ Đợi build (3-5 phút)
□ Copy Backend URL: https://cv-filtering-backend.onrender.com
```

---

## 📋 BƯỚC 3: DEPLOY FRONTEND (7 phút)

```
□ Click "New +" → "Static Site"
□ Chọn repo: hr-profiling-platform
□ Name: cv-filtering-frontend
□ Branch: main
□ Build Command: cd frontend && npm install && npm run build
□ Publish Directory: frontend/dist

□ Add Environment Variable:
   □ VITE_API_URL = (Backend URL từ Bước 2)

□ Click "Create Static Site"
□ Đợi build (2-3 phút)
□ Copy Frontend URL: https://cv-filtering-frontend.onrender.com
```

---

## 📋 BƯỚC 4: UPDATE CORS (3 phút)

```
□ Vào Backend service
□ Click "Environment" tab
□ Tìm CORS_ORIGINS
□ Update: http://localhost:3000,http://localhost:5173,(Frontend URL)
□ Click "Save Changes"
□ Đợi redeploy (30 giây)
```

---

## 📋 BƯỚC 5: TESTING (5 phút)

```
□ Test Backend:
   □ Mở: (Backend URL)/health
   □ Thấy: {"status": "healthy", ...}

□ Test Frontend:
   □ Mở: (Frontend URL)
   □ UI hiển thị OK
   □ Console không có error (F12)

□ Test Integration:
   □ Upload CV
   □ Xem kết quả
   □ Check Console: Status 200
```

---

## ✅ HOÀN TẤT!

**Thời gian total:** ~25 phút  
**Chi phí:** $0/month

**URLs:**
```
Backend:  _________________________________
Frontend: _________________________________
```

**Lưu ý:**
- Render free tier sleep sau 15 phút không dùng
- First request sau sleep: 30-60 giây
- Logs: Dashboard → Service → Logs

---

**Gặp vấn đề?** → Xem HUONG_DAN_DEPLOY_CHI_TIET.md phần Troubleshooting
