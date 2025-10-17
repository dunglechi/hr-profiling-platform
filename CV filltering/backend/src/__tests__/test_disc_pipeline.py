# backend/src/__tests__/test_disc_pipeline.py
import unittest
from backend.src.services.disc_pipeline import DISCExternalPipeline

class TestDiscPipelineCsv(unittest.TestCase):

    def test_process_valid_csv(self):
        service = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-001,John Doe,8,5,3,7"
        result = service.process_csv_upload(csv_data)
        self.assertEqual(result['processed_count'], 1)
        self.assertEqual(len(result['errors']), 0)
        self.assertEqual(result['candidates'][0]['candidate_id'], 'CAND-001')

    def test_process_csv_with_invalid_score(self):
        service = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score,c_score\nCAND-003,Invalid User,11,5,5,5"
        result = service.process_csv_upload(csv_data)
        self.assertEqual(result['processed_count'], 0)
        self.assertIn("Row 2: Invalid data", result['errors'][0])

    def test_process_csv_with_missing_header(self):
        service = DISCExternalPipeline()
        csv_data = b"candidate_id,name,d_score,i_score,s_score\nCAND-001,John Doe,8,5,3"
        result = service.process_csv_upload(csv_data)
        self.assertIn("Missing required headers", result['errors'][0])

if __name__ == '__main__':
    unittest.main()
