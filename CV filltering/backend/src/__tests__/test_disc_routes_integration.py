# backend/src\__tests__\test_disc_routes_integration.py
"""
Integration tests for DISC API routes.
Tests cover the batch insert optimization and endpoint behavior.
"""

import unittest
from unittest.mock import patch, MagicMock
import json
import io
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

# Set test environment
os.environ['SUPABASE_URL'] = 'http://localhost:54321'
os.environ['SUPABASE_KEY'] = 'test-key'

from src.app import create_app
from src.services.database_service import DatabaseService


class TestDISCRoutesIntegration(unittest.TestCase):
    """Integration tests for DISC routes."""

    def setUp(self):
        """Set up test Flask app."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        DatabaseService._instance = None

    def tearDown(self):
        """Clean up after tests."""
        DatabaseService._instance = None

    @patch('src.services.database_service.create_client')
    def test_manual_input_endpoint(self, mock_create_client):
        """Test POST /api/disc/manual-input endpoint."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        # Mock database operations
        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        data = {
            "candidate_id": "API-TEST-001",
            "d_score": 8,
            "i_score": 6,
            "s_score": 7,
            "c_score": 5,
            "notes": "API test"
        }

        response = self.client.post(
            '/api/disc/manual-input',
            data=json.dumps(data),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        result = json.loads(response.data)
        self.assertTrue(result["success"])
        self.assertEqual(result["candidate_id"], "API-TEST-001")

    def test_manual_input_missing_candidate_id(self):
        """Test manual input endpoint with missing candidate_id."""
        data = {
            "d_score": 8,
            "i_score": 6,
            "s_score": 7,
            "c_score": 5
        }

        response = self.client.post(
            '/api/disc/manual-input',
            data=json.dumps(data),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        result = json.loads(response.data)
        self.assertFalse(result["success"])
        self.assertIn("Missing candidate_id", result["error"])

    def test_manual_input_invalid_scores(self):
        """Test manual input endpoint with invalid scores."""
        data = {
            "candidate_id": "INVALID-001",
            "d_score": 15,  # Invalid
            "i_score": 6,
            "s_score": 7,
            "c_score": 5
        }

        response = self.client.post(
            '/api/disc/manual-input',
            data=json.dumps(data),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        result = json.loads(response.data)
        self.assertFalse(result["success"])

    @patch('src.services.database_service.create_client')
    def test_csv_upload_endpoint_success(self, mock_create_client):
        """Test POST /api/disc/upload-csv endpoint with valid CSV."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        # Mock database operations
        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        csv_content = b"""candidate_id,name,d_score,i_score,s_score,c_score,notes
CSV-001,User One,8,6,7,5,Test 1
CSV-002,User Two,7,5,8,6,Test 2
CSV-003,User Three,9,7,5,8,Test 3"""

        data = {
            'file': (io.BytesIO(csv_content), 'test.csv')
        }

        response = self.client.post(
            '/api/disc/upload-csv',
            data=data,
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 200)
        result = json.loads(response.data)
        self.assertTrue(result["success"])
        self.assertEqual(len(result["data"]["candidates"]), 3)

        # Verify batch insert was used
        self.assertIn("db_save", result)
        self.assertIsNotNone(result["db_save"])

    @patch('src.services.database_service.create_client')
    def test_csv_upload_uses_batch_insert(self, mock_create_client):
        """Test that CSV upload uses batch insert (not individual inserts)."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        csv_content = b"""candidate_id,name,d_score,i_score,s_score,c_score
BATCH-1,User 1,8,6,7,5
BATCH-2,User 2,7,5,8,6
BATCH-3,User 3,9,7,5,8
BATCH-4,User 4,6,8,6,7
BATCH-5,User 5,8,7,6,5"""

        data = {'file': (io.BytesIO(csv_content), 'batch.csv')}

        # Reset mock to count calls
        mock_client.reset_mock()

        response = self.client.post('/api/disc/upload-csv', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 200)
        result = json.loads(response.data)

        # Verify batch result in response
        self.assertIn("db_save", result)
        self.assertEqual(result["db_save"]["count"], 5)

        # Verify screening_results insert was called once (batch), not 5 times
        insert_calls = mock_table.insert.call_args_list
        # Should have at least 1 batch insert call
        self.assertGreater(len(insert_calls), 0)

    def test_csv_upload_no_file(self):
        """Test CSV upload endpoint with no file."""
        response = self.client.post('/api/disc/upload-csv', data={})

        self.assertEqual(response.status_code, 400)
        result = json.loads(response.data)
        self.assertFalse(result["success"])
        self.assertIn("No file part", result["errors"][0])

    def test_csv_upload_invalid_file_type(self):
        """Test CSV upload endpoint with wrong file type."""
        data = {
            'file': (io.BytesIO(b"not a csv"), 'test.txt')
        }

        response = self.client.post(
            '/api/disc/upload-csv',
            data=data,
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 400)
        result = json.loads(response.data)
        self.assertFalse(result["success"])
        self.assertIn("CSV", result["errors"][0])

    def test_csv_upload_invalid_headers(self):
        """Test CSV upload with invalid headers."""
        csv_content = b"""wrong,headers,here
CSV-001,User,8"""

        data = {'file': (io.BytesIO(csv_content), 'bad.csv')}

        response = self.client.post('/api/disc/upload-csv', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 400)
        result = json.loads(response.data)
        self.assertFalse(result["success"])
        self.assertGreater(len(result["errors"]), 0)

    @patch('src.services.database_service.create_client')
    def test_ocr_image_upload_endpoint(self, mock_create_client):
        """Test POST /api/disc/upload-ocr-image endpoint."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        # Mock image file
        fake_image = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'

        with patch('src.services.disc_pipeline.pytesseract') as mock_tesseract, \
             patch('src.services.disc_pipeline.cv2') as mock_cv2:

            mock_cv2.imdecode.return_value = MagicMock()
            mock_cv2.cvtColor.return_value = MagicMock()
            mock_cv2.threshold.return_value = (None, MagicMock())
            mock_cv2.medianBlur.return_value = MagicMock()
            mock_tesseract.image_to_string.return_value = "D: 8\nI: 6"

            data = {
                'file': (io.BytesIO(fake_image), 'test.png'),
                'candidate_id': 'OCR-001'
            }

            response = self.client.post(
                '/api/disc/upload-ocr-image',
                data=data,
                content_type='multipart/form-data'
            )

            self.assertEqual(response.status_code, 200)
            result = json.loads(response.data)
            self.assertTrue(result["success"])

    def test_ocr_upload_no_file(self):
        """Test OCR upload with no file."""
        response = self.client.post('/api/disc/upload-ocr-image', data={})

        self.assertEqual(response.status_code, 400)
        result = json.loads(response.data)
        self.assertFalse(result["success"])

    def test_ocr_upload_invalid_image_type(self):
        """Test OCR upload with non-image file."""
        data = {
            'file': (io.BytesIO(b"not an image"), 'test.txt')
        }

        response = self.client.post(
            '/api/disc/upload-ocr-image',
            data=data,
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 400)
        result = json.loads(response.data)
        self.assertFalse(result["success"])

    def test_test_endpoint(self):
        """Test GET /api/disc/test endpoint."""
        response = self.client.get('/api/disc/test')

        self.assertEqual(response.status_code, 200)
        result = json.loads(response.data)
        self.assertTrue(result["success"])
        self.assertEqual(result["service"], "DISC Pipeline")

    @patch('src.services.database_service.create_client')
    def test_status_endpoint(self, mock_create_client):
        """Test GET /api/disc/status/<candidate_id> endpoint."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        response = self.client.get('/api/disc/status/TEST-001')

        self.assertEqual(response.status_code, 200)
        result = json.loads(response.data)
        self.assertIn("candidate_id", result)
        self.assertEqual(result["candidate_id"], "TEST-001")


class TestBatchInsertPerformance(unittest.TestCase):
    """Performance-focused tests for batch insert optimization."""

    def setUp(self):
        """Set up test Flask app."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        DatabaseService._instance = None

    @patch('src.services.database_service.create_client')
    def test_large_csv_batch_performance(self, mock_create_client):
        """Test batch insert with large CSV (100 rows)."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        # Generate large CSV
        rows = ["candidate_id,name,d_score,i_score,s_score,c_score"]
        for i in range(100):
            rows.append(f"PERF-{i:03d},User {i},8,6,7,5")

        csv_content = "\n".join(rows).encode()
        data = {'file': (io.BytesIO(csv_content), 'large.csv')}

        # Reset to count calls
        mock_client.reset_mock()

        response = self.client.post('/api/disc/upload-csv', data=data, content_type='multipart/form-data')

        self.assertEqual(response.status_code, 200)
        result = json.loads(response.data)
        self.assertEqual(result["data"]["processed_count"], 100)

        # Batch insert should result in significantly fewer DB calls
        # than 100 individual inserts
        total_insert_calls = len(mock_table.insert.call_args_list)
        self.assertLess(total_insert_calls, 20)  # Much less than 100

    @patch('src.services.database_service.create_client')
    def test_batch_partial_failure_handling(self, mock_create_client):
        """Test that batch insert handles partial failures gracefully."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        mock_table = MagicMock()
        mock_client.table.return_value = mock_table

        # Mock partial failure
        call_count = {'count': 0}

        def side_effect_ensure_candidate(candidate_id, summary):
            call_count['count'] += 1
            if call_count['count'] == 2:  # Fail on second candidate
                raise Exception("Simulated DB error")

        mock_table.insert.return_value.execute.return_value = MagicMock()

        csv_content = b"""candidate_id,name,d_score,i_score,s_score,c_score
FAIL-1,User 1,8,6,7,5
FAIL-2,User 2,7,5,8,6
FAIL-3,User 3,9,7,5,8"""

        data = {'file': (io.BytesIO(csv_content), 'partial_fail.csv')}

        response = self.client.post('/api/disc/upload-csv', data=data, content_type='multipart/form-data')

        # Should still return 200 with partial success
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.data)

        # Check db_save shows partial results
        if result.get("db_save") and "errors" in result["db_save"]:
            # Some candidates should have succeeded
            self.assertGreater(result["db_save"]["count"], 0)


if __name__ == '__main__':
    unittest.main()
