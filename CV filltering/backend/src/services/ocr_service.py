# -*- coding: utf-8 -*-
"""
OCR Service for DISC Survey Processing
Dịch vụ OCR xử lý ảnh survey DISC với documented stub và real samples
"""

from typing import Dict, Any, Optional
import base64
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DISCOCRService:
    """
    OCR Service để xử lý ảnh survey DISC
    HIỆN TẠI: Documented stub với sample data để demo
    PRODUCTION: Cần integrate với OCR engine thực (Google Vision, Azure OCR, etc.)
    """
    
    def __init__(self):
        self.supported_formats = ['jpg', 'jpeg', 'png', 'pdf']
        self.confidence_threshold = 0.7
        
        # Sample data cho demo - sẽ thay bằng real OCR
        self.sample_surveys = {
            "standard_survey_1": {
                "extracted_scores": {
                    "d_score": 8.0,
                    "i_score": 6.5,
                    "s_score": 4.0,
                    "c_score": 7.5
                },
                "confidence": 0.92,
                "extraction_details": {
                    "detected_checkboxes": 16,
                    "processed_questions": 4,
                    "image_quality": "high",
                    "processing_time_ms": 1250
                }
            },
            "standard_survey_2": {
                "extracted_scores": {
                    "d_score": 5.5,
                    "i_score": 9.0,
                    "s_score": 7.0,
                    "c_score": 3.5
                },
                "confidence": 0.88,
                "extraction_details": {
                    "detected_checkboxes": 16,
                    "processed_questions": 4,
                    "image_quality": "medium",
                    "processing_time_ms": 1580
                }
            }
        }
    
    def process_disc_survey_image(self, image_base64: str, candidate_id: str, survey_format: str = "standard") -> Dict[str, Any]:
        """
        Xử lý ảnh survey DISC qua OCR
        
        Args:
            image_base64: Base64 encoded image data
            candidate_id: ID của ứng viên
            survey_format: Format của survey (standard, extended, custom)
            
        Returns:
            Dict với extracted scores và metadata
        """
        try:
            # Validate input
            if not image_base64 or not candidate_id:
                return {
                    "success": False,
                    "error": "Missing required parameters: image_base64 và candidate_id",
                    "candidate_id": candidate_id
                }
            
            # Check image format (basic validation)
            if not self._validate_image_format(image_base64):
                return {
                    "success": False,
                    "error": "Invalid image format hoặc corrupted base64 data",
                    "supported_formats": self.supported_formats,
                    "candidate_id": candidate_id
                }
            
            # === DOCUMENTED STUB SECTION ===
            # Production implementation sẽ thay thế section này với real OCR
            
            logger.info(f"[OCR STUB] Processing DISC survey image for candidate {candidate_id}")
            
            # Simulate processing time
            import time
            time.sleep(0.5)  # Mock processing delay
            
            # Select sample based on image characteristics (mock)
            image_size = len(image_base64)
            sample_key = "standard_survey_1" if image_size % 2 == 0 else "standard_survey_2"
            sample_data = self.sample_surveys[sample_key]
            
            # Add variation based on candidate_id (để có consistent results cho cùng candidate)
            variation_factor = hash(candidate_id) % 100 / 100.0
            
            extracted_scores = {}
            for score_type, base_score in sample_data["extracted_scores"].items():
                # Add slight variation để realistic hơn
                varied_score = base_score + (variation_factor - 0.5) * 2
                # Clamp to valid range
                extracted_scores[score_type] = max(1.0, min(10.0, round(varied_score, 1)))
            
            # === END STUB SECTION ===
            
            # Validate extracted scores
            validation_result = self._validate_extracted_scores(extracted_scores)
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": f"OCR extraction produced invalid scores: {validation_result['error']}",
                    "extracted_data": extracted_scores,
                    "candidate_id": candidate_id
                }
            
            # Calculate confidence based on extraction quality
            confidence = sample_data["confidence"] * (0.9 + variation_factor * 0.1)
            
            return {
                "success": True,
                "candidate_id": candidate_id,
                "extraction_method": "OCR_STUB",  # Will be "GOOGLE_VISION" or "AZURE_OCR" in production
                "extracted_scores": extracted_scores,
                "confidence": round(confidence, 3),
                "extraction_metadata": {
                    "survey_format": survey_format,
                    "image_quality": sample_data["extraction_details"]["image_quality"],
                    "processing_time_ms": sample_data["extraction_details"]["processing_time_ms"],
                    "detected_elements": sample_data["extraction_details"]["detected_checkboxes"],
                    "ocr_engine": "DOCUMENTED_STUB_v1.0"
                },
                "production_notes": [
                    "Đây là documented stub với sample data",
                    "Production cần integrate Google Vision API hoặc Azure OCR",
                    "Sample data được design để demo workflow hoàn chỉnh"
                ],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"OCR processing failed: {str(e)}",
                "candidate_id": candidate_id,
                "timestamp": datetime.now().isoformat()
            }
    
    def _validate_image_format(self, image_base64: str) -> bool:
        """
        Validate base64 image format
        """
        try:
            # Basic base64 validation
            if not image_base64.startswith('data:image/'):
                # Try to decode raw base64
                base64.b64decode(image_base64)
                return True
            
            # Extract format from data URL
            if 'data:image/' in image_base64:
                format_part = image_base64.split(',')[0]
                for fmt in self.supported_formats:
                    if fmt in format_part.lower():
                        return True
            
            return False
        except Exception:
            return False
    
    def _validate_extracted_scores(self, scores: Dict[str, float]) -> Dict[str, Any]:
        """
        Validate OCR extracted scores
        """
        required_fields = ['d_score', 'i_score', 's_score', 'c_score']
        errors = []
        
        # Check required fields
        missing_fields = [field for field in required_fields if field not in scores]
        if missing_fields:
            return {
                "valid": False,
                "error": f"Missing extracted scores: {missing_fields}"
            }
        
        # Validate score ranges
        for field in required_fields:
            score = scores[field]
            if not isinstance(score, (int, float)) or not (1.0 <= score <= 10.0):
                errors.append(f"{field}: {score} outside valid range [1.0-10.0]")
        
        if errors:
            return {
                "valid": False,
                "error": f"Invalid extracted scores: {', '.join(errors)}"
            }
        
        return {
            "valid": True,
            "scores": scores
        }
    
    def get_sample_images(self) -> Dict[str, Any]:
        """
        Trả về sample images và expected outputs cho testing
        """
        return {
            "sample_images": {
                "high_quality_survey": {
                    "description": "Survey DISC chất lượng cao, handwriting rõ ràng",
                    "expected_extraction": self.sample_surveys["standard_survey_1"],
                    "mock_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q==",
                    "confidence_expected": "> 0.9"
                },
                "medium_quality_survey": {
                    "description": "Survey DISC chất lượng trung bình, có thể có noise",
                    "expected_extraction": self.sample_surveys["standard_survey_2"],
                    "mock_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                    "confidence_expected": "0.8 - 0.9"
                }
            },
            "testing_instructions": {
                "step_1": "Upload một trong các sample images",
                "step_2": "Verify extracted scores match expected values",
                "step_3": "Check confidence score trong expected range",
                "step_4": "Validate metadata completeness"
            },
            "production_integration": {
                "google_vision_api": "Implement với Google Cloud Vision OCR",
                "azure_cognitive": "Implement với Azure Cognitive Services OCR",
                "custom_ml_model": "Train custom model cho DISC survey format",
                "hybrid_approach": "Combine multiple OCR engines với confidence voting"
            }
        }
    
    def get_integration_guide(self) -> Dict[str, Any]:
        """
        Hướng dẫn integration với real OCR service
        """
        return {
            "production_implementation": {
                "google_vision": {
                    "setup": "pip install google-cloud-vision",
                    "authentication": "Set GOOGLE_APPLICATION_CREDENTIALS",
                    "code_sample": """
from google.cloud import vision

def real_ocr_processing(image_base64):
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=base64.b64decode(image_base64))
    response = client.text_detection(image=image)
    # Process response to extract DISC scores
                    """
                },
                "azure_ocr": {
                    "setup": "pip install azure-cognitiveservices-vision-computervision",
                    "authentication": "Set AZURE_OCR_ENDPOINT and AZURE_OCR_KEY",
                    "code_sample": """
from azure.cognitiveservices.vision.computervision import ComputerVisionClient

def real_ocr_processing(image_base64):
    client = ComputerVisionClient(endpoint, credentials)
    # Process image for text extraction
                    """
                }
            },
            "integration_checklist": [
                "Replace DISCOCRService.process_disc_survey_image stub implementation",
                "Add real OCR API authentication",
                "Implement confidence scoring based on OCR quality",
                "Add error handling cho OCR API failures",
                "Update validation logic for extracted text",
                "Add preprocessing cho image quality enhancement"
            ]
        }