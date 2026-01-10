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

## Data Architecture

### Current Data Model

The application uses a **static data-driven architecture** with TypeScript data files:

```
Data Files (src/data/*.ts)
    ↓
Type Definitions (src/types/data/index.ts)
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

### Data Structure Patterns

#### Base Type Pattern

**BaseDataItem** - Common structure for data items:

```typescript
export interface BaseDataItem {
    id: number;              // Unique identifier
    page: string;            // Page route for filtering
}
```

**Usage**:
- Items extending `BaseDataItem` have both `id` and `page` fields
- Enables filtering by page via `filterByPage()` utility
- Supports unique identification across collections

#### Data Collection Patterns

**Pattern 1: BaseDataItem Extension** (Page-filtered data):
```typescript
// FaqItem, FeatureItem, FeedbackItem, etc.
export interface FaqItem extends BaseDataItem {
    question: string;
    answer: string;
}
```

**Pattern 2: Standalone Items** (Global data):
```typescript
// TeamMember, MenuItem, InnerBlogPost
export interface TeamMember {
    id: number;
    img: StaticImageData;
    title: string;
    designation: string;
}
```

#### Data Access Patterns

**Pattern 1: Direct Export** (Simple):
```typescript
export default team_data;
```

**Pattern 2: Pre-filtered Export** (Page-specific):
```typescript
export default testi_data;
export const home_1_feedback = filterItems(testi_data, "home_1");
export const home_2_feedback = filterItems(testi_data, "home_2");
```

### Data Files Inventory

| Data File | Base Type | Has Page | Has ID | Pre-filtered | Purpose |
|-----------|-----------|----------|--------|--------------|---------|
| TeamData.ts | TeamMember | No | Yes | No | Team members |
| InnerBlogData.ts | InnerBlogPost | No | Yes | No | Blog posts |
| FeedbackData.ts | FeedbackItem | Yes | Yes | Yes | Testimonials |
| MenuData.ts | MenuItem | No | Yes | No | Navigation menu |
| FaqData.ts | FaqItem | Yes | Yes | No | FAQ items |
| FeatureData.ts | FeatureItem | Yes | Yes | No | Feature cards |
| ProcessData.ts | ProcessItem | Yes | Yes | No | Process steps |
| CauseData.ts | CauseItem | Yes | Yes | No | Cause cards |
| PriceData.ts | PriceItem | Yes | Yes | No | Pricing tables |
| BlogCommentData.ts | BlogCommentItem | No | Yes | No | Blog comments |
| SocialMediaData.ts | SocialLink | No | No | No | Social links |
| InnerFaqData.ts | InnerFaqItem | No | Yes | No | FAQ categories |
| DashboardData.ts | WiFiDevice, etc. | No | Yes | No | Dashboard widgets |

### Data Validation (✅ COMPLETED - Task 40 Phase 1) & Indexing (✅ COMPLETED - Task 40 Phase 2)

**Validation Utilities** (src/utils/dataValidation.ts):
- ✅ `createValidator<T>()` - Factory pattern for creating validators
- ✅ `validateBaseDataItem()` - Validate BaseDataItem structure
- ✅ `validateRequiredFields<T>()` - Check required fields (via createValidator)
- ✅ `validateUniqueId<T>()` - Ensure unique IDs (via checkDuplicateIds)
- ✅ `validateEmail()` - Email format validation (via createValidator)
- ✅ `validateDate()` - Date format validation (via createValidator)
- ✅ `validateRange()` - Number range validation (via createValidator)
- ✅ `validateEnum<T>()` - Enum value validation (via createValidator)

**Implemented Validators** (21 total):
- ✅ `validateFeedbackItem` - Testimonials with rating validation
- ✅ `validateFaqItem` - FAQ questions and answers
- ✅ `validatePriceItem` - Pricing packages with nested PriceDetailItem validation
- ✅ `validatePriceDetailItem` - Individual pricing tiers
- ✅ `validateFeatureItem` - Feature cards
- ✅ `validateProcessItem` - Process steps
- ✅ `validateCauseItem` - Cause cards
- ✅ `validateMenuItem` - Navigation menu with sub-menu validation
- ✅ `validateWiFiDevice` - Dashboard WiFi devices
- ✅ `validateWebsiteTemplate` - Website templates
- ✅ `validateAIStep` - AI process steps
- ✅ `validateBlogCommentItem` - Blog comments
- ✅ `validateTeamMember` - Team member profiles
- ✅ `validateInnerBlogPost` - Inner blog posts
- ✅ `validateFaqDetail` - FAQ detail sections
- ✅ `validateInnerFaqItem` - FAQ categories with details
- ✅ `validateSocialLink` - Social media links with target validation
- ✅ `validateNavigationItem` - Navigation items
- ✅ `validateNavigationSection` - Navigation sections
- ✅ `validateDataArray<T>()` - Validate entire arrays
- ✅ `checkDuplicateIds<T>()` - Check for duplicate IDs across items

**Testing**:
- ✅ 64 comprehensive tests (100% passing)
- ✅ All validators tested with valid and invalid inputs
- ✅ Duplicate ID detection verified
- ✅ Custom rule validation tested

### Data Indexing (✅ COMPLETED - Task 40 Phase 2)

**Index Utilities** (src/utils/dataIndex.ts):

**ID Index** (O(1) lookups):
```typescript
export const teamById = createIdIndex(team_data);
// teamById.get(1) → TeamMember | undefined
```

**Page Index** (Page-based filtering):
```typescript
export const feedbackByPage = createPageIndex(testi_data);
// feedbackByPage.get("home_1") → FeedbackItem[]
```

**Multi-field Index** (Complex queries):
```typescript
export const feedbackByDesignation = createMultiFieldIndex(testi_data, ['designation']);
```

### Data Relationship Management (Planned - Task 40)

**Relationship Types**:
```typescript
export interface DataRelationship {
    sourceCollection: string;    // e.g., "FeedbackData"
    targetCollection: string;    // e.g., "TeamData"
    sourceField: string;        // e.g., "authorId"
    targetField: string;        // e.g., "id"
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}
```

**Referential Integrity**:
- Validate foreign key references
- Cascade deletion/update strategies
- Prevent orphaned records

### Performance Considerations

**Current**:
- ~~Linear searches: O(n) for ID lookups~~ ✅ Resolved (Phase 2 complete)
- ~~No caching for repeated access~~ ✅ Resolved (Phase 2 complete)
- ~~Repeated array iteration for filtering~~ ✅ Resolved (Phase 2 complete)
- ✅ Runtime validation for data integrity (Phase 1 complete)
- ✅ Hash map lookups: O(1) for ID lookups (Phase 2 complete)
- ✅ Pre-built indexes at build time (Phase 2 complete)
- ✅ Cached access layer for repeated queries (Phase 2 complete)

### Data Integrity Best Practices

1. **Schema First**: Define TypeScript interfaces before creating data files
2. **Validation**: Compile-time (TypeScript) + Runtime (validation utilities)
3. **Unique IDs**: Manual assignment with careful review (auto-generation planned)
4. **Type Safety**: Use TypeScript type guards for dynamic data
5. **Consistent Patterns**: Follow BaseDataItem pattern where applicable
6. **Indexing**: Use indexes for frequently accessed items
7. **Caching**: Cache repeated data access for performance

### Future Data Architecture Enhancements (Task 40)

1. **✅ Runtime Validation Layer** (COMPLETE - Phase 1):
    - ✅ Build-time validation for all data files
    - ✅ Clear error messages for data integrity issues
    - ✅ Type guard functions for dynamic data
    - ✅ 21 validators implemented with 64 comprehensive tests
    - ✅ Factory pattern for configurable validators
    - ✅ Duplicate ID detection

2. **Data Indexing Layer**:
   - Pre-built indexes for ID-based lookups
   - Page indexes for page-filtered data
   - Multi-field indexes for complex queries

3. **Data Relationship Management**:
   - Define relationships between collections
   - Referential integrity checks
   - Cascade deletion/update strategies

4. **Data Standardization**:
   - Standardize date formats (ISO 8601)
   - Consistent base type usage
   - Auto-ID generation (optional)

5. **Performance Optimization**:
   - Cached access layer
   - Pre-built indexes at build time
   - O(1) lookups vs O(n) linear search

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
- ✅ Dynamic imports for non-critical components (Swiper, modals, pagination)
- ✅ Lazy loading of heavy libraries with loading states (VideoPopup, ReactPaginate)
- ✅ CDN-based CSS loading (Bootstrap, FontAwesome) with global edge delivery
- ✅ Lazy loading CSS on-demand (Toastify CSS loaded only when needed)
- ✅ Form validation utilities with shared schema factories (formValidation.ts)
- ✅ Form submission hook with consistent error handling (useFormSubmission)
- ✅ Service layer abstraction for external API calls (EmailService, AuthService)
- ✅ DRY principle applied to form validation and submission patterns

### Anti-Patterns (Fix)
- ❌ Business logic in presentation components (ContactForm) - FIXED
- ❌ Direct third-party library usage without abstraction - FIXED
- ❌ Duplicate code across components (resize handlers) - FIXED
- ❌ Hardcoded filter logic in multiple places - FIXED
- ❌ Missing service layer for external APIs - FIXED
- ❌ Validation logic duplication (20+ identical functions) - FIXED
- ❌ Missing error boundaries for component error handling - FIXED
- ❌ Inline authentication logic in LoginForm/SignUpForm - FIXED
- ❌ Form submission logic duplicated across 4 components - FIXED
- ❌ Email validation duplicated in AuthService - FIXED

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
- **Locations**: `src/services/email/EmailService.ts`, `src/services/auth/AuthService.ts`

#### 5. Authentication Service Pattern

- **Purpose**: Abstract authentication logic from presentation components
- **Implementation**: Interface-based service with mock implementation
- **API Methods**:
  - `login(credentials)`: Authenticate user with email and password
  - `register(userData)`: Register new user account
  - `logout()`: Clear current user session
  - `getCurrentUser()`: Get currently authenticated user
- **Current Implementation**: Mock authentication (ready for real backend integration)
- **Location**: `src/services/auth/AuthService.ts`
- **Forms Using Service**: LoginForm, SignUpForm

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
- **UI Libraries**: Bootstrap 5 (CDN), Swiper, Isotope
- **Forms**: React Hook Form, Yup validation
- **Email**: EmailJS (via service abstraction with resilience patterns)
- **Authentication**: AuthService (mock implementation with ready-to-use interfaces)
- **Animations**: WOW.js, React Toastify (lazy loaded CSS)
- **Data Filtering**: Custom utility functions with TypeScript generics
- **Error Handling**: React Error Boundary with custom fallback UI
- **CSS**: Bootstrap 5.3.2 (jsDelivr CDN), FontAwesome 6.7.2 (Cloudflare CDN)

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

## CSS Optimization Patterns

### Global CSS Loading (CDN)

**Purpose**: Reduce build size, leverage CDN edge delivery, enable browser caching

**Implementation**:
- Bootstrap loaded from CDN instead of local files
- FontAwesome loaded from CDN (Task 39)
- Reduces bundle size significantly

**Benefits**:
- Build size reduction: 68% CSS reduction (323K → 103K)
- CDN edge delivery: Faster load times from nearest edge location
- Browser caching: Shared across all sites using same CDN URL
- Reduced server bandwidth: CDN handles distribution

**Implementation Example** (src/styles/index.scss):
```scss
// Bootstrap from CDN
@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css");

