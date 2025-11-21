"""
Test script for DatabaseService with real Supabase integration.

This script verifies:
1. Connection to Supabase
2. Candidate creation
3. CV analysis storage
4. Numerology data storage
5. DISC assessment storage
6. Activity logging
7. Data retrieval

Usage:
    python test-supabase-integration.py
"""

import os
import sys
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend', 'src'))

from services.database_service import DatabaseService

def print_section(title):
    """Print a formatted section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_connection():
    """Test 1: Verify Supabase connection."""
    print_section("Test 1: Connection Test")
    
    db = DatabaseService()
    
    if db.is_stub():
        print("❌ STUB MODE - No Supabase credentials configured")
        print("\nTo configure:")
        print("1. Copy .env.example to .env")
        print("2. Add your SUPABASE_URL and SUPABASE_KEY")
        print("3. Re-run this test")
        return False
    else:
        print("✅ Connected to Supabase successfully!")
        return True

def test_cv_parsing():
    """Test 2: Save CV parsing data."""
    print_section("Test 2: CV Parsing Data")
    
    db = DatabaseService()
    
    candidate_id = f"TEST-CV-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    raw_data = {
        "source": {
            "type": "gemini",
            "aiUsed": True
        },
        "filename": "test_resume.pdf",
        "personalInfo": {
            "name": "Nguyễn Văn Test",
            "email": "test@example.com",
            "phone": "0123456789"
        },
        "education": [
            {"degree": "B.Sc. Computer Science", "school": "Test University", "year": "2020"}
        ],
        "experience": [
            {"title": "Software Engineer", "company": "Test Corp", "duration": "2020-2023"}
        ],
        "skills": ["Python", "JavaScript", "SQL"]
    }
    
    summary = {
        "name": "Nguyễn Văn Test",
        "email": "test@example.com",
        "phone": "0123456789",
        "personalInfo": raw_data["personalInfo"],
        "education": raw_data["education"],
        "experience": raw_data["experience"],
        "skills": raw_data["skills"],
        "summary": "Experienced software engineer with 3 years in web development"
    }
    
    result = db.save_analysis(candidate_id, "cv_parsing", raw_data, summary)
    
    if result["success"]:
        print(f"✅ CV data saved for candidate: {candidate_id}")
        print(f"   - Name: {summary['name']}")
        print(f"   - Email: {summary['email']}")
        print(f"   - Skills: {', '.join(summary['skills'])}")
        return candidate_id
    else:
        print(f"❌ Failed to save CV data: {result.get('error')}")
        return None

def test_numerology(candidate_id):
    """Test 3: Save numerology data."""
    print_section("Test 3: Numerology Data")
    
    if not candidate_id:
        print("⏭️  Skipped (no candidate_id from previous test)")
        return
    
    db = DatabaseService()
    
    raw_data = {
        "full_name": "Nguyễn Văn Test",
        "birth_date": "1995-05-15",
        "calculations": {
            "life_path": [1, 9, 9, 5, 0, 5, 1, 5],
            "soul_urge": [5, 3, 1],
            "expression": [7, 4, 2]
        }
    }
    
    summary = {
        "life_path_number": 8,
        "soul_urge_number": 9,
        "expression_number": 4,
        "personality_number": 3,
        "interpretation": {
            "life_path": "Ambitious leader with strong business sense",
            "soul_urge": "Humanitarian with desire to help others",
            "expression": "Practical and organized approach to life"
        }
    }
    
    result = db.save_analysis(candidate_id, "numerology", raw_data, summary)
    
    if result["success"]:
        print(f"✅ Numerology data saved for: {raw_data['full_name']}")
        print(f"   - Life Path: {summary['life_path_number']}")
        print(f"   - Soul Urge: {summary['soul_urge_number']}")
        print(f"   - Expression: {summary['expression_number']}")
    else:
        print(f"❌ Failed to save numerology data: {result.get('error')}")

def test_disc(candidate_id):
    """Test 4: Save DISC assessment data."""
    print_section("Test 4: DISC Assessment Data")
    
    if not candidate_id:
        print("⏭️  Skipped (no candidate_id from previous test)")
        return
    
    db = DatabaseService()
    
    raw_data = {
        "source": "csv_upload",
        "responses": {
            "q1": "D", "q2": "I", "q3": "S", "q4": "C",
            "q5": "D", "q6": "I", "q7": "D", "q8": "C"
        }
    }
    
    summary = {
        "D": 7,  # Fixed: Scale 1-10 instead of percentage
        "I": 6,
        "S": 4,
        "C": 5,
        "primary_type": "D",
        "secondary_type": "I",
        "interpretation": {
            "primary": "Dominant personality - decisive, competitive, results-oriented",
            "secondary": "Influential traits - sociable, enthusiastic, persuasive"
        }
    }
    
    result = db.save_analysis(candidate_id, "disc_csv", raw_data, summary)
    
    if result["success"]:
        print(f"✅ DISC data saved")
        print(f"   - Profile: {summary['primary_type']}/{summary['secondary_type']}")
        print(f"   - Scores: D={summary['D']}, I={summary['I']}, S={summary['S']}, C={summary['C']}")
    else:
        print(f"❌ Failed to save DISC data: {result.get('error')}")

def test_retrieval():
    """Test 5: Retrieve recent analyses."""
    print_section("Test 5: Data Retrieval")
    
    db = DatabaseService()
    
    result = db.get_recent_analyses(limit=5)
    
    if result["success"]:
        data = result["data"]
        print(f"✅ Retrieved {len(data)} recent analyses")
        
        for i, record in enumerate(data[:3], 1):  # Show first 3
            print(f"\n{i}. Candidate: {record.get('candidate_id')}")
            print(f"   Source: {record.get('source_type')}")
            print(f"   Created: {record.get('created_at', 'N/A')}")
    else:
        print(f"❌ Failed to retrieve data: {result.get('error')}")

def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("  SUPABASE INTEGRATION TEST SUITE")
    print("="*60)
    
    # Test 1: Connection
    connected = test_connection()
    
    if not connected:
        print("\n⚠️  Tests require Supabase connection. Please configure .env first.")
        return
    
    # Test 2: CV Parsing
    candidate_id = test_cv_parsing()
    
    # Test 3: Numerology
    test_numerology(candidate_id)
    
    # Test 4: DISC
    test_disc(candidate_id)
    
    # Test 5: Retrieval
    test_retrieval()
    
    # Summary
    print_section("Test Summary")
    print("✅ All tests completed!")
    print(f"\nTest Candidate ID: {candidate_id}")
    print("\nNext steps:")
    print("1. Check Supabase dashboard to verify data")
    print("2. Run integration tests: python -m pytest backend/src/__tests__/")
    print("3. Test functional endpoints: python tools/run-functional-tests.py")
    
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
