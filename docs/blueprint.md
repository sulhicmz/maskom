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

| Data File | Base Type | Has Page | Has ID | Auto-ID | Pre-filtered | Purpose |
|-----------|-----------|----------|--------|---------|--------------|---------|
| TeamData.ts | TeamMember | No | Yes | No | No | Team members |
| InnerBlogData.ts | InnerBlogPost | No | Yes | No | No | Blog posts |
| FeedbackData.ts | FeedbackItem | Yes | Yes | Yes | Yes | Testimonials |
| MenuData.ts | MenuItem | No | Yes | No | No | Navigation menu |
| FaqData.ts | FaqItem | Yes | Yes | Yes | No | FAQ items |
| FeatureData.ts | FeatureItem | Yes | Yes | Yes | No | Feature cards (home_3) |
| ProcessData.ts | ProcessItem | Yes | Yes | Yes | No | Process steps |
| CauseData.ts | CauseItem | Yes | Yes | Yes | No | Cause cards |
| PriceData.ts | PriceItem | Yes | Yes | Yes | No | Pricing tables |
| BlogCommentData.ts | BlogCommentItem | No | Yes | No | No | Blog comments |
| SocialMediaData.ts | SocialLink | No | No | No | No | Social links |
| InnerFaqData.ts | InnerFaqItem | No | Yes | No | No | FAQ categories |
| DashboardData.ts | WiFiDevice, etc. | No | Yes | No | No | Dashboard widgets |
| ContactData.ts | ContactInfoItem | No | Yes | No | No | Contact information |
| BrandData.ts | StaticImageData[] | No | No | N/A | No | Client logos (home-one) |
| BrandDataDark.ts | StaticImageData[] | No | No | N/A | No | Client logos (home-one-dark) |
| BlogTagData.ts | BlogTagItem | No | Yes | No | Yes | Blog keyword tags with relationships |
| BlogCategoryData.ts | string[] | No | No | N/A | No | Blog categories |
| FeatureHomeOneData.ts | FeatureHomeOneItem | No | Yes | No | No | Feature cards (home-one) |

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
 
**Implemented Validators** (25 total):
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
 - ✅ `validateBlogTagItem` - Blog tag items with id and name (Task 101)
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
 - ✅ `validateBlogCategoryData` - Blog category string array validation (Task 158)
 - ✅ `validateDataArray<T>()` - Validate entire arrays
 - ✅ `checkDuplicateIds<T>()` - Check for duplicate IDs across items
 
**Testing**:
 - ✅ 107 comprehensive tests for specific validators (100% passing)
 - ✅ 39 comprehensive tests for baseValidation utilities (100% passing) (Task 89)
 - ✅ 7 tests for validateBlogTagItem (100% passing) (Task 102)
 - ✅ 32 tests for validateBlogCategoryData (100% passing) (Task 158)
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

**Relationship Registry** (`src/data/relationships.ts`):
- ✅ Central relationship configuration file
- ✅ BlogCommentData → InnerBlogData (many-to-one via blogId foreign key)
- ✅ InnerBlogData → BlogTagData (many-to-one via tagId foreign key)
- ✅ Type-safe relationship definitions with DataRelationship interface
- ✅ Supports validation of all relationships at build time

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

**Blog Tag Relationship** (Task 101):
- ✅ Refactored BlogTagData from string[] to BlogTagItem[] with id field
- ✅ Updated InnerBlogPost type to use tagId foreign key
- ✅ Created validateBlogTagItem validator
- ✅ Added InnerBlogData → BlogTagData relationship to relationships.ts
- ✅ Updated Tags component to render tag.name from BlogTagItem objects
- ✅ Exported tagsByName and tagsById maps for O(1) lookups
- ✅ All 2055 tests passing (100% success rate)

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
     - ✅ Central relationship registry (src/data/relationships.ts)
     - ✅ BlogCommentData → InnerBlogData relationship (many-to-one)
     - ✅ blogId foreign key added to BlogCommentItem type
     - ✅ 35 comprehensive tests covering all relationship utilities

  4. **✅ Data Standardization** (COMPLETE - Phase 4):
        - ✅ Standardize date formats (ISO 8601) - Date formatting utilities created
       - ✅ Consistent date display formatting - formatBlogDate, formatCommentDate utilities
        - ✅ Date validation - isValidISODate function for validation
        - ✅ Date parsing - toISODate function for conversion
         - Consistent base type usage
         - ✅ Auto-ID generation (COMPLETE - Task 77)
         - ✅ Applied to PriceData.ts (COMPLETE - Task 175)
         - ✅ Applied to FeedbackData.ts (COMPLETE - Task 183)
         - ✅ Applied to FeatureData.ts (COMPLETE - Task 183)
         - ✅ Applied to FaqData.ts (COMPLETE - Task 228)
         - ✅ Applied to ProcessData.ts (COMPLETE - Task 228)
         - ✅ Applied to CauseData.ts (COMPLETE - Task 228)

 5. **✅ Page Registry & Validation** (COMPLETE - Data Architecture Enhancement):
     - ✅ Centralized page registry (VALID_PAGES in src/data/relationships.ts)
     - ✅ Type-safe page values (ValidPage type derived from VALID_PAGES)
     - ✅ Page validation utilities (src/utils/pageValidation.ts)
     - ✅ validatePageField() - Single item page field validation
     - ✅ validatePageFields() - Batch page field validation with error reporting
     - ✅ getPageStats() - Page statistics and item counts
     - ✅ filterByPage() - Safe page filtering with validation
     - ✅ Early error detection - Page typos caught at build time
     - ✅ Type-safe imports - ValidPage type ensures only valid pages used
     - ✅ 15 comprehensive tests for page validation utilities

  6. **Performance Optimization**:
    - Cached access layer
     - Pre-built indexes at build time
     - O(1) lookups vs O(n) linear search

  7. **✅ Build-Time Validation Integration** (COMPLETE - Task 161):
     - ✅ Integrated npm test into build process (package.json)
     - ✅ All data validators run automatically before deployment
     - ✅ Build fails if data validation errors detected
     - ✅ Prevents invalid data from reaching production
      - ✅ 2634 tests passing (including 224 validation tests)
     - ✅ Single command to validate entire data model (npm test)

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
Service Validation (src/utils/validation/index.ts)
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
- **Unified export structure** - removed redundant `validation.ts` file (Task 104)
- All validation utilities accessible via `@/utils/validation` import path

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

## RBAC Architecture (✅ COMPLETED - Task 223)

### Purpose

Implement Role-Based Access Control (RBAC) system to enable fine-grained authorization, secure admin routes, and provide principle of least privilege for sensitive features.

### Architecture Components

**Role Types** (src/types/role.ts):
```typescript
export type UserRole = 'admin' | 'editor' | 'user'

export interface RoleConfig {
  id: UserRole
  name: string
  description: string
  level: number
}
```

**Permission Types** (src/types/permission.ts):
```typescript
export enum Permission {
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_CONTENT = 'manage_content',
  PUBLISH_CONTENT = 'publish_content',
  EDIT_CONTENT = 'edit_content',
  DELETE_CONTENT = 'delete_content',
  VIEW_ADMIN_DASHBOARD = 'view_admin_dashboard',
  MANAGE_SETTINGS = 'manage_settings'
}
```

**Role-Permission Mapping** (src/data/rolesData.ts):
- Admin: All 9 permissions (full system access)
- Editor: Content management permissions (4 permissions)
- User: Basic permissions (1 permission)

**RBAC Utilities** (src/utils/rbac.ts):
```typescript
export function canAccessRoute(userRole: UserRole, route: string): boolean
export function canPerformAction(userRole: UserRole, action: Permission): boolean
export function requireRole(requiredRole: UserRole): (userRole: UserRole) => boolean
export function requirePermission(requiredPermission: Permission): (userRole: UserRole) => boolean
```

**ProtectedRoute Component** (src/components/common/ProtectedRoute.tsx):
- Route-level protection with role/permission checks
- Automatic redirect to login or dashboard on unauthorized access
- Loading states during authentication checks
- Support for multiple required permissions

### Implementation

#### Role System
- **UserRole type**: 'admin' | 'editor' | 'user' with hierarchical levels (admin: 3, editor: 2, user: 1)
- **RoleConfig interface**: Type-safe role configuration with name, description, and level
- **Validation utilities**: isValidRole() for type narrowing

#### Permission System
- **Permission enum**: 9 granular permissions across 4 categories (analytics, users, content, admin)
- **PermissionConfig interface**: Type-safe permission configuration with name, description, and category
- **Validation utilities**: isValidPermission() for type narrowing

#### Role-Permission Mapping
- **getPermissionsByRole()**: Get all permissions for a role
- **hasPermission()**: Check if role has specific permission
- **hasAnyPermission()**: Check if role has any of multiple permissions
- **hasAllPermissions()**: Check if role has all of multiple permissions
- **canRoleAccessRoute()**: Route-based permission checks

#### RBAC Utilities
- **canAccessRoute()**: Check if user can access specific route
- **canPerformAction()**: Check if user can perform specific action
- **canPerformAnyAction()**: Check if user can perform any of multiple actions
- **canPerformAllActions()**: Check if user can perform all of multiple actions
- **requireRole()**: Higher-order function for role requirements
- **requirePermission()**: Higher-order function for permission requirements
- **requireAnyPermission()**: Higher-order function for multiple permission requirements (any match)
- **requireAllPermissions()**: Higher-order function for multiple permission requirements (all match)
- **getUnauthorizedRedirectPath()**: Get appropriate redirect path based on user role

