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
| FeatureData.ts | FeatureItem | Yes | Yes | No | Feature cards (home_3) |
| ProcessData.ts | ProcessItem | Yes | Yes | No | Process steps |
| CauseData.ts | CauseItem | Yes | Yes | No | Cause cards |
| PriceData.ts | PriceItem | Yes | Yes | No | Pricing tables |
| BlogCommentData.ts | BlogCommentItem | No | Yes | No | Blog comments |
| SocialMediaData.ts | SocialLink | No | No | No | Social links |
| InnerFaqData.ts | InnerFaqItem | No | Yes | No | FAQ categories |
| DashboardData.ts | WiFiDevice, etc. | No | Yes | No | Dashboard widgets |
| ContactData.ts | ContactInfoItem | No | Yes | No | Contact information |
| BrandData.ts | StaticImageData[] | No | No | No | Client logos (home-one) |
| BrandDataDark.ts | StaticImageData[] | No | No | No | Client logos (home-one-dark) |
| BlogTagData.ts | string[] | No | No | No | Blog keyword tags |
| BlogCategoryData.ts | string[] | No | No | No | Blog categories |
| FeatureHomeOneData.ts | FeatureHomeOneItem | No | Yes | No | Feature cards (home-one) |

### Data Validation (✅ COMPLETED - Task 40 Phase 1) & Indexing (✅ COMPLETED - Task 40 Phase 2)

**Validation Utilities** (src/utils/dataValidation/):
- ✅ **Modular Architecture** - Validators split into focused modules (Task 49)
- ✅ `createValidator<T>()` - Factory pattern for creating validators (baseValidation.ts)
- ✅ `validateBaseDataItem()` - Validate BaseDataItem structure (baseValidation.ts)
- ✅ `checkDuplicateIds<T>()` - Check for duplicate IDs (baseValidation.ts)
- ✅ `validateDataArray<T>()` - Validate entire arrays (baseValidation.ts)

**Module Structure**:
- `baseValidation.ts` - Core types and factory functions
- `feedbackValidation.ts` - FeedbackItem validator
- `priceValidation.ts` - PriceItem, PriceDetailItem validators
- `faqValidation.ts` - FaqItem, FaqDetail, InnerFaqItem validators
- `featureValidation.ts` - FeatureItem, FeatureHomeOneItem validators
- `processValidation.ts` - ProcessItem validator
- `causeValidation.ts` - CauseItem validator
- `navigationValidation.ts` - MenuItem, NavigationItem, NavigationSection validators
- `dashboardValidation.ts` - WiFiDevice, WebsiteTemplate, AIStep validators
- `blogValidation.ts` - BlogCommentItem, InnerBlogPost validators
- `teamValidation.ts` - TeamMember validator
- `socialValidation.ts` - SocialLink validator
- `contactValidation.ts` - ContactInfoItem validator
- `index.ts` - Central export point (backward compatible with dataValidation.ts)
- ✅ `createValidator<T>()` - Factory pattern for creating validators
- ✅ `validateBaseDataItem()` - Validate BaseDataItem structure
- ✅ `validateRequiredFields<T>()` - Check required fields (via createValidator)
- ✅ `validateUniqueId<T>()` - Ensure unique IDs (via checkDuplicateIds)
- ✅ `validateEmail()` - Email format validation (via createValidator)
- ✅ `validateDate()` - Date format validation (via createValidator)
- ✅ `validateRange()` - Number range validation (via createValidator)
- ✅ `validateEnum<T>()` - Enum value validation (via createValidator)

**Implemented Validators** (23 total):
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
- ✅ `validateContactInfoItem` - Contact information with lines and links arrays (Task 63)
- ✅ `validateFeatureHomeOneItem` - Feature cards for home-one page (Task 63)
- ✅ `validateDataArray<T>()` - Validate entire arrays
- ✅ `checkDuplicateIds<T>()` - Check for duplicate IDs across items

**Testing**:
- ✅ 75 comprehensive tests for specific validators (100% passing)
- ✅ 39 comprehensive tests for baseValidation utilities (100% passing) (Task 89)
- ✅ All validators tested with valid and invalid inputs
- ✅ Base validation utilities tested directly:
  - `validateBaseDataItem()` - 11 tests
  - `createValidator<T>()` - 15 tests
  - `validateDataArray<T>()` - 5 tests
  - `checkDuplicateIds<T>()` - 7 tests
