# backend/src/__tests__/test_security_validation.py
"""
Security validation tests for CV Filtering Backend.
Tests for input sanitization, file size limits, and security best practices.
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

from src.services.disc_pipeline import DISCExternalPipeline
from src.services.database_service import DatabaseService


class TestInputSanitization(unittest.TestCase):
    """Test input sanitization and SQL injection prevention."""

    @patch('src.services.database_service.create_client')
    def test_candidate_id_with_sql_injection_attempt(self, mock_create_client):
        """Test that SQL injection attempts in candidate_id are handled safely."""
        mock_client = MagicMock()
        mock_create_client.return_value = mock_client

        mock_table = MagicMock()
        mock_client.table.return_value = mock_table
        mock_table.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.insert.return_value.execute.return_value = MagicMock()

        DatabaseService._instance = None
        db = DatabaseService()

        # SQL injection attempts
        malicious_ids = [
            "'; DROP TABLE candidates; --",
            "1' OR '1'='1",
            "admin'--",
            "<script>alert('xss')</script>",
            "../../etc/passwd"
        ]

        for malicious_id in malicious_ids:
            result = db.save_analysis(
                candidate_id=malicious_id,
                source_type="test",
                raw_data={},
                summary={"name": "Test"}
            )

            # Should not crash, Supabase handles parameterization
            self.assertIsNotNone(result)

        print("✅ SQL injection attempts handled safely")

    def test_csv_with_malicious_content(self):
        """Test CSV with potentially malicious content."""
        pipeline = DISCExternalPipeline()

        # CSV with script injection attempt
        csv_data = b"""candidate_id,name,d_score,i_score,s_score,c_score
CAND-001,<script>alert('xss')</script>,8,6,7,5
CAND-002,=cmd|'/c calc'!A1,7,5,8,6"""

        result = pipeline.process_csv_upload(csv_data)

        # Should process but preserve data as-is (no execution)
        self.assertEqual(result["processed_count"], 2)
        self.assertIn("<script>", result["candidates"][0]["name"])

        print("✅ Malicious CSV content handled without execution")


class TestFileSizeValidation(unittest.TestCase):
    """Test file size limits and large file handling."""

    def test_csv_row_limit_enforcement(self):
        """Test that CSV row limit is enforced."""
        pipeline = DISCExternalPipeline()

        # Create CSV with many rows
        rows = ["candidate_id,name,d_score,i_score,s_score,c_score"]
        for i in range(2000):  # More than default limit
            rows.append(f"CAND-{i:04d},User {i},8,6,7,5")

        csv_data = "\n".join(rows).encode()

        # Should respect DISC_CSV_MAX_ROWS limit
        with patch.dict('os.environ', {'DISC_CSV_MAX_ROWS': '100'}):
            result = pipeline.process_csv_upload(csv_data)

            # Should only process 100 rows
            self.assertEqual(result["processed_count"], 100)
            self.assertGreater(len(result["warnings"]), 0)
            self.assertIn("100 rows limit", result["warnings"][0])

        print("✅ CSV row limit enforced correctly")

    def test_very_long_field_values(self):
        """Test handling of extremely long field values."""
        pipeline = DISCExternalPipeline()

        # CSV with very long name
        long_name = "A" * 10000  # 10k characters
        csv_data = f"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,{long_name},8,6,7,5".encode()

        result = pipeline.process_csv_upload(csv_data)

        # Should handle long strings
        self.assertEqual(result["processed_count"], 1)

        print("✅ Long field values handled")


class TestDataValidationSecurity(unittest.TestCase):
    """Test data validation for security."""

    def test_score_type_coercion_attack(self):
        """Test that scores can't be coerced to bypass validation."""
        pipeline = DISCExternalPipeline()

        test_cases = [
            ("inf", False),  # Infinity
            ("nan", False),  # NaN
            ("1e10", False),  # Scientific notation (too large)
            ("8", True),     # Valid
            ("8.5", True),   # Valid decimal
        ]

        for score_value, should_pass in test_cases:
            csv_data = f"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,Test,{score_value},6,7,5".encode()
            result = pipeline.process_csv_upload(csv_data)

            if should_pass:
                self.assertEqual(result["processed_count"], 1, f"Score {score_value} should pass")
            else:
                self.assertEqual(result["processed_count"], 0, f"Score {score_value} should fail")

        print("✅ Score type coercion prevented")

    def test_disc_profile_with_all_same_scores(self):
        """Test DISC profile generation with edge case of all equal scores."""
        pipeline = DISCExternalPipeline()

        # All scores equal
        scores = {"d_score": 5.0, "i_score": 5.0, "s_score": 5.0, "c_score": 5.0}
        profile = pipeline.generate_disc_profile(scores)

        # Should still generate valid profile
        self.assertIn(profile["primary_style"], ["Dominance", "Influence", "Steadiness", "Compliance"])
        self.assertIsInstance(profile["style_ranking"], list)
        self.assertEqual(len(profile["style_ranking"]), 4)

        print("✅ Edge case: All equal scores handled")

    def test_disc_profile_with_extreme_scores(self):
        """Test DISC profile with extreme score differences."""
        pipeline = DISCExternalPipeline()

        # One very high, others very low
        scores = {"d_score": 10.0, "i_score": 1.0, "s_score": 1.0, "c_score": 1.0}
        profile = pipeline.generate_disc_profile(scores)

        self.assertEqual(profile["primary_style"], "Dominance")
        self.assertEqual(profile["style_ranking"][0], "D")

        print("✅ Extreme score differences handled")


class TestEnvironmentVariableSecurity(unittest.TestCase):
    """Test environment variable handling security."""

    def test_missing_environment_variables_dont_crash(self):
        """Test that missing env vars don't crash the system."""
        # Remove all Supabase env vars
        original_url = os.environ.pop('SUPABASE_URL', None)
        original_key = os.environ.pop('SUPABASE_KEY', None)

        try:
            DatabaseService._instance = None
            db = DatabaseService()

            # Should enter stub mode gracefully
            self.assertTrue(db.is_stub())

            # Should still work in stub mode
            result = db.save_analysis("TEST", "test", {}, {})
            self.assertTrue(result["stub"])

            print("✅ Missing env vars handled gracefully")

        finally:
            # Restore
            if original_url:
                os.environ['SUPABASE_URL'] = original_url
            if original_key:
                os.environ['SUPABASE_KEY'] = original_key

    def test_environment_variable_injection(self):
        """Test that env vars with malicious content are handled."""
        malicious_configs = [
            "--oem 3; rm -rf /",
            "--oem $(whoami)",
            "--oem `cat /etc/passwd`"
        ]

        for malicious_config in malicious_configs:
            with patch.dict('os.environ', {'TESSERACT_CONFIG': malicious_config}):
                pipeline = DISCExternalPipeline()

                # Should accept but not execute
                self.assertEqual(pipeline.ocr_config, malicious_config)

        print("✅ Malicious env vars don't execute")


class TestConcurrencyAndRaceConditions(unittest.TestCase):
    """Test concurrent access and race conditions."""

    def test_singleton_thread_safety(self):
        """Test that DatabaseService singleton is thread-safe."""
        import threading

        instances = []

        def create_instance():
            instances.append(DatabaseService())

        # Create multiple instances concurrently
        threads = [threading.Thread(target=create_instance) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # All should be the same instance
        self.assertTrue(all(inst is instances[0] for inst in instances))

        print("✅ Singleton pattern is thread-safe")


if __name__ == '__main__':
    unittest.main()
