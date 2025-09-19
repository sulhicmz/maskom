# Error Logging Setup for maskom.co.id

## Overview

Error logging is essential for identifying and resolving issues in the maskom.co.id website. This document outlines the setup and configuration for error logging using Sentry.

## Sentry Configuration

### Project Setup

- **Project Name**: maskom-website
- **Organization**: maskom
- **DSN**: https://examplePublicKey@o0.ingest.sentry.io/0 (replace with actual DSN)

### Environment Configuration

1. **Production**: 
   - DSN: Production Sentry DSN
   - Environment: production
   - Release: git commit hash

2. **Development**:
   - DSN: Development Sentry DSN
   - Environment: development
   - Release: git commit hash

3. **Preview**:
   - DSN: Preview Sentry DSN
   - Environment: preview
   - Release: git commit hash

## Implementation

### Client-Side Error Logging

Client-side errors are captured using the Sentry JavaScript SDK:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  release: process.env.NEXT_PUBLIC_RELEASE,
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
 // Session Replay
 replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});
```

### Server-Side Error Logging

Server-side errors in API routes and worker functions are captured using the Sentry Node.js SDK:

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.RELEASE,
});
```

## Error Tracking Features

### Error Grouping

Sentry automatically groups similar errors together to reduce noise and make it easier to identify unique issues.

### Contextual Information

Each error report includes:

- Stack trace
- User information (when available)
- Browser and device information
- Network details
- Custom tags and context

### Performance Monitoring

Sentry Performance Monitoring tracks:

- Transaction traces
- Database query performance
- API response times
- Frontend performance metrics

## Alert Configuration

### Alert Rules

1. **High-Volume Errors**:
   - Trigger: More than 50 errors in 5 minutes
   - Action: Send alert to #website-alerts Slack channel

2. **New Errors**:
   - Trigger: First occurrence of a new error
   - Action: Send alert to admin@maskom.co.id

3. **Regression Errors**:
   - Trigger: Error that was previously resolved but has reappeared
   - Action: Send alert to #website-alerts Slack channel

### Alert Escalation

1. **Level 1**: Email notification to admin@maskom.co.id
2. **Level 2**: Slack notification to #website-alerts channel
3. **Level 3**: SMS notification to system administrator

## Integration with Other Tools

### GitHub Integration

Sentry integrates with GitHub to:

- Create issues automatically for new errors
- Link error reports to commits and releases
- Provide source code context in error reports

### Cloudflare Integration

Sentry works alongside Cloudflare Analytics:

- Cloudflare handles infrastructure-level monitoring
- Sentry handles application-level error tracking
- Both provide complementary insights

## Best Practices

1. **Environment Separation**: Use separate Sentry projects for different environments
2. **Release Tracking**: Tag errors with release information for better tracking
3. **Contextual Data**: Add relevant context to error reports to aid debugging
4. **Alert Optimization**: Fine-tune alert thresholds to minimize false positives
5. **Regular Review**: Review error patterns regularly to identify systemic issues
6. **Privacy Compliance**: Ensure no personally identifiable information (PII) is sent to Sentry