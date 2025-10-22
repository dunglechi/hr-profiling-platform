# backend/src/__tests__/test_fixes_verification.py
"""
Simple verification tests for all bug fixes.
These tests can run independently without Flask app.
"""

import unittest
from unittest.mock import patch, MagicMock
import os
import sys
from pathlib import Path

# Add parent directories to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Set test environment
os.environ['SUPABASE_URL'] = 'http://localhost:54321'
os.environ['SUPABASE_KEY'] = 'test-key'

from src.services.database_service import DatabaseService
from src.services.disc_pipeline import DISCExternalPipeline


class TestCriticalFixes(unittest.TestCase):
    """Verify all critical bug fixes are working."""

    def setUp(self):
        """Reset singletons before each test."""
        DatabaseService._instance = None

    @patch('src.services.database_service.create_client')
    def test_fix1_supabase_response_parsing(self, mock_create_client):
        """
        CRITICAL FIX #1: Supabase response parsing
        Verify response.data is used instead of unpacking tuple
        """
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        # Mock Supabase response object (NOT a tuple)
        mock_response = MagicMock()
        mock_response.data = [
            {"candidate_id": "TEST-001", "source_type": "cv_parsing"},
            {"candidate_id": "TEST-002", "source_type": "disc_csv"}
        ]

        mock_client.table.return_value.select.return_value.order.return_value.limit.return_value.execute.return_value = mock_response

        db_service = DatabaseService()
        result = db_service.get_recent_analyses(limit=2)

        # Should successfully parse response.data (not crash with tuple unpacking)
        self.assertTrue(result["success"])
        self.assertEqual(len(result["data"]), 2)
        self.assertEqual(result["data"][0]["candidate_id"], "TEST-001")

        print("✅ FIX #1 VERIFIED: Supabase response parsing works correctly")

    def test_fix2_csv_header_validation_empty_file(self):
        """
        HIGH FIX #2: CSV header validation
        Verify empty CSV doesn't crash with None.issubset()
        """
        pipeline = DISCExternalPipeline()
        csv_data = b""

        # Should not crash, should return error
        result = pipeline.process_csv_upload(csv_data)

        self.assertGreater(len(result["errors"]), 0)
        self.assertIn("Missing required headers", result["errors"][0])

        print("✅ FIX #2 VERIFIED: Empty CSV handled without crash")

    @patch('src.services.database_service.create_client')
    def test_fix3_batch_insert_optimization(self, mock_create_client):
        """
        HIGH FIX #3: Batch insert optimization
        Verify batch method exists and works
        """
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        db_service = DatabaseService()

        # Prepare batch data
        analyses = [
            {
                "candidate_id": f"BATCH-{i:03d}",
                "source_type": "disc_csv",
                "raw_data": {},
                "summary": {"name": f"User {i}"}
            }
            for i in range(10)
        ]

        # Should have batch method
        self.assertTrue(hasattr(db_service, 'save_analyses_batch'))

        # Execute batch insert
        result = db_service.save_analyses_batch(analyses)

        self.assertTrue(result["success"])
        self.assertEqual(result["count"], 10)

        print("✅ FIX #3 VERIFIED: Batch insert method working")

    def test_fix4_csv_template_column_names(self):
        """
        MEDIUM FIX #4: CSV template column names
        Verify template matches validation requirements
        """
        pipeline = DISCExternalPipeline()
        template = pipeline.get_csv_template()

        # Parse template
        lines = template.strip().split('\n')
        headers = lines[0].split(',')

        # Verify lowercase headers
        expected = ['candidate_id', 'name', 'd_score', 'i_score', 's_score', 'c_score', 'notes']
        self.assertEqual(headers, expected)

        # Verify sample data is valid
        sample_csv = f"{lines[0]}\n{lines[1]}".encode()
        result = pipeline.process_csv_upload(sample_csv)

        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(len(result["errors"]), 0)

        print("✅ FIX #4 VERIFIED: CSV template matches validation")

    @patch('src.services.disc_pipeline.pytesseract')
    @patch('src.services.disc_pipeline.cv2')
    def test_fix5_ocr_error_includes_candidate_id(self, mock_cv2, mock_pytesseract):
        """
        MEDIUM FIX #5: OCR error context
        Verify errors include candidate_id for traceability
        """
        pipeline = DISCExternalPipeline()

        # Mock to raise exception
        mock_cv2.imdecode.side_effect = Exception("Image decode failed")

        image_bytes = b"corrupted_image"
        result = pipeline.process_ocr_image(image_bytes, candidate_id="OCR-ERROR-001")

        self.assertFalse(result["success"])
        self.assertIn("error", result)
        # FIX: Error should include candidate_id
        self.assertEqual(result["candidate_id"], "OCR-ERROR-001")

        print("✅ FIX #5 VERIFIED: OCR errors include candidate_id")

    def test_fix6_ocr_configurable_settings(self):
        """
        MEDIUM FIX #6: OCR configuration
        Verify OCR settings are configurable via environment
        """
        # Test with custom config
        with patch.dict('os.environ', {'TESSERACT_CONFIG': '--oem 1 --psm 3'}):
            pipeline = DISCExternalPipeline()
            self.assertEqual(pipeline.ocr_config, '--oem 1 --psm 3')

        # Test with default config
        if 'TESSERACT_CONFIG' in os.environ:
            del os.environ['TESSERACT_CONFIG']

        pipeline2 = DISCExternalPipeline()
        self.assertEqual(pipeline2.ocr_config, r'--oem 3 --psm 6')

        print("✅ FIX #6 VERIFIED: OCR config is configurable")

    def test_fix7_credential_validation(self):
        """
        MEDIUM FIX #7: Credential validation
        Verify placeholder detection works
        """
        test_cases = [
            ('https://your_project.supabase.co', True),  # Should be stub
            ('https://placeholder.supabase.co', True),    # Should be stub
            ('https://example.supabase.co', True),        # Should be stub
            ('https://abcdefg.supabase.co', False),       # Should NOT be stub
        ]

        for url, should_be_stub in test_cases:
            os.environ['SUPABASE_URL'] = url
            os.environ['SUPABASE_KEY'] = 'test-key'

            with patch('src.services.database_service.create_client') as mock_create:
                mock_create.return_value = MagicMock()
                DatabaseService._instance = None
                db = DatabaseService()

                if should_be_stub:
                    self.assertTrue(db.is_stub(), f"URL {url} should be detected as placeholder")
                else:
                    self.assertFalse(db.is_stub(), f"URL {url} should be accepted as valid")

        print("✅ FIX #7 VERIFIED: Credential validation improved")


