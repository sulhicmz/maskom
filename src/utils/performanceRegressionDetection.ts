/**
 * Performance Regression Detection System
 * 
 * Implements automated detection of performance regressions in production
 * using statistical analysis of Core Web Vitals metrics.
 */

// Type definitions for Web Vitals metrics
export enum WebVitalMetric {
  LCP = 'lcp',       // Largest Contentful Paint
  FID = 'fid',       // First Input Delay (deprecated, replaced by INP)
  CLS = 'cls',       // Cumulative Layout Shift
  FCP = 'fcp',       // First Contentful Paint
  TTFB = 'ttfb',     // Time to First Byte
  INP = 'inp'        // Interaction to Next Paint (replaces FID)
}

export interface PerformanceBaseline {
  metric: WebVitalMetric
  baseline: number
  sampleSize: number
  confidenceInterval: [number, number] // [lower, upper]
  establishedAt: number
  rollingAverage: number // 7-day rolling average
}

export interface RegressionAlert {
  id: string
  metric: WebVitalMetric
  currentValue: number
  baselineValue: number
  degradation: number // percentage (positive = degradation)
  statisticalSignificance: boolean
  detectedAt: number
  severity: 'low' | 'medium' | 'high'
  status: 'active' | 'acknowledged' | 'resolved'
}

export interface MetricSample {
  metric: WebVitalMetric
  value: number
  timestamp: number
  url?: string
}

/**
 * Calculate rolling average for 7-day window
 */
