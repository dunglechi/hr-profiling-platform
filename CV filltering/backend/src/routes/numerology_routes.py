"""
Numerology API Routes
Auto calculation endpoints
"""

from flask import Blueprint, request, jsonify
from services.numerology_service import NumerologyService
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

numerology_bp = Blueprint('numerology', __name__, url_prefix='/api/numerology')
numerology_service = NumerologyService()

@numerology_bp.route('/calculate', methods=['POST'])
def calculate_numerology():
    """
    POST /api/numerology/calculate
    Tính toán Thần số học từ họ tên + ngày sinh
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Missing request data",
                "warnings": ["Dữ liệu yêu cầu không hợp lệ"]
            }), 400
        
        name = data.get('name', '').strip()
        birth_date = data.get('birth_date', '').strip()
        candidate_id = data.get('candidate_id')
        
        # Log request
        logger.info(f"Numerology calculation request - Candidate ID: {candidate_id}, Name: {'***' if name else 'MISSING'}, Birth Date: {'***' if birth_date else 'MISSING'}")
        
        # Validate required fields for full calculation
        if not name and not birth_date:
            logger.warning(f"Numerology calculation failed - Both name and birth_date missing for candidate {candidate_id}")
            return jsonify({
                "success": False,
                "error": "Thiếu dữ liệu bắt buộc",
                "warnings": [
                    "Thiếu họ tên - không thể tính số chủ đạo",
                    "Thiếu ngày sinh - không thể tính số sinh"
                ],
                "status": "missing-data",
                "required_fields": ["name", "birth_date"]
            }), 422
        
        # Calculate numerology profile
        result = numerology_service.calculate_full_numerology(name, birth_date, candidate_id)
        
        # Determine status based on calculation success
        if result["success"]:
            status = "available"
            logger.info(f"Numerology calculation successful for candidate {candidate_id}")
        elif result["warnings"]:
            status = "missing-data"
            logger.warning(f"Numerology calculation incomplete for candidate {candidate_id}: {result['warnings']}")
        else:
            status = "not-calculated"
            logger.error(f"Numerology calculation failed for candidate {candidate_id}")
        
        # Enhanced response
        response = {
            "success": result["success"],
            "status": status,
            "data": result.get("combined_insight"),
            "calculation_details": {
                "name_calculation": result.get("name_calculation"),
                "birth_calculation": result.get("birth_calculation")
            },
            "warnings": result.get("warnings", []),
            "timestamp": result["timestamp"],
            "candidate_id": candidate_id
        }
        
        # Add manual input suggestion if missing data
        if status == "missing-data":
            response["manual_input_options"] = {
                "name_required": not name,
                "birth_date_required": not birth_date,
                "form_endpoint": "/api/numerology/manual-input",
                "instructions": "Recruiter có thể nhập tay dữ liệu thiếu để hoàn tất tính toán"
            }
        
        return jsonify(response), 200 if result["success"] else 422
        
    except Exception as e:
        logger.error(f"Numerology calculation error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "warnings": ["Lỗi hệ thống khi tính toán Thần số học"],
            "status": "not-calculated"
        }), 500

@numerology_bp.route('/manual-input', methods=['POST'])
def manual_input_numerology():
    """
    POST /api/numerology/manual-input
    Cho phép recruiter nhập tay dữ liệu thiếu
    """
    try:
        data = request.get_json()
        
        candidate_id = data.get('candidate_id')
        manual_name = data.get('manual_name', '').strip()
        manual_birth_date = data.get('manual_birth_date', '').strip()
        recruiter_notes = data.get('recruiter_notes', '').strip()
        
        logger.info(f"Manual numerology input - Candidate ID: {candidate_id}")
        
        if not manual_name and not manual_birth_date:
            return jsonify({
                "success": False,
                "error": "Ít nhất một trường (họ tên hoặc ngày sinh) phải được nhập"
            }), 400
        
        # Calculate with manual data  
        result = numerology_service.calculate_full_numerology(manual_name, manual_birth_date, candidate_id)
        
        # Log manual input activity
        activity_log = {
            "timestamp": result["timestamp"],
            "type": "manual_numerology_input",
            "candidate_id": candidate_id,
            "data_provided": {
                "name": bool(manual_name),
                "birth_date": bool(manual_birth_date)
            },
            "recruiter_notes": recruiter_notes,
            "calculation_success": result["success"]
        }
        
        logger.info(f"Manual numerology input completed - Candidate: {candidate_id}, Success: {result['success']}")
        
        response = {
            "success": result["success"],
            "status": "available" if result["success"] else "manual-input-failed",
            "data": result.get("combined_insight"),
            "manual_input_log": activity_log,
            "warnings": result.get("warnings", []),
            "timestamp": result["timestamp"]
        }
        
        return jsonify(response), 200 if result["success"] else 422
        
    except Exception as e:
        logger.error(f"Manual numerology input error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "status": "manual-input-failed"
        }), 500

@numerology_bp.route('/status/<candidate_id>', methods=['GET'])
def get_numerology_status(candidate_id):
    """
    GET /api/numerology/status/<candidate_id>
    Kiểm tra trạng thái Thần số học của ứng viên
    """
    try:
        # TODO: Integrate with database to get candidate data
        # For now, return mock status
        
        logger.info(f"Numerology status check for candidate {candidate_id}")
        
        # Mock response - would query database in real implementation
        mock_status = {
            "candidate_id": candidate_id,
            "numerology_status": "missing-data",  # available | missing-data | not-calculated
            "last_calculation": None,
            "missing_fields": ["name", "birth_date"],
            "manual_input_available": True
        }
        
        return jsonify(mock_status), 200
        
    except Exception as e:
        logger.error(f"Numerology status check error: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error"
        }), 500

@numerology_bp.route('/test', methods=['GET'])
def test_numerology():
    """
    GET /api/numerology/test
    Test endpoint để kiểm tra service
    """
    try:
        test_cases = [
            {"name": "Nguyễn Văn An", "birth_date": "1990-05-15"},
            {"name": "Trần Thị Bình", "birth_date": "1988-12-20"},
            {"name": "", "birth_date": "1990-01-01"},  # Missing name
            {"name": "Lê Văn Cường", "birth_date": ""}  # Missing birth date
        ]
        
        results = []
        for test_case in test_cases:
            result = numerology_service.calculate_full_numerology(
                test_case["name"], 
                test_case["birth_date"]
            )
            results.append({
                "input": test_case,
                "output": result
            })
        
        return jsonify({
            "service_status": "operational",
            "test_results": results,
            "timestamp": numerology_service.calculate_full_numerology("", "")["timestamp"]
        }), 200
        
    except Exception as e:
        logger.error(f"Numerology test error: {str(e)}", exc_info=True)
        return jsonify({
            "service_status": "error",
            "error": str(e)
        }), 500