class TestEdgeCases(unittest.TestCase):
    """Test important edge cases."""

    def test_csv_with_unicode_names(self):
        """Test CSV with Vietnamese characters."""
        pipeline = DISCExternalPipeline()
        csv_data = "candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,Nguyễn Văn Anh,8,6,7,5".encode('utf-8')

        result = pipeline.process_csv_upload(csv_data)

        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["candidates"][0]["name"], "Nguyễn Văn Anh")

        print("✅ EDGE CASE: Unicode names handled correctly")

    def test_csv_with_decimal_scores(self):
        """Test CSV with decimal scores."""
        pipeline = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,Test,8.5,6.2,7.8,5.1"

        result = pipeline.process_csv_upload(csv_data)

        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["candidates"][0]["disc_scores"]["d_score"], 8.5)

        print("✅ EDGE CASE: Decimal scores accepted")

    def test_csv_with_invalid_scores(self):
        """Test CSV with out-of-range scores."""
        pipeline = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,Test,15,6,7,5"

        result = pipeline.process_csv_upload(csv_data)

        self.assertEqual(result["processed_count"], 0)
        self.assertGreater(len(result["errors"]), 0)

        print("✅ EDGE CASE: Invalid scores rejected")

    @patch('src.services.database_service.create_client')
    def test_batch_empty_list(self, mock_create_client):
        """Test batch insert with empty list."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        DatabaseService._instance = None
        db_service = DatabaseService()

        result = db_service.save_analyses_batch([])

        self.assertTrue(result["success"])
        self.assertEqual(result["count"], 0)

        print("✅ EDGE CASE: Empty batch handled gracefully")


def run_verification():
    """Run all verification tests and print summary."""
    print("\n" + "="*60)
    print("  CRITICAL BUG FIX VERIFICATION")
    print("="*60 + "\n")

    # Run tests
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    suite.addTests(loader.loadTestsFromTestCase(TestCriticalFixes))
    suite.addTests(loader.loadTestsFromTestCase(TestEdgeCases))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Print summary
    print("\n" + "="*60)
    print("  VERIFICATION SUMMARY")
    print("="*60)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")

    if result.wasSuccessful():
        print("\n✅ ALL CRITICAL FIXES VERIFIED SUCCESSFULLY!")
    else:
        print("\n❌ SOME TESTS FAILED - REVIEW NEEDED")

    print("="*60 + "\n")

    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    exit(run_verification())
