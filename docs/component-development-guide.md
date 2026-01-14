# Component Development Guide

This guide explains how to create and maintain components in the Maskom codebase following established patterns and best practices.

## Overview

Maskom uses a **data-driven component architecture** where:
- Components consume data from `src/data/*.ts` files
- Reusable abstractions (CtaWrapper, PageBuilder, etc.) eliminate code duplication
- Components follow consistent patterns for accessibility, testing, and styling

## Component Organization

### Directory Structure

Components are organized by category:

```
src/components/
├── common/          # Reusable components used across multiple pages
│   ├── CtaWrapper.tsx
│   ├── PageBuilder.tsx
│   ├── SectionTitle.tsx
│   ├── AnimationWrapper.tsx
│   └── BackgroundSection.tsx
├── homes/           # Home page variants (home-one, home-two, etc.)
├── pages/           # Page-specific components (pricing, faq, teams, etc.)
├── forms/           # Form components (ContactForm, LoginForm, etc.)
├── blogs/           # Blog-related components
├── about/           # About page components
├── dashboard/       # Dashboard components
└── layouts/         # Layout components (Header, Footer, Wrapper)
```

### Component File Pattern

Each component follows this structure:

```
src/components/[category]/[component]/
├── index.tsx              # Component implementation
├── __tests__/
│   └── [component].test.tsx  # Component tests
└── [component].types.ts   # Type definitions (if complex)
```

## Reusable Component Abstractions

### 1. CtaWrapper

Use `CtaWrapper` for all call-to-action sections.

```typescript
import CtaWrapper from '@/components/common/CtaWrapper';

<CtaWrapper
    heading="Ready to upgrade?"
    description="Contact us for a consultation."
    buttonText="Get in Touch"
    buttonLink="/contact"
    images={[{ src: image1, alt: "Illustration" }]}
    animation="fadeInLeft"
    animationType="animation-wrapper"
/>
```

**Props**: `CtaProps` (see `src/components/common/CtaWrapper.tsx`)

**Benefits**:
- Eliminates duplicate CTA code (51% code reduction)
- Supports both AnimationWrapper and wow.js animations
- React.memo optimization

### 2. PageBuilder

Use `PageBuilder` for page layout structure.

```typescript
import { PageBuilder } from '@/components/common/PageBuilder';

// Single content variant
<PageBuilder
    title="Contact Us"
    subTitle="We'd love to hear from you"
    content={<ContactForm />}
    footer="one"
/>

// Multi-section variant
<PageBuilderWithSections
    title="Pricing Plans"
    subTitle="Choose the right plan for you"
    sections={[
        <PricingArea />,
        <Testimonials />,
        <FaqSection />
    ]}
    footer="two"
/>
```

**Benefits**:
- Eliminates 23 lines of duplicate boilerplate code per page
- Consistent layout across all pages
- Type-safe configuration

### 3. SectionTitle

Use `SectionTitle` for section headers.

```typescript
import SectionTitle from '@/components/common/SectionTitle';

<SectionTitle
    heading="Our Services"
    subHeading="What we offer"
    description="We provide comprehensive connectivity solutions"
    alignment="center"
    animation="fadeInUp"
    animationType="wow"
/>
```

**Benefits**:
- Consistent section headers across entire app
- Supports both AnimationWrapper and wow.js animations
- Eliminates duplicate section title code

### 4. AnimationWrapper

Use `AnimationWrapper` for React-based animations.

```typescript
import AnimationWrapper from '@/components/common/AnimationWrapper';

<AnimationWrapper
    id="hero-section"
    animation="fadeIn"
    role="region"
    aria-label="Hero section"
>
    <HeroContent />
</AnimationWrapper>
```

**Benefits**:
- Reusable animation container
- Built-in accessibility support
- React-based (no wow.js dependency)

### 5. BackgroundSection

Use `BackgroundSection` for sections with background images.

```typescript
import BackgroundSection from '@/components/common/BackgroundSection';

<BackgroundSection
    backgroundImage="/assets/images/bg/section-bg.webp"
    className="py-80"
>
    <SectionContent />
</BackgroundSection>
```

### 6. FormField

Use `FormField` for form inputs (email, password, name, text).

```typescript
import FormField from '@/components/common/FormField';

<FormField
    type="email"
    name="email"
    label="Email Address"
    placeholder="your@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error={errors.email}
    required
    showCharCount
    maxLength={100}
/>
```

