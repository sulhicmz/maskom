# API Documentation

## Overview

This document provides comprehensive API specifications for all external service integrations in the Maskom application.

## Table of Contents

- [Common Service Types](#common-service-types)
- [Email Service API](#email-service-api)
- [Authentication Service API](#authentication-service-api)
- [Error Response Standards](#error-response-standards)
- [Resilience Patterns](#resilience-patterns)

---

## Common Service Types

### Location

**Types**: `src/services/common/types.ts`

**Error Classes**: `src/services/common/ServiceException.ts`

**Logger**: `src/services/common/logger.ts`

**Result Helpers**: `src/services/common/resultHelpers.ts`

---

### ServiceResult<T>

All service methods return a standardized `ServiceResult<T>` interface:

```typescript
interface ServiceResult<T = void> {
    success: boolean;          // Operation success status
    message?: string;          // Success message (on success)
    data?: T;                 // Result data (on success)
    error?: string;            // Error message (on failure)
    errorCode?: ServiceErrorCodeType;  // Standardized error code (on failure)
    metadata?: Record<string, unknown>;  // Additional metadata
}
```

**Success Example**:
```typescript
{
    success: true,
    message: 'Email sent successfully',
    data: { text: 'OK' }
}
```

**Error Example**:
```typescript
{
    success: false,
    error: 'Invalid email format',
    errorCode: 'VALIDATION_ERROR',
    metadata: {
        isRetryable: false,
        isTimeout: false
    }
}
```

---

### Standard Error Codes

All services use standardized error codes defined in `ServiceErrorCode`:

| Code | Description | Retryable | Use Case |
|------|-------------|------------|-----------|
| `VALIDATION_ERROR` | Input validation failed | No | Invalid email, password too short |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | No | Too many requests within time window |
| `TIMEOUT` | Request timeout | Yes | External API didn't respond within timeout |
| `CIRCUIT_BREAKER_OPEN` | Circuit breaker is open | No | Service degraded, temporary unavailable |
| `CREDENTIALS_MISSING` | Missing API credentials | No | Environment variables not configured |
| `NETWORK_ERROR` | Network-related failure | Yes | Connection errors, DNS failures |
| `UNKNOWN_ERROR` | Unclassified error | No | Unexpected errors |

---

### Service Exception Classes

Custom exception classes for standardized error handling:

| Class | Error Code | Is Retryable | Is Timeout | Use Case |
|--------|-------------|---------------|-------------|-----------|
| `ServiceException` | Custom | Configurable | Configurable | Base exception class |
| `ServiceTimeoutError` | `TIMEOUT` | Yes | Yes | Request timeouts |
| `ServiceRateLimitError` | `RATE_LIMIT_EXCEEDED` | No | No | Rate limit exceeded |
| `ServiceValidationError` | `VALIDATION_ERROR` | No | No | Validation failures |
| `ServiceCircuitBreakerError` | `CIRCUIT_BREAKER_OPEN` | No | No | Circuit breaker open |
| `ServiceCredentialsError` | `CREDENTIALS_MISSING` | No | No | Missing credentials |
| `ServiceNetworkError` | `NETWORK_ERROR` | Yes | No | Network errors |

**Example Usage**:
```typescript
import { ServiceValidationError } from '@/services/common';

throw new ServiceValidationError('Invalid email format');
```

---

### Helper Functions

**createSuccessResult<T>**:
```typescript
createSuccessResult<T>(
    message: string,
    data?: T,
    metadata?: Record<string, unknown>
): ServiceResult<T>
```

**createErrorResult<T>**:
```typescript
createErrorResult<T = void>(
    error: string | ServiceException,
    errorCode?: ServiceErrorCodeType,
    metadata?: Record<string, unknown>
): ServiceResult<T>
```

**mapToServiceResult<T>**:
```typescript
mapToServiceResult<T>(
    success: boolean,
    successMessage: string,
    errorMessage: string,
    data?: T,
    errorCode?: ServiceErrorCodeType
): ServiceResult<T>
```

---

### Service Logging

Standardized logging utilities for consistent error handling:

```typescript
logServiceError(error: unknown, options: { service: string; operation: string; includeDetails?: boolean }): void
logServiceSuccess(service: string, operation: string, duration?: number): void
logServiceWarning(service: string, operation: string, message: string): void
```

**Example**:
```typescript
import { logServiceError, logServiceSuccess } from '@/services/common';

try {
    const result = await service.call();
    logServiceSuccess('EmailService', 'sendEmail', duration);
} catch (error) {
    logServiceError(error, { service: 'EmailService', operation: 'sendEmail' });
}
```

---

## Email Service API

### Service: EmailService (`src/services/email/EmailService.ts`)

**Purpose**: Handles email sending functionality through EmailJS integration with resilience patterns.

**Provider**: EmailJS (https://www.emailjs.com)

**Version**: Current implementation uses EmailJS browser SDK

---

### Endpoints

#### Send Email

**Method**: `sendEmail(params: EmailSendParams, options?: EmailSendOptions): Promise<ServiceResult<{ text: string }>>`

**Description**: Sends an email using configured EmailJS template with built-in resilience patterns (rate limiting, timeout, retry, circuit breaker).

**Authentication**: Uses environment variables for service credentials

---

### Request

#### Parameters

```typescript
interface EmailSendParams {
    templateParams: {
        user_name: string;   // Sender's name (required)
        user_email: string;  // Sender's email address (required, validated)
        message: string;      // Email message content (required)
    };
}

interface EmailSendOptions {
    skipRateLimit?: boolean;  // Skip rate limit check (for admin use)
    identifier?: string;     // Custom identifier for rate limiting (defaults to user_email)
}
```

#### Validation Rules

- `user_name`: Required, no HTML tags
- `user_email`: Required, must be valid email format
- `message`: Required, 1-5000 characters

---

### Response

#### Success Response

```typescript
{
    success: true,
    message: 'Email sent successfully',
    data: {
        text: string;  // EmailJS response text (e.g., "OK")
    }
}
```

#### Error Responses

All error responses follow the [Error Response Standards](#error-response-standards).

**429 Too Many Requests**

```json
{
    "success": false,
    "error": "Too many attempts. Please try again in X seconds.",
    "errorCode": "RATE_LIMIT_EXCEEDED",
    "metadata": {
        "rateLimited": true
    }
}
```

**400 Bad Request - Missing Credentials**

```json
{
    "success": false,
    "error": "EmailJS credentials not configured",
    "errorCode": "CREDENTIALS_MISSING",
    "metadata": {
        "isRetryable": false,
        "isTimeout": false
    }
}
```

**408 Request Timeout**

```json
{
    "success": false,
    "error": "EmailJS request timed out",
    "errorCode": "TIMEOUT",
    "metadata": {
        "isRetryable": true,
        "isTimeout": true
    }
}
```

**502 Bad Gateway - Retry Exhausted**

```json
{
    "success": false,
    "error": "Email send failed after retries",
    "errorCode": "NETWORK_ERROR",
    "metadata": {
        "isRetryable": true
    }
}
```

**503 Service Unavailable - Circuit Breaker**

```json
{
    "success": false,
    "error": "Circuit breaker is open. Service temporarily unavailable.",
    "errorCode": "CIRCUIT_BREAKER_OPEN",
    "metadata": {
        "isRetryable": false
    }
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

The EmailService implements four-layer resilience:

#### 0. Rate Limiting

- **Max Attempts**: 5 per 60 seconds (per identifier)
- **Cooldown**: 5 minutes (300,000ms) after limit exceeded
- **Identifier**: User email address (customizable via options)
- **Behavior**:
  - First 5 attempts: Allowed
  - Exceeding limit: Blocked with countdown message
  - Automatic reset after cooldown period
- **Skip Option**: `skipRateLimit: true` for admin operations (use with caution)

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

## Authentication Service API

### Service: AuthService (`src/services/auth/AuthService.ts`)

**Purpose**: Handles user authentication operations with mock implementation (ready for real backend integration).

**Provider**: Mock implementation (interface ready for Auth0, Firebase, NextAuth, or custom backend).

**Version**: v1.0.0 (Current)

---

### Endpoints

#### Login

**Method**: `login(credentials: LoginCredentials): Promise<AuthResult>`

**Description**: Authenticates a user with email and password.

---

#### Register

**Method**: `register(userData: RegisterData): Promise<AuthResult>`

**Description**: Registers a new user account.

---

#### Logout

**Method**: `logout(): Promise<AuthResult>`

**Description**: Clears the current user session.

---

#### Get Current User

**Method**: `getCurrentUser(): Promise<User | null>`

**Description**: Retrieves the currently authenticated user.

---

### Request

#### Login Parameters

```typescript
interface LoginCredentials {
    email: string;     // User's email address (required, validated)
    password: string;  // User's password (required)
}
```

#### Register Parameters

```typescript
interface RegisterData {
    name: string;      // User's full name (required)
    email: string;     // User's email address (required, validated)
    password: string;  // User's password (required, min 8 characters)
}
```

#### Validation Rules

- **Email**: Must be valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- **Password (Register)**: Minimum 8 characters
- **Name (Register)**: Required field

---

### Response

#### Success Response

```typescript
interface AuthResult {
    success: true;
    message: string;  // Success message (Indonesian)
    user?: User;      // User object (on successful login/register)
    token?: string;   // Authentication token (mock-jwt-token)
}

interface User {
    id: string;       // Generated user ID (format: user_<email_sanitized>)
    name: string;     // User's display name
    email: string;    // User's email address
}
```

#### Error Responses

All error responses follow the [Error Response Standards](#error-response-standards).

**400 Bad Request - Missing Fields**

```json
{
    "success": false,
    "error": "Email dan kata sandi diperlukan",
    "errorCode": "VALIDATION_ERROR",
    "metadata": {
        "isRetryable": false,
        "isTimeout": false
    }
}
```

**400 Bad Request - Invalid Email**

```json
{
    "success": false,
    "error": "Format email tidak valid",
    "errorCode": "VALIDATION_ERROR",
    "metadata": {
        "isRetryable": false
    }
}
```

**400 Bad Request - Short Password**

```json
{
    "success": false,
    "error": "Kata sandi minimal 8 karakter",
    "errorCode": "VALIDATION_ERROR",
    "metadata": {
        "isRetryable": false
    }
}
```

**429 Too Many Requests**

```json
{
    "success": false,
    "error": "Terlalu banyak percobaan. Silakan coba lagi dalam X detik.",
    "errorCode": "RATE_LIMIT_EXCEEDED",
    "metadata": {
        "rateLimited": true
    }
}
```

**500 Internal Server Error**

```json
{
    "success": false,
    "error": "Terjadi kesalahan saat login",
    "errorCode": "UNKNOWN_ERROR"
}
```

---

### Service Implementation Notes

#### Current Implementation: Mock Mode

- **Authentication**: Client-side mock with in-memory state
- **User Storage**: `currentUser` stored in service instance (no persistence)
- **Token**: Mock JWT token (`"mock-jwt-token"`)
- **User ID**: Generated from email (`user_<email_sanitized>`)
- **Name Extraction**: For login without name, extracted from email local part
- **Error Messages**: Indonesian language for user-facing errors
- **Rate Limiting**: Implemented for login/register (5 attempts per 15min/1hr, 30min/2hr cooldown)

#### Future Integration: Real Backend

The `IAuthService` interface is ready for real authentication providers:

**Option 1: Auth0**
```typescript
import { Auth0Client } from '@auth0/auth0-spa-js';
// Implement IAuthService using Auth0 SDK
```

**Option 2: Firebase Auth**
```typescript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// Implement IAuthService using Firebase
```

**Option 3: NextAuth.js**
```typescript
import { signIn } from 'next-auth/react';
// Implement IAuthService using NextAuth
```

**Option 4: Custom Backend**
```typescript
// Implement IAuthService with fetch/axios to your API
```

---

### Environment Variables

**Current Implementation**: No environment variables required (mock mode).

**Future Implementation** (depending on provider):

**Auth0**:
```bash
NEXT_PUBLIC_AUTH0_DOMAIN=<domain>
NEXT_PUBLIC_AUTH0_CLIENT_ID=<client_id>
```

**Firebase**:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=<api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<auth_domain>
```

---

### Rate Limiting

**Current Status**: Rate limiting is implemented for login and register operations.

**Configuration**:

#### Login Rate Limiting
- **Max Attempts**: 5 per 15 minutes (per email)
- **Cooldown**: 30 minutes after limit exceeded
- **Identifier**: User email address

#### Register Rate Limiting
- **Max Attempts**: 5 per 1 hour (per email)
- **Cooldown**: 2 hours after limit exceeded
- **Identifier**: User email address

**Behavior**:
- First 5 attempts: Allowed
- Exceeding limit: Blocked with countdown message
- Automatic reset after cooldown period

**Error Response (Rate Limited)**:

```json
{
    "success": false,
    "error": "Terlalu banyak percobaan. Silakan coba lagi nanti."
}
```

**Monitoring Rate Limit Status**:

```typescript
const loginStatus = authService.getLoginRateLimitStatus('user@example.com');
console.log(`Attempts: ${loginStatus.count}`);
console.log(`Remaining: ${loginStatus.attemptsRemaining}`);
console.log(`Locked until: ${loginStatus.lockedUntil}`);

const registerStatus = authService.getRegisterRateLimitStatus('user@example.com');
console.log(`Attempts: ${registerStatus.count}`);
console.log(`Remaining: ${registerStatus.attemptsRemaining}`);
console.log(`Locked until: ${registerStatus.lockedUntil}`);
```

**Reset Rate Limit** (Admin Use):

```typescript
authService.resetLoginRateLimit('user@example.com');
authService.resetRegisterRateLimit('user@example.com');
```

#### Get Circuit Breaker State

```typescript
const state = authService.getCircuitBreakerState();
console.log(`Circuit breaker open: ${state.isOpen}`);
console.log(`Failure count: ${state.failureCount}`);
```

#### Reset Circuit Breaker (Admin Use)

```typescript
authService.resetCircuitBreaker();
```

**Security Benefits**:
- Prevents brute force attacks on login
- Prevents account creation abuse on register
- Automatic cooldown after limit exceeded
- Per-email rate limiting (not IP-based)

---

### Resilience Configuration

The AuthService implements four-layer resilience:

#### 1. Timeout Protection

- **Default Timeout**: 5,000ms (5 seconds)
- **Behavior**: Request fails if operation doesn't complete within timeout
- **Error Code**: Timeout error with `isTimeout: true`
- **Purpose**: Prevents indefinite hangs on slow operations

#### 2. Retry with Exponential Backoff

- **Max Attempts**: 3 (1 initial + 2 retries)
- **Base Delay**: 1,000ms (1 second)
- **Max Delay**: 10,000ms (10 seconds)
- **Backoff Multiplier**: 2x
- **Retryable Patterns**:
  - `/network/i` - Network-related errors
  - `/timeout/i` - Timeout errors
  - `/ECONN/i` - Connection errors
- **Non-Retryable Errors**: Validation errors (immediate failure)

**Retry Schedule**:
- Attempt 1: Immediate
- Attempt 2: 1,000ms delay
- Attempt 3: 2,000ms delay

#### 3. Circuit Breaker

- **Failure Threshold**: 50 consecutive failures
- **Reset Timeout**: 60,000ms (60 seconds)
- **Monitoring Period**: 60,000ms (60 seconds)
- **States**:
  - **Closed**: Normal operation, requests flow through
  - **Open**: Requests rejected immediately after threshold
  - **Half-Open**: Test request to check recovery
- **Note**: High threshold (50) prevents circuit breaker from interfering with per-user rate limiting tests

#### 4. Rate Limiting

Per-operation rate limiting (configured above).

---

### Monitoring & Diagnostics

#### Get Circuit Breaker State

```typescript
authService.getCircuitBreakerState(): CircuitBreakerState
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
authService.resetCircuitBreaker(): void
```

**Warning**: Manual reset should be used with caution in production.

---

### Usage Example

```typescript
import { authService } from '@/services/auth';

// Login
const loginResult = await authService.login({
    email: 'john@example.com',
    password: 'password123'
});

if (loginResult.success) {
    console.log('Login successful:', loginResult.user);
    console.log('Token:', loginResult.token);
} else {
    console.error('Login failed:', loginResult.error);
}

// Register
const registerResult = await authService.register({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
});

if (registerResult.success) {
    console.log('Registration successful:', registerResult.user);
} else {
    console.error('Registration failed:', registerResult.error);
}

// Get Current User
const currentUser = await authService.getCurrentUser();
console.log('Current user:', currentUser);

// Logout
const logoutResult = await authService.logout();
if (logoutResult.success) {
    console.log('Logout successful');
}
```

---

### Security Considerations

1. **Mock Mode**: No real security - for development/testing only
2. **Password Validation**: Client-side validation only (backend validation required in production)
3. **Session Management**: In-memory only (localStorage/cookies required for persistence)
4. **Token**: Mock token - implement real JWT in production
5. **HTTPS Required**: Always use HTTPS for authentication in production
6. **Rate Limiting**: Implemented for login/register (prevent brute force attacks)

---

### Future Enhancements

1. ~~**Rate Limiting**: Add rate limiting for login/register attempts~~ ✅ COMPLETED
2. **Session Persistence**: Implement localStorage/cookie storage for sessions
3. **Protected Routes**: Add route guards for authenticated pages
4. **Password Reset**: Extend service with forgotPassword/resetPassword methods
5. **Token Refresh**: Implement JWT refresh token logic
6. **OAuth Providers**: Add Google/Facebook/Social login
7. **Two-Factor Authentication**: Add 2FA support
8. **Email Verification**: Add email verification flow after registration

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
| 429 | "Terlalu banyak percobaan. Silakan coba lagi nanti." | No | Rate limit exceeded (auth) |

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
3. **Use Standard Types**: Import from `@/services/common` for `ServiceResult<T>` and error classes
4. **Apply Resilience**: Use all three resilience patterns
5. **Standardize Error Handling**: Use `createSuccessResult`, `createErrorResult`, and `logServiceError`
6. **Add Tests**: Create comprehensive test suite
7. **Document**: Update this API documentation

---

### Example: Adding New Service

```typescript
// src/services/newservice/NewService.ts
import { withTimeout, withRetry, CircuitBreaker } from '@/utils/resilience';
import {
    ServiceResult,
    ServiceTimeoutError,
    ServiceNetworkError,
    logServiceError,
    logServiceSuccess,
    createSuccessResult,
    createErrorResult,
    ServiceErrorCode
} from '@/services/common';

class NewService implements INewService {
    private circuitBreaker: CircuitBreaker;

    constructor() {
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 5,
            resetTimeoutMs: 60000,
            monitoringPeriodMs: 60000
        });
    }

    async callExternalApi(params: Params): Promise<ServiceResult<{ id: string }>> {
        const startTime = Date.now();

        try {
            const result = await this.circuitBreaker.execute(async () => {
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
                    throw retryResult.error || new ServiceNetworkError('API call failed after retries');
                }

                return retryResult.data;
            });

            const duration = Date.now() - startTime;
            logServiceSuccess('NewService', 'callExternalApi', duration);

            return createSuccessResult('API call successful', { id: result.id });
        } catch (error) {
            const standardizedError = error instanceof Error ? error : new Error('Unknown error');

            if (standardizedError.message.includes('timeout')) {
                const timeoutError = new ServiceTimeoutError(standardizedError.message);
                logServiceError(timeoutError, { service: 'NewService', operation: 'callExternalApi' });
                return createErrorResult(timeoutError);
            }

            const networkError = new ServiceNetworkError(standardizedError.message);
            logServiceError(networkError, { service: 'NewService', operation: 'callExternalApi' });
            return createErrorResult(networkError);
        }
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

## Integration Monitoring & Metrics

### Overview

The integration monitoring system provides observability for all external service integrations, tracking calls, failures, timeouts, rate limits, and circuit breaker states.

### Location

**Metrics Collector**: `src/utils/metrics/metricsCollector.ts`

**Types**: `src/utils/metrics/types.ts`

---

### Metrics Data Types

#### MetricData

```typescript
interface MetricData {
    name: string;              // Metric name (e.g., "EmailService.total_calls")
    timestamp: number;          // Unix timestamp
    value: number;            // Metric value
    tags?: Record<string, string>;  // Additional metadata
}
```

#### ServiceMetrics

```typescript
interface ServiceMetrics {
    serviceName: string;           // Service name
    totalCalls: number;            // Total API calls
    successCalls: number;           // Successful calls
    failureCalls: number;           // Failed calls
    timeoutCalls: number;           // Timeout errors
    rateLimitCalls: number;         // Rate limit errors
    circuitBreakerOpenCount: number;  // Circuit breaker opens
    lastError?: string;            // Last error message
    lastSuccessTime?: number;       // Last success timestamp
    lastFailureTime?: number;       // Last failure timestamp
    averageResponseTime?: number;   // Average response time (ms)
}
```

#### HealthCheckResult

```typescript
interface HealthCheckResult {
    serviceName: string;      // Service name
    healthy: boolean;         // Health status
    message: string;          // Health message
    metrics: ServiceMetrics;   // Current metrics
    checkedAt: number;        // Check timestamp
}
```

---

### Metrics Collector API

#### Record Call

```typescript
metricsCollector.recordCall(
    serviceName: string,     // Service name (e.g., "EmailService")
    success: boolean,       // Success or failure
    errorType?: string,      // Error type (e.g., "timeout", "rate_limit")
    responseTime?: number    // Response time in milliseconds
): void
```

**Example**:
```typescript
metricsCollector.recordCall('EmailService', true, undefined, 150);
metricsCollector.recordCall('AuthService.login', false, 'rate_limit');
```

#### Record Circuit Breaker State

```typescript
metricsCollector.recordCircuitBreakerState(
    serviceName: string,     // Service name
    isOpen: boolean          // Circuit breaker state
): void
```

**Example**:
```typescript
const state = circuitBreaker.getState();
metricsCollector.recordCircuitBreakerState('EmailService', state.isOpen);
```

#### Get Metrics

```typescript
metricsCollector.getMetrics(serviceName: string): ServiceMetrics | undefined
```

**Returns**: Service metrics for the specified service, or `undefined` if service has no metrics.

#### Get All Metrics

```typescript
metricsCollector.getAllMetrics(): ServiceMetrics[]
```

**Returns**: Array of all service metrics.

#### Get Success Rate

```typescript
metricsCollector.getSuccessRate(serviceName: string): number
```

**Returns**: Success rate as a decimal (0-1), or 1 if no calls recorded.

**Example**:
```typescript
const successRate = metricsCollector.getSuccessRate('EmailService');
console.log(`Success rate: ${(successRate * 100).toFixed(1)}%`);
```

#### Get Failure Rate

```typescript
metricsCollector.getFailureRate(serviceName: string): number
```

**Returns**: Failure rate as a decimal (0-1), or 0 if no calls recorded.

#### Health Check

```typescript
metricsCollector.healthCheck(
    serviceName: string,                  // Service name
    thresholdSuccessRate: number = 0.8    // Success rate threshold (default: 80%)
): HealthCheckResult
```

**Returns**: Health check result with status and current metrics.

**Example**:
```typescript
const health = metricsCollector.healthCheck('EmailService', 0.9);
if (health.healthy) {
    console.log('EmailService is healthy:', health.message);
} else {
    console.warn('EmailService is degraded:', health.message);
    console.log('Metrics:', health.metrics);
}
```

#### Get All Health Checks

```typescript
metricsCollector.getAllHealthChecks(thresholdSuccessRate: number = 0.8): HealthCheckResult[]
```

**Returns**: Array of health check results for all services.

#### Service-Specific Metrics

**AuthService**:

```typescript
authService.getMetrics(): {
    login?: ServiceMetrics;
    register?: ServiceMetrics;
}
```

**Returns**: Metrics for login and register operations separately.

**Example**:
```typescript
const metrics = authService.getMetrics();
if (metrics.login?.averageResponseTime && metrics.login.averageResponseTime > 1000) {
    console.warn('Login response time is high:', metrics.login.averageResponseTime);
}
```

#### Export Metrics

```typescript
metricsCollector.exportMetrics(): MetricData[]
```

**Returns**: Array of `MetricData` objects for integration with monitoring systems (e.g., Prometheus, Datadog).

**Example**:
```typescript
const exportedMetrics = metricsCollector.exportMetrics();
exportedMetrics.forEach(metric => {
    console.log(`Metric: ${metric.name}, Value: ${metric.value}`);
});
```

---

### Integrated Services

#### EmailService

**Metrics Tracked**:
- Total calls, success/failure counts
- Timeout errors
- Rate limit errors
- Circuit breaker state changes
- Average response time

**Usage**:
```typescript
import emailService from '@/services/email';
import metricsCollector from '@/utils/metrics';

// Send email (metrics automatically recorded)
await emailService.sendEmail({ templateParams: { ... } });

// Get email service metrics
const emailMetrics = metricsCollector.getMetrics('EmailService');
console.log('Email service metrics:', emailMetrics);

// Check health
const health = metricsCollector.healthCheck('EmailService');
console.log('Email service health:', health.message);
```

**New Method**:
```typescript
emailService.getMetrics(): ServiceMetrics | undefined
```

#### AuthService

**Metrics Tracked**:
- Login calls (success/failure)
- Register calls (success/failure)
- Validation errors
- Rate limit errors

**Usage**:
```typescript
import { authService } from '@/services/auth';
import metricsCollector from '@/utils/metrics';

// Login (metrics automatically recorded)
await authService.login({ email: '...', password: '...' });

// Get auth service metrics
const authMetrics = metricsCollector.getMetrics('AuthService.login');
const registerMetrics = metricsCollector.getMetrics('AuthService.register');

// Health check for login
const loginHealth = metricsCollector.healthCheck('AuthService.login');
console.log('Login health:', loginHealth.message);
```

**New Method**:
```typescript
authService.getMetrics(): {
    login?: ServiceMetrics;
    register?: ServiceMetrics;
}
```

---

### Monitoring Best Practices

#### 1. Regular Health Checks

Check service health at regular intervals:

```typescript
// Check health every 60 seconds
setInterval(() => {
    const healthChecks = metricsCollector.getAllHealthChecks(0.9);
    healthChecks.forEach(health => {
        if (!health.healthy) {
            alert(`Service ${health.serviceName} is degraded!`);
        }
    });
}, 60000);
```

#### 2. Alert on Degraded Services

Set up alerts for service degradation:

```typescript
const thresholdSuccessRate = 0.9;  // 90% success rate threshold

const healthChecks = metricsCollector.getAllHealthChecks(thresholdSuccessRate);
const degradedServices = healthChecks.filter(h => !h.healthy);

if (degradedServices.length > 0) {
    console.error('Degraded services:', degradedServices);
    // Send alert to monitoring system
}
```

#### 3. Export to Monitoring Systems

Export metrics for integration with external monitoring:

```typescript
const metrics = metricsCollector.exportMetrics();

// Send to monitoring system (e.g., Prometheus, Datadog, CloudWatch)
metrics.forEach(metric => {
    monitoringSystem.push({
        metric: metric.name,
        value: metric.value,
        timestamp: metric.timestamp,
        tags: metric.tags,
    });
});
```

#### 4. Reset Metrics Periodically

Reset metrics to prevent memory growth:

```typescript
// Reset metrics every 24 hours
setInterval(() => {
    metricsCollector.resetAll();
    console.log('Metrics reset');
}, 86400000);  // 24 hours
```

#### 5. Track Response Time Trends

Monitor response time trends:

```typescript
const metrics = metricsCollector.getMetrics('EmailService');
if (metrics?.averageResponseTime) {
    if (metrics.averageResponseTime > 5000) {  // 5 seconds
        console.warn('EmailService response time is high:', metrics.averageResponseTime);
    }
}
```

---

### Success Rate Thresholds

Recommended thresholds for different service types:

| Service Type | Critical | Warning | Healthy |
|--------------|----------|----------|----------|
| Critical (Email, Auth) | < 90% | 90-95% | > 95% |
| Important (API Integrations) | < 80% | 80-90% | > 90% |
| Standard (Analytics, Logging) | < 70% | 70-85% | > 85% |

---

### Error Type Tracking

The metrics collector tracks the following error types:

| Error Type | Description | Example |
|------------|-------------|----------|
| `credentials_not_configured` | Missing API credentials | EmailJS credentials not configured |
| `rate_limit` | Rate limit exceeded | Too many requests |
| `timeout` | Request timeout | EmailJS request timed out |
| `circuit_breaker` | Circuit breaker is open | Service temporarily unavailable |
| `validation` | Input validation failed | Invalid email format |
| `unknown` | Unhandled error | Unexpected error occurred |

---

### Metrics Export Format

Exported metrics follow a consistent naming convention:

```
{serviceName}.{metric_name}
```

Available metrics:
- `{serviceName}.total_calls` - Total number of calls
- `{serviceName}.success_calls` - Number of successful calls
- `{serviceName}.failure_calls` - Number of failed calls
- `{serviceName}.timeout_calls` - Number of timeout errors
- `{serviceName}.rate_limit_calls` - Number of rate limit errors
- `{serviceName}.circuit_breaker_open_count` - Number of circuit breaker opens
- `{serviceName}.average_response_time` - Average response time in milliseconds

---

## Versioning

### API Versioning Strategy

- **Current Version**: v1.0
- **Version Format**: Semantic Versioning (Major.Minor.Patch)
- **Backward Compatibility**: Maintained within major versions
- **Deprecation**: 3-month notice period before breaking changes

---

## Changelog

### v1.1.0 (Current)
- Integration monitoring & metrics layer
- Real-time service health checks
- Metrics export for external monitoring systems
- Success/failure rate tracking
- Response time monitoring
- Circuit breaker state tracking

### v1.0.0
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
