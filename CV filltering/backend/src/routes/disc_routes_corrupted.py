"""
DISC External Pipeline API Routes
Upload file, manual input, OCR processing endpoints
"""

from flask import Blueprint, request, jsonify, send_file
from services.disc_pipeline import DISCExternalPipeline
from services.ocr_service import DISCOCRService
from werkzeug.utils import secure_filename
import logging
import tempfile
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

disc_bp = Blueprint('disc', __name__, url_prefix='/api/disc')
disc_pipeline = DISCExternalPipeline()
ocr_service = DISCOCRService()

@disc_bp.route('/upload-csv', methods=['POST'])
def upload_csv_disc():
    """
    POST /api/disc/upload-csv
    Upload CSV file với DISC scores
    """
    try:
        candidate_id = request.form.get('candidate_id')
        
        if not candidate_id:
            return jsonify({
                "success": False,
                "error": "Missing candidate_id parameter"
            }), 400
        
        # Check if file uploaded
        if 'file' not in request.files:
            return jsonify({
                "success": False,
                "error": "No file uploaded"
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No file selected"
            }), 400
        
        # Validate file type
        if not file.filename.lower().endswith('.csv'):
            return jsonify({
                "success": False,
                "error": "Only CSV files are supported"
            }), 400
        
        # Read file content
        csv_content = file.read().decode('utf-8')
        
        # Process CSV
        result = disc_pipeline.process_csv_upload(csv_content, candidate_id)
        
        # Log activity
        logger.info(f"CSV DISC upload - Candidate: {candidate_id}, Success: {result['success']}")
        
        if result['success']:
            return jsonify({
                "success": True,
                "message": "CSV DISC data processed successfully",
                "data": result['data'],
                "source": "csv_upload",
                "timestamp": result['timestamp'],
                "warnings": result.get('warnings', [])
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "CSV processing failed",
                "details": result['errors'],
                "timestamp": result['timestamp']
            }), 422
            
    except Exception as e:
        logger.error(f"CSV upload error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "details": [str(e)]
        }), 500

