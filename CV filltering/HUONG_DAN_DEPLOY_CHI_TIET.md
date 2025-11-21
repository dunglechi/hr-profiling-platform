# 🚀 HƯỚNG DẪN DEPLOY LÊN RENDER.COM - STEP BY STEP
**Ngày:** 22 Tháng 10, 2025  
**Thời gian ước tính:** 20-25 phút  
**Chi phí:** $0/tháng (FREE tier)

---

## 📋 CHUẨN BỊ TRƯỚC KHI DEPLOY

### ✅ **Checklist - Đã sẵn sàng:**
- [x] Database: 6/6 tables created in Supabase
- [x] Integration tests: 5/5 passed
- [x] Code pushed to GitHub (commit a35e241)
- [x] render.yaml config file ready
- [x] Environment variables documented

### 📝 **Thông tin cần có:**
```
1. GitHub Account (để đăng ký Render)
2. Supabase credentials:
   - URL: https://cgvxogztpbzvhncwzodr.supabase.co
   - KEY: eyJh...iF4 (từ file .env)
3. Gemini API Key (nếu có)
4. Repository: hr-profiling-platform (dunglechi)
```

---

## 🎯 BƯỚC 1: ĐĂNG KÝ TẠI KHOẢN RENDER (3-5 phút)

### **1.1. Mở trang Render**
```
URL: https://render.com
```

### **1.2. Click "Get Started for Free"**
- Ở góc trên bên phải
- Hoặc nút lớn ở giữa trang

### **1.3. Chọn đăng ký với GitHub**
- Click nút **"Sign up with GitHub"**
- **Tại sao dùng GitHub?** Để Render tự động kết nối với repository

### **1.4. Cho phép Render truy cập GitHub**
- GitHub sẽ hỏi: "Authorize Render?"
- Click **"Authorize render"**
- **Giải thích:** Render cần quyền để:
  - Đọc code từ repository
  - Tự động deploy khi có git push
  - Hiển thị danh sách repos

### **1.5. Chọn repositories**
- Render hỏi: "Which repositories can Render access?"
- Chọn **"Only select repositories"**
- Tìm và chọn: **"hr-profiling-platform"**
- Click **"Install & Authorize"**

### **1.6. Hoàn tất đăng ký**
- Điền email (nếu chưa có)
- Verify email (check inbox)
- Đăng nhập vào Render Dashboard

**✅ Kết quả:** Bạn đã có tài khoản Render và kết nối với GitHub!

---

## 🎯 BƯỚC 2: DEPLOY BACKEND SERVICE (7-10 phút)

### **2.1. Tạo Backend Service**

#### **A. Từ Render Dashboard:**
- Click nút **"New +"** (góc trên bên phải)
- Chọn **"Blueprint"**

**Giải thích Blueprint:**
- Blueprint = Infrastructure as Code
- File `render.yaml` mô tả cấu trúc dự án
- Render tự động tạo tất cả services từ file này

#### **B. Chọn Repository:**
- Render sẽ liệt kê các repos
- Tìm: **"hr-profiling-platform"**
- Click **"Connect"**

#### **C. Render đọc render.yaml:**
```
Render sẽ phát hiện file render.yaml và hiển thị:

Services to be created:
✓ cv-filtering-backend (Web Service)
✓ cv-filtering-frontend (Static Site)
```

### **2.2. Cấu hình Backend Service**

#### **A. Service Details đã tự động:**
```
Name: cv-filtering-backend
Region: Singapore (hoặc chọn gần bạn nhất)
Branch: main
Runtime: Python 3
Build Command: pip install -r backend/requirements.txt
Start Command: gunicorn --chdir backend/src --bind 0.0.0.0:$PORT app:app
```

**Giải thích từng dòng:**
- **Name:** Tên service, sẽ tạo URL: `cv-filtering-backend.onrender.com`
- **Region:** Vị trí server (Singapore gần VN = nhanh hơn)
- **Branch:** Nhánh git để deploy (main)
- **Build Command:** Lệnh cài dependencies
- **Start Command:** Lệnh chạy server Flask với Gunicorn

