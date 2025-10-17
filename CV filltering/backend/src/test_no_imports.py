"""
Test Flask App - No Complex Imports
"""

from flask import Flask, jsonify
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_simple_app():
    app = Flask(__name__)
    
    @app.route('/test')
    def test():
        return jsonify({"message": "Simple test working", "status": "ok"})
    
    return app

app = create_simple_app()

if __name__ == '__main__':
    logger.info("Starting simple Flask test app")
    app.run(host='127.0.0.1', port=5000, debug=False)