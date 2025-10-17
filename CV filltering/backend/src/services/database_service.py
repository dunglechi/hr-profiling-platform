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
        Saves analysis results to the screening_results table.
        In stub mode, it logs the data that would be inserted.
        """
        if self.is_stub():
            log_message = f"[STUB] Would save analysis to DB: candidate_id='{candidate_id}', source='{source_type}', summary={summary}"
            logger.info(log_message)
            return {"success": True, "stub": True, "message": log_message}

        try:
            data_to_insert = {
                "candidate_id": candidate_id,
                "source_type": source_type,
                "raw_data": raw_data,
                "summary": summary,
                "processed_by": "backend-v1"
            }
            data, count = self.client.table('screening_results').insert(data_to_insert).execute()
            logger.info(f"Successfully saved analysis for candidate '{candidate_id}'")
            return {"success": True, "stub": False, "data": data}
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

def get_db_service() -> DatabaseService:
    """Singleton factory for the DatabaseService."""
    return DatabaseService()