#### **B. Thêm Environment Variables (QUAN TRỌNG!):**

Click **"Environment"** tab, thêm:

```
Key: SUPABASE_URL
Value: https://cgvxogztpbzvhncwzodr.supabase.co

Key: SUPABASE_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndnhvZ3p0cGJ6dmhuY3d6b2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTEzNzYsImV4cCI6MjA3NjY4NzM3Nn0.GI-6843fw1ymXRE7z9ZeGFq3nOpe5fwXR3FFT5dXiF4

Key: GEMINI_API_KEY
Value: YOUR_GEMINI_API_KEY_HERE (nếu có)

Key: CORS_ORIGINS
Value: http://localhost:3000,http://localhost:5173

Key: FLASK_ENV
Value: production

Key: SECRET_KEY
Value: production-secret-key-change-this-to-random-string
```

**Giải thích:**
- **SUPABASE_URL/KEY:** Để kết nối database
- **GEMINI_API_KEY:** Để parse CV bằng AI (optional)
- **CORS_ORIGINS:** Cho phép frontend gọi API (sẽ update sau)
- **FLASK_ENV:** Môi trường production
- **SECRET_KEY:** Bảo mật session (nên đổi thành chuỗi ngẫu nhiên)

#### **C. Chọn Plan:**
- Free tier: **$0/month**
- 512 MB RAM
- 750 hours/month (đủ chạy 24/7)

### **2.3. Deploy Backend**

#### **A. Click "Create Web Service"**
- Render bắt đầu build

#### **B. Theo dõi Build Process:**
```
Build logs sẽ hiển thị:

==> Cloning from GitHub...
==> Installing dependencies...
    Collecting Flask
    Collecting supabase
    Collecting google-generativeai
    ...
    Successfully installed 12 packages

==> Build successful!

==> Starting service...
    [INFO] Starting gunicorn 21.2.0
    [INFO] Listening at: http://0.0.0.0:10000
    [INFO] Using worker: sync
    [INFO] Booting worker with pid: 123

==> Your service is live!
```

**Thời gian:** 3-5 phút

#### **C. Lưu Backend URL:**
```
URL: https://cv-filtering-backend.onrender.com

Copy URL này, cần dùng cho:
1. Frontend configuration
2. CORS settings
3. Testing
```

**✅ Kết quả:** Backend đã LIVE!

---

## 🎯 BƯỚC 3: DEPLOY FRONTEND SERVICE (5-7 phút)

### **3.1. Tạo Frontend Service**

#### **A. Quay lại Dashboard:**
- Click "Dashboard" ở sidebar

#### **B. Tạo Static Site:**
- Click **"New +"**
- Chọn **"Static Site"**

**Giải thích Static Site:**
- Dành cho React/Vue/Angular apps
- Chỉ serve HTML/CSS/JS files
- Không chạy server-side code
- Free unlimited bandwidth!

#### **C. Chọn Repository:**
- Repository: **"hr-profiling-platform"**
- Click **"Connect"**

### **3.2. Cấu hình Frontend**

#### **A. Build Settings:**
```
Name: cv-filtering-frontend
Branch: main
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
```

**Giải thích:**
- **Build Command:** 
  - `cd frontend`: Vào thư mục frontend
  - `npm install`: Cài dependencies
  - `npm run build`: Build production (Vite)
- **Publish Directory:** Thư mục chứa file build (Vite tạo thư mục `dist`)

#### **B. Environment Variables:**

Click **"Advanced"** → **"Add Environment Variable"**

```
Key: VITE_API_URL
Value: https://cv-filtering-backend.onrender.com

(Dùng Backend URL từ Bước 2.3.C)
```

**Giải thích:**
- **VITE_API_URL:** Frontend sẽ gọi API từ URL này
- Vite yêu cầu prefix `VITE_` cho env variables
- Được inject vào code lúc build time

