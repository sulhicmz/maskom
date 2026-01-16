# Blog Features User Guide

## Overview

Maskom blog provides **advanced content discovery and management features** including search, filtering, bookmarking, and export. These features help users find relevant content, organize reading lists, and export articles for offline use.

## Features

### 1. Blog Search

**Find blog posts by title or description** using real-time search with debouncing.

**Location**: Blog sidebar (left side of blog pages)

**How to Use**:
1. Navigate to blog page (`/blog`)
2. Locate "Cari Artikel" (Search Articles) widget in sidebar
3. Type keywords in search input
4. Results update automatically after 300ms delay (debouncing)
5. Click "×" button to clear search

**Search Behavior**:
- Searches in post titles
- Searches in post descriptions
- Case-insensitive matching
- Partial keyword matching
- Real-time results update

**Example**:
- Search: "jaringan" → Shows all posts about networking
- Search: "IoT" → Shows IoT-related posts
- Search: "wifi" → Shows WiFi optimization posts

### 2. Category Filtering

**Filter blog posts by category** using category dropdown.

**Location**: Blog sidebar (left side of blog pages)

**Available Categories**:
1. **Konektivitas Terkelola** (Managed Connectivity)
2. **Keamanan Jaringan** (Network Security)
3. **Operasional & Dukungan** (Operations & Support)
4. **Transformasi Digital** (Digital Transformation)
5. **Infrastruktur Cloud** (Cloud Infrastructure)
6. **IoT & Edge** (IoT & Edge Computing)

**How to Use**:
1. Navigate to blog page
2. Locate "Kategori" (Categories) widget in sidebar
3. Click category dropdown
4. Select desired category
5. Results update to show posts in selected category
6. Click "Hapus Filter" (Clear Filter) to remove filter

**Category Filter in URL**:
Filter is reflected in URL query parameter:
- `/blog?category=1` - Filter by category ID 1
- `/blog` - No filter (show all posts)

**Combined Filtering**:
Category filter works with search and tag filters:
- Search + Category filter
- Tag + Category filter
- Search + Tag + Category filter

### 3. Tag Filtering

**Filter blog posts by tags** using tag buttons.

**Location**: Blog post detail page and sidebar

**How to Use**:
1. Navigate to blog details page
2. Scroll to post content
3. Click on tag buttons below post title
4. Blog list updates to show posts with selected tag

**Tag Filter in URL**:
Filter is reflected in URL query parameter:
- `/blog?tag=1` - Filter by tag ID 1
- `/blog` - No filter (show all posts)

**Combined Filtering**:
Tag filter works with search and category filters.

### 4. Blog Bookmarking

**Save blog posts for later reading** using bookmark button with localStorage persistence.

**Location**: Blog post detail page (top of post content)

**How to Use**:
1. Navigate to blog details page
2. Click bookmark button (outline bookmark icon)
3. Icon changes to filled bookmark icon
4. Post is saved to your browser's localStorage
5. Click bookmark button again to remove bookmark

**Bookmark Storage**:
- Stored in browser's localStorage
- Persists across browser sessions
- No account or login required
- Each browser has separate bookmarks

**Bookmark Button States**:
- **Outline icon** (far fa-bookmark) - Post not bookmarked
- **Filled icon** (fas fa-bookmark) - Post is bookmarked
- **Disabled** - Bookmark checking on page load

**Accessibility**:
- Keyboard accessible (Tab + Enter/Space)
- Screen reader support with ARIA labels
- `aria-pressed` attribute indicates bookmark state
- `aria-label` updates based on state

### 5. Blog Export

**Export filtered blog results** to PDF or CSV format for offline reading or analysis.

**Location**: Blog page (top of blog post list)

**Supported Formats**:
- **PDF** - Professional document with styling and formatting
- **CSV** - Tabular data for analysis in spreadsheet applications

**How to Use - PDF Export**:
1. Navigate to blog page
2. Apply filters (search, category, tag) as needed
3. Click "Ekspor Hasil" (Export Results) button
4. Select "Export sebagai PDF" (Export as PDF)
5. PDF file downloads automatically with styling