#### AuthService Integration
- **User interface**: Added role field to User interface
- **RegisterData interface**: Added optional role field for registration
- **IAuthService interface**: Added getCurrentUserRole(), hasPermission(), hasRole() methods
- **Role assignment**: Default role 'user' on registration, configurable via RegisterData.role
- **Permission checks**: Integrated with rolesData.ts for role-permission validation

#### ProtectedRoute Component
- **Props**: children, requiredRole, requiredPermission, requiredPermissions, fallback
- **Authentication check**: Redirects to /login if not authenticated
- **Role check**: Redirects to /dashboard if role doesn't match requiredRole
- **Permission check**: Redirects to /dashboard if missing requiredPermission(s)
- **Route-based check**: Uses canAccessRoute() if no role/permission specified
- **Loading state**: Shows spinner during authentication verification
- **Client-side protection**: Uses 'use client' directive for Next.js App Router

### Route Protection

**Admin Analytics Route** (src/app/admin/analytics/page.tsx):
```typescript
<ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
  <AnalyticsDashboard />
</ProtectedRoute>
```

### Permission Categories

**Analytics** (1 permission):
- VIEW_ANALYTICS: Access analytics dashboard and reports

**Users** (2 permissions):
- MANAGE_USERS: Create, edit, and delete users
- MANAGE_ROLES: Assign and modify user roles

**Content** (4 permissions):
- MANAGE_CONTENT: Full access to all content management
- PUBLISH_CONTENT: Publish and schedule content
- EDIT_CONTENT: Edit existing content
- DELETE_CONTENT: Delete content

**Admin** (2 permissions):
- VIEW_ADMIN_DASHBOARD: Access admin dashboard
- MANAGE_SETTINGS: Modify system settings

### Architecture Benefits

1. **Security**: Principle of least privilege for sensitive features
2. **Scalability**: Easy to add new roles and permissions
3. **Maintainability**: Centralized RBAC logic
4. **Type Safety**: TypeScript enums for roles and permissions
5. **Audit Trail**: Clear role-based access logging (ready for future enhancement)
6. **User Experience**: Different UI based on user role
7. **Route Protection**: Declarative route-level authorization
8. **Composability**: Higher-order functions for flexible permission checks
9. **Separation of Concerns**: Authorization logic separated from business logic
10. **DRY Principle**: Single source of truth for role-permission mapping

### Testing

- ✅ **15 tests** for role types (UserRole, ROLE_CONFIGS, getRoleConfig, isValidRole)
- ✅ **20 tests** for permission types (Permission enum, PERMISSION_CONFIGS, getPermissionConfig, isValidPermission)
- ✅ **42 tests** for role-permission mapping (getPermissionsByRole, hasPermission, hasAnyPermission, hasAllPermissions, canRoleAccessRoute)
- ✅ **42 tests** for RBAC utilities (canAccessRoute, canPerformAction, requireRole, requirePermission, getUnauthorizedRedirectPath)
- **Total**: 119+ comprehensive tests for RBAC system

### Usage Examples

**Check route access**:
```typescript
import { canAccessRoute } from '@/utils/rbac'

if (canAccessRoute('admin', '/admin/analytics')) {
  // Show admin link
}
```

**Check permission**:
```typescript
import authService from '@/services/auth/AuthService'

const canEdit = await authService.hasPermission('edit_content')
```

**Protect route**:
```typescript
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Permission } from '@/types/permission'

<ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
  <AdminDashboard />
</ProtectedRoute>
```

**Require multiple permissions**:
```typescript
<ProtectedRoute requiredPermissions={[Permission.MANAGE_CONTENT, Permission.PUBLISH_CONTENT]}>
  <ContentEditor />
</ProtectedRoute>
```

### Code Changes

- Added: `src/types/role.ts` - Role types and utilities (42 lines)
- Added: `src/types/permission.ts` - Permission enum and utilities (71 lines)
- Added: `src/data/rolesData.ts` - Role-permission mapping (77 lines)
- Modified: `src/services/auth/types.ts` - Updated User and RegisterData interfaces with role field
- Modified: `src/services/auth/AuthService.ts` - Added role assignment and RBAC methods
- Added: `src/utils/rbac.ts` - RBAC utilities (96 lines)
- Added: `src/components/common/ProtectedRoute.tsx` - Route protection component (84 lines)
- Modified: `src/app/admin/analytics/page.tsx` - Added ProtectedRoute wrapper
- Added: `src/types/__tests__/role.test.ts` - 15 tests
- Added: `src/types/__tests__/permission.test.ts` - 20 tests
- Added: `src/data/__tests__/rolesData.test.ts` - 42 tests
- Added: `src/utils/__tests__/rbac.test.ts` - 42 tests
- Total: 12 files added/modified, ~500 lines added/modified

### Success Criteria

- [x] Role types defined (admin, editor, user) with hierarchy
- [x] Permission enum defined with 9 granular permissions
- [x] Role-permission mapping created (admin: 9, editor: 4, user: 1)
- [x] RBAC utilities implemented (canAccessRoute, canPerformAction, requireRole)
- [x] ProtectedRoute component created for route-level protection
- [x] Admin routes updated with role-based protection
- [x] AuthService integrated with role system (getCurrentUserRole, hasPermission, hasRole)
- [x] Comprehensive tests for RBAC (119+ tests)
- [x] All tests passing (zero regressions)
- [x] Lint passes (0 errors, 0 warnings)
- [x] Type check passes (0 errors)

### Related Tasks
- Task 222 (Analytics Dashboard) - Now protected with VIEW_ANALYTICS permission
- Task 208 (Blog Post Scheduling) - Editor can PUBLISH_CONTENT, User can EDIT_CONTENT

### Future Enhancements

1. **Admin Interface** - Role management UI for assigning roles to users
2. **Audit Logging** - Log role-based access attempts and permission checks
3. **Permission Scopes** - Add resource-level permissions (e.g., edit own content vs all content)
4. **Dynamic Roles** - Create custom roles with flexible permission sets
5. **UI Component Protection** - RoleBasedComponent for UI element-level protection

## Architectural Patterns

