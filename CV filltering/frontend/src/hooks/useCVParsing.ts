import { useState, useCallback } from 'react';
import { MockData } from '../mockData';

interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  experience: Array<{
    position: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  numerologyInsights: {
    lifePath: number;
    personality: string;
    careerFit: string;
    compatibilityScore: number;
  };
}

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
      // For Week 2 Demo: Use mock data for quick testing
      console.log(`Demo Mode: Processing ${file.name}`);
      
      // Mock processing with realistic delay
      const result = await MockData.mockProcessFile(file);
      
      if (result.success) {
        setCvData(result.data);
        console.log('✅ CV processing completed successfully');
      } else {
        throw new Error('Mock processing failed');
      }

      // Real API implementation (commented for demo):
      /*
      const formData = new FormData();
      formData.append('cv_file', file);

      const response = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setCvData(result.data);
      } else {
        throw new Error(result.error || 'Failed to parse CV');
      }
      */

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

  return {
    cvData,
    isLoading,
    error,
    uploadFile,
    resetState,
  };
};