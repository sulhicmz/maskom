/**
 * Skipped Test Scanner Tests
 * 
 * Comprehensive tests for skipped test diagnostic utilities
 */

import {
  SkippedTestInfo,
  SkipCategory,
} from '@/types/testDiagnostics';
import {
  categorizeSkipReason,
  determineSeverity,
  generateRecommendation,
  createSkippedTestInfo,
  calculateCategoryStats,
  getCriticalIssues,
  generateTrendData,
  filterByCategory,
  filterBySeverity,
  searchSkippedTests,
  updateTestSelection,
  bulkUpdateSelection,
  reEnableSelectedTests,
  deleteSelectedTests,
  exportSkippedTestsAsCSV,
} from '@/utils/testDiagnostics/skippedTestScanner';

describe('Skipped Test Scanner - categorizeSkipReason', () => {
  describe('Happy Path', () => {
    it('should categorize timeout reasons correctly', () => {
      expect(categorizeSkipReason('Test timeout exceeded')).toBe('timeout');
      expect(categorizeSkipReason('Time out on API call')).toBe('timeout');
    });

    it('should categorize pending reasons correctly', () => {
      expect(categorizeSkipReason('Pending implementation')).toBe('pending');
      expect(categorizeSkipReason('TODO: fix this test')).toBe('pending');
    });

    it('should categorize fixture issues correctly', () => {
      expect(categorizeSkipReason('Fixture not available')).toBe('fixture-issues');
      expect(categorizeSkipReason('Mock setup failed')).toBe('fixture-issues');
    });

    it('should categorize dependency issues correctly', () => {
      expect(categorizeSkipReason('Dependency missing')).toBe('dependency-issues');
      expect(categorizeSkipReason('Dep version conflict')).toBe('dependency-issues');
    });

    it('should categorize environment issues correctly', () => {
      expect(categorizeSkipReason('Environment variable not set')).toBe('environment-issues');
      expect(categorizeSkipReason('Env config mismatch')).toBe('environment-issues');
    });

    it('should categorize known issues correctly', () => {
      expect(categorizeSkipReason('Known issue #123')).toBe('known-issue');
      expect(categorizeSkipReason('Bug tracking #456')).toBe('known-issue');
    });

    it('should categorize obsolete tests correctly', () => {
      expect(categorizeSkipReason('Feature deprecated')).toBe('obsolete');
      expect(categorizeSkipReason('Code no longer exists')).toBe('obsolete');
    });

    it('should categorize temporary skips correctly', () => {
      expect(categorizeSkipReason('Temporary skip for migration')).toBe('temporary');
      expect(categorizeSkipReason('Temp disable for release')).toBe('temporary');
    });

    it('should categorize general skips correctly', () => {
      expect(categorizeSkipReason('Skip this test')).toBe('skip');
    });
  });

  describe('Sad Path', () => {
    it('should return unknown for unrecognized reasons', () => {
      expect(categorizeSkipReason('Some random reason')).toBe('unknown');
      expect(categorizeSkipReason('')).toBe('unknown');
    });
  });

  describe('Edge Cases', () => {
    it('should be case-insensitive', () => {
      expect(categorizeSkipReason('TIMEOUT')).toBe('timeout');
      expect(categorizeSkipReason('Pending')).toBe('pending');
    });

    it('should handle mixed case reasons', () => {
      expect(categorizeSkipReason('Test TIMEOUT Exceeded')).toBe('timeout');
    });
  });
});

describe('Skipped Test Scanner - determineSeverity', () => {
  describe('Happy Path', () => {
    it('should assign medium severity to timeout', () => {
      expect(determineSeverity('timeout', 'Test timeout')).toBe('medium');
    });

    it('should assign high severity to fixture issues', () => {
      expect(determineSeverity('fixture-issues', 'Fixture missing')).toBe('high');
    });

    it('should assign high severity to dependency issues', () => {
      expect(determineSeverity('dependency-issues', 'Dependency conflict')).toBe('high');
    });

    it('should assign critical severity to obsolete tests', () => {
      expect(determineSeverity('obsolete', 'Feature deprecated')).toBe('critical');
    });

    it('should assign medium severity to known issues', () => {
      expect(determineSeverity('known-issue', 'Bug tracking #123')).toBe('medium');
    });

    it('should assign high severity to critical known issues', () => {
      expect(determineSeverity('known-issue', 'Critical security bug')).toBe('high');
    });

    it('should assign low severity to pending tests', () => {
      expect(determineSeverity('pending', 'TODO: implement')).toBe('low');
    });

    it('should assign low severity to temporary skips', () => {
      expect(determineSeverity('temporary', 'Temp disable')).toBe('low');
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown category', () => {
      expect(determineSeverity('unknown' as SkipCategory, 'Unknown reason')).toBe('medium');
    });
  });
});

