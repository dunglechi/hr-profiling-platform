import React from 'react';
import * as Sentry from "@sentry/react";

// Custom Error Boundary Component with JSX
const CustomErrorFallback = ({ error, resetError }: { 
  error: unknown; 
  resetError: () => void;
  componentStack?: string;
  eventId?: string;
}) => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center',
    background: '#f5f5f5',
    borderRadius: '8px',
    margin: '2rem'
  }}>
    <h2>🚨 Oops! Something went wrong</h2>
    <p>We've been notified and are working on a fix.</p>
    <details style={{ marginTop: '1rem', textAlign: 'left' }}>
      <summary>Technical Details</summary>
      <pre style={{ 
        background: '#fff', 
        padding: '1rem', 
        marginTop: '0.5rem',
        fontSize: '0.8rem',
        overflow: 'auto'
      }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
    </details>
    <button 
      onClick={resetError}
      style={{
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        background: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Try Again
    </button>
  </div>
);

// Export Error Boundary wrapped component
export const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Sentry.ErrorBoundary fallback={CustomErrorFallback} showDialog={false}>
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default ErrorBoundary;