# Blueprint - Architectural Overview

## Project Structure

```
maskom/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components (organized by category)
│   ├── data/            # Static TypeScript data files
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Layout components (headers, footers, wrapper)
│   ├── modals/          # Modal components
│   └── styles/          # SCSS entry points
├── public/              # Static assets, _headers for Cloudflare
└── docs/               # Architecture decisions, operations docs
```

## Core Principles

1. **Data-Driven UI**: All dynamic content comes from TypeScript data files in `src/data/`
2. **Component Organization**: Components organized as `src/components/[category]/[component]/`
3. **Path Aliases**: `@/*` → `./src/*`, `@/assets/*` → `./public/assets/*`
4. **Client/Server Separation**: Components use `"use client"` directive appropriately
5. **Edge Runtime**: Support for both edge and nodejs_compat runtimes for Cloudflare Workers
6. **Data Integrity**: Centralized type definitions and runtime validation for all data structures

## Data Flow Pattern

```
Data Files (src/data/*.ts)
    ↓
Filter Utilities (src/utils/dataFilters.ts) - Type-safe filtering
    ↓
Pre-filtered Exports (page-specific data)
    ↓
Components (use pre-filtered data)
    ↓
Pages/Sections
    ↓
Layout/Wrapper
```

## Architectural Patterns

### Good Patterns (Maintain)
- ✅ Data-driven content management
- ✅ Component modularity with clear separation
- ✅ TypeScript interfaces for data structures
- ✅ Environment variables for sensitive data
- ✅ Clean file organization by category
- ✅ Centralized filter utilities for type-safe data operations
- ✅ Pre-filtered data exports at build time
- ✅ Centralized type definitions in `src/types/data/`
- ✅ Runtime data validation with comprehensive test coverage
- ✅ Validation factory pattern with configuration-based validators (eliminates code duplication)
- ✅ Error boundaries with graceful error handling and recovery options

### Anti-Patterns (Fix)
- ❌ Business logic in presentation components (ContactForm) - FIXED
- ❌ Direct third-party library usage without abstraction - FIXED
- ❌ Duplicate code across components (resize handlers) - FIXED
- ❌ Hardcoded filter logic in multiple places - FIXED
- ❌ Missing service layer for external APIs - FIXED
- ❌ Validation logic duplication (20+ identical functions) - FIXED
- ❌ Missing error boundaries for component error handling - FIXED

### Integration Patterns (Maintain)

All external service integrations follow these resilience patterns:

#### Resilience Layers

```
Service Layer (EmailService, etc.)
    ↓
Circuit Breaker (prevents cascading failures)
    ↓
Retry with Exponential Backoff (handles transient failures)
    ↓
Timeout Protection (prevents indefinite hangs)
    ↓
External API (EmailJS, etc.)
```

#### 1. Timeout Protection

- **Purpose**: Prevent indefinite waits on slow/unresponsive services
- **Implementation**: `withTimeout()` wrapper with configurable timeout
- **Default Timeout**: 10 seconds for EmailJS requests
- **Error**: TimeoutError with descriptive message
- **Location**: `src/utils/resilience/timeout.ts`

#### 2. Retry with Exponential Backoff

- **Purpose**: Handle transient failures (network issues, temporary outages)
- **Implementation**: `withRetry()` wrapper with exponential backoff
- **Configuration**:
  - Max Attempts: 3 (1 initial + 2 retries)
  - Base Delay: 1,000ms (1 second)
  - Max Delay: 10,000ms (10 seconds)
  - Backoff Multiplier: 2x
  - Retryable Patterns: /network/i, /timeout/i, /ECONN/i
- **Location**: `src/utils/resilience/retry.ts`

#### 3. Circuit Breaker

- **Purpose**: Stop calling failing services to prevent cascading failures
- **Implementation**: `CircuitBreaker` class with state machine
- **States**:
  - **Closed**: Normal operation, requests flow through
  - **Open**: Requests rejected immediately after threshold
  - **Half-Open**: Test request to check recovery
- **Configuration**:
  - Failure Threshold: 5 consecutive failures
  - Reset Timeout: 60,000ms (60 seconds)
  - Monitoring Period: 60,000ms (60 seconds)
- **Location**: `src/utils/resilience/circuitBreaker.ts`

#### 4. Service Abstraction

- **Purpose**: Decouple business logic from external API implementations
- **Implementation**: Interface-based service layer with dependency injection
- **Benefits**:
  - Easy to mock for testing
  - Simple to swap implementations (e.g., EmailJS → SendGrid)
  - Centralized error handling and logging
- **Location**: `src/services/email/EmailService.ts`

#### Error Handling

- **ResilienceError**: Custom error type with `isTimeout` and `isRetryable` flags
- **Logging**: Non-sensitive error messages only (no secrets or stack traces)
- **User Experience**: Graceful degradation with informative error messages

#### 4. Rate Limiting

- **Purpose**: Prevent abuse and protect backend resources from excessive requests
- **Implementation**: `RateLimiter` class with configurable limits and cooldown
- **Configuration**:
  - **Email Limiter**: 5 attempts per 60s window, 5 minute cooldown
  - **Form Limiter**: 10 attempts per 1 hour window, 2 hour cooldown
- **Features**:
  - Per-identifier tracking (email, IP, user ID)
  - Automatic reset after window expires
  - Cooldown period after limit exceeded
  - Cleanup of expired records
- **Error Handling**: Clear error messages with remaining time
- **Location**: `src/utils/rateLimiter.ts`

