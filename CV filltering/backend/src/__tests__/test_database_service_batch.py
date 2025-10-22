# backend/src/__tests__/test_database_service_batch.py
"""
Comprehensive unit tests for DatabaseService batch operations.
Tests cover the new save_analyses_batch() method added in code fixes.
"""

import unittest
from unittest.mock import patch, MagicMock, call
import os

# Add parent directories to path
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Set dummy env vars before importing the service
os.environ['SUPABASE_URL'] = 'http://localhost:54321'
os.environ['SUPABASE_KEY'] = 'dummy-key'

from src.services.database_service import DatabaseService, get_db_service


class TestBatchInsertOperations(unittest.TestCase):
    """Test suite for batch insert functionality."""

    def setUp(self):
        """Reset DatabaseService singleton before each test."""
        DatabaseService._instance = None

    @patch('src.services.database_service.create_client')
    def test_batch_insert_success(self, mock_create_client):
        """Test successful batch insert with multiple analyses."""
        # Mock Supabase client
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        # Mock table operations
        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        db_service = get_db_service()

        # Prepare batch data
        analyses = [
            {
                "candidate_id": "BATCH-001",
                "source_type": "disc_csv",
                "raw_data": {"score": 8},
                "summary": {"name": "Test User 1", "D": 8, "I": 6, "S": 7, "C": 5}
            },
            {
                "candidate_id": "BATCH-002",
                "source_type": "disc_csv",
                "raw_data": {"score": 7},
                "summary": {"name": "Test User 2", "D": 7, "I": 5, "S": 8, "C": 6}
            },
            {
                "candidate_id": "BATCH-003",
                "source_type": "disc_csv",
                "raw_data": {"score": 9},
                "summary": {"name": "Test User 3", "D": 9, "I": 7, "S": 5, "C": 8}
            }
        ]

        # Execute batch insert
        result = db_service.save_analyses_batch(analyses)

        # Assertions
        self.assertTrue(result["success"])
        self.assertFalse(result["stub"])
        self.assertEqual(result["count"], 3)
        self.assertEqual(result["total"], 3)
        self.assertIsNone(result.get("errors"))

        # Verify Supabase insert was called with batch data
        mock_client.table.assert_any_call('screening_results')
        insert_calls = mock_table.insert.call_args_list
        self.assertEqual(len(insert_calls), 1)  # One batch insert

        # Verify batch data structure
        batch_data = insert_calls[0][0][0]
        self.assertEqual(len(batch_data), 3)
        self.assertEqual(batch_data[0]["candidate_id"], "BATCH-001")

    @patch('src.services.database_service.create_client')
    def test_batch_insert_partial_failure(self, mock_create_client):
        """Test batch insert with some records failing."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        # Mock to fail on second candidate
        def mock_ensure_candidate(candidate_id, summary):
            if candidate_id == "BATCH-002":
                raise Exception("Database constraint violation")

        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.insert.return_value.execute.return_value = MagicMock()

        db_service = get_db_service()
        db_service._ensure_candidate_exists = mock_ensure_candidate

        analyses = [
            {
                "candidate_id": "BATCH-001",
                "source_type": "cv_parsing",
                "raw_data": {},
                "summary": {"name": "User 1"}
            },
            {
                "candidate_id": "BATCH-002",
                "source_type": "cv_parsing",
                "raw_data": {},
                "summary": {"name": "User 2"}
            },
            {
                "candidate_id": "BATCH-003",
                "source_type": "cv_parsing",
                "raw_data": {},
                "summary": {"name": "User 3"}
            }
        ]

        result = db_service.save_analyses_batch(analyses)

        # Should succeed overall but report errors
        self.assertTrue(result["success"])
        self.assertEqual(result["count"], 2)  # 2 successful
        self.assertEqual(result["total"], 3)
        self.assertIsNotNone(result["errors"])
        self.assertEqual(len(result["errors"]), 1)
        self.assertEqual(result["errors"][0]["candidate_id"], "BATCH-002")

    def test_batch_insert_stub_mode(self):
        """Test batch insert in stub mode (no credentials)."""
        # Remove credentials to trigger stub mode
        original_url = os.environ.pop('SUPABASE_URL', None)
        original_key = os.environ.pop('SUPABASE_KEY', None)

        DatabaseService._instance = None
        db_service = get_db_service()

        analyses = [
            {
                "candidate_id": "STUB-001",
                "source_type": "disc_csv",
                "raw_data": {},
                "summary": {}
            }
        ]

        result = db_service.save_analyses_batch(analyses)

        # Should succeed in stub mode
        self.assertTrue(result["success"])
        self.assertTrue(result["stub"])
        self.assertEqual(result["count"], 1)

        # Restore credentials
        if original_url:
            os.environ['SUPABASE_URL'] = original_url
        if original_key:
            os.environ['SUPABASE_KEY'] = original_key

    def test_batch_insert_empty_list(self):
        """Test batch insert with empty list."""
        DatabaseService._instance = None
        db_service = get_db_service()

        result = db_service.save_analyses_batch([])

        self.assertTrue(result["success"])
        self.assertEqual(result["count"], 0)
        self.assertIn("No analyses to save", result["message"])

    @patch('src.services.database_service.create_client')
    def test_batch_insert_different_source_types(self, mock_create_client):
        """Test batch insert with mixed source types."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        db_service = get_db_service()

        # Mixed source types
        analyses = [
            {
                "candidate_id": "MIX-001",
                "source_type": "cv_parsing",
                "raw_data": {"filename": "resume.pdf", "source": {"type": "gemini"}},
                "summary": {"name": "CV User", "email": "cv@test.com"}
            },
            {
                "candidate_id": "MIX-002",
                "source_type": "numerology",
                "raw_data": {"full_name": "Num User", "birth_date": "1990-01-01"},
                "summary": {"life_path_number": 7, "soul_urge_number": 5}
            },
            {
                "candidate_id": "MIX-003",
                "source_type": "disc_csv",
                "raw_data": {"source": "csv_upload"},
                "summary": {"D": 8, "I": 6, "S": 7, "C": 5, "primary_type": "Dominance"}
            }
        ]

        result = db_service.save_analyses_batch(analyses)

        self.assertTrue(result["success"])
        self.assertEqual(result["count"], 3)

        # Verify different table inserts were called
        table_calls = [call_args[0][0] for call_args in mock_client.table.call_args_list]
        self.assertIn('cv_analyses', table_calls)
        self.assertIn('numerology_data', table_calls)
        self.assertIn('disc_assessments', table_calls)

    @patch('src.services.database_service.create_client')
    def test_batch_insert_performance_vs_single(self, mock_create_client):
        """Test that batch insert makes fewer DB calls than individual inserts."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        db_service = get_db_service()

        # Prepare 10 analyses
        analyses = [
            {
                "candidate_id": f"PERF-{i:03d}",
                "source_type": "disc_csv",
                "raw_data": {},
                "summary": {"name": f"User {i}", "D": 8}
            }
            for i in range(10)
        ]

        # Reset mock to count calls
        mock_client.table.reset_mock()

        # Execute batch insert
        result = db_service.save_analyses_batch(analyses)

        self.assertTrue(result["success"])
        self.assertEqual(result["count"], 10)

        # Count screening_results insert calls (should be 1 for batch)
        screening_insert_calls = [
            call_args for call_args in mock_table.insert.call_args_list
            if mock_client.table.call_args_list[0][0][0] == 'screening_results'
        ]

        # Should be only 1 batch insert to screening_results
        self.assertEqual(len(screening_insert_calls), 1)


class TestSupabaseResponseParsing(unittest.TestCase):
    """Test suite for Supabase response parsing fixes."""

    def setUp(self):
        """Reset DatabaseService singleton before each test."""
        DatabaseService._instance = None

    @patch('src.services.database_service.create_client')
    def test_get_recent_analyses_response_parsing(self, mock_create_client):
        """Test correct parsing of Supabase response object (not tuple)."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        # Mock Supabase response object (NOT a tuple!)
        mock_response = MagicMock()
        mock_response.data = [
            {"candidate_id": "TEST-001", "source_type": "cv_parsing"},
            {"candidate_id": "TEST-002", "source_type": "disc_csv"}
        ]

        mock_client.table.return_value.select.return_value.order.return_value.limit.return_value.execute.return_value = mock_response

        db_service = get_db_service()
        result = db_service.get_recent_analyses(limit=2)

        # Should successfully parse response.data
        self.assertTrue(result["success"])
        self.assertFalse(result["stub"])
        self.assertEqual(len(result["data"]), 2)
        self.assertEqual(result["data"][0]["candidate_id"], "TEST-001")

    @patch('src.services.database_service.create_client')
    def test_get_recent_analyses_empty_result(self, mock_create_client):
        """Test handling of empty result set."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        mock_response = MagicMock()
        mock_response.data = []

        mock_client.table.return_value.select.return_value.order.return_value.limit.return_value.execute.return_value = mock_response

        db_service = get_db_service()
        result = db_service.get_recent_analyses(limit=10)

        self.assertTrue(result["success"])
        self.assertEqual(len(result["data"]), 0)

    def test_get_recent_analyses_stub_mode(self):
        """Test get_recent_analyses in stub mode."""
        # Remove credentials
        original_url = os.environ.pop('SUPABASE_URL', None)
        original_key = os.environ.pop('SUPABASE_KEY', None)

        db_service = get_db_service()
        result = db_service.get_recent_analyses(limit=5)

        self.assertTrue(result["success"])
        self.assertTrue(result["stub"])
        self.assertIsInstance(result["data"], list)
        self.assertGreater(len(result["data"]), 0)  # Should have stub data

        # Restore
        if original_url:
            os.environ['SUPABASE_URL'] = original_url
        if original_key:
            os.environ['SUPABASE_KEY'] = original_key


class TestCredentialValidation(unittest.TestCase):
    """Test suite for improved credential validation."""

    def test_placeholder_url_detection_your_prefix(self):
        """Test detection of 'your_' prefix placeholders."""
        os.environ['SUPABASE_URL'] = 'https://your_project.supabase.co'
        os.environ['SUPABASE_KEY'] = 'dummy-key'

        DatabaseService._instance = None
        db_service = get_db_service()

        self.assertTrue(db_service.is_stub())

    def test_placeholder_url_detection_placeholder_word(self):
        """Test detection of 'placeholder' in URL."""
        os.environ['SUPABASE_URL'] = 'https://placeholder.supabase.co'
        os.environ['SUPABASE_KEY'] = 'dummy-key'

        DatabaseService._instance = None
        db_service = get_db_service()

        self.assertTrue(db_service.is_stub())

    def test_placeholder_url_detection_example_word(self):
        """Test detection of 'example' in URL."""
        os.environ['SUPABASE_URL'] = 'https://example.supabase.co'
        os.environ['SUPABASE_KEY'] = 'dummy-key'

        DatabaseService._instance = None
        db_service = get_db_service()

        self.assertTrue(db_service.is_stub())

    def test_valid_url_accepted(self):
        """Test that valid URLs are accepted."""
        os.environ['SUPABASE_URL'] = 'https://abcdefghijk.supabase.co'
        os.environ['SUPABASE_KEY'] = 'real-looking-key-12345'

        with patch('backend.src.services.database_service.create_client') as mock_create:
            mock_create.return_value = MagicMock()
            DatabaseService._instance = None
            db_service = get_db_service()

            self.assertFalse(db_service.is_stub())

    def test_missing_credentials(self):
        """Test stub mode when credentials are missing."""
        original_url = os.environ.pop('SUPABASE_URL', None)
        original_key = os.environ.pop('SUPABASE_KEY', None)

        DatabaseService._instance = None
        db_service = get_db_service()

        self.assertTrue(db_service.is_stub())

        # Restore
        if original_url:
            os.environ['SUPABASE_URL'] = original_url
        if original_key:
            os.environ['SUPABASE_KEY'] = original_key


if __name__ == '__main__':
    unittest.main()
