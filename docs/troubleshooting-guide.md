# Troubleshooting Guide

This guide helps resolve common issues encountered while developing with the Maskom project.

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Server](#development-server)
- [Build Issues](#build-issues)
- [Testing Issues](#testing-issues)
- [Data Validation Issues](#data-validation-issues)
- [TypeScript Issues](#typescript-issues)
- [Linting Issues](#linting-issues)
- [Service Layer Issues](#service-layer-issues)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### "Module not found" error after npm install

**Symptoms:**
```
Error: Cannot find module 'next'
```

**Solutions:**

1. **Clean install:**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Check Node version:**
```bash
node --version  # Should be 22.0.0 or higher
```

3. **Clear npm cache:**
```bash
npm cache clean --force
npm install
```

---

### Peer dependency warnings

**Symptoms:**
```
npm WARN peerDependency warning
```

**Solution:** Most peer dependency warnings in this project are safe to ignore. The project uses `overrides` in `package.json` to handle specific version conflicts.

---

## Development Server

### "Port 3000 is already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Kill process on port 3000:**
```bash
# Find process
lsof -ti:3000
# Kill process
kill -9 $(lsof -ti:3000)
```

2. **Use different port:**
```bash
PORT=3001 npm run dev
```

### Changes not reflecting in browser

**Symptoms:** Code changes not appearing after saving files.

**Solutions:**

1. **Hard refresh browser:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

2. **Restart dev server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

3. **Clear .next cache:**
```bash
rm -rf .next
npm run dev
```

---

## Build Issues

### "Build failed" with data validation errors

**Symptoms:**
```
Build failed: Data validation error
```

**Solution:** This is expected behavior. The build process runs all data validators. Fix data integrity issues first:

```bash
# Run tests to see specific validation errors
npm test

# Check specific data file
npm test -- src/data/YourData.test.ts
```

### "Cannot find module" during build

**Symptoms:**
```
Module not found: Can't resolve '@/components/...'
```

**Solutions:**

1. **Check tsconfig.json path aliases:**
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/assets/*": ["./public/assets/*"]
  }
}
```

2. **Restart TypeScript server in VS Code:**
```
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

3. **Clean build:**
```bash
rm -rf .next node_modules/.cache
npm run build
```

### Memory limit exceeded during build

**Symptoms:**
```
JavaScript heap out of memory
```

**Solution:**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## Testing Issues

### "Test suite failed to run"

**Symptoms:**
```
Jest encountered an unexpected token
```

**Solutions:**

1. **Clear Jest cache:**
```bash
npm test -- --clearCache
```

2. **Check Jest configuration:** Verify `jest.config.mjs` and `jest.setup.js` exist.

3. **Run specific test file:**
```bash
npm test -- path/to/test.test.tsx
```

### Tests timeout or hang

**Symptoms:** Tests never complete or take too long.

**Solutions:**

1. **Increase timeout:**
```javascript
// In your test file
jest.setTimeout(10000); // 10 seconds
```

2. **Check for async operations:** Ensure all async operations are properly awaited.

3. **Run with verbose output:**
```bash
npm test -- --verbose
```

### Data validation tests failing

**Symptoms:** Tests fail with "Data validation error" or similar.

**Solutions:**

1. **Run validation tests specifically:**
```bash
npm test -- src/utils/dataValidation
```

2. **Check data file integrity:**
```bash
# Run all data validators
npm run validate-data
```

3. **Review validation error messages:**
```typescript
// Check specific validator
import { validateYourData } from '@/utils/dataValidation/yourDataValidation';

const result = validateYourData(yourDataArray);
console.log(result.errors); // See specific issues
```

---

## Data Validation Issues

### "Duplicate ID found" error

**Symptoms:**
```
Error: Duplicate ID found in data
```

**Solution:** Check for duplicate IDs in your data file:

```typescript
// src/data/YourData.ts

// Wrong: Duplicate IDs
const data = [
  { id: 1, title: 'First' },
  { id: 1, title: 'Second' }  // Duplicate!
];

// Correct: Unique IDs
const data = [
  { id: 1, title: 'First' },
  { id: 2, title: 'Second' }
];
```

**Pro Tip:** Use auto-ID generation for new data files:
```typescript
const { data } = autoIdArray<DataItem>([
  { title: 'First' },    // Auto-assigns id: 1
  { title: 'Second' }    // Auto-assigns id: 2
], { startFrom: 1 });
```

### "Invalid page field" error

**Symptoms:**
```
Error: Invalid page field: 'home_3'
```

**Solution:** Check that page field exists in `VALID_PAGES`:

```typescript
// src/data/relationships.ts
export const VALID_PAGES = [
  'home_1', 'home_2', 'pricing', 'about', /* ... */
] as const;

// Make sure your data uses valid page values
const data = [
  { id: 1, page: 'home_1' },  // ✅ Valid
  { id: 2, page: 'home_3' }   // ❌ Invalid (not in VALID_PAGES)
];
```

### "Missing required field" error

**Symptoms:**
```
Error: Required field 'title' is missing
```

**Solution:** Check validator definition and data:

```typescript
// Check validator in src/utils/dataValidation/yourValidation.ts
export const validateYourData = createValidator<DataItem>({
  requiredFields: ['title', 'description', 'id'],
  // ...
});

// Ensure data has all required fields
const data = [
  { id: 1, title: 'First', description: 'Desc' }  // ✅ Has all fields
];
```

---

## TypeScript Issues

### "Property does not exist on type" errors

**Symptoms:**
```
Property 'newField' does not exist on type 'YourType'
```

**Solutions:**

1. **Check type definition:**
```typescript
// src/types/data/index.ts
export interface YourType {
  existingField: string;
  newField?: string;  // Add this field
}
```

2. **Use type assertion (temporary):**
```typescript
const data = yourData as any;
```

3. **Restart TypeScript server:** See [Build Issues](#build-issues)

### "Cannot find namespace" errors

**Symptoms:**
```
Cannot find namespace 'React'
```

**Solution:**
```bash
npm install --save-dev @types/react @types/react-dom
```

### Path alias not resolved

**Symptoms:**
```
Cannot find module '@/components/...'
```

**Solution:** Check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./public/assets/*"]
    }
  }
}
```

---

## Linting Issues

### "Unexpected console statement" error

**Symptoms:**
```
Unexpected console statement
```

**Solution:** Remove `console.log` statements or use proper logging:

```typescript
// Wrong
console.log('Debug info');

// Correct (for debugging)
import { logger } from '@/services/common/logger';
logger.debug('Debug info');

// Or disable lint for specific lines
// eslint-disable-next-line no-console
console.log('Debug info');
```

### "Unused variable" warning

**Symptoms:**
```
'variable' is assigned a value but never used
```

**Solution:**
```typescript
// Prefix unused variables with underscore
const _unused = someValue;

// Or remove the variable
```

### Fixing all lint issues

**Solution:**
```bash
# Auto-fix all possible issues
npm run lint:fix
```

---

## Service Layer Issues

### Email service not sending emails

**Symptoms:** Contact form submissions don't send emails.

**Solutions:**

1. **Check environment variables:**
```bash
# .env.local
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

2. **Verify EmailJS configuration:**
```typescript
// Check src/services/email/EmailService.ts
// Ensure credentials are loaded correctly
```

3. **Check console for errors:** Open browser DevTools and look for error messages.

4. **Test with fallback provider:** The service falls back to console logging if EmailJS fails.

### "Service error" in response

**Symptoms:**
```typescript
{
  success: false,
  error: 'Service unavailable',
  errorCode: 'UNKNOWN_ERROR'
}
```

**Solutions:**

1. **Check service logs:**
```typescript
import apmManager from '@/utils/apm';
apmManager.captureException(error);
```

2. **Verify resilience patterns:**
```typescript
// Check timeout, retry, and circuit breaker configuration
// in src/services/email/EmailService.ts
```

3. **Test in isolation:**
```typescript
import emailService from '@/services/email/EmailService';
const result = await emailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  message: 'Test message'
});
console.log(result);
```

---

## Performance Issues

### Slow page loads in development

**Symptoms:** Pages take several seconds to load.

**Solutions:**

1. **Disable source maps:**
```javascript
// next.config.ts
export default {
  productionBrowserSourceMaps: false
};
```

2. **Clear cache:**
```bash
rm -rf .next node_modules/.cache
npm run dev
```

3. **Check bundle size:**
```bash
npm run analyze
```

### High memory usage in development

**Symptoms:** Node process using excessive memory.

**Solution:**
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

---

## Getting Additional Help

### Check Documentation

- [Architecture Guide](./blueprint.md) - Understand system design
- [Testing Guide](./testing-guide.md) - Testing strategies
- [API Documentation](./api.md) - Service layer APIs
- [Component Guide](./component-development-guide.md) - Component patterns

### Debug Mode

Enable debug logging:
```typescript
// Set environment variable
NEXT_PUBLIC_DEBUG=true npm run dev
```

### Check Test Results

Run tests with verbose output:
```bash
npm test -- --verbose
```

### Report Issues

If you encounter issues not covered here:

1. **Search existing issues:** [GitHub Issues](https://github.com/sulhicmz/maskom/issues)
2. **Create new issue:** Include:
   - Error message
   - Steps to reproduce
   - Environment details (Node version, OS)
   - Relevant code snippets

---

**Last Updated:** January 19, 2026
**Version:** 1.0.0