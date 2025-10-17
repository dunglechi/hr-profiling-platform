# backend/src/__tests__/test_database_service.py
import unittest
from unittest.mock import patch, MagicMock
import os

# Set dummy env vars before importing the service
os.environ['SUPABASE_URL'] = 'http://localhost:54321'
os.environ['SUPABASE_KEY'] = 'dummy-key'

from backend.src.services.database_service import DatabaseService, get_db_service

class TestDatabaseService(unittest.TestCase):

    @patch('backend.src.services.database_service.create_client')
    def test_save_analysis_calls_supabase_client(self, mock_create_client):
        # Mock the client and its methods
        mock_supabase_client = MagicMock()
        mock_create_client.return_value = mock_supabase_client
        
        # Force re-initialization of the service to use the mock
        DatabaseService._instance = None
        db_service = get_db_service()
        
        self.assertFalse(db_service.is_stub())

        # Call the method
        db_service.save_analysis(
            candidate_id="CAND-001",
            source_type="test_source",
            raw_data={"key": "value"},
            summary={"s_key": "s_value"}
        )

        # Assert that the Supabase client's `insert` method was called
        mock_supabase_client.table.assert_called_with('screening_results')
        mock_supabase_client.table.return_value.insert.assert_called_once()

    def test_stub_mode_when_no_credentials(self):
        # Unset env vars to trigger stub mode
        original_url = os.environ.pop('SUPABASE_URL', None)
        original_key = os.environ.pop('SUPABASE_KEY', None)

        DatabaseService._instance = None
        db_service = get_db_service()
        
        self.assertTrue(db_service.is_stub())

        result = db_service.save_analysis("id", "type", {}, {})
        self.assertTrue(result['stub'])
        
        # Restore env vars
        if original_url:
            os.environ['SUPABASE_URL'] = original_url
        if original_key:
            os.environ['SUPABASE_KEY'] = original_key

if __name__ == '__main__':
    unittest.main()