### Good Patterns (Maintain)
- ✅ Data-driven content management
- ✅ Component modularity with clear separation
- ✅ TypeScript interfaces for data structures
- ✅ Environment variables for sensitive data
- ✅ Clean file organization by category
 - ✅ Centralized filter utilities for type-safe data operations
 - ✅ Device filtering utilities for dashboard components (deviceFilters.ts) - Extracted filtering logic from WiFiMonitor component, type-safe status filtering (Online, Offline, Both), comprehensive device statistics (counts, percentages), 27 comprehensive tests (Task 224)
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
- ✅ Real-time form validation with debouncing (FormField component, useDebouncedCallback hook)
- ✅ ARIA live regions for accessibility (aria-live="polite" on error messages)
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
- ✅ Centralized constants for magic numbers (src/constants/) - Eliminates magic numbers like rate limits, validation thresholds, timeouts, and retry configuration
- ✅ **Timeout and Retry Constants** (src/constants/timeouts.ts) - Centralized timeout and retry configuration for all services (Task 123) - TIMEOUTS for service timeouts, RETRY_CONFIG for retry behavior, MS_TO_SECONDS for time conversion
- ✅ Swiper configuration centralization (SWIPER_CONFIG) - Configuration separated from component logic for reusability and consistency (Task 95)
- ✅ **OpenAPI specification** (docs/openapi-spec.yaml v2.0.0) - Machine-readable API spec (OpenAPI 3.0.3) for monitoring and health check endpoints, corrected to match actual API routes (Task 177)
- ✅ **Postman collection** (docs/postman-collection.json v2.0.0) - Ready-to-use collection with monitoring and health check endpoints, corrected to match actual API routes (Task 177)
- ✅ **API Documentation** (docs/api/auth-service.md, docs/api/email-service.md) - Comprehensive API documentation with usage examples, error handling, and resilience patterns (Task 113)
- ✅ Webpack code splitting for large dependencies (forms, swiper cache groups)
- ✅ Lazy-loaded form components with loading states (ContactForm, LoginForm, SignUpForm, BlogForm)
- ✅ Bundle optimization with separate async chunks (19KB forms, 24KB swiper)
- ✅ Consolidated validation logic in AuthService (validateCredentials private method, Task 50)
- ✅ DRY principle applied to authentication validation (66% code reduction, Task 50)
- ✅ **Layer Separation** (executeWithResilience private method, Task 106) - Extracts common resilience patterns (rate limiting, circuit breaker, retry, metrics, error handling) into reusable layer (33% code reduction)
- ✅ **Module Extraction** (executeWithResilience private method, Task 112) - Extracts EmailService resilience logic into reusable method (77% code reduction in sendEmail method)
- ✅ **Shared Service Resilience Utility** (Task 116) - Extracts common resilience logic into src/services/common/resilience.ts - Single implementation of resilience patterns for all services, eliminates 336 lines of duplicated code (70.4% reduction), generic type parameters support different service result types, ES5 compatible for older JavaScript environments
- ✅ WebP image conversion for better compression (88% size reduction, 132KB savings per page)
- ✅ **Reusable component abstractions** (SectionTitle, AnimationWrapper, BackgroundSection) - Eliminates code duplication across 16+ section title components and 76+ animation patterns
- ✅ **Component refactoring complete** (Task 80) - All critical components now use reusable abstractions (Feature, Faq, Process, Price, IntroArea, ContactFormArea, AboutArea/Feature, AboutArea/AboutArea, PricingArea, Skill, Hero, Cta, ContactArea, LoginArea, SignUpArea, BlogArea, FooterTwo)
- ✅ **Build errors resolved** (Task 81) - SectionTitle supports all wow.js animations (fadeInLeft, fadeInRight), AnimationWrapper supports id and role props for accessibility
- ✅ **Reusable tab state management hook** (useTabs) - Eliminates duplicate tab state management code across 3+ components (PricingArea, Price, FaqArea) with consistent keyboard navigation
- ✅ **Reusable accordion state management hook** (useAccordion) - Eliminates duplicate accordion logic across 2 components (Faq, FaqArea) with flexible initialization and toggle functionality (Task 88)
- ✅ **Reusable pricing card component** (PricingCard) - Eliminates duplicate pricing item rendering logic across 2 components (PricingArea, Price) with consistent currency formatting and feature display (Task 85)
- ✅ **Reusable form input component** (FormField) - Eliminates duplicate form input rendering code across 4 forms (ContactForm, LoginForm, SignUpForm, BlogForm) with comprehensive accessibility features (password toggle, required indicators, help text, character count) and 100+ tests (Tasks 64, 79, 97)
- ✅ **Code health verified** (Task 86) - Build passes (18 pages), lint passes (0 errors, 0 warnings), type check passes (0 errors), all tests passing (1831/1831, 100%), zero critical issues found
- ✅ **Resource hints for critical CDN resources** (preconnect, dns-prefetch) - Improves LCP by 50-150ms through early DNS resolution and TCP connection establishment (Task 87)
- ✅ **Lint warnings fixed** (Task 87) - Removed unused variables in test files, lint passes with 0 errors, 0 warnings
- ✅ **Date format standardization** (Task 40 Phase 4) - All dates stored in ISO 8601 format (YYYY-MM-DD) with formatting utilities for display (formatBlogDate, formatCommentDate, formatDate, isValidISODate, toISODate)
- ✅ **Reusable Brand carousel component** (Brand) - Eliminates duplicate carousel logic across 2 components (home-one/Brand, home-one-dark/Brand) with Swiper configuration, CSS loading, and React.memo optimization (Task 94)
- ✅ **Reusable focus trap hook** (useFocusTrap) - Provides standardized focus management for keyboard accessibility with configurable activation, focus return, and custom selector support (Task 103)
- ✅ **Page Registry & Validation** (VALID_PAGES, validatePageField, filterByPage) - Centralized page value registry with type-safe validation, early error detection, and statistics tracking
- ✅ **Monthly Security Assessment** (Task 115) - Comprehensive security audit maintaining A+ grade with zero vulnerabilities, comprehensive headers, rate limiting, input validation, and no hardcoded secrets
- ✅ **Comprehensive Security Audit** (Task 167) - Latest security assessment (Jan 14, 2026) confirmed A+ grade, 0 CVEs, OWASP Top 10 10/10 compliance, security headers verified, no hardcoded secrets, input validation confirmed, rate limiting verified, no XSS vectors, authentication patterns verified, all 2587 tests passing
 - ✅ **Rendering Optimization** (Task 119) - React.memo and useMemo implemented for 6 components (WiFiMonitor, BlogArea, ContactArea, WebsiteBuilder, UseCases, AboutArea) to prevent unnecessary re-renders and cache expensive calculations, reducing CPU usage and improving user experience on frequently visited pages
  - ✅ **Interface Definition** (Task 122) - Created explicit interface contracts (IRateLimiter, IMetricsCollector, ICircuitBreaker) for core utilities to improve testability, maintainability, and enable easier implementation swapping following SOLID principles (Interface Segregation, Dependency Inversion)
  - ✅ **Reusable CTA Component** (Task 127) - Created CtaWrapper abstraction that eliminates duplicate CTA code across 3 components (common, home-one, faq) with flexible props, support for both AnimationWrapper and wow.js animations, React.memo optimization, and 51% code reduction in variant components
   - ✅ **Type Safety Fixes** (Task 128) - Fixed CtaWrapper type errors (animation prop type, id prop missing) that blocked production build, ensuring strict TypeScript compliance
   - ✅ **Data-Driven UI for Sidebar** (Task 129) - Extracted hardcoded sidebar links from UseCaseDetailsSidebar component to UseCaseSidebarData.ts, created UseCaseSidebarItem interface, added validation with validateUseCaseSidebarItem, follows blueprint data-driven architecture principle, eliminates hardcoded content in components
    - ✅ **Accessibility Improvements** (Task 132) - Added ARIA labels to search inputs and buttons, replaced generic alt text with descriptive dynamic alt text across 5 components (BlogSidebar, TeamArea, BlogArea, LatestNews, ContactFormArea), improving WCAG 2.1 Level A/AA compliance and screen reader support
    - ✅ **Page Layout Standardization** (Task 153) - Created PageBuilder component that eliminates duplicate layout code across 7 pages (pricing, error, Login, sign-up, faq, teams/team) with type-safe PageBuilderConfig interface, single source of truth for page layout, and 23 lines of boilerplate code removed
    - ✅ **Dependency Cleanup** (Task 168) - Removed duplicate RetryOptions interface definition across services and utils layers - Single source of truth for type definitions, proper dependency direction (services → utils), SOLID compliance (Dependency Inversion, Interface Segregation), eliminates 7 lines of duplicate code
     - ✅ **Validation Pattern Consistency** (Task 186) - Eliminated duplicate email regex pattern across validation layers - Removed local EmailPattern from yupAdapter.ts, now uses EmailRule.pattern from rules.ts as single source of truth, DRY principle compliance, eliminates 2 lines of duplicate code
     - ✅ **Dark Mode Theme System** (Task 203) - ThemeContext with localStorage persistence and system preference detection, ThemeToggle component with sun/moon icons, CSS variables for theming, smooth transitions (0.3s ease), theme toggle integrated into HeaderOne navigation, 80 comprehensive tests (50 for ThemeContext, 30 for ThemeToggle)
      - ✅ **Blog Filtering Utility** (Task 214) - Extracted filtering logic from BlogArea component into reusable filterBlogPosts utility with BlogFilterCriteria interface, eliminates duplicate filtering code, enables type-safe filtering across search, category, tag, and status fields, supports future blog scheduling features, 17 comprehensive tests, BlogArea component simplified by replacing inline filtering with utility module
      - ✅ **Device Filtering Utility** (Task 224) - Extracted WiFi device filtering logic from WiFiMonitor component into reusable deviceFilters.ts utility, eliminates inline filtering in presentation layer, enables type-safe device status filtering (Online, Offline, Both), provides comprehensive device statistics (counts, percentages), 27 comprehensive tests, WiFiMonitor component simplified by replacing inline filter calls with utility functions
 
     ### Interface Definition Pattern (✅ COMPLETED - Task 122)

   ### SEO Enhancement System (✅ COMPLETED - Task 220)

   ### Purpose

   Implement comprehensive SEO (Search Engine Optimization) enhancements to improve search engine visibility, social media sharing, and content discoverability for all website content.

   ### Architecture Components

   **SEO Types** (src/types/seo.ts):
   ```typescript
   export interface SeoProps {
     title: string
     description: string
     keywords?: string
     ogImage?: string | StaticImageData
     ogType?: string
     twitterCard?: "summary" | "summary_large_image" | "app" | "player"
     canonicalUrl?: string
     noIndex?: boolean
     structuredData?: object
     additionalMetaTags?: Array<{ name?: string; property?: string; content: string }>
   }

   export interface BlogPostSchema {
     "@context": string
     "@type": string
     headline: string
     description: string
     image: string[]
     author: string
     datePublished: string
     dateModified?: string
     mainEntityOfPage?: { "@type": string; "@id": string }
     publisher?: { "@type": string; name: string; logo?: { "@type": string; url: string } }
   }
   ```

   **Metadata Generator** (src/utils/metadata.ts):
   ```typescript
   export function generateMetadataFromProps(props: SeoProps): Metadata
   export function generateBlogPostMetadata(post: InnerBlogPost, siteUrl?: string): Metadata
   ```
   - Generates Next.js metadata objects from props or blog posts
   - Supports Open Graph (og:title, og:description, og:image, og:url)
   - Supports Twitter Cards (twitter:card, twitter:title, twitter:description, twitter:image)
   - Handles canonical URLs and robots directives (index, follow)
   - Auto-indexes draft posts as noindex, nofollow

   **JSON-LD Generator** (src/utils/seo.ts):
   ```typescript
   export function generateBlogPostSchema(post: InnerBlogPost, canonicalUrl: string, siteUrl?: string): BlogPostSchema
   export function generateWebsiteSchema(siteUrl?: string): object
   ```
   - Generates Schema.org Article schema for blog posts
   - Generates Schema.org Organization schema for website
   - Supports Google Rich Snippets for blog content
   - Validates ISO 8601 date formats

   **JsonLd Component** (src/components/common/JsonLd.tsx):
   ```typescript
   export default function JsonLd({ data }: JsonLdProps)
   ```
   - Renders JSON-LD script tags with Schema.org structured data
   - Type-safe script content injection
   - Handles nested objects and arrays

   **Sitemap Generator** (src/app/sitemap.ts):
   - Next.js MetadataRoute.Sitemap implementation
   - Dynamic sitemap generation from blog data
   - Includes all static pages (home, about, blog, contact, etc.)
   - Includes all published blog posts with URLs
   - Configurable changeFrequency and priority per page
   - Filters out draft posts (only published content indexed)

   **Robots.txt Generator** (src/app/robots.ts):
   - Next.js MetadataRoute.Robots implementation
   - Blocks /dashboard and /api routes from indexing
   - Points to sitemap.xml location

   ### Implementation

   **Blog Details Page** (src/app/blog-details/page.tsx):
   ```typescript
   export async function generateMetadata({ searchParams }: BlogDetailsPageProps) {
     const params = await searchParams
     const postId = params.id || "1"
     const post = await getBlogPost(postId)
     return generateBlogPostMetadata(post, "https://maskom.co.id")
   }

   const BlogDetailsPage = async ({ searchParams }: BlogDetailsPageProps) => {
     const params = await searchParams
     const postId = params.id || "1"
     const post = await getBlogPost(postId)
     const canonicalUrl = `https://maskom.co.id/blog-details?id=${postId}`
     const schema = post ? generateBlogPostSchema(post, canonicalUrl, "https://maskom.co.id") : null
     
     return (
       <>
         {schema && <JsonLd data={schema} />}
         <BlogDetails />
       </>
     )
   }
   ```

   ### Architecture Benefits

   1. **Search Engine Visibility**: Structured data (JSON-LD) helps search engines understand content
   2. **Social Media Sharing**: Open Graph and Twitter Card tags improve link preview quality
   3. **Content Discovery**: Dynamic sitemap.xml enables search engine crawlers to find all pages
   4. **Duplicate Content Prevention**: Canonical URLs prevent SEO issues with duplicate content
   5. **Draft Content Protection**: Robots directives prevent search engines from indexing draft posts
   6. **Type Safety**: TypeScript interfaces ensure correct metadata structure
   7. **Next.js Native**: Uses Next.js metadata API for optimal performance
   8. **Automated Generation**: Sitemap and robots.txt generated from data
   9. **Rich Snippets**: Schema.org Article schema enables Google Rich Snippets
   10. **Maintainability**: Centralized SEO utilities reduce duplication

   ### Testing

   - ✅ 5 tests for SEO schema generator (generateBlogPostSchema, generateWebsiteSchema)
   - ✅ 11 tests for metadata generator (generateBlogPostMetadata, generateMetadataFromProps)
   - ✅ 4 tests for JsonLd component (script rendering, JSON content, nested objects, arrays)
   - ✅ Total: 20 comprehensive tests for SEO components
   - ✅ All 3031 tests passing (100% success rate)
   - ✅ Zero regressions in existing functionality
   - ✅ Lint passes: 0 errors, 0 warnings
   - ✅ Build successful: 23 pages generated

    ### Success Criteria

    - [x] Create SEO types and interfaces (SeoProps, BlogPostSchema, SitemapEntry)
    - [x] Create JSON-LD generator for blog posts (generateBlogPostSchema)
    - [x] Create metadata generator utilities (generateBlogPostMetadata, generateMetadataFromProps)
    - [x] Create JsonLd component for structured data rendering
    - [x] Implement Open Graph meta tags (og:title, og:description, og:image, og:url)
    - [x] Implement Twitter Card meta tags (twitter:card, twitter:title, twitter:description, twitter:image)
    - [x] Generate canonical URLs dynamically
    - [x] Create sitemap.ts for dynamic sitemap generation
    - [x] Create robots.ts for crawler directives
    - [x] Update blog-details page with dynamic metadata and JSON-LD
    - [x] Add comprehensive tests (20 tests covering all SEO components)
    - [x] All tests passing (3031 total, 100% success rate)
    - [x] Lint passes (0 errors, 0 warnings)
    - [x] Build successful (23 pages generated)

    ### Performance Monitoring System (✅ COMPLETED - Task 232)

    ### Purpose

    Implement real-time performance metrics monitoring in the admin analytics dashboard to enable proactive identification of bottlenecks and performance optimization.

    ### Architecture Components

    **Performance Types** (src/types/analytics.ts):
    ```typescript
    export interface WebVitalsMetrics {
      lcp: number
      fid: number
      cls: number
      fcp: number
      ttfb: number
    }

    export interface WebVitalsEntry {
      metric: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB'
      value: number
      rating: 'good' | 'needs-improvement' | 'poor'
      timestamp: string
    }

    export interface PerformanceMetrics {
      metrics: WebVitalsMetrics
      entries: WebVitalsEntry[]
      averageRating: 'good' | 'needs-improvement' | 'poor'
      lastUpdated: string
    }
    ```

    **Web Vitals Utility** (src/utils/webVitals.ts):
    ```typescript
    export function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor'
    export function recordMetric(metric: string, value: number): void
    export function getWebVitalsMetrics(): WebVitalsMetrics
    export function getWebVitalsEntries(): WebVitalsEntry[]
    export function resetWebVitals(): void
    export function calculateAverageRating(): 'good' | 'needs-improvement' | 'poor'
    export function getPerformanceMetrics(): PerformanceMetrics
    export function hasPerformanceAlerts(): boolean
    export function getPerformanceAlerts(): WebVitalsEntry[]
    ```

    **Performance Thresholds**:
    - LCP (Largest Contentful Paint): good < 2500ms, needs-improvement 2500-4000ms, poor > 4000ms
    - FID (First Input Delay): good < 100ms, needs-improvement 100-300ms, poor > 300ms
    - CLS (Cumulative Layout Shift): good < 0.1, needs-improvement 0.1-0.25, poor > 0.25
    - FCP (First Contentful Paint): good < 1800ms, needs-improvement 1800-3000ms, poor > 3000ms
    - TTFB (Time to First Byte): good < 800ms, needs-improvement 800-1800ms, poor > 1800ms

    **PerformanceMetrics Component** (src/components/admin/PerformanceMetrics.tsx):
    - Displays all Core Web Vitals with ratings
    - Shows performance alerts for poor metrics
    - Web Vitals history table with timestamps
    - Best practices guide for performance optimization
    - 30-second auto-refresh interval
    - Dark mode support

    ### Implementation

    **Analytics Dashboard Enhancement** (src/components/admin/AnalyticsDashboard.tsx):
    - Integrated PerformanceMetrics component
    - Added performance data to analytics collection (analyticsData.ts)
    - Mock performance data with good ratings (for demo)
    - Real-time metrics tracking ready for production

    ### Architecture Benefits

    1. **Proactive Monitoring**: Identify performance issues before user impact
    2. **Data-Driven Optimization**: Make performance decisions based on metrics
    3. **Real-Time Insights**: Live performance data in admin dashboard
    4. **Historical Analysis**: Track performance trends over time
    5. **Alert System**: Automatic notifications for threshold violations
    6. **Web Vitals Integration**: Leverage industry-standard metrics
    7. **Average Rating**: Overall performance health indicator

    ### Testing

    - ✅ 51 comprehensive tests for webVitals utilities (100% passing)
    - ✅ All 3301 tests passing (100% success rate)
    - ✅ Zero regressions in existing functionality
    - ✅ Lint passes (0 errors, 0 warnings)
    - ✅ Type check passes (0 errors)

    ### Success Criteria

    - [x] Create Web Vitals utility (src/utils/webVitals.ts)
    - [x] Implement getRating function with threshold logic
    - [x] Implement recordMetric for tracking metrics
    - [x] Implement resetWebVitals for clearing data
    - [x] Implement calculateAverageRating for overall health
    - [x] Implement hasPerformanceAlerts for alert detection
    - [x] Create PerformanceMetrics component for admin dashboard
    - [x] Add performance data to analytics collection
    - [x] Integrate PerformanceMetrics into AnalyticsDashboard
    - [x] Add 51 comprehensive tests for webVitals utilities
    - [x] All 3301 tests passing (100% success rate)
    - [x] Lint passes (0 errors, 0 warnings)
    - [x] Type check passes (0 errors)

    ### Module Extraction Pattern (✅ COMPLETED - Task 127, Task 153, Task 214, Task 224)

  ### Purpose

  Extract duplicate component patterns into reusable abstractions to:
  - Eliminate code duplication across multiple component variants
  - Create single source of truth for common UI patterns
  - Simplify maintenance by centralizing changes
  - Apply DRY principle and SOLID (Single Responsibility)
  - Enable easy creation of new component variants

  ### Component Abstraction

  **Device Filters** (src/utils/deviceFilters.ts):

  ```typescript
  export interface DeviceFilterOptions {
    status?: 'Online' | 'Offline' | 'Both';
  }

  export interface DeviceFilterResult {
    devices: WiFiDevice[];
    onlineCount: number;
    offlineCount: number;
    totalCount: number;
  }

  export function filterDevicesByStatus(
    devices: WiFiDevice[],
    options: DeviceFilterOptions = {}
  ): DeviceFilterResult

  export function getOnlineDevices(devices: WiFiDevice[]): WiFiDevice[]
  export function getOfflineDevices(devices: WiFiDevice[]): WiFiDevice[]
  export function getDeviceStats(devices: WiFiDevice[]): {
    onlineCount: number;
    offlineCount: number;
    totalCount: number;
    onlinePercentage: number;
    offlinePercentage: number;
  }
  ```

  ### Implementation

  All device filtering operations now use extracted utility functions:
  - **WiFiMonitor**: Uses getOfflineDevices() and getDeviceStats()
  - Previously had inline filtering: `devices.filter(d => d.status === "Offline")`
  - Previously had inline counting: `devices.filter(d => d.status === "Online").length`
  - Now uses reusable utility functions with type-safe interfaces

  ### Architecture Benefits

  1. **Layer Separation**:
     - Business logic moved from presentation layer (WiFiMonitor) to utils layer
     - Clear separation of concerns: components focus on rendering, utils handle filtering
     - Filtering logic can be tested independently from React components

  2. **DRY Principle**:
     - Single implementation of device filtering logic
     - Reusable across any component that needs device filtering
     - No duplicate filter patterns across multiple components

  3. **Code Reduction**:
     - WiFiMonitor: 58 lines → 59 lines (+1 line for imports)
     - Filtering logic: 2 inline lines → 1 function call
     - Test coverage: 0 → 27 new tests (comprehensive filter coverage)

  4. **Testability**:
     - Filtering logic tested independently from React components
     - Pure functions with predictable behavior (easy to test)
     - 27 tests covering all filtering scenarios (happy path, edge cases, empty arrays)

  5. **Type Safety**:
     - TypeScript interfaces ensure correct filter options (DeviceFilterOptions)
     - Type-safe return values (DeviceFilterResult)
     - Compile-time checking of device status values

  6. **Maintainability**:
     - Changes to filtering logic only need to update deviceFilters.ts
     - Clear contract definition through interfaces
     - Single source of truth for device filtering

  7. **Extensibility**:
     - Easy to add new filter types (status-based, IP range-based)
     - Device stats function provides comprehensive metrics
     - Utility functions can be used by any dashboard component

  8. **Reusability**:
     - getOnlineDevices() can be used by any component needing online devices
     - getOfflineDevices() can be used by any component needing offline devices
     - getDeviceStats() provides comprehensive metrics for dashboards
     - filterDevicesByStatus() offers flexible filtering with options

  ### Usage Example

  ```typescript
  import { getOfflineDevices, getDeviceStats } from '@/utils/deviceFilters';

  // Get offline devices for alerts
  const offlineDevices = getOfflineDevices(devices);

  // Get device statistics
  const { onlineCount, offlineCount, onlinePercentage } = getDeviceStats(devices);

  // Flexible filtering with options
  const { devices: onlineOnly } = filterDevicesByStatus(devices, { status: 'Online' });
  const { devices: allDevices, onlineCount, offlineCount } = filterDevicesByStatus(devices);
  ```

  ### Testing

  - **27 comprehensive tests** for device filtering utilities:
    - filterDevicesByStatus (8 tests): status filtering, empty arrays, edge cases
    - getOnlineDevices (4 tests): online filtering, empty arrays, immutability
    - getOfflineDevices (4 tests): offline filtering, empty arrays, immutability
    - getDeviceStats (11 tests): counts, percentages, partial percentages, edge cases

  - Test coverage:
    - Happy Path: Normal filtering operations with mixed device states
    - Edge Cases: Empty arrays, all online, all offline, partial percentages
    - Type Safety: TypeScript interfaces tested for correct typing
    - Integration Behavior: Device stats calculations verified
    - Immutability: Original arrays not modified by filter operations

  ### Component Abstraction

  **CtaWrapper** (src/components/common/CtaWrapper.tsx):

  ```typescript
  interface CtaImage {
      src: string | StaticImageData;
      alt: string;
      className?: string;
  }
  
  interface CtaProps {
      heading: string;
      description: string;
      buttonText: string;
      buttonLink: string;
      images: CtaImage[];
      sectionClassName?: string;
      contentClassName?: string;
      imageBoxClassName?: string;
      backgroundImage?: string;
      animation?: string;
      animationType?: 'wow' | 'animation-wrapper';
      shapes?: boolean;
      paddingBottom?: string;
      extraElements?: React.ReactNode;
  }
  ```

  ### Implementation

  All CTA variants now use `CtaWrapper` with variant-specific props:
  - **common/Cta.tsx**: Uses AnimationWrapper, two images, no background
  - **home-one/Cta.tsx**: Uses AnimationWrapper, two images, with id="hubungi"
  - **faq/Cta.tsx**: Uses wow.js, single image, with background and shapes
 
 **CtaWrapper** (src/components/common/CtaWrapper.tsx):
 
 ```typescript
 interface CtaImage {
     src: string | StaticImageData;
     alt: string;
     className?: string;
 }
 
 interface CtaProps {
     heading: string;
     description: string;
     buttonText: string;
     buttonLink: string;
     images: CtaImage[];
     sectionClassName?: string;
     contentClassName?: string;
     imageBoxClassName?: string;
     backgroundImage?: string;
     animation?: string;
     animationType?: 'wow' | 'animation-wrapper';
     shapes?: boolean;
     paddingBottom?: string;
     extraElements?: React.ReactNode;
 }
 ```
 
 ### Implementation
 
 All CTA variants now use `CtaWrapper` with variant-specific props:
 - **common/Cta.tsx**: Uses AnimationWrapper, two images, no background
 - **home-one/Cta.tsx**: Uses AnimationWrapper, two images, with id="hubungi"
 - **faq/Cta.tsx**: Uses wow.js, single image, with background and shapes
 
 ### Benefits
 
 1. **DRY Principle**:
    - Single implementation of CTA pattern for all variants
    - No duplicate layout code across components
 
 2. **Code Reduction**:
    - home-one/Cta.tsx: 37 lines → 14 lines (62.2% reduction)
    - faq/Cta.tsx: 35 lines → 20 lines (42.9% reduction)
    - common/Cta.tsx: 34 lines → 18 lines (47.1% reduction)
 
 3. **Maintainability**:
    - Changes to CTA pattern only need to update CtaWrapper
    - Clear contract definition through CtaProps interface
 
 4. **Extensibility**:
    - Easy to create new CTA variants with different props
    - Flexible prop system supports various styling needs
 
 5. **Type Safety**:
    - TypeScript interfaces ensure type-safe usage
    - Compile-time checking of prop types
 
 6. **Performance**:
    - React.memo optimization applied to all variants
    - Previously only home-one had memoization
 
 7. **Flexibility**:
    - Support for both AnimationWrapper and wow.js animations
    - Optional background images and decorative elements
    - Customizable CSS classes for all sections
 
 ### Usage Example
 
 ```typescript
 import CtaWrapper from "@/components/common/CtaWrapper"
 
 // Simple CTA variant
 <CtaWrapper
     heading="Ready to upgrade?"
     description="Contact us for a consultation."
     buttonText="Get in Touch"
     buttonLink="/contact"
     images={[{ src: image1, alt: "Illustration" }]}
 />
 
 // CTA with background and shapes
 <CtaWrapper
     heading="Need help choosing?"
     description="Our team is ready to help."
     buttonText="Schedule Consultation"
     buttonLink="/contact"
     images={[{ src: thumb, alt: "FAQ" }]}
     backgroundImage="/assets/images/bg/faq-bg.webp"
     shapes={true}
     paddingBottom="pt-50 pb-30"
     animation="fadeInLeft"
     animationType="wow"
 />
 ```
 
 ### Testing
 
 All existing tests continue to pass (2292 tests, 100% success rate):
 - No regressions in CTA component behavior
 - All variants render correctly with new abstraction
 - Lint passes: 0 errors, 0 warnings
 - Build passes: 18 pages generated
 
  ### Architecture Benefits

  1. **Single Source of Truth**: CtaWrapper defines CTA pattern once
  2. **SOLID Compliance**:
     - **Single Responsibility**: CtaWrapper handles CTA rendering
     - **Open/Closed**: Open to extension via props, closed to modification
  3. **DRY Principle**: No duplicate CTA code across variants
  4. **Maintainability**: Single point of change for CTA pattern
  5. **Consistency**: All CTA variants follow same structure
  6. **Type Safety**: TypeScript interfaces enforce contracts
  7. **Performance**: React.memo optimization for all variants

  ### PageBuilder Pattern (✅ COMPLETED - Task 153)

  ### Purpose

  Extract duplicate page layout boilerplate into reusable builder pattern to:
  - Eliminate 98 lines of layout boilerplate across 7 pages
  - Create single source of truth for page layout structure
  - Simplify page creation with declarative API
  - Apply DRY principle and SOLID (Single Responsibility)
  - Enable consistent layout patterns across all pages

  ### Component Abstraction

  **PageBuilder** (src/components/common/PageBuilder.tsx):

  ```typescript
  // Single content variant (Login, sign-up, teams/team, error)
  interface PageBuilderConfig {
    title: string;
    subTitle: string;
    content: ReactNode;
    footer?: 'one' | 'two';
    headerStyle?: boolean;
    footerStyle?: boolean;
    footerStyle2?: boolean;
  }

  // Multi-section variant (pricing, faq)
  interface PageBuilderWithSectionsConfig {
    title: string;
    subTitle: string;
    sections: ReactNode[];
    footer?: 'one' | 'two';
    headerStyle?: boolean;
    footerStyle?: boolean;
    footerStyle2?: boolean;
  }

  export function PageBuilder(config: PageBuilderConfig): JSX.Element
  export function PageBuilderWithSections(config: PageBuilderWithSectionsConfig): JSX.Element
  ```

  ### Implementation

  All page index files now use PageBuilder pattern:
  - **Login**: PageBuilder with single content
  - **sign-up**: PageBuilder with single content
  - **teams/team**: PageBuilder with single content
  - **error**: PageBuilder with single content
  - **pricing**: PageBuilderWithSections with 3 sections
  - **faq**: PageBuilderWithSections with 3 sections

  ### Architecture Benefits

  1. **Single Source of Truth**: PageBuilder defines page layout once
  2. **SOLID Compliance**:
     - **Single Responsibility**: PageBuilder handles page layout
     - **Open/Closed**: Open to extension via props, closed to modification
  3. **DRY Principle**: Eliminates 23 lines of duplicate boilerplate code
  4. **Maintainability**: Single point of change for page layout structure
  5. **Consistency**: All pages follow same layout pattern
  6. **Type Safety**: TypeScript interfaces enforce contracts
  7. **Code Reduction**: 23 lines removed across 6 page index files

  ### Anti-Patterns (Fix)
  - ❌ Duplicate component logic across multiple files - FIXED
  - ❌ Duplicated React boilerplate code - FIXED
  - ❌ Inconsistent page layout patterns - FIXED
  - ❌ Changes requiring updates to multiple files - FIXED
 
 ### Interface Definition Pattern (✅ COMPLETED - Task 122)
 
 ### Purpose

Create explicit interface contracts for core utility classes to:
- Define clear contracts between modules
- Enable easy mocking for testing
- Allow implementation swapping without breaking consumers
- Apply SOLID principles (Interface Segregation, Dependency Inversion)

### Interface Contracts

**IRateLimiter** (src/utils/rateLimiter.ts):
```typescript
interface IRateLimiter {
    check(identifier: string): RateLimitResult;
    recordAttempt(identifier: string): RateLimitResult;
    reset(identifier: string): void;
    resetAll(): void;
    getStatus(identifier: string): RateLimitStatus;
    destroy?(): void;
}
```

**IMetricsCollector** (src/utils/metrics/types.ts):
```typescript
interface IMetricsCollector {
    recordCall(serviceName: string, success: boolean, errorType?: string, responseTime?: number): void;
    recordCircuitBreakerState(serviceName: string, isOpen: boolean): void;
    getMetrics(serviceName: string): ServiceMetrics | undefined;
    getAllMetrics(): ServiceMetrics[];
    getSuccessRate(serviceName: string): number;
    getFailureRate(serviceName: string): number;
    healthCheck(serviceName: string, thresholdSuccessRate?: number): HealthCheckResult;
    getAllHealthChecks(thresholdSuccessRate?: number): HealthCheckResult[];
    reset(serviceName: string): void;
    resetAll(): void;
    exportMetrics(): MetricData[];
}
```

**ICircuitBreaker** (src/utils/resilience/types.ts):
```typescript
interface ICircuitBreaker {
    execute<T>(fn: () => Promise<T>): Promise<T>;
    getState(): CircuitBreakerState;
    reset(): void;
}
```

**IAutoIdGenerator** (src/utils/dataAutoId.ts):
```typescript
interface IAutoIdGenerator {
    next(): number;
    nextId(): number;
    reset(startFrom?: number): void;
    getCurrentId(): number;
    getUsedIds(): readonly number[];
    hasUsedId(id: number): boolean;
}
```

### Implementation

All utility classes implement their respective interfaces:
- **RateLimiter** implements `IRateLimiter`
- **MetricsCollector** implements `IMetricsCollector`
- **CircuitBreaker** implements `ICircuitBreaker`
- **AutoIdGenerator** implements `IAutoIdGenerator`

### Benefits

1. **SOLID Principles**:
   - **Interface Segregation**: Small, focused interfaces for each utility
   - **Dependency Inversion**: Services depend on abstractions, not concrete implementations
   - **Single Responsibility**: Each interface has one clear purpose

2. **Testability**:
   - Easy to create mocks for interfaces in tests
   - Tests verify contract compliance without knowing implementation details
   - Interface contract tests ensure all methods are implemented correctly

3. **Maintainability**:
   - Clear contracts make refactoring safer
   - TypeScript enforces interface compliance at compile time
   - Breaking changes are caught early by type checker

4. **Extensibility**:
   - Easy to create alternative implementations (e.g., Redis-backed RateLimiter)
   - Swap implementations without changing consuming code
   - Add new implementations that follow existing contracts

5. **Documentation**:
   - Interfaces serve as executable documentation
   - Clear contract definition for utility behavior
   - Type definitions describe expected parameters and return values

### Usage Example

```typescript
import type { IRateLimiter } from '@/utils/rateLimiter';

