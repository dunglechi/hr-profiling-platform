# 🚀 HƯỚNG DẪN DEPLOY NHANH - 1 GIỜ

**Mục tiêu**: Deploy backend lên production ngay lập tức

---

## OPTION 1: Deploy Backend Ngay (KHUYẾN NGHỊ) ⭐

### Bước 1: Chuẩn bị Render.com (5 phút)

1. Đăng nhập https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository: `CV filltering`

### Bước 2: Cấu hình Service (5 phút)

**Trong Render Dashboard:**

```
Name:              cv-filtering-backend
Runtime:           Python 3
Build Command:     pip install -r backend/requirements.txt
Start Command:     gunicorn --chdir backend/src --bind 0.0.0.0:$PORT app:app
```

### Bước 3: Thêm Environment Variables (5 phút)

Click **"Environment"** tab, thêm:

```
FLASK_ENV=production
DEBUG=false
SUPABASE_URL=https://cgvxogztpbzvhncwzodr.supabase.co
SUPABASE_KEY=[Lấy từ file .env của bạn]
GEMINI_API_KEY=[Optional - nếu có]
DISC_CSV_MAX_ROWS=1000
TESSERACT_CONFIG=--oem 3 --psm 6
```

> **Lấy SUPABASE_KEY**: Mở file `.env` trong project, copy giá trị `SUPABASE_KEY`

### Bước 4: Deploy! (10-15 phút)

1. Click **"Create Web Service"**
2. Render sẽ tự động:
   - Clone code từ GitHub
   - Install dependencies
   - Start server
3. Đợi build hoàn thành (10-15 phút)
4. Khi status = "Live" (màu xanh) → Thành công! ✅

### Bước 5: Verify (2 phút)

Test health endpoint:
```bash
curl https://cv-filtering-backend.onrender.com/health
```

Kết quả mong đợi:
```json
{"status": "ok", "database": "connected"}
```

**✅ XONG! Backend đã live!**

---

## OPTION 2: Deploy Bằng Blueprint (Nhanh hơn)

### Bước 1: Chuẩn bị (2 phút)

1. Đảm bảo code đã push lên GitHub
2. File `render.yaml` đã có sẵn trong project ✅

### Bước 2: Deploy với Blueprint (3 phút)

1. Đăng nhập https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect GitHub repository: `CV filltering`
4. Render tự động detect `render.yaml`
5. Click **"Apply"**

### Bước 3: Thêm Environment Variables (5 phút)

Render sẽ hỏi các biến môi trường:

```
SUPABASE_URL=https://cgvxogztpbzvhncwzodr.supabase.co
SUPABASE_KEY=[Từ file .env]
GEMINI_API_KEY=[Optional]
```

### Bước 4: Deploy (10-15 phút)

- Render deploy cả backend VÀ frontend cùng lúc
- Đợi build hoàn thành
- Status = "Live" → Thành công!

**✅ XONG! Cả backend và frontend đã live!**

---

## Sau Khi Deploy

### URLs của bạn:
```
Backend:  https://cv-filtering-backend.onrender.com
Frontend: https://cv-filtering-frontend.onrender.com (nếu deploy)
```

### Test ngay:
```bash
# Health check
curl https://cv-filtering-backend.onrender.com/health

# API test
curl https://cv-filtering-backend.onrender.com/api/disc/recent?limit=1
```

### Document URLs:
Lưu URLs vào file `PRODUCTION_URLS.md` để team biết.

---

## Troubleshooting

### Build Failed?
- Check Render logs
- Verify `requirements.txt` có đúng
- Verify Python version (3.11)

### Database Connection Failed?
- Verify `SUPABASE_URL` và `SUPABASE_KEY` đúng
- Check Supabase tables đã tạo chưa (6 tables)

### Health Check Failed?
- Check Render logs
- Verify start command đúng
- Verify port binding

---

## Thời gian dự kiến

```
Option 1 (Backend only):     30-45 phút
Option 2 (Backend + Frontend): 45-60 phút
```

---

**Bắt đầu ngay:** https://dashboard.render.com

**Cần hỗ trợ?** Check `DEPLOYMENT_CHECKLIST.md` để biết chi tiết hơn.