describe('Skipped Test Scanner - generateRecommendation', () => {
  describe('Happy Path', () => {
    it('should recommend increasing timeout for timeout category', () => {
      const result = generateRecommendation('timeout', 'medium', 'Test timeout');
      expect(result.recommendation).toBe('increase-timeout');
      expect(result.recommendationText).toContain('timeout');
    });

    it('should recommend fixing fixtures for fixture issues', () => {
      const result = generateRecommendation('fixture-issues', 'high', 'Fixture missing');
      expect(result.recommendation).toBe('fix-fixtures');
      expect(result.recommendationText).toContain('fixtures');
    });

    it('should recommend fixing dependencies for dependency issues', () => {
      const result = generateRecommendation('dependency-issues', 'high', 'Dep conflict');
      expect(result.recommendation).toBe('fix-dependencies');
      expect(result.recommendationText).toContain('dependencies');
    });

    it('should recommend removing obsolete tests', () => {
      const result = generateRecommendation('obsolete', 'critical', 'Feature deprecated');
      expect(result.recommendation).toBe('remove-test');
      expect(result.recommendationText).toContain('Remove');
    });

    it('should recommend fixing high severity known issues', () => {
      const result = generateRecommendation('known-issue', 'high', 'Critical bug');
      expect(result.recommendation).toBe('fix-test');
      expect(result.recommendationText).toContain('Fix');
    });

    it('should recommend investigating medium severity known issues', () => {
      const result = generateRecommendation('known-issue', 'medium', 'Bug tracking #123');
      expect(result.recommendation).toBe('investigate');
      expect(result.recommendationText).toContain('Investigate');
    });

    it('should recommend fixing pending tests', () => {
      const result = generateRecommendation('pending', 'low', 'TODO: implement');
      expect(result.recommendation).toBe('fix-test');
      expect(result.recommendationText).toContain('Complete');
    });

    it('should recommend fixing temporary skips', () => {
      const result = generateRecommendation('temporary', 'low', 'Temp disable');
      expect(result.recommendation).toBe('fix-test');
      expect(result.recommendationText).toContain('Resolve');
    });
  });

  describe('Edge Cases', () => {
    it('should recommend investigating unknown categories', () => {
      const result = generateRecommendation('unknown' as SkipCategory, 'medium', 'Unknown reason');
      expect(result.recommendation).toBe('investigate');
      expect(result.recommendationText).toContain('Investigate');
    });
  });
});

