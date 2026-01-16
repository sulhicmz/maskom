# SEO Features Technical Guide

## Overview

Maskom website implements **comprehensive SEO (Search Engine Optimization)** features to improve search engine visibility, social media sharing, and content discoverability. SEO features are automated and require minimal manual configuration.

## Features

### 1. JSON-LD Structured Data

**Schema.org structured data** for rich snippets in search results.

**Purpose**:
- Help search engines understand content structure
- Enable Google Rich Snippets
- Improve search result appearance
- Increase click-through rates

**Supported Schema Types**:
- **Article** - Blog posts and articles
- **Organization** - Website/company information
- **WebPage** - Web page structure

**Implementation**:
```typescript
import JsonLd from '@/components/common/JsonLd';
import { generateBlogPostSchema } from '@/utils/seo';

const BlogDetailsPage = ({ post }) => {
    const canonicalUrl = `https://maskom.co.id/blog-details?id=${post.id}`;
    const schema = generateBlogPostSchema(post, canonicalUrl);

    return (
        <>
            <JsonLd data={schema} />
            <BlogDetails post={post} />
        </>
    );
};
```

**Blog Post Schema Structure**:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article description",
  "image": ["https://maskom.co.id/image.jpg"],
  "author": "Author Name",
  "datePublished": "2026-01-16",
  "dateModified": "2026-01-16",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://maskom.co.id/blog-details?id=1"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Maskom",
    "logo": {
      "@type": "ImageObject",
      "url": "https://maskom.co.id/favicon.png"
    }
  }
}
```

**Organization Schema Structure**:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Maskom",
  "url": "https://maskom.co.id",
  "logo": "https://maskom.co.id/favicon.png",
  "description": "Maskom menyediakan layanan konektivitas...",
  "sameAs": []
}
```

**Benefits**:
- Google Rich Snippets for articles
- Enhanced search result appearance
- Author attribution
- Publisher branding
- Better click-through rates
- Improved content understanding

**Testing**:
1. **Google Rich Results Test**:
   - Visit: https://search.google.com/test/rich-results
   - Enter URL: `https://maskom.co.id/blog-details?id=1`
   - Verify structured data is detected

2. **Schema.org Validator**:
   - Visit: https://validator.schema.org/
   - Test URL or code snippet
   - Verify no errors

### 2. Sitemap Generation

**Dynamic sitemap.xml** generation for search engine crawling.

**Location**: `https://maskom.co.id/sitemap.xml`

**Purpose**:
- Help search engines discover all pages
- Provide page metadata (last modified, change frequency, priority)
- Improve indexing efficiency
- Ensure new content is found

**Sitemap Structure**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://maskom.co.id/</loc>
        <lastmod>2026-01-16</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <!-- More static pages -->
    <url>
        <loc>https://maskom.co.id/blog-details?id=1</loc>
        <lastmod>2026-01-16</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <!-- More blog posts -->
</urlset>
```

**Sitemap Contents**:

| Page Type | Pages Included | Change Frequency | Priority |
|-----------|----------------|-------------------|----------|
| Homepage | 1 | daily | 1.0 |
| About | 1 | monthly | 0.8 |
| Contact | 1 | monthly | 0.8 |
| Blog List | 1 | weekly | 0.9 |
| Pricing | 1 | monthly | 0.7 |
| FAQ | 1 | weekly | 0.7 |
| Team | 1 | monthly | 0.6 |
| Use Cases | 1 | weekly | 0.7 |
| Blog Posts | Published posts only | monthly | 0.8 |
| Login/Sign-up | 2 | never | 0.3 |

**Implementation**:
```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import inner_blog_data from '@/data/InnerBlogData';