**PDF Export Features**:
- Professional document formatting with jsPDF
- Includes export metadata (date, filters, result count)
- Styled content with proper typography
- Custom filename support
- Includes post title, description, author, date, category, tag

**How to Use - CSV Export**:
1. Navigate to blog page
2. Apply filters (search, category, tag) as needed
3. Click "Ekspor Hasil" (Export Results) button
4. Select "Export sebagai CSV" (Export as CSV)
5. CSV file downloads automatically

**CSV Export Features**:
- Tabular data format for Excel/Google Sheets
- Includes all post fields (title, description, author, date, category, tag)
- Includes metadata as comment headers
- Escaped values for commas and quotes
- Custom filename support

**Export Metadata**:
Both PDF and CSV exports include:
- **Export Date** - ISO 8601 format (YYYY-MM-DD)
- **Active Filters Count** - Number of applied filters
- **Applied Filters** - List of active filters (search, category, tag, status)
- **Result Count** - Number of posts exported

**Example Export Filename**:
- `maskom-blog-export-2026-01-16.pdf`
- `maskom-blog-export-2026-01-16.csv`

**Use Cases**:
- **Offline Reading** - Export to PDF for reading without internet
- **Content Analysis** - Export to CSV for data analysis
- **Content Sharing** - Share filtered results with colleagues
- **Content Archiving** - Save articles for future reference

### 6. Social Sharing

**Share blog posts** to social media platforms with pre-filled content.

**Location**: Blog post detail page (below post content)

**Supported Platforms**:
- **Facebook** - Share on Facebook with URL preview
- **Twitter/X** - Share on Twitter with custom text
- **LinkedIn** - Share on LinkedIn for professional network
- **Instagram** - Share on Instagram (opens Instagram app)

**How to Use**:
1. Navigate to blog details page
2. Scroll to social share buttons (bottom of post)
3. Click desired platform button
4. Share dialog opens in new window
5. Customize share message (if platform supports)
6. Share with your network

**Share Content**:
- **URL** - Blog post URL
- **Title** - Blog post title
- **Text** - Custom share text (default: "Check out [title]!")

**Accessibility**:
- Keyboard accessible social buttons
- ARIA labels for each platform
- `role="list"` for button container
- Focus management

## Usage Examples

### Example 1: Find and Save IoT Articles

**Scenario**: Research IoT articles for later reading

**Steps**:
1. Navigate to `/blog`
2. Type "IoT" in search input
3. Results show IoT-related posts
4. Click on post title to view details
5. Click bookmark button (filled icon)
6. Post is saved for later
7. Click back to return to results
8. Repeat for other IoT articles

**Result**: All IoT articles bookmarked for offline reference

### Example 2: Export Network Security Posts

**Scenario**: Compile network security articles for team reference

**Steps**:
1. Navigate to `/blog`
2. Select "Keamanan Jaringan" (Network Security) category
3. Results show security-related posts
4. Click "Ekspor Hasil" button
5. Select "Export sebagai PDF" (Export as PDF)
6. PDF file downloads with all security posts
7. Share PDF with team

**Result**: PDF document with all network security articles

### Example 3: Filter by Category and Search

**Scenario**: Find specific article about cloud infrastructure

**Steps**:
1. Navigate to `/blog`
2. Select "Infrastruktur Cloud" (Cloud Infrastructure) category
3. Results show cloud-related posts
4. Type "optimasi" (optimization) in search input
5. Results narrow down to optimization-focused cloud posts
6. Click on desired post

**Result**: Specific cloud optimization article found using combined filters

### Example 4: Share Article on LinkedIn

**Scenario**: Share professional article on LinkedIn

**Steps**:
1. Navigate to blog details page
2. Scroll to social share buttons
3. Click LinkedIn button (icon)
4. LinkedIn share dialog opens in new window
5. Add custom message if desired
6. Click "Post" to share with network

**Result**: Article shared with professional network

## Combined Filtering

### Filter Combination Examples

**Search + Category**:
- Search: "jaringan"
- Category: "Keamanan Jaringan"
- Result: Security posts about networking

**Tag + Search**:
- Tag: "IoT"
- Search: "sensor"
- Result: IoT posts about sensors

**Category + Tag**:
- Category: "Konektivitas Terkelola"
- Tag: "wifi"
- Result: Managed connectivity posts about WiFi

