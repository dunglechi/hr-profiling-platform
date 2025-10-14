import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

// Sentry Configuration for Production Monitoring
export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT || 'production',
    integrations: [
      new BrowserTracing(),
    ],
    
    // Performance Monitoring
    tracesSampleRate: 1.0, // 100% sampling during beta
    
    // Error Filtering for Production
    beforeSend(event, hint) {
      // Filter out development-only errors
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error && 
            typeof error.message === 'string' && error.message.includes('Development mode')) {
          return null;
        }
      }
      return event;
    },

    // Custom Tags for Better Categorization
    initialScope: {
      tags: {
        component: 'hr-platform',
        version: '1.0.0'
      }
    }
  });
};

// Simple Error Boundary (will be wrapped by Sentry)
export const ErrorBoundary = Sentry.withErrorBoundary;

// Performance Monitoring Helpers
export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: action,
    category: 'user.action',
    data: properties,
    level: 'info',
  });
};

export const trackPerformance = (name: string, duration: number) => {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    category: 'performance',
    data: { duration, unit: 'ms' },
    level: 'info',
  });
};

export const trackApiCall = (endpoint: string, duration: number, status: 'success' | 'error') => {
  Sentry.addBreadcrumb({
    message: `API Call: ${endpoint}`,
    category: 'api',
    data: { 
      duration, 
      status,
      timestamp: new Date().toISOString()
    },
    level: status === 'error' ? 'error' : 'info',
  });
};