- ✅ Duplicate ID detection verified
- ✅ Custom rule validation tested
- ✅ Optional array item validation (lines, links arrays)
- ✅ Edge case coverage for all validation functions (empty, invalid, boundary, large values)
- ✅ Test behavior, not implementation principle followed

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

### Data Relationship Management (✅ COMPLETED - Phase 3)

**Relationship Types**:
```typescript
export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

export interface DataRelationship {
    sourceCollection: string;    // e.g., "FeedbackData"
    targetCollection: string;    // e.g., "TeamData"
    sourceField: string;        // e.g., "authorId"
    targetField: string;        // e.g., "id"
    type: RelationshipType;
    optional?: boolean;         // Allow null/undefined foreign keys
}
```

**Relationship Utilities** (`src/utils/dataRelationship.ts`):
- ✅ `validateRelationships()` - Validate all relationships across collections
- ✅ `checkReferentialIntegrity()` - Check foreign key validity
- ✅ `getRelatedItems()` - Get all related items for a source
- ✅ `getRelatedItem()` - Get single related item (one-to-one/one-to-many)
- ✅ `getOneToManyRelations()` - Get multiple related collections
- ✅ `checkCircularDependencies()` - Detect circular reference issues
- ✅ `getRelationshipGraph()` - Build relationship traversal graph
- ✅ `findRelationshipsByCollection()` - Find relationships by collection name
- ✅ `cascadeDelete()` - Identify items to delete on cascade
- ✅ `validateForeignKey()` - Single foreign key validation

**Referential Integrity**:
- Validate foreign key references at build time
- Cascade deletion/update strategies
- Prevent orphaned records
- Circular dependency detection

**Relationship Validation** (35 tests):
- ✅ Valid relationships with no errors
- ✅ Collection not found errors
- ✅ Referential integrity violations
- ✅ Optional foreign key handling
- ✅ String to number comparison
- ✅ Circular dependency detection
- ✅ Relationship graph building
- ✅ Cascade delete operations

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

3. **✅ Data Relationship Management** (COMPLETE - Phase 3):
    - ✅ Relationship type definitions (one-to-one, one-to-many, many-to-one, many-to-many)
    - ✅ Relationship validation utilities (validateRelationships, checkReferentialIntegrity)
    - ✅ Referential integrity checks with foreign key validation
    - ✅ Circular dependency detection
    - ✅ Cascade deletion support
    - ✅ Relationship graph traversal
    - ✅ 35 comprehensive tests covering all relationship utilities

 4. **✅ Data Standardization** (COMPLETE - Phase 4):
     - ✅ Standardize date formats (ISO 8601) - Date formatting utilities created
     - ✅ Consistent date display formatting - formatBlogDate, formatCommentDate utilities
     - ✅ Date validation - isValidISODate function for validation
     - ✅ Date parsing - toISODate function for conversion
     - Consistent base type usage
     - ✅ Auto-ID generation (COMPLETE - Task 77)

5. **Performance Optimization**:
   - Cached access layer
    - Pre-built indexes at build time
    - O(1) lookups vs O(n) linear search

## Validation Layer Architecture (✅ COMPLETED - Task 48)

### Problem Solved

Before Task 48, the application had **duplicated validation logic**:
- Email validation implemented twice (direct function + yup schema)
- Password validation implemented twice (direct function + yup schema)
- Inconsistent error messages between implementations
- Changes required updating multiple locations
- No single source of truth for validation rules

### Architecture Solution

```
Validation Rules (src/utils/validation/rules.ts)
    ↓
Yup Adapter (src/utils/validation/yupAdapter.ts)
    ↓
Form Validation (src/utils/formValidation.ts)
    ↓
Forms (ContactForm, LoginForm, SignUpForm, BlogForm)
```

```
Validation Rules (src/utils/validation/rules.ts)
    ↓
Direct Adapter (src/utils/validation/directAdapter.ts)
    ↓
Service Validation (src/utils/validation.ts)
    ↓
Services (AuthService)
```

