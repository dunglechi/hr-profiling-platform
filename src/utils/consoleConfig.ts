// Development console configuration
if (import.meta.env.DEV) {
  // Suppress specific warnings in development
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    
    // Filter out React DevTools and Router warnings
    if (
      typeof message === 'string' && 
      (
        message.includes('React DevTools') ||
        message.includes('React Router Future Flag Warning') ||
        message.includes('Download the React DevTools')
      )
    ) {
      return; // Don't show these warnings
    }
    
    originalWarn.apply(console, args);
  };

  // Suppress browser extension errors
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    
    if (
      typeof message === 'string' && 
      (
        message.includes('runtime.lastError') ||
        message.includes('Receiving end does not exist') ||
        message.includes('Could not establish connection') ||
        message.includes('content.js') ||
        message.includes('mountUi return undefined')
      )
    ) {
      return; // Don't show extension errors
    }
    
    originalError.apply(console, args);
  };

  // Handle global unhandled errors
  window.addEventListener('error', (event) => {
    if (
      event.message.includes('runtime.lastError') ||
      event.message.includes('Receiving end does not exist') ||
      event.filename?.includes('content.js')
    ) {
      event.preventDefault();
      return false;
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || event.reason;
    if (
      typeof message === 'string' &&
      (
        message.includes('runtime.lastError') ||
        message.includes('Receiving end does not exist')
      )
    ) {
      event.preventDefault();
      return false;
    }
  });
}

export {};