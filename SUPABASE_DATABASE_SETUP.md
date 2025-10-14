# 🗄️ SUPABASE DATABASE SCHEMA SETUP

## 📋 **STEP 3: TẠO DATABASE TABLES**

### **Cách thực hiện:**
1. 🌐 Mở trình duyệt, vào: **https://lvxwggtgrianassxnftj.supabase.co**
2. 🔐 Đăng nhập vào project
3. 📊 Click **"Table Editor"** ở sidebar bên trái
4. 📝 Tạo các tables sau:

---

## 🗂️ **TABLE 1: numerology_results**

### Tạo table:
1. Click **"Create a new table"**
2. **Table name**: `numerology_results`
3. **Description**: `Store numerology calculation results`
4. ✅ Enable RLS (Row Level Security)

### Columns (thêm từng column):

| Column | Type | Settings |
|--------|------|----------|
| `id` | `uuid` | Primary Key, Default: `gen_random_uuid()` |
| `user_name` | `text` | Not null |
| `birth_date` | `date` | Not null |
| `calculation_data` | `jsonb` | Not null |
| `created_at` | `timestamptz` | Default: `now()` |
| `updated_at` | `timestamptz` | Default: `now()` |

---

## 🗂️ **TABLE 2: users**

### Tạo table:
1. Click **"Create a new table"**  
2. **Table name**: `users`
3. **Description**: `User profiles`
4. ✅ Enable RLS

### Columns:

| Column | Type | Settings |
|--------|------|----------|
| `id` | `uuid` | Primary Key, Default: `gen_random_uuid()` |
| `email` | `text` | Not null, Unique |
| `full_name` | `text` | Not null |
| `created_at` | `timestamptz` | Default: `now()` |
| `updated_at` | `timestamptz` | Default: `now()` |

---

## 🗂️ **TABLE 3: assessment_results**

### Tạo table:
1. Click **"Create a new table"**
2. **Table name**: `assessment_results`  
3. **Description**: `DISC, MBTI and other assessments`
4. ✅ Enable RLS

### Columns:

| Column | Type | Settings |
|--------|------|----------|
| `id` | `uuid` | Primary Key, Default: `gen_random_uuid()` |
| `user_id` | `uuid` | Foreign Key to users.id |
| `assessment_type` | `text` | Not null (values: 'numerology', 'disc', 'mbti') |
| `result_data` | `jsonb` | Not null |
| `created_at` | `timestamptz` | Default: `now()` |
| `updated_at` | `timestamptz` | Default: `now()` |

---

## 🔒 **SECURITY POLICIES (RLS)**

Sau khi tạo xong tables, cần setup Row Level Security:

### 1. Cho table `numerology_results`:
```sql
-- Allow read access to all
CREATE POLICY "Allow public read" ON numerology_results
FOR SELECT USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Allow public insert" ON numerology_results  
FOR INSERT WITH CHECK (true);
```

### 2. Cho table `users`:
```sql
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
FOR SELECT USING (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data" ON users
FOR INSERT WITH CHECK (auth.uid() = id);
```

### 3. Cho table `assessment_results`:
```sql
-- Public read access
CREATE POLICY "Allow public read" ON assessment_results
FOR SELECT USING (true);

-- Public insert access  
CREATE POLICY "Allow public insert" ON assessment_results
FOR INSERT WITH CHECK (true);
```

---

## 🚀 **AUTOMATION SCRIPT (ALTERNATIVE)**

Nếu bạn muốn tự động, copy đoạn SQL này vào **SQL Editor**:

```sql
-- Create numerology_results table
CREATE TABLE numerology_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    calculation_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table  
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assessment_results table
CREATE TABLE assessment_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    assessment_type TEXT NOT NULL,
    result_data JSONB NOT NULL, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE numerology_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read" ON numerology_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON numerology_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read" ON assessment_results FOR SELECT USING (true);  
CREATE POLICY "Allow public insert" ON assessment_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## ✅ **VERIFICATION**

Sau khi tạo xong, kiểm tra:
1. 📋 3 tables đã được tạo
2. 🔒 RLS đã được enable
3. 📝 Policies đã được setup

**📞 BÁO CÁO:** Cho tôi biết khi nào bạn hoàn thành việc tạo tables!