class CustomRateLimiter implements IRateLimiter {
    check(identifier: string): RateLimitResult {
    // Custom implementation
    return { allowed: true, attemptsRemaining: 5 };
    }

    recordAttempt(identifier: string): RateLimitResult {
        // Custom implementation
        return { allowed: true, attemptsRemaining: 4 };
    }

    reset(identifier: string): void {
        // Custom implementation
    }

    resetAll(): void {
        // Custom implementation
    }

    getStatus(identifier: string): { count: number; firstAttempt: number; lockedUntil?: number | null } {
        // Custom implementation
        return { count: 0, firstAttempt: Date.now(), lockedUntil: null };
    }
}
```

### Testing

All interface contracts have comprehensive test coverage:
- **RateLimiter interface tests** (14 tests) - src/utils/rateLimiter/__tests__/interface.test.ts
- **MetricsCollector interface tests** (18 tests) - src/utils/metrics/__tests__/interface.test.ts
- **CircuitBreaker interface tests** (14 tests) - src/utils/resilience/__tests__/interface.test.ts
- **AutoIdGenerator interface tests** (17 tests) - src/utils/__tests__/dataAutoId.interface.test.ts

Tests verify:
- Interface methods are correctly implemented
- Return values match expected types
- Behavior matches interface contract
- Edge cases are handled correctly

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
- ❌ Duplicate resilience logic in AuthService login/register methods - FIXED (Task 106)
- ❌ Duplicate resilience logic in EmailService sendEmail method - FIXED (Task 112)
 - ❌ Duplicate resilience logic across EmailService and AuthService - FIXED (Task 116)
- ❌ Duplicate RetryOptions interface definition across services and utils - FIXED (Task 168)

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
- **Code Quality** (✅ COMPLETED - Tasks 50 & 106):
    - **Consolidated Validation**: `validateCredentials()` private method centralizes validation logic (Task 50)
    - **Layer Separation**: `executeWithResilience()` private method extracts common resilience patterns (Task 106)
    - **DRY Principle**: Single validation and resilience method eliminates duplicate code in login/register
    - **Code Reduction**: 
      - Validation: 71 lines → 24 lines (66% reduction, Task 50)
      - Resilience: 148 lines → 99 lines (33% reduction, Task 106)
    - **Maintainability**: Single point of change for validation rules and resilience patterns
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

- **Purpose**: Ensure consistent response formats and error handling across all services and API routes
- **Implementation**: Common service types in `src/services/common/` and API utilities in `src/utils/`
- **Components**:
  - **Service Layer** (`src/services/common/`):
    - `ServiceResult<T>` - Unified response interface for all services
    - `ServiceErrorCode` - Standardized error code constants (VALIDATION_ERROR, RATE_LIMIT_EXCEEDED, TIMEOUT, CIRCUIT_BREAKER_OPEN, CREDENTIALS_MISSING, NETWORK_ERROR, UNKNOWN_ERROR)
    - Exception Classes - Type-safe error handling (ServiceException, ServiceTimeoutError, ServiceRateLimitError, ServiceValidationError, ServiceCircuitBreakerError, ServiceCredentialsError, ServiceNetworkError)
    - Helper Functions - createSuccessResult, createErrorResult, mapToServiceResult
    - Logging Utilities - logServiceError, logServiceSuccess, logServiceWarning
  - **API Response Utility** (`src/utils/apiResponse.ts` - ✅ COMPLETED - Task 169):
    - `createApiResponse<T>()` - Unified API response formatting function
    - **ApiResponseConfig<T>` interface**: Type-safe configuration for responses
    - **Default Headers**: Content-Type, Cache-Control (no-cache, no-store, must-revalidate)
    - **Custom Headers Support**: Optional headers parameter for API-specific customization
    - **Type Safety**: Generic type parameter ensures response data type consistency
