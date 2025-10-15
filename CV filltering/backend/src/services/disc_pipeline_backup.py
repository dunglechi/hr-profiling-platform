"""
DISC Assessment External Data Pipeline
Hỗ trợ import file CSV/PDF/Excel và OCR ảnh survey
"""

import pandas as pd
import json
import base64
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from io import BytesIO
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DISCExternalPipeline:
    """
    Pipeline xử lý dữ liệu DISC từ các nguồn bên ngoài
    """
    
    # Standard DISC question mapping
    DISC_STANDARD_QUESTIONS = {
        "D": [
            "Tôi thích làm việc với những thách thức khó khăn",
            "Tôi thường đưa ra quyết định nhanh chóng",
            "Tôi thích kiểm soát tình hình",
            "Tôi không ngại đối đầu khi cần thiết",
            "Tôi thường là người đi đầu trong nhóm"
        ],
        "I": [
            "Tôi thích gặp gỡ người mới",
            "Tôi hay kể chuyện và chia sẻ",
            "Tôi thích làm việc nhóm",
            "Tôi lạc quan và tích cực",
            "Tôi thích được công nhận và khen ngợi"
        ],
        "S": [
            "Tôi thích sự ổn định và dự đoán được",
            "Tôi làm việc chậm rãi nhưng chắc chắn",
            "Tôi thích giúp đỡ người khác",
            "Tôi tránh xung đột",
            "Tôi thích làm việc trong môi trường thân thiện"
        ],
        "C": [
            "Tôi chú trọng đến chi tiết",
            "Tôi thích làm việc theo quy trình",
            "Tôi cần thông tin đầy đủ trước khi quyết định",
            "Tôi thích sự chính xác",
            "Tôi thường phân tích kỹ trước khi hành động"
        ]
    }
    
    def __init__(self):
        self.processing_log = []
        
    def validate_disc_scores(self, scores: Dict[str, float]) -> Dict[str, Any]:
        """
        Validate DISC scores format and values
        """
        validation_result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "normalized_scores": {}
        }
        
        required_dimensions = ["D", "I", "S", "C"]
        
        # Check required dimensions
        for dim in required_dimensions:
            if dim not in scores:
                validation_result["errors"].append(f"Missing DISC dimension: {dim}")
                validation_result["valid"] = False
            else:
                score = scores[dim]
                
                # Validate score range
                if not isinstance(score, (int, float)):
                    validation_result["errors"].append(f"Invalid score type for {dim}: {type(score)}")
                    validation_result["valid"] = False
                elif score < 0 or score > 100:
                    validation_result["errors"].append(f"Score out of range for {dim}: {score} (must be 0-100)")
                    validation_result["valid"] = False
                else:
                    validation_result["normalized_scores"][dim] = float(score)
        
        # Check total score distribution
        if validation_result["valid"]:
            total = sum(validation_result["normalized_scores"].values())
            if abs(total - 100) > 10:  # Allow 10% tolerance
                validation_result["warnings"].append(f"Total scores deviate from 100%: {total}%")
        
        return validation_result
    
    def process_csv_upload(self, csv_content: str, candidate_id: str) -> Dict[str, Any]:
        """
        Process CSV file upload với DISC scores
        Expected format: candidate_id,D,I,S,C,notes
        """
        try:
            # Parse CSV
            df = pd.read_csv(BytesIO(csv_content.encode()))
            
            result = {
                "success": False,
                "source": "csv",
                "candidate_id": candidate_id,
                "timestamp": datetime.now().isoformat(),
                "data": None,
                "errors": [],
                "warnings": []
            }
            
            # Validate CSV structure
            required_columns = ["candidate_id", "D", "I", "S", "C"]
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                result["errors"].append(f"Missing required columns: {missing_columns}")
                return result
            
            # Find candidate row
            candidate_row = df[df["candidate_id"] == candidate_id]
            
            if candidate_row.empty:
                result["errors"].append(f"Candidate ID {candidate_id} not found in CSV")
                return result
            
            # Extract DISC scores
            row = candidate_row.iloc[0]
            disc_scores = {
                "D": row["D"],
                "I": row["I"], 
                "S": row["S"],
                "C": row["C"]
            }
            
            # Validate scores
            validation = self.validate_disc_scores(disc_scores)
            
            if not validation["valid"]:
                result["errors"].extend(validation["errors"])
                return result
            
            # Calculate derived metrics
            derived_metrics = self.calculate_disc_metrics(validation["normalized_scores"])
            
            result.update({
                "success": True,
                "data": {
                    "raw_scores": validation["normalized_scores"],
                    "primary_style": derived_metrics["primary_style"],
                    "secondary_style": derived_metrics["secondary_style"],
                    "style_intensity": derived_metrics["style_intensity"],
                    "behavioral_description": derived_metrics["description"],
                    "notes": row.get("notes", ""),
                    "upload_method": "csv_file"
                },
                "warnings": validation["warnings"]
            })
            
            logger.info(f"CSV DISC data processed successfully for candidate {candidate_id}")
            return result
            
        except Exception as e:
            logger.error(f"CSV processing error for candidate {candidate_id}: {str(e)}")
            return {
                "success": False,
                "source": "csv",
                "candidate_id": candidate_id,
                "timestamp": datetime.now().isoformat(),
                "errors": [f"CSV processing error: {str(e)}"]
            }
    
    def process_manual_input(self, manual_data: Dict[str, Any], candidate_id: str) -> Dict[str, Any]:
        """
        Process manual DISC input từ recruiter
        """
        try:
            result = {
                "success": False,
                "source": "manual_input",
                "candidate_id": candidate_id,
                "timestamp": datetime.now().isoformat(),
                "data": None,
                "errors": [],
                "warnings": []
            }
            
            # Extract scores from manual input
            disc_scores = {
                "D": manual_data.get("d_score"),
                "I": manual_data.get("i_score"),
                "S": manual_data.get("s_score"),
                "C": manual_data.get("c_score")
            }
            
            # Validate scores
            validation = self.validate_disc_scores(disc_scores)
            
            if not validation["valid"]:
                result["errors"].extend(validation["errors"])
                return result
            
            # Calculate derived metrics
            derived_metrics = self.calculate_disc_metrics(validation["normalized_scores"])
            
            result.update({
                "success": True,
                "data": {
                    "raw_scores": validation["normalized_scores"],
                    "primary_style": derived_metrics["primary_style"],
                    "secondary_style": derived_metrics["secondary_style"],
                    "style_intensity": derived_metrics["style_intensity"],
                    "behavioral_description": derived_metrics["description"],
                    "notes": manual_data.get("notes", ""),
                    "recruiter_id": manual_data.get("recruiter_id"),
                    "upload_method": "manual_input"
                },
                "warnings": validation["warnings"]
            })
            
            logger.info(f"Manual DISC data processed successfully for candidate {candidate_id}")
            return result
            
        except Exception as e:
            logger.error(f"Manual input processing error for candidate {candidate_id}: {str(e)}")
            return {
                "success": False,
                "source": "manual_input",
                "candidate_id": candidate_id,
                "timestamp": datetime.now().isoformat(),
                "errors": [f"Manual input processing error: {str(e)}"]
            }
    
    def generate_printable_survey(self) -> Dict[str, Any]:
        """
        Tạo bảng khảo sát DISC có thể in để OCR
        """
        try:
            survey_template = {
                "title": "BẢNG KHẢO SÁT ĐÁNH GIÁ DISC",
                "instructions": [
                    "1. Đọc kỹ từng câu hỏi dưới đây",
                    "2. Đánh giá mức độ phù hợp với bản thân từ 1-5",
                    "3. Điền số vào ô vuông bên cạnh mỗi câu",
                    "4. Chụp ảnh rõ nét để upload vào hệ thống"
                ],
                "scale": {
                    "1": "Hoàn toàn không phù hợp",
                    "2": "Ít phù hợp", 
                    "3": "Trung bình",
                    "4": "Khá phù hợp",
                    "5": "Hoàn toàn phù hợp"
                },
                "questions": []
            }
            
            question_id = 1
            for dimension, questions in self.DISC_STANDARD_QUESTIONS.items():
                for question in questions:
                    survey_template["questions"].append({
                        "id": f"Q{question_id:02d}",
                        "dimension": dimension,
                        "text": question,
                        "score_box": "□"  # OCR detection box
                    })
                    question_id += 1
            
            # Add candidate info section
            survey_template["candidate_info"] = {
                "name": "Họ tên: ________________________",
                "date": "Ngày làm bài: _______________",
                "signature": "Chữ ký: ____________________"
            }
            
            # OCR processing instructions
            survey_template["ocr_instructions"] = [
                "📸 HƯỚNG DẪN CHỤP ẢNH CHO OCR:",
                "• Đặt giấy trên nền sáng, phẳng",
                "• Chụp vuông góc, không bị nghiêng",
                "• Đảm bảo ánh sáng đều, không có bóng",
                "• Chữ số trong ô vuông phải rõ nét",
                "• Upload file ảnh định dạng JPG/PNG"
            ]
            
            return {
                "success": True,
                "template": survey_template,
                "total_questions": len(survey_template["questions"]),
                "estimated_time": "10-15 phút",
                "ocr_ready": True
            }
            
        except Exception as e:
            logger.error(f"Survey generation error: {str(e)}")
            return {
                "success": False,
                "error": f"Lỗi tạo bảng khảo sát: {str(e)}"
            }
    
    def process_ocr_image(self, image_data: str, candidate_id: str) -> Dict[str, Any]:
        """
        Process OCR image upload (mock implementation)
        Trong thực tế sẽ tích hợp với OCR service như Tesseract, Google Vision API
        """
        try:
            # Mock OCR processing result
            # Trong thực tế sẽ gọi OCR service để extract text/numbers
            mock_ocr_result = {
                "detected_answers": {
                    "Q01": 4, "Q02": 5, "Q03": 3, "Q04": 4, "Q05": 4,  # D questions
                    "Q06": 3, "Q07": 2, "Q08": 3, "Q09": 4, "Q10": 2,  # I questions  
                    "Q11": 4, "Q12": 5, "Q13": 4, "Q14": 5, "Q15": 4,  # S questions
                    "Q16": 5, "Q17": 4, "Q18": 5, "Q19": 4, "Q20": 5   # C questions
                },
                "confidence_scores": {
                    "overall": 0.89,
                    "low_confidence_questions": ["Q07", "Q10"]
                }
            }
            
            # Calculate DISC scores from OCR answers
            dimension_scores = {"D": 0, "I": 0, "S": 0, "C": 0}
            questions_per_dimension = 5
            
            for q_id, score in mock_ocr_result["detected_answers"].items():
                q_num = int(q_id[1:])
                if q_num <= 5:
                    dimension_scores["D"] += score
                elif q_num <= 10:
                    dimension_scores["I"] += score
                elif q_num <= 15:
                    dimension_scores["S"] += score
                else:
                    dimension_scores["C"] += score
            
            # Normalize to percentage
            max_score_per_dimension = questions_per_dimension * 5
            normalized_scores = {
                dim: (score / max_score_per_dimension) * 100 
                for dim, score in dimension_scores.items()
            }
            
            # Validate OCR results
            validation = self.validate_disc_scores(normalized_scores)
            
            result = {
                "success": validation["valid"],
                "source": "ocr_image",
                "candidate_id": candidate_id,
                "timestamp": datetime.now().isoformat(),
                "ocr_metadata": {
                    "confidence": mock_ocr_result["confidence_scores"]["overall"],
                    "low_confidence_items": mock_ocr_result["confidence_scores"]["low_confidence_questions"],
                    "total_questions_detected": len(mock_ocr_result["detected_answers"])
                },
                "errors": validation.get("errors", []),
                "warnings": validation.get("warnings", [])
            }
            
            if validation["valid"]:
                derived_metrics = self.calculate_disc_metrics(validation["normalized_scores"])
                result["data"] = {
                    "raw_scores": validation["normalized_scores"],
                    "primary_style": derived_metrics["primary_style"],
                    "secondary_style": derived_metrics["secondary_style"],
                    "style_intensity": derived_metrics["style_intensity"],
                    "behavioral_description": derived_metrics["description"],
                    "upload_method": "ocr_image",
                    "requires_manual_review": mock_ocr_result["confidence_scores"]["overall"] < 0.8
                }
            
            if mock_ocr_result["confidence_scores"]["overall"] < 0.8:
                result["warnings"].append("Độ tin cậy OCR thấp - cần review thủ công")
            
            logger.info(f"OCR DISC processing completed for candidate {candidate_id} - Confidence: {mock_ocr_result['confidence_scores']['overall']}")
            
            return result
            
        except Exception as e:
            logger.error(f"OCR processing error for candidate {candidate_id}: {str(e)}")
            return {
                "success": False,
                "source": "ocr_image",
                "candidate_id": candidate_id,
                "timestamp": datetime.now().isoformat(),
                "errors": [f"OCR processing error: {str(e)}"]
            }
    
    def calculate_disc_metrics(self, scores: Dict[str, float]) -> Dict[str, Any]:
        """
        Calculate derived DISC metrics from raw scores
        """
        # Find primary and secondary styles
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary_style = sorted_scores[0][0]
        primary_score = sorted_scores[0][1]
        secondary_style = sorted_scores[1][0]
        secondary_score = sorted_scores[1][1]
        
        # Calculate style intensity
        style_intensity = "high" if primary_score > 70 else "moderate" if primary_score > 50 else "low"
        
        # Generate behavioral description
        style_descriptions = {
            "D": "Quyết đoán, thích thách thức, hướng đến kết quả",
            "I": "Tương tác, lạc quan, thích giao tiếp và làm việc nhóm",
            "S": "Ổn định, kiên nhẫn, hỗ trợ và hợp tác tốt",
            "C": "Cẩn thận, chính xác, thích phân tích và tuân thủ quy trình"
        }
        
        description = f"Phong cách chính: {style_descriptions[primary_style]}. "
        if secondary_score > 30:
            description += f"Phong cách phụ: {style_descriptions[secondary_style]}."
        
        return {
            "primary_style": primary_style,
            "secondary_style": secondary_style,
            "style_intensity": style_intensity,
            "description": description,
            "score_distribution": scores
        }

