import os
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from supabase import create_client, Client

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        """Initialize Supabase database connection"""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        
        if self.supabase_url and self.supabase_key:
            try:
                self.client: Client = create_client(self.supabase_url, self.supabase_key)
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self.client = None
        else:
            logger.warning("Supabase credentials not found. Database features will be disabled.")
            self.client = None

    def test_connection(self) -> bool:
        """Test database connection"""
        if not self.client:
            return False
            
        try:
            # Test with a simple query
            result = self.client.table('screening_results').select('id').limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False

    def save_cv_analysis(self, analysis_data: Dict[str, Any], filename: str) -> Optional[str]:
        """Save CV analysis results to database"""
        if not self.client:
            logger.warning("Database not available. Skipping save operation.")
            return None

        try:
            # Prepare data for insertion
            record = {
                'candidate_name': analysis_data.get('personalInfo', {}).get('name', 'Unknown'),
                'filename': filename,
                'analysis_results': analysis_data,
                'numerology_score': analysis_data.get('numerologyInsights', {}).get('compatibilityScore', 0),
                'created_at': datetime.utcnow().isoformat(),
                'status': 'completed'
            }

            # Insert into screening_results table
            result = self.client.table('screening_results').insert(record).execute()
            
            if result.data:
                record_id = result.data[0]['id']
                logger.info(f"CV analysis saved to database with ID: {record_id}")
                return record_id
            else:
                logger.error("No data returned from database insert")
                return None

        except Exception as e:
            logger.error(f"Failed to save CV analysis to database: {e}")
            raise

    def get_analysis_by_id(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve CV analysis by ID"""
        if not self.client:
            return None

        try:
            result = self.client.table('screening_results').select('*').eq('id', analysis_id).execute()
            
            if result.data:
                return result.data[0]
            else:
                return None

        except Exception as e:
            logger.error(f"Failed to retrieve analysis {analysis_id}: {e}")
            return None

    def get_recent_analyses(self, limit: int = 10) -> list:
        """Get recent CV analyses"""
        if not self.client:
            return []

        try:
            result = self.client.table('screening_results')\
                .select('id, candidate_name, filename, numerology_score, created_at, status')\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data if result.data else []

        except Exception as e:
            logger.error(f"Failed to retrieve recent analyses: {e}")
            return []

    def update_analysis_status(self, analysis_id: str, status: str) -> bool:
        """Update analysis status"""
        if not self.client:
            return False

        try:
            result = self.client.table('screening_results')\
                .update({'status': status, 'updated_at': datetime.utcnow().isoformat()})\
                .eq('id', analysis_id)\
                .execute()
            
            return bool(result.data)

        except Exception as e:
            logger.error(f"Failed to update analysis status: {e}")
            return False

    def search_candidates(self, query: str) -> list:
        """Search candidates by name or filename"""
        if not self.client:
            return []

        try:
            result = self.client.table('screening_results')\
                .select('id, candidate_name, filename, numerology_score, created_at')\
                .or_(f'candidate_name.ilike.%{query}%,filename.ilike.%{query}%')\
                .order('created_at', desc=True)\
                .execute()
            
            return result.data if result.data else []

        except Exception as e:
            logger.error(f"Failed to search candidates: {e}")
            return []

    def get_analytics_summary(self) -> Dict[str, Any]:
        """Get analytics summary for dashboard"""
        if not self.client:
            return {}

        try:
            # Total analyses
            total_result = self.client.table('screening_results').select('id', count='exact').execute()
            total_count = total_result.count if total_result.count else 0

            # Recent analyses (last 7 days)
            from datetime import timedelta
            week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
            recent_result = self.client.table('screening_results')\
                .select('id', count='exact')\
                .gte('created_at', week_ago)\
                .execute()
            recent_count = recent_result.count if recent_result.count else 0

            # Average numerology score
            avg_result = self.client.rpc('get_avg_numerology_score').execute()
            avg_score = avg_result.data[0]['avg_score'] if avg_result.data else 0

            return {
                'total_analyses': total_count,
                'recent_analyses': recent_count,
                'average_score': round(avg_score, 1) if avg_score else 0,
                'last_updated': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Failed to get analytics summary: {e}")
            return {
                'total_analyses': 0,
                'recent_analyses': 0,
                'average_score': 0,
                'last_updated': datetime.utcnow().isoformat()
            }