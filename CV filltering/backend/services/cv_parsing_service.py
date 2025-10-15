import os
import json
import PyPDF2
import docx
import google.generativeai as genai
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class CVParsingService:
    def __init__(self):
        # Configure Gemini AI
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            logger.warning("GEMINI_API_KEY not found. AI extraction will not work.")
            self.model = None

    def test_connection(self) -> bool:
        """Test if Gemini AI is properly configured"""
        return self.model is not None

    def parse_file(self, file_path: str) -> str:
        """Extract text content from PDF or DOCX file"""
        try:
            file_extension = file_path.lower().split('.')[-1]
            
            if file_extension == 'pdf':
                return self._parse_pdf(file_path)
            elif file_extension == 'docx':
                return self._parse_docx(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
        except Exception as e:
            logger.error(f"File parsing error: {e}")
            raise

    def _parse_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                
                return text.strip()
        except Exception as e:
            raise Exception(f"PDF parsing failed: {e}")

    def _parse_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            return text.strip()
        except Exception as e:
            raise Exception(f"DOCX parsing failed: {e}")

    def extract_structured_data(self, cv_text: str) -> Dict[str, Any]:
        """Use Gemini AI to extract structured data from CV text"""
        if not self.model:
            # Fallback without AI
            return self._fallback_extraction(cv_text)

        try:
            prompt = f"""
            Analyze the following CV text and extract structured information in JSON format.
            Return ONLY valid JSON without any markdown formatting or additional text.

            Required JSON structure:
            {{
                "personalInfo": {{
                    "name": "Full Name",
                    "email": "email@example.com",
                    "phone": "phone number",
                    "address": "address if available"
                }},
                "experience": [
                    {{
                        "position": "Job Title",
                        "company": "Company Name",
                        "duration": "Employment period",
                        "description": "Job description"
                    }}
                ],
                "education": [
                    {{
                        "degree": "Degree/Qualification",
                        "institution": "School/University",
                        "year": "Graduation year"
                    }}
                ],
                "skills": ["skill1", "skill2", "skill3"]
            }}

            CV Text:
            {cv_text}
            """

            response = self.model.generate_content(prompt)
            
            # Clean and parse JSON response
            response_text = response.text.strip()
            
            # Remove markdown formatting if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            try:
                structured_data = json.loads(response_text)
                logger.info("Successfully extracted structured data with AI")
                return structured_data
            except json.JSONDecodeError as e:
                logger.error(f"JSON parsing failed: {e}")
                logger.error(f"Raw response: {response_text}")
                return self._fallback_extraction(cv_text)

        except Exception as e:
            logger.error(f"AI extraction failed: {e}")
            return self._fallback_extraction(cv_text)

    def _fallback_extraction(self, cv_text: str) -> Dict[str, Any]:
        """Fallback extraction without AI - basic text parsing"""
        logger.info("Using fallback extraction method")
        
        lines = cv_text.split('\n')
        
        # Basic extraction logic
        result = {
            "personalInfo": {
                "name": self._extract_name(lines),
                "email": self._extract_email(cv_text),
                "phone": self._extract_phone(cv_text),
                "address": ""
            },
            "experience": [],
            "education": [],
            "skills": self._extract_skills(cv_text)
        }
        
        return result

    def _extract_name(self, lines):
        # Assume first non-empty line is the name
        for line in lines:
            line = line.strip()
            if line and len(line.split()) <= 4:  # Reasonable name length
                return line
        return "Name not found"

    def _extract_email(self, text):
        import re
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(email_pattern, text)
        return match.group() if match else "Email not found"

    def _extract_phone(self, text):
        import re
        phone_pattern = r'[\+]?[1-9]?[0-9]{7,14}'
        match = re.search(phone_pattern, text)
        return match.group() if match else "Phone not found"

    def _extract_skills(self, text):
        # Basic skills extraction
        skills_keywords = ['python', 'javascript', 'java', 'react', 'node', 'sql', 'html', 'css']
        found_skills = []
        text_lower = text.lower()
        
        for skill in skills_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        return found_skills if found_skills else ["Skills analysis requires manual review"]