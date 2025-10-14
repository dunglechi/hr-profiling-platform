# 🚀 SUPABASE SETUP - STEP BY STEP GUIDE

## 📋 **STEP 1: TẠO SUPABASE ACCOUNT VÀ PROJECT**

### **1.1 Tạo Account (5 phút)**
1. 🌐 Truy cập: https://supabase.com
2. 🔐 Click "Start your project" 
3. 📧 Sign up với GitHub account (khuyến nghị) hoặc email
4. ✅ Verify email nếu cần

### **1.2 Tạo Project Mới (5 phút)**
1. 📂 Click "New Project"
2. 🏢 Chọn Organization (tạo mới nếu chưa có)
3. 📝 Điền thông tin project:
   ```
   Name: numerology-platform
   Database Password: [Tạo password mạnh - LƯU LẠI]
   Region: Southeast Asia (Singapore)
   Pricing Plan: Free tier
   ```
4. ⏳ Chờ ~2 phút để project được tạo

### **1.3 Lấy Connection Details (5 phút)**
Sau khi project được tạo:

1. 🔧 Vào Settings → API
2. 📋 Copy các thông tin sau:
   ```
   Project URL: https://[project-id].supabase.co
   Anon (public) key: eyJ0eXAiOiJKV1Q...
   Service Role key: eyJ0eXAiOiJKV1Q... (giữ bí mật)
   Database URL: postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
   ```

---

## 📋 **STEP 2: CẬP NHẬT PROJECT CONFIGURATION**

### **2.1 Cài đặt Supabase Client**
```bash
cd C:\Users\Admin\Projects\frontend
npm install @supabase/supabase-js
```

### **2.2 Tạo Environment Variables**
Tạo file `.env.local` trong thư mục frontend:

```env
# Supabase Configuration for Vite
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1Q...

# Development
VITE_API_URL=https://[your-project-id].supabase.co/rest/v1
```

### **2.3 Tạo Supabase Client**
Tạo file `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (sẽ cập nhật sau)
export interface Database {
  public: {
    Tables: {
      numerology_results: {
        Row: {
          id: string
          user_name: string
          birth_date: string
          calculation_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_name: string
          birth_date: string
          calculation_data: any
          created_at?: string
        }
        Update: {
          id?: string
          user_name?: string
          birth_date?: string
          calculation_data?: any
          created_at?: string
        }
      }
    }
  }
}
```

---

## 🎯 **READY TO CONTINUE?**

Sau khi hoàn thành Step 1, bạn sẽ có:
- ✅ Supabase project đã setup
- ✅ Connection strings đã có
- ✅ Environment variables đã config
- ✅ Supabase client đã sẵn sàng

**📞 BÁO CÁO TIẾN ĐỘ:**
Khi xong Step 1, hãy cho tôi biết:
1. ✅ Project URL của bạn
2. ✅ Đã copy được API keys chưa?
3. ✅ Đã tạo được `.env.local` file chưa?

**⏭️ NEXT STEP:** Database Schema Migration (30 phút)

---

## 🆘 **TROUBLESHOOTING**

### Nếu gặp lỗi:
- **❌ Email verification**: Check spam folder
- **❌ Project creation failed**: Thử chọn region khác
- **❌ Database timeout**: Đợi thêm 1-2 phút

### Cần hỗ trợ:
1. 📸 Screenshot lỗi
2. 📝 Copy exact error message
3. 🔄 Refresh page và thử lại