### **3.3. Deploy Frontend**

#### **A. Click "Create Static Site"**

#### **B. Theo dõi Build:**
```
==> Installing dependencies...
    npm install
    added 234 packages in 45s

==> Building application...
    npm run build
    
    vite v5.0.0 building for production...
    ✓ 124 modules transformed
    ✓ built in 2.34s
    
    dist/index.html                  2.1 kB
    dist/assets/index-abc123.js    145.2 kB
    dist/assets/index-def456.css    12.3 kB

==> Build successful!
==> Deploying...
==> Your site is live!
```

**Thời gian:** 2-3 phút

#### **C. Lưu Frontend URL:**
```
URL: https://cv-filtering-frontend.onrender.com

Copy URL này để:
1. Update CORS settings
2. Share với team
3. Testing
```

**✅ Kết quả:** Frontend đã LIVE!

---

## 🎯 BƯỚC 4: CẬP NHẬT CORS (2-3 phút)

**Tại sao cần bước này?**
- Hiện tại CORS chỉ cho phép `localhost`
- Cần thêm frontend production URL
- Nếu không, browser sẽ block API calls

### **4.1. Quay lại Backend Service**

#### **A. Từ Dashboard:**
- Click vào **"cv-filtering-backend"**

#### **B. Vào Environment tab:**
- Click **"Environment"** ở sidebar

### **4.2. Cập nhật CORS_ORIGINS**

#### **A. Tìm biến CORS_ORIGINS:**
```
Current value:
http://localhost:3000,http://localhost:5173
```

#### **B. Click "Edit" và thêm frontend URL:**
```
New value:
http://localhost:3000,http://localhost:5173,https://cv-filtering-frontend.onrender.com
```

**Giải thích:**
- Giữ localhost để dev
- Thêm production URL
- Ngăn cách bằng dấu phẩy (không có space)

#### **C. Click "Save Changes"**

### **4.3. Backend Auto-Redeploy**

Render sẽ tự động:
```
==> Detected environment variable change
==> Redeploying service...
==> Service updated in 30 seconds
```

**✅ Kết quả:** CORS đã cấu hình cho production!

---

## 🎯 BƯỚC 5: KIỂM TRA DEPLOYMENT (5 phút)

### **5.1. Test Backend**

#### **A. Mở Browser:**
```
URL: https://cv-filtering-backend.onrender.com/health
```

#### **B. Kết quả mong đợi:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-22T10:30:00.000Z",
  "environment": "production"
}
```

**Nếu thấy response này = Backend OK! ✅**

#### **C. Nếu gặp lỗi:**

**Lỗi 1: "Application failed to respond"**
```
Nguyên nhân: Service đang khởi động
Giải pháp: Đợi 1-2 phút, F5 lại
```

**Lỗi 2: "Internal Server Error"**
```
Nguyên nhân: Lỗi code hoặc env variables
Giải pháp: 
1. Vào Render Dashboard
2. Click vào service
3. Xem "Logs" tab
4. Tìm error message màu đỏ
```

**Lỗi 3: "Database connection failed"**
```
Nguyên nhân: SUPABASE_URL hoặc KEY sai
Giải pháp:
1. Check Environment variables
2. Verify credentials từ .env file
3. Re-deploy sau khi sửa
```

### **5.2. Test Frontend**

#### **A. Mở Browser:**
```
URL: https://cv-filtering-frontend.onrender.com
```

#### **B. Kiểm tra:**
```
✅ Trang load được (không blank)
✅ UI hiển thị đúng
✅ Không có lỗi trong Console (F12)
✅ Logo/images hiển thị
```

#### **C. Mở Developer Console (F12):**
```
Console tab:
✅ Không có màu đỏ (errors)
⚠️  Warnings màu vàng có thể bỏ qua

