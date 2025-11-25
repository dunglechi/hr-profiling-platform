import { useState, useCallback } from 'react';
import { parseCV } from '../services/api';
import { CVData } from '../types';

interface UseCVParsingReturn {
  cvData: CVData | null;
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<void>;
  resetState: () => void;
}

export const useCVParsing = (): UseCVParsingReturn => {
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setCvData(null);

    try {
      const result = await parseCV(file);
      
      if (result.success && result.data) {
        setCvData(result.data);
        console.log('✅ CV processing completed successfully via API');
        if (result.warnings && result.warnings.length > 0) {
          // Optionally handle warnings, e.g., display them to the user
          console.warn('Warnings from API:', result.warnings);
        }
      } else {
        throw new Error(result.error || 'Failed to parse CV via API');
      }

    } catch (err) {
      console.error('CV parsing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setCvData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { cvData, isLoading, error, uploadFile, resetState };
};