### Layer Components

**1. Rules Layer** (`src/utils/validation/rules.ts`):
- Core validation rules independent of implementation
- EmailRule: Email format validation with regex
- PasswordRule: Minimum length validation (8 characters)
- RequiredRule: Non-empty string validation
- MinLengthRule, MaxLengthRule, PatternRule: Configurable rules
- **Single source of truth** for all validation rules

**2. Yup Adapter** (`src/utils/validation/yupAdapter.ts`):
- Generates yup schemas from core rules
- createEmailFieldSchema(), createPasswordFieldSchema(), createNameFieldSchema()
- createRequiredFieldSchema() with label support
- createEmailPasswordSchema(), createContactFormSchema(), createSignUpFormSchema(), createBlogFormSchema()
- Preserves label-based error messages for flexibility

**3. Direct Adapter** (`src/utils/validation/directAdapter.ts`):
- Generates ValidationResult from core rules
- validateEmail(), validatePassword(), validateRequired()
- Same error messages as yup adapter
- Used by services for direct validation

**4. Central Export** (`src/utils/validation/index.ts`):
- Exports all rules, adapters, and types
- Single import point for validation utilities

### Benefits

1. **Single Source of Truth**: Rules defined once, used everywhere
2. **Layer Separation**: Rules independent of implementation (yup, direct, zod, etc.)
3. **Consistency**: Same error messages across all implementations
4. **Maintainability**: Change rule in one place, all adapters update
5. **Extensibility**: Easy to add new adapters (zod, class-validator, io-ts)
6. **Type Safety**: All adapters properly typed with TypeScript

### Future Enhancement Opportunities

1. **Zod Adapter** - Add zod-based validation adapter
2. **Custom Rule Factory** - Create configurable rule generators
3. **Validation Pipeline** - Chain multiple validators with error aggregation
4. **Internationalization (i18n)** - Multi-language error messages

### Testing