**Search + Category + Tag**:
- Search: "klien"
- Category: "Operasional & Dukungan"
- Tag: "dukungan"
- Result: Customer support posts

### Filter URL Structure

All filters are reflected in URL for easy sharing:

```
/blog
/blog?search=jaringan
/blog?category=2
/blog?tag=3
/blog?search=jaringan&category=2
/blog?search=jaringan&category=2&tag=3
```

**Note**: Filter URLs can be bookmarked and shared with others.

## Browser Compatibility

All blog features are supported in modern browsers:

| Feature | Chrome | Firefox | Safari | Edge | Opera |
|---------|--------|---------|--------|-------|-------|
| Search | ✅ | ✅ | ✅ | ✅ | ✅ |
| Category Filter | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tag Filter | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bookmarking | ✅ | ✅ | ✅ | ✅ | ✅ |
| PDF Export | ✅ | ✅ | ✅ | ✅ | ✅ |
| CSV Export | ✅ | ✅ | ✅ | ✅ | ✅ |
| Social Sharing | ✅ | ✅ | ✅ | ✅ | ✅ |

**Note**:
- Bookmarking requires localStorage support
- PDF export requires modern browser with jsPDF support
- Social sharing opens dialogs in new window

## Troubleshooting

### Issue: Search not working

**Possible Causes**:
- JavaScript disabled
- Browser extension interfering
- Network connectivity issues

**Solutions**:
1. **Enable JavaScript**:
   - Check browser settings
   - Ensure JavaScript is enabled

2. **Disable Extensions**:
   - Disable ad blockers temporarily
   - Disable privacy extensions
   - Try in incognito/private mode

3. **Check Network**:
   - Ensure internet connection is stable
   - Try different network

### Issue: Bookmark not persisting

**Possible Causes**:
- Browser privacy mode (incognito/private browsing)
- Browser localStorage disabled
- Browser extensions blocking localStorage

**Solutions**:
1. **Try Regular Browser Window**:
   - Close incognito/private window
   - Open regular browser window
   - Test bookmarking again

2. **Check Browser Settings**:
   - Ensure localStorage is enabled
   - Check privacy settings
   - Disable strict privacy mode

3. **Clear Browser Cache**:
   - Clear browser cookies and cache
   - Restart browser
   - Test bookmarking again

### Issue: Export not working

**Possible Causes**:
- Browser blocking file downloads
- Browser extension interfering
- Popup blocker preventing download

**Solutions**:
1. **Check Browser Downloads**:
   - Check browser download folder
   - Verify file was downloaded
   - Try downloading again

2. **Disable Popup Blocker**:
   - Allow downloads from maskom.co.id
   - Add maskom.co.id to trusted sites

3. **Try Different Browser**:
   - Export may work better in different browser
   - Chrome and Firefox recommended

4. **Check Empty Results**:
   - Verify there are posts to export
   - Clear filters and try again
   - Search for different terms

### Issue: Social sharing not working

**Possible Causes**:
- Popup blocker blocking share dialog
- Browser extension interfering
- Social media platform issues

**Solutions**:
1. **Disable Popup Blocker**:
   - Allow popups from maskom.co.id
   - Click address bar popup icon
   - Enable popups temporarily

2. **Check Platform Status**:
   - Verify social media platform is working
   - Check if social media has outages

3. **Try Manual Share**:
   - Copy article URL from address bar
   - Manually paste into social media platform
   - Add custom message manually

## Advanced Usage

### Power Search Tips

**Use Keywords Effectively**:
- Use Indonesian keywords (most articles are in Indonesian)
- Try multiple keywords
- Use partial keywords for broader results
- Use specific keywords for narrow results

**Example Keywords**:
- **Broad**: "jaringan" (network)
- **Specific**: "wifi mesh" (WiFi mesh)
- **Partial**: "sec" (security, secure, sekuritas)

### Filter Combination Strategies

**Category First, Then Refine**:
1. Select relevant category
2. Apply search to narrow results
3. Use tag filter for specific topics

**Tag First, Then Refine**:
1. Click tag button on article
2. Use search to find specific articles
3. Use category filter for topic narrowing

