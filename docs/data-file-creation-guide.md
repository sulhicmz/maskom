# Data File Creation Guide

This guide explains how to create and maintain data files in Maskom's data-driven architecture.

## Overview

Maskom uses **static TypeScript data files** to drive dynamic content. All data is stored in `src/data/*.ts` and validated at build-time.

### Why Data-Driven?

- **Single Source of Truth**: Update data once, reflected across all pages
- **Type Safety**: TypeScript interfaces prevent invalid data
- **Runtime Validation**: 21 validators catch data integrity issues
- **Easy Updates**: Change content without modifying components
- **Reusable**: Filter data by page for multi-page reuse

## Data File Structure

### Location

All data files are in `src/data/`:

```
src/data/
├── TeamData.ts              # Team members
├── FeedbackData.ts           # Testimonials
├── FaqData.ts              # FAQ items
├── PriceData.ts             # Pricing plans
├── MenuData.ts             # Navigation menu
├── InnerBlogData.ts        # Blog posts
└── ...                     # Other data files
```

### File Pattern

Each data file follows this structure:

```typescript
// 1. Type definition
interface DataItem extends BaseDataItem {
    title: string;
    description: string;
    // ... other fields
}

// 2. Validator (optional but recommended)
export const validateDataItem = createValidator<DataItem>({
    requiredFields: ['title', 'description'],
    rules: [
        { field: 'title', rule: MinLengthRule(5) }
    ]
});

// 3. Data array (manual ID assignment)
const data: DataItem[] = [
    {
        id: 1,
        page: 'home_1',
        title: 'First Item',
        description: 'Item description'
    },
    // ... more items
];

// 4. Auto-ID assignment (preferred for new files)
const { data: autoData } = autoIdArray<DataItem>([
    {
        page: 'home_1',
        title: 'First Item',
        description: 'Item description'
    },
    // ... more items
], { startFrom: 1 });

// 5. Pre-filtered exports (for page-specific data)
export const home_1_data = filterByPage(data, 'home_1');
export const pricing_data = filterByPage(data, 'pricing');

// 6. Default export
export default data;
```

## Data Types

### Type 1: BaseDataItem (Page-Filtered Data)

Use `BaseDataItem` for data that appears on multiple pages:

```typescript
import { BaseDataItem } from '@/types/data';

interface FeatureItem extends BaseDataItem {
    title: string;
    description: string;
    icon: string;
}

const feature_data: FeatureItem[] = [
    {
        id: 1,                    // Required by BaseDataItem
        page: 'home_1',          // Required for filtering
        title: 'Fast Internet',
        description: 'Up to 1 Gbps',
        icon: 'wifi'
    }
];

// Filter by page
export const home_1_features = filterByPage(feature_data, 'home_1');
export const pricing_features = filterByPage(feature_data, 'pricing');
```

**Fields**: `id: number`, `page: string`

**Use Cases**: Features, testimonials, FAQs, pricing, processes

### Type 2: Standalone Data (Global)

Use standalone types for data not tied to specific pages:

```typescript
interface TeamMember {
    id: number;
    name: string;
    designation: string;
    img: StaticImageData;
}

const team_data: TeamMember[] = [
    {
        id: 1,
        name: 'John Doe',
        designation: 'CEO',
        img: teamImage
    }
];

export default team_data;  // No filtering needed
```

**Use Cases**: Team members, blog posts, navigation menu, contact info

## Auto-ID Generation

### Why Use Auto-ID?

- **Duplicate Prevention**: Built-in duplicate ID detection
- **Consistent Sequences**: Guaranteed sequential IDs
- **Easier Maintenance**: No manual ID tracking

### Pattern: Using autoIdArray

```typescript
import { autoIdArray } from '@/utils/dataAutoId';

const { data: price_data } = autoIdArray<PriceItem>([
    {
        page: 'home_1',
        title: 'Basic Plan',
        price: 99
    },
    {
        page: 'home_1',
        title: 'Pro Plan',
        price: 199
    }
], { startFrom: 1 });

// Result: IDs automatically assigned as 1, 2, 3, ...
```

### When to Use Auto-ID

| Scenario | Use Auto-ID? | Reason |
|-----------|---------------|---------|
| New data file | ✅ Yes | Easiest way to assign IDs |
| Large data file (>50 items) | ✅ Yes | Prevents duplicate IDs |
| Existing data file | ⚠️ Maybe | Requires migration (use startFrom for backward compatibility) |
| Small data file (<10 items) | ✅ Yes | Still easier than manual tracking |

## Data Validation

### Why Validate?

- **Build-Time Errors**: Catch data issues before deployment
- **Type Safety**: Ensure data matches interface
- **Integrity**: Prevent duplicate IDs, missing fields
- **Maintainability**: Clear error messages

### Adding a Validator

