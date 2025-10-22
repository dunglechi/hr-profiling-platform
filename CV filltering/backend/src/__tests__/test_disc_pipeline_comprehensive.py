# backend/src/__tests__/test_disc_pipeline_comprehensive.py
"""
Comprehensive unit tests for DISC Pipeline.
Tests cover all fixes including CSV validation, OCR error handling, and edge cases.
"""

import unittest
from unittest.mock import patch, MagicMock
import io
import sys
from pathlib import Path

# Add parent directories to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.services.disc_pipeline import DISCExternalPipeline


class TestCSVHeaderValidation(unittest.TestCase):
    """Test suite for CSV header validation fixes."""

    def test_empty_csv_file(self):
        """Test handling of completely empty CSV file."""
        pipeline = DISCExternalPipeline()
        csv_data = b""

        result = pipeline.process_csv_upload(csv_data)

        self.assertGreater(len(result["errors"]), 0)
        self.assertIn("Missing required headers", result["errors"][0])
        self.assertEqual(result["processed_count"], 0)

    def test_csv_with_only_headers(self):
        """Test CSV with headers but no data rows."""
        pipeline = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score\n"

        result = pipeline.process_csv_upload(csv_data)

        # Should succeed with 0 records processed
        self.assertEqual(len(result["errors"]), 0)
        self.assertEqual(result["processed_count"], 0)
        self.assertEqual(len(result["candidates"]), 0)

    def test_csv_with_missing_required_header(self):
        """Test CSV missing required header (c_score)."""
        pipeline = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score\nCAND-001,John,8,6,7"

        result = pipeline.process_csv_upload(csv_data)

        self.assertGreater(len(result["errors"]), 0)
        self.assertIn("Missing required headers", result["errors"][0])
        self.assertIn("c_score", result["errors"][0])

    def test_csv_with_extra_columns(self):
        """Test CSV with additional columns beyond required ones."""
        pipeline = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score,notes,extra_field\nCAND-001,John,8,6,7,5,Good candidate,Extra data"

        result = pipeline.process_csv_upload(csv_data)

        # Should succeed - extra columns are OK
        self.assertEqual(len(result["errors"]), 0)
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["candidates"][0]["candidate_id"], "CAND-001")

    def test_csv_with_case_sensitive_headers(self):
        """Test that headers are case-sensitive."""
        pipeline = DISCExternalPipeline()
        csv_data = b"Candidate_ID,Name,D_Score,I_Score,S_Score,C_Score\nCAND-001,John,8,6,7,5"

        result = pipeline.process_csv_upload(csv_data)

        # Should fail - headers must match exactly
        self.assertGreater(len(result["errors"]), 0)
        self.assertIn("Missing required headers", result["errors"][0])

    def test_csv_with_correct_headers_wrong_order(self):
        """Test CSV with correct headers but different order."""
        pipeline = DISCExternalPipeline()
        csv_data = b"name,candidate_id,c_score,s_score,i_score,d_score\nJohn,CAND-001,5,7,6,8"

        result = pipeline.process_csv_upload(csv_data)

        # Should succeed - order doesn't matter for CSV DictReader
        self.assertEqual(len(result["errors"]), 0)
        self.assertEqual(result["processed_count"], 1)


