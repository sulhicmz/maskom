/**
 * SEO Performance Monitoring Types
 * 
 * Types for tracking SEO performance metrics, issues, and trends
 */

/**
 * SEO performance issue severity levels
 */
export type SEOIssueSeverity = 'critical' | 'high' | 'moderate' | 'low';

/**
 * SEO issue categories
 */
export type SEOIssueCategory =
  | 'meta-tags'
  | 'structured-data'
  | 'content-quality'
  | 'performance'
  | 'mobile'
  | 'links'
  | 'images'
  | 'url-structure'
  | 'schema'
  | 'keywords';

/**
 * SEO issue status
 */
export type SEOIssueStatus = 'open' | 'in-progress' | 'fixed' | 'false-positive';

/**
 * SEO performance issue
 */
export interface SEOIssue {
  id: string;
  page: string;
  category: SEOIssueCategory;
  severity: SEOIssueSeverity;
  status: SEOIssueStatus;
  title: string;
  description: string;
  recommendation: string;
  wcagCriteria?: string;
  detectedAt: string;
  acknowledgedAt?: string;
  fixedAt?: string;
}

/**
 * SEO performance metrics for a page
 */
export interface SEOMetrics {
  page: string;
  pageTitle: string;
  url: string;
  score: number;
  lastChecked: string;
  metaTagsScore: number;
  metaTagsIssues: number;
  structuredDataScore: number;
  structuredDataIssues: number;
  contentQualityScore: number;
  contentQualityIssues: number;
  performanceScore: number;
  performanceIssues: number;
  mobileScore: number;
  mobileIssues: number;
  linksScore: number;
  linksIssues: number;
  imagesScore: number;
  imagesIssues: number;
}

/**
 * SEO audit result
 */
export interface SEOAudit {
  id: string;
  timestamp: string;
  pagesAudited: number;
  totalPages: number;
  overallScore: number;
  issues: SEOIssue[];
  metrics: SEOMetrics[];
  summary: SEOSummary;
}

/**
 * SEO audit summary
 */
export interface SEOSummary {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  moderateIssues: number;
  lowIssues: number;
  categoryBreakdown: Record<SEOIssueCategory, number>;
  pagesWithIssues: number;
  pagesAudited: number;
  avgScore: number;
}

/**
 * SEO score trend data point
 */
export interface SEOScoreTrend {
  date: string;
  score: number;
  issuesCount: number;
  criticalIssues: number;
}

/**
 * SEO monitoring configuration
 */
export interface SEOMonitoringConfig {
  enabled: boolean;
  auditSchedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  autoFixEnabled: boolean;
  notificationsEnabled: boolean;
  criticalThreshold: number;
  highThreshold: number;
  moderateThreshold: number;
}

/**
 * SEO issue recommendation
 */
export interface SEORecommendation {
  issueId: string;
  priority: SEOIssueSeverity;
  action: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  effort: 'quick' | 'moderate' | 'significant';
}

/**
 * Keyword ranking data
 */
export interface KeywordRanking {
  keyword: string;
  currentRank: number;
  previousRank?: number;
  searchVolume: number;
  clickThroughRate: number;
  lastUpdated: string;
}

/**
 * Organic traffic metrics
 */
export interface OrganicTrafficMetrics {
  date: string;
  organicSessions: number;
  organicPageViews: number;
  avgSessionDuration: number;
  organicBounceRate: number;
  conversionRate: number;
}

/**
 * SEO performance report data
 */
export interface SEOReport {
  id: string;
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  auditData: SEOAudit;
  trends: SEOScoreTrend[];
  keywordRankings: KeywordRanking[];
  organicTraffic: OrganicTrafficMetrics[];
  recommendations: SEORecommendation[];
}

/**
 * SEO monitoring metadata
 */
export interface SEOMonitoringMetadata {
  version: string;
  lastAuditTime: string;
  nextAuditTime: string;
  totalAudits: number;
  issuesResolved: number;
  issuesOpen: number;
}