**Search First, Then Filter**:
1. Search for topic
2. Use category filter to narrow results
3. Use tag filter for specific subtopics

### Export for Analysis

**CSV Data Analysis**:
1. Export filtered results to CSV
2. Open in Excel or Google Sheets
3. Analyze post patterns
4. Identify trending topics
5. Track post frequency

**Use Cases**:
- Content strategy planning
- Competitor analysis
- Topic trend tracking
- Content calendar planning

### Bookmark Organization

**Bookmark Collections**:
1. Bookmark articles on different topics
2. Use export to save all bookmarks
3. Organize by topic or date
4. Share collections with team

## Developer Guide

### Using Blog Components

```typescript
// Blog Search
import BlogSearch from '@/components/blogs/blog/BlogSearch';

<BlogSearch
    value={searchQuery}
    onChange={setSearchQuery}
/>

// Blog Category Filter
import BlogCategoryFilter from '@/components/blogs/blog/BlogCategoryFilter';

<BlogCategoryFilter
    selectedCategory={selectedCategory}
    onCategoryChange={setSelectedCategory}
/>

// Bookmark Button
import BookmarkButton from '@/components/common/BookmarkButton';

<BookmarkButton
    postId="1"
    postTitle="How to Optimize Your Network"
    postSlug="how-to-optimize-network"
    postCategory="Konektivitas Terkelola"
    postTags={["network", "optimization"]}
    onBookmarkChange={(isBookmarked) => console.log(isBookmarked)}
/>

// Export Button
import ExportButton from '@/components/common/ExportButton';

<ExportButton
    posts={filteredPosts}
    filterCriteria={filterCriteria}
    buttonClassName="custom-export-btn"
/>

// Social Share Buttons
import SocialShareButtons from '@/components/common/SocialShareButtons';

<SocialShareButtons
    title="My Blog Post"
    url="https://maskom.co.id/blog-details?id=1"
    text="Check out this amazing post about network optimization!"
    className="share-buttons"
    ariaLabel="Share this article"
/>
```

### Blog Filter Criteria

```typescript
interface BlogFilterCriteria {
    searchQuery?: string | null;      // Search keywords
    categoryId?: number | null;       // Filter by category ID
    tagId?: number | null;           // Filter by tag ID
    status?: string | null;           // Filter by status (published/draft)
}
```

### Export Configuration

```typescript
import { exportBlogPosts, type ExportConfig } from '@/utils/exportUtils';

const config: ExportConfig = {
    format: 'pdf',                   // 'pdf' | 'csv'
    filename: 'my-blog-export',       // Optional custom filename
    includeFilters: true              // Include metadata in export
};

exportBlogPosts(posts, filterCriteria, config);
```

## Best Practices

### 1. Use Search Before Filtering

✅ **Good**: Search first, then apply category/tag filters

❌ **Bad**: Apply all filters at once (results may be empty)

### 2. Clear Filters Regularly

✅ **Good**: Clear filters when starting new search

❌ **Bad**: Keep filters active (limits results)

### 3. Use Specific Keywords

✅ **Good**: Use "wifi mesh optimization"

❌ **Bad**: Use "wifi mesh optimization tips guide tutorial" (too long)

### 4. Export Regularly

✅ **Good**: Export interesting articles regularly for offline access

❌ **Bad**: Rely on internet connection always being available

### 5. Bookmark Relevant Articles

✅ **Good**: Bookmark articles for future reference

❌ **Bad**: Re-search for articles you've seen before

## Related Documentation

- [Component Development Guide](../component-development-guide.md) - Component documentation
- [Blueprint](../blueprint.md) - Architecture documentation
- [Task 237](../task.md#task-237-feature-020---blog-content-export--sharing-jan-16-2026) - Export feature implementation
- [Task 214](../task.md) - Blog filtering utility

## Support

For issues or questions about blog features:
1. Check this documentation
2. Try in different browser
3. Clear browser cache and cookies
4. Report issues with browser and OS version

---

**Last Updated**: January 16, 2026
**Version**: 1.0.0
**Related Tasks**: Task 237 (Export), Task 214 (Filtering), Task 101 (Tags), Task 240 (Categories)