class TestCSVDataValidation(unittest.TestCase):
    """Test suite for CSV data validation and edge cases."""

    def test_csv_with_invalid_score_too_high(self):
        """Test CSV with score above valid range (>10)."""
        pipeline = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,John,11,6,7,5"

        result = pipeline.process_csv_upload(csv_data)

        self.assertEqual(result["processed_count"], 0)
        self.assertGreater(len(result["errors"]), 0)
        self.assertIn("Row 2", result["errors"][0])
        self.assertIn("ngoài khoảng cho phép", result["errors"][0])

    def test_csv_with_invalid_score_too_low(self):
        """Test CSV with score below valid range (<1)."""
        pipeline = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,John,0,6,7,5"

        result = pipeline.process_csv_upload(csv_data)

        self.assertEqual(result["processed_count"], 0)
        self.assertGreater(len(result["errors"]), 0)

    def test_csv_with_non_numeric_score(self):
        """Test CSV with non-numeric score value."""
        pipeline = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,John,abc,6,7,5"

        result = pipeline.process_csv_upload(csv_data)

        self.assertEqual(result["processed_count"], 0)
        self.assertGreater(len(result["errors"]), 0)
        self.assertIn("không phải là số hợp lệ", result["errors"][0])

    def test_csv_with_decimal_scores(self):
        """Test CSV with decimal score values (should be accepted)."""
        pipeline = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,John,8.5,6.2,7.8,5.1"

        result = pipeline.process_csv_upload(csv_data)

        # Should succeed - decimals are valid
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(len(result["errors"]), 0)
        self.assertEqual(result["candidates"][0]["disc_scores"]["d_score"], 8.5)

    def test_csv_with_empty_score_field(self):
        """Test CSV with empty score field."""
        pipeline = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,John,,6,7,5"

        result = pipeline.process_csv_upload(csv_data)

        self.assertEqual(result["processed_count"], 0)
        self.assertGreater(len(result["errors"]), 0)

    def test_csv_with_mixed_valid_invalid_rows(self):
        """Test CSV with both valid and invalid rows."""
        pipeline = DISCExternalPipeline()
        csv_data = b"""candidate_id,name,d_score,i_score,s_score,c_score
CAND-001,Valid User,8,6,7,5
CAND-002,Invalid User,15,6,7,5
CAND-003,Another Valid,7,5,8,6"""

        result = pipeline.process_csv_upload(csv_data)

        # Should process valid rows and report errors for invalid
        self.assertEqual(result["processed_count"], 2)
        self.assertEqual(len(result["errors"]), 1)
        self.assertIn("Row 3", result["errors"][0])  # Row 2 is invalid

    def test_csv_with_max_rows_limit(self):
        """Test CSV respects max rows limit."""
        pipeline = DISCExternalPipeline()

        # Create CSV with 5 valid rows
        rows = ["candidate_id,name,d_score,i_score,s_score,c_score"]
        for i in range(5):
            rows.append(f"CAND-{i:03d},User {i},8,6,7,5")

        csv_data = "\n".join(rows).encode()

        # Mock environment to set low limit
        with patch.dict('os.environ', {'DISC_CSV_MAX_ROWS': '3'}):
            result = pipeline.process_csv_upload(csv_data)

        # Should only process 3 rows
        self.assertEqual(result["processed_count"], 3)
        self.assertGreater(len(result["warnings"]), 0)
        self.assertIn("stopped at 3 rows limit", result["warnings"][0])

    def test_csv_with_unicode_names(self):
        """Test CSV with Vietnamese/Unicode characters."""
        pipeline = DISCExternalPipeline()
        csv_data = "candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,Nguyễn Văn Anh,8,6,7,5".encode('utf-8')

        result = pipeline.process_csv_upload(csv_data)

        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["candidates"][0]["name"], "Nguyễn Văn Anh")

    def test_csv_template_format_matches_validation(self):
        """Test that CSV template matches validation requirements."""
        pipeline = DISCExternalPipeline()
        template = pipeline.get_csv_template()

        # Parse template as CSV
        lines = template.strip().split('\n')
        headers = lines[0].split(',')

        # Verify headers match expected format
        expected_headers = ['candidate_id', 'name', 'd_score', 'i_score', 's_score', 'c_score', 'notes']
        self.assertEqual(headers, expected_headers)

        # Verify sample data is valid
        sample_row = lines[1]  # CAND001 row
        csv_data = f"{lines[0]}\n{sample_row}".encode()
        result = pipeline.process_csv_upload(csv_data)

        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(len(result["errors"]), 0)


class TestDISCProfileGeneration(unittest.TestCase):
    """Test suite for DISC profile generation logic."""

    def test_profile_generation_dominance_primary(self):
        """Test profile with Dominance as primary type."""
        pipeline = DISCExternalPipeline()
        scores = {"d_score": 9.0, "i_score": 5.0, "s_score": 4.0, "c_score": 6.0}

        profile = pipeline.generate_disc_profile(scores)

        self.assertEqual(profile["primary_style"], "Dominance")
        self.assertIn("Quyết đoán", profile["description"])
        self.assertEqual(profile["style_ranking"][0], "D")

    def test_profile_generation_influence_primary(self):
        """Test profile with Influence as primary type."""
        pipeline = DISCExternalPipeline()
        scores = {"d_score": 5.0, "i_score": 9.0, "s_score": 4.0, "c_score": 6.0}

        profile = pipeline.generate_disc_profile(scores)

        self.assertEqual(profile["primary_style"], "Influence")
        self.assertIn("Giao tiếp", profile["description"])

    def test_profile_generation_steadiness_primary(self):
        """Test profile with Steadiness as primary type."""
        pipeline = DISCExternalPipeline()
        scores = {"d_score": 5.0, "i_score": 4.0, "s_score": 9.0, "c_score": 6.0}

        profile = pipeline.generate_disc_profile(scores)

        self.assertEqual(profile["primary_style"], "Steadiness")
        self.assertIn("Ổn định", profile["description"])

    def test_profile_generation_compliance_primary(self):
        """Test profile with Compliance as primary type."""
        pipeline = DISCExternalPipeline()
        scores = {"d_score": 5.0, "i_score": 4.0, "s_score": 6.0, "c_score": 9.0}

        profile = pipeline.generate_disc_profile(scores)

        self.assertEqual(profile["primary_style"], "Compliance")
        self.assertIn("Cẩn thận", profile["description"])

    def test_profile_secondary_type_calculation(self):
        """Test that secondary type is correctly identified."""
        pipeline = DISCExternalPipeline()
        scores = {"d_score": 9.0, "i_score": 8.0, "s_score": 3.0, "c_score": 4.0}

        profile = pipeline.generate_disc_profile(scores)

        self.assertEqual(profile["primary_style"], "Dominance")
        self.assertEqual(profile["secondary_style"], "I")  # Second highest

    def test_profile_style_ranking(self):
        """Test that style ranking is correctly ordered."""
        pipeline = DISCExternalPipeline()
        scores = {"d_score": 3.0, "i_score": 8.0, "s_score": 6.0, "c_score": 9.0}

        profile = pipeline.generate_disc_profile(scores)

        # Should be ordered: C(9), I(8), S(6), D(3)
        self.assertEqual(profile["style_ranking"], ["C", "I", "S", "D"])


