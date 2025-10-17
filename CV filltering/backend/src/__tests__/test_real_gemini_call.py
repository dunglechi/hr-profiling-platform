# backend/src/__tests__/test_real_gemini_call.py
import unittest
import os
import json
from backend.src.services.cv_parsing_service import CvParsingService

class TestRealGeminiCall(unittest.TestCase):

    def test_real_gemini_parsing(self):
        """
        This test makes a real API call to Gemini to validate the prompt and response format.
        It requires a valid GEMINI_API_KEY in the environment.
        """
        if not os.getenv("GEMINI_API_KEY"):
            self.skipTest("GEMINI_API_KEY not found, skipping real API call test.")

        service = CvParsingService()
        
        # A simple, anonymous CV text sample
        cv_text = """
        John Smith
        Software Engineer
        Email: john.smith.dev@email.com
        Phone: 555-123-4567

        Experience:
        - Senior Developer at Tech Corp (2020-Present)
        - Junior Developer at Web Solutions (2018-2020)

        Education:
        - B.S. in Computer Science, University of Technology (2018)

        Skills:
        - Python, JavaScript, React, SQL
        """

        print("\n--- Making real API call to Gemini ---")
        try:
            result = service._parse_with_gemini(cv_text)
            print("API Response (raw):", result)

            # Validate the structure
            self.assertIn("personalInfo", result)
            self.assertIn("name", result["personalInfo"])
            self.assertIn("education", result)
            self.assertIn("experience", result)
            self.assertIn("skills", result)
            self.assertTrue(result["source"]["aiUsed"])
            
            print("--- Real API call test: PASSED ---")
        except Exception as e:
            self.fail(f"Real API call to Gemini failed: {e}")

if __name__ == '__main__':
    unittest.main()
