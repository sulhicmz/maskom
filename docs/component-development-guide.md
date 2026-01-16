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
│   ├── BackgroundSection.tsx
│   ├── FormField.tsx
│   ├── ExportButton.tsx
│   ├── ThemeToggle.tsx
│   ├── ProtectedRoute.tsx
│   ├── BookmarkButton.tsx
│   ├── SocialShareButtons.tsx
│   ├── PricingCard.tsx
│   ├── PricingTabs.tsx
│   ├── JsonLd.tsx
│   ├── ErrorBoundary.tsx
│   ├── Brand.tsx
│   ├── Breadcrumb.tsx
│   ├── ScrollToTop.tsx
│   └── SkipToMainContent.tsx
├── homes/           # Home page variants (home-one, home-two, etc.)
├── pages/           # Page-specific components (pricing, faq, teams, etc.)
├── forms/           # Form components (ContactForm, LoginForm, NewsletterForm, etc.)
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

### 7. ExportButton

Use `ExportButton` to export filtered blog content in PDF or CSV format.

```typescript
import ExportButton from '@/components/common/ExportButton';
import type { InnerBlogPost } from '@/types/data';

<ExportButton
    posts={filteredPosts}
    filterCriteria={filterCriteria}
    buttonClassName="custom-export-btn"
/>
```

**Props**: `ExportButtonProps` (see `src/components/common/ExportButton.tsx`)

**Benefits**:
- Supports PDF export with jsPDF for professional documents
- Supports CSV export for data analysis
- Includes metadata (filters, result count) in exports
- Toast notifications for user feedback
- Keyboard navigation and ARIA attributes for accessibility
- React.memo optimization (Task 237)

### 8. ThemeToggle

Use `ThemeToggle` to switch between light and dark mode.

```typescript
import ThemeToggle from '@/components/common/ThemeToggle';

<ThemeToggle />
```

