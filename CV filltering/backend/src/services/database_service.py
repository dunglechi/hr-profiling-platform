# backend/src/services/database_service.py
import os
import logging
from supabase import create_client, Client
from typing import Dict, Any, List, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseService:
    """
    Service to interact with the Supabase database.
    This is a stub implementation that logs actions instead of making real DB calls.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseService, cls).__new__(cls)
            cls._instance.client = cls._instance._get_client()
        return cls._instance

    def _get_client(self) -> Optional[Client]:
        """Initializes the Supabase client if credentials are available."""
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        
        if not url or not key or "your_supabase" in url:
            logger.warning("Supabase credentials not found or are placeholders. DatabaseService will run in stub mode.")
            return None
        
        try:
            return create_client(url, key)
        except Exception as e:
            logger.error(f"Failed to create Supabase client: {e}")
            return None

    def is_stub(self) -> bool:
        """Check if the service is running in stub mode."""
        return self.client is None

    def save_analysis(self, candidate_id: str, source_type: str, raw_data: Dict[str, Any], summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Saves analysis results to appropriate tables based on source_type.
        
        Routes data to:
        - cv_parsing -> cv_analyses table
        - numerology -> numerology_data table
        - disc_* -> disc_assessments table
        - Also saves to screening_results for backward compatibility
        
        In stub mode, it logs the data that would be inserted.
        """
        if self.is_stub():
            log_message = f"[STUB] Would save analysis to DB: candidate_id='{candidate_id}', source='{source_type}', summary={summary}"
            logger.info(log_message)
            return {"success": True, "stub": True, "message": log_message}

        try:
            # 1. Ensure candidate exists
            self._ensure_candidate_exists(candidate_id, summary)
            
            # 2. Save to screening_results (backward compatibility)
            screening_data = {
                "candidate_id": candidate_id,
                "source_type": source_type,
                "raw_data": raw_data,
                "summary": summary,
                "processed_by": "backend-v1"
            }
            self.client.table('screening_results').insert(screening_data).execute()
            
            # 3. Save to specific table based on source_type
            if source_type == "cv_parsing":
                self._save_cv_analysis(candidate_id, raw_data, summary)
            elif source_type == "numerology":
                self._save_numerology_data(candidate_id, raw_data, summary)
            elif source_type.startswith("disc_"):
                self._save_disc_assessment(candidate_id, raw_data, summary)
            
            # 4. Log activity
            self._log_activity(candidate_id, source_type, "analysis_saved")
            
            logger.info(f"Successfully saved {source_type} analysis for candidate '{candidate_id}'")
            return {"success": True, "stub": False, "candidate_id": candidate_id}
        except Exception as e:
            logger.error(f"Failed to save analysis for candidate '{candidate_id}': {e}")
            return {"success": False, "error": str(e)}

    def get_recent_analyses(self, limit: int = 20) -> Dict[str, Any]:
        """
        Retrieves the most recent analysis results.
        In stub mode, returns a predefined sample data structure.
        """
        if self.is_stub():
            logger.info(f"[STUB] Would retrieve recent {limit} analyses from DB.")
            return {
                "success": True,
                "stub": True,
                "data": [
                    {"candidate_id": "STUB-001", "source_type": "cv_parsing", "summary": {"name": "John Stub"}},
                    {"candidate_id": "STUB-002", "source_type": "disc_csv", "summary": {"name": "Jane Stub"}},
                ]
            }

        try:
            data, count = self.client.table('screening_results').select('*').order('created_at', desc=True).limit(limit).execute()
            logger.info(f"Retrieved {len(data[1])} recent analyses.")
            return {"success": True, "stub": False, "data": data[1]}
        except Exception as e:
            logger.error(f"Failed to retrieve recent analyses: {e}")
            return {"success": False, "error": str(e)}

    # ==================== Private Helper Methods ====================
    
    def _ensure_candidate_exists(self, candidate_id: str, summary: Dict[str, Any]) -> None:
        """Create candidate record if it doesn't exist."""
        try:
            # Check if candidate exists
            result = self.client.table('candidates').select('candidate_id').eq('candidate_id', candidate_id).execute()
            
            if not result.data:
                # Create new candidate
                candidate_data = {
                    "candidate_id": candidate_id,
                    "name": summary.get("name", "Unknown"),
                    "email": summary.get("email"),
                    "phone": summary.get("phone"),
                    "status": "pending"
                }
                self.client.table('candidates').insert(candidate_data).execute()
                logger.info(f"Created new candidate record: {candidate_id}")
        except Exception as e:
            logger.error(f"Error ensuring candidate exists: {e}")
            raise

    def _save_cv_analysis(self, candidate_id: str, raw_data: Dict[str, Any], summary: Dict[str, Any]) -> None:
        """Save CV parsing results to cv_analyses table."""
        try:
            cv_data = {
                "candidate_id": candidate_id,
                "parsing_method": raw_data.get("source", "unknown"),
                "extracted_data": raw_data,
                "personal_info": summary.get("personalInfo", {}),
                "education": summary.get("education", []),
                "experience": summary.get("experience", []),
                "skills": summary.get("skills", []),
                "summary_text": summary.get("summary")
            }
            self.client.table('cv_analyses').insert(cv_data).execute()
            logger.info(f"Saved CV analysis for {candidate_id}")
        except Exception as e:
            logger.error(f"Error saving CV analysis: {e}")
            raise

    def _save_numerology_data(self, candidate_id: str, raw_data: Dict[str, Any], summary: Dict[str, Any]) -> None:
        """Save numerology calculation results to numerology_data table."""
        try:
            num_data = {
                "candidate_id": candidate_id,
                "full_name": raw_data.get("full_name"),
                "birth_date": raw_data.get("birth_date"),
                "life_path_number": summary.get("life_path_number"),
                "soul_urge_number": summary.get("soul_urge_number"),
                "expression_number": summary.get("expression_number"),
                "personality_number": summary.get("personality_number"),
                "interpretation": summary.get("interpretation", {}),
                "raw_calculation": raw_data
            }
            self.client.table('numerology_data').insert(num_data).execute()
            logger.info(f"Saved numerology data for {candidate_id}")
        except Exception as e:
            logger.error(f"Error saving numerology data: {e}")
            raise

    def _save_disc_assessment(self, candidate_id: str, raw_data: Dict[str, Any], summary: Dict[str, Any]) -> None:
        """Save DISC assessment results to disc_assessments table."""
        try:
            disc_data = {
                "candidate_id": candidate_id,
                "assessment_method": raw_data.get("source", "unknown"),
                "d_score": summary.get("D"),
                "i_score": summary.get("I"),
                "s_score": summary.get("S"),
                "c_score": summary.get("C"),
                "primary_type": summary.get("primary_type"),
                "secondary_type": summary.get("secondary_type"),
                "interpretation": summary.get("interpretation", {}),
                "raw_responses": raw_data.get("responses", {})
            }
            self.client.table('disc_assessments').insert(disc_data).execute()
            logger.info(f"Saved DISC assessment for {candidate_id}")
        except Exception as e:
            logger.error(f"Error saving DISC assessment: {e}")
            raise

    def _log_activity(self, candidate_id: str, activity_type: str, details: str) -> None:
        """Log activity to activity_logs table."""
        try:
            log_data = {
                "candidate_id": candidate_id,
                "activity_type": activity_type,
                "details": details,
                "performed_by": "system"
            }
            self.client.table('activity_logs').insert(log_data).execute()
        except Exception as e:
            logger.warning(f"Failed to log activity: {e}")  # Don't raise, logging is non-critical

def get_db_service() -> DatabaseService:
    """Singleton factory for the DatabaseService."""
    return DatabaseService()