describe('Skipped Test Scanner - createSkippedTestInfo', () => {
  describe('Happy Path', () => {
    it('should create valid SkippedTestInfo object', () => {
      const testInfo = createSkippedTestInfo(
        'testFile.test.ts',
        'should pass',
        'Test timeout',
      );

      expect(testInfo.id).toBe('testFile.test.ts:should pass');
      expect(testInfo.testFile).toBe('testFile.test.ts');
      expect(testInfo.testName).toBe('should pass');
      expect(testInfo.skipReason).toBe('Test timeout');
      expect(testInfo.category).toBe('timeout');
      expect(testInfo.severity).toBe('medium');
      expect(testInfo.skipCount).toBe(1);
    });

    it('should use default skip date if not provided', () => {
      const before = new Date();
      const testInfo = createSkippedTestInfo('test.ts', 'test', 'reason');
      const after = new Date();

      expect(testInfo.skipDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(testInfo.skipDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided skip date', () => {
      const skipDate = new Date('2026-01-21');
      const testInfo = createSkippedTestInfo('test.ts', 'test', 'reason', skipDate);

      expect(testInfo.skipDate).toEqual(skipDate);
    });

    it('should use provided skip count', () => {
      const testInfo = createSkippedTestInfo('test.ts', 'test', 'reason', new Date(), 5);

      expect(testInfo.skipCount).toBe(5);
    });
  });
});

describe('Skipped Test Scanner - calculateCategoryStats', () => {
  describe('Happy Path', () => {
    it('should calculate statistics for empty array', () => {
      const stats = calculateCategoryStats([]);
      expect(stats).toEqual([]);
    });

    it('should calculate statistics for single category', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'timeout'),
        createSkippedTestInfo('test2.ts', 'test2', 'timeout'),
      ];
      const stats = calculateCategoryStats(tests);

      expect(stats).toHaveLength(1);
      expect(stats[0].category).toBe('timeout');
      expect(stats[0].count).toBe(2);
      expect(stats[0].percentage).toBe(100);
    });

    it('should calculate statistics for multiple categories', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'timeout'),
        createSkippedTestInfo('test2.ts', 'test2', 'timeout'),
        createSkippedTestInfo('test3.ts', 'test3', 'pending'),
        createSkippedTestInfo('test4.ts', 'test4', 'obsolete'),
      ];
      const stats = calculateCategoryStats(tests);

      expect(stats).toHaveLength(3);
      expect(stats[0].category).toBe('timeout');
      expect(stats[0].percentage).toBe(50);
      expect(stats[1].category).toBe('pending');
      expect(stats[1].percentage).toBe(25);
      expect(stats[2].category).toBe('obsolete');
      expect(stats[2].percentage).toBe(25);
    });

    it('should calculate severity breakdown', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'timeout'), // medium
        createSkippedTestInfo('test2.ts', 'test2', 'pending'), // low
        createSkippedTestInfo('test3.ts', 'test3', 'obsolete'), // critical
      ];
      const stats = calculateCategoryStats(tests);

      expect(stats).toHaveLength(3);
      expect(stats[0].severityBreakdown.medium).toBe(1);
      expect(stats[1].severityBreakdown.low).toBe(1);
      expect(stats[2].severityBreakdown.critical).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should sort by count descending', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'pending'),
        createSkippedTestInfo('test2.ts', 'test2', 'timeout'),
        createSkippedTestInfo('test3.ts', 'test3', 'timeout'),
      ];
      const stats = calculateCategoryStats(tests);

      expect(stats[0].category).toBe('timeout');
      expect(stats[0].count).toBe(2);
      expect(stats[1].category).toBe('pending');
      expect(stats[1].count).toBe(1);
    });
  });
});

describe('Skipped Test Scanner - getCriticalIssues', () => {
  describe('Happy Path', () => {
    it('should return empty array for no tests', () => {
      const critical = getCriticalIssues([]);
      expect(critical).toEqual([]);
    });

    it('should identify critical severity tests', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'obsolete'), // critical
        createSkippedTestInfo('test2.ts', 'test2', 'timeout'), // medium
      ];
      const critical = getCriticalIssues(tests);

      expect(critical).toHaveLength(1);
      expect(critical[0].severity).toBe('critical');
    });

    it('should identify high severity tests with skip count > 5', () => {
      const test = createSkippedTestInfo('test.ts', 'test', 'fixture-issues');
      test.skipCount = 10;
      const critical = getCriticalIssues([test]);

      expect(critical).toHaveLength(1);
    });

    it('should not include high severity tests with skip count <= 5', () => {
      const test = createSkippedTestInfo('test.ts', 'test', 'fixture-issues');
      test.skipCount = 3;
      const critical = getCriticalIssues([test]);

      expect(critical).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const critical = getCriticalIssues([]);
      expect(critical).toEqual([]);
    });
  });
});

describe('Skipped Test Scanner - generateTrendData', () => {
  describe('Happy Path', () => {
    it('should generate 8 weeks of trend data by default', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test.ts', 'test', 'timeout'),
      ];
      const trend = generateTrendData(tests);

      expect(trend).toHaveLength(8);
    });

    it('should generate specified number of weeks', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test.ts', 'test', 'timeout'),
      ];
      const trend = generateTrendData(tests, 4);

      expect(trend).toHaveLength(4);
    });

    it('should include category breakdown', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'timeout'),
        createSkippedTestInfo('test2.ts', 'test2', 'pending'),
      ];
      const trend = generateTrendData(tests);

      expect(trend[0].categoryBreakdown).toBeDefined();
      expect(trend[0].categoryBreakdown.timeout).toBeDefined();
      expect(trend[0].categoryBreakdown.pending).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tests array', () => {
      const trend = generateTrendData([]);
      expect(trend).toHaveLength(8);
      trend.forEach(week => {
        expect(week.newSkips).toBe(0);
      });
    });
  });
});

describe('Skipped Test Scanner - filterByCategory', () => {
  describe('Happy Path', () => {
    it('should return all tests when category is undefined', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'timeout'),
        createSkippedTestInfo('test2.ts', 'test2', 'pending'),
      ];
      const filtered = filterByCategory(tests, undefined);

      expect(filtered).toHaveLength(2);
    });

    it('should filter by category', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'timeout'),
        createSkippedTestInfo('test2.ts', 'test2', 'pending'),
      ];
      const filtered = filterByCategory(tests, 'timeout');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('timeout');
    });

    it('should return empty when no tests match category', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test.ts', 'test', 'timeout'),
      ];
      const filtered = filterByCategory(tests, 'obsolete');

      expect(filtered).toHaveLength(0);
    });
  });
});

