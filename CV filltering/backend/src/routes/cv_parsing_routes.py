# backend/src/routes/cv_parsing_routes.py
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from backend.src.services.cv_parsing_service import CvParsingService

cv_parsing_bp = Blueprint('cv_parsing_bp', __name__)
service = CvParsingService()

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@cv_parsing_bp.route('/api/parse-cv', methods=['POST'])
def parse_cv_endpoint():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        try:
            result = service.parse_cv(file_path)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            # Clean up the uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