Network tab:
✅ Status 200 cho các requests
✅ API calls đến backend URL đúng
```

### **5.3. Test Full Integration**

#### **A. Test CV Upload:**
1. Click "Upload CV" button
2. Chọn file PDF
3. Click "Analyze"

**Kết quả mong đợi:**
```
✅ Loading spinner hiển thị
✅ API call đến /api/analyze
✅ Response trả về data
✅ UI hiển thị kết quả parsing
```

#### **B. Check trong Console:**
```javascript
// Should see:
POST https://cv-filtering-backend.onrender.com/api/analyze
Status: 200 OK
Response: { success: true, data: {...} }
```

#### **C. Nếu gặp CORS error:**
```
Error: "Access-Control-Allow-Origin"
Nguyên nhân: CORS chưa cập nhật đúng
Giải pháp:
1. Quay lại Bước 4
2. Verify CORS_ORIGINS có frontend URL
3. Đảm bảo không có space trong value
```

**✅ Kết quả:** Nếu upload CV thành công = HOÀN TẤT DEPLOYMENT!

---

## 🎯 BƯỚC 6: XEM LOGS VÀ MONITORING (Optional)

### **6.1. Xem Logs Real-time**

#### **A. Backend Logs:**
```
1. Vào Render Dashboard
2. Click "cv-filtering-backend"
3. Click "Logs" tab
4. Chọn "Live Logs"
```

**Logs sẽ hiển thị:**
```
[INFO] 127.0.0.1 - - GET /health HTTP/1.1 200
[INFO] 127.0.0.1 - - POST /api/analyze HTTP/1.1 200
[INFO] Successfully saved cv_parsing analysis for candidate 'ABC-123'
```

#### **B. Filter Logs:**
```
Chỉ xem errors:
- Tìm dòng có [ERROR] hoặc màu đỏ

Tìm kiếm:
- Ctrl+F để search trong logs
- VD: search "ERROR" hoặc "candidate_id"
```

### **6.2. Xem Metrics**

#### **A. Vào Metrics tab:**
```
1. Click service name
2. Click "Metrics"
```

**Metrics hiển thị:**
```
CPU Usage: 5-10% (normal)
Memory: 150 MB / 512 MB (healthy)
Response Time: 200-500ms (good)
Requests/min: Số lượng traffic
```

#### **B. Alerts:**
```
Render tự động alert nếu:
- Service crash
- Memory > 90%
- Response time > 5s
- Build failed
```

### **6.3. Monitor từ Code (Optional)**

Chạy script monitoring:
```bash
python monitor_staging.py
```

**Output:**
```
=== HEALTH MONITORING ===
Backend:   ✅ HEALTHY (245ms)
Frontend:  ✅ HEALTHY
Database:  ✅ CONNECTED

=== API ENDPOINTS ===
/health:        ✅ 200 (150ms)
/api/analyze:   ✅ 200 (450ms)

=== PERFORMANCE ===
Avg Response:  280ms
Error Rate:    0%
Uptime:        99.9%
```

---

## 📊 TÓM TẮT SAU KHI DEPLOY

### **✅ URLs đã tạo:**
```
Backend:  https://cv-filtering-backend.onrender.com
Frontend: https://cv-filtering-frontend.onrender.com
```

### **✅ Services đã deploy:**
```
1. Backend (Flask + Gunicorn)
   - Auto-deploy khi git push
   - 512 MB RAM
   - FREE tier

2. Frontend (React + Vite)
   - Static hosting
   - Global CDN
   - FREE unlimited
