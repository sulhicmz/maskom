# Error Response Documentation

This document provides comprehensive documentation for all error responses in the Maskom API, including error codes, HTTP status codes, retry behavior, and client handling recommendations.

## Table of Contents

- [Error Response Schema](#error-response-schema)
- [Standard Error Codes](#standard-error-codes)
- [HTTP Status Codes](#http-status-codes)
- [Service-Specific Errors](#service-specific-errors)
- [Retry Behavior](#retry-behavior)
- [Client Handling Guidelines](#client-handling-guidelines)
- [Error Examples](#error-examples)

---

## Error Response Schema

All errors follow a standardized response format:

### Basic Error Response

```typescript
interface ServiceResult<T = void> {
    success: boolean;        // Always false for errors
    error?: string;         // Human-readable error message
    errorCode?: ServiceErrorCodeType;  // Machine-readable error code
    metadata?: Record<string, unknown>;  // Additional error context
}
```

### Full Error Response (with HTTP headers)

**Response Headers:**
```
Content-Type: application/json
Cache-Control: no-cache, no-store, must-revalidate
Retry-After: <seconds>
```

**Response Body:**
```json
{
    "success": false,
    "error": "Rate limit exceeded",
    "errorCode": "RATE_LIMIT_EXCEEDED",
    "metadata": {
        "retryAfter": 60,
        "resetTime": 1737268800000,
        "limit": 5,
        "window": 60000
    }
}
```

---

## Standard Error Codes

### Error Code Registry

| Error Code | Code Value | Description | Retryable | Category |
|------------|-------------|-------------|------------|----------|
| VALIDATION_ERROR | `VALIDATION_ERROR` | Invalid input data or validation failure | No | Client Error |
| RATE_LIMIT_EXCEEDED | `RATE_LIMIT_EXCEEDED` | Too many requests, rate limit exceeded | Yes | Rate Limit |
| TIMEOUT | `TIMEOUT` | Request timed out | Yes | Timeout |
| CIRCUIT_BREAKER_OPEN | `CIRCUIT_BREAKER_OPEN` | Service circuit breaker is open | Yes | Circuit Breaker |
| CREDENTIALS_MISSING | `CREDENTIALS_MISSING` | Service credentials not configured | No | Configuration |
| NETWORK_ERROR | `NETWORK_ERROR` | Network connectivity issue | Yes | Network |
| UNKNOWN_ERROR | `UNKNOWN_ERROR` | Unknown error occurred | No | Unknown |

### Error Code Hierarchy

```
ServiceError
├── Client Errors (4xx)
│   ├── VALIDATION_ERROR (400)
│   ├── RATE_LIMIT_EXCEEDED (429)
│   └── CREDENTIALS_MISSING (500)
├── Server Errors (5xx)
│   ├── TIMEOUT (504)
│   ├── CIRCUIT_BREAKER_OPEN (503)
│   ├── NETWORK_ERROR (503)
│   └── UNKNOWN_ERROR (500)
```

---

## HTTP Status Codes

### 4xx Client Errors

#### 400 Bad Request

**Used for:** VALIDATION_ERROR

**Description:** The request was malformed or contains invalid data.

**Client Action:**
1. Validate request against API specification
2. Check for missing required fields
3. Verify data types and formats
4. Fix the request and retry

**Example Response:**
```json
{
    "success": false,
    "error": "Email and password are required",
    "errorCode": "VALIDATION_ERROR",
    "metadata": {
        "field": "email",
        "constraint": "required"
    }
}
```

#### 401 Unauthorized

**Used for:** Authentication failures (not currently implemented)

**Description:** The request requires authentication but none was provided.

**Client Action:**
1. Authenticate user
2. Include valid JWT token in Authorization header
3. Retry request

**Example Response:**
```json
{
    "success": false,
    "error": "Authentication required",
    "errorCode": "AUTH_REQUIRED"
}
```

#### 403 Forbidden

**Used for:** Authorization failures (not currently implemented)

**Description:** The authenticated user doesn't have permission to access the resource.

**Client Action:**
1. Check user permissions
2. Request necessary permissions
3. Retry with different user credentials

**Example Response:**
```json
{
    "success": false,
    "error": "Insufficient permissions",
    "errorCode": "FORBIDDEN",
    "metadata": {
        "requiredPermission": "view_analytics",
        "userRole": "user"
    }
}
```

#### 429 Too Many Requests

**Used for:** RATE_LIMIT_EXCEEDED

**Description:** The client has exceeded the rate limit.

**Response Headers:**
```
Retry-After: 60
```

**Client Action:**
1. Extract `Retry-After` value from response header
2. Wait for specified seconds before retrying
3. Implement exponential backoff for subsequent retries
4. Reduce request frequency

**Example Response:**
```json
{
    "success": false,
    "error": "Too many login attempts",
    "errorCode": "RATE_LIMIT_EXCEEDED",
    "metadata": {
        "retryAfter": 60,
        "resetTime": 1737268800000,
        "limit": 5,
        "window": 900000,
        "remainingAttempts": 0,
        "cooldownUntil": 1737268860000
    }
}
```

**Metadata Fields:**
- `retryAfter`: Seconds until retry is allowed
- `resetTime`: Unix timestamp when rate limit resets
- `limit`: Maximum number of requests allowed
- `window`: Rate limit window in milliseconds
- `remainingAttempts`: Number of attempts remaining (if any)
- `cooldownUntil`: Unix timestamp when cooldown period ends (if applicable)

### 5xx Server Errors

#### 500 Internal Server Error

**Used for:** UNKNOWN_ERROR, CREDENTIALS_MISSING

**Description:** An unexpected error occurred on the server.

**Client Action:**
1. Do not retry immediately (not retryable for UNKNOWN_ERROR)
2. Check service status endpoint
3. Contact support if issue persists
4. For CREDENTIALS_MISSING: Service configuration issue, no client action possible

**Example Response:**
```json
{
    "success": false,
    "error": "Internal server error",
    "errorCode": "UNKNOWN_ERROR",
    "metadata": {
        "requestId": "req_abc123",
        "timestamp": 1737268740000
    }
}
```

#### 503 Service Unavailable

**Used for:** CIRCUIT_BREAKER_OPEN, NETWORK_ERROR

**Description:** The service is temporarily unavailable or experiencing network issues.

**Response Headers:**
```
Retry-After: 10
```

**Client Action:**
1. Extract `Retry-After` value from response header
2. Wait for specified seconds before retrying
3. Implement exponential backoff for subsequent retries
4. Check service health endpoint for status

**Example Response (Circuit Breaker Open):**
```json
{
    "success": false,
    "error": "Service temporarily unavailable",
    "errorCode": "CIRCUIT_BREAKER_OPEN",
    "metadata": {
        "retryAfter": 60,
        "failureCount": 5,
        "lastFailureTime": 1737268680000,
        "resetTime": 1737268740000,
        "state": "open"
    }
}
```

**Example Response (Network Error):**
```json
{
    "success": false,
    "error": "Network error occurred",
    "errorCode": "NETWORK_ERROR",
    "metadata": {
        "retryAfter": 10,
        "networkError": "ECONNREFUSED"
    }
}
```

#### 504 Gateway Timeout

**Used for:** TIMEOUT

**Description:** The request took longer than the allowed timeout period.

**Response Headers:**
```
Retry-After: 30
```

**Client Action:**
1. Extract `Retry-After` value from response header
2. Wait for specified seconds before retrying
3. Consider reducing request payload or complexity
4. Check if service is overloaded

**Example Response:**
```json
{
    "success": false,
    "error": "Request timed out",
    "errorCode": "TIMEOUT",
    "metadata": {
        "retryAfter": 30,
        "timeoutMs": 10000,
        "operation": "EmailService.sendEmail",
        "elapsedTime": 10001
    }
}
```

---

## Service-Specific Errors

### EmailService Errors

#### Template Not Found
```json
{
    "success": false,
    "error": "Email template with ID 1 not found",
    "errorCode": "TEMPLATE_NOT_FOUND",
    "metadata": {
        "templateId": 1
    }
}
```

#### Template Validation Failed
```json
{
    "success": false,
    "error": "Template validation failed: Missing required variable: {{userName}}",
    "errorCode": "TEMPLATE_VALIDATION_FAILED",
    "metadata": {
        "errors": [
            "Missing required variable: {{userName}}",
            "Missing required variable: {{blogTitle}}"
        ]
    }
}
```

#### Email Credentials Not Configured
```json
{
    "success": false,
    "error": "EmailJS credentials not configured",
    "errorCode": "CREDENTIALS_MISSING",
    "metadata": {
        "missingCredentials": ["serviceId", "templateId", "publicKey"]
    }
}
```

### AuthService Errors

#### MFA Required
```json
{
    "success": false,
    "error": "MFA diperlukan untuk peran admin",
    "errorCode": "VALIDATION_ERROR",
    "metadata": {
        "requiresMFA": true,
        "userRole": "admin"
    }
}
```

#### Invalid MFA Code
```json
{
    "success": false,
    "error": "Invalid TOTP code",
    "errorCode": "VALIDATION_ERROR",
    "metadata": {
        "field": "totpCode",
        "reason": "Code verification failed"
    }
}
```

#### Invalid Backup Code
```json
{
    "success": false,
    "error": "Invalid backup code",
    "errorCode": "VALIDATION_ERROR",
    "metadata": {
        "field": "backupCode",
        "reason": "Backup code not found or already used"
    }
}
```

#### MFA Not Enabled
```json
{
    "success": false,
    "error": "MFA not enabled",
    "errorCode": "VALIDATION_ERROR",
    "metadata": {
        "mfaEnabled": false,
        "required": true
    }
}
```

#### Invalid Password
```json
{
    "success": false,
    "error": "Kata sandi tidak valid",
    "errorCode": "VALIDATION_ERROR",
    "metadata": {
        "field": "password",
        "reason": "Password must be at least 8 characters"
    }
}
```

#### Invalid Email Format
```json
{
    "success": false,
    "error": "Format email tidak valid",
    "errorCode": "VALIDATION_ERROR",
    "metadata": {
        "field": "email",
        "provided": "invalid-email",
        "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
    }
}
```

---

## Retry Behavior

### Retryable Errors

The following errors are considered retryable:

| Error Code | Recommended Backoff | Max Retries |
|------------|---------------------|-------------|
| RATE_LIMIT_EXCEEDED | Follow Retry-After header | 1 |
| TIMEOUT | Exponential (1s, 2s, 4s, 8s) | 4 |
| CIRCUIT_BREAKER_OPEN | Follow Retry-After header | 1 |
| NETWORK_ERROR | Exponential (1s, 2s, 4s, 8s) | 4 |

### Exponential Backoff Algorithm

```typescript
function getBackoffMs(retryAttempt: number): number {
    const baseDelayMs = 1000;
    const backoffMultiplier = 2;
    const maxDelayMs = 8000;
    
    const delay = baseDelayMs * Math.pow(backoffMultiplier, retryAttempt);
    return Math.min(delay, maxDelayMs);
}
```

**Example:**
- Retry 1: 1000ms (1s)
- Retry 2: 2000ms (2s)
- Retry 3: 4000ms (4s)
- Retry 4: 8000ms (8s)

### Circuit Breaker Retry Pattern

When circuit breaker is open:
1. **Do not retry immediately**
2. Wait for `Retry-After` value from response header
3. After wait period, circuit enters half-open state
4. First successful request closes circuit
5. Failed request re-opens circuit

### Rate Limit Retry Pattern

When rate limit is exceeded:
1. **Always respect Retry-After header**
2. Do not retry until specified time
3. Reset retry count after successful request
4. Implement client-side rate limiting to avoid future hits

---

## Client Handling Guidelines

### Best Practices

#### 1. Always Check `success` Field

```typescript
const response = await someApiCall();

if (response.success) {
    // Handle success
    console.log('Success:', response.message);
    console.log('Data:', response.data);
} else {
    // Handle error
    console.error('Error:', response.error);
    console.error('Code:', response.errorCode);
    console.error('Metadata:', response.metadata);
}
```

#### 2. Use Error Codes for Conditional Logic

```typescript
if (!response.success) {
    switch (response.errorCode) {
        case 'RATE_LIMIT_EXCEEDED':
            const retryAfter = response.metadata?.retryAfter as number;
            setTimeout(() => retry(), retryAfter * 1000);
            break;
        case 'VALIDATION_ERROR':
            showValidationError(response.error);
            break;
        case 'CIRCUIT_BREAKER_OPEN':
            showServiceUnavailable();
            break;
        default:
            showGenericError(response.error);
    }
}
```

#### 3. Respect Retry-After Header

```typescript
async function fetchWithRetry(url: string, retries = 0): Promise<Response> {
    const response = await fetch(url);
    
    if (!response.ok) {
        const retryAfter = response.headers.get('Retry-After');
        
        if (retryAfter) {
            const delay = parseInt(retryAfter) * 1000;
            await sleep(delay);
            return fetchWithRetry(url, retries + 1);
        }
    }
    
    return response;
}
```

#### 4. Implement Circuit Breaker on Client Side

```typescript
class ClientCircuitBreaker {
    private failureCount = 0;
    private lastFailureTime = 0;
    private isOpen = false;
    
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.isOpen) {
            if (Date.now() - this.lastFailureTime > 60000) {
                this.isOpen = false;
                this.failureCount = 0;
            } else {
                throw new Error('Circuit breaker is open');
            }
        }
        
        try {
            const result = await fn();
            this.failureCount = 0;
            return result;
        } catch (error) {
            this.failureCount++;
            this.lastFailureTime = Date.now();
            
            if (this.failureCount >= 3) {
                this.isOpen = true;
            }
            
            throw error;
        }
    }
}
```

#### 5. Display User-Friendly Messages

```typescript
function getErrorMessage(response: ServiceResult): string {
    switch (response.errorCode) {
        case 'VALIDATION_ERROR':
            return 'Please check your input and try again';
        case 'RATE_LIMIT_EXCEEDED':
            const retryAfter = response.metadata?.retryAfter as number;
            return `Please try again in ${retryAfter} seconds`;
        case 'TIMEOUT':
            return 'Request timed out. Please try again';
        case 'CIRCUIT_BREAKER_OPEN':
            return 'Service is temporarily unavailable. Please try again later';
        default:
            return response.error || 'An error occurred';
    }
}
```

### Anti-Patterns to Avoid

#### 1. Never Retry Non-Retryable Errors

```typescript
// ❌ BAD - Always retrying
if (!response.success) {
    setTimeout(() => retry(), 1000);
}

// ✅ GOOD - Only retry retryable errors
if (!response.success && isRetryable(response.errorCode)) {
    setTimeout(() => retry(), getBackoffMs(retries));
}
```

#### 2. Never Ignore Error Codes

```typescript
// ❌ BAD - Only checking error message
if (response.error?.includes('rate limit')) {
    // Handle rate limit
}

// ✅ GOOD - Using error codes
if (response.errorCode === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limit
}
```

#### 3. Never Retry Indefinitely

```typescript
// ❌ BAD - Infinite retry loop
while (!response.success) {
    response = await apiCall();
}

// ✅ GOOD - Limited retries
for (let i = 0; i < MAX_RETRIES; i++) {
    const response = await apiCall();
    if (response.success || !isRetryable(response.errorCode)) {
        break;
    }
    await sleep(getBackoffMs(i));
}
```

#### 4. Never Hardcode Retry Delays

```typescript
// ❌ BAD - Fixed delay
setTimeout(() => retry(), 5000);

// ✅ GOOD - Respect Retry-After header
const retryAfter = response.metadata?.retryAfter as number;
setTimeout(() => retry(), retryAfter * 1000);
```

---

## Error Examples

### Complete Error Flow Example

#### Step 1: Rate Limit Hit

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "wrong"
}
```

**Response (429):**
```json
{
    "success": false,
    "error": "Too many login attempts",
    "errorCode": "RATE_LIMIT_EXCEEDED",
    "metadata": {
        "retryAfter": 60,
        "resetTime": 1737268800000,
        "limit": 5,
        "window": 900000,
        "remainingAttempts": 0,
        "cooldownUntil": 1737268860000
    }
}
```

**Headers:**
```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Cache-Control: no-cache, no-store, must-revalidate
Retry-After: 60
```

#### Step 2: Wait and Retry

**After 60 seconds:**

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "correct"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Berhasil masuk ke portal",
    "data": {
        "user": {
            "id": "user-123",
            "name": "User Name",
            "email": "user@example.com",
            "role": "user",
            "mfaEnabled": false
        },
        "token": "mock-jwt-token"
    }
}
```

### Circuit Breaker Flow Example

#### Step 1: Service Degradation

**Multiple requests fail:**
1. First failure: `NETWORK_ERROR`
2. Second failure: `TIMEOUT`
3. Third failure: `NETWORK_ERROR`
4. Fourth failure: `TIMEOUT`
5. Fifth failure: `CIRCUIT_BREAKER_OPEN`

**Response (503):**
```json
{
    "success": false,
    "error": "Service temporarily unavailable",
    "errorCode": "CIRCUIT_BREAKER_OPEN",
    "metadata": {
        "retryAfter": 60,
        "failureCount": 5,
        "lastFailureTime": 1737268680000,
        "resetTime": 1737268740000,
        "state": "open"
    }
}
```

**Headers:**
```
HTTP/1.1 503 Service Unavailable
Content-Type: application/json
Cache-Control: no-cache, no-store, must-revalidate
Retry-After: 60
```

#### Step 2: Wait for Circuit Reset

**After 60 seconds, circuit enters half-open state**

#### Step 3: First Success Closes Circuit

**Request:**
```http
GET /api/email-queue
```

**Response (200):**
```json
{
    "success": true,
    "message": "Email queue status retrieved successfully",
    "data": {
        "queue": {
            "size": 0,
            "expired": 0,
            "status": "empty"
        },
        "circuitBreaker": {
            "isOpen": false,
            "failureCount": 0,
            "lastFailureTime": null,
            "lastSuccessTime": 1737268740000,
            "status": "closed"
        }
    }
}
```

### Timeout Flow Example

#### Step 1: Slow Request

**Request:**
```http
POST /api/email-queue
```

**Processing takes 10+ seconds**

**Response (504):**
```json
{
    "success": false,
    "error": "Request timed out",
    "errorCode": "TIMEOUT",
    "metadata": {
        "retryAfter": 30,
        "timeoutMs": 10000,
        "operation": "EmailQueue.PROCESS",
        "elapsedTime": 10001
    }
}
```

**Headers:**
```
HTTP/1.1 504 Gateway Timeout
Content-Type: application/json
Cache-Control: no-cache, no-store, must-revalidate
Retry-After: 30
```

#### Step 2: Retry with Exponential Backoff

```typescript
async function callWithExponentialBackoff() {
    const maxRetries = 4;
    const baseDelayMs = 1000;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch('/api/email-queue');
            const data = await response.json();
            
            if (data.success) {
                return data;
            }
            
            // Non-retryable error, break
            if (!isRetryable(data.errorCode)) {
                throw new Error(data.error);
            }
            
            // Retryable error, continue loop
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
        }
        
        // Exponential backoff
        const delay = baseDelayMs * Math.pow(2, i);
        await sleep(delay);
    }
}

function isRetryable(errorCode?: string): boolean {
    return ['TIMEOUT', 'CIRCUIT_BREAKER_OPEN', 'NETWORK_ERROR'].includes(errorCode || '');
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## Monitoring and Debugging

### Request ID Tracking

All error responses include metadata for debugging:

```json
{
    "success": false,
    "error": "Internal server error",
    "errorCode": "UNKNOWN_ERROR",
    "metadata": {
        "requestId": "req_abc123xyz",
        "timestamp": 1737268740000,
        "service": "EmailService",
        "operation": "sendEmail"
    }
}
```

**Client Action:**
- Log `requestId` for debugging
- Include `requestId` in bug reports
- Use `requestId` to correlate with server logs

### Service Health Check

Before making critical requests, check service health:

```typescript
async function checkServiceHealth(): Promise<boolean> {
    const response = await fetch('/api/health');
    const data = await response.json();
    
    return data.data?.status === 'healthy';
}
```

### Circuit Breaker Monitoring

Monitor circuit breaker state to avoid wasted requests:

```typescript
async function getCircuitBreakerState(service: string) {
    const response = await fetch('/api/services/status');
    const data = await response.json();
    
    return data.data[service]?.circuitBreaker;
}

// Usage
const emailCB = await getCircuitBreakerState('email');
if (emailCB.isOpen) {
    console.log('Email service is down, skipping email send');
} else {
    await sendEmail();
}
```

---

## Additional Resources

- **OpenAPI Specification**: `docs/openapi.yaml`
- **Service Contracts**: `docs/service-contracts.md`
- **API Documentation**: `/api/docs` (when Swagger UI is implemented)
- **Support**: support@maskom.com

---

## Changelog

### Version 1.0.0 (2026-01-19)
- Initial error response documentation
- Standardized error codes defined
- HTTP status code mappings documented
- Client handling guidelines added
- Retry behavior specifications added