describe('Skipped Test Scanner - filterBySeverity', () => {
  describe('Happy Path', () => {
    it('should return all tests when severity is undefined', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'timeout'), // medium
        createSkippedTestInfo('test2.ts', 'test2', 'pending'), // low
      ];
      const filtered = filterBySeverity(tests, undefined);

      expect(filtered).toHaveLength(2);
    });

    it('should filter by severity', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'timeout'), // medium
        createSkippedTestInfo('test2.ts', 'test2', 'obsolete'), // critical
      ];
      const filtered = filterBySeverity(tests, 'critical');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].severity).toBe('critical');
    });

    it('should return empty when no tests match severity', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test.ts', 'test', 'pending'), // low
      ];
      const filtered = filterBySeverity(tests, 'critical');

      expect(filtered).toHaveLength(0);
    });
  });
});

describe('Skipped Test Scanner - searchSkippedTests', () => {
  describe('Happy Path', () => {
    it('should search by test name', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'should login successfully', 'timeout'),
        createSkippedTestInfo('test2.ts', 'should logout successfully', 'pending'),
      ];
      const results = searchSkippedTests(tests, 'login');

      expect(results).toHaveLength(1);
      expect(results[0].testName).toContain('login');
    });

    it('should search by test file', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('auth.test.ts', 'should login', 'timeout'),
        createSkippedTestInfo('user.test.ts', 'should logout', 'pending'),
      ];
      const results = searchSkippedTests(tests, 'auth');

      expect(results).toHaveLength(1);
      expect(results[0].testFile).toContain('auth');
    });

    it('should search by skip reason', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'Test timeout exceeded'),
        createSkippedTestInfo('test2.ts', 'test2', 'Pending implementation'),
      ];
      const results = searchSkippedTests(tests, 'timeout');

      expect(results).toHaveLength(1);
      expect(results[0].skipReason).toContain('timeout');
    });

    it('should be case-insensitive', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test.ts', 'Should Login', 'timeout'),
      ];
      const results = searchSkippedTests(tests, 'login');

      expect(results).toHaveLength(1);
    });
  });

  describe('Sad Path', () => {
    it('should return empty when no matches found', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test.ts', 'test1', 'timeout'),
      ];
      const results = searchSkippedTests(tests, 'nonexistent');

      expect(results).toHaveLength(0);
    });

    it('should handle empty search term', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test.ts', 'test1', 'timeout'),
      ];
      const results = searchSkippedTests(tests, '');

      expect(results).toHaveLength(1);
    });
  });
});

describe('Skipped Test Scanner - updateTestSelection', () => {
  describe('Happy Path', () => {
    it('should update selection for specific test', () => {
      const tests: SkippedTestInfo[] = [
        { ...createSkippedTestInfo('test1.ts', 'test1', 'timeout'), isSelected: false },
        { ...createSkippedTestInfo('test2.ts', 'test2', 'pending'), isSelected: false },
      ];
      const updated = updateTestSelection(tests, 'test1.ts:test1', true);

      expect(updated[0].isSelected).toBe(true);
      expect(updated[1].isSelected).toBe(false);
    });

    it('should unselect test', () => {
      const tests: SkippedTestInfo[] = [
        { ...createSkippedTestInfo('test1.ts', 'test1', 'timeout'), isSelected: true },
      ];
      const updated = updateTestSelection(tests, 'test1.ts:test1', false);

      expect(updated[0].isSelected).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should not update other tests', () => {
      const tests: SkippedTestInfo[] = [
        { ...createSkippedTestInfo('test1.ts', 'test1', 'timeout'), isSelected: false },
        { ...createSkippedTestInfo('test2.ts', 'test2', 'pending'), isSelected: false },
      ];
      const updated = updateTestSelection(tests, 'test1.ts:test1', true);

      expect(updated[0].isSelected).toBe(true);
      expect(updated[1].isSelected).toBe(false);
    });
  });
});

