// frontend/src/types/index.ts

// Re-exporting types from other files for easier access
export * from './cv';

// You can add other shared types here in the future
export interface DiscCsvUploadResult {
    processed_count: number;
    errors: string[];
    warnings: string[];
    candidates: Array<{
      candidate_id: string;
      name: string;
      scores: { d: number; i: number; s: number; c: number };
      source: string;
      row_index: number;
    }>;
  }
  