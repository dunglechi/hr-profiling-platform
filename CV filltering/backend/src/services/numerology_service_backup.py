"""
Numerology Auto Calculation Service
Tính toán Thần số học tự động từ họ tên + ngày sinh
"""

from datetime import datetime
from typing import Optional, Dict, Any
import re
import unicodedata

class NumerologyService:
    """
    Dịch vụ tính toán Thần số học tự động
    """
    
    # Bảng chuyển đổi chữ cái thành số (Pythagorean system)
    LETTER_VALUES = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    }
    
    # Bảng chuyển đổi ký tự tiếng Việt
    VIETNAMESE_CHARS = {
        'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
        'Đ': 'D'
    }
    
    def __init__(self):
        self.calculation_log = []
    
    def normalize_vietnamese_name(self, name: str) -> str:
        """
        Chuẩn hóa tên tiếng Việt thành chữ cái Latin
        """
        if not name:
            return ""
            
        # Loại bỏ dấu và chuyển thành chữ hoa
        normalized = name.upper().strip()
        
        # Thay thế ký tự tiếng Việt
        for vn_char, latin_char in self.VIETNAMESE_CHARS.items():
            normalized = normalized.replace(vn_char, latin_char)
            normalized = normalized.replace(vn_char.lower(), latin_char)
        
        # Loại bỏ các ký tự không phải chữ cái và khoảng trắng
        normalized = re.sub(r'[^A-Z\s]', '', normalized)
        
        return normalized
    
    def calculate_name_number(self, full_name: str) -> Dict[str, Any]:
        """
        Tính số chủ đạo từ họ tên
        """
        try:
            normalized_name = self.normalize_vietnamese_name(full_name)
            
            if not normalized_name:
                return {
                    "success": False,
                    "error": "Tên không hợp lệ",
                    "value": None
                }
            
            # Tính tổng giá trị các chữ cái
            total = 0
            letter_breakdown = []
            
            for char in normalized_name:
                if char in self.LETTER_VALUES:
                    value = self.LETTER_VALUES[char]
                    total += value
                    letter_breakdown.append(f"{char}={value}")
            
            # Rút gọn về số đơn (trừ số 11, 22, 33)
            master_numbers = [11, 22, 33]
            life_path_number = total
            
            reduction_steps = [total]
            while life_path_number > 9 and life_path_number not in master_numbers:
                life_path_number = sum(int(digit) for digit in str(life_path_number))
                reduction_steps.append(life_path_number)
            
            return {
                "success": True,
                "value": life_path_number,
                "original_name": full_name,
                "normalized_name": normalized_name,
                "total_value": total,
                "reduction_steps": reduction_steps,
                "letter_breakdown": letter_breakdown,
                "calculation_method": "Pythagorean"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Lỗi tính toán: {str(e)}",
                "value": None
            }
    
    def calculate_birth_number(self, birth_date: str) -> Dict[str, Any]:
        """
        Tính số sinh từ ngày sinh (DD/MM/YYYY)
        """
        try:
            # Parse ngày sinh từ nhiều format
            date_formats = ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%m/%d/%Y']
            birth_dt = None
            
            for fmt in date_formats:
                try:
                    birth_dt = datetime.strptime(birth_date, fmt)
                    break
                except ValueError:
                    continue
            
            if not birth_dt:
                return {
                    "success": False,
                    "error": "Format ngày sinh không hợp lệ",
                    "value": None
                }
            
            # Tính tổng ngày + tháng + năm
            day = birth_dt.day
            month = birth_dt.month
            year = birth_dt.year
            
            total = day + month + year
            
            # Rút gọn về số đơn
            master_numbers = [11, 22, 33]
            birth_number = total
            
            reduction_steps = [total]
            while birth_number > 9 and birth_number not in master_numbers:
                birth_number = sum(int(digit) for digit in str(birth_number))
                reduction_steps.append(birth_number)
            
            return {
                "success": True,
                "value": birth_number,
                "birth_date": birth_date,
                "day": day,
                "month": month,
                "year": year,
                "total_value": total,
                "reduction_steps": reduction_steps
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Lỗi tính toán ngày sinh: {str(e)}",
                "value": None
            }
    
    def get_number_meaning(self, number: int) -> str:
        """
        Trả về ý nghĩa của số chủ đạo
        """
        meanings = {
            1: "Lãnh đạo, độc lập, sáng tạo, tiên phong",
            2: "Hợp tác, nhạy cảm, hòa hợp, làm việc nhóm",
            3: "Sáng tạo, giao tiếp, nghệ thuật, lạc quan",
            4: "Thực tế, kỷ luật, làm việc chăm chỉ, ổn định",
            5: "Tự do, phiêu lưu, linh hoạt, thích thay đổi",
            6: "Chăm sóc, trách nhiệm, gia đình, hòa hợp",
            7: "Nghiên cứu, phân tích, tâm linh, sâu sắc",
            8: "Thành công vật chất, quản lý, tham vọng",
            9: "Nhân đạo, rộng lượng, phục vụ cộng đồng",
            11: "Trực giác mạnh, cảm hứng, lãnh đạo tinh thần",
            22: "Kiến tạo vĩ đại, thực hiện ước mơ lớn",
            33: "Thầy giáo tâm linh, chữa lành, tình yêu vô điều kiện"
        }
        
        return meanings.get(number, "Số không xác định")
    
    def calculate_full_profile(self, name: str, birth_date: str) -> Dict[str, Any]:
        """
        Tính toán profile Thần số học đầy đủ
        """
        result = {
            "timestamp": datetime.now().isoformat(),
            "input": {
                "name": name,
                "birth_date": birth_date
            },
            "name_calculation": None,
            "birth_calculation": None,
            "combined_insight": None,
            "success": False,
            "warnings": []
        }
        
        # Kiểm tra dữ liệu đầu vào
        if not name or not name.strip():
            result["warnings"].append("Thiếu họ tên - không thể tính số chủ đạo")
        
        if not birth_date or not birth_date.strip():
            result["warnings"].append("Thiếu ngày sinh - không thể tính số sinh")
        
        # Tính số từ tên
        if name and name.strip():
            result["name_calculation"] = self.calculate_name_number(name)
        
        # Tính số từ ngày sinh
        if birth_date and birth_date.strip():
            result["birth_calculation"] = self.calculate_birth_number(birth_date)
        
        # Tạo insight tổng hợp
        if result["name_calculation"] and result["name_calculation"]["success"] and \
           result["birth_calculation"] and result["birth_calculation"]["success"]:
            
            name_number = result["name_calculation"]["value"]
            birth_number = result["birth_calculation"]["value"]
            
            result["combined_insight"] = {
                "life_path_number": name_number,
                "birth_number": birth_number,
                "life_path_meaning": self.get_number_meaning(name_number),
                "birth_meaning": self.get_number_meaning(birth_number),
                "compatibility_note": self._get_compatibility_insight(name_number, birth_number)
            }
            
            result["success"] = True
            
        elif len(result["warnings"]) == 0:
            result["warnings"].append("Lỗi không xác định trong quá trình tính toán")
        
        return result
    
    def _get_compatibility_insight(self, name_num: int, birth_num: int) -> str:
        """
        Tạo insight về sự tương thích giữa số chủ đạo và số sinh
        """
        if name_num == birth_num:
            return "Số chủ đạo và số sinh trùng nhau - tính cách nhất quán"
        
        compatibility_matrix = {
            (1, 8): "Kết hợp lãnh đạo và thành công vật chất tốt",
            (2, 6): "Hợp tác và chăm sóc - phù hợp công việc nhóm",
            (3, 5): "Sáng tạo và tự do - thích môi trường linh hoạt",
            (4, 8): "Kỷ luật và tham vọng - tiềm năng thành công cao",
            (7, 9): "Trí tuệ và nhân đạo - phù hợp nghiên cứu xã hội"
        }
        
        insight = compatibility_matrix.get((name_num, birth_num)) or \
                 compatibility_matrix.get((birth_num, name_num))
        
        if insight:
            return insight
        else:
            return f"Kết hợp số {name_num} và {birth_num} - cần phân tích thêm"

# Test service
if __name__ == "__main__":
    service = NumerologyService()
    
    # Test cases
    test_cases = [
        ("Nguyễn Văn An", "1990-05-15"),
        ("Trần Thị Bình", "1988-12-20"),
        ("", "1990-01-01"),  # Missing name
        ("Lê Văn Cường", ""),  # Missing birth date
        ("Phạm Thị Dung", "invalid-date")  # Invalid date
    ]
    
    for name, birth_date in test_cases:
        print(f"\n{'='*50}")
        print(f"Test: '{name}' - '{birth_date}'")
        print(f"{'='*50}")
        
        result = service.calculate_full_profile(name, birth_date)
        
        print(f"Success: {result['success']}")
        if result['warnings']:
            print(f"Warnings: {result['warnings']}")
        
        if result['combined_insight']:
            insight = result['combined_insight']
            print(f"Số chủ đạo: {insight['life_path_number']} - {insight['life_path_meaning']}")
            print(f"Số sinh: {insight['birth_number']} - {insight['birth_meaning']}")
            print(f"Tương thích: {insight['compatibility_note']}")