#### 5. Service Abstraction

- **Purpose**: Decouple business logic from external API implementations
- **Implementation**: Interface-based service layer with dependency injection
- **Benefits**:
  - Easy to mock for testing
  - Simple to swap implementations (e.g., EmailJS → SendGrid)
  - Centralized error handling and logging
- **Location**: `src/services/email/EmailService.ts`

#### Error Handling

- **ResilienceError**: Custom error type with `isTimeout` and `isRetryable` flags
- **Logging**: Non-sensitive error messages only (no secrets or stack traces)
- **User Experience**: Graceful degradation with informative error messages
- **Rate Limiting**: Clear messages with countdown timers

#### Monitoring

- **Circuit Breaker State**: Accessible via `getCircuitBreakerState()`
- **Manual Reset**: Available via `resetCircuitBreaker()` (use with caution)
- **Rate Limit Status**: Accessible via `getStatus(identifier)`
- **Metrics**: Future enhancement for success rates, failure patterns

## Key Dependencies

- **Framework**: Next.js 15 (App Router)
- **Deployment**: OpenNext for Cloudflare Workers
- **UI Libraries**: Bootstrap 5, Swiper, Isotope
- **Forms**: React Hook Form, Yup validation
- **Email**: EmailJS (via service abstraction with resilience patterns)
- **Animations**: WOW.js, React Toastify
- **Data Filtering**: Custom utility functions with TypeScript generics
- **Error Handling**: React Error Boundary with custom fallback UI

## Error Handling Pattern

```
ErrorBoundary (src/components/common/ErrorBoundary.tsx)
    ↓
Wrapper Component (src/layouts/Wrapper.tsx) - Wraps all page content
    ↓
Pages and Components
```

### Error Boundary Implementation

- **Purpose**: Catch and handle component errors gracefully without crashing entire page
- **Implementation**: React class component with componentDidCatch lifecycle method
- **Location**: `src/components/common/ErrorBoundary.tsx` and integrated in `src/layouts/Wrapper.tsx`
- **Fallback UI**: User-friendly error page with recovery options
- **Error Logging**: Console logging with error ID for debugging
- **Error Recovery**: Two options - Reload page or Try Again (reset state)
- **Contact Link**: Direct link to contact page for persistent issues

#### Features

- **Error ID Generation**: Unique error ID format (ERR-TIMESTAMP-RANDOM)
- **Safe Error Logging**: Only logs error.message, error.stack, and componentStack (no sensitive data)
- **Custom Fallback Support**: Allows custom fallback UI via prop
- **Accessibility**: Proper heading hierarchy and button roles
- **User-Friendly Messages**: Clear, non-technical error messages in Indonesian

#### Error Recovery Options

1. **Muat Ulang Halaman (Reload Page)**: Refreshes entire page
2. **Coba Lagi (Try Again)**: Resets error state and re-renders children
3. **Hubungi Kami (Contact Us)**: Link to contact page for persistent issues

#### Testing

- 25 comprehensive tests covering:
  - Normal rendering without errors
  - Error catching and fallback display
  - Error ID generation and uniqueness
  - Reset functionality
  - Custom fallback prop
  - Edge cases (null, undefined, empty fragment children)
  - Accessibility (headings, button roles)
  - Error logging verification

#### Usage Example

```typescript
import ErrorBoundary from "@/components/common/ErrorBoundary";

<ErrorBoundary>
    <PageContent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorPage />}>
    <PageContent />
</ErrorBoundary>
```

## Technical Constraints

- Cloudflare Workers runtime compatibility
- Edge runtime limitations (no Node.js APIs)
- SSR/CSR split for Next.js App Router
- Bootstrap 5 integration with custom SCSS

## Roadmap

See `docs/task.md` for ongoing architectural improvements and prioritized refactoring tasks.

## API Documentation

Comprehensive API specifications for all external service integrations are documented in `docs/api.md`.

- Email Service API with resilience patterns
- Error response standards
- Rate limiting configuration
- Adding new integrations guide

## Security Configuration

### CORS (Cross-Origin Resource Sharing)

The application uses environment-based CORS configuration for flexibility across environments:

```bash
# .env.local
NEXT_PUBLIC_CORS_ORIGIN=https://maskom.co.id  # Production
# NEXT_PUBLIC_CORS_ORIGIN=http://localhost:3000  # Development
```

**Security Headers** (public/_headers):
- **Access-Control-Allow-Origin**: Uses `$NEXT_PUBLIC_CORS_ORIGIN` environment variable
- **Access-Control-Allow-Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Access-Control-Allow-Headers**: Content-Type, Authorization
- **Access-Control-Max-Age**: 86400

**Environment-Specific Values**:
- **Production**: `https://maskom.co.id` (single origin, secure by default)
- **Development**: `http://localhost:3000` or `http://127.0.0.1:3000`
- **Staging**: Specific staging domain (never use wildcard `*`)

**Implementation**: Cloudflare Pages supports `$VARIABLE` syntax in `_headers` file for environment variable substitution.

### Additional Security Headers

- **X-Frame-Options: DENY** - Prevents clickjacking
- **X-Content-Type-Options: nosniff** - MIME-type sniffing protection
- **X-XSS-Protection: 1; mode=block** - XSS protection
- **Strict-Transport-Security**: max-age=63072000 with includeSubDomains and preload (HSTS)
- **Content-Security-Policy**: Comprehensive CSP with proper restrictions
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: geolocation=(), microphone=(), camera=()
