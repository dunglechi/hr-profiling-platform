# 🚨 URGENT: Vercel Environment Variables Setup

## Vấn đề 404 NOT_FOUND
- Ứng dụng không thể kết nối Supabase vì thiếu environment variables trên Vercel
- Vercel không đọc file `.env.local`, cần config trực tiếp

## ✅ Cần thiết lập ngay trên Vercel Dashboard:

### 1. Truy cập: https://vercel.com/dunglechi/hr-profiling-platform/settings/environment-variables

### 2. Thêm 2 biến sau:

**Variable 1:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://lvxwggtgrianassxnftj.supabase.co`
- Environment: Production, Preview, Development

**Variable 2:**  
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eHdnZ3RncmlhbmFzc3huZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDY3NDAsImV4cCI6MjA3NTk4Mjc0MH0.qFi6h-HJCz7tUY9Gi6LUbva_ll_hX41kKJSyJTgiN5A`
- Environment: Production, Preview, Development

### 3. Sau khi thêm, click "Redeploy" để áp dụng

## 🎯 Kết quả mong đợi:
- ✅ Loại bỏ lỗi 404 NOT_FOUND  
- ✅ Kết nối Supabase thành công
- ✅ Autocomplete hoàn toàn biến mất
- ✅ Ứng dụng hoạt động 100%