**Benefits**:
- Eliminates duplicate form input code across 4 forms
- Comprehensive accessibility features
- 100+ tests covering all scenarios

## Data-Driven Components

### Pattern: Filter Data by Page

Components filter data using the `page` field:

```typescript
import { testi_data } from '@/data/FeedbackData';
import { filterByPage } from '@/utils/dataFilters';

// Filter feedback for home page
const homeFeedback = filterByPage(testi_data, 'home_1');

// Render filtered data
homeFeedback.map(item => (
    <FeedbackCard key={item.id} {...item} />
));
```

### Pattern: Import Data Directly

For global data (no page filter):

```typescript
import team_data from '@/data/TeamData';

team_data.map(member => (
    <TeamMember key={member.id} {...member} />
));
```

### Data Access Patterns

| Pattern | Use Case | Example |
|---------|-----------|---------|
| Direct import | Global data | TeamData, MenuData |
| Filter by page | Page-specific data | FeedbackData, FaqData |
| Pre-filtered export | Reuse filtered data | `home_1_feedback` from FeedbackData |

## Component Patterns

### Pattern 1: Functional Component with Props

```typescript
interface ComponentProps {
    title: string;
    description: string;
    items: ItemType[];
    className?: string;
}

const Component = ({ title, description, items, className = '' }: ComponentProps) => {
    return (
        <section className={className}>
            <h2>{title}</h2>
            <p>{description}</p>
            {items.map(item => <Item key={item.id} {...item} />)}
        </section>
    );
};

export default Component;
```

### Pattern 2: React Component with State

```typescript
import { useState, useCallback } from 'react';

const Component = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = useCallback((index: number) => {
        setActiveTab(index);
    }, []);

    return (
        <div>
            {tabs.map((tab, index) => (
                <button
                    key={index}
                    onClick={() => handleTabChange(index)}
                    className={activeTab === index ? 'active' : ''}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default Component;
```

### Pattern 3: Client-Side Component

```typescript
'use client';

import { useState } from 'react';

const ClientComponent = () => {
    const [count, setCount] = useState(0);

    return <div onClick={() => setCount(c => c + 1)}>Count: {count}</div>;
};

export default ClientComponent;
```

### Pattern 4: Component with Hooks

```typescript
'use client';

import { useTabs } from '@/hooks/useTabs';
import { useFormSubmission } from '@/hooks/useFormSubmission';

const FormComponent = () => {
    const { activeTab, handleTabChange } = useTabs(0);
    const { isSubmitting, handleSubmit } = useFormSubmission({
        onSubmit: async (data) => {
            // Submit form
        }
    });

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
        </form>
    );
};

export default FormComponent;
```

## Accessibility Best Practices

### 1. ARIA Attributes

```typescript
// Tab system
<button
    role="tab"
    aria-selected={activeTab === index}
    aria-controls={`panel-${index}`}
    tabIndex={activeTab === index ? 0 : -1}
>
    {tab}
</button>

// Tab panel
<div
    role="tabpanel"
    aria-labelledby={`tab-${index}`}
    id={`panel-${index}`}
>
    {content}
</div>
```

### 2. Keyboard Navigation

```typescript
const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
        case 'ArrowRight':
            e.preventDefault();
            handleTabChange((index + 1) % tabs.length);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            handleTabChange((index - 1 + tabs.length) % tabs.length);
            break;
        case 'Home':
            e.preventDefault();
            handleTabChange(0);
            break;
        case 'End':
            e.preventDefault();
            handleTabChange(tabs.length - 1);
            break;
    }
}, [handleTabChange]);
```

### 3. Semantic HTML

```typescript
// Use semantic elements
<section aria-labelledby="services-heading">
    <h2 id="services-heading">Our Services</h2>
    <ul role="list">
        <li>Service 1</li>
        <li>Service 2</li>
    </ul>
</section>

// Use proper alt text for images
<img
    src={image.src}
    alt={`Photo of ${member.name} - ${member.designation}`}
    loading="lazy"
/>
```

### 4. Form Accessibility

```typescript
<label htmlFor="email-input">Email Address</label>
<input
    id="email-input"
    type="email"
    name="email"
    required
    aria-describedby="email-help"
    aria-invalid={!!errors.email}
    aria-errormessage={errors.email ? 'email-error' : undefined}
/>
<span id="email-help">Enter your email address</span>
{errors.email && (
    <span id="email-error" role="alert">{errors.email}</span>
)}
```

## Component Testing

### Testing Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './index';

