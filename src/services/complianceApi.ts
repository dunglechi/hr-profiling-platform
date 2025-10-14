// Compliance API Service
// Handles all communication with compliance endpoints

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}

interface ConsentRequest {
  userId: string;
  tenantId: string;
  purposes: string[];
  region: string;
  ipAddress: string;
  userAgent: string;
}

interface ConsentGrant extends ConsentRequest {
  consentText: string;
  version: string;
}

interface WithdrawRequest {
  purposes: string[];
  reason: string;
}

class ComplianceApiService {
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}/compliance${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Get auth token from localStorage or context
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Compliance API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Kill Switch Operations
  async getKillSwitchStatus(tenantId: string): Promise<ApiResponse> {
    return this.request(`/kill-switch/${tenantId}/status`);
  }

  async disableInsights(tenantId: string, reason: string, authorizedBy: string): Promise<ApiResponse> {
    return this.request(`/kill-switch/${tenantId}/disable`, {
      method: 'POST',
      body: JSON.stringify({ reason, authorizedBy }),
    });
  }

  async enableInsights(tenantId: string, authorizedBy: string, checklist: string[]): Promise<ApiResponse> {
    return this.request(`/kill-switch/${tenantId}/enable`, {
      method: 'POST',
      body: JSON.stringify({ authorizedBy, checklist }),
    });
  }

  // Consent Management
  async requestConsent(request: ConsentRequest): Promise<ApiResponse> {
    return this.request('/consent/request', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async grantConsent(grant: ConsentGrant): Promise<ApiResponse> {
    return this.request('/consent/grant', {
      method: 'POST',
      body: JSON.stringify(grant),
    });
  }

  async checkConsent(userId: string, tenantId: string, purpose: string): Promise<ApiResponse> {
    return this.request(`/consent/${userId}/${tenantId}/check?purpose=${purpose}`);
  }

  async withdrawConsent(
    userId: string, 
    tenantId: string, 
    purposes: string[], 
    reason: string
  ): Promise<ApiResponse> {
    return this.request(`/consent/${userId}/${tenantId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ purposes, reason }),
    });
  }

  // Data Rights
  async getTransparencyReport(userId: string, tenantId: string): Promise<ApiResponse> {
    return this.request(`/transparency/${userId}/${tenantId}`);
  }

  async requestDataErasure(
    userId: string, 
    tenantId: string, 
    reason: string, 
    scope: string[]
  ): Promise<ApiResponse> {
    return this.request(`/data-erasure/${userId}/${tenantId}`, {
      method: 'POST',
      body: JSON.stringify({ reason, scope }),
    });
  }

  // Export Controls
  async getExportPolicy(tenantId: string): Promise<ApiResponse> {
    return this.request(`/export/${tenantId}/policy`);
  }

  async exportData(
    tenantId: string, 
    includeReference: boolean = false,
    watermark: boolean = true
  ): Promise<ApiResponse> {
    return this.request(`/export/${tenantId}/data`, {
      method: 'POST',
      body: JSON.stringify({ includeReference, watermark }),
    });
  }

  // Regional Compliance
  async getRegionalRequirements(region: string): Promise<ApiResponse> {
    return this.request(`/regional-toggles/requirements/${region}`);
  }

  async configureRegionalCompliance(tenantId: string, region: string): Promise<ApiResponse> {
    return this.request(`/regional-toggles/${tenantId}/configure`, {
      method: 'POST',
      body: JSON.stringify({ region }),
    });
  }

  // Audit Logs
  async getAuditLogs(
    tenantId: string, 
    filters?: {
      action?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/audit/${tenantId}/logs${query}`);
  }

  // Compliance Validation
  async validateCompliance(tenantId: string): Promise<ApiResponse> {
    return this.request(`/validation/${tenantId}/check`);
  }

  // Emergency Controls
  async emergencyStop(tenantId: string, reason: string): Promise<ApiResponse> {
    return this.request(`/emergency/${tenantId}/stop`, {
      method: 'POST',
      body: JSON.stringify({ reason, timestamp: new Date().toISOString() }),
    });
  }
}

// Export singleton instance
export const complianceApi = new ComplianceApiService();

// Export types for use in components
export type {
  ApiResponse,
  ConsentRequest,
  ConsentGrant,
  WithdrawRequest
};