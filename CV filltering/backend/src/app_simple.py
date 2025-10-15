"""
CV Screening Platform - Simple Flask Application for Testing
DEBUG VERSION: Minimal app để identify issue
"""

from flask import Flask, jsonify
from flask_cors import CORS
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """
    Simple application factory for debugging
    """
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = 'dev-secret-key'
    
    # Enable CORS
    CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])
    
    # Simple health check without complex service testing
    @app.route('/health', methods=['GET'])
    def health_check():
        logger.info("Health check called")
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "message": "Simple health check working"
        }), 200
    
    # API health alias
    @app.route('/api/health', methods=['GET'])
    def api_health_check():
        logger.info("API health check called")
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "message": "API health check working"
        }), 200
    
    return app

if __name__ == '__main__':
    logger.info("Starting simple Flask app for debugging...")
    app = create_app()
    
    try:
        logger.info("App created successfully")
        app.run(host='127.0.0.1', port=5001, debug=False)
    except Exception as e:
        logger.error(f"Failed to start app: {str(e)}")
        raise