// FontAwesome from CDN
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css");
```

**Trade-offs**:
- CDN dependency vs. self-hosted control
- Offline availability: CDN assets not available if network fails
- Versioning: Must manually update CDN URLs when upgrading

### On-Demand CSS Loading

**Purpose**: Load CSS only when needed to reduce initial page weight

**Implementation**:
- React Toastify CSS loaded dynamically via useEffect
- CSS injected into document.head when ToastContainer mounts
- Cleaned up on unmount

**Benefits**:
- Initial page load: Toastify CSS not loaded on first paint
- On-demand: CSS loaded only when toast notifications are needed
- Smaller initial bundle: Reduces critical CSS size

**Implementation Example** (src/layouts/Wrapper.tsx):
```typescript
import { useEffect } from "react";

const Wrapper = ({ children }: WrapperProps) => {
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.min.css";
        link.id = "toastify-css";
        document.head.appendChild(link);

        return () => {
            const existing = document.getElementById("toastify-css");
            if (existing) {
                document.head.removeChild(existing);
            }
        };
    }, []);

    return (
        <ErrorBoundary>
            {children}
            <ScrollToTop />
            <ToastContainer position="top-center" />
        </ErrorBoundary>
    );
};
```

**Usage Guidelines**:
- Use CDN loading for large, third-party CSS (Bootstrap, FontAwesome)
- Use on-demand loading for CSS only needed after user interaction (Toastify, modals)
- Keep critical CSS inline for above-the-fold content (future enhancement)
- Test both online and offline scenarios for CDN dependencies

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
- Authentication Service API (login, register, logout, getCurrentUser)
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
