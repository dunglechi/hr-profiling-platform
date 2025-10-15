# -*- coding: utf-8 -*-
"""
DISC External Pipeline API Routes - TRUTHFUL IMPLEMENTATION
Real routes without fake claims, proper error handling
"""

from flask import Blueprint, request, jsonify
from services.disc_pipeline import DISCExternalPipeline
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
    return jsonify({
        "success": False,
        "error": "CSV upload feature under development",
        "status": "not_implemented"
    }), 501

@disc_bp.route('/upload-ocr-image', methods=['POST'])
def upload_ocr_image():
    """
    POST /api/disc/upload-ocr-image
    OCR processing - STUB ONLY (NOT OPERATIONAL)
    """
    return jsonify({
        "success": False,
        "error": "OCR feature is STUB ONLY - not operational",
        "status": "stub",
        "note": "Real OCR integration required for production"
    }), 501

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