describe('Component', () => {
    const mockItems = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
    ];

    it('renders correctly with items', () => {
        render(<Component title="Test" items={mockItems} />);
        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('calls callback on click', () => {
        const handleClick = jest.fn();
        render(<Component items={mockItems} onClick={handleClick} />);
        
        fireEvent.click(screen.getByText('Item 1'));
        expect(handleClick).toHaveBeenCalledWith(mockItems[0]);
    });

    it('handles empty items', () => {
        render(<Component title="Test" items={[]} />);
        expect(screen.getByText('No items available')).toBeInTheDocument();
    });
});
```

### Accessibility Testing

```typescript
it('has correct ARIA attributes', () => {
    render(<Tab tabs={['Tab 1', 'Tab 2']} activeTab={0} />);
    
    const tabButtons = screen.getAllByRole('tab');
    expect(tabButtons[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabButtons[1]).toHaveAttribute('aria-selected', 'false');
});

it('supports keyboard navigation', () => {
    render(<Tab tabs={['Tab 1', 'Tab 2']} activeTab={0} onChange={mockChange} />);
    
    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    fireEvent.keyDown(tab, { key: 'ArrowRight' });
    
    expect(mockChange).toHaveBeenCalledWith(1);
});
```

## Performance Optimization

### React.memo Usage

Only use `React.memo` when component has props that change infrequently:

```typescript
// Good - Component has props, benefits from memoization
const Item = React.memo(({ title, description }: ItemProps) => {
    return <div><h3>{title}</h3><p>{description}</p></div>;
});

// Bad - Component has no props, memoization provides zero benefit
const Component = React.memo(() => {
    return <div>Static content</div>;
});
```

### useCallback for Handlers

Wrap event handlers with `useCallback` to prevent unnecessary re-renders:

```typescript
const handleClick = useCallback((item: Item) => {
    onSelect(item);
}, [onSelect]);
```

### Dynamic Imports

Lazy-load non-critical components:

```typescript
import dynamic from 'next/dynamic';

const VideoPopup = dynamic(() => import('@/components/modals/VideoPopup'), {
    loading: () => <div>Loading...</div>
});
```

## Styling Patterns

### CSS Modules vs Tailwind

Maskom uses Bootstrap classes + custom SCSS:

```typescript
// Use Bootstrap classes
<div className="container py-80">
    <div className="row">
        <div className="col-md-4">...</div>
        <div className="col-md-8">...</div>
    </div>
</div>

// Import custom SCSS from public/assets/
import '@/public/assets/scss/style.scss';
```

### Asset Loading

Use `@/assets/*` alias for static assets:

```typescript
import Image from 'next/image';
import heroImage from '@/assets/images/home/hero.webp';

<Image src={heroImage} alt="Hero" width={1200} height={600} />
```

## Common Patterns

### Pattern 1: List Rendering

```typescript
// Good: Use stable keys (item.id)
items.map(item => (
    <Item key={item.id} {...item} />
));

// Bad: Use index as key (causes issues on reorder)
items.map((item, index) => (
    <Item key={index} {...item} />
));
```

### Pattern 2: Conditional Rendering

```typescript
// Good: Early return for null/undefined
if (!data || data.length === 0) {
    return <EmptyState />;
}

return <List items={data} />;

// Bad: Nested ternary
return (
    <div>
        {data && data.length > 0 ? (
            <List items={data} />
        ) : (
            <EmptyState />
        )}
    </div>
);
```

### Pattern 3: Error Boundaries

Wrap components in ErrorBoundary for graceful error handling:

```typescript
<ErrorBoundary
    fallback={
        <div className="error-container">
            <h2>Something went wrong</h2>
            <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
    }
>
    <Component />
</ErrorBoundary>
```

## Component Creation Checklist

Before creating a new component, check if existing abstractions can be used:

- [ ] Can I use `CtaWrapper` for this CTA?
- [ ] Can I use `PageBuilder` for this page layout?
- [ ] Can I use `SectionTitle` for this section header?
- [ ] Can I use `AnimationWrapper` for this animation?
- [ ] Can I use `FormField` for this form input?
- [ ] Can I use data from `src/data/*.ts` instead of hardcoding?

## Additional Resources

- [Testing Guide](../testing-guide.md) - Comprehensive testing patterns
- [Blueprint](../blueprint.md) - Architecture overview and patterns
- [Data Architecture](../blueprint.md#data-architecture) - Data-driven patterns
- [Validation Guide](../blueprint.md#data-validation--completed---task-40-phase-1) - Data validation