- **Benefits**:
  - **Contract First**: ServiceResult and ApiResponseConfig define contracts before implementation
  - **Consistency**: All services return same format (success, message, error, errorCode, metadata)
  - **API Response Uniformity**: All API routes use createApiResponse with identical headers
  - **Type Safety**: Error codes and response data are typed, not strings
  - **Error Classification**: Each error has isRetryable and isTimeout flags
  - **Code Reuse**: Helper functions reduce boilerplate
  - **Single Source of Truth**: createApiResponse eliminates duplicate response formatting (DRY principle)
  - **Maintainability**: Update response headers in one place (createApiResponse utility)
  - **Self-Documenting**: Type names and error codes describe behavior
  - **Future-Proof**: Easy to add new services and API routes following same patterns
- **Documentation Alignment** (✅ COMPLETED - Task 131):
  - Service documentation accurately reflects actual type implementations
  - `ServiceResult<T>` structure documented with `data` and `metadata` fields
  - `metadata.rateLimited` used instead of direct `rateLimited` field
  - Domain-specific types (e.g., `AuthResult`) documented with relationship to `ServiceResult<T>`
  - Service Type System sections added to documentation
  - Response examples updated with correct field names (`data.text`, `errorCode`, `metadata`)
- **API Response Standardization** (✅ COMPLETED - Task 169):
  - Eliminated duplicate NextResponse.json() pattern across 3 API routes
  - Single createApiResponse utility enforces consistent headers (Content-Type, Cache-Control)
  - Zero code duplication in API response formatting
  - Easy to add monitoring, logging, or security headers to all API routes