```typescript
import { createValidator } from '@/utils/dataValidation';
import { MinLengthRule } from '@/utils/dataValidation';

interface TestimonialItem extends BaseDataItem {
    name: string;
    rating: number;
    comment: string;
}

export const validateTestimonialItem = createValidator<TestimonialItem>({
    requiredFields: ['name', 'rating', 'comment', 'id', 'page'],
    rules: [
        { field: 'rating', rule: RangeRule(1, 5) },
        { field: 'name', rule: MinLengthRule(2) },
        { field: 'comment', rule: MinLengthRule(10) }
    ]
});

// Validate entire array
import { validateDataArray } from '@/utils/dataValidation';
const validation = validateDataArray(testimonial_data, validateTestimonialItem);
if (!validation.valid) {
    console.error('Data validation failed:', validation.errors);
}
```

### Available Validators

| Validator | Purpose | Example |
|-----------|---------|---------|
| `MinLengthRule` | Minimum string length | `{ field: 'name', rule: MinLengthRule(2) }` |
| `MaxLengthRule` | Maximum string length | `{ field: 'comment', rule: MaxLengthRule(500) }` |
| `RangeRule` | Number range | `{ field: 'rating', rule: RangeRule(1, 5) }` |
| `EmailRule` | Email format | `{ field: 'email', rule: EmailRule() }` |
| `DateRule` | Date format | `{ field: 'date', rule: DateRule() }` |
| `EnumRule` | Enum values | `{ field: 'status', rule: EnumRule(['active', 'inactive']) }` |

### Testing Data Files

```typescript
// src/data/__tests__/TestData.test.ts
import { validateTestData } from '../TestData';
import { validateDataArray } from '@/utils/dataValidation';

describe('TestData', () => {
    it('passes validation', () => {
        const validation = validateDataArray(test_data, validateTestData);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it('has no duplicate IDs', () => {
        const ids = test_data.map(item => item.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });
});
```

## Data Filtering

### Pattern: Filter by Page

```typescript
import { filterByPage } from '@/utils/dataFilters';
import { feature_data } from './FeatureData';

// Filter for specific page
const home_1_features = filterByPage(feature_data, 'home_1');
const pricing_features = filterByPage(feature_data, 'pricing');

// Export for component use
export const home_1_data = home_1_features;
export const pricing_data = pricing_features;
```

### Page Values

Use centralized page registry (VALID_PAGES in `src/data/relationships.ts`):

```typescript
type ValidPage = 
    | 'home_1' 
    | 'home_2' 
    | 'home_3'
    | 'pricing'
    | 'faq'
    | 'contact'
    // ... more pages
    ;

// Type-safe page filtering
export const home_1_features = filterByPage(feature_data, 'home_1');
```

### Pre-Filtered Exports vs Runtime Filtering

**Pre-Filtered Exports (Preferred)**:
```typescript
// Filtered at build time
export const home_1_feedback = filterByPage(feedback_data, 'home_1');

// Component uses pre-filtered data
import { home_1_feedback } from '@/data/FeedbackData';
```

**Runtime Filtering**:
```typescript
// Filtered at component render time
const feedback = filterByPage(feedback_data, 'home_1');

// More flexible, but less performant
```

## Data Relationships

### Adding Relationships

```typescript
// src/data/relationships.ts
import { DataRelationship } from '@/utils/dataRelationship';

export const RELATIONSHIPS: DataRelationship[] = [
    {
        sourceCollection: 'BlogCommentData',
        targetCollection: 'InnerBlogData',
        sourceField: 'blogId',
        targetField: 'id',
        type: 'many-to-one',
        optional: false
    },
    // ... more relationships
];
```

### Validating Relationships

```typescript
import { validateRelationships } from '@/utils/dataRelationship';
import { RELATIONSHIPS } from '@/data/relationships';

const validation = validateRelationships(
    [blogCommentData, innerBlogData],
    RELATIONSHIPS
);

if (!validation.valid) {
    console.error('Relationship validation failed:', validation.errors);
}
```

## Example: Creating a New Data File

### Scenario: Create Service Data File

```typescript
// src/data/ServiceData.ts
import { BaseDataItem } from '@/types/data';
import { createValidator } from '@/utils/dataValidation';
import { MinLengthRule, RangeRule } from '@/utils/dataValidation';
import { autoIdArray } from '@/utils/dataAutoId';
import { filterByPage } from '@/utils/dataFilters';

// 1. Define type
interface ServiceItem extends BaseDataItem {
    title: string;
    description: string;
    price: number;
    duration: string;
}

// 2. Create validator
export const validateServiceItem = createValidator<ServiceItem>({
    requiredFields: ['title', 'description', 'price', 'duration', 'id', 'page'],
    rules: [
        { field: 'title', rule: MinLengthRule(3) },
        { field: 'description', rule: MinLengthRule(10) },
        { field: 'price', rule: RangeRule(0, 10000) }
    ]
});

// 3. Create data with auto-ID
const { data: service_data } = autoIdArray<ServiceItem>([
    {
        page: 'services',
        title: 'Internet Installation',
        description: 'Professional installation at your location',
        price: 99,
        duration: '1-2 days'
    },
    {
        page: 'services',
        title: 'Network Setup',
        description: 'Configure network for optimal performance',
        price: 149,
        duration: '2-4 hours'
    },
    {
        page: 'pricing',
        title: 'Internet Installation',
        description: 'Professional installation at your location',
        price: 99,
        duration: '1-2 days'
    }
], { startFrom: 1 });

// 4. Filter by page
export const services_page_data = filterByPage(service_data, 'services');
export const pricing_services = filterByPage(service_data, 'pricing');

// 5. Default export
export default service_data;
```

