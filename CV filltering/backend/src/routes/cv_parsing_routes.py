# backend/src/routes/cv_parsing_routes.py
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import tempfile
from ..services.cv_parsing_service import CvParsingService
from ..services.database_service import get_db_service
import logging

cv_parsing_bp = Blueprint('cv_parsing_bp', __name__)
service = CvParsingService()

# Removed UPLOAD_FOLDER - using tempfile instead for security and scalability

@cv_parsing_bp.route('/api/parse-cv', methods=['POST'])
def parse_cv_endpoint():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        
        # Use a temporary file to handle the upload securely in memory/temp storage
        # This avoids saving files permanently in the application directory
        fd, file_path = tempfile.mkstemp(suffix=os.path.splitext(filename)[1])
        
        try:
            # Write uploaded file to temporary location
            with os.fdopen(fd, 'wb') as tmp:
                file.save(tmp)
            
            # Parse CV using the temporary file
            result = service.parse_cv(file_path)

            # Save to database with correct data extraction
            if result:  # Ensure result is not None or empty
                db_service = get_db_service()
                summary_for_db = {
                    "name": result.get("personalInfo", {}).get("name"),
                    "email": result.get("personalInfo", {}).get("email"),
                    "phone": result.get("personalInfo", {}).get("phone"),
                    "ai_used": result.get("source", {}).get("aiUsed", False)
                }
                db_service.save_analysis(
                    candidate_id=result.get("candidateId", f"cv_{secure_filename(filename)}"),
                    source_type="cv_parsing",
                    raw_data=result,
                    summary=summary_for_db
                )
            
            # Return the parsed data directly, as per common API practice
            return jsonify(result), 200
            
        except Exception as e:
            logging.error(f"Error parsing CV {filename}: {e}", exc_info=True)
            return jsonify({"error": str(e)}), 500
        finally:
            # Clean up the temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
    
    return jsonify({"error": "Invalid file"}), 400
