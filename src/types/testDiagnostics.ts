/**
 * Test Diagnostics Type Definitions
 * 
 * This module defines types for test diagnostic functionality, including
 * skipped test tracking, categorization, and analysis.
 */

/**
 * Skip reason categories for tests
 */
export type SkipCategory =
  | 'timeout'
  | 'pending'
  | 'skip'
  | 'fixture-issues'
  | 'dependency-issues'
  | 'environment-issues'
  | 'known-issue'
  | 'obsolete'
  | 'temporary'
  | 'unknown';

/**
 * Recommendation types for skipped tests
 */
export type SkipRecommendation =
  | 'fix-test'
  | 'fix-fixtures'
  | 'fix-dependencies'
  | 'increase-timeout'
  | 'remove-test'
  | 'investigate'
  | 'resolve-dep'
  | 'update-test'
  | 'no-action';

/**
 * Severity level for skipped test
 */
export type SkipSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Information about a skipped test
 */
export interface SkippedTestInfo {
  id: string;
  testFile: string;
  testName: string;
  skipReason: string;
  category: SkipCategory;
  severity: SkipSeverity;
  recommendation: SkipRecommendation;
  recommendationText: string;
  lastRunDate?: Date;
  skipDate: Date;
  skipCount: number;
  isSelected?: boolean;
}

/**
 * Statistics for skipped tests by category
 */
export interface SkipCategoryStats {
  category: SkipCategory;
  count: number;
  percentage: number;
  severityBreakdown: Record<SkipSeverity, number>;
}

/**
 * Trend data for skipped tests
 */
export interface SkipTrendData {
  date: string;
  totalSkipped: number;
  newSkips: number;
  resolvedSkips: number;
  categoryBreakdown: Record<SkipCategory, number>;
}

/**
 * Diagnostic report for skipped tests
 */
export interface SkippedTestDiagnosticReport {
  scanDate: Date;
  totalSkippedTests: number;
  categoryStats: SkipCategoryStats[];
  trendData: SkipTrendData[];
  criticalIssues: SkippedTestInfo[];
  recommendations: {
    fixable: number;
    obsolete: number;
    requiresInvestigation: number;
  };
}