- All 945 tests passing (100% success rate)
- Zero regressions in existing functionality
- Error messages verified consistent across all adapters

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
- ✅ Unified validation layer with rule-based architecture (src/utils/validation/)
- ✅ Layer separation: Validation rules independent of implementation (yup, direct adapters)
- ✅ Integration monitoring with real-time metrics collection (src/utils/metrics/)
- ✅ Service health checks with configurable success rate thresholds
- ✅ Metrics export for external monitoring systems (Prometheus, Datadog, CloudWatch)
- ✅ API standardization with common service types (src/services/common/)
- ✅ ServiceResult<T> interface for consistent response format
- ✅ Standardized error codes (ServiceErrorCode) with type safety
- ✅ Exception classes for typed error handling (ServiceException and subclasses)
- ✅ Unified error logging across all services (logServiceError, logServiceSuccess)
- ✅ Helper functions for result creation (createSuccessResult, createErrorResult)
- ✅ Centralized constants for magic numbers (src/constants/) - Eliminates magic numbers like rate limits and validation thresholds
- ✅ Webpack code splitting for large dependencies (forms, swiper cache groups)
- ✅ Lazy-loaded form components with loading states (ContactForm, LoginForm, SignUpForm, BlogForm)
- ✅ Bundle optimization with separate async chunks (19KB forms, 24KB swiper)
- ✅ Consolidated validation logic in AuthService (validateCredentials private method)
- ✅ DRY principle applied to authentication validation (66% code reduction)
- ✅ WebP image conversion for better compression (88% size reduction, 132KB savings per page)
- ✅ **Reusable component abstractions** (SectionTitle, AnimationWrapper, BackgroundSection) - Eliminates code duplication across 16+ section title components and 76+ animation patterns
- ✅ **Component refactoring complete** (Task 80) - All critical components now use reusable abstractions (Feature, Faq, Process, Price, IntroArea, ContactFormArea, AboutArea/Feature, AboutArea/AboutArea, PricingArea, Skill, Hero, Cta, ContactArea, LoginArea, SignUpArea, BlogArea, FooterTwo)
- ✅ **Build errors resolved** (Task 81) - SectionTitle supports all wow.js animations (fadeInLeft, fadeInRight), AnimationWrapper supports id and role props for accessibility
- ✅ **Reusable tab state management hook** (useTabs) - Eliminates duplicate tab state management code across 3+ components (PricingArea, Price, FaqArea) with consistent keyboard navigation
- ✅ **Reusable accordion state management hook** (useAccordion) - Eliminates duplicate accordion logic across 2 components (Faq, FaqArea) with flexible initialization and toggle functionality (Task 88)
- ✅ **Reusable pricing card component** (PricingCard) - Eliminates duplicate pricing item rendering logic across 2 components (PricingArea, Price) with consistent currency formatting and feature display (Task 85)
- ✅ **Code health verified** (Task 86) - Build passes (18 pages), lint passes (0 errors, 0 warnings), type check passes (0 errors), all tests passing (1831/1831, 100%), zero critical issues found
- ✅ **Resource hints for critical CDN resources** (preconnect, dns-prefetch) - Improves LCP by 50-150ms through early DNS resolution and TCP connection establishment (Task 87)
- ✅ **Lint warnings fixed** (Task 87) - Removed unused variables in test files, lint passes with 0 errors, 0 warnings
- ✅ **Date format standardization** (Task 40 Phase 4) - All dates stored in ISO 8601 format (YYYY-MM-DD) with formatting utilities for display (formatBlogDate, formatCommentDate, formatDate, isValidISODate, toISODate)

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
- ❌ Duplicated validation implementations (validation.ts vs formValidation.ts) - FIXED
- ❌ Magic numbers scattered throughout (rate limits, validation thresholds) - FIXED
- ❌ Duplicate validation logic in AuthService login/register methods - FIXED (Task 50)

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
  - `login(credentials)`: Authenticate user with email and password (rate limited)
  - `register(userData)`: Register new user account (rate limited)
  - `logout()`: Clear current user session
  - `getCurrentUser()`: Get currently authenticated user
  - `getLoginRateLimitStatus(email)`: Check rate limit status for login
  - `getRegisterRateLimitStatus(email)`: Check rate limit status for register
  - `resetLoginRateLimit(email)`: Reset rate limit for login (admin)
  - `resetRegisterRateLimit(email)`: Reset rate limit for register (admin)
- **Current Implementation**: Mock authentication (ready for real backend integration)
 - **Resilience Patterns** (✅ COMPLETED - Integration Hardening):
   - **Timeout Protection**: 5,000ms timeout for login/register operations
   - **Retry with Exponential Backoff**: 3 attempts (1 initial + 2 retries)
   - **Circuit Breaker**: 50 failure threshold, 60-second reset timeout
   - **High Threshold**: 50 failures prevents circuit from interfering with per-user rate limiting
- **Code Quality** (✅ COMPLETED - Task 50):
   - **Consolidated Validation**: `validateCredentials()` private method centralizes validation logic
   - **DRY Principle**: Single validation method eliminates duplicate code in login/register
   - **Code Reduction**: 71 lines → 24 lines (66% reduction)
   - **Maintainability**: Single point of change for validation rules
- **Rate Limiting**:
   - **Login**: 5 attempts per 15 minutes, 30 minute cooldown
   - **Register**: 5 attempts per 1 hour, 2 hour cooldown
   - **Per-email tracking**: Prevent brute force attacks
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
  - **Login Limiter** (AuthService): 5 attempts per 15 minutes, 30 minute cooldown
  - **Register Limiter** (AuthService): 5 attempts per 1 hour, 2 hour cooldown
- **Features**:
  - Per-identifier tracking (email, IP, user ID)
  - Automatic reset after window expires
  - Cooldown period after limit exceeded
  - Cleanup of expired records
  - Independent tracking for different operations (login vs register)
- **Error Handling**: Clear error messages with remaining time
- **Location**: `src/utils/rateLimiter.ts`
- **Services Using**: EmailService, AuthService

#### 5. Service Abstraction

- **Purpose**: Decouple business logic from external API implementations
- **Implementation**: Interface-based service layer with dependency injection
- **Benefits**:
  - Easy to mock for testing
  - Simple to swap implementations (e.g., EmailJS → SendGrid)
  - Centralized error handling and logging
