# Missing cv_parsing_routes.py file
from flask import Blueprint

cv_parsing_bp = Blueprint('cv_parsing_bp', __name__)

@cv_parsing_bp.route('/api/parse-cv', methods=['POST'])
def parse_cv_endpoint():
    return {"error": "CV parsing service temporarily disabled"}, 503