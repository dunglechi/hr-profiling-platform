# -*- coding: utf-8 -*-
"""
Numerology Auto Calculation Service
Dịch vụ tính toán Thần số học tự động từ họ tên + ngày sinh
"""

from datetime import datetime
from typing import Optional, Dict, Any
import re
import unicodedata

class NumerologyService:
    """
    Dịch vụ tính toán Thần số học tự động từ tên và ngày sinh
    """
    
    # Bảng chuyển đổi chữ cái thành số (Pythagorean system)
    LETTER_VALUES = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    }
    
    # Bảng chuyển đổi ký tự tiếng Việt thành Latin
    VIETNAMESE_TO_LATIN = {
        # Chữ A có dấu
        'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        # Chữ E có dấu
        'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        # Chữ I có dấu
        'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        # Chữ O có dấu
        'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        # Chữ U có dấu
        'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        # Chữ Y có dấu
        'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
        # Chữ Đ
        'Đ': 'D'
    }
    
    def normalize_vietnamese_name(self, name: str) -> str:
        """
        Chuẩn hóa tên tiếng Việt thành chữ cái Latin để tính toán
        """
        if not name:
            return ""
        
        # Chuyển thành chữ hoa
        name = name.upper().strip()
        
        # Thay thế các ký tự tiếng Việt
        for vietnamese_char, latin_char in self.VIETNAMESE_TO_LATIN.items():
            name = name.replace(vietnamese_char, latin_char)
            # Cả chữ thường
            name = name.replace(vietnamese_char.lower(), latin_char)
        
        # Loại bỏ các ký tự không phải chữ cái và khoảng trắng
        name = re.sub(r'[^A-Z\s]', '', name)
        
        return name.strip()
    
    def calculate_name_number(self, name: str) -> Dict[str, Any]:
        """
        Tính số chủ đạo từ họ tên theo hệ thống Pythagorean
        """
        try:
            # Chuẩn hóa tên
            normalized_name = self.normalize_vietnamese_name(name)
            
            if not normalized_name:
                return {
                    "success": False,
                    "error": "Tên không hợp lệ sau khi chuẩn hóa",
                    "original_name": name
                }
            
            # Tính tổng giá trị các chữ cái
            total_value = 0
            letter_breakdown = []
            
            for char in normalized_name:
                if char != ' ' and char in self.LETTER_VALUES:
                    value = self.LETTER_VALUES[char]
                    total_value += value
                    letter_breakdown.append(f"{char}={value}")
            
            # Rút gọn về số đơn (trừ số Master 11, 22, 33)
            reduction_steps = [total_value]
            current_value = total_value
            
            while current_value > 9 and current_value not in [11, 22, 33]:
                current_value = sum(int(digit) for digit in str(current_value))
                reduction_steps.append(current_value)
            
            return {
                "success": True,
                "original_name": name,
                "normalized_name": normalized_name,
                "total_value": total_value,
                "value": current_value,
                "letter_breakdown": letter_breakdown,
                "reduction_steps": reduction_steps,
                "calculation_method": "Pythagorean"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Lỗi tính toán: {str(e)}",
                "original_name": name
            }
    
    def calculate_birth_number(self, birth_date: str) -> Dict[str, Any]:
        """
        Tính số sinh từ ngày sinh (Birth Number)
        """
        try:
            # Parse ngày sinh
            try:
                date_obj = datetime.strptime(birth_date, '%Y-%m-%d')
            except ValueError:
                try:
                    date_obj = datetime.strptime(birth_date, '%d/%m/%Y')
                except ValueError:
                    return {
                        "success": False,
                        "error": "Format ngày sinh không hợp lệ (cần YYYY-MM-DD hoặc DD/MM/YYYY)",
                        "birth_date": birth_date
                    }
            
            day = date_obj.day
            month = date_obj.month
            year = date_obj.year
            
            # Tính tổng
            total_value = day + month + year
            reduction_steps = [total_value]
            current_value = total_value
            
            # Rút gọn về số đơn (trừ số Master 11, 22, 33)
            while current_value > 9 and current_value not in [11, 22, 33]:
                current_value = sum(int(digit) for digit in str(current_value))
                reduction_steps.append(current_value)
            
            return {
                "success": True,
                "birth_date": birth_date,
                "day": day,
                "month": month,
                "year": year,
                "total_value": total_value,
                "value": current_value,
                "reduction_steps": reduction_steps
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Lỗi tính toán ngày sinh: {str(e)}",
                "birth_date": birth_date
            }
    
    def get_life_path_meaning(self, number: int) -> str:
        """
        Trả về ý nghĩa số chủ đạo
        """
        meanings = {
            1: "Lãnh đạo, độc lập, sáng tạo, tiên phong",
            2: "Hợp tác, hòa hợp, nhạy cảm, cân bằng",
            3: "Sáng tạo, giao tiếp, nghệ thuật, lạc quan",
            4: "Thực tế, tổ chức, kỷ luật, làm việc chăm chỉ",
            5: "Tự do, phiêu lưu, linh hoạt, khám phá",
            6: "Chăm sóc, trách nhiệm, gia đình, phục vụ",
            7: "Phân tích, tâm linh, nghiên cứu, trực giác",
            8: "Thành công vật chất, quyền lực, tổ chức",
            9: "Nhân đạo, từ bi, phục vụ cộng đồng",
            11: "Trực giác cao, thiên hướng tâm linh, lãnh đạo tinh thần",
            22: "Kiến trúc sư vĩ đại, tầm nhìn thực tế lớn",
            33: "Giáo viên tinh thần, thấu hiểu, yêu thương vô điều kiện"
        }
        return meanings.get(number, "Không xác định")
    
    def calculate_full_numerology(self, name: str, birth_date: str, candidate_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Tính toán đầy đủ Thần số học: số chủ đạo và số sinh
        """
        try:
            # Tính số chủ đạo từ tên
            name_result = self.calculate_name_number(name)
            
            # Tính số sinh từ ngày sinh
            birth_result = self.calculate_birth_number(birth_date)
            
            # Kiểm tra lỗi
            warnings = []
            if not name_result.get("success"):
                warnings.append(f"Lỗi tính toán từ tên: {name_result.get('error')}")
            
            if not birth_result.get("success"):
                warnings.append(f"Lỗi tính toán từ ngày sinh: {birth_result.get('error')}")
            
            if warnings:
                return {
                    "success": False,
                    "candidate_id": candidate_id,
                    "warnings": warnings,
                    "status": "not-calculated"
                }
            
            # Lấy kết quả
            life_path_number = name_result["value"]
            birth_number = birth_result["value"]
            
            # Phân tích tương thích
            compatibility_note = ""
            if life_path_number == birth_number:
                compatibility_note = "Số chủ đạo và số sinh trùng nhau - tính cách nhất quán"
            elif abs(life_path_number - birth_number) <= 2:
                compatibility_note = "Số chủ đạo và số sinh hài hòa - cân bằng tốt"
            else:
                compatibility_note = "Số chủ đạo và số sinh khác biệt - có thể có xung đột nội tâm"
            
            return {
                "success": True,
                "candidate_id": candidate_id,
                "data": {
                    "life_path_number": life_path_number,
                    "birth_number": birth_number,
                    "life_path_meaning": self.get_life_path_meaning(life_path_number),
                    "birth_meaning": self.get_life_path_meaning(birth_number),
                    "compatibility_note": compatibility_note
                },
                "calculation_details": {
                    "name_calculation": name_result,
                    "birth_calculation": birth_result
                },
                "status": "available",
                "timestamp": datetime.now().isoformat(),
                "warnings": []
            }
            
        except Exception as e:
            return {
                "success": False,
                "candidate_id": candidate_id,
                "error": f"Lỗi hệ thống khi tính toán Thần số học: {str(e)}",
                "status": "not-calculated",
                "warnings": [f"Lỗi hệ thống: {str(e)}"]
            }
    
    def manual_input(self, candidate_id: str, numerology_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Nhập thủ công dữ liệu Thần số học cho trường hợp không thể tính tự động
        """
        try:
            # Validate required fields for manual input
            if not candidate_id:
                return {
                    "success": False,
                    "error": "candidate_id là bắt buộc cho manual input"
                }
            
            # Accept manual calculation with validation
            manual_data = {
                "life_path_number": numerology_data.get("numerology_score"),
                "manual_input": True,
                "notes": numerology_data.get("notes", "Manual calculation"),
                "input_method": "manual"
            }
            
            return {
                "success": True,
                "candidate_id": candidate_id,
                "data": manual_data,
                "status": "manual-input",
                "timestamp": datetime.now().isoformat(),
                "warnings": ["Dữ liệu được nhập thủ công - cần xác minh"]
            }
            
        except Exception as e:
            return {
                "success": False,
                "candidate_id": candidate_id,
                "error": f"Lỗi manual input: {str(e)}",
                "status": "error"
            }

    def test_vietnamese_processing(self) -> Dict[str, Any]:
        """
        Test function để kiểm tra xử lý tiếng Việt
        """
        test_names = [
            "Nguyễn Văn An",
            "Trần Thị Bảo",
            "Lê Hoàng Đức",
            "Phạm Minh Châu",
            "Võ Thị Xuân"
        ]
        
        results = []
        for name in test_names:
            normalized = self.normalize_vietnamese_name(name)
            name_calc = self.calculate_name_number(name)
            results.append({
                "original": name,
                "normalized": normalized,
                "calculation": name_calc
            })
        
        return {
            "test_results": results,
            "status": "Vietnamese processing test completed"
        }