@disc_bp.route('/manual-input', methods=['POST'])
def manual_input_disc():
    """
    POST /api/disc/manual-input
    Manual input DISC scores by recruiter
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Missing request data"
            }), 400
        
        candidate_id = data.get('candidate_id')
        
        if not candidate_id:
            return jsonify({
                "success": False,
                "error": "Missing candidate_id"
            }), 400
        
        # Validate required DISC scores
        required_scores = ['d_score', 'i_score', 's_score', 'c_score']
        missing_scores = [score for score in required_scores if score not in data]
        
        if missing_scores:
            return jsonify({
                "success": False,
                "error": f"Missing DISC scores: {missing_scores}"
            }), 400
        
        # Process manual input
        result = disc_pipeline.process_manual_input(data, candidate_id)
        
        # Log activity
        logger.info(f"Manual DISC input - Candidate: {candidate_id}, Success: {result['success']}")
        
        if result['success']:
            return jsonify({
                "success": True,
                "message": "Manual DISC data processed successfully",
                "data": result['data'],
                "source": "manual_input",
                "timestamp": result['timestamp'],
                "warnings": result.get('warnings', [])
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Manual input processing failed",
                "details": result['errors'],
                "timestamp": result['timestamp']
            }), 422
            
    except Exception as e:
        logger.error(f"Manual input error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "details": [str(e)]
        }), 500

@disc_bp.route('/generate-survey', methods=['GET'])
def generate_survey():
    """
    GET /api/disc/generate-survey
    Tạo bảng khảo sát DISC có thể in
    """
    try:
        result = disc_pipeline.generate_printable_survey()
        
        if result['success']:
            return jsonify({
                "success": True,
                "survey_template": result['template'],
                "metadata": {
                    "total_questions": result['total_questions'],
                    "estimated_time": result['estimated_time'],
                    "ocr_ready": result['ocr_ready']
                },
                "download_instructions": {
                    "format": "PDF",
                    "print_settings": "A4, Portrait, 100% scale",
                    "ocr_guidelines": result['template']['ocr_instructions']
                }
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result['error']
            }), 500
            
    except Exception as e:
        logger.error(f"Survey generation error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@disc_bp.route('/upload-ocr-image', methods=['POST'])
def upload_ocr_image():
    """
    POST /api/disc/upload-ocr-image
    Upload ảnh survey để OCR processing với documented stub
    """
    try:
        data = request.get_json()
        candidate_id = data.get('candidate_id')
        image_base64 = data.get('image_base64')
        survey_format = data.get('survey_format', 'standard')
        
        if not candidate_id:
            return jsonify({
                "success": False,
                "error": "Missing candidate_id parameter"
            }), 400
        
        if not image_base64:
            return jsonify({
                "success": False,
                "error": "Missing image_base64 data"
            }), 400
        
        # Process với documented OCR service
        result = ocr_service.process_disc_survey_image(
            image_base64=image_base64,
            candidate_id=candidate_id,
            survey_format=survey_format
        )
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"OCR processing error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"OCR processing failed: {str(e)}"
        }), 500

@disc_bp.route('/ocr/samples', methods=['GET'])
def get_ocr_samples():
    """
    GET /api/disc/ocr/samples
    Lấy sample images và expected outputs cho testing
    """
    try:
        samples = ocr_service.get_sample_images()
        return jsonify(samples), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error getting samples: {str(e)}"
        }), 500

@disc_bp.route('/ocr/integration-guide', methods=['GET'])
def get_ocr_integration_guide():
    """
    GET /api/disc/ocr/integration-guide
    Hướng dẫn integration với real OCR service
    """
    try:
        guide = ocr_service.get_integration_guide()
        return jsonify(guide), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error getting integration guide: {str(e)}"
        }), 500
                "error": "No image selected"
            }), 400
        
        # Validate image type
        allowed_extensions = ['jpg', 'jpeg', 'png', 'bmp']
        file_extension = image_file.filename.lower().split('.')[-1]
        
        if file_extension not in allowed_extensions:
            return jsonify({
                "success": False,
                "error": f"Unsupported image format. Allowed: {allowed_extensions}"
            }), 400
        
        # Read image data (mock - in real implementation would process actual image)
        image_data = image_file.read()
        
        # Process OCR (mock implementation)
        result = disc_pipeline.process_ocr_image(str(image_data), candidate_id)
        
        # Log activity
        logger.info(f"OCR DISC upload - Candidate: {candidate_id}, Success: {result['success']}")
        
        if result['success']:
            response = {
                "success": True,
                "message": "OCR DISC processing completed",
                "data": result['data'],
                "ocr_metadata": result['ocr_metadata'],
                "source": "ocr_image",
                "timestamp": result['timestamp'],
                "warnings": result.get('warnings', [])
            }
            
            # Add manual review flag if confidence is low
            if result.get('data', {}).get('requires_manual_review'):
                response["manual_review_required"] = True
                response["message"] += " - Manual review recommended due to low OCR confidence"
            
            return jsonify(response), 200
        else:
            return jsonify({
                "success": False,
                "error": "OCR processing failed",
                "details": result['errors'],
                "timestamp": result['timestamp']
            }), 422
            
    except Exception as e:
        logger.error(f"OCR upload error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "details": [str(e)]
        }), 500

@disc_bp.route('/status/<candidate_id>', methods=['GET'])
def get_disc_status(candidate_id):
    """
    GET /api/disc/status/<candidate_id>
    Kiểm tra trạng thái DISC của ứng viên
    """
    try:
        # TODO: Integrate with database to get candidate DISC status
        # For now, return mock status
        
        logger.info(f"DISC status check for candidate {candidate_id}")
        
        # Mock response - would query database in real implementation
        mock_status = {
            "candidate_id": candidate_id,
            "disc_status": "missing",  # available | missing | pending
            "last_update": None,
            "data_source": None,  # csv | manual | ocr
            "available_input_methods": [
                {
                    "method": "csv_upload",
                    "endpoint": "/api/disc/upload-csv",
                    "description": "Upload CSV file với DISC scores"
                },
                {
                    "method": "manual_input", 
                    "endpoint": "/api/disc/manual-input",
                    "description": "Nhập tay điểm số DISC"
                },
                {
                    "method": "ocr_survey",
                    "steps": [
                        "Generate survey: GET /api/disc/generate-survey",
                        "Print and fill survey",
                        "Upload image: POST /api/disc/upload-ocr-image"
                    ],
                    "description": "In bảng khảo sát và OCR xử lý"
                }
            ]
        }
        
        return jsonify(mock_status), 200
        
    except Exception as e:
        logger.error(f"DISC status check error: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error"
        }), 500

@disc_bp.route('/test', methods=['GET'])
def test_disc_pipeline():
    """
    GET /api/disc/test
    Test all DISC pipeline functions
    """
    try:
        test_results = {
            "pipeline_status": "operational",
            "tests": {},
            "timestamp": disc_pipeline.calculate_disc_metrics({"D": 70, "I": 80, "S": 60, "C": 75})
        }
        
        # Test CSV processing
        csv_content = """candidate_id,D,I,S,C,notes
