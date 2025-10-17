# backend/src/__tests__/test_cv_parsing_service.py
import unittest
from unittest.mock import patch, MagicMock
from backend.src.services.cv_parsing_service import CvParsingService

class TestCvParsingService(unittest.TestCase):

    @patch('google.generativeai.GenerativeModel')
    def test_parse_with_gemini_success(self, mock_model):
        # Mock the Gemini API response
        mock_response = MagicMock()
        mock_response.text = '''
        ```json
        {
            "personalInfo": { "name": "John Doe", "email": "john.doe@example.com", "phone": "123-456-7890" },
            "education": [],
            "experience": [],
            "skills": []
        }
        ```
        '''
        mock_model.return_value.generate_content.return_value = mock_response

        service = CvParsingService()
        # Mock the text extraction to avoid file I/O
        with patch.object(service, '_extract_text', return_value="Sample CV text"):
            result = service.parse_cv("dummy.pdf")

        self.assertTrue(result['source']['aiUsed'])
        self.assertEqual(result['personalInfo']['name'], "John Doe")

    @patch('google.generativeai.GenerativeModel')
    def test_parse_with_gemini_failure_fallback(self, mock_model):
        # Mock the Gemini API to raise an exception
        mock_model.return_value.generate_content.side_effect = Exception("API Error")

        service = CvParsingService()
        with patch.object(service, '_extract_text', return_value="Sample CV text with email test@example.com"):
            result = service.parse_cv("dummy.pdf")

        self.assertFalse(result['source']['aiUsed'])
        self.assertEqual(result['source']['type'], "rule-based")
        self.assertEqual(result['source']['warning'], "AI_PARSING_FAILED")
        self.assertEqual(result['personalInfo']['email'], "test@example.com")

    def test_parse_with_rules_only(self):
        # Test without GEMINI_API_KEY
        with patch.dict('os.environ', {'GEMINI_API_KEY': ''}):
            service = CvParsingService()
            with patch.object(service, '_extract_text', return_value="Rule-based test with email rule@example.com"):
                result = service.parse_cv("dummy.docx")

        self.assertFalse(result['source']['aiUsed'])
        self.assertEqual(result['source']['type'], "rule-based")
        self.assertEqual(result['personalInfo']['email'], "rule@example.com")

if __name__ == '__main__':
    unittest.main()
