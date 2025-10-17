# Numerology Debug Test Script

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'src'))

from services.numerology_service import NumerologyService

def test_numerology_basic():
    """Test basic numerology calculation"""
    print("=== NUMEROLOGY SERVICE DEBUG TEST ===")
    
    service = NumerologyService()
    
    # Test case from API call
    name = "Nguyen Van A"
    birth_date = "1990-05-15" 
    candidate_id = "test-001"
    
    print(f"Testing with:")
    print(f"  Name: {name}")
    print(f"  Birth Date: {birth_date}")
    print(f"  Candidate ID: {candidate_id}")
    
    try:
        result = service.calculate_full_numerology(name, birth_date, candidate_id)
        print(f"Result: {result}")
        return True
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_numerology_basic()