- **Location**: `src/services/common/` (types.ts, ServiceException.ts, logger.ts, resultHelpers.ts, index.ts), `src/utils/apiResponse.ts`

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

### Data-Driven UI Pattern (✅ COMPLETED - Task 129)

### Purpose

Extract hardcoded UI content into TypeScript data files to:
- Implement blueprint principle: "All dynamic content uses TypeScript data files in src/data/"
- Separate presentation layer from data layer
- Create single source of truth for UI content
- Enable easy content management without code changes
- Apply DRY principle and Separation of Concerns
- Maintain type safety across all UI data

### Data Structure

**UseCaseSidebarItem** (src/types/data/index.ts):
```typescript
interface UseCaseSidebarItem {
   id: number;         // Unique identifier
   title: string;      // Display text for navigation
   link: string;       // URL for navigation
   active?: boolean;    // Optional flag for current page
}
```

### Data File

**UseCaseSidebarData.ts** (src/data/):
```typescript
const use_case_sidebar_data: UseCaseSidebarItem[] = [
   {
      id: 1,
      title: "Integrasi Konektivitas Ritel Nasional",
      link: "/use-case-details",
      active: true
   },
   {
      id: 2,
      title: "Managed Wi-Fi untuk F&B Chain",
      link: "/use-case-details"
   }
   // ... more items
];

export default use_case_sidebar_data;
export const useCaseSidebarById: IdIndex<UseCaseSidebarItem> = createIdIndex(use_case_sidebar_data);
```