- **Location**: `src/services/email/EmailService.ts`

#### 6. API Standardization

- **Purpose**: Ensure consistent response formats and error handling across all services
- **Implementation**: Common service types in `src/services/common/`
- **Components**:
  - `ServiceResult<T>` - Unified response interface for all services
  - `ServiceErrorCode` - Standardized error code constants (VALIDATION_ERROR, RATE_LIMIT_EXCEEDED, TIMEOUT, CIRCUIT_BREAKER_OPEN, CREDENTIALS_MISSING, NETWORK_ERROR, UNKNOWN_ERROR)
  - Exception Classes - Type-safe error handling (ServiceException, ServiceTimeoutError, ServiceRateLimitError, ServiceValidationError, ServiceCircuitBreakerError, ServiceCredentialsError, ServiceNetworkError)
  - Helper Functions - createSuccessResult, createErrorResult, mapToServiceResult
  - Logging Utilities - logServiceError, logServiceSuccess, logServiceWarning
- **Benefits**:
  - **Contract First**: ServiceResult defines contract before implementation
  - **Consistency**: All services return same format (success, message, error, errorCode, metadata)
  - **Type Safety**: Error codes are typed as ServiceErrorCodeType, not strings
  - **Error Classification**: Each error has isRetryable and isTimeout flags
  - **Code Reuse**: Helper functions reduce boilerplate
  - **Self-Documenting**: Type names and error codes describe behavior
  - **Future-Proof**: Easy to add new services following same patterns
- **Location**: `src/services/common/` (types.ts, ServiceException.ts, logger.ts, resultHelpers.ts, index.ts)

#### Error Handling

- **ResilienceError**: Custom error type with `isTimeout` and `isRetryable` flags
- **Logging**: Non-sensitive error messages only (no secrets or stack traces)
- **User Experience**: Graceful degradation with informative error messages
- **Rate Limiting**: Clear messages with countdown timers

#### Monitoring

- **Circuit Breaker State**: Accessible via `getCircuitBreakerState()`
- **Manual Reset**: Available via `resetCircuitBreaker()` (use with caution)
- **Rate Limit Status**: Accessible via `getStatus(identifier)`
- **Metrics**: Integrated monitoring with `src/utils/metrics/metricsCollector.ts`:
  - Real-time call tracking (success/failure/timeout/rate limit)
  - Response time monitoring (average of last 100 calls)
  - Circuit breaker state tracking
  - Health checks with configurable success rate thresholds
  - Metrics export for external monitoring systems
  - Service metrics available via `service.getMetrics()` method

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
- **Monitoring**: Integration metrics collector with health checks
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

### Resource Hints for Critical Resources (✅ COMPLETED - Task 87)

**Purpose**: Establish early connections to critical CDN resources to reduce LCP (Largest Contentful Paint)

**Implementation**:
- Added `preconnect` hints for critical CDN domains (jsdelivr, cloudflare, emailjs, fonts.googleapis.com)
- Added `dns-prefetch` hints for DNS lookups before resource requests
- Preconnect establishes TCP handshake and TLS negotiation in advance
- DNS-prefetch resolves domain names before resources are requested

**Implementation Example** (src/app/layout.tsx):
```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" />
<link rel="preconnect" href="https://cdnjs.cloudflare.com" />
<link rel="preconnect" href="https://cdn.emailjs.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
<link rel="dns-prefetch" href="https://cdn.emailjs.com" />
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
```

**Benefits**:
- DNS Resolution: Completed before critical resource requests
- TCP Handshake: Established early, no waiting during resource load
- TLS Negotiation: Started in advance, faster secure connections
- LCP Improvement: Estimated 50-150ms reduction in initial page load time
- Better User Experience: Critical resources load faster

**CDN Resources Optimized**:
- **Bootstrap 5.3.2**: cdn.jsdelivr.net (228KB CSS)
- **FontAwesome 6.7.2**: cdnjs.cloudflare.com (icons)
- **Toastify 9.1.3**: cdn.jsdelivr.net (30KB CSS, lazy loaded)
- **EmailJS**: cdn.emailjs.com (email service)
- **Google Fonts**: fonts.googleapis.com (Spline Sans font)

