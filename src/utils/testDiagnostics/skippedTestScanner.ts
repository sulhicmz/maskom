/**
 * Skipped Test Diagnostic Utility
 * 
 * This module provides utilities for scanning, categorizing, and analyzing
 * skipped tests in the Jest test suite.
 */

import {
  SkippedTestInfo,
  SkipCategory,
  SkipRecommendation,
  SkipSeverity,
  SkipCategoryStats,
  SkipTrendData,
  SkippedTestDiagnosticReport,
} from '@/types/testDiagnostics';

/**
 * Determine skip category from skip reason
 */
export function categorizeSkipReason(reason: string): SkipCategory {
  const lowerReason = reason.toLowerCase();

  const words = lowerReason.split(/\s+/);

  if (lowerReason.includes('timeout') || lowerReason.includes('time out')) {
    return 'timeout';
  }
  if (words.some(w => ['pending', 'todo'].includes(w))) {
    return 'pending';
  }
  if (words.some(w => ['fixture', 'mock'].includes(w))) {
    return 'fixture-issues';
  }
  if (words.some(w => ['obsolete', 'deprecated'].includes(w))) {
    return 'obsolete';
  }
  if (lowerReason.includes('no longer exists')) {
    return 'obsolete';
  }
  if (words.some(w => ['dependen', 'dep'].includes(w))) {
    return 'dependency-issues';
  }
  if (words.some(w => ['environment', 'env'].includes(w))) {
    return 'environment-issues';
  }
  if (words.some(w => ['known', 'bug'].includes(w))) {
    return 'known-issue';
  }
  if (words.some(w => ['temporary', 'temp'].includes(w))) {
    return 'temporary';
  }
  if (words.some(w => ['skip'].includes(w))) {
    return 'skip';
  }

  return 'unknown';
}

/**
 * Determine severity based on category and reason
 */
export function determineSeverity(category: SkipCategory, reason: string): SkipSeverity {
  const lowerReason = reason.toLowerCase();

  switch (category) {
    case 'timeout':
      return 'medium';
    case 'fixture-issues':
    case 'dependency-issues':
      return 'high';
    case 'obsolete':
      return 'critical';
    case 'known-issue':
      return lowerReason.includes('critical') || lowerReason.includes('security') ? 'high' : 'medium';
    case 'pending':
    case 'temporary':
      return 'low';
    default:
      return 'medium';
  }
}

/**
 * Generate recommendation based on category and severity
 */
export function generateRecommendation(
  category: SkipCategory,
  severity: SkipSeverity,
  reason: string,
): { recommendation: SkipRecommendation; recommendationText: string } {
  switch (category) {
    case 'timeout':
      return {
        recommendation: 'increase-timeout',
        recommendationText: 'Increase test timeout or optimize test execution',
      };
    case 'fixture-issues':
      return {
        recommendation: 'fix-fixtures',
        recommendationText: 'Fix or update test fixtures/mocks',
      };
    case 'dependency-issues':
      return {
        recommendation: 'fix-dependencies',
        recommendationText: 'Resolve dependency conflicts or update dependencies',
      };
    case 'obsolete':
      return {
        recommendation: 'remove-test',
        recommendationText: 'Remove obsolete test - feature or code no longer exists',
      };
    case 'known-issue':
      const isCritical = severity === 'high' || (reason.toLowerCase().includes('critical') || reason.toLowerCase().includes('security'));
      return {
        recommendation: isCritical ? 'fix-test' : 'investigate',
        recommendationText: isCritical
          ? 'Fix known issue or implement workaround'
          : 'Investigate known issue and determine resolution path',
      };
    case 'pending':
      return {
        recommendation: 'fix-test',
        recommendationText: 'Complete pending test implementation',
      };
    case 'temporary':
      return {
        recommendation: 'fix-test',
        recommendationText: 'Resolve temporary issue and re-enable test',
      };
    default:
      return {
        recommendation: 'investigate',
        recommendationText: 'Investigate skip reason and determine appropriate action',
      };
  }
}

/**
 * Create SkippedTestInfo from test data
 */
