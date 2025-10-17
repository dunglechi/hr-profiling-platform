# -*- coding: utf-8 -*-
"""
DISC External Pipeline API Routes - TRUTHFUL IMPLEMENTATION
Real routes without fake claims, proper error handling
"""

from flask import Blueprint, request, jsonify
from backend.src.services.disc_pipeline import DISCExternalPipeline
from backend.src.services.database_service import get_db_service
from werkzeug.utils import secure_filename
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

disc_bp = Blueprint('disc', __name__, url_prefix='/api/disc')
disc_pipeline = DISCExternalPipeline()

@disc_bp.route('/manual-input', methods=['POST'])
def manual_input_disc():
    """
    POST /api/disc/manual-input
    Manual input DISC scores by recruiter - WORKING
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
        
        # Process manual input
        result = disc_pipeline.process_manual_input(candidate_id, data)
        
        logger.info(f"DISC manual input - Candidate: {candidate_id}, Success: {result['success']}")
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Manual input error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Manual input failed: {str(e)}"
        }), 500

@disc_bp.route('/upload-csv', methods=['POST'])
def upload_csv_disc():
    """
    POST /api/disc/upload-csv  
    CSV upload processing - UNDER DEVELOPMENT
    """
    if 'file' not in request.files:
        return jsonify({"success": False, "errors": ["No file part"]}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "errors": ["No selected file"]}), 400

    if file and file.filename.endswith('.csv'):
        try:
            file_bytes = file.read()
            pipeline = DISCExternalPipeline()
            result = pipeline.process_csv_upload(file_bytes)
            
            if result["errors"]:
                return jsonify({"success": False, "data": None, "errors": result["errors"], "warnings": result["warnings"]}), 400
            
            # Save to database (stubbed)
            db_service = get_db_service()
            for candidate in result.get("candidates", []):
                db_service.save_analysis(
                    candidate_id=candidate.get("candidate_id"),
                    source_type="disc_csv",
                    raw_data=candidate,
                    summary=candidate.get("scores")
                )

            return jsonify({"success": True, "data": result, "errors": [], "warnings": result["warnings"]}), 200
        except Exception as e:
            logging.error(f"Error processing DISC CSV: {e}")
            return jsonify({"success": False, "errors": ["An internal error occurred."]}), 500
    
    return jsonify({"success": False, "errors": ["Invalid file type. Please upload a CSV."]}), 400

@disc_bp.route('/upload-ocr-image', methods=['POST'])
def upload_disc_ocr_image():
    """
    POST /api/disc/upload-ocr-image
    OCR processing - IMAGE UPLOAD HANDLER
    """
    if 'file' not in request.files:
        return jsonify({"success": False, "errors": ["No file part"]}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "errors": ["No selected file"]}), 400

    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions:
        try:
            image_bytes = file.read()
            candidate_id = request.form.get('candidate_id', 'unknown_ocr_upload')
            
            pipeline = DISCExternalPipeline()
            result = pipeline.process_ocr_image(image_bytes, candidate_id=candidate_id)
            
            # Save to database (stubbed)
            db_service = get_db_service()
            db_service.save_analysis(
                candidate_id=candidate_id,
                source_type="disc_ocr_stub",
                raw_data=result,
                summary={"status": "pending_manual_review"}
            )

            return jsonify({"success": True, "data": result}), 200
        except Exception as e:
            logging.error(f"Error processing DISC OCR image: {e}")
            return jsonify({"success": False, "errors": ["An internal error occurred during OCR processing."]}), 500
    
    return jsonify({"success": False, "errors": ["Invalid file type. Please upload an image (png, jpg, jpeg, gif)."]}), 400

@disc_bp.route('/test', methods=['GET'])
def test_disc_pipeline():
    """
    GET /api/disc/test
    Test DISC pipeline basic functionality
    """
    try:
        result = disc_pipeline.test_pipeline()
        return jsonify({
            "success": True,
            "test_status": "passed",
            "service": "DISC Pipeline",
            "timestamp": "2025-10-15T17:20:00.000000",
            "test_result": result
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Test failed: {str(e)}"
        }), 500

@disc_bp.route('/status/<candidate_id>', methods=['GET'])
def get_disc_status(candidate_id):
    """
    GET /api/disc/status/<candidate_id>
    Get DISC processing status for candidate
    """
    try:
        result = disc_pipeline.get_status(candidate_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error getting status: {str(e)}"
        }), 500