```

### **✅ Database:**
```
Supabase: https://cgvxogztpbzvhncwzodr.supabase.co
Status: 6/6 tables operational
Connection: Working
```

### **✅ Environment:**
```
Production ready:
- CORS configured
- Environment variables set
- Database connected
- Logs accessible
```

---

## 🔧 TROUBLESHOOTING COMMON ISSUES

### **Issue 1: Build Failed**

**Triệu chứng:**
```
Build failed with exit code 1
```

**Nguyên nhân:**
- Thiếu dependencies trong requirements.txt
- Syntax error trong code
- Wrong build command

**Giải pháp:**
1. Xem Build Logs chi tiết
2. Tìm dòng màu đỏ
3. Fix code hoặc dependencies
4. Git push để re-deploy

---

### **Issue 2: Service Unavailable**

**Triệu chứng:**
```
Service Unavailable (503)
```

**Nguyên nhân:**
- Service đang restart
- Crash do lỗi code
- Port không đúng

**Giải pháp:**
1. Đợi 1-2 phút
2. Check Logs xem error
3. Verify START COMMAND đúng format
4. Check PORT variable được dùng đúng

---

### **Issue 3: Database Connection Error**

**Triệu chứng:**
```
Failed to connect to database
```

**Nguyên nhân:**
- SUPABASE_URL sai
- SUPABASE_KEY sai
- Network issue

**Giải pháp:**
1. Copy lại credentials từ .env
2. Paste chính xác (không có space)
3. Click Save Changes
4. Đợi auto-redeploy

---

### **Issue 4: CORS Error**

**Triệu chứng:**
```
Access to fetch has been blocked by CORS policy
```

**Nguyên nhân:**
- Frontend URL chưa có trong CORS_ORIGINS
- Format sai (có space)
- Backend chưa restart

**Giải pháp:**
1. Update CORS_ORIGINS đúng format
2. Đảm bảo có frontend URL
3. Save và đợi redeploy
4. Hard refresh browser (Ctrl+Shift+R)

---

## 💡 TIPS & BEST PRACTICES

### **1. Auto-Deploy Setup:**
```
Render tự động deploy khi:
✅ Git push to main branch
✅ PR merged to main

Để tắt auto-deploy:
→ Service Settings → Auto-Deploy → OFF
```

### **2. Environment Variables:**
```
Best practices:
✅ Không commit sensitive data
✅ Dùng .env.example làm template
✅ Document tất cả variables
✅ Dùng secrets cho API keys
```

### **3. Monitoring:**
```
Recommended:
✅ Setup email alerts
✅ Monitor daily trong 1 tuần đầu
✅ Check logs khi có issue
✅ Review metrics weekly
```

### **4. Performance:**
```
Free tier limitations:
⚠️  Service sleep sau 15 min không dùng
⚠️  First request sau sleep: 30s-1min
⚠️  750 hours/month (đủ 24/7)

Solution:
→ Upgrade to paid tier ($7/month) = no sleep
→ Hoặc dùng cron job ping /health mỗi 10 phút
```

---

## 🎯 NEXT STEPS SAU KHI DEPLOY

### **1. Share với Team:**
```
Frontend: https://cv-filtering-frontend.onrender.com
Hướng dẫn sử dụng: README.md
```

### **2. Monitor trong 48h đầu:**
```
- Check logs mỗi vài giờ
- Test các tính năng chính
- Verify database operations
- Note performance issues
```

### **3. Setup Custom Domain (Optional):**
```
1. Mua domain (VD: cvfilter.com)
2. Vào Render → Settings → Custom Domain
3. Add domain và config DNS
4. Update CORS_ORIGINS
```

### **4. Backup Database:**
```
Supabase tự động backup nhưng nên:
1. Export schema định kỳ
2. Backup env variables
3. Document deployment process
```

---

## 🎊 HOÀN TẤT!

**Chúc mừng! Bạn đã deploy thành công ứng dụng lên production! 🚀**

**Điều kiện đạt được:**
- ✅ Backend API đang chạy 24/7
- ✅ Frontend accessible công khai
- ✅ Database connected và operational
- ✅ CORS configured đúng
- ✅ Environment variables set
- ✅ Auto-deploy enabled
- ✅ Monitoring setup

**Total cost: $0/month** 💰

---

**Cần hỗ trợ?**
- Check logs trong Render Dashboard
- Xem RENDER_DEPLOYMENT_GUIDE.md
- Review troubleshooting section
- Ask me anything! 😊