export function createSkippedTestInfo(
  testFile: string,
  testName: string,
  skipReason: string,
  skipDate: Date = new Date(),
  skipCount: number = 1,
): SkippedTestInfo {
  const category = categorizeSkipReason(skipReason);
  const severity = determineSeverity(category, skipReason);
  const { recommendation, recommendationText } = generateRecommendation(
    category,
    severity,
    skipReason,
  );

  return {
    id: `${testFile}:${testName}`,
    testFile,
    testName,
    skipReason,
    category,
    severity,
    recommendation,
    recommendationText,
    skipDate,
    skipCount,
  };
}

/**
 * Calculate category statistics from skipped tests
 */
export function calculateCategoryStats(
  skippedTests: SkippedTestInfo[],
): SkipCategoryStats[] {
  const total = skippedTests.length;

  if (total === 0) {
    return [];
  }

  const categoryMap = new Map<SkipCategory, SkippedTestInfo[]>();

  skippedTests.forEach(test => {
    const existing = categoryMap.get(test.category) || [];
    existing.push(test);
    categoryMap.set(test.category, existing);
  });

  const stats: SkipCategoryStats[] = [];

  categoryMap.forEach((tests, category) => {
    const severityBreakdown: Record<SkipSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    tests.forEach(test => {
      severityBreakdown[test.severity]++;
    });

    stats.push({
      category,
      count: tests.length,
      percentage: (tests.length / total) * 100,
      severityBreakdown,
    });
  });

  return stats.sort((a, b) => b.count - a.count);
}

/**
 * Get critical issues from skipped tests
 */
export function getCriticalIssues(
  skippedTests: SkippedTestInfo[],
): SkippedTestInfo[] {
  return skippedTests.filter(
    test =>
      test.severity === 'critical' ||
      (test.severity === 'high' && test.skipCount > 5),
  );
}

/**
 * Generate trend data for skipped tests
 * In production, this would use historical data from CI/CD
 */
export function generateTrendData(
  skippedTests: SkippedTestInfo[],
  weeks: number = 8,
): SkipTrendData[] {
  const trendData: SkipTrendData[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Count tests skipped in this week
    const newSkips = skippedTests.filter(
      test => test.skipDate >= weekStart && test.skipDate < weekEnd,
    ).length;

    // Category breakdown
    const categoryBreakdown: Record<SkipCategory, number> = {
      timeout: 0,
      pending: 0,
      skip: 0,
      'fixture-issues': 0,
      'dependency-issues': 0,
      'environment-issues': 0,
      'known-issue': 0,
      obsolete: 0,
      temporary: 0,
      unknown: 0,
    };

    skippedTests
      .filter(test => test.skipDate >= weekStart && test.skipDate < weekEnd)
      .forEach(test => {
        categoryBreakdown[test.category]++;
      });

    trendData.push({
      date: weekStart.toISOString().split('T')[0],
      totalSkipped: skippedTests.length,
      newSkips,
      resolvedSkips: 0, // Would be calculated from historical data
      categoryBreakdown,
    });
  }

  return trendData;
}

/**
 * Scan all test files for skipped tests
 * This is a placeholder that would use Jest's JSON reporter in production
 */
export async function scanForSkippedTests(
  _testDirectory: string = 'src',
): Promise<SkippedTestInfo[]> {
  // In production, this would:
  // 1. Run Jest with --json flag to get test results
  // 2. Parse the JSON output for skipped tests
  // 3. Extract test file paths and skip reasons

  // For now, return empty array
  return [];
}

/**
 * Generate diagnostic report for skipped tests
 */
