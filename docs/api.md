# API Documentation

## Overview

This document provides comprehensive API specifications for all external service integrations in the Maskom application.

## Table of Contents

- [Email Service API](#email-service-api)
- [Error Response Standards](#error-response-standards)
- [Resilience Patterns](#resilience-patterns)

---

## Email Service API

### Service: EmailService (`src/services/email/EmailService.ts`)

**Purpose**: Handles email sending functionality through EmailJS integration with resilience patterns.

**Provider**: EmailJS (https://www.emailjs.com)

**Version**: Current implementation uses EmailJS browser SDK

---

### Endpoints

#### Send Email

**Method**: `sendEmail(params: EmailSendParams): Promise<EmailSendResult>`

**Description**: Sends an email using configured EmailJS template with built-in resilience patterns (timeout, retry, circuit breaker).

**Authentication**: Uses environment variables for service credentials

---

### Request

#### Parameters

```typescript
interface EmailSendParams {
    fromName: string;      // Sender's name (required)
    fromEmail: string;     // Sender's email address (required, validated)
    subject: string;       // Email subject line (required)
    message: string;       // Email message content (required)
}
```

#### Validation Rules

- `fromName`: 1-100 characters, no HTML tags
- `fromEmail`: Must be valid email format
- `subject`: 1-200 characters
- `message`: 1-5000 characters

---

### Response

#### Success Response (200 OK)

```typescript
interface EmailSendResult {
    success: true;
    text: string;  // EmailJS success message (e.g., "OK")
}
```

#### Error Responses

All error responses follow the [Error Response Standards](#error-response-standards).

**400 Bad Request**

```json
{
    "success": false,
    "error": "EmailJS credentials not configured"
}
```

**503 Service Unavailable**

```json
{
    "success": false,
    "error": "Circuit breaker is open. Service temporarily unavailable."
}
```

**408 Request Timeout**

```json
{
    "success": false,
    "error": "EmailJS request timed out"
}
```

**502 Bad Gateway**

```json
{
    "success": false,
    "error": "Email send failed after retries"
}
```

---

### Resilience Configuration

The EmailService implements three-layer resilience:

#### 1. Timeout Protection

- **Default Timeout**: 10,000ms (10 seconds)
- **Behavior**: Request fails if EmailJS doesn't respond within timeout
- **Error Code**: Timeout error with `isTimeout: true`

#### 2. Retry with Exponential Backoff

- **Max Attempts**: 3 (1 initial + 2 retries)
- **Base Delay**: 1,000ms (1 second)
- **Max Delay**: 10,000ms (10 seconds)
- **Backoff Multiplier**: 2x
- **Retryable Patterns**:
  - `/network/i` - Network-related errors
  - `/timeout/i` - Timeout errors
  - `/ECONN/i` - Connection errors

**Retry Schedule**:
- Attempt 1: Immediate
- Attempt 2: 1,000ms delay
- Attempt 3: 2,000ms delay

#### 3. Circuit Breaker

- **Failure Threshold**: 5 consecutive failures
- **Reset Timeout**: 60,000ms (60 seconds)
- **Monitoring Period**: 60,000ms (60 seconds)
- **States**:
  - **Closed**: Normal operation, requests flow through
  - **Open**: Requests rejected immediately after 5 failures
  - **Half-Open**: Test request to check recovery

---

### Monitoring & Diagnostics

#### Get Circuit Breaker State

```typescript
emailService.getCircuitBreakerState(): CircuitBreakerState
```

**Returns**:
```typescript
interface CircuitBreakerState {
    isOpen: boolean;           // Circuit breaker state
    failureCount: number;      // Current consecutive failures
    lastFailureTime: number | null;  // Unix timestamp
    lastSuccessTime: number | null;  // Unix timestamp
}
```

#### Reset Circuit Breaker

```typescript
emailService.resetCircuitBreaker(): void
```

**Warning**: Manual reset should be used with caution in production.

---

### Environment Variables

Required environment variables in `.env`:

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=<service_id>
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=<template_id>
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=<public_key>
```

---

### Usage Example

```typescript
import emailService from '@/services/email';

try {
    const result = await emailService.sendEmail({
        fromName: 'John Doe',
        fromEmail: 'john@example.com',
        subject: 'Contact Form Submission',
        message: 'Hello, I would like to inquire about your services.'
    });

    if (result.success) {
        console.log('Email sent successfully:', result.text);
    } else {
        console.error('Failed to send email:', result.error);
    }
} catch (error) {
    console.error('Unexpected error:', error);
}
```

---

### Rate Limiting

**Current Status**: Rate limiting is handled by EmailJS (provider-side limits).

**Recommended**:
- Frontend: Debounce form submission (500ms)
- Backend: Implement IP-based rate limiting if creating API routes

**Recommended Limits**:
- Per IP: 5 emails per hour
- Per user: 10 emails per day

---

### Security Considerations

1. **Credentials**: Never commit environment variables to version control
2. **Validation**: All inputs validated before sending to EmailJS
3. **Error Logging**: Only non-sensitive error messages logged
4. **CSP**: EmailJS domain (`api.emailjs.com`) allowed in Content Security Policy

---

---

## Error Response Standards

### Standard Error Format

All API errors follow a consistent format:

```typescript
interface ApiError {
    success: false;
    error: string;  // Human-readable error message (non-sensitive)
}
```

### Error Categories

#### 1. Client Errors (4xx)

| Code | Message | Retryable | Description |
|------|---------|-----------|-------------|
| 400 | "EmailJS credentials not configured" | No | Missing or invalid environment variables |
| 400 | "Invalid email format" | No | Email validation failed |
| 400 | "Missing required fields" | No | Form validation failed |

#### 2. Server Errors (5xx)

| Code | Message | Retryable | Description |
|------|---------|-----------|-------------|
| 408 | "EmailJS request timed out" | Yes | Request exceeded timeout threshold |
| 502 | "Email send failed after retries" | Yes | All retry attempts exhausted |
| 503 | "Circuit breaker is open. Service temporarily unavailable." | No | Service in failure state |
| 500 | "Unknown error" | No | Unexpected error occurred |

### Error Handling Best Practices

1. **User-Facing**: Always display `error` message to user
2. **Logging**: Log full error details server-side (not to client)
3. **Retry**: Only retry errors marked as retryable
4. **Fallback**: Provide alternative contact method if email fails

---

## Resilience Patterns

### Overview

All external service integrations must implement the following resilience layers:

```
Service Layer
    ↓
Circuit Breaker (prevent cascading failures)
    ↓
Retry with Exponential Backoff (handle transient failures)
    ↓
Timeout Protection (prevent indefinite hangs)
    ↓
External API
```

### Implementation

Resilience utilities are located in `src/utils/resilience/`:

- `timeout.ts` - Timeout wrapper (`withTimeout`)
- `retry.ts` - Retry logic with exponential backoff (`withRetry`)
- `circuitBreaker.ts` - Circuit breaker pattern (`CircuitBreaker`)
- `types.ts` - TypeScript type definitions

### Adding New Integrations

When adding a new external service integration:

1. **Create Service Interface**: Define contract in `src/services/[service]/types.ts`
2. **Implement Service**: Create service class in `src/services/[service]/Service.ts`
3. **Apply Resilience**: Use all three resilience patterns
4. **Add Tests**: Create comprehensive test suite
5. **Document**: Update this API documentation

---

### Example: Adding New Service

```typescript
// src/services/newservice/NewService.ts
import { withTimeout, withRetry, CircuitBreaker } from '@/utils/resilience';

class NewService implements INewService {
    private circuitBreaker: CircuitBreaker;

    constructor() {
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 5,
            resetTimeoutMs: 60000,
            monitoringPeriodMs: 60000
        });
    }

    async callExternalApi(params: Params): Promise<Result> {
        return this.circuitBreaker.execute(async () => {
            const retryResult = await withRetry(
                () => this.callWithTimeout(params),
                {
                    maxAttempts: 3,
                    baseDelayMs: 1000,
                    maxDelayMs: 10000,
                    backoffMultiplier: 2,
                    retryableErrors: [/network/i, /timeout/i, /ECONN/i]
                }
            );

            if (!retryResult.success || !retryResult.data) {
                throw retryResult.error || new Error('API call failed after retries');
            }

            return retryResult.data;
        });
    }

    private async callWithTimeout(params: Params) {
        return withTimeout(
            externalApiCall(params),
            { timeoutMs: 10000, timeoutError: 'API request timed out' }
        );
    }

    getCircuitBreakerState() {
        return this.circuitBreaker.getState();
    }

    resetCircuitBreaker() {
        this.circuitBreaker.reset();
    }
}
```

---

## Versioning

### API Versioning Strategy

- **Current Version**: v1.0
- **Version Format**: Semantic Versioning (Major.Minor.Patch)
- **Backward Compatibility**: Maintained within major versions
- **Deprecation**: 3-month notice period before breaking changes

---

## Changelog

### v1.0.0 (Current)
- Initial EmailService implementation
- Resilience patterns (timeout, retry, circuit breaker)
- Standardized error response format
- API documentation

---

## Support

For integration issues or questions:
1. Check this documentation
2. Review `src/utils/resilience/` implementation
3. See `src/services/email/` for examples
4. Consult `docs/blueprint.md` for architectural patterns