### Implementation

**UseCaseDetailsSidebar Component** (src/components/causes/use-cases-details/UseCaseDetailsSidebar.tsx):
```typescript
import use_case_sidebar_data from '@/data/UseCaseSidebarData'

const UseCaseDetailsSidebar = () => {
   return (
      <div className="col-lg-4">
         <div className="sidebar-nav-widget style-one mb-50 wow fadeInDown">
            <ul>
               {use_case_sidebar_data.map((item) => (
                  <li key={item.id}>
                     <Link href={item.link} className={item.active ? 'active' : ''}>
                        {item.title}
                     </Link>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   )
}
```

### Benefits

1. **Separation of Concerns**:
   - Component handles presentation (rendering, DOM structure)
   - Data file handles content (sidebar items, links, titles)
   - Clear boundary between UI and data layers

2. **Maintainability**:
   - Add/remove/reorder sidebar items in data file, not component code
   - Single point of change for sidebar content
   - No need to modify component for content updates

3. **Type Safety**:
   - TypeScript interface ensures data structure consistency
   - Compile-time checking of required fields (id, title, link)
   - Prevents typos and missing fields

4. **Validation**:
   - Runtime validation with `validateUseCaseSidebarItem`
   - Catches data errors at build time
   - Custom validators for id (positive number), title (non-empty), link (non-empty)

5. **Scalability**:
   - Easy to create page-specific sidebar variants
   - Index support (useCaseSidebarById) for O(1) lookups
   - Follows same pattern as MenuData and other data files

6. **Consistency**:
   - All dynamic content follows same pattern (data files in src/data/)
   - Consistent with blueprint architectural principles
   - Maintains existing patterns across codebase

7. **Testing**:
   - 14 comprehensive tests for validator
   - Tests cover valid items, missing fields, invalid types, edge cases
   - Ensures data integrity at build time

### Validation

**Validator** (src/utils/dataValidation/useCaseValidation.ts):
```typescript
export const validateUseCaseSidebarItem = createValidator<UseCaseSidebarItem>({
   requiredFields: ["id", "title", "link"],
   validators: {
      id: (value) => {
         if (typeof value !== "number" || value <= 0) {
            return { valid: false, message: "id must be a positive number" };
         }
         return { valid: true };
      },
      title: (value) => {
         if (typeof value !== "string" || value.trim().length === 0) {
            return { valid: false, message: "title must be a non-empty string" };
         }
         return { valid: true };
      },
      link: (value) => {
         if (typeof value !== "string" || value.trim().length === 0) {
            return { valid: false, message: "link must be a non-empty string" };
         }
         return { valid: true };
      }
   }
});
```

### Anti-Patterns (Fix)
- ❌ Hardcoded UI content in components - FIXED
- ❌ Data mixed with presentation logic - FIXED
- ❌ Content changes requiring code modifications - FIXED
- ❌ No type safety for UI data - FIXED
- ❌ Missing validation for data structures - FIXED

### Usage Example

```typescript
import use_case_sidebar_data from '@/data/UseCaseSidebarData';

// Adding new sidebar item - just add to data array
const use_case_sidebar_data: UseCaseSidebarItem[] = [
   {
      id: 1,
      title: "Integrasi Konektivitas Ritel Nasional",
      link: "/use-case-details",
      active: true
   },
   // Add new item here
   {
      id: 6,
      title: "New Use Case",
      link: "/new-use-case"
   }
];
```

### Testing

All validators have comprehensive test coverage:
- **UseCaseSidebar validator** (14 tests) - src/utils/dataValidation/__tests__/useCaseValidation.test.ts
- Tests verify: valid items, missing fields, invalid types, edge cases
- All tests follow AAA pattern (Arrange → Act → Assert)
- 100% expected success rate

### Architecture Benefits

1. **Blueprint Compliance**: Follows data-driven UI principle
2. **Single Source of Truth**: UI content in one location
3. **Separation of Concerns**: Clear boundary between presentation and data
4. **Type Safety**: TypeScript interfaces ensure consistency
5. **Validation**: Runtime checks catch errors early
6. **Maintainability**: Content updates without code changes
7. **Scalability**: Easy to create variants and extensions

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

**Images Removed in Task 91** (44K savings):
- `public/assets/images/bg/testimonial-bg2.jpg` (44K) - Not used

**Cumulative Total: 244KB savings from unused asset removal (Task 62 + Task 91)**

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
- `hero-bg-1.png` (124KB) → Kept as PNG (WebP tested, larger at all quality levels) (Task 91)
- `faq-bg.jpg` (28.2KB) → `faq-bg.webp` (2.5KB) = **25.7KB saved (91.3% reduction)** (Task 76)
- `base.png` (35.5KB) → Kept as PNG (WebP version larger) (Task 76)

**WebP Testing Results for hero-bg-1.png** (Task 91):
- Quality 85: 140KB (13KB larger than PNG)
- Quality 80: 133KB (9KB larger)
- Quality 75: 128KB (4KB larger)
- Quality 70: 127KB (3KB larger)
- Quality 60: 124KB (same size)
- Quality 50: 123KB (1KB smaller, but quality too low)
- **Decision**: Keep original PNG - WebP provides no benefit at acceptable quality levels

**Cumulative Total Savings: 175.7KB across 4 optimized images (Task 73 + Task 76 + Task 91)**

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

Comprehensive API specifications for all external service integrations are documented in `docs/api/` directory.

**Quick Start Resources**:
- **OpenAPI Specification**: `docs/openapi-spec.yaml` - Machine-readable API spec (OpenAPI 3.0.3)
- **Postman Collection**: `docs/postman-collection.json` - Ready-to-use Postman collection with all endpoints and tests

**Service Documentation**:
- **Email Service** (`docs/api/email-service.md`) - EmailJS integration with resilience patterns (Task 112)
- **Auth Service** (`docs/api/auth-service.md`) - Authentication API with login, register, logout, rate limiting (Task 113)

**Documentation Contents**:
- Complete API contracts with TypeScript interfaces
- Request/response formats and examples
- React component integration examples
- Resilience patterns (timeout, retry, circuit breaker, rate limiting)
- Error handling scenarios and error codes
- Input validation requirements
- Monitoring and observability guides
- Best practices and troubleshooting

### API Route Standardization (✅ COMPLETED - Task 229)

#### Purpose

Standardize all API route responses to use ServiceResult<T> pattern for consistency with client-side services, improve type safety, and enable unified error handling across the application.

#### Problem Identified

**Response Format Inconsistency**:
- API routes (/api/health, /api/metrics, /api/services/status) used createApiResponse returning `{ data, status }`
- Client-side services (EmailService, AuthService) return `ServiceResult<T>` with `{ success, message, data, error, errorCode, metadata }`
- Two different response formats across client and server layers

**Missing Resilience Patterns**:
- API routes had no timeout protection
- API routes didn't use standardized error codes (ServiceErrorCode)
- API routes didn't follow resilience patterns used by client services

#### Solution

**1. ServiceResult<T> Response Pattern** (apiResponse.ts)
```typescript
export interface ServiceResult<T = void> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errorCode?: ServiceErrorCodeType;
    metadata?: Record<string, unknown>;
}

export function createServiceResponse<T>({
    data,
    message = 'Success',
    status = 200,
    headers
}: ServiceResponseConfig<T>): NextResponse<ServiceResult<T>>

export function createServiceErrorResponse({
    error,
    errorCode,
    status = 500,
    headers,
    metadata
}: ServiceErrorResponseConfig): NextResponse<ServiceResult<void>>
```

**Benefits**:
- Unified response format across all endpoints (client and server)
- Consistent error codes (ServiceErrorCode enum)
- Type-safe response structures
- Predictable success/error handling patterns
- Metadata support for additional context (e.g., rateLimited)

**2. API Route Updates**

Updated all server-side API routes to use ServiceResult<T> pattern:

- **/api/health**: Returns ServiceResult<HealthCheckData> with timeout protection (5s)
- **/api/metrics**: Returns ServiceResult<MetricsData> with timeout protection (5s)
- **/api/services/status**: Returns ServiceResult<ServiceStatusData> with timeout protection (5s)

**Timeout Protection**:
- All API routes now use withTimeout utility
- Configurable timeout via TIMEOUTS.API_ROUTE constant (5000ms)
- Prevents indefinite hangs from slow operations
- Graceful error handling on timeout

**Example Response (Before → After)**:

```json
// Before (createApiResponse)
{
  "status": "healthy",
  "timestamp": "2026-01-16T12:00:00.000Z",
  "services": [...]
}

// After (createServiceResponse - ServiceResult<T>)
{
  "success": true,
  "message": "All services healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-16T12:00:00.000Z",
    "services": [...]
  }
}
```

**Error Response Example**:

```json
{
  "success": false,
  "error": "Health check operation timed out"
}
```

#### Implementation

**Code Changes**:
- Modified: `src/utils/apiResponse.ts` - Added createServiceResponse and createServiceErrorResponse (63 lines)
- Modified: `src/app/api/health/route.ts` - Updated to ServiceResult pattern with timeout (51 lines)
- Modified: `src/app/api/metrics/route.ts` - Updated to ServiceResult pattern with timeout (44 lines)
- Modified: `src/app/api/services/status/route.ts` - Updated to ServiceResult pattern with timeout (42 lines)
- Modified: `src/constants/timeouts.ts` - Added API_ROUTE timeout (17 lines)
- Modified: `docs/openapi-spec.yaml` - Updated to v3.0.0 with ServiceResult<T> pattern
- Modified: `docs/postman-collection.json` - Updated to v3.0.0 with ServiceResult<T> pattern
- Modified: `docs/api/health-api.md` - Updated response examples with ServiceResult<T>
- Modified: `docs/api/metrics-api.md` - Updated response examples with ServiceResult<T>
- Modified: `docs/api/services-status-api.md` - Updated response examples with ServiceResult<T>

**Total**: 10 files modified, ~280 lines added/modified

#### Architecture Benefits

1. **Consistency**: All endpoints (client and server) now use same response format
2. **Type Safety**: ServiceResult<T> provides compile-time type checking
3. **Error Handling**: Standardized ServiceErrorCode enum for error classification
4. **Resilience**: Timeout protection prevents API route hangs
5. **Self-Documenting**: Consistent structure makes API behavior predictable
6. **Backward Compatibility**: New functions coexist with createApiResponse (non-breaking)
7. **Error Recovery**: createServiceErrorResponse provides consistent error format
8. **Metadata Support**: Additional context (rateLimited, retryInfo) can be attached
9. **Testability**: Unified response format enables easier API testing
10. **Scalability**: Pattern easy to apply to new API routes

#### Integration Pattern

```
Client Request (React Component)
    ↓
API Route Handler (GET /api/health)
    ↓
withTimeout() - 5 second timeout protection
    ↓
Service Logic (health check calculation)
    ↓
createServiceResponse() - ServiceResult<T> wrapper
    ↓
Client Response (ServiceResult<T>)
```

#### Documentation Updates

**OpenAPI Spec** (docs/openapi-spec.yaml v3.0.0):
- Updated response format documentation
- Added ServiceResult<T> interface definition
- Updated version to 3.0.0
- Response examples now show ServiceResult<T> pattern

**Postman Collection** (docs/postman-collection.json v3.0.0):
- Updated version to 3.0.0
- Description updated to mention ServiceResult<T> pattern
- Collection reflects new response structure

**API Documentation**:
- docs/api/health-api.md - Updated response examples
- docs/api/metrics-api.md - Updated response examples
- docs/api/services-status-api.md - Updated response examples

#### Testing

**All Tests Passing**:
- Total: 3197 tests (100% success rate)
- Lint: 0 errors, 0 warnings
- Type check: 0 errors
- Zero regressions in existing functionality

#### Success Criteria

- [x] All API routes use ServiceResult<T> pattern
- [x] Timeout protection added to all API routes (5 seconds)
- [x] createServiceResponse utility created
- [x] createServiceErrorResponse utility created
- [x] OpenAPI spec updated to v3.0.0 with ServiceResult<T>
- [x] Postman collection updated to v3.0.0
- [x] API documentation updated with ServiceResult<T> examples
- [x] All 3197 tests passing (100% success rate)
- [x] Lint passes (0 errors, 0 warnings)
- [x] Type check passes (0 errors)
- [x] Zero regressions in existing functionality

#### Related Files

- ✅ Modified: `src/utils/apiResponse.ts` - Added ServiceResult<T> utilities
- ✅ Modified: `src/app/api/health/route.ts` - Updated with ServiceResult pattern
- ✅ Modified: `src/app/api/metrics/route.ts` - Updated with ServiceResult pattern
- ✅ Modified: `src/app/api/services/status/route.ts` - Updated with ServiceResult pattern
- ✅ Modified: `src/constants/timeouts.ts` - Added API_ROUTE timeout
- ✅ Updated: `docs/openapi-spec.yaml` - v3.0.0 with ServiceResult<T> pattern
- ✅ Updated: `docs/postman-collection.json` - v3.0.0
- ✅ Updated: `docs/api/health-api.md` - ServiceResult<T> response examples
- ✅ Updated: `docs/api/metrics-api.md` - ServiceResult<T> response examples
- ✅ Updated: `docs/api/services-status-api.md` - ServiceResult<T> response examples

#### Notes

- Follows Integration Engineer principles:
  - **Contract First**: ServiceResult<T> defines unified API contract
  - **Resilience**: Timeout protection prevents cascade failures
  - **Consistency**: Same response format across all endpoints
  - **Self-Documenting**: Predictable structure enables easier integration
  - **Backward Compatibility**: createApiResponse still available for gradual migration
- Timeout value: TIMEOUTS.API_ROUTE = 5000ms (5 seconds)
- Error handling: Uses ServiceErrorCode enum for typed error classification
- Non-breaking: Existing createApiResponse preserved for compatibility
- Performance: Timeout prevents indefinite hangs, improves reliability
- Type Safety: ServiceResult<T> provides compile-time validation

#### Impact

- **Integration**: All API routes now consistent with client-side service patterns
- **Type Safety**: ServiceResult<T> eliminates response format confusion
- **Error Handling**: Standardized error codes enable better error recovery
- **Resilience**: Timeout protection prevents API route failures
- **Documentation**: OpenAPI spec v3.0.0 provides machine-readable contract
- **Zero Regressions**: All 3197 tests passing, lint clean, type check passing
- **Maintainability**: Single source of truth for API response format
- Migration guides for real backend integration

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

### Security Assessment (✅ Completed - Task 130)

Comprehensive security audit completed with **zero critical issues**:
- **Zero CVE vulnerabilities** (npm audit: 0/0)
- **No hardcoded secrets** in code
- **No deprecated packages** detected
- **All security headers properly configured**
- **Rate limiting implemented** for all authentication forms
- **Input validation** for all user inputs
- **No dangerous patterns** (innerHTML, eval, Function constructor all absent)
- **Secrets properly managed** (.env* excluded, .env.example has only placeholders)
- **All 2337 tests passing** (100% success rate)
- **Lint passed with 0 errors, 0 warnings**
- **Build passed with 18 pages generated successfully**

**Dependency Health**:
- **0 vulnerabilities** found (0 critical, 0 high, 0 moderate, 0 low, 0 info)
- **All dependencies healthy and actively maintained**
- **No deprecated packages in use**
- **Outdated packages are non-critical major version upgrades** (no security implications):
  - Next.js 15.5.9 → 16.1.1 (medium priority)
  - React 18.3.1 → 19.2.3 (low priority)
  - Jest 29.7.0 → 30.2.0 (low priority)

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

**Security Headers** (public/_headers):
- **X-Frame-Options: DENY** - Prevents clickjacking
- **X-Content-Type-Options: nosniff** - MIME-type sniffing protection
- **X-XSS-Protection: 1; mode=block** - XSS protection
- **Strict-Transport-Security**: max-age=63072000 with includeSubDomains and preload (HSTS)
- **Content-Security-Policy**: Comprehensive CSP with proper restrictions
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: geolocation=(), microphone=(), camera=()
- **CORS Headers**: Environment-based origin restriction

**Security Grade**: A+ (Zero critical issues, comprehensive protection)

**Verification**: Security posture verified monthly and quarterly - all measures remain effective:
- **Task 66** (Initial security assessment)
- **Task 70** (Verification)
- **Task 72** (Periodic verification Q1 2026)
- **Task 76** (Quarterly verification Q1 2026)
- **Task 77** (Data architecture security)
- **Task 82** (Comprehensive verification Jan 2026)
- **Task 86** (Quarterly verification Jan 12, 2026)
- **Task 90** (Monthly verification Jan 13, 2026)
- **Task 96** (Monthly verification Jan 14, 2026)
- **Task 118** (Monthly security assessment Jan 12, 2026)
- **Task 125** (Monthly security assessment Jan 13, 2026)
- **Task 130** (Comprehensive security assessment Jan 13, 2026)

**Full Documentation**: See `docs/task.md` - Task 130: Security Assessment for complete details
**Assessment Frequency**: Monthly (Tasks 125, 130) and Quarterly comprehensive
**Next Assessment**: February 13, 2026