export async function generateDiagnosticReport(
  testDirectory: string = 'src',
): Promise<SkippedTestDiagnosticReport> {
  const skippedTests = await scanForSkippedTests(testDirectory);
  const categoryStats = calculateCategoryStats(skippedTests);
  const criticalIssues = getCriticalIssues(skippedTests);
  const trendData = generateTrendData(skippedTests);

  const recommendations = {
    fixable: skippedTests.filter(t =>
      ['fix-test', 'fix-fixtures', 'fix-dependencies', 'increase-timeout'].includes(t.recommendation),
    ).length,
    obsolete: skippedTests.filter(t => t.category === 'obsolete').length,
    requiresInvestigation: skippedTests.filter(t =>
      ['investigate', 'resolve-dep'].includes(t.recommendation),
    ).length,
  };

  return {
    scanDate: new Date(),
    totalSkippedTests: skippedTests.length,
    categoryStats,
    trendData,
    criticalIssues,
    recommendations,
  };
}

/**
 * Update skipped test selection state
 */
export function updateTestSelection(
  skippedTests: SkippedTestInfo[],
  testId: string,
  isSelected: boolean,
): SkippedTestInfo[] {
  return skippedTests.map(test =>
    test.id === testId ? { ...test, isSelected } : test,
  );
}

/**
 * Bulk update skipped test selection
 */
export function bulkUpdateSelection(
  skippedTests: SkippedTestInfo[],
  isSelected: boolean,
  filterFn?: (test: SkippedTestInfo) => boolean,
): SkippedTestInfo[] {
  return skippedTests.map(test => {
    const shouldUpdate = filterFn ? filterFn(test) : true;
    return shouldUpdate ? { ...test, isSelected } : test;
  });
}

/**
 * Re-enable selected skipped tests
 * This would update the test files to remove skip annotations
 */
export function reEnableSelectedTests(
  skippedTests: SkippedTestInfo[],
): string[] {
  const selectedTests = skippedTests.filter(t => t.isSelected);
  const reEnabled: string[] = [];

  // In production, this would:
  // 1. Parse the test file
  // 2. Remove .skip from test.describe or test.it
  // 3. Remove skip reason comments
  // 4. Write the file back

  selectedTests.forEach(test => {
    reEnabled.push(test.id);
  });

  return reEnabled;
}

/**
 * Delete selected obsolete tests
 * This would remove obsolete tests from test files
 */
export function deleteSelectedTests(
  skippedTests: SkippedTestInfo[],
): string[] {
  const selectedTests = skippedTests.filter(t => t.isSelected && t.category === 'obsolete');
  const deleted: string[] = [];

  // In production, this would:
  // 1. Parse the test file
  // 2. Remove the test block
  // 3. Write the file back

  selectedTests.forEach(test => {
    deleted.push(test.id);
  });

  return deleted;
}

/**
 * Export skipped test data as CSV
 */
export function exportSkippedTestsAsCSV(
  skippedTests: SkippedTestInfo[],
): string {
  const headers = [
    'Test ID',
    'Test File',
    'Test Name',
    'Skip Reason',
    'Category',
    'Severity',
    'Recommendation',
    'Skip Date',
    'Skip Count',
  ];

  const rows = skippedTests.map(test => [
    test.id,
    test.testFile,
    test.testName,
    test.skipReason,
    test.category,
    test.severity,
    test.recommendationText,
    test.skipDate.toISOString(),
    test.skipCount,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Filter skipped tests by category
 */
export function filterByCategory(
  skippedTests: SkippedTestInfo[],
  category?: SkipCategory,
): SkippedTestInfo[] {
  if (!category) {
    return skippedTests;
  }
  return skippedTests.filter(test => test.category === category);
}

/**
 * Filter skipped tests by severity
 */
export function filterBySeverity(
  skippedTests: SkippedTestInfo[],
  severity?: SkipSeverity,
): SkippedTestInfo[] {
  if (!severity) {
    return skippedTests;
  }
  return skippedTests.filter(test => test.severity === severity);
}

/**
 * Search skipped tests
 */
export function searchSkippedTests(
  skippedTests: SkippedTestInfo[],
  searchTerm: string,
): SkippedTestInfo[] {
  const lowerTerm = searchTerm.toLowerCase();
  return skippedTests.filter(
    test =>
      test.testName.toLowerCase().includes(lowerTerm) ||
      test.testFile.toLowerCase().includes(lowerTerm) ||
      test.skipReason.toLowerCase().includes(lowerTerm),
  );
}
