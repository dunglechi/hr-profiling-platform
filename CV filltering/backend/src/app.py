"""
CV Screening Platform - Main Flask Application
Full Stack Backend Integration với Supabase
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
from datetime import datetime

# Import route blueprints
from .routes.numerology_routes import numerology_bp
from .routes.disc_routes import disc_bp
from .routes.cv_parsing_routes import cv_parsing_bp

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """
    Application factory pattern
    """
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Enable CORS for frontend integration
    CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])
    
    # Register blueprints
    app.register_blueprint(numerology_bp)
    app.register_blueprint(disc_bp)
    app.register_blueprint(cv_parsing_bp)
    
    # Import services for health checking
    from .services.numerology_service import NumerologyService
    from .services.disc_pipeline import DISCExternalPipeline
    
    # Health check endpoint với REAL service testing và detailed logging
    @app.route('/health', methods=['GET'])
    def health_check():
        try:
            health_status = {
                "status": "unknown",
                "timestamp": datetime.now().isoformat(),
                "services": {},
                "tests_performed": []
            }
            
            # Test Numerology Service với real function call
            logger.info("Testing Numerology Service...")
            try:
                numerology_service = NumerologyService()
                # Real test với Vietnamese name
                test_result = numerology_service.calculate_full_numerology("Nguyễn Văn A", "1990-01-01")
                if test_result and test_result.get("success"):
                    health_status["services"]["numerology"] = "operational"
                    health_status["tests_performed"].append("numerology_calculation_test_passed")
                    logger.info("Numerology service test: PASSED")
                else:
                    health_status["services"]["numerology"] = "degraded"
                    health_status["tests_performed"].append("numerology_calculation_test_failed")
                    logger.warning("Numerology service test: FAILED")
            except Exception as e:
                health_status["services"]["numerology"] = f"error: {str(e)}"
                health_status["tests_performed"].append(f"numerology_test_exception: {str(e)}")
                health_status["status"] = "degraded"
                logger.error(f"Numerology service error: {str(e)}")
            
            # Test DISC Pipeline với real function call
            logger.info("Testing DISC Pipeline...")
            try:
                disc_pipeline = DISCExternalPipeline()
                # Real test với manual input
                test_scores = {"d_score": 8, "i_score": 6, "s_score": 5, "c_score": 7}
                test_result = disc_pipeline.process_manual_input("HEALTH_TEST", test_scores)
                if test_result and test_result.get("success"):
                    health_status["services"]["disc_pipeline"] = "operational"
                    health_status["tests_performed"].append("disc_manual_input_test_passed")
                    logger.info("DISC pipeline test: PASSED")
                else:
                    health_status["services"]["disc_pipeline"] = "degraded"
                    health_status["tests_performed"].append("disc_manual_input_test_failed")
                    logger.warning("DISC pipeline test: FAILED")
            except Exception as e:
                health_status["services"]["disc_pipeline"] = f"error: {str(e)}"
                health_status["tests_performed"].append(f"disc_test_exception: {str(e)}")
                health_status["status"] = "degraded"
                logger.error(f"DISC pipeline error: {str(e)}")
            
            # Database connectivity (honest mock for now)
            health_status["services"]["database"] = "mock_connected"
            health_status["tests_performed"].append("database_connection_mocked")
            
            # CV Parser (honest status)
            health_status["services"]["cv_parser"] = "not_implemented"
            health_status["tests_performed"].append("cv_parser_not_implemented")
            
            # Determine overall status
            operational_services = [
                service for service in health_status["services"].values() 
                if "operational" in str(service)
            ]
            
            if len(operational_services) >= 2:  # At least 2 services working
                health_status["status"] = "healthy"
            elif len(operational_services) >= 1:
                health_status["status"] = "degraded"
            else:
                health_status["status"] = "unhealthy"
            
            logger.info(f"Health check completed. Status: {health_status['status']}")
            
            return jsonify(health_status), 200
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return jsonify({
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "error": f"Health check failed: {str(e)}",
                "services": {
                    "numerology": "unknown",
                    "disc_pipeline": "unknown", 
                    "database": "unknown",
                    "cv_parser": "unknown"
                }
            }), 500
    
    # API health endpoint alias - được yêu cầu bởi CTO
    @app.route('/api/health', methods=['GET'])
    def api_health_check():
        return health_check()
    
    # API info endpoint
    @app.route('/api', methods=['GET'])
    def api_info():
        return jsonify({
            "name": "CV Screening Platform API",
            "version": "1.0.0",
            "description": "Backend services for CV screening with numerology and DISC assessment",
            "endpoints": {
                "numerology": {
                    "calculate": "POST /api/numerology/calculate",
                    "manual_input": "POST /api/numerology/manual-input",
                    "status": "GET /api/numerology/status/<candidate_id>",
                    "test": "GET /api/numerology/test"
                },
                "disc": {
                    "upload_csv": "POST /api/disc/upload-csv",
                    "manual_input": "POST /api/disc/manual-input",
                    "generate_survey": "GET /api/disc/generate-survey",
                    "upload_ocr": "POST /api/disc/upload-ocr-image",
                    "status": "GET /api/disc/status/<candidate_id>",
                    "test": "GET /api/disc/test",
                    "csv_template": "GET /api/disc/formats/csv-template"
                },
                "health": "GET /health"
            },
            "documentation": "See README.md for detailed API documentation"
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "error": "Endpoint not found",
            "message": "The requested API endpoint does not exist",
            "available_endpoints": "/api"
        }), 404
    
    @app.errorhandler(413)
    def too_large_error(error):
        return jsonify({
            "error": "File too large",
            "message": "Maximum file size is 16MB"
        }), 413
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }), 500
    
    # Request logging middleware
    @app.before_request
    def log_request_info():
        logger.info(f"Request: {request.method} {request.url}")
        
    @app.after_request
    def log_response_info(response):
        logger.info(f"Response: {response.status_code}")
        return response
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting CV Screening Platform API on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(
        host='127.0.0.1',
        port=port,
        debug=debug
    )