# Test the pipeline
if __name__ == "__main__":
    pipeline = DISCExternalPipeline()
    
    # Test CSV processing
    csv_content = """candidate_id,D,I,S,C,notes
123,75,65,45,80,Candidate shows strong analytical skills
456,60,85,70,50,Very social and team-oriented"""
    
    print("=== CSV Processing Test ===")
    result = pipeline.process_csv_upload(csv_content, "123")
    print(f"Success: {result['success']}")
    if result['success']:
        print(f"Primary style: {result['data']['primary_style']}")
        print(f"Description: {result['data']['behavioral_description']}")
    
    # Test manual input
    print("\n=== Manual Input Test ===")
    manual_data = {
        "d_score": 70,
        "i_score": 80,
        "s_score": 60,
        "c_score": 75,
        "notes": "Manual assessment by recruiter",
        "recruiter_id": "recruiter_001"
    }
    
    result = pipeline.process_manual_input(manual_data, "456")
    print(f"Success: {result['success']}")
    if result['success']:
        print(f"Primary style: {result['data']['primary_style']}")
    
    # Test survey generation
    print("\n=== Survey Generation Test ===")
    survey = pipeline.generate_printable_survey()
    print(f"Survey generated: {survey['success']}")
    print(f"Total questions: {survey['template']['total_questions']}")
    
    # Test OCR processing
    print("\n=== OCR Processing Test ===")
    result = pipeline.process_ocr_image("mock_image_data", "789")
    print(f"OCR Success: {result['success']}")
    if result['success']:
        print(f"OCR Confidence: {result['ocr_metadata']['confidence']}")
        print(f"Primary style: {result['data']['primary_style']}")