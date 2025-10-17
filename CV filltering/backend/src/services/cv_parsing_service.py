# backend/src/services/cv_parsing_service.py
import os
import google.generativeai as genai
import PyPDF2
import docx
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CvParsingService:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
            logger.warning("GEMINI_API_KEY not found. Falling back to rule-based parsing.")

    def parse_cv(self, file_path):
        try:
            text = self._extract_text(file_path)
            if self.model:
                try:
                    return self._parse_with_gemini(text)
                except Exception as e:
                    logger.error(f"Gemini parsing failed: {e}. Falling back to rule-based parsing.")
                    return self._parse_with_rules(text, ai_used=False, warning="AI_PARSING_FAILED")
            else:
                return self._parse_with_rules(text, ai_used=False)
        except Exception as e:
            logger.error(f"Failed to parse CV: {e}")
            raise

    def _extract_text(self, file_path):
        if file_path.endswith(".pdf"):
            return self._extract_text_from_pdf(file_path)
        elif file_path.endswith(".docx"):
            return self._extract_text_from_docx(file_path)
        else:
            raise ValueError("Unsupported file format")

    def _extract_text_from_pdf(self, file_path):
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text

    def _extract_text_from_docx(self, file_path):
        doc = docx.Document(file_path)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text

    def _parse_with_gemini(self, text):
        prompt = f"""
        Extract the following information from the CV text below.
        Return the information as a JSON object with the specified keys.
        - "personalInfo": {{ "name": "...", "email": "...", "phone": "..." }}
        - "education": [ {{ "degree": "...", "institution": "...", "year": "..." }} ]
        - "experience": [ {{ "title": "...", "company": "...", "duration": "..." }} ]
        - "skills": [ "...", "..." ]

        CV Text:
        {text}
        """
        response = self.model.generate_content(prompt)
        # Clean the response to get a valid JSON
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        parsed_data = json.loads(cleaned_response)
        parsed_data["source"] = {"type": "gemini", "aiUsed": True}
        return parsed_data

    def _parse_with_rules(self, text, ai_used=False, warning=None):
        # Simple rule-based fallback (can be improved)
        data = {
            "personalInfo": {
                "name": "N/A",
                "email": "N/A",
                "phone": "N/A"
            },
            "education": [],
            "experience": [],
            "skills": [],
            "source": {"type": "rule-based", "aiUsed": ai_used}
        }
        if warning:
            data["source"]["warning"] = warning
        
        # Example rule: find email
        import re
        email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
        if email_match:
            data["personalInfo"]["email"] = email_match.group(0)

        return data
