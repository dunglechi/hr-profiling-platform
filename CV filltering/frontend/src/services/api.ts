/**
 * API Client for Backend Integration
 * Handles all communication với Flask services
 */

const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  timestamp?: string;
}

interface NumerologyCalculationRequest {
  name: string;
  birth_date: string;
  candidate_id: string;
}

interface NumerologyManualInputRequest {
  candidate_id: string;
  manual_name: string;
  manual_birth_date: string;
  recruiter_notes?: string;
}

interface DISCManualInputRequest {
  candidate_id: string;
  d_score: number;
  i_score: number;
  s_score: number;
  c_score: number;
  notes?: string;
  recruiter_id?: string;
}

interface DISCData {
  raw_scores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  primary_style: string;
  secondary_style: string;
  style_intensity: string;
  behavioral_description: string;
  upload_method: string;
}

interface NumerologyData {
  life_path_number: number;
  birth_number: number;
  life_path_meaning: string;
  birth_meaning: string;
  compatibility_note: string;
}

class BackendApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`API Error [${response.status}]:`, data);
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          warnings: data.warnings || [],
        };
      }

      return {
        success: true,
        data: data.data || data,
        warnings: data.warnings || [],
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: 'Network error - Unable to connect to backend',
      };
    }
  }

  // NUMEROLOGY API METHODS
  async calculateNumerology(request: NumerologyCalculationRequest): Promise<ApiResponse<NumerologyData>> {
    console.log('🔢 Calculating numerology for candidate:', request.candidate_id);
    
    return this.makeRequest<NumerologyData>('/numerology/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async manualInputNumerology(request: NumerologyManualInputRequest): Promise<ApiResponse<NumerologyData>> {
    console.log('✏️ Manual numerology input for candidate:', request.candidate_id);
    
    return this.makeRequest<NumerologyData>('/numerology/manual-input', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getNumerologyStatus(candidateId: string): Promise<ApiResponse> {
    return this.makeRequest(`/numerology/status/${candidateId}`);
  }

  async testNumerologyService(): Promise<ApiResponse> {
    return this.makeRequest('/numerology/test');
  }

  // DISC API METHODS
  async uploadDISCCsv(candidateId: string, file: File): Promise<ApiResponse<DISCData>> {
    console.log('📊 Uploading DISC CSV for candidate:', candidateId);
    
    const formData = new FormData();
    formData.append('candidate_id', candidateId);
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/disc/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          warnings: data.warnings || [],
        };
      }

      return {
        success: true,
        data: data.data,
        warnings: data.warnings || [],
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('DISC CSV upload error:', error);
      return {
        success: false,
        error: 'Failed to upload CSV file',
      };
    }
  }

  async manualInputDISC(request: DISCManualInputRequest): Promise<ApiResponse<DISCData>> {
    console.log('✏️ Manual DISC input for candidate:', request.candidate_id);
    
    return this.makeRequest<DISCData>('/disc/manual-input', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateDISCSurvey(): Promise<ApiResponse> {
    console.log('📋 Generating DISC survey template');
    
    return this.makeRequest('/disc/generate-survey');
  }

  async uploadDISCOcrImage(candidateId: string, imageFile: File): Promise<ApiResponse<DISCData>> {
    console.log('📸 Uploading DISC OCR image for candidate:', candidateId);
    
    const formData = new FormData();
    formData.append('candidate_id', candidateId);
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${this.baseUrl}/disc/upload-ocr-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          warnings: data.warnings || [],
        };
      }

      return {
        success: true,
        data: data.data,
        warnings: data.warnings || [],
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('DISC OCR upload error:', error);
      return {
        success: false,
        error: 'Failed to upload OCR image',
      };
    }
  }

  async getDISCStatus(candidateId: string): Promise<ApiResponse> {
    return this.makeRequest(`/disc/status/${candidateId}`);
  }

  async downloadDISCCsvTemplate(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/disc/formats/csv-template`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'disc_upload_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download CSV template');
      }
    } catch (error) {
      console.error('CSV template download error:', error);
    }
  }

  async testDISCPipeline(): Promise<ApiResponse> {
    return this.makeRequest('/disc/test');
  }

  // HEALTH CHECK
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health', { method: 'GET' });
  }

  async getApiInfo(): Promise<ApiResponse> {
    return this.makeRequest('/', { method: 'GET' });
  }
}

// Activity logging for frontend
interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  type: 'cv_upload' | 'numerology_calculation' | 'disc_input' | 'shortlist_action' | 'manual_input';
  candidateId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  details?: any;
}

class ActivityLogger {
  private logs: ActivityLogEntry[] = [];
  private listeners: Array<(logs: ActivityLogEntry[]) => void> = [];

  log(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: ActivityLogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    this.logs.unshift(logEntry); // Add to beginning
    
    // Keep only last 100 entries
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    console.log(`[${logEntry.severity.toUpperCase()}] ${logEntry.type}:`, logEntry.message);
    
    // Notify listeners
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  subscribe(listener: (logs: ActivityLogEntry[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getLogs(): ActivityLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    this.listeners.forEach(listener => listener([]));
  }
}

// Export singleton instances
export const apiClient = new BackendApiClient();
export const activityLogger = new ActivityLogger();

// Export types
export type {
  ApiResponse,
  NumerologyCalculationRequest,
  NumerologyManualInputRequest,
  DISCManualInputRequest,
  DISCData,
  NumerologyData,
  ActivityLogEntry,
};

// Utility functions
export const formatApiError = (response: ApiResponse): string => {
  if (response.error) {
    return response.error;
  }
  if (response.warnings && response.warnings.length > 0) {
    return response.warnings.join(', ');
  }
  return 'Unknown error occurred';
};

export const isBackendConnected = async (): Promise<boolean> => {
  try {
    const response = await apiClient.healthCheck();
    return response.success;
  } catch {
    return false;
  }
};

console.log('🔌 Backend API Client initialized');
console.log('🏥 Health check endpoint:', `${API_BASE_URL.replace('/api', '')}/health`);
console.log('📚 API documentation:', `${API_BASE_URL.replace('/api', '')}/api`);