class TestOCRProcessing(unittest.TestCase):
    """Test suite for OCR image processing and error handling."""

    @patch('src.services.disc_pipeline.pytesseract')
    @patch('src.services.disc_pipeline.cv2')
    def test_ocr_success_with_text_extraction(self, mock_cv2, mock_pytesseract):
        """Test successful OCR text extraction."""
        pipeline = DISCExternalPipeline()

        # Mock image processing
        mock_cv2.imdecode.return_value = MagicMock()
        mock_cv2.cvtColor.return_value = MagicMock()
        mock_cv2.threshold.return_value = (None, MagicMock())
        mock_cv2.medianBlur.return_value = MagicMock()

        # Mock Tesseract extraction
        mock_pytesseract.image_to_string.return_value = "D: 8\nI: 6\nS: 7\nC: 5"

        image_bytes = b"fake_image_data"
        result = pipeline.process_ocr_image(image_bytes, candidate_id="OCR-001")

        self.assertTrue(result["success"])
        self.assertEqual(result["candidate_id"], "OCR-001")
        self.assertIn("D: 8", result["extracted_text"])
        self.assertEqual(result["source"], "ocr_tesseract")

    @patch('src.services.disc_pipeline.pytesseract')
    @patch('src.services.disc_pipeline.cv2')
    def test_ocr_error_includes_candidate_id(self, mock_cv2, mock_pytesseract):
        """Test that OCR errors include candidate_id for traceability."""
        pipeline = DISCExternalPipeline()

        # Mock to raise exception
        mock_cv2.imdecode.side_effect = Exception("Image decode failed")

        image_bytes = b"corrupted_image"
        result = pipeline.process_ocr_image(image_bytes, candidate_id="OCR-ERROR-001")

        self.assertFalse(result["success"])
        self.assertIn("error", result)
        self.assertEqual(result["candidate_id"], "OCR-ERROR-001")  # Should include candidate_id

    @patch('src.services.disc_pipeline.pytesseract')
    @patch('src.services.disc_pipeline.cv2')
    def test_ocr_uses_configurable_settings(self, mock_cv2, mock_pytesseract):
        """Test that OCR uses configurable Tesseract settings."""
        # Mock image processing
        mock_cv2.imdecode.return_value = MagicMock()
        mock_cv2.cvtColor.return_value = MagicMock()
        mock_cv2.threshold.return_value = (None, MagicMock())
        mock_cv2.medianBlur.return_value = MagicMock()
        mock_pytesseract.image_to_string.return_value = "Test text"

        # Test with custom config
        with patch.dict('os.environ', {'TESSERACT_CONFIG': '--oem 1 --psm 3'}):
            pipeline = DISCExternalPipeline()
            self.assertEqual(pipeline.ocr_config, '--oem 1 --psm 3')

            image_bytes = b"fake_image"
            result = pipeline.process_ocr_image(image_bytes)

            # Verify Tesseract was called with custom config
            mock_pytesseract.image_to_string.assert_called_once()
            call_kwargs = mock_pytesseract.image_to_string.call_args[1]
            self.assertEqual(call_kwargs['config'], '--oem 1 --psm 3')


class TestManualInputProcessing(unittest.TestCase):
    """Test suite for manual DISC input processing."""

    def test_manual_input_valid_scores(self):
        """Test manual input with valid DISC scores."""
        pipeline = DISCExternalPipeline()

        data = {
            "d_score": 8,
            "i_score": 6,
            "s_score": 7,
            "c_score": 5,
            "notes": "Manual assessment"
        }

        result = pipeline.process_manual_input("MANUAL-001", data)

        self.assertTrue(result["success"])
        self.assertEqual(result["candidate_id"], "MANUAL-001")
        self.assertEqual(result["source"], "manual_input")
        self.assertIn("disc_profile", result)
        self.assertEqual(result["notes"], "Manual assessment")

    def test_manual_input_invalid_scores(self):
        """Test manual input with invalid scores."""
        pipeline = DISCExternalPipeline()

        data = {
            "d_score": 15,  # Invalid: > 10
            "i_score": 6,
            "s_score": 7,
            "c_score": 5
        }

        result = pipeline.process_manual_input("MANUAL-002", data)

        self.assertFalse(result["success"])
        self.assertIn("error", result)

    def test_manual_input_missing_scores(self):
        """Test manual input with missing required scores."""
        pipeline = DISCExternalPipeline()

        data = {
            "d_score": 8,
            "i_score": 6,
            # Missing s_score and c_score
        }

        result = pipeline.process_manual_input("MANUAL-003", data)

        self.assertFalse(result["success"])
        self.assertIn("Missing DISC scores", result["error"])


if __name__ == '__main__':
    unittest.main()
