# Content Security Policy (CSP) Implementation Guide

## Overview
This document outlines the CSP implementation for the HR Profiling Platform, addressing the security requirements while maintaining development productivity.

## CSP Configurations

### Development CSP (index.html)
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; 
  style-src 'self' 'unsafe-inline' blob: https://fonts.googleapis.com; 
  img-src 'self' data: blob: http: https:; 
  font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com; 
  connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*; 
  worker-src 'self' blob:;
">
```

**Features:**
- ✅ `unsafe-eval` allowed for React DevTools
- ✅ `unsafe-inline` allowed for hot reload
- ✅ WebSocket connections for HMR
- ✅ Localhost connections for API proxy

### Production CSP (index.prod.html)
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self'; 
  script-src 'self'; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  img-src 'self' data: blob: http: https:; 
  font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com; 
  connect-src 'self' https:; 
  worker-src 'self' blob:; 
  frame-src 'none'; 
  object-src 'none'; 
  base-uri 'self'; 
  form-action 'self';
">
```

**Security Features:**
- 🔒 No `unsafe-eval` - prevents code injection
- 🔒 No `unsafe-inline` for scripts - prevents XSS
- 🔒 Restricted connect sources - only HTTPS in production
- 🔒 `frame-src 'none'` - prevents clickjacking
- 🔒 `object-src 'none'` - prevents plugin-based attacks

## Implementation Details

### 1. Build Configuration
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    build: {
      rollupOptions: {
        input: isProduction ? './index.prod.html' : './index.html'
      },
    }
  };
});
```

### 2. Library Compatibility

#### ✅ CSP-Compatible Libraries
- **React**: ✅ Works with strict CSP
- **Material-UI**: ✅ Works with `unsafe-inline` for styles
- **React Router**: ✅ No eval usage
- **i18next**: ✅ No eval usage

#### ❌ CSP-Incompatible Libraries (Removed)
- **Recharts**: ❌ Uses eval() for chart rendering
  - **Replacement**: Custom Material-UI charts or Chart.js

### 3. Code Patterns

#### ✅ CSP-Safe Patterns
```typescript
// Safe: Static imports
import { Component } from 'library';

// Safe: JSON parsing
const data = JSON.parse(jsonString);

// Safe: Template literals
const html = `<div>${content}</div>`;
```

#### ❌ CSP-Unsafe Patterns (Avoided)
```typescript
// Unsafe: eval()
eval('code');

// Unsafe: Function constructor
new Function('code');

// Unsafe: setTimeout with string
setTimeout('code', 1000);
```

## Development Workflow

### Building for Development
```bash
npm run dev
# Uses index.html with relaxed CSP
```

### Building for Production
```bash
npm run build
# Uses index.prod.html with strict CSP
```

### Testing CSP Compliance
```bash
# Check for CSP violations in browser console
# Look for "Content Security Policy" errors
```

## Monitoring and Compliance

### Browser Testing
1. Open browser developer tools
2. Check Console tab for CSP violations
3. Look for messages like: "Refused to execute inline script because it violates the following Content Security Policy directive"

### Automated Testing
```typescript
// Future: Add CSP compliance tests
describe('CSP Compliance', () => {
  it('should not have CSP violations', () => {
    // Test implementation
  });
});
```

## Security Benefits

### Protection Against
- **XSS Attacks**: Script injection prevention
- **Code Injection**: No eval() execution
- **Clickjacking**: Frame restrictions
- **Data Exfiltration**: Connection restrictions
- **Plugin Exploits**: Object restrictions

### Performance Benefits
- **Faster Loading**: No inline scripts to parse
- **Better Caching**: Separate CSS/JS files
- **Reduced Attack Surface**: Minimal permissions

## Migration Path

### Phase 1: Current Implementation ✅
- Dual CSP configuration (dev/prod)
- Recharts removal and replacement
- Basic CSP compliance

### Phase 2: Enhanced Security (Future)
- Nonce-based CSP for styles
- Report-only mode testing
- CSP violation monitoring

### Phase 3: Advanced Features (Future)
- Subresource Integrity (SRI)
- Trusted Types implementation
- CSP Level 3 features

## Troubleshooting

### Common Issues
1. **Charts not displaying**: Check if using CSP-compatible chart library
2. **Styles broken**: Ensure `unsafe-inline` for styles in production
3. **API calls failing**: Check `connect-src` directive
4. **Fonts not loading**: Verify `font-src` includes font CDNs

### Debug Steps
1. Open browser DevTools
2. Check Console for CSP errors
3. Verify CSP header in Network tab
4. Test with CSP disabled to isolate issues

## Compliance Status

- ✅ Development CSP: Implemented
- ✅ Production CSP: Implemented  
- ✅ Library audit: Completed
- ✅ Code patterns: Reviewed
- 🔄 Automated testing: Pending
- 🔄 Violation monitoring: Pending

This implementation provides a secure foundation while maintaining development productivity and user experience.