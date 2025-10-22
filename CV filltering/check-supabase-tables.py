"""
Quick script to execute Supabase schema creation via Python.
This reads the SQL file and executes it using Supabase client.
"""

import os
from supabase import create_client, Client

# Read credentials from environment or use provided ones
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://cgvxogztpbzvhncwzodr.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndnhvZ3p0cGJ6dmhuY3d6b2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTEzNzYsImV4cCI6MjA3NjY4NzM3Nn0.GI-6843fw1ymXRE7z9ZeGFq3nOpe5fwXR3FFT5dXiF4")

print("="*70)
print("  SUPABASE SCHEMA SETUP")
print("="*70)

print(f"\n📡 Connecting to Supabase...")
print(f"   URL: {SUPABASE_URL}")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Connected successfully!")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

print(f"\n📝 Note: Database tables must be created via Supabase SQL Editor")
print(f"   1. Go to: https://app.supabase.com")
print(f"   2. Navigate to SQL Editor")
print(f"   3. Copy/paste content from: docs/supabase-schema.sql")
print(f"   4. Click 'Run' to execute")

print(f"\n🔍 Checking if tables exist...")

# Try to query each table
tables_to_check = [
    'candidates',
    'cv_analyses', 
    'numerology_data',
    'disc_assessments',
    'activity_logs',
    'screening_results'
]

existing_tables = []
missing_tables = []

for table in tables_to_check:
    try:
        result = supabase.table(table).select("*").limit(1).execute()
        existing_tables.append(table)
        print(f"   ✅ {table} - EXISTS")
    except Exception as e:
        missing_tables.append(table)
        print(f"   ❌ {table} - NOT FOUND")

print(f"\n📊 Summary:")
print(f"   Existing tables: {len(existing_tables)}/{len(tables_to_check)}")
print(f"   Missing tables: {len(missing_tables)}/{len(tables_to_check)}")

if missing_tables:
    print(f"\n⚠️  REQUIRED ACTION:")
    print(f"   The following tables need to be created:")
    for table in missing_tables:
        print(f"      - {table}")
    print(f"\n   📄 Run the SQL file: docs/supabase-schema.sql")
    print(f"   📍 Location: C:\\Users\\Admin\\Projects\\CV filltering\\docs\\supabase-schema.sql")
    print(f"\n   🌐 Supabase Dashboard: https://app.supabase.com/project/cgvxogztpbzvhncwzodr/editor")
else:
    print(f"\n✅ All tables exist! Database is ready for use.")

print(f"\n{'='*70}")
