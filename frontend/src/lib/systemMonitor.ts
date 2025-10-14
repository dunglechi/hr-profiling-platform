import { supabase } from './supabase';

export interface SystemMetrics {
  timestamp: string;
  apiCalls: {
    total: number;
    byEndpoint: Record<string, number>;
    avgResponseTime: number;
    errorRate: number;
  };
  aiCosts: {
    openaiTokens: number;
    estimatedCost: number;
    cvAnalysisCalls: number;
    averageTokensPerCall: number;
  };
  userActivity: {
    activeUsers: number;
    completedAssessments: number;
    peakConcurrentUsers: number;
  };
  systemHealth: {
    memoryUsage: number;
    errorCount: number;
    warningCount: number;
  };
}

class SystemMonitor {
  private metrics: SystemMetrics[] = [];
  private currentMetrics: Partial<SystemMetrics> = {};

  // Track API performance
  startApiCall(endpoint: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.logApiMetric(endpoint, duration, 'success');
    };
  }

  logApiError(endpoint: string, error: any) {
    this.logApiMetric(endpoint, 0, 'error');
    console.error(`API Error - ${endpoint}:`, error);
  }

  private logApiMetric(endpoint: string, duration: number, status: 'success' | 'error') {
    if (!this.currentMetrics.apiCalls) {
      this.currentMetrics.apiCalls = {
        total: 0,
        byEndpoint: {},
        avgResponseTime: 0,
        errorRate: 0
      };
    }

    this.currentMetrics.apiCalls.total++;
    this.currentMetrics.apiCalls.byEndpoint[endpoint] = 
      (this.currentMetrics.apiCalls.byEndpoint[endpoint] || 0) + 1;
    
    if (status === 'success') {
      this.currentMetrics.apiCalls.avgResponseTime = 
        (this.currentMetrics.apiCalls.avgResponseTime + duration) / 2;
    } else {
      this.currentMetrics.apiCalls.errorRate = 
        (this.currentMetrics.apiCalls.errorRate + 1) / this.currentMetrics.apiCalls.total;
    }
  }

  // Track AI costs (OpenAI token usage)
  logAiUsage(service: 'cv-analysis' | 'job-matching', tokens: number, estimatedCost: number) {
    if (!this.currentMetrics.aiCosts) {
      this.currentMetrics.aiCosts = {
        openaiTokens: 0,
        estimatedCost: 0,
        cvAnalysisCalls: 0,
        averageTokensPerCall: 0
      };
    }

    this.currentMetrics.aiCosts.openaiTokens += tokens;
    this.currentMetrics.aiCosts.estimatedCost += estimatedCost;
    
    if (service === 'cv-analysis') {
      this.currentMetrics.aiCosts.cvAnalysisCalls++;
      this.currentMetrics.aiCosts.averageTokensPerCall = 
        this.currentMetrics.aiCosts.openaiTokens / this.currentMetrics.aiCosts.cvAnalysisCalls;
    }
  }

  // Track user activity
  logUserAction(action: 'login' | 'assessment_start' | 'assessment_complete' | 'logout') {
    if (!this.currentMetrics.userActivity) {
      this.currentMetrics.userActivity = {
        activeUsers: 0,
        completedAssessments: 0,
        peakConcurrentUsers: 0
      };
    }

    switch (action) {
      case 'assessment_complete':
        this.currentMetrics.userActivity.completedAssessments++;
        break;
      case 'login':
        this.currentMetrics.userActivity.activeUsers++;
        break;
      case 'logout':
        this.currentMetrics.userActivity.activeUsers = 
          Math.max(0, this.currentMetrics.userActivity.activeUsers - 1);
        break;
    }

    // Track peak concurrent users
    if (this.currentMetrics.userActivity.activeUsers > 
        this.currentMetrics.userActivity.peakConcurrentUsers) {
      this.currentMetrics.userActivity.peakConcurrentUsers = 
        this.currentMetrics.userActivity.activeUsers;
    }
  }

  // Save metrics to database every 5 minutes
  async saveMetrics() {
    const timestamp = new Date().toISOString();
    const completeMetrics: SystemMetrics = {
      timestamp,
      apiCalls: this.currentMetrics.apiCalls || {
        total: 0,
        byEndpoint: {},
        avgResponseTime: 0,
        errorRate: 0
      },
      aiCosts: this.currentMetrics.aiCosts || {
        openaiTokens: 0,
        estimatedCost: 0,
        cvAnalysisCalls: 0,
        averageTokensPerCall: 0
      },
      userActivity: this.currentMetrics.userActivity || {
        activeUsers: 0,
        completedAssessments: 0,
        peakConcurrentUsers: 0
      },
      systemHealth: {
        memoryUsage: this.getMemoryUsage(),
        errorCount: 0,
        warningCount: 0
      }
    };

    try {
      const { error } = await supabase
        .from('system_metrics')
        .insert(completeMetrics);

      if (error) {
        console.error('Failed to save metrics:', error);
      } else {
        console.log('Metrics saved successfully');
        // Reset current metrics
        this.currentMetrics = {};
      }
    } catch (error) {
      console.error('Metrics save error:', error);
    }
  }

  private getMemoryUsage(): number {
    // Browser memory estimation
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  // Get real-time metrics for dashboard
  getCurrentMetrics(): Partial<SystemMetrics> {
    return {
      ...this.currentMetrics,
      timestamp: new Date().toISOString()
    };
  }

  // Get historical metrics
  async getHistoricalMetrics(hours: number = 24): Promise<SystemMetrics[]> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .gte('timestamp', cutoffTime.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch historical metrics:', error);
      return [];
    }
  }

  // Start automatic metric collection
  startMonitoring() {
    // Save metrics every 5 minutes
    setInterval(() => {
      this.saveMetrics();
    }, 5 * 60 * 1000);

    console.log('System monitoring started - metrics will be saved every 5 minutes');
  }
}

export const systemMonitor = new SystemMonitor();

// Wrapper functions for easy integration
export const trackApiCall = (endpoint: string) => systemMonitor.startApiCall(endpoint);
export const trackApiError = (endpoint: string, error: any) => systemMonitor.logApiError(endpoint, error);
export const trackAiUsage = (service: 'cv-analysis' | 'job-matching', tokens: number, cost: number) => 
  systemMonitor.logAiUsage(service, tokens, cost);
export const trackUserAction = (action: 'login' | 'assessment_start' | 'assessment_complete' | 'logout') => 
  systemMonitor.logUserAction(action);