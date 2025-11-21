"""
Quick test to verify the database_service fix.
This tests that all _save_* methods handle dict properly.
"""
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend" / "src"))

# Load environment
from dotenv import load_dotenv
load_dotenv()

from services.database_service import DatabaseService
from datetime import datetime

def test_cv_analysis_validation():
    """Test that _save_cv_analysis validates input correctly."""
    print("\n" + "="*60)
    print("TEST: CV Analysis Input Validation")
    print("="*60)

    db = DatabaseService()

    if db.is_stub():
        print("⚠️  Running in STUB mode - need Supabase credentials")
        return False

    # Test with correct dict format
    candidate_id = f"TEST-QUICK-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    raw_data = {
        "source": "gemini",
        "filename": "test.pdf",
        "personalInfo": {"name": "Test User", "email": "test@test.com"},
        "education": [],
        "experience": [],
        "skills": ["Python"]
    }

    summary = {
        "name": "Test User",
        "email": "test@test.com",
        "skills": ["Python"]
    }

    try:
        result = db.save_analysis(candidate_id, "cv_parsing", raw_data, summary)
        if result["success"]:
            print("✅ CV Analysis: Dict input handled correctly")
            return True
        else:
            print(f"❌ CV Analysis failed: {result.get('error')}")
            return False
    except TypeError as e:
        print(f"❌ TypeError caught (expected for string input): {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_numerology_validation():
    """Test that _save_numerology_data validates input correctly."""
    print("\n" + "="*60)
    print("TEST: Numerology Input Validation")
    print("="*60)

    db = DatabaseService()

    if db.is_stub():
        print("⚠️  Running in STUB mode")
        return False

    candidate_id = f"TEST-QUICK-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    raw_data = {
        "full_name": "Test User",
        "birth_date": "1990-01-01",
        "calculations": {}
    }

    summary = {
        "life_path_number": 8,
        "birth_number": 1,
        "interpretation": {}
    }

    try:
        result = db.save_analysis(candidate_id, "numerology", raw_data, summary)
        if result["success"]:
            print("✅ Numerology: Dict input handled correctly")
            return True
        else:
            print(f"❌ Numerology failed: {result.get('error')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_disc_validation():
    """Test that _save_disc_assessment validates input correctly."""
    print("\n" + "="*60)
    print("TEST: DISC Assessment Input Validation")
    print("="*60)

    db = DatabaseService()

    if db.is_stub():
        print("⚠️  Running in STUB mode")
        return False

    candidate_id = f"TEST-QUICK-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    raw_data = {
        "source": "csv_upload",
        "responses": {}
    }

    summary = {
        "D": 7,
        "I": 6,
        "S": 5,
        "C": 4,
        "primary_type": "D"
    }

    try:
        result = db.save_analysis(candidate_id, "disc_csv", raw_data, summary)
        if result["success"]:
            print("✅ DISC Assessment: Dict input handled correctly")
            return True
        else:
            print(f"❌ DISC Assessment failed: {result.get('error')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all quick validation tests."""
    print("\n" + "="*70)
    print("  QUICK VALIDATION TEST - database_service.py Fix")
    print("="*70)

    print("\n🔍 Checking Supabase connection...")
    db = DatabaseService()

    if db.is_stub():
        print("\n❌ STUB MODE - Supabase credentials not configured")
        print("\nTo run these tests:")
        print("1. Set SUPABASE_URL environment variable")
        print("2. Set SUPABASE_KEY environment variable")
        print("3. Re-run this script")
        return False

    print("✅ Supabase connected")

    # Run tests
    results = []

    results.append(("CV Analysis", test_cv_analysis_validation()))
    results.append(("Numerology", test_numerology_validation()))
    results.append(("DISC Assessment", test_disc_validation()))

    # Summary
    print("\n" + "="*70)
    print("  TEST SUMMARY")
    print("="*70)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")

    print(f"\nResults: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All validation tests passed!")
        print("\n✅ Fix verified - ready to run full integration tests")
        print("\nNext step:")
        print("  python test-supabase-integration.py")
        success = True
    else:
        print("\n⚠️  Some tests failed - please review errors above")
        success = False

    print("\n" + "="*70 + "\n")

    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
