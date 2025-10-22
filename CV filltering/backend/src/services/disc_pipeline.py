# -*- coding: utf-8 -*-
"""
DISC External Pipeline Service
Dịch vụ xử lý dữ liệu DISC từ nhiều nguồn: CSV, manual input, OCR image
"""

from typing import Dict, Any, List, Optional, Union
import pandas as pd
import logging
import base64
import io
import json
import csv
import cv2
import numpy as np
import pytesseract
import os
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DISCExternalPipeline:
    """
    Pipeline xử lý dữ liệu DISC từ các nguồn bên ngoài
    """
    
    def __init__(self):
        self.supported_formats = ['csv', 'manual', 'ocr']
        self.score_range = (1, 10)  # Valid DISC score range
        
    def validate_disc_scores(self, scores: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate DISC scores trong khoảng hợp lệ (1-10)
        """
        required_fields = ['d_score', 'i_score', 's_score', 'c_score']
        errors = []
        warnings = []
        
        # Check required fields
        missing_fields = [field for field in required_fields if field not in scores]
        if missing_fields:
            return {
                "valid": False,
                "error": f"Missing DISC scores: {missing_fields}",
                "required_fields": required_fields
            }
        
        # Validate score ranges
        valid_scores = {}
        for field in required_fields:
            score = scores.get(field)
            try:
                score_value = float(score)
                if self.score_range[0] <= score_value <= self.score_range[1]:
                    valid_scores[field] = score_value
                else:
                    errors.append(f"{field}: {score} ngoài khoảng cho phép {self.score_range}")
            except (ValueError, TypeError):
                errors.append(f"{field}: '{score}' không phải là số hợp lệ")
        
        if errors:
            return {
                "valid": False,
                "error": f"Invalid scores: {', '.join(errors)}",
                "score_range": self.score_range
            }
        
        return {
            "valid": True,
            "scores": valid_scores,
            "warnings": warnings
        }
    
    def process_manual_input(self, candidate_id: str, disc_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Xử lý dữ liệu DISC nhập thủ công
        """
        try:
            # Validate input
            validation = self.validate_disc_scores(disc_data)
            if not validation["valid"]:
                return {
                    "success": False,
                    "error": validation["error"],
                    "candidate_id": candidate_id
                }
            
            # Create DISC profile
            scores = validation["scores"]
            profile = self.generate_disc_profile(scores)
            
            return {
                "success": True,
                "candidate_id": candidate_id,
                "disc_scores": scores,
                "disc_profile": profile,
                "source": "manual_input",
                "notes": disc_data.get("notes", "Manual DISC assessment"),
                "timestamp": datetime.now().isoformat(),
                "warnings": validation.get("warnings", [])
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Lỗi manual input: {str(e)}",
                "candidate_id": candidate_id
            }
    
    def _preprocess_image_for_ocr(self, image_bytes: bytes) -> np.ndarray:
        """
        Tiền xử lý ảnh để tăng độ chính xác cho Tesseract.
        """
        # Decode image bytes into an OpenCV image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 1. Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. Apply thresholding to get a binary image
        # THRESH_OTSU tự động tìm ngưỡng tối ưu
        _, binary_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # 3. (Optional but recommended) Denoising
        denoised_img = cv2.medianBlur(binary_img, 3)

        return denoised_img

    def process_ocr_image(self, image_bytes: bytes, candidate_id: str = "unknown") -> Dict[str, Any]:
        """
        Xử lý ảnh survey DISC qua OCR.
        Sử dụng Tesseract OCR engine.
        """
        logger.info(f"Processing OCR image for candidate '{candidate_id}' using Tesseract.")
        try:
            # 1. Preprocess the image
            preprocessed_img = self._preprocess_image_for_ocr(image_bytes)

            # 2. Use Tesseract to extract text
            # Cấu hình để Tesseract nhận dạng số và layout của trang
            custom_config = r'--oem 3 --psm 6'
            extracted_text = pytesseract.image_to_string(preprocessed_img, config=custom_config)

            # 3. Parse the extracted text to get scores
            # Đây là phần logic phức tạp, cần phân tích text để tìm ra điểm số.
            # Ví dụ đơn giản: tìm các dòng có chứa "D:", "I:", "S:", "C:"
            # NOTE: Logic này cần được làm phức tạp hơn để xử lý form thật.
            scores = {}
            # for line in extracted_text.split('\n'):
            #     if "D:" in line: scores['d_score'] = ...
            #     ...

            # For now, we'll return the extracted text for manual review
            return {
                "success": True,
                "candidate_id": candidate_id,
                "status": "pending_manual_review", # Vẫn cần review vì logic parse text chưa hoàn thiện
                "notes": "OCR extraction completed. Text parsing logic needs refinement.",
                "extracted_text": extracted_text,
                "source": "ocr_tesseract",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Tesseract OCR processing failed for candidate {candidate_id}: {e}", exc_info=True)
            return {"success": False, "error": f"Lỗi xử lý OCR: {e}"}
    
    def process_csv_upload(self, file_bytes):
        max_rows = int(os.getenv('DISC_CSV_MAX_ROWS', 1000))
        results = {
            "processed_count": 0,
            "errors": [],
            "warnings": [],
            "candidates": []
        }
        
        try:
            # Use io.StringIO to treat the byte string as a file
            file_stream = io.StringIO(file_bytes.decode('utf-8'))
            reader = csv.DictReader(file_stream)
            
            expected_headers = {'candidate_id', 'name', 'd_score', 'i_score', 's_score', 'c_score'}
            if not expected_headers.issubset(reader.fieldnames):
                results["errors"].append(f"Missing required headers. Expected: {expected_headers}")
                return results

            for i, row in enumerate(reader):
                if i >= max_rows:
                    results["warnings"].append(f"Processing stopped at {max_rows} rows limit.")
                    break
                
                try:
                    # Tái sử dụng hàm validate_disc_scores để đảm bảo tính nhất quán
                    validation = self.validate_disc_scores(row)
                    if not validation["valid"]:
                        raise ValueError(validation.get("error", "Invalid score format."))
                    
                    scores = validation["scores"]
                    profile = self.generate_disc_profile(scores)

                    candidate_data = {
                        "candidate_id": row.get('candidate_id'),
                        "name": row.get('name'),
                        "disc_scores": scores,
                        "disc_profile": profile,
                        "source": "csv_upload",
                        "row_index": i + 2,  # Account for header
                        "notes": row.get("notes", "")
                    }
                    results["candidates"].append(candidate_data)
                    results["processed_count"] += 1
                except (ValueError, KeyError) as e:
                    results["errors"].append(f"Row {i + 2}: Invalid data - {e}")

        except Exception as e:
            results["errors"].append(f"Failed to process CSV file: {e}")
            
        return results
    
    def generate_disc_profile(self, scores: Dict[str, float]) -> Dict[str, Any]:
        """
        Tạo profile DISC từ scores
        """
        d_score = scores["d_score"]
        i_score = scores["i_score"]
        s_score = scores["s_score"]
        c_score = scores["c_score"]
        
        # Determine primary style
        max_score = max(d_score, i_score, s_score, c_score)
        
        if d_score == max_score:
            primary_style = "Dominance"
            description = "Quyết đoán, thích thách thức, hướng kết quả"
        elif i_score == max_score:
            primary_style = "Influence"
            description = "Giao tiếp tốt, lạc quan, thích tương tác xã hội"
        elif s_score == max_score:
            primary_style = "Steadiness"
            description = "Ổn định, kiên nhẫn, làm việc nhóm tốt"
        else:
            primary_style = "Compliance"
            description = "Cẩn thận, chính xác, tuân thủ quy trình"
        
        # Calculate secondary style
        scores_sorted = sorted([
            ("D", d_score), ("I", i_score), ("S", s_score), ("C", c_score)
        ], key=lambda x: x[1], reverse=True)
        
        secondary_style = scores_sorted[1][0] if len(scores_sorted) > 1 else None
        
        return {
            "primary_style": primary_style,
            "secondary_style": secondary_style,
            "description": description,
            "detailed_scores": {
                "dominance": d_score,
                "influence": i_score,
                "steadiness": s_score,
                "compliance": c_score
            },
            "style_ranking": [style[0] for style in scores_sorted]
        }
    
    def generate_printable_survey(self) -> Dict[str, Any]:
        """
        Tạo survey DISC có thể in ra để điền tay
        """
        survey_questions = [
            {
                "id": 1,
                "question": "Tôi thường tiếp cận vấn đề một cách:",
                "options": {
                    "D": "Quyết đoán và trực tiếp",
                    "I": "Lạc quan và nhiệt tình", 
                    "S": "Kiên nhẫn và ổn định",
                    "C": "Cẩn thận và phân tích"
                }
            },
            {
                "id": 2,
                "question": "Trong nhóm, tôi thường:",
                "options": {
                    "D": "Đưa ra quyết định nhanh chóng",
                    "I": "Động viên và truyền cảm hứng",
                    "S": "Lắng nghe và hỗ trợ",
                    "C": "Cung cấp thông tin chi tiết"
                }
            },
            {
                "id": 3,
                "question": "Khi gặp thách thức, tôi:",
                "options": {
                    "D": "Đối mặt trực tiếp và giải quyết",
                    "I": "Tìm kiếm sự hỗ trợ từ người khác",
                    "S": "Tìm giải pháp ổn định lâu dài", 
                    "C": "Phân tích kỹ lưỡng trước khi hành động"
                }
            }
        ]
        
        return {
            "success": True,
            "survey": {
                "title": "DISC Personality Assessment Survey",
                "instructions": "Chọn câu trả lời mô tả chính xác nhất về bạn. Điểm từ 1-10 cho mỗi đáp án.",
                "questions": survey_questions,
                "scoring_guide": {
                    "D": "Dominance - Thống trị",
                    "I": "Influence - Ảnh hưởng", 
                    "S": "Steadiness - Ổn định",
                    "C": "Compliance - Tuân thủ"
                }
            },
            "format": "printable",
            "timestamp": datetime.now().isoformat()
        }
    
    def get_csv_template(self) -> str:
        """
        Trả về template CSV cho DISC import
        """
        template = """candidate_id,Name,D,I,S,C,Notes
CAND001,Nguyen Van An,8,6,7,5,Sample data
CAND002,Tran Thi Mai,5,9,6,7,High influence score
CAND003,Le Hoang Duc,7,5,8,6,Balanced profile"""
        
        return template
    
    def get_status(self, candidate_id: str) -> Dict[str, Any]:
        """
        Lấy trạng thái xử lý DISC cho candidate
        """
        # Mock status - in real implementation would query database
        return {
            "candidate_id": candidate_id,
            "disc_status": "processed",
            "last_updated": datetime.now().isoformat(),
            "available_data": ["scores", "profile"],
            "source": "multiple"
        }
    
    def test_pipeline(self) -> Dict[str, Any]:
        """
        Test function để kiểm tra pipeline
        """
        test_scores = {
            "d_score": 8,
            "i_score": 6,
            "s_score": 7,
            "c_score": 5
        }
        
        validation = self.validate_disc_scores(test_scores)
        if validation["valid"]:
            profile = self.generate_disc_profile(validation["scores"])
            return {
                "test_status": "passed",
                "test_scores": test_scores,
                "generated_profile": profile,
                "validation": validation
            }
        else:
            return {
                "test_status": "failed",
                "error": validation["error"]
            }