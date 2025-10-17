import { useState, useCallback } from 'react';
import { uploadDiscCsv } from '../services/api';
import { DiscCsvUploadResult } from '../types';

interface UseDiscCsvUploadReturn {
  uploadResult: DiscCsvUploadResult | null;
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<void>;
  resetState: () => void;
}

export const useDiscCsvUpload = (): UseDiscCsvUploadReturn => {
  const [uploadResult, setUploadResult] = useState<DiscCsvUploadResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await uploadDiscCsv(file);
      
      if (result.success && result.data) {
        setUploadResult(result.data);
        console.log('✅ DISC CSV processing completed successfully via API');
      } else {
        // The error from the backend is often in result.error
        throw new Error(result.error || 'Failed to process DISC CSV via API');
      }

    } catch (err) {
      console.error('DISC CSV upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setUploadResult(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { uploadResult, isLoading, error, uploadFile, resetState };
};
