/**
 * Accessibility Audit Types
 * 
 * Type definitions for accessibility audit system,
 * including issues, scores, and compliance reports.
 */

export type AccessibilitySeverity = 'critical' | 'serious' | 'moderate' | 'minor';

export type AccessibilityIssueCategory = 
  | 'aria'
  | 'color'
  | 'forms'
  | 'keyboard'
  | 'language'
  | 'labels'
  | 'name-role-value'
  | 'parsing'
  | 'reading'
  | 'semantic-html'
  | 'tables'
  | 'timing'
  | 'contrast'
  | 'images'
  | 'navigation'
  | 'landmarks'
  | 'focus'
  | 'wcag2a'
  | 'wcag2aa'
  | 'wcag21aa'
  | 'best-practice';

export interface AccessibilityIssue {
  id: string;
  impact: AccessibilitySeverity;
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: AccessibilityNode[];
  category: AccessibilityIssueCategory;
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagCriteria?: string[];
  detectedAt: string;
  status: 'open' | 'in-progress' | 'fixed' | 'false-positive' | 'cannot-reproduce';
  assignedTo?: string;
  fixedAt?: string;
  notes?: string;
}

export interface AccessibilityNode {
  html: string;
  target: string[];
  failureSummary: string;
  any: AccessibilityCheckResult[];
  all: AccessibilityCheckResult[];
  none: AccessibilityCheckResult[];
}

export interface AccessibilityCheckResult {
  id: string;
  impact: AccessibilitySeverity;
  message: string;
  data: Record<string, unknown>;
}

export interface AccessibilityAudit {
  id: string;
  url: string;
  timestamp: string;
  issues: AccessibilityIssue[];
  score: AccessibilityScore;
  summary: AccessibilitySummary;
  metadata: AccessibilityAuditMetadata;
}

export interface AccessibilityScore {
  overall: number;
  bySeverity: Record<AccessibilitySeverity, number>;
  byCategory: Record<AccessibilityIssueCategory, number>;
  wcag21aaCompliance: number;
  trend?: AccessibilityScoreTrend[];
}

export interface AccessibilityScoreTrend {
  date: string;
  score: number;
  issuesCount: number;
}

export interface AccessibilitySummary {
  total: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  passed: number;
  incomplete: number;
}

export interface AccessibilityAuditMetadata {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceType: 'desktop' | 'mobile' | 'tablet';
  auditDuration: number;
  tags: string[];
}

export interface AccessibilityComplianceReport {
  id: string;
  title: string;
  description: string;
  generatedAt: string;
  generatedBy: string;
  dateRange: {
    from: string;
    to: string;
  };
  overallScore: number;
  wcag21aaCompliance: number;
  audits: AccessibilityAudit[];
  topIssues: AccessibilityIssue[];
  improvementTrends: AccessibilityTrend[];
  recommendations: AccessibilityRecommendation[];
  executiveSummary: string;
  attachments: ReportAttachment[];
}

export interface AccessibilityTrend {
  category: string;
  metric: 'score' | 'issues_count' | 'compliance_rate';
  trend: 'improving' | 'stable' | 'degrading';
  data: Array<{
    date: string;
    value: number;
  }>;
  changePercent: number;
}

export interface AccessibilityRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  impact: string;
  effort: 'quick' | 'medium' | 'extensive';
  resources: string[];
  examples?: AccessibilityRecommendationExample[];
}

export interface AccessibilityRecommendationExample {
  before: string;
  after: string;
  explanation: string;
}

export interface ReportAttachment {
  id: string;
  filename: string;
  type: 'pdf' | 'csv' | 'json';
  url: string;
  size: number;
  createdAt: string;
}

export interface AccessibilityAuditConfig {
  runOnSchedule: boolean;
  scheduleFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customSchedule?: string; // cron expression
  pagesToAudit: string[];
  wcagLevel: 'A' | 'AA' | 'AAA';
  tags: string[];
  notifyOnCriticalIssues: boolean;
  notifyOnComplianceDrop: number; // percentage threshold
  retentionPeriod: number; // days to keep audit history
}

export interface AccessibilityFixSuggestion {
  issueId: string;
  type: 'code' | 'configuration' | 'content' | 'design';
  description: string;
  priority: number;
  estimatedEffort: string;
  codeSnippet?: {
    before: string;
    after: string;
    language: string;
  };
  resources: string[];
}

export interface AccessibilityAuditHistory {
  id: string;
  auditId: string;
  action: 'created' | 'fixed' | 'false-positive' | 'reopened' | 'assigned';
  timestamp: string;
  user: string;
  notes?: string;
  changes?: Record<string, unknown>;
}

export interface AccessibilityDashboardMetrics {
  overallScore: number;
  wcag21aaCompliance: number;
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  issuesTrend: 'up' | 'down' | 'stable';
  scoreTrend: 'up' | 'down' | 'stable';
  lastAuditDate: string;
  nextAuditDate: string;
  pagesAudited: number;
  pagesPassed: number;
  pagesNeedingAttention: number;
}