**Usage Guidelines**:
- Use `preconnect` for critical third-party domains loaded on page load
- Use `dns-prefetch` for domains that may be needed later in the navigation
- Resource hints are ignored by browsers that don't support them (graceful degradation)
- Limit preconnect to 4-6 domains to avoid excessive connection overhead
- Combine with cache headers for maximum performance benefit

**Trade-offs**:
- Connection overhead: Preconnecting to too many domains wastes resources
- Browser limits: Some browsers limit the number of simultaneous preconnects
- Fallback: Unsupported browsers ignore hints (no harm done)

**Performance Impact**:
- LCP: Estimated 50-150ms improvement for first-time visitors
- DNS Lookups: Completed before resource requests
- TCP Handshakes: Established early during page parse
- TLS Negotiation: Started in advance, faster secure connections
- User Experience: Faster perceived page load time

## Bundle Optimization Patterns

### Webpack Code Splitting

**Purpose**: Separate large dependencies into async chunks loaded only when needed

**Implementation**:
- Webpack splitChunks configuration with multiple cache groups
- Higher priority cache groups for specific libraries (forms, swiper, toastify, paginate, modalVideo, emailjs)
- Async chunks (loaded only when needed)
- reuseExistingChunk: true to prevent duplication

**Benefits**:
- Vendor bundle reduced from 226KB to 216KB (4.4% reduction, Task 83)
- Forms chunk (60KB) loaded only on pages with forms
- Swiper chunk (79KB) loaded only on pages with carousels
- Toastify chunk (31KB) loaded only on pages with notifications
- 10KB savings on most pages (3.8-4.4% reduction, Task 83)
- Better cache hit ratio (smaller shared chunk)

**Implementation Example** (next.config.ts):
```javascript
cacheGroups: {
  vendor: {
    test: /[\\/]node_modules[\\/]/,
    name: 'vendors',
    chunks: 'all',
    priority: 1,
  },
  forms: {
    test: /[\\/]node_modules[\\/](react-hook-form|yup|@hookform)[\\/]/,
    name: 'forms',
    chunks: 'async',
    priority: 10,
    reuseExistingChunk: true,
  },
  swiper: {
    test: /[\\/]node_modules[\\/]swiper[\\/]/,
    name: 'swiper',
    chunks: 'async',
    priority: 10,
    reuseExistingChunk: true,
  },
  toastify: {
    test: /[\\/]node_modules[\\/]react-toastify[\\/]/,
    name: 'toastify',
    chunks: 'async',
    priority: 10,
    reuseExistingChunk: true,
  },
  paginate: {
    test: /[\\/]node_modules[\\/]react-paginate[\\/]/,
    name: 'paginate',
    chunks: 'async',
    priority: 10,
    reuseExistingChunk: true,
  },
  modalVideo: {
    test: /[\\/]node_modules[\\/]react-modal-video[\\/]/,
    name: 'modal-video',
    chunks: 'async',
    priority: 10,
    reuseExistingChunk: true,
  },
  emailjs: {
    test: /[\\/]node_modules[\\/](@emailjs|emailjs-com)[\\/]/,
    name: 'emailjs',
    chunks: 'async',
    priority: 10,
    reuseExistingChunk: true,
  },
}
```

**Task 83 Optimization** (Jan 2026):
- Added 4 new cache groups (toastify, paginate, modalVideo, emailjs)
- Vendor bundle: 226KB → 216KB = 10KB reduction (4.4%)
- First Load JS: 229KB → 219KB = 10KB reduction (4.4%)
- Home page: 239KB → 230KB = 9KB reduction (3.8%)
- All 1795 tests passing, lint passed
- Better user experience with faster page loads

**Page-Level Improvements**:
- **Non-Form Pages** (10 pages): 283KB → 239KB = -44KB (-15.5%, Task 73)
- **Task 83 Additional Improvements**: 229KB → 219KB = -10KB (-4.4%)
- **Form Pages** (3 pages): 285KB → 260KB = -25KB (-8.8%)
- **Total Savings**: 440KB (non-form) + 75KB (form) = 515KB