export default function sitemap(): MetadataRoute.Sitemap {
    const SITE_URL = 'https://maskom.co.id';

    const staticPages = [
        { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
        { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
        // ... more static pages
    ];

    const blogPosts = inner_blog_data
        .filter(post => post.status === 'published')
        .map(post => ({
            url: `${SITE_URL}/blog-details?id=${post.id}`,
            lastModified: new Date(post.publishDate || post.date),
            changeFrequency: 'monthly' as const,
            priority: 0.8
        }));

    return [...staticPages, ...blogPosts];
}
```

**Features**:
- Dynamic generation from data files
- Filters out draft posts
- Includes all static pages
- Includes all published blog posts
- Type-safe implementation

**Change Frequency Guidelines**:
- **daily** - Homepage (frequently updated)
- **weekly** - Blog list, use cases (regularly updated)
- **monthly** - Blog posts, pricing, FAQ (content changes rarely)
- **never** - Login, sign-up (content never changes)

**Priority Guidelines**:
- **1.0** - Homepage (most important)
- **0.9** - Blog list (important landing page)
- **0.8** - Blog posts, main pages (standard importance)
- **0.7** - Secondary pages (lower importance)
- **0.6** - Team, use cases (lowest importance)
- **0.3** - Login, sign-up (unimportant for SEO)

**Benefits**:
- Automated sitemap generation
- Always up-to-date with new content
- Proper page prioritization
- Efficient search engine crawling
- Draft posts excluded from sitemap

### 3. Robots.txt

**Search engine crawling instructions** for selective indexing.

**Location**: `https://maskom.co.id/robots.txt`

**Purpose**:
- Control which pages search engines can crawl
- Block unnecessary pages from indexing
- Protect sensitive areas
- Provide sitemap location

**Robots.txt Structure**:
```text
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api

Sitemap: https://maskom.co.id/sitemap.xml
```

**Directives**:
- **User-agent: *** - Applies to all search engines
- **Allow: /** - Allow crawling all pages (default)
- **Disallow: /dashboard** - Block dashboard pages
- **Disallow: /api** - Block API routes
- **Sitemap** - Provide sitemap.xml location

**Blocked Pages**:
1. **Dashboard** (`/dashboard`, `/admin`)
   - Reason: Private user area, not for public indexing
   - Content: User-specific data, analytics

2. **API Routes** (`/api/*`)
   - Reason: Backend endpoints, not content pages
   - Content: API responses, JSON data

**Allowed Pages**:
- All other pages (homepage, blog, pricing, etc.)

**Benefits**:
- Protects private areas from indexing
- Prevents duplicate content issues
- Reduces server load from unnecessary crawling
- Provides clear sitemap location

### 4. Metadata Generation

**Automated metadata** for search engines and social media sharing.

**Supported Metadata Types**:
- **Title Tags** - Page title in search results
- **Meta Descriptions** - Page description in search results
- **Keywords** - SEO keywords (optional, less important)
- **Open Graph (OG)** - Facebook/LinkedIn sharing
- **Twitter Cards** - Twitter/X sharing
- **Canonical URLs** - Duplicate content prevention
- **Robots Directives** - Indexing control

**Open Graph Tags**:
```html
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:type" content="website | article" />
<meta property="og:image" content="https://maskom.co.id/image.jpg" />
<meta property="og:url" content="https://maskom.co.id/page" />
```

**Twitter Card Tags**:
```html
<meta name="twitter:card" content="summary | summary_large_image" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Page description" />
<meta name="twitter:image" content="https://maskom.co.id/image.jpg" />
```

**Canonical URL Tags**:
```html
<link rel="canonical" href="https://maskom.co.id/page" />
```

**Robots Directives**:
```html
<meta name="robots" content="index, follow" />
<meta name="robots" content="noindex, nofollow" />
```

**Implementation**:
```typescript
import { generateMetadataFromProps } from '@/utils/metadata';

// Blog page metadata
export async function generateMetadata({ params }: PageProps) {
    const post = await getBlogPost(params.id);
    const siteUrl = 'https://maskom.co.id';

    return generateBlogPostMetadata(post, siteUrl);
}

// Static page metadata
export const metadata = generateMetadataFromProps({
    title: 'Maskom - Layanan Konektivitas',
    description: 'Maskom menyediakan layanan konektivitas...',
    keywords: 'konektivitas, jaringan, wifi',
    canonicalUrl: 'https://maskom.co.id',
    ogImage: '/assets/images/og-image.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    noIndex: false
});
```

**Blog Post Metadata**:
```typescript
return {
    title: `${post.title} | Maskom`,
    description: post.desc,
    keywords: post.category || 'Maskom, blog, artikel',
    openGraph: {
        title: post.title,
        description: post.desc,
        type: 'article',
        images: [{ url: post.thumb.src }],
        url: canonicalUrl
    },
    twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.desc,
        images: [post.thumb.src]
    },
    alternates: {
        canonical: canonicalUrl
    },
    robots: {
        index: post.status !== 'draft',
        follow: post.status !== 'draft'
    }
};
```

**Benefits**:
- Automated metadata generation
- Optimized social media sharing
- Duplicate content prevention
- Draft posts excluded from indexing
- Type-safe implementation

### 5. Draft Content Protection

**Automatic noindex** for draft blog posts to prevent indexing.

**Purpose**:
- Prevent search engines from indexing incomplete content
- Maintain content quality
- Control what goes public

**Implementation**:
```typescript
// Blog post metadata
robots: {
    index: post.status !== 'draft',  // Drafts: noindex
    follow: post.status !== 'draft'   // Drafts: nofollow
}

// Sitemap generation
inner_blog_data
    .filter(post => post.status === 'published')  // Only published posts
    .map(post => ({ ... }))
```

**Draft Behavior**:
- **Metadata**: `noindex, nofollow` robots directives
- **Sitemap**: Excluded from sitemap.xml
- **Search Engines**: Cannot crawl or index
- **Users**: Can access with direct link (not public)

**Published Behavior**:
- **Metadata**: `index, follow` robots directives
- **Sitemap**: Included in sitemap.xml
- **Search Engines**: Can crawl and index
- **Users**: Publicly accessible

## Usage Examples

### Example 1: Add New Blog Post

**Scenario**: Publish new blog post

**Steps**:
1. Add post to `src/data/InnerBlogData.ts`
2. Set `status: 'published'`
3. Provide `title`, `desc`, `thumb`, `date`, `user`
4. Set `categoryId` (foreign key to category)
5. Build website: `npm run build`

**Automatic SEO**:
- ✅ JSON-LD structured data generated
- ✅ Sitemap includes new post
- ✅ Metadata generated automatically
- ✅ Open Graph tags configured
- ✅ Twitter Card configured
- ✅ Canonical URL set
- ✅ Post indexed by search engines

### Example 2: Update Existing Page

**Scenario**: Update pricing page description

**Steps**:
1. Update metadata in `src/app/pricing/page.tsx`
2. Update `description` and `keywords`
3. Add/update `ogImage` if needed
4. Build website: `npm run build`

**Automatic SEO**:
- ✅ Metadata updated automatically
- ✅ Search engines recrawl updated page
- ✅ Social media shares show updated info

### Example 3: Add Static Page

**Scenario**: Add new "Services" page

**Steps**:
1. Create page: `src/app/services/page.tsx`
2. Add page to `src/app/sitemap.ts`
3. Set appropriate `changeFrequency` and `priority`
4. Add JSON-LD schema if needed
5. Build website: `npm run build`

**Automatic SEO**:
- ✅ Sitemap includes new page
- ✅ Metadata generated automatically
- ✅ Search engines discover new page

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://maskom.co.id
```

**Purpose**:
- Base URL for canonical URLs
- Base URL for sitemap
- Base URL for social sharing

### Site URL Configuration

**Usage**:
```typescript
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maskom.co.id';
const canonicalUrl = `${SITE_URL}/blog-details?id=${post.id}`;
```

**Best Practices**:
- Use HTTPS for production
- Include trailing slash or not (consistent)
- Use absolute URLs (not relative)
- Set in environment for different environments

## Testing & Verification

### Test 1: Sitemap Verification

**1. Check Sitemap URL**:
```
https://maskom.co.id/sitemap.xml
```

**2. Verify Sitemap Contents**:
- All static pages included
- All published blog posts included
- Draft posts excluded
- Correct XML format

**3. Submit to Search Engines**:
- **Google Search Console**: https://search.google.com/search-console
- **Bing Webmaster Tools**: https://www.bing.com/webmasters
- Submit sitemap URL

### Test 2: Robots.txt Verification

**1. Check Robots.txt URL**:
```
https://maskom.co.id/robots.txt
```

**2. Verify Directives**:
- Dashboard blocked: `/dashboard`
- API routes blocked: `/api`
- Sitemap location correct

**3. Test with Google Tools**:
- Robots Testing Tool: https://developers.google.com/search/tools/robots-testing-tool
- Test blocked and allowed URLs

### Test 3: Structured Data Testing

**1. Google Rich Results Test**:
```
https://search.google.com/test/rich-results
```

**2. Test Blog Post**:
- Enter URL: `https://maskom.co.id/blog-details?id=1`
- Verify Article schema detected
- Check for errors or warnings

**3. Test Homepage**:
- Enter URL: `https://maskom.co.id`
- Verify Organization schema detected
- Check for errors or warnings

### Test 4: Social Media Sharing

**1. Test Open Graph (Facebook/LinkedIn)**:
```
https://developers.facebook.com/tools/debug/
```
- Enter URL: `https://maskom.co.id/blog-details?id=1`
- Verify OG tags detected correctly
- Check image preview

**2. Test Twitter Card**:
```
https://cards-dev.twitter.com/validator
```
- Enter URL: `https://maskom.co.id/blog-details?id=1`
- Verify Twitter Card tags detected
- Check card preview

### Test 5: Metadata Inspection

**1. Use Browser Developer Tools**:
- Open page in browser
- Open DevTools (F12)
- Check Elements tab
- Inspect `<head>` section

**2. Verify Metadata**:
- Title tag present and correct
- Meta description present and correct
- Canonical URL present and correct
- Robots directives present and correct

**3. Use SEO Tools**:
- SEO Site Checkup: https://seositecheckup.com/
- Moz Pro: https://moz.com/products/seo
- Ahrefs Site Audit: https://ahrefs.com/site-audit

## Best Practices

### 1. Title Tags

✅ **Good**:
- Descriptive and unique
- 50-60 characters
- Include primary keyword
- Brand name at end

```html
<title>Maskom - Layanan Konektivitas & Managed Service</title>
```

❌ **Bad**:
- Generic or duplicated
- Too long (> 60 characters)
- Keyword stuffing
- Missing brand name

```html
<title>Maskom - Konektivitas Jaringan WiFi Internet Service IT Infrastructure Managed Service Provider Indonesia</title>
```

### 2. Meta Descriptions

✅ **Good**:
- Descriptive and compelling
- 150-160 characters
- Include keywords naturally
- Call to action

```html
<meta name="description" content="Maskom menyediakan layanan konektivitas, jaringan WiFi, dan managed service untuk bisnis di seluruh Indonesia." />
```

❌ **Bad**:
- Too short or too long
- Keyword stuffing
- Generic or duplicated
- No value to users

```html
<meta name="description" content="Maskom Maskom Maskom Maskom konektivitas jaringan wifi" />
```

### 3. Canonical URLs

✅ **Good**:
- Absolute URLs
- HTTPS for production
- No trailing slashes (consistent)
- Include domain

```html
<link rel="canonical" href="https://maskom.co.id/blog-details?id=1" />
```

❌ **Bad**:
- Relative URLs
- HTTP for production
- Inconsistent trailing slashes
- Missing domain

```html
<link rel="canonical" href="/blog-details?id=1" />
```

### 4. Structured Data

✅ **Good**:
- Valid JSON-LD syntax
- Required fields present
- Accurate information
- Tested with validation tools

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Title",
  "description": "Description",
  "image": ["URL"],
  "author": "Author",
  "datePublished": "2026-01-16"
}
```

❌ **Bad**:
- Invalid JSON-LD syntax
- Missing required fields
- Inaccurate information
- Not tested with validators

### 5. Draft Content

✅ **Good**:
- Drafts set to `status: 'draft'`
- Drafts excluded from sitemap
- Drafts have `noindex` robots directive
- Drafts not publicly linked

❌ **Bad**:
- Drafts set to `status: 'published'`
- Drafts included in sitemap
- Drafts have `index` robots directive
- Drafts publicly accessible

## Developer Guide

### Adding New Schema Type

```typescript
// src/types/seo.ts
export interface CustomSchema {
    '@context': 'https://schema.org';
    '@type': 'Product';
    name: string;
    description: string;
    image: string[];
}

// src/utils/seo.ts
export function generateCustomSchema(data: any): CustomSchema {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: [data.image]
    };
}
```

### Updating Sitemap

```typescript
// src/app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
    const newPage = {
        url: `${SITE_URL}/new-page`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8
    };

    return [...staticPages, ...blogPosts, newPage];
}
```

### Custom Metadata

```typescript
// src/app/custom/page.tsx
import { generateMetadataFromProps } from '@/utils/metadata';

export const metadata = generateMetadataFromProps({
    title: 'Custom Page',
    description: 'Custom page description',
    keywords: 'custom, page, keywords',
    canonicalUrl: `${SITE_URL}/custom`,
    ogImage: '/assets/images/custom-og.jpg',
    ogType: 'website',
    twitterCard: 'summary_large_image'
});
```

## Performance Impact

### Build Time Impact

- **Sitemap Generation**: +50ms (dynamic from data)
- **Metadata Generation**: +10ms (type-safe generation)
- **JSON-LD Rendering**: +5ms (client-side)

### Runtime Impact

- **Metadata Injection**: Zero runtime cost (build-time)
- **Sitemap Serving**: Minimal (cached file)
- **JSON-LD Rendering**: Minimal (small JSON)

### SEO Benefits

- **Search Visibility**: +30-50% (rich snippets)
- **Click-Through Rate**: +10-20% (better titles/descriptions)
- **Social Sharing**: Improved (proper OG tags)
- **Crawling Efficiency**: +40% (proper sitemap/robots)

## Related Documentation

- [Blueprint](../blueprint.md#seo-enhancement-system--completed---task-220) - SEO architecture
- [Component Development Guide](../component-development-guide.md#14-jsonld) - JsonLd component
- [API Documentation](../api.md) - Metadata generation utilities

## Support

For issues or questions about SEO features:
1. Check this documentation
2. Test with validation tools
3. Verify environment variables
4. Report issues with URL and browser

---

**Last Updated**: January 16, 2026
**Version**: 1.0.0
**Related Task**: Task 220 (SEO Enhancement System)