test123,75,65,45,80,Test candidate data"""
        
        csv_result = disc_pipeline.process_csv_upload(csv_content, "test123")
        test_results["tests"]["csv_processing"] = {
            "success": csv_result["success"],
            "primary_style": csv_result.get("data", {}).get("primary_style") if csv_result["success"] else None
        }
        
        # Test manual input
        manual_data = {
            "d_score": 70,
            "i_score": 80, 
            "s_score": 60,
            "c_score": 75,
            "notes": "Test manual input"
        }
        
        manual_result = disc_pipeline.process_manual_input(manual_data, "test456")
        test_results["tests"]["manual_input"] = {
            "success": manual_result["success"],
            "primary_style": manual_result.get("data", {}).get("primary_style") if manual_result["success"] else None
        }
        
        # Test survey generation
        survey_result = disc_pipeline.generate_printable_survey()
        test_results["tests"]["survey_generation"] = {
            "success": survey_result["success"],
            "question_count": survey_result.get("total_questions") if survey_result["success"] else None
        }
        
        # Test OCR processing (mock)
        ocr_result = disc_pipeline.process_ocr_image("mock_image", "test789")
        test_results["tests"]["ocr_processing"] = {
            "success": ocr_result["success"],
            "confidence": ocr_result.get("ocr_metadata", {}).get("confidence") if ocr_result["success"] else None
        }
        
        return jsonify(test_results), 200
        
    except Exception as e:
        logger.error(f"DISC test error: {str(e)}", exc_info=True)
        return jsonify({
            "pipeline_status": "error",
            "error": str(e)
        }), 500

@disc_bp.route('/formats/csv-template', methods=['GET'])
def download_csv_template():
    """
    GET /api/disc/formats/csv-template
    Download CSV template for DISC data
    """
    try:
        # Create CSV template content
        csv_template = """candidate_id,D,I,S,C,notes
example_001,75,65,55,80,Analytical and detail-oriented
example_002,60,85,70,50,Social and team-focused
# candidate_id: Unique identifier for candidate
# D: Dominance score (0-100)
# I: Influence score (0-100)  
# S: Steadiness score (0-100)
# C: Conscientiousness score (0-100)
# notes: Optional notes about the assessment"""
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as f:
            f.write(csv_template)
            temp_filename = f.name
        
        return send_file(
            temp_filename,
            as_attachment=True,
            download_name='disc_upload_template.csv',
            mimetype='text/csv'
        )
        
    except Exception as e:
        logger.error(f"CSV template download error: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Template generation failed"
        }), 500
    finally:
        # Clean up temp file
        if 'temp_filename' in locals():
            try:
                os.unlink(temp_filename)
            except:
                pass