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
    
    def process_csv_data(self, csv_content: str, candidate_id: str, validation_rules: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Xử lý dữ liệu DISC từ CSV content
        """
        try:
            # Parse CSV
            df = pd.read_csv(io.StringIO(csv_content))
            
            # Validate CSV structure
            required_columns = ['Name', 'D', 'I', 'S', 'C']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                return {
                    "success": False,
                    "error": f"CSV thiếu các cột: {missing_columns}",
                    "required_columns": required_columns,
                    "found_columns": list(df.columns)
                }
            
            # Process each row
            processed_candidates = []
            for index, row in df.iterrows():
                disc_scores = {
                    "d_score": row['D'],
                    "i_score": row['I'],
                    "s_score": row['S'],
                    "c_score": row['C']
                }
                
                # Validate scores
                validation = self.validate_disc_scores(disc_scores)
                if validation["valid"]:
                    candidate_data = {
                        "name": row['Name'],
                        "disc_scores": validation["scores"],
                        "source": "csv_upload",
                        "row_index": index + 1
                    }
                    processed_candidates.append(candidate_data)
                else:
                    logger.warning(f"Invalid scores for row {index + 1}: {validation['error']}")
            
            return {
                "success": True,
                "candidate_id": candidate_id,
                "processed_count": len(processed_candidates),
                "total_rows": len(df),
                "candidates": processed_candidates,
                "source": "csv_pipeline",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Lỗi xử lý CSV: {str(e)}",
                "candidate_id": candidate_id
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
    
    def process_ocr_image(self, candidate_id: str, image_data: str, survey_format: str = "standard") -> Dict[str, Any]:
        """
        Xử lý ảnh survey DISC qua OCR (Mock implementation)
        """
        try:
            # Mock OCR processing - in real implementation, this would use actual OCR
            logger.info(f"Processing OCR image for candidate {candidate_id}")
            
            # Simulate OCR extraction (would be real OCR in production)
            mock_extracted_scores = {
                "d_score": 7.5,
                "i_score": 6.0,
                "s_score": 8.0,
                "c_score": 5.5
            }
            
            # Validate extracted scores
            validation = self.validate_disc_scores(mock_extracted_scores)
            if not validation["valid"]:
                return {
                    "success": False,
                    "error": f"OCR extraction invalid: {validation['error']}",
                    "candidate_id": candidate_id
                }
            
            # Generate profile
            profile = self.generate_disc_profile(validation["scores"])
            
            return {
                "success": True,
                "candidate_id": candidate_id,
                "disc_scores": validation["scores"],
                "disc_profile": profile,
                "source": "ocr_processing",
                "survey_format": survey_format,
                "extraction_confidence": 0.85,  # Mock confidence score
                "timestamp": datetime.now().isoformat(),
                "warnings": ["Đây là mock OCR - cần implement OCR thực tế cho production"]
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Lỗi OCR processing: {str(e)}",
                "candidate_id": candidate_id
            }
    
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
                    d_score = int(row['d_score'])
                    i_score = int(row['i_score'])
                    s_score = int(row['s_score'])
                    c_score = int(row['c_score'])

                    if not all(1 <= score <= 10 for score in [d_score, i_score, s_score, c_score]):
                        raise ValueError("Scores must be between 1 and 10.")

                    results["candidates"].append({
                        "candidate_id": row['candidate_id'],
                        "name": row['name'],
                        "scores": {"d": d_score, "i": i_score, "s": s_score, "c": c_score},
                        "source": "csv_upload",
                        "row_index": i + 2 # Account for header
                    })
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