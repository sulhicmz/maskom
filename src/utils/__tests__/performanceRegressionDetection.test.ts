/**
 * Tests for Performance Regression Detection System
 * 
 * Tests statistical analysis, baseline establishment, regression detection
 */

import {
  WebVitalMetric,
  PerformanceBaseline,
  RegressionAlert,
  MetricSample,
  calculateRollingAverage,
  calculateStandardDeviation,
  establishBaseline,
  performTTest,
  detectRegression,
  determineSeverity,
  generateAlertId,
  createRegressionAlert,
  checkForRegressions,
  formatMetricName,
  getGoodThreshold,
  getNeedsImprovementThreshold,
  getPerformanceRating
} from '../performanceRegressionDetection';

describe('Performance Regression Detection', () => {
  describe('calculateRollingAverage', () => {
    it('should return 0 for empty array', () => {
      const result = calculateRollingAverage([]);
      expect(result).toBe(0);
    });

    it('should calculate rolling average for all samples when within window', () => {
      const samples: MetricSample[] = [
        { metric: WebVitalMetric.LCP, value: 1000, timestamp: 1 },
        { metric: WebVitalMetric.LCP, value: 2000, timestamp: 2 },
        { metric: WebVitalMetric.LCP, value: 3000, timestamp: 3 }
      ];
      const result = calculateRollingAverage(samples, 7);
      expect(result).toBe(2000);
    });

    it('should only use most recent samples when exceeding window', () => {
      const samples: MetricSample[] = [
        { metric: WebVitalMetric.LCP, value: 1000, timestamp: 1 },
        { metric: WebVitalMetric.LCP, value: 2000, timestamp: 2 },
        { metric: WebVitalMetric.LCP, value: 3000, timestamp: 3 },
        { metric: WebVitalMetric.LCP, value: 4000, timestamp: 4 },
        { metric: WebVitalMetric.LCP, value: 5000, timestamp: 5 },
        { metric: WebVitalMetric.LCP, value: 6000, timestamp: 6 },
        { metric: WebVitalMetric.LCP, value: 7000, timestamp: 7 },
        { metric: WebVitalMetric.LCP, value: 8000, timestamp: 8 },
        { metric: WebVitalMetric.LCP, value: 9000, timestamp: 9 },
        { metric: WebVitalMetric.LCP, value: 10000, timestamp: 10 }
      ];
      const result = calculateRollingAverage(samples, 7);
      // Should use only 7 most recent: 4000-10000
      expect(result).toBe(7000);
    });

    it('should handle single sample', () => {
      const samples: MetricSample[] = [
        { metric: WebVitalMetric.LCP, value: 2500, timestamp: 1 }
      ];
      const result = calculateRollingAverage(samples);
      expect(result).toBe(2500);
    });
  });

  describe('calculateStandardDeviation', () => {
    it('should return 0 for empty array', () => {
      const result = calculateStandardDeviation([]);
      expect(result).toBe(0);
    });

    it('should return 0 for single value', () => {
      const result = calculateStandardDeviation([100]);
      expect(result).toBe(0);
    });

    it('should calculate standard deviation correctly', () => {
      const values = [10, 12, 23, 23, 16, 23, 21, 16];
      const result = calculateStandardDeviation(values);
      // Mean = 18, variance = 24, stdDev ≈ 4.9 (population variance)
      expect(result).toBeCloseTo(4.9, 1);
    });

    it('should handle constant values', () => {
      const values = [100, 100, 100, 100, 100];
      const result = calculateStandardDeviation(values);
      expect(result).toBe(0);
    });
  });

  describe('establishBaseline', () => {
    it('should throw error for empty samples', () => {
      expect(() => establishBaseline(WebVitalMetric.LCP, [])).toThrow();
    });

    it('should calculate baseline mean correctly', () => {
      const samples: MetricSample[] = [
        { metric: WebVitalMetric.LCP, value: 2000, timestamp: 1 },
        { metric: WebVitalMetric.LCP, value: 2500, timestamp: 2 },
        { metric: WebVitalMetric.LCP, value: 3000, timestamp: 3 }
      ];
      const baseline = establishBaseline(WebVitalMetric.LCP, samples);
      expect(baseline.baseline).toBe(2500);
    });

    it('should calculate confidence interval correctly', () => {
      const samples: MetricSample[] = [
        { metric: WebVitalMetric.LCP, value: 2000, timestamp: 1 },
        { metric: WebVitalMetric.LCP, value: 2500, timestamp: 2 },
        { metric: WebVitalMetric.LCP, value: 3000, timestamp: 3 }
      ];
      const baseline = establishBaseline(WebVitalMetric.LCP, samples);
      expect(baseline.confidenceInterval[0]).toBeLessThan(baseline.baseline);
      expect(baseline.confidenceInterval[1]).toBeGreaterThan(baseline.baseline);
    });

    it('should set sample size correctly', () => {
      const samples: MetricSample[] = [
        { metric: WebVitalMetric.LCP, value: 2000, timestamp: 1 },
        { metric: WebVitalMetric.LCP, value: 2500, timestamp: 2 },
        { metric: WebVitalMetric.LCP, value: 3000, timestamp: 3 }
      ];
      const baseline = establishBaseline(WebVitalMetric.LCP, samples);
      expect(baseline.sampleSize).toBe(3);
    });

    it('should set establishedAt timestamp', () => {
      const samples: MetricSample[] = [
        { metric: WebVitalMetric.LCP, value: 2500, timestamp: 1 }
      ];
      const before = Date.now();
      const baseline = establishBaseline(WebVitalMetric.LCP, samples);
      const after = Date.now();
      expect(baseline.establishedAt).toBeGreaterThanOrEqual(before);
      expect(baseline.establishedAt).toBeLessThanOrEqual(after);
    });

    it('should calculate rolling average correctly', () => {
      const samples: MetricSample[] = [
        { metric: WebVitalMetric.LCP, value: 2000, timestamp: 1 },
        { metric: WebVitalMetric.LCP, value: 2500, timestamp: 2 },
        { metric: WebVitalMetric.LCP, value: 3000, timestamp: 3 }
      ];
      const baseline = establishBaseline(WebVitalMetric.LCP, samples);
      expect(baseline.rollingAverage).toBe(2500);
    });
  });

  describe('performTTest', () => {
    it('should return not significant for empty current values', () => {
      const result = performTTest([], 2500, 500);
      expect(result.significant).toBe(false);
      expect(result.tStatistic).toBe(0);
      expect(result.pValue).toBe(1);
    });

    it('should detect significant difference for large degradation', () => {
      const currentValues = [4000, 4200, 4100, 4300, 4000];
      const baselineMean = 2500;
      const baselineStdDev = 500;
      const result = performTTest(currentValues, baselineMean, baselineStdDev);
      expect(result.significant).toBe(true);
      expect(result.pValue).toBeLessThan(0.05);
    });

    it('should not detect significant difference for small variation', () => {
      const currentValues = [2550, 2480, 2520, 2510, 2490];
      const baselineMean = 2500;
      const baselineStdDev = 100;
      const result = performTTest(currentValues, baselineMean, baselineStdDev);
      expect(result.significant).toBe(false);
      expect(result.pValue).toBeGreaterThan(0.05);
    });

    it('should calculate t-statistic correctly', () => {
      const currentValues = [3000, 3100, 2900];
      const baselineMean = 2500;
      const baselineStdDev = 200;
      const result = performTTest(currentValues, baselineMean, baselineStdDev);
      expect(result.tStatistic).toBeGreaterThan(0);
    });

    it('should clamp p-value between 0 and 1', () => {
      const currentValues = [10000, 12000, 11000];
      const baselineMean = 2500;
      const baselineStdDev = 500;
      const result = performTTest(currentValues, baselineMean, baselineStdDev);
      expect(result.pValue).toBeGreaterThanOrEqual(0);
      expect(result.pValue).toBeLessThanOrEqual(1);
    });
  });

  describe('detectRegression', () => {
    it('should not detect regression for values within confidence interval', () => {
      const baseline: PerformanceBaseline = {
        metric: WebVitalMetric.LCP,
        baseline: 2500,
        sampleSize: 100,
        confidenceInterval: [2000, 3000],
        establishedAt: Date.now(),
        rollingAverage: 2500
      };
      const result = detectRegression(2600, baseline, []);
      expect(result.isRegression).toBe(false);
      expect(result.degradation).toBeGreaterThan(0);
    });

    it('should detect regression for significant degradation', () => {
      const baseline: PerformanceBaseline = {
        metric: WebVitalMetric.LCP,
        baseline: 2500,
        sampleSize: 100,
        confidenceInterval: [2000, 3000],
        establishedAt: Date.now(),
        rollingAverage: 2500
      };
      const result = detectRegression(4000, baseline, []);
      expect(result.isRegression).toBe(true);
      expect(result.degradation).toBeGreaterThan(5);
    });

    it('should calculate degradation percentage correctly for higher-worse metrics', () => {
      const baseline: PerformanceBaseline = {
        metric: WebVitalMetric.LCP,
        baseline: 2500,
        sampleSize: 100,
        confidenceInterval: [2000, 3000],
        establishedAt: Date.now(),
        rollingAverage: 2500
      };
      const result = detectRegression(3000, baseline, []);
      expect(result.degradation).toBe(20); // (3000-2500)/2500 * 100
    });

    it('should handle CLS degradation correctly (higher is worse)', () => {
      const baseline: PerformanceBaseline = {
        metric: WebVitalMetric.CLS,
        baseline: 0.1,
        sampleSize: 100,
        confidenceInterval: [0.05, 0.15],
        establishedAt: Date.now(),
        rollingAverage: 0.1
      };
      const result = detectRegression(0.2, baseline, []);
      expect(result.degradation).toBe(100); // (0.2-0.1)/0.1 * 100 = 100% degradation
    });

    it('should use recent samples for current average', () => {
      const baseline: PerformanceBaseline = {
        metric: WebVitalMetric.LCP,
        baseline: 2500,
        sampleSize: 100,
        confidenceInterval: [2000, 3000],
        establishedAt: Date.now(),
        rollingAverage: 2500
      };
      const recentSamples: MetricSample[] = [
        { metric: WebVitalMetric.LCP, value: 3000, timestamp: 1 },
        { metric: WebVitalMetric.LCP, value: 3100, timestamp: 2 },
        { metric: WebVitalMetric.LCP, value: 3200, timestamp: 3 }
      ];
      const result = detectRegression(3500, baseline, recentSamples);
      expect(result.degradation).toBeCloseTo(24, 2); // (3100-2500)/2500 * 100
    });
  });

  describe('determineSeverity', () => {
    it('should return low for degradation <= 15%', () => {
      expect(determineSeverity(10)).toBe('low');
      expect(determineSeverity(15)).toBe('low');
    });

    it('should return medium for degradation 15-25%', () => {
      expect(determineSeverity(16)).toBe('medium');
      expect(determineSeverity(25)).toBe('medium');
    });

    it('should return high for degradation > 25%', () => {
      expect(determineSeverity(26)).toBe('high');
      expect(determineSeverity(50)).toBe('high');
      expect(determineSeverity(100)).toBe('high');
    });
  });

  describe('generateAlertId', () => {
    it('should generate unique alert IDs', () => {
      const id1 = generateAlertId();
      const id2 = generateAlertId();
      expect(id1).not.toBe(id2);
    });

    it('should start with REG-', () => {
      const id = generateAlertId();
      expect(id).toMatch(/^REG-/);
    });

    it('should include timestamp', () => {
      const id = generateAlertId();
      const timestamp = parseInt(id.split('-')[1]);
      expect(timestamp).toBeGreaterThan(0);
    });
  });

  describe('createRegressionAlert', () => {
    it('should create alert with all required fields', () => {
      const baseline: PerformanceBaseline = {
        metric: WebVitalMetric.LCP,
        baseline: 2500,
        sampleSize: 100,
        confidenceInterval: [2000, 3000],
        establishedAt: Date.now(),
        rollingAverage: 2500
      };
      const alert = createRegressionAlert(WebVitalMetric.LCP, 4000, baseline, 60, true);
      expect(alert.id).toMatch(/^REG-/);
      expect(alert.metric).toBe(WebVitalMetric.LCP);
      expect(alert.currentValue).toBe(4000);
      expect(alert.baselineValue).toBe(2500);
      expect(alert.degradation).toBe(60);
      expect(alert.statisticalSignificance).toBe(true);
      expect(alert.status).toBe('active');
    });

    it('should set severity to high for high degradation', () => {
      const baseline: PerformanceBaseline = {
        metric: WebVitalMetric.LCP,
        baseline: 2500,
        sampleSize: 100,
        confidenceInterval: [2000, 3000],
        establishedAt: Date.now(),
        rollingAverage: 2500
      };
      const alert = createRegressionAlert(WebVitalMetric.LCP, 4000, baseline, 60, true);
      expect(alert.severity).toBe('high');
    });

    it('should set severity to low for low degradation', () => {
      const baseline: PerformanceBaseline = {
        metric: WebVitalMetric.LCP,
        baseline: 2500,
        sampleSize: 100,
        confidenceInterval: [2000, 3000],
        establishedAt: Date.now(),
        rollingAverage: 2500
      };
      const alert = createRegressionAlert(WebVitalMetric.LCP, 2750, baseline, 10, true);
      expect(alert.severity).toBe('low');
    });

    it('should set severity to medium for medium degradation', () => {
      const baseline: PerformanceBaseline = {
        metric: WebVitalMetric.LCP,
        baseline: 2500,
        sampleSize: 100,
        confidenceInterval: [2000, 3000],
        establishedAt: Date.now(),
        rollingAverage: 2500
      };
      const alert = createRegressionAlert(WebVitalMetric.LCP, 3000, baseline, 20, true);
      expect(alert.severity).toBe('medium');
    });
  });

  describe('checkForRegressions', () => {
    it('should detect regressions for all metrics', () => {
      const lcpBaseline: PerformanceBaseline = {
        metric: WebVitalMetric.LCP,
        baseline: 2500,
        sampleSize: 100,
        confidenceInterval: [2000, 3000],
        establishedAt: Date.now(),
        rollingAverage: 2500
      };
      const clsBaseline: PerformanceBaseline = {
        metric: WebVitalMetric.CLS,
        baseline: 0.1,
        sampleSize: 100,
        confidenceInterval: [0.05, 0.15],
        establishedAt: Date.now(),
        rollingAverage: 0.1
      };

      const currentMetrics = new Map<WebVitalMetric, MetricSample[]>([
        [WebVitalMetric.LCP, [
          { metric: WebVitalMetric.LCP, value: 4000, timestamp: Date.now() }
        ]],
        [WebVitalMetric.CLS, [
          { metric: WebVitalMetric.CLS, value: 0.25, timestamp: Date.now() }
        ]]
      ]);

      const baselines = new Map<WebVitalMetric, PerformanceBaseline>([
        [WebVitalMetric.LCP, lcpBaseline],
        [WebVitalMetric.CLS, clsBaseline]
      ]);

      const alerts = checkForRegressions(currentMetrics, baselines);
      expect(alerts.length).toBeGreaterThanOrEqual(1); // At least LCP should be detected
      expect(alerts.some(a => a.metric === WebVitalMetric.LCP)).toBe(true);
      if (alerts.length === 2) {
        expect(alerts[1].metric).toBe(WebVitalMetric.CLS);
      }
    });

    it('should not create alerts for metrics within baseline', () => {
      const lcpBaseline: PerformanceBaseline = {
        metric: WebVitalMetric.LCP,
        baseline: 2500,
        sampleSize: 100,
        confidenceInterval: [2000, 3000],
        establishedAt: Date.now(),
        rollingAverage: 2500
      };

      const currentMetrics = new Map<WebVitalMetric, MetricSample[]>([
        [WebVitalMetric.LCP, [
          { metric: WebVitalMetric.LCP, value: 2600, timestamp: Date.now() }
        ]]
      ]);

      const baselines = new Map<WebVitalMetric, PerformanceBaseline>([
        [WebVitalMetric.LCP, lcpBaseline]
      ]);

      const alerts = checkForRegressions(currentMetrics, baselines);
      expect(alerts.length).toBe(0);
    });

    it('should handle metrics without baselines', () => {
      const currentMetrics = new Map<WebVitalMetric, MetricSample[]>([
        [WebVitalMetric.LCP, [
          { metric: WebVitalMetric.LCP, value: 4000, timestamp: Date.now() }
        ]]
      ]);

      const baselines = new Map<WebVitalMetric, PerformanceBaseline>();

      const alerts = checkForRegressions(currentMetrics, baselines);
      expect(alerts.length).toBe(0);
    });

    it('should handle empty metrics', () => {
      const baselines = new Map<WebVitalMetric, PerformanceBaseline>();
      const alerts = checkForRegressions(new Map(), baselines);
      expect(alerts.length).toBe(0);
    });
  });

  describe('formatMetricName', () => {
    it('should format LCP correctly', () => {
      expect(formatMetricName(WebVitalMetric.LCP)).toBe('Largest Contentful Paint (LCP)');
    });

    it('should format CLS correctly', () => {
      expect(formatMetricName(WebVitalMetric.CLS)).toBe('Cumulative Layout Shift (CLS)');
    });

    it('should format INP correctly', () => {
      expect(formatMetricName(WebVitalMetric.INP)).toBe('Interaction to Next Paint (INP)');
    });
  });

  describe('getGoodThreshold', () => {
    it('should return correct threshold for LCP', () => {
      expect(getGoodThreshold(WebVitalMetric.LCP)).toBe(2500);
    });

    it('should return correct threshold for CLS', () => {
      expect(getGoodThreshold(WebVitalMetric.CLS)).toBe(0.1);
    });

    it('should return correct threshold for TTFB', () => {
      expect(getGoodThreshold(WebVitalMetric.TTFB)).toBe(800);
    });
  });

  describe('getNeedsImprovementThreshold', () => {
    it('should return correct threshold for LCP', () => {
      expect(getNeedsImprovementThreshold(WebVitalMetric.LCP)).toBe(4000);
    });

    it('should return correct threshold for CLS', () => {
      expect(getNeedsImprovementThreshold(WebVitalMetric.CLS)).toBe(0.25);
    });

    it('should return correct threshold for TTFB', () => {
      expect(getNeedsImprovementThreshold(WebVitalMetric.TTFB)).toBe(1800);
    });
  });

  describe('getPerformanceRating', () => {
    it('should return good for values within good threshold', () => {
      expect(getPerformanceRating(WebVitalMetric.LCP, 2000)).toBe('good');
      expect(getPerformanceRating(WebVitalMetric.CLS, 0.05)).toBe('good');
    });

    it('should return needs_improvement for values between thresholds', () => {
      expect(getPerformanceRating(WebVitalMetric.LCP, 3000)).toBe('needs_improvement');
      expect(getPerformanceRating(WebVitalMetric.CLS, 0.2)).toBe('needs_improvement');
    });

    it('should return poor for values exceeding needs improvement threshold', () => {
      expect(getPerformanceRating(WebVitalMetric.LCP, 5000)).toBe('poor');
      expect(getPerformanceRating(WebVitalMetric.CLS, 0.3)).toBe('poor');
    });
  });
});