**Features**:
- System preference detection (automatically matches user's OS theme)
- Manual theme switching with sun/moon icons
- localStorage persistence for theme preference
- Smooth transitions (0.3s ease)
- Full accessibility support (ARIA labels)
- ThemeContext integration (Task 203)

**Benefits**:
- Seamless dark mode experience
- Respects user system preferences
- Consistent theme across sessions
- No flash of unstyled content

### 9. ProtectedRoute

Use `ProtectedRoute` to wrap components requiring authentication or specific roles/permissions.

```typescript
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';

// Route-level protection
<ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
    <AnalyticsDashboard />
</ProtectedRoute>

// Role-based protection
<ProtectedRoute requiredRole="admin">
    <AdminPanel />
</ProtectedRoute>

// Multiple permissions (all required)
<ProtectedRoute requiredPermissions={[Permission.MANAGE_CONTENT, Permission.PUBLISH_CONTENT]}>
    <ContentEditor />
</ProtectedRoute>
```

**Props**: `ProtectedRouteProps` (see `src/components/common/ProtectedRoute.tsx`)

**Benefits**:
- Declarative route protection
- Automatic redirect to login if unauthenticated
- Automatic redirect to dashboard if unauthorized
- Loading states during authentication checks
- Support for multiple permission requirements
- RBAC integration (Task 223)

### 10. NewsletterForm

Use `NewsletterForm` for newsletter subscription with form validation.

```typescript
import NewsletterForm from '@/components/forms/NewsletterForm';

<NewsletterForm
    className="newsletter-wrapper"
    buttonClassName="gradient-btn"
/>
```

**Features**:
- Email validation with Yup schema
- Loading states during submission
- Success/error feedback with Toast notifications
- Focus management for screen readers
- ARIA live regions for accessibility
- Form reset after successful subscription

**Benefits**:
- Ready-to-use newsletter form
- WCAG 2.1 Level AA/AA compliance
- 23 comprehensive tests (Task 236)
- Consistent with other form patterns

### 11. BookmarkButton

Use `BookmarkButton` to allow users to bookmark blog posts with localStorage persistence.

```typescript
import BookmarkButton from '@/components/common/BookmarkButton';

<BookmarkButton
    postId="1"
    postTitle="How to Optimize Your Network"
    postSlug="how-to-optimize-network"
    postCategory="Konektivitas Terkelola"
    postTags={["network", "optimization"]}
    className="bookmark-btn"
    onBookmarkChange={(isBookmarked) => console.log(isBookmarked)}
/>
```

**Props**: `BookmarkButtonProps` (see `src/components/common/BookmarkButton.tsx`)

**Features**:
- localStorage-based bookmark persistence
- Visual bookmark state (filled/outline icon)
- Automatic bookmark detection on mount
- Full accessibility support (ARIA pressed, labels)
- Callback for bookmark state changes

**Benefits**:
- No backend required for bookmarks
- User bookmarks persist across sessions
- Easy integration with blog components

### 12. SocialShareButtons

Use `SocialShareButtons` to enable social media sharing of content.

```typescript
import SocialShareButtons from '@/components/common/SocialShareButtons';

<SocialShareButtons
    title="My Blog Post"
    url="https://maskom.co.id/blog-details?id=1"
    text="Check out this amazing post about network optimization!"
    className="share-buttons"
    ariaLabel="Share this article"
/>
```

**Props**: `SocialShareButtonsProps` (see `src/components/common/SocialShareButtons.tsx`)

**Features**:
- Facebook, Twitter, LinkedIn, Instagram sharing
- Automatic URL encoding
- Custom share text support
- Opens share dialog in new window
- Keyboard navigation support
- ARIA attributes for accessibility
- React.memo optimization

**Benefits**:
- Ready-to-use social sharing
- Consistent social sharing behavior
- No external dependencies required

### 13. PricingCard & PricingTabs

Use `PricingCard` for individual pricing plan cards and `PricingTabs` for pricing tab switching.

```typescript
import { PricingCard } from '@/components/common/PricingCard';
import { PricingTabs } from '@/components/common/PricingTabs';

<PricingTabs>
    <PricingCard
        title="Basic"
        price="Rp 500.000"
        period="/month"
        features={["Feature 1", "Feature 2", "Feature 3"]}
        buttonText="Choose Basic"
        buttonLink="/contact"
        active={false}
    />
    <PricingCard
        title="Pro"
        price="Rp 1.500.000"
        period="/month"
        features={["Feature 1", "Feature 2", "Feature 3", "Feature 4"]}
        buttonText="Choose Pro"
        buttonLink="/contact"
        active={true}
    />
</PricingTabs>
```

**Benefits**:
- Eliminates duplicate pricing card code (2 components using same pattern)
- Consistent pricing display across pages
- Currency formatting support
- React.memo optimization (Task 85)

### 14. JsonLd

Use `JsonLd` to inject Schema.org structured data for SEO.

```typescript
import JsonLd from '@/components/common/JsonLd';
import { generateBlogPostSchema } from '@/utils/seo';

const BlogDetailsPage = ({ post }) => {
    const schema = generateBlogPostSchema(post, canonicalUrl, "https://maskom.co.id");

    return (
        <>
            <JsonLd data={schema} />
            <BlogDetails post={post} />
        </>
    );
};
```

**Props**: `JsonLdProps` (see `src/components/common/JsonLd.tsx`)

**Features**:
- Type-safe JSON-LD script injection
- Handles nested objects and arrays
- Supports Schema.org Article, Organization, and other schemas
- Essential for Google Rich Snippets (Task 220)

**Benefits**:
- Improves search engine visibility
- Enables Google Rich Snippets
- Better social media link previews
- No manual JSON-LD syntax required

### 15. ErrorBoundary

Use `ErrorBoundary` to wrap components and handle errors gracefully.

```typescript
import ErrorBoundary from '@/components/common/ErrorBoundary';

<ErrorBoundary
    fallback={
        <div className="error-container">
            <h2>Something went wrong</h2>
            <p>We're sorry, but an error occurred while rendering this page.</p>
            <button onClick={() => window.location.reload()}>Reload Page</button>
            <button onClick={() => window.history.back()}>Go Back</button>
        </div>
    }
>
    <ComponentThatMayError />
</ErrorBoundary>
```

**Props**: `ErrorBoundaryProps` (see `src/components/common/ErrorBoundary.tsx`)

**Features**:
- Catches component errors and displays fallback
- Error logging with unique error IDs
- Recovery options (reload, go back)
- Custom fallback UI support
- Integrates with Toast notifications

**Benefits**:
- Graceful error handling
- Prevents entire app crash
- Better user experience
- Easier debugging with error IDs

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
- [ ] Can I use `ExportButton` for exporting data (PDF/CSV)?
- [ ] Can I use `ThemeToggle` for dark mode?
- [ ] Can I use `ProtectedRoute` for route protection?
- [ ] Can I use `BookmarkButton` for bookmarking content?
- [ ] Can I use `SocialShareButtons` for social sharing?
- [ ] Can I use `PricingCard` for pricing plans?
- [ ] Can I use `JsonLd` for SEO structured data?
- [ ] Can I use `ErrorBoundary` for error handling?
- [ ] Can I use data from `src/data/*.ts` instead of hardcoding?

## Additional Resources

- [Testing Guide](../testing-guide.md) - Comprehensive testing patterns
- [Blueprint](../blueprint.md) - Architecture overview and patterns
- [Data Architecture](../blueprint.md#data-architecture) - Data-driven patterns
- [Validation Guide](../blueprint.md#data-validation--completed---task-40-phase-1) - Data validation