export function calculateRollingAverage(samples: MetricSample[], windowSize: number = 7): number {
  if (samples.length === 0) return 0;
  
  // Sort samples by timestamp, get most recent windowSize samples
  const sortedSamples = [...samples].sort((a, b) => b.timestamp - a.timestamp);
  const recentSamples = sortedSamples.slice(0, Math.min(windowSize, sortedSamples.length));
  
  const sum = recentSamples.reduce((acc, sample) => acc + sample.value, 0);
  return sum / recentSamples.length;
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * Establish performance baseline from samples
 */
export function establishBaseline(
  metric: WebVitalMetric,
  samples: MetricSample[]
): PerformanceBaseline {
  if (samples.length === 0) {
    throw new Error('Cannot establish baseline with zero samples');
  }

  const values = samples.map(s => s.value);
  const baseline = values.reduce((acc, val) => acc + val, 0) / values.length;
  const stdDev = calculateStandardDeviation(values);
  
  // 95% confidence interval: mean ± 1.96 * stdDev / sqrt(n)
  const marginOfError = 1.96 * (stdDev / Math.sqrt(values.length));
  const confidenceInterval: [number, number] = [
    baseline - marginOfError,
    baseline + marginOfError
  ];

  return {
    metric,
    baseline,
    sampleSize: samples.length,
    confidenceInterval,
    establishedAt: Date.now(),
    rollingAverage: calculateRollingAverage(samples)
  };
}

/**
 * Perform t-test to determine statistical significance
 * Returns true if current value is significantly different from baseline (p < 0.05)
 */
export function performTTest(
  currentValues: number[],
  baselineMean: number,
  baselineStdDev: number
): { significant: boolean; tStatistic: number; pValue: number } {
  if (currentValues.length === 0) {
    return { significant: false, tStatistic: 0, pValue: 1 };
  }

  const currentMean = currentValues.reduce((acc, val) => acc + val, 0) / currentValues.length;
  const currentStdDev = calculateStandardDeviation(currentValues);
  
  const n1 = currentValues.length;
  const n2 = baselineStdDev > 0 ? 1 : 1; // For single baseline point
  
  // Pooled standard deviation
  const pooledStdDev = Math.sqrt(
    ((n1 - 1) * Math.pow(currentStdDev, 2) + (n2 - 1) * Math.pow(baselineStdDev, 2)) / (n1 + n2 - 2)
  );
  
  // T-statistic
  const standardError = pooledStdDev * Math.sqrt(1/n1 + 1/n2);
  const tStatistic = (currentMean - baselineMean) / standardError;
  
  // Simplified p-value approximation (for large samples, use proper t-distribution)
  const degreesOfFreedom = n1 + n2 - 2;
  const pValue = 2 * (1 - Math.abs(tStatistic) / Math.sqrt(degreesOfFreedom));
  
  return {
    significant: pValue < 0.05,
    tStatistic,
    pValue: Math.min(1, Math.max(0, pValue))
  };
}

/**
 * Check if current value indicates a regression (degradation)
 * Regression = value is significantly WORSE than baseline
 * Note: For ALL Core Web Vitals, higher values indicate WORSE performance
 */
export function detectRegression(
  currentValue: number,
  baseline: PerformanceBaseline,
  recentSamples: MetricSample[] = []
): { isRegression: boolean; degradation: number; significant: boolean } {
  // Calculate rolling average of recent samples
  const currentAverage = recentSamples.length > 0
    ? calculateRollingAverage(recentSamples)
    : currentValue;

  // For ALL Core Web Vitals, higher values indicate WORSE performance:
  // - LCP, FID, CLS, FCP, TTFB, INP - all have "higher is worse" semantics
  // Calculate degradation percentage (positive = worse)
  const degradation = ((currentAverage - baseline.baseline) / baseline.baseline) * 100;

  // Check if outside confidence interval (above upper bound = worse)
  const outsideCI = currentAverage > baseline.confidenceInterval[1];

  // Perform statistical significance test
  const testResult = recentSamples.length > 0
    ? performTTest(recentSamples.map(s => s.value), baseline.baseline, calculateStandardDeviation([baseline.baseline]))
    : { significant: false, tStatistic: 0, pValue: 1 };

  // Regression detected if:
  // 1. Significant degradation (> 5%)
  // 2. AND either outside confidence interval OR statistically significant
  const isRegression = degradation > 5 && (outsideCI || testResult.significant);

  return {
    isRegression,
    degradation,
    significant: outsideCI || testResult.significant
  };
}

/**
 * Determine alert severity based on degradation percentage
 */
export function determineSeverity(degradation: number): 'low' | 'medium' | 'high' {
  if (degradation > 25) return 'high';
  if (degradation > 15) return 'medium';
  return 'low';
}

/**
 * Generate unique alert ID
 */
export function generateAlertId(): string {
  return `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create regression alert
 */
export function createRegressionAlert(
  metric: WebVitalMetric,
  currentValue: number,
  baseline: PerformanceBaseline,
  degradation: number,
  significant: boolean
): RegressionAlert {
  const severity = determineSeverity(degradation);
  
  return {
    id: generateAlertId(),
    metric,
    currentValue,
    baselineValue: baseline.baseline,
    degradation,
    statisticalSignificance: significant,
    detectedAt: Date.now(),
    severity,
    status: 'active'
  };
}

/**
 * Check for regressions across all metrics
 */
export function checkForRegressions(
  currentMetrics: Map<WebVitalMetric, MetricSample[]>,
  baselines: Map<WebVitalMetric, PerformanceBaseline>
): RegressionAlert[] {
  const alerts: RegressionAlert[] = [];

  for (const [metric, samples] of currentMetrics.entries()) {
    const baseline = baselines.get(metric);
    
    if (!baseline || samples.length === 0) continue;
    
    const currentValue = samples[samples.length - 1].value;
    const regressionResult = detectRegression(currentValue, baseline, samples);
    
    if (regressionResult.isRegression) {
      const alert = createRegressionAlert(
        metric,
        currentValue,
        baseline,
        regressionResult.degradation,
        regressionResult.significant
      );
      alerts.push(alert);
    }
  }

  return alerts;
}

/**
 * Format metric name for display
 */
export function formatMetricName(metric: WebVitalMetric): string {
  const names: Record<WebVitalMetric, string> = {
    [WebVitalMetric.LCP]: 'Largest Contentful Paint (LCP)',
    [WebVitalMetric.FID]: 'First Input Delay (FID)',
    [WebVitalMetric.CLS]: 'Cumulative Layout Shift (CLS)',
    [WebVitalMetric.FCP]: 'First Contentful Paint (FCP)',
    [WebVitalMetric.TTFB]: 'Time to First Byte (TTFB)',
    [WebVitalMetric.INP]: 'Interaction to Next Paint (INP)'
  };
  return names[metric] || metric;
}

/**
 * Get threshold for "good" performance
 */
export function getGoodThreshold(metric: WebVitalMetric): number {
  const thresholds: Record<WebVitalMetric, number> = {
    [WebVitalMetric.LCP]: 2500,   // 2.5s
    [WebVitalMetric.FID]: 100,     // 100ms
    [WebVitalMetric.CLS]: 0.1,    // 0.1
    [WebVitalMetric.FCP]: 1800,    // 1.8s
    [WebVitalMetric.TTFB]: 800,    // 800ms
    [WebVitalMetric.INP]: 200      // 200ms
  };
  return thresholds[metric] || 0;
}

/**
 * Get threshold for "needs improvement" performance
 */
export function getNeedsImprovementThreshold(metric: WebVitalMetric): number {
  const thresholds: Record<WebVitalMetric, number> = {
    [WebVitalMetric.LCP]: 4000,   // 4.0s
    [WebVitalMetric.FID]: 300,     // 300ms
    [WebVitalMetric.CLS]: 0.25,   // 0.25
    [WebVitalMetric.FCP]: 3000,    // 3.0s
    [WebVitalMetric.TTFB]: 1800,   // 1.8s
    [WebVitalMetric.INP]: 500      // 500ms
  };
  return thresholds[metric] || 0;
}

/**
 * Get performance rating
 */
export function getPerformanceRating(metric: WebVitalMetric, value: number): 'good' | 'needs_improvement' | 'poor' {
  const goodThreshold = getGoodThreshold(metric);
  const needsImprovementThreshold = getNeedsImprovementThreshold(metric);

  // For LCP, FID, FCP, TTFB, INP: lower is better
  // For CLS: lower is better too
  if (value <= goodThreshold) return 'good';
  if (value <= needsImprovementThreshold) return 'needs_improvement';
  return 'poor';
}
