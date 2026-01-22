/**
 * SEO Performance Monitoring Engine
 * 
 * Core engine for running SEO audits, calculating scores, and managing SEO performance data
 */

import { generateUUID } from '@/utils/uuid';
import type {
  SEOAudit,
  SEOIssue,
  SEOMetrics,
  SEOIssueCategory,
  SEOIssueSeverity,
  SEOIssueStatus,
  SEOSummary,
  SEOScoreTrend,
  KeywordRanking,
  OrganicTrafficMetrics,
  SEORecommendation,
  SEOMonitoringConfig,
  SEOReport,
  SEOMonitoringMetadata,
} from '@/types/seoMonitor';
import type { InnerBlogPost } from '@/types/data';

/**
 * Default SEO monitoring configuration
 */
const DEFAULT_CONFIG: SEOMonitoringConfig = {
  enabled: true,
  auditSchedule: 'weekly',
  autoFixEnabled: false,
  notificationsEnabled: true,
  criticalThreshold: 70,
  highThreshold: 80,
  moderateThreshold: 90,
};

/**
 * Get SEO monitoring configuration
 */
export function getSEOConfig(): SEOMonitoringConfig {
  try {
    const stored = localStorage.getItem('seo_config');
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading SEO config:', error);
  }
  return DEFAULT_CONFIG;
}

/**
 * Save SEO monitoring configuration
 */