### Creating Tests

```typescript
// src/data/__tests__/ServiceData.test.ts
import service_data from '../ServiceData';
import { validateServiceItem } from '../ServiceData';
import { validateDataArray, checkDuplicateIds } from '@/utils/dataValidation';

describe('ServiceData', () => {
    describe('Data Structure', () => {
        it('has correct type structure', () => {
            expect(service_data).toBeInstanceOf(Array);
            expect(service_data.length).toBeGreaterThan(0);
        });

        it('all items have required fields', () => {
            service_data.forEach(item => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('page');
                expect(item).toHaveProperty('title');
                expect(item).toHaveProperty('description');
                expect(item).toHaveProperty('price');
                expect(item).toHaveProperty('duration');
            });
        });
    });

    describe('Validation', () => {
        it('passes data validation', () => {
            const validation = validateDataArray(service_data, validateServiceItem);
            expect(validation.valid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('has no duplicate IDs', () => {
            const duplicateCheck = checkDuplicateIds(service_data);
            expect(duplicateCheck.hasDuplicates).toBe(false);
        });
    });

    describe('Filtering', () => {
        it('filters correctly by page', () => {
            const servicesData = service_data.filter(item => item.page === 'services');
            const pricingData = service_data.filter(item => item.page === 'pricing');

            expect(servicesData.length).toBeGreaterThan(0);
            expect(pricingData.length).toBeGreaterThan(0);
            expect(servicesData.every(item => item.page === 'services')).toBe(true);
        });
    });
});
```

## Best Practices

### 1. Use Auto-ID for New Files

```typescript
// Good: Auto-ID
const { data: new_data } = autoIdArray<NewItem>([...items]);

// Bad: Manual ID assignment
const new_data: NewItem[] = [
    { id: 1, ... },
    { id: 2, ... }  // Easy to make mistakes
];
```

### 2. Extend BaseDataItem for Multi-Page Data

```typescript
// Good: Extends BaseDataItem
interface FeatureItem extends BaseDataItem {
    title: string;
}

// Bad: No page field (cannot filter)
interface FeatureItem {
    id: number;
    title: string;
}
```

### 3. Create Validators

```typescript
// Good: Has validator
export const validateFeatureItem = createValidator<FeatureItem>({...});

// Bad: No validation (data issues only caught at runtime)
```

### 4. Export Pre-Filtered Data

```typescript
// Good: Pre-filtered at build time
export const home_1_features = filterByPage(feature_data, 'home_1');

// Bad: Component filters at runtime (less efficient)
```

### 5. Type Everything

```typescript
// Good: Strongly typed
interface ServiceItem extends BaseDataItem { ... }
const service_data: ServiceItem[] = [...];

// Bad: Type inference (less safe)
const service_data = [...];
```

## Data File Checklist

Before creating a new data file:

- [ ] Define TypeScript interface extending `BaseDataItem` (if page-filtered)
- [ ] Create validator with `createValidator` utility
- [ ] Use `autoIdArray` for automatic ID generation
- [ ] Add page field to items (if multi-page data)
- [ ] Export pre-filtered data for common pages
- [ ] Write tests for validation and structure
- [ ] Add relationship configuration (if applicable)
- [ ] Run `npm test` to verify validation passes

## Troubleshooting

### Issue: Validation Fails

**Problem**: `validateDataArray` returns errors

**Solution**:
1. Check required fields are present
2. Verify field types match interface
3. Check custom rules (min length, range, etc.)

### Issue: Duplicate IDs

**Problem**: `checkDuplicateIds` reports duplicates

**Solution**:
1. Use `autoIdArray` instead of manual ID assignment
2. Verify unique IDs if manually assigned
3. Check for copy-paste errors

### Issue: Filter Returns Empty Array

**Problem**: `filterByPage` returns no items

**Solution**:
1. Verify page value matches `VALID_PAGES` registry
2. Check data items have correct `page` field
3. Ensure page values use underscores (e.g., `home_1`, not `home-1`)

## Additional Resources

- [Blueprint - Data Architecture](../blueprint.md#data-architecture)
- [Blueprint - Data Validation](../blueprint.md#data-validation--completed---task-40-phase-1)
- [Blueprint - Data Relationships](../blueprint.md#data-relationship-management--completed---phase-3)
- [Testing Guide](../testing-guide.md)
- [Component Development Guide](../component-development-guide.md)