**Lazy-Loaded Form Components**

**Purpose**: Load form components only when needed to reduce initial bundle size

**Implementation**:
- Dynamic imports for ContactForm, LoginForm, SignUpForm, BlogForm
- Loading states with Indonesian messages
- Parent components use `next/dynamic`

**Benefits**:
- Form libraries (react-hook-form + yup) loaded only on 4 pages
- Forms chunk: 19KB (vs. 185KB in vendor)
- Graceful loading UX with spinner messages

**Implementation Example**:
```typescript
import dynamic from "next/dynamic"
const ContactForm = dynamic(() => import("../forms/ContactForm"), {
   loading: () => <div className="text-center py-5">Memuat formulir kontak...</div>
})
```

**Trade-offs**:
- Slight delay on form page load (chunk fetch)
- Better UX on non-form pages (44KB less JS)
- Additional HTTP requests for lazy-loaded chunks

**Usage Guidelines**:
- Use splitChunks for libraries >50KB that are used on <50% of pages
- Set higher priority (10) to split from default vendor group (priority: 1)
- Use async chunks for lazy-loaded libraries
- Keep vendor group for core libraries (React, Next.js, Bootstrap)
- Verify with bundle analyzer before/after to measure impact

**Future Enhancements**:
- Tree shaking for yup (only load used exports: string, object, shape)
- Lazy load EmailJS (11KB) only on /contact page
- Next.js 16 upgrade (includes improved code splitting)

---

## Asset Optimization Patterns

### Unused Asset Removal

**Purpose**: Remove unused large assets to reduce storage, bandwidth, and CDN costs

**Implementation**:
- Profile all images to identify large files (>50KB)
- Verify image usage by searching codebase for references
- Remove unused images after confirming no active references
- Verify build and tests pass after removal

**Benefits**:
- Reduced storage: 200K saved in Task 62
- Lower CDN bandwidth: Fewer assets to transfer
- Faster page load: Fewer assets to request
- Clean codebase: No orphaned assets

**Implementation Example** (Task 62):
```bash
# Identify images >50KB
find public/assets/images -type f -size +50k -exec ls -lh {} \;

# Verify unused by searching codebase
grep -r "feature-new.jpg" src/ --include="*.tsx" --include="*.ts"

# Remove unused images
rm public/assets/images/gallery/feature-new.jpg
rm public/assets/images/bg/text-bg-1.jpg
rm public/assets/images/video/video-new.jpg
```

**Images Removed in Task 62** (200K savings):
- `public/assets/images/gallery/feature-new.jpg` (52K) - Not used
- `public/assets/images/bg/text-bg-1.jpg` (52K) - Not used
- `public/assets/images/video/video-new.jpg` (61K) - Not used

**Usage Guidelines**:
- Profile first to identify large assets (>50KB threshold)
- Verify unused by searching entire codebase for references
- Remove only after confirming no active usage
- Run tests and build to verify no broken references
- Document removal in task.md for traceability

### WebP Image Conversion (✅ COMPLETED - Task 73)

**Purpose**: Convert JPEG/PNG images to WebP format for better compression and faster page loads

**Implementation**:
- Identify large images (>30KB) suitable for WebP conversion
- Use sharp library to convert images to WebP format (quality 85)
- Test multiple quality settings to find optimal balance
- Update component references to use WebP versions
- Keep original files as fallback for browser compatibility

**Benefits**:
- Reduced file size: 80-90% size reduction (87-93% achieved)
- Faster page loads: 132KB less data per page load
- Lower CDN bandwidth: Reduced image transfer costs
- Better mobile performance: Smaller payloads benefit mobile users
- Modern format: WebP supported by 95%+ of browsers

**Implementation Example** (Task 73):
```bash
# Convert images using sharp library
node -e "
const sharp = require('sharp');
await sharp('public/assets/images/bg/pattern-bg.jpg').webp({ quality: 85 }).toFile('public/assets/images/bg/pattern-bg.webp');
await sharp('public/assets/images/bg/testimonial-bg.jpg').webp({ quality: 85 }).toFile('public/assets/images/bg/testimonial-bg.webp');
"

# Update component references
// src/layouts/footers/FooterTwo.tsx
// Before: backgroundImage: \`url(/assets/images/bg/pattern-bg.jpg)\`
// After:  backgroundImage: \`url(/assets/images/bg/pattern-bg.webp)\`
```

