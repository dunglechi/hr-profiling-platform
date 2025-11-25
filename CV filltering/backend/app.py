import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables FIRST, before importing services
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile
import logging

# Import services (AFTER loading .env)
from services.cv_parsing_service import CVParsingService
from services.numerology_service import NumerologyService
from services.database_service import DatabaseService


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'pdf', 'docx'}

# Initialize services
cv_parser = CVParsingService()
numerology = NumerologyService()
database = DatabaseService()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'CV Screening API',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/parse-cv', methods=['POST'])
def parse_cv():
    try:
        # Check if file is in request
        if 'cv_file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400

        file = request.files['cv_file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'File type not supported. Please upload PDF or DOCX files only.'
            }), 400

        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file.filename.rsplit(".", 1)[1].lower()}') as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

        try:
            logger.info(f"Processing file: {file.filename}")
            
            # Step 1: Parse CV text
            cv_text = cv_parser.parse_file(temp_file_path)
            logger.info("CV text extracted successfully")
            
            # Step 2: Extract structured data with Gemini AI
            structured_data = cv_parser.extract_structured_data(cv_text)
            logger.info("Structured data extracted with AI")
            
            # Step 3: Calculate numerology insights
            numerology_insights = numerology.calculate_insights(
                structured_data.get('personalInfo', {}).get('name', ''),
                structured_data.get('personalInfo', {}).get('dateOfBirth', '')
            )
            logger.info("Numerology analysis completed")
            
            # Step 4: Combine all data
            result_data = {
                'personalInfo': structured_data.get('personalInfo', {}),
                'experience': structured_data.get('experience', []),
                'education': structured_data.get('education', []),
                'skills': structured_data.get('skills', []),
                'numerologyInsights': numerology_insights
            }
            
            # Step 5: Save to database (optional)
            try:
                database.save_cv_analysis(result_data, file.filename)
                logger.info("Data saved to database")
            except Exception as db_error:
                logger.warning(f"Database save failed: {db_error}")
                # Continue without database - don't fail the request
            
            return jsonify({
                'success': True,
                'data': result_data,
                'message': 'CV analyzed successfully'
            })

        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except Exception as e:
        logger.error(f"CV parsing error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def api_health():
    """Extended health check with service status"""
    try:
        # Test services
        services_status = {
            'cv_parser': cv_parser.test_connection(),
            'numerology': numerology.test_service(),
            'database': database.test_connection()
        }
        
        all_healthy = all(services_status.values())
        
        return jsonify({
            'status': 'healthy' if all_healthy else 'degraded',
            'services': services_status,
            'timestamp': datetime.utcnow().isoformat()
        }), 200 if all_healthy else 503
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