export function saveSEOConfig(config: SEOMonitoringConfig): void {
  try {
    localStorage.setItem('seo_config', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving SEO config:', error);
  }
}

/**
 * Check if a meta tag exists on a page (simulation for demo)
 */
function checkMetaTag(page: string, tagName: string): boolean {
  // In a real implementation, this would scrape the page or use an API
  // For demo purposes, we'll simulate based on known pages
  const hasMetaTags: Record<string, boolean> = {
    '/': true,
    '/about': true,
    '/blog': true,
    '/contact': true,
    '/pricing': true,
  };
  return hasMetaTags[page] || false;
}

/**
 * Check for duplicate meta tags (simulation)
 */
function checkDuplicateMetaTags(page: string): boolean {
  // Simulate duplicate detection
  const hasDuplicates: Record<string, boolean> = {
    '/blog': false,
    '/about': true,
  };
  return hasDuplicates[page] || false;
}

/**
 * Check for missing meta description (simulation)
 */
function checkMissingMetaDescription(page: string): boolean {
  const missing: Record<string, boolean> = {
    '/': false,
    '/about': true,
    '/blog': false,
    '/contact': false,
  };
  return missing[page] || false;
}

/**
 * Check for structured data (simulation)
 */
function checkStructuredData(page: string): boolean {
  const hasSchema: Record<string, boolean> = {
    '/blog': true,
    '/about': false,
    '/': true,
  };
  return hasSchema[page] || false;
}

/**
 * Check for image alt text (simulation)
 */
function checkImageAltText(page: string): { missing: number; total: number } {
  const images: Record<string, { missing: number; total: number }> = {
    '/blog': { missing: 2, total: 15 },
    '/about': { missing: 0, total: 5 },
    '/': { missing: 1, total: 8 },
  };
  return images[page] || { missing: 0, total: 0 };
}

/**
 * Check for broken links (simulation)
 */
function checkBrokenLinks(page: string): { broken: number; total: number } {
  const links: Record<string, { broken: number; total: number }> = {
    '/blog': { broken: 1, total: 25 },
    '/about': { broken: 0, total: 12 },
    '/': { broken: 2, total: 20 },
  };
  return links[page] || { broken: 0, total: 0 };
}

/**
 * Check mobile responsiveness (simulation)
 */
function checkMobileResponsive(page: string): boolean {
  const isMobileFriendly: Record<string, boolean> = {
    '/': true,
    '/blog': true,
    '/about': false,
    '/contact': true,
  };
  return isMobileFriendly[page] || false;
}

/**
 * Check page load speed (simulation - in ms)
 */
function getPageLoadSpeed(page: string): number {
  const speeds: Record<string, number> = {
    '/': 1200,
    '/blog': 1800,
    '/about': 1500,
    '/contact': 900,
  };
  return speeds[page] || 1500;
}

/**
 * Check for keyword density issues (simulation)
 */
function checkKeywordDensity(page: string): boolean {
  const hasIssues: Record<string, boolean> = {
    '/blog': false,
    '/about': true,
  };
  return hasIssues[page] || false;
}

/**
 * Generate SEO issues for a page
 */
function generatePageIssues(page: string): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const timestamp = new Date().toISOString();

  // Check meta tags
  if (!checkMetaTag(page, 'description')) {
    issues.push({
      id: generateUUID(),
      page,
      category: 'meta-tags',
      severity: 'high',
      status: 'open',
      title: 'Meta Description Missing',
      description: 'The page is missing a meta description tag.',
      recommendation: 'Add a meta description (150-160 characters) to improve search engine visibility.',
      detectedAt: timestamp,
    });
  }

  if (checkDuplicateMetaTags(page)) {
    issues.push({
      id: generateUUID(),
      page,
      category: 'meta-tags',
      severity: 'moderate',
      status: 'open',
      title: 'Duplicate Meta Tags',
      description: 'Duplicate meta tags detected on this page.',
      recommendation: 'Remove duplicate meta tags to avoid confusion with search engines.',
      detectedAt: timestamp,
    });
  }

  // Check structured data
  if (!checkStructuredData(page)) {
    issues.push({
      id: generateUUID(),
      page,
      category: 'structured-data',
      severity: 'high',
      status: 'open',
      title: 'Missing Structured Data',
      description: 'No structured data (JSON-LD) found on this page.',
      recommendation: 'Add structured data (Article, Organization, etc.) to help search engines understand your content.',
      detectedAt: timestamp,
    });
  }

  // Check images
  const imageData = checkImageAltText(page);
  if (imageData.missing > 0) {
    issues.push({
      id: generateUUID(),
      page,
      category: 'images',
      severity: imageData.missing > 3 ? 'high' : 'moderate',
      status: 'open',
      title: `Missing Alt Text on ${imageData.missing} Images`,
      description: `${imageData.missing} out of ${imageData.total} images are missing alt text.`,
      recommendation: 'Add descriptive alt text to all images for accessibility and SEO.',
      detectedAt: timestamp,
    });
  }

  // Check broken links
  const linkData = checkBrokenLinks(page);
  if (linkData.broken > 0) {
    issues.push({
      id: generateUUID(),
      page,
      category: 'links',
      severity: linkData.broken > 5 ? 'critical' : 'high',
      status: 'open',
      title: `${linkData.broken} Broken Links Found`,
      description: `${linkData.broken} out of ${linkData.total} links are broken or returning errors.`,
      recommendation: 'Fix or remove broken links to improve user experience and SEO.',
      detectedAt: timestamp,
    });
  }

  // Check mobile responsiveness
  if (!checkMobileResponsive(page)) {
    issues.push({
      id: generateUUID(),
      page,
      category: 'mobile',
      severity: 'high',
      status: 'open',
      title: 'Not Mobile Responsive',
      description: 'This page is not optimized for mobile devices.',
      recommendation: 'Implement responsive design to improve mobile search rankings.',
      detectedAt: timestamp,
    });
  }

  // Check page load speed
  const loadSpeed = getPageLoadSpeed(page);
  if (loadSpeed > 2500) {
    issues.push({
      id: generateUUID(),
      page,
      category: 'performance',
      severity: loadSpeed > 4000 ? 'critical' : 'high',
      status: 'open',
      title: 'Slow Page Load Speed',
      description: `Page load time is ${loadSpeed}ms, which is above recommended threshold of 2.5s.`,
      recommendation: 'Optimize images, minify CSS/JS, and leverage browser caching to improve load times.',
      detectedAt: timestamp,
    });
  }

  // Check keyword density
  if (checkKeywordDensity(page)) {
    issues.push({
      id: generateUUID(),
      page,
      category: 'keywords',
      severity: 'low',
      status: 'open',
      title: 'Keyword Density Issues',
      description: 'Keyword density is either too high or too low.',
      recommendation: 'Aim for 1-2% keyword density naturally in your content.',
      detectedAt: timestamp,
    });
  }

  return issues;
}

/**
 * Calculate SEO score for a page
 */