**Results** (Task 73):
- `pattern-bg.jpg` (113KB) → `pattern-bg.webp` (14KB) = **99KB saved (87.6% reduction)**
- `testimonial-bg.jpg` (55KB) → `testimonial-bg.webp` (3.9KB) = **51KB saved (92.8% reduction)**
- `hero-bg-1.png` (124KB) → Kept as PNG (WebP version larger)
- `faq-bg.jpg` (28.2KB) → `faq-bg.webp` (2.5KB) = **25.7KB saved (91.3% reduction)** (Task 76)
- `base.png` (35.5KB) → Kept as PNG (WebP version larger) (Task 76)

**Cumulative Total Savings: 175.7KB across 4 optimized images (Task 73 + Task 76)**

**Pages Improved**:
- **Home page** (`/`, `/home-one`, `/home-one-dark`): 51KB saved
- **All 18 pages** with FooterTwo component: 99KB saved
- **FAQ page** (`/faq`): 25.7KB saved (Task 76)

**Usage Guidelines**:
- Test multiple quality settings (50-85) to find optimal balance
- Compare WebP size vs original - keep original if WebP is larger
- Use WebP for JPEG images (typically better compression)
- Test PNG images individually (some compress better, some worse)
- Keep original files as fallback for browser compatibility
- Update component references to use WebP versions
- Verify build and tests pass after conversion

**Quality Settings**:
- Recommended: Quality 85 for optimal balance
- Lower quality (50-70): More compression, potential quality loss
- Higher quality (90+): Less compression, minimal quality benefit
- Test with visual inspection to ensure acceptable quality

**Browser Support**:
- WebP supported by 95%+ of browsers (Chrome, Firefox, Safari, Edge)
- Fallback to original format for unsupported browsers (5% market share)
- Modern browsers automatically request WebP if available

**Future Enhancements**:
- Next.js Image component migration for automatic WebP/AVIF generation
- Responsive image loading with srcset for different screen sizes
- Automatic WebP conversion pipeline during build
- Remove original files after verifying WebP support (optional)

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
- Integration Monitoring & Metrics API
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

### Security Assessment (✅ Completed - Task 82)

Comprehensive security audit completed with **zero critical issues**:
- **Zero CVE vulnerabilities** (npm audit: 0/0)
- **No hardcoded secrets** in code
- **No deprecated packages** detected
- **No unused dependencies** found
- **All security headers properly configured**
- **Rate limiting implemented** for all authentication forms
- **Input validation** for all user inputs
- **No dangerous patterns** (innerHTML, eval, Function constructor all absent)
- **Secrets properly managed** (.env* excluded, .env.example has only placeholders)
- **All 1795 tests passing** (100% success rate)

**Rate Limiting Configuration**:
- **Login**: 5 attempts per 15 minutes, 30 minute cooldown
- **Register**: 5 attempts per 1 hour, 2 hour cooldown
- **Email**: 5 attempts per 60 seconds, 5 minute cooldown
- **Form**: 10 attempts per 1 hour, 2 hour cooldown

**Input Validation**:
- **Password**: Minimum 8 characters required
- **Email**: Format validation via regex
- **Required fields**: Non-empty validation
- **Rating**: Range validation (0-5)

**Security Grade**: A+ (Zero critical issues, comprehensive protection)

**Verification**: Security posture verified quarterly - all measures remain effective:
- **Task 66** (Initial security assessment)
- **Task 70** (Verification)
- **Task 72** (Periodic verification Q1 2026)
- **Task 76** (Quarterly verification Q1 2026)
- **Task 77** (Data architecture security)
- **Task 82** (Comprehensive verification Jan 2026)
- **Task 86** (Quarterly verification Jan 12, 2026)

**Full Documentation**: See `docs/task.md` - Task 86: Security Assessment for complete details
**Assessment Frequency**: Quarterly (every 3 months)
**Next Assessment**: Q2 2026 (April 2026)
