# -*- coding: utf-8 -*-
"""
DISC External Pipeline API Routes - CLEAN VERSION
Upload file, manual input, OCR processing endpoints với documented stub
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
        data = request.get_json()
        candidate_id = data.get('candidate_id')
        csv_data = data.get('csv_data')
        
        if not candidate_id:
            return jsonify({
                "success": False,
                "error": "Missing candidate_id parameter"
            }), 400
        
        if not csv_data:
            return jsonify({
                "success": False,
                "error": "Missing csv_data"
            }), 400
        
        # Process CSV với pipeline
        result = disc_pipeline.process_csv_data(csv_data, candidate_id, data.get('validation_rules'))
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"CSV upload error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"CSV processing failed: {str(e)}"
        }), 500

@disc_bp.route('/manual-input', methods=['POST'])
def manual_input_disc():
    """
    POST /api/disc/manual-input
    Manual input DISC scores by recruiter
    """
    try:
        data = request.get_json()
        candidate_id = data.get('candidate_id')
        
        if not candidate_id:
            return jsonify({
                "success": False,
                "error": "Missing candidate_id"
            }), 400
        
        # Process manual input
        result = disc_pipeline.process_manual_input(candidate_id, data)
        
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

@disc_bp.route('/generate-survey', methods=['GET'])
def generate_survey():
    """
    GET /api/disc/generate-survey
    Tạo bảng khảo sát DISC có thể in
    """
    try:
        result = disc_pipeline.generate_printable_survey()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Survey generation failed: {str(e)}"
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

@disc_bp.route('/status/<candidate_id>', methods=['GET'])
def get_disc_status(candidate_id):
    """
    GET /api/disc/status/<candidate_id>
    Lấy trạng thái xử lý DISC cho candidate
    """
    try:
        result = disc_pipeline.get_status(candidate_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error getting status: {str(e)}"
        }), 500

@disc_bp.route('/test', methods=['GET'])
def test_disc_pipeline():
    """
    GET /api/disc/test
    Test DISC pipeline functionality
    """
    try:
        result = disc_pipeline.test_pipeline()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Test failed: {str(e)}"
        }), 500

@disc_bp.route('/formats/csv-template', methods=['GET'])
def get_csv_template():
    """
    GET /api/disc/formats/csv-template
    Download CSV template for DISC data import
    """
    try:
        template = disc_pipeline.get_csv_template()
        return template, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="disc_template.csv"'
        }
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Template generation failed: {str(e)}"
        }), 500