function calculatePageScore(issues: SEOIssue[]): number {
  if (issues.length === 0) return 100;

  let score = 100;
  const severityWeights: Record<SEOIssueSeverity, number> = {
    critical: 15,
    high: 10,
    moderate: 5,
    low: 2,
  };

  issues.forEach((issue) => {
    score -= severityWeights[issue.severity];
  });

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate category-specific scores
 */
function calculateCategoryScores(issues: SEOIssue[]): Record<string, { score: number; issues: number }> {
  const categories: Record<string, SEOIssue[]> = {};

  issues.forEach((issue) => {
    if (!categories[issue.category]) {
      categories[issue.category] = [];
    }
    categories[issue.category].push(issue);
  });

  const scores: Record<string, { score: number; issues: number }> = {};
  Object.keys(categories).forEach((category) => {
    const categoryIssues = categories[category];
    scores[category] = {
      score: calculatePageScore(categoryIssues),
      issues: categoryIssues.length,
    };
  });

  return scores;
}

/**
 * Generate SEO metrics for a page
 */
function generatePageMetrics(page: string, issues: SEOIssue[], pageTitle: string): SEOMetrics {
  const categoryScores = calculateCategoryScores(issues);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://maskom.co.id';

  return {
    page,
    pageTitle,
    url: `${origin}${page}`,
    score: calculatePageScore(issues),
    lastChecked: new Date().toISOString(),
    metaTagsScore: categoryScores['meta-tags']?.score || 100,
    metaTagsIssues: categoryScores['meta-tags']?.issues || 0,
    structuredDataScore: categoryScores['structured-data']?.score || 100,
    structuredDataIssues: categoryScores['structured-data']?.issues || 0,
    contentQualityScore: categoryScores['content-quality']?.score || 100,
    contentQualityIssues: categoryScores['content-quality']?.issues || 0,
    performanceScore: categoryScores['performance']?.score || 100,
    performanceIssues: categoryScores['performance']?.issues || 0,
    mobileScore: categoryScores['mobile']?.score || 100,
    mobileIssues: categoryScores['mobile']?.issues || 0,
    linksScore: categoryScores['links']?.score || 100,
    linksIssues: categoryScores['links']?.issues || 0,
    imagesScore: categoryScores['images']?.score || 100,
    imagesIssues: categoryScores['images']?.issues || 0,
  };
}

/**
 * Run SEO audit on specified pages
 */
export function runSEOAudit(pages: string[]): SEOAudit {
  const auditId = generateUUID();
  const timestamp = new Date().toISOString();

  const allIssues: SEOIssue[] = [];
  const allMetrics: SEOMetrics[] = [];

  pages.forEach((page) => {
    const issues = generatePageIssues(page);
    allIssues.push(...issues);

    const pageTitle = getPageTitle(page);
    const metrics = generatePageMetrics(page, issues, pageTitle);
    allMetrics.push(metrics);
  });

  // Calculate summary
  const summary = calculateSEOSummary(allIssues, pages.length);

  const audit: SEOAudit = {
    id: auditId,
    timestamp,
    pagesAudited: pages.length,
    totalPages: pages.length,
    overallScore: summary.avgScore,
    issues: allIssues,
    metrics: allMetrics,
    summary,
  };

  return audit;
}

/**
 * Get page title from page path (simulation)
 */
function getPageTitle(page: string): string {
  const titles: Record<string, string> = {
    '/': 'Beranda - Maskom',
    '/about': 'Tentang Kami - Maskom',
    '/blog': 'Blog - Maskom',
    '/contact': 'Hubungi Kami - Maskom',
    '/pricing': 'Harga - Maskom',
  };
  return titles[page] || `${page} - Maskom`;
}

/**
 * Calculate SEO summary
 */
function calculateSEOSummary(issues: SEOIssue[], pagesAudited: number): SEOSummary {
  const categoryBreakdown: Record<SEOIssueCategory, number> = {
    'meta-tags': 0,
    'structured-data': 0,
    'content-quality': 0,
    'performance': 0,
    'mobile': 0,
    'links': 0,
    'images': 0,
    'url-structure': 0,
    'schema': 0,
    'keywords': 0,
  };

  let critical = 0;
  let high = 0;
  let moderate = 0;
  let low = 0;

  issues.forEach((issue) => {
    categoryBreakdown[issue.category]++;
    switch (issue.severity) {
      case 'critical':
        critical++;
        break;
      case 'high':
        high++;
        break;
      case 'moderate':
        moderate++;
        break;
      case 'low':
        low++;
        break;
    }
  });

  const pagesWithIssues = new Set(issues.map((i) => i.page)).size;
  const avgScore = calculatePageScore(issues);

  return {
    totalIssues: issues.length,
    criticalIssues: critical,
    highIssues: high,
    moderateIssues: moderate,
    lowIssues: low,
    categoryBreakdown,
    pagesWithIssues,
    pagesAudited,
    avgScore,
  };
}

/**
 * Save SEO audit to localStorage
 */
export function saveSEOAudit(audit: SEOAudit): void {
  try {
    // Save current audit
    localStorage.setItem('seo_current_audit', JSON.stringify(audit));

    // Add to history
    const history = loadSEOAuditHistory();
    history.unshift(audit);

    // Keep only last 50 audits
    const trimmedHistory = history.slice(0, 50);
    localStorage.setItem('seo_audits', JSON.stringify(trimmedHistory));

    // Update metadata
    updateSEOMetadata(audit);
  } catch (error) {
    console.error('Error saving SEO audit:', error);
  }
}

/**
 * Load SEO audit history
 */
export function loadSEOAuditHistory(): SEOAudit[] {
  try {
    const stored = localStorage.getItem('seo_audits');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading SEO audit history:', error);
  }
  return [];
}

/**
 * Load current SEO audit
 */
export function loadCurrentSEOAudit(): SEOAudit | null {
  try {
    const stored = localStorage.getItem('seo_current_audit');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading current SEO audit:', error);
  }
  return null;
}

/**
 * Update SEO issue status
 */
export function updateSEOIssueStatus(issueId: string, status: SEOIssueStatus): boolean {
  try {
    const audit = loadCurrentSEOAudit();
    if (!audit) return false;

    const issue = audit.issues.find((i) => i.id === issueId);
    if (!issue) return false;

    issue.status = status;

    if (status === 'fixed') {
      issue.fixedAt = new Date().toISOString();
    } else if (status === 'in-progress') {
      issue.acknowledgedAt = new Date().toISOString();
    }

    saveSEOAudit(audit);
    return true;
  } catch (error) {
    console.error('Error updating SEO issue status:', error);
    return false;
  }
}

/**
 * Generate SEO score trend data
 */
export function generateSEOScoreTrend(days: number = 30): SEOScoreTrend[] {
  const history = loadSEOAuditHistory();
  const trend: SEOScoreTrend[] = [];

  // Group audits by date
  const auditsByDate: Record<string, SEOAudit[]> = {};
  history.forEach((audit) => {
    const date = audit.timestamp.split('T')[0];
    if (!auditsByDate[date]) {
      auditsByDate[date] = [];
    }
    auditsByDate[date].push(audit);
  });

  // Calculate daily averages
  const dates = Object.keys(auditsByDate).sort().slice(-days);
  dates.forEach((date) => {
    const audits = auditsByDate[date];
    if (audits.length > 0) {
      const avgScore = audits.reduce((sum, a) => sum + a.overallScore, 0) / audits.length;
      const totalIssues = audits.reduce((sum, a) => sum + a.issues.length, 0);
      const criticalIssues = audits.reduce((sum, a) => sum + a.summary.criticalIssues, 0);

      trend.push({
        date,
        score: Math.round(avgScore),
        issuesCount: totalIssues,
        criticalIssues,
      });
    }
  });

  return trend;
}

/**
 * Generate SEO recommendations
 */
export function generateSEORecommendations(audit: SEOAudit): SEORecommendation[] {
  const recommendations: SEORecommendation[] = [];

  // Sort issues by severity and prioritize
  const sortedIssues = [...audit.issues].sort((a, b) => {
    const severityOrder: Record<SEOIssueSeverity, number> = {
      critical: 0,
      high: 1,
      moderate: 2,
      low: 3,
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Generate recommendations for top 10 issues
  sortedIssues.slice(0, 10).forEach((issue) => {
    recommendations.push({
      issueId: issue.id,
      priority: issue.severity,
      action: issue.recommendation,
      estimatedImpact: issue.severity === 'critical' ? 'high' : issue.severity === 'high' ? 'medium' : 'low',
      effort: issue.category === 'meta-tags' || issue.category === 'images' ? 'quick' : 'moderate',
    });
  });

  return recommendations;
}

/**
 * Generate mock keyword rankings (for demo)
 */
export function generateKeywordRankings(): KeywordRanking[] {
  return [
    {
      keyword: 'managed service provider',
      currentRank: 3,
      previousRank: 5,
      searchVolume: 1200,
      clickThroughRate: 15.5,
      lastUpdated: new Date().toISOString(),
    },
    {
      keyword: 'IT infrastructure solutions',
      currentRank: 7,
      previousRank: 8,
      searchVolume: 890,
      clickThroughRate: 12.3,
      lastUpdated: new Date().toISOString(),
    },
    {
      keyword: 'network connectivity services',
      currentRank: 2,
      previousRank: 2,
      searchVolume: 2100,
      clickThroughRate: 18.7,
      lastUpdated: new Date().toISOString(),
    },
    {
      keyword: 'digital transformation',
      currentRank: 12,
      previousRank: 15,
      searchVolume: 5400,
      clickThroughRate: 9.8,
      lastUpdated: new Date().toISOString(),
    },
    {
      keyword: 'cloud services provider',
      currentRank: 5,
      previousRank: 4,
      searchVolume: 3200,
      clickThroughRate: 14.2,
      lastUpdated: new Date().toISOString(),
    },
  ];
}

/**
 * Generate mock organic traffic metrics (for demo)
 */
export function generateOrganicTrafficMetrics(days: number = 30): OrganicTrafficMetrics[] {
  const metrics: OrganicTrafficMetrics[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic-looking data with some randomness
    const baseSessions = 150 + Math.random() * 50;
    const baseViews = baseSessions * (2.5 + Math.random() * 0.5);
    const baseDuration = 120 + Math.random() * 60;
    const baseBounceRate = 40 + Math.random() * 20;
    const baseConversion = 2 + Math.random() * 1;

    metrics.push({
      date: date.toISOString().split('T')[0],
      organicSessions: Math.round(baseSessions),
      organicPageViews: Math.round(baseViews),
      avgSessionDuration: Math.round(baseDuration),
      organicBounceRate: Math.round(baseBounceRate * 10) / 10,
      conversionRate: Math.round(baseConversion * 10) / 10,
    });
  }

  return metrics;
}

/**
 * Generate SEO report
 */
export function generateSEOReport(auditId?: string): SEOReport | null {
  const audit = auditId
    ? loadSEOAuditHistory().find((a) => a.id === auditId)
    : loadCurrentSEOAudit();

  if (!audit) return null;

  const trend = generateSEOScoreTrend(30);
  const keywordRankings = generateKeywordRankings();
  const organicTraffic = generateOrganicTrafficMetrics(30);
  const recommendations = generateSEORecommendations(audit);

  return {
    id: generateUUID(),
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    auditData: audit,
    trends: trend,
    keywordRankings,
    organicTraffic,
    recommendations,
  };
}

/**
 * Get SEO monitoring metadata
 */
export function getSEOMetadata(): SEOMonitoringMetadata {
  try {
    const stored = localStorage.getItem('seo_metadata');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading SEO metadata:', error);
  }

  return {
    version: '1.0.0',
    lastAuditTime: new Date().toISOString(),
    nextAuditTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalAudits: 0,
    issuesResolved: 0,
    issuesOpen: 0,
  };
}

/**
 * Update SEO metadata
 */
function updateSEOMetadata(audit: SEOAudit): void {
  try {
    const metadata = getSEOMetadata();
    metadata.lastAuditTime = audit.timestamp;
    metadata.totalAudits += 1;
    metadata.issuesOpen = audit.issues.filter((i) => i.status === 'open').length;
    metadata.issuesResolved = audit.issues.filter((i) => i.status === 'fixed').length;

    // Calculate next audit time based on schedule
    const config = getSEOConfig();
    const scheduleDays: Record<typeof config.auditSchedule, number> = {
      manual: 30,
      daily: 1,
      weekly: 7,
      monthly: 30,
    };
    metadata.nextAuditTime = new Date(
      Date.now() + scheduleDays[config.auditSchedule] * 24 * 60 * 60 * 1000
    ).toISOString();

    localStorage.setItem('seo_metadata', JSON.stringify(metadata));
  } catch (error) {
    console.error('Error updating SEO metadata:', error);
  }
}

/**
 * Clear SEO audit data
 */
export function clearSEOAuditData(): void {
  try {
    localStorage.removeItem('seo_current_audit');
    localStorage.removeItem('seo_audits');
    localStorage.removeItem('seo_metadata');
  } catch (error) {
    console.error('Error clearing SEO audit data:', error);
  }
}
