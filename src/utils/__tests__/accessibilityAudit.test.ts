import {
  mapAxeImpactToSeverity,
  mapAxeTagsToCategory,
  extractWcagCriteria,
  determineWcagLevel,
  calculateScore,
  createSummary,
  getDeviceType,
  calculateScoreImprovement,
  getHighPriorityIssues,
  getWcag21aaCompliance,
  meetsComplianceThreshold,
  getScoreTrend,
} from '../accessibilityAudit';
import type {
  AccessibilityIssueCategory,
  AccessibilityIssue,
  AccessibilityScore,
  AccessibilityScoreTrend,
} from '@/types/accessibility';

// Mock audit results
const mockAuditWithCritical = {
  total: 5,
  critical: 2,
  serious: 1,
  moderate: 1,
  minor: 1,
};

const mockAuditWithNoIssues = {
  total: 0,
  critical: 0,
  serious: 0,
  moderate: 0,
  minor: 0,
};

describe('Accessibility Audit Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('mapAxeImpactToSeverity', () => {
    it('should map critical impact to critical severity', () => {
      expect(mapAxeImpactToSeverity('critical')).toBe('critical');
    });

    it('should map serious impact to serious severity', () => {
      expect(mapAxeImpactToSeverity('serious')).toBe('serious');
    });

    it('should map moderate impact to moderate severity', () => {
      expect(mapAxeImpactToSeverity('moderate')).toBe('moderate');
    });

    it('should map minor impact to minor severity', () => {
      expect(mapAxeImpactToSeverity('minor')).toBe('minor');
    });

    it('should default to moderate for null impact', () => {
      expect(mapAxeImpactToSeverity(null)).toBe('moderate');
    });

    it('should default to moderate for unknown impact', () => {
      expect(mapAxeImpactToSeverity('unknown' as any)).toBe('moderate');
    });
  });

  describe('mapAxeTagsToCategory', () => {
    it('should map wcag2a tag to wcag2a category', () => {
      expect(mapAxeTagsToCategory(['wcag2a'])).toBe('wcag2a');
    });

    it('should map wcag2aa tag to wcag2aa category', () => {
      expect(mapAxeTagsToCategory(['wcag2aa'])).toBe('wcag2aa');
    });

    it('should map wcag21aa tag to wcag21aa category', () => {
      expect(mapAxeTagsToCategory(['wcag21aa'])).toBe('wcag21aa');
    });

    it('should map best-practice tag to best-practice category', () => {
      expect(mapAxeTagsToCategory(['best-practice'])).toBe('best-practice');
    });

    it('should map aria tag to aria category', () => {
      expect(mapAxeTagsToCategory(['aria'])).toBe('aria');
    });

    it('should map keyboard tag to keyboard category', () => {
      expect(mapAxeTagsToCategory(['keyboard'])).toBe('keyboard');
    });

    it('should default to semantic-html for unknown tags', () => {
      expect(mapAxeTagsToCategory(['unknown'])).toBe('semantic-html');
    });

    it('should prioritize WCAG tags over other tags', () => {
      expect(mapAxeTagsToCategory(['aria', 'wcag21aa'])).toBe('wcag21aa');
    });
  });

  describe('extractWcagCriteria', () => {
    it('should extract wcag2a criterion', () => {
      const criteria = extractWcagCriteria(['wcag2a', 'aria', 'color']);
      expect(criteria).toEqual(['wcag2a']);
    });

    it('should extract multiple wcag2 criteria', () => {
      const criteria = extractWcagCriteria(['wcag2a', 'wcag2aa', 'wcag21aa', 'color']);
      expect(criteria).toEqual(['wcag2a', 'wcag2aa', 'wcag21aa']);
    });

    it('should return empty array for no WCAG tags', () => {
      const criteria = extractWcagCriteria(['aria', 'color', 'keyboard']);
      expect(criteria).toEqual([]);
    });
  });

  describe('determineWcagLevel', () => {
    it('should determine AA level for wcag21aa tag', () => {
      expect(determineWcagLevel(['wcag21aa'])).toBe('AA');
    });

    it('should determine AA level for wcag2aa tag', () => {
      expect(determineWcagLevel(['wcag2aa'])).toBe('AA');
    });

    it('should determine A level for wcag2a tag', () => {
      expect(determineWcagLevel(['wcag2a'])).toBe('A');
    });

    it('should default to AA for unknown tags', () => {
      expect(determineWcagLevel(['aria', 'color'])).toBe('AA');
    });

    it('should prioritize wcag21aa over wcag2aa', () => {
      expect(determineWcagLevel(['wcag2aa', 'wcag21aa'])).toBe('AA');
    });
  });

  describe('getDeviceType', () => {
    it('should return mobile for small screens', () => {
      expect(getDeviceType(500)).toBe('mobile');
      expect(getDeviceType(767)).toBe('mobile');
    });

    it('should return tablet for medium screens', () => {
      expect(getDeviceType(768)).toBe('tablet');
      expect(getDeviceType(1023)).toBe('tablet');
    });

    it('should return desktop for large screens', () => {
      expect(getDeviceType(1024)).toBe('desktop');
      expect(getDeviceType(1920)).toBe('desktop');
    });
  });

  describe('calculateScore', () => {
    it('should calculate score correctly for audit with critical issues', () => {
      const score = calculateScore(
        mockAuditWithCritical.total,
        mockAuditWithCritical.critical,
        mockAuditWithCritical.serious,
        mockAuditWithCritical.moderate,
        mockAuditWithCritical.minor
      );

      expect(score.overall).toBeGreaterThan(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.bySeverity.critical).toBe(2);
      expect(score.bySeverity.serious).toBe(1);
      expect(score.bySeverity.moderate).toBe(1);
      expect(score.bySeverity.minor).toBe(1);
    });

    it('should return perfect score for audit with no issues', () => {
      const score = calculateScore(
        mockAuditWithNoIssues.total,
        mockAuditWithNoIssues.critical,
        mockAuditWithNoIssues.serious,
        mockAuditWithNoIssues.moderate,
        mockAuditWithNoIssues.minor
      );

      expect(score.overall).toBe(100);
      expect(score.wcag21aaCompliance).toBe(100);
    });

    it('should calculate WCAG 2.1 AA compliance correctly', () => {
      const score = calculateScore(5, 1, 1, 1, 2);
      expect(score.wcag21aaCompliance).toBeGreaterThan(0);
      expect(score.wcag21aaCompliance).toBeLessThanOrEqual(100);
    });

    it('should heavily penalize critical issues', () => {
      const scoreWithCritical = calculateScore(1, 1, 0, 0, 0);
      const scoreWithSerious = calculateScore(1, 0, 1, 0, 0);

      expect(scoreWithCritical.overall).toBeLessThan(scoreWithSerious.overall);
    });

    it('should initialize byCategory with all categories', () => {
      const score = calculateScore(0, 0, 0, 0, 0);
      
      const expectedCategories: AccessibilityIssueCategory[] = [
        'aria', 'color', 'forms', 'keyboard', 'language', 'labels',
        'name-role-value', 'parsing', 'reading', 'semantic-html',
        'tables', 'timing', 'contrast', 'images', 'navigation',
        'landmarks', 'focus', 'wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice',
      ];

      expectedCategories.forEach(category => {
        expect(score.byCategory[category]).toBeDefined();
        expect(typeof score.byCategory[category]).toBe('number');
      });
    });
  });

  describe('createSummary', () => {
    const mockIssues: AccessibilityIssue[] = [
      {
        id: '1',
        impact: 'critical',
        tags: ['wcag21aa'],
        description: 'Critical issue',
        help: 'Fix this',
        helpUrl: 'https://example.com',
        nodes: [],
        category: 'wcag21aa',
        wcagLevel: 'AA',
        detectedAt: new Date().toISOString(),
        status: 'open',
      },
      {
        id: '2',
        impact: 'serious',
        tags: ['wcag2aa'],
        description: 'Serious issue',
        help: 'Fix this',
        helpUrl: 'https://example.com',
        nodes: [],
        category: 'wcag2aa',
        wcagLevel: 'AA',
        detectedAt: new Date().toISOString(),
        status: 'open',
      },
      {
        id: '3',
        impact: 'moderate',
        tags: ['wcag21aa'],
        description: 'Moderate issue',
        help: 'Fix this',
        helpUrl: 'https://example.com',
        nodes: [],
        category: 'wcag21aa',
        wcagLevel: 'AA',
        detectedAt: new Date().toISOString(),
        status: 'false-positive',
      },
    ];

    it('should create summary from issues', () => {
      const summary = createSummary(mockIssues);

      expect(summary.total).toBe(2); // Excludes false-positive
      expect(summary.critical).toBe(1);
      expect(summary.serious).toBe(1);
      expect(summary.moderate).toBe(0);
    });

    it('should exclude false-positive issues from summary', () => {
      const summary = createSummary(mockIssues);
      expect(summary.total).toBe(2);
      expect(summary.moderate).toBe(0);
    });

    it('should exclude cannot-reproduce issues from summary', () => {
      const issuesWithCannotReproduce = [
        ...mockIssues,
        {
          id: '4',
          impact: 'minor',
          tags: ['wcag21aa'],
          description: '',
          help: '',
          helpUrl: '',
          nodes: [],
          category: 'wcag21aa',
          wcagLevel: 'AA',
          detectedAt: new Date().toISOString(),
          status: 'cannot-reproduce',
        },
      ];
      const summary = createSummary(issuesWithCannotReproduce);
      expect(summary.total).toBe(2);
    });

    it('should handle empty issues array', () => {
      const summary = createSummary([]);
      expect(summary.total).toBe(0);
      expect(summary.critical).toBe(0);
      expect(summary.serious).toBe(0);
      expect(summary.moderate).toBe(0);
      expect(summary.minor).toBe(0);
      expect(summary.passed).toBe(0);
      expect(summary.incomplete).toBe(0);
    });
  });

  describe('calculateScoreImprovement', () => {
    it('should calculate positive improvement', () => {
      const oldScore: AccessibilityScore = { overall: 70, bySeverity: { critical: 5, serious: 10, moderate: 15, minor: 20 }, byCategory: {}, wcag21aaCompliance: 65 };
      const newScore: AccessibilityScore = { overall: 85, bySeverity: { critical: 2, serious: 5, moderate: 10, minor: 15 }, byCategory: {}, wcag21aaCompliance: 80 };

      const improvement = calculateScoreImprovement(oldScore, newScore);
      expect(improvement).toBe(15);
    });

    it('should calculate negative improvement (degradation)', () => {
      const oldScore: AccessibilityScore = { overall: 85, bySeverity: { critical: 2, serious: 5, moderate: 10, minor: 15 }, byCategory: {}, wcag21aaCompliance: 80 };
      const newScore: AccessibilityScore = { overall: 70, bySeverity: { critical: 5, serious: 10, moderate: 15, minor: 20 }, byCategory: {}, wcag21aaCompliance: 65 };

      const improvement = calculateScoreImprovement(oldScore, newScore);
      expect(improvement).toBe(-15);
    });

    it('should return zero for no change', () => {
      const score: AccessibilityScore = { overall: 75, bySeverity: { critical: 3, serious: 7, moderate: 12, minor: 17 }, byCategory: {}, wcag21aaCompliance: 70 };
      
      const improvement = calculateScoreImprovement(score, score);
      expect(improvement).toBe(0);
    });
  });

  describe('getHighPriorityIssues', () => {
    const mockIssues: AccessibilityIssue[] = [
      {
        id: '1',
        impact: 'critical',
        tags: [],
        description: '',
        help: '',
        helpUrl: '',
        nodes: [],
        category: 'wcag21aa',
        wcagLevel: 'AA',
        detectedAt: '',
        status: 'open',
      },
      {
        id: '2',
        impact: 'serious',
        tags: [],
        description: '',
        help: '',
        helpUrl: '',
        nodes: [],
        category: 'wcag21aa',
        wcagLevel: 'AA',
        detectedAt: '',
        status: 'open',
      },
      {
        id: '3',
        impact: 'moderate',
        tags: [],
        description: '',
        help: '',
        helpUrl: '',
        nodes: [],
        category: 'wcag21aa',
        wcagLevel: 'AA',
        detectedAt: '',
        status: 'open',
      },
      {
        id: '4',
        impact: 'critical',
        tags: [],
        description: '',
        help: '',
        helpUrl: '',
        nodes: [],
        category: 'wcag21aa',
        wcagLevel: 'AA',
        detectedAt: '',
        status: 'false-positive',
      },
      {
        id: '5',
        impact: 'serious',
        tags: [],
        description: '',
        help: '',
        helpUrl: '',
        nodes: [],
        category: 'wcag21aa',
        wcagLevel: 'AA',
        detectedAt: '',
        status: 'cannot-reproduce',
      },
    ];

    it('should return only critical and serious issues', () => {
      const highPriorityIssues = getHighPriorityIssues(mockIssues);
      
      expect(highPriorityIssues.length).toBe(2);
      expect(highPriorityIssues.every(issue => issue.impact === 'critical' || issue.impact === 'serious')).toBe(true);
    });

    it('should exclude false-positive issues', () => {
      const highPriorityIssues = getHighPriorityIssues(mockIssues);
      
      expect(highPriorityIssues.some(issue => issue.status === 'false-positive')).toBe(false);
    });

    it('should exclude cannot-reproduce issues', () => {
      const highPriorityIssues = getHighPriorityIssues(mockIssues);
      
      expect(highPriorityIssues.some(issue => issue.status === 'cannot-reproduce')).toBe(false);
    });

    it('should handle empty issues array', () => {
      const highPriorityIssues = getHighPriorityIssues([]);
      
      expect(highPriorityIssues.length).toBe(0);
    });
  });

  describe('getWcag21aaCompliance', () => {
    it('should return WCAG 2.1 AA compliance percentage', () => {
      const score: AccessibilityScore = { overall: 85, bySeverity: { critical: 2, serious: 5, moderate: 10, minor: 15 }, byCategory: {}, wcag21aaCompliance: 78 };
      
      const compliance = getWcag21aaCompliance(score);
      expect(compliance).toBe(78);
    });
  });

  describe('meetsComplianceThreshold', () => {
    const mockAudit = {
      id: 'audit-1',
      url: 'https://example.com',
      timestamp: '',
      issues: [],
      score: { overall: 85, bySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 }, byCategory: {}, wcag21aaCompliance: 92 },
      summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0, passed: 0, incomplete: 0 },
      metadata: { userAgent: '', viewport: { width: 1920, height: 1080 }, deviceType: 'desktop', auditDuration: 0, tags: [] },
    };

    it('should return true when compliance meets default threshold (90)', () => {
      expect(meetsComplianceThreshold(mockAudit)).toBe(true);
    });

    it('should return false when compliance below threshold', () => {
      const lowComplianceAudit = {
        ...mockAudit,
        score: { ...mockAudit.score, wcag21aaCompliance: 75 },
      };
      expect(meetsComplianceThreshold(lowComplianceAudit)).toBe(false);
    });

    it('should use custom threshold when provided', () => {
      expect(meetsComplianceThreshold(mockAudit, 95)).toBe(false);
      expect(meetsComplianceThreshold(mockAudit, 80)).toBe(true);
    });

    it('should return true for compliance at threshold', () => {
      const exactThresholdAudit = {
        ...mockAudit,
        score: { ...mockAudit.score, wcag21aaCompliance: 90 },
      };
      expect(meetsComplianceThreshold(exactThresholdAudit)).toBe(true);
    });
  });

  describe('getScoreTrend', () => {
    it('should return improving trend for positive score changes', () => {
      const scores: AccessibilityScoreTrend[] = [
        { date: '2024-01-01', score: 70, issuesCount: 10 },
        { date: '2024-01-02', score: 75, issuesCount: 9 },
        { date: '2024-01-03', score: 80, issuesCount: 8 },
      ];

      const trend = getScoreTrend(scores);
      expect(trend).toBe('improving');
    });

    it('should return degrading trend for negative score changes', () => {
      const scores: AccessibilityScoreTrend[] = [
        { date: '2024-01-01', score: 80, issuesCount: 8 },
        { date: '2024-01-02', score: 75, issuesCount: 9 },
        { date: '2024-01-03', score: 70, issuesCount: 10 },
      ];

      const trend = getScoreTrend(scores);
      expect(trend).toBe('degrading');
    });

    it('should return stable trend for minimal score changes', () => {
      const scores: AccessibilityScoreTrend[] = [
        { date: '2024-01-01', score: 75, issuesCount: 9 },
        { date: '2024-01-02', score: 76, issuesCount: 9 },
        { date: '2024-01-03', score: 75, issuesCount: 9 },
      ];

      const trend = getScoreTrend(scores);
      expect(trend).toBe('stable');
    });

    it('should return stable for less than 2 scores', () => {
      const singleScore: AccessibilityScoreTrend[] = [
        { date: '2024-01-01', score: 75, issuesCount: 9 },
      ];

      const trend = getScoreTrend(singleScore);
      expect(trend).toBe('stable');
    });

    it('should use last 5 scores for trend calculation', () => {
      const scores: AccessibilityScoreTrend[] = [
        { date: '2024-01-01', score: 60, issuesCount: 15 },
        { date: '2024-01-02', score: 65, issuesCount: 14 },
        { date: '2024-01-03', score: 70, issuesCount: 13 },
        { date: '2024-01-04', score: 75, issuesCount: 12 },
        { date: '2024-01-05', score: 80, issuesCount: 11 },
        { date: '2024-01-06', score: 85, issuesCount: 10 },
        { date: '2024-01-07', score: 60, issuesCount: 13 },
      ];

      const trend = getScoreTrend(scores);
      expect(trend).toBe('degrading'); // Last 5: 70, 75, 80, 85, 60 (decreasing)
    });
  });
});