describe('Skipped Test Scanner - bulkUpdateSelection', () => {
  describe('Happy Path', () => {
    it('should update all tests when no filter provided', () => {
      const tests: SkippedTestInfo[] = [
        { ...createSkippedTestInfo('test1.ts', 'test1', 'timeout'), isSelected: false },
        { ...createSkippedTestInfo('test2.ts', 'test2', 'pending'), isSelected: false },
      ];
      const updated = bulkUpdateSelection(tests, true);

      expect(updated[0].isSelected).toBe(true);
      expect(updated[1].isSelected).toBe(true);
    });

    it('should update tests matching filter', () => {
      const tests: SkippedTestInfo[] = [
        { ...createSkippedTestInfo('test1.ts', 'test1', 'timeout'), isSelected: false },
        { ...createSkippedTestInfo('test2.ts', 'test2', 'pending'), isSelected: false },
      ];
      const updated = bulkUpdateSelection(tests, true, test => test.category === 'timeout');

      expect(updated[0].isSelected).toBe(true);
      expect(updated[1].isSelected).toBe(false);
    });
  });
});

describe('Skipped Test Scanner - reEnableSelectedTests', () => {
  describe('Happy Path', () => {
    it('should return empty array when no tests selected', () => {
      const tests: SkippedTestInfo[] = [
        { ...createSkippedTestInfo('test.ts', 'test', 'timeout'), isSelected: false },
      ];
      const reEnabled = reEnableSelectedTests(tests);

      expect(reEnabled).toHaveLength(0);
    });

    it('should return selected test IDs', () => {
      const tests: SkippedTestInfo[] = [
        { ...createSkippedTestInfo('test1.ts', 'test1', 'timeout'), isSelected: true },
        { ...createSkippedTestInfo('test2.ts', 'test2', 'pending'), isSelected: false },
      ];
      const reEnabled = reEnableSelectedTests(tests);

      expect(reEnabled).toHaveLength(1);
      expect(reEnabled[0]).toBe('test1.ts:test1');
    });
  });
});

describe('Skipped Test Scanner - deleteSelectedTests', () => {
  describe('Happy Path', () => {
    it('should only delete obsolete tests', () => {
      const tests: SkippedTestInfo[] = [
        { ...createSkippedTestInfo('test1.ts', 'test1', 'obsolete'), isSelected: true },
        { ...createSkippedTestInfo('test2.ts', 'test2', 'timeout'), isSelected: true },
      ];
      const deleted = deleteSelectedTests(tests);

      expect(deleted).toHaveLength(1);
      expect(deleted[0]).toBe('test1.ts:test1');
    });

    it('should return empty when no obsolete tests selected', () => {
      const tests: SkippedTestInfo[] = [
        { ...createSkippedTestInfo('test.ts', 'test', 'timeout'), isSelected: true },
      ];
      const deleted = deleteSelectedTests(tests);

      expect(deleted).toHaveLength(0);
    });
  });
});

describe('Skipped Test Scanner - exportSkippedTestsAsCSV', () => {
  describe('Happy Path', () => {
    it('should export empty tests as CSV', () => {
      const csv = exportSkippedTestsAsCSV([]);

      expect(csv).toContain('Test ID');
      expect(csv).toContain('Test File');
      expect(csv).toContain('Test Name');
    });

    it('should export single test as CSV', () => {
      const test = createSkippedTestInfo('test.ts', 'should pass', 'Test timeout');
      const csv = exportSkippedTestsAsCSV([test]);

      expect(csv).toContain('test.ts:should pass');
      expect(csv).toContain('test.ts');
      expect(csv).toContain('should pass');
      expect(csv).toContain('Test timeout');
    });

    it('should export multiple tests as CSV', () => {
      const tests: SkippedTestInfo[] = [
        createSkippedTestInfo('test1.ts', 'test1', 'timeout'),
        createSkippedTestInfo('test2.ts', 'test2', 'pending'),
      ];
      const csv = exportSkippedTestsAsCSV(tests);

      expect(csv.split('\n').length).toBe(3); // header + 2 tests
    });

    it('should include all fields in CSV', () => {
      const test = createSkippedTestInfo('test.ts', 'test', 'timeout');
      const csv = exportSkippedTestsAsCSV([test]);

      expect(csv).toContain('Test ID');
      expect(csv).toContain('Test File');
      expect(csv).toContain('Test Name');
      expect(csv).toContain('Skip Reason');
      expect(csv).toContain('Category');
      expect(csv).toContain('Severity');
      expect(csv).toContain('Recommendation');
      expect(csv).toContain('Skip Date');
      expect(csv).toContain('Skip Count');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in test names', () => {
      const test = createSkippedTestInfo('test.ts', 'should "pass" with, commas', 'timeout');
      const csv = exportSkippedTestsAsCSV([test]);

      expect(csv).toContain('"should "pass" with, commas"');
    });
  });
});
