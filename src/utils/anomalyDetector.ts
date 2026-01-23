import { z } from 'zod';
import {
  Anomaly,
  AnomalyAlert,
  AnomalySeverity,
  AnomalyStatus,
  AnomalyThreshold,
  AnomalyType,
  AlertChannel,
  BaselineData,
  MetricsHistory,
  AnomalyDetectionResult,
  AnomalyStatistics,
  IAnomalyDetector,
  IMetricsHistory,
  DEFAULT_ANOMALY_THRESHOLDS,
} from '@/types/anomaly';
import { StorageValidator } from './storageValidator';

const STORAGE_KEYS = {
  ANOMALIES: 'anomalies',
  THRESHOLDS: 'anomaly_thresholds',
  BASELINES: 'anomaly_baselines',
  ALERTS: 'anomaly_alerts',
  METRICS_HISTORY: 'anomaly_metrics_history',
};

const MIN_SAMPLES_FOR_BASELINE = 10;
const MAX_CONFIDENCE_PERCENT = 95;
const CONFIDENCE_MULTIPLIER = 20;
const MOVING_AVERAGE_DEVIATION_THRESHOLD = 50;
const HOURS_PER_DAY = 24;
const DEFAULT_BASELINE_WINDOW_DAYS = 7;
const SENSITIVITY_MULTIPLIERS = {
  LOW: 1.5,
  MEDIUM: 1,
  HIGH: 0.7,
} as const;
const Z_SCORE_THRESHOLDS = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
} as const;
const DEVIATION_THRESHOLDS = {
  CRITICAL: 200,
  HIGH: 150,
  MEDIUM: 100,
} as const;

const anomalyArraySchema = z.array(
  z.object({
    id: z.string(),
    type: z.enum(['traffic', 'error', 'performance']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['detected', 'confirmed', 'false_positive', 'investigating']),
    metric: z.string(),
    metricType: z.string(),
    actualValue: z.number(),
    expectedValue: z.number(),
    deviation: z.number(),
    zScore: z.number().optional(),
    threshold: z.number(),
    detectedAt: z.string(),
    confirmedAt: z.string().optional(),
    acknowledgedBy: z.string().optional(),
    description: z.string(),
    recommendation: z.string(),
    context: z.record(z.string(), z.unknown()).optional(),
  })
);

const anomalyThresholdArraySchema = z.array(
  z.object({
    metricType: z.enum(['traffic', 'error', 'performance']),
    thresholdMethod: z.enum(['z_score', 'moving_average', 'isolation_forest']),
    sensitivityLevel: z.enum(['low', 'medium', 'high']),
    zScoreThreshold: z.number(),
    movingAverageWindow: z.number(),
    alertChannels: z.array(z.enum(['dashboard', 'email', 'webhook', 'sms'])),
    webhookUrl: z.string().optional(),
    emailAddress: z.string().optional(),
    enabled: z.boolean(),
  })
);

const baselineDataArraySchema = z.array(
  z.object({
    metricType: z.string(),
    metric: z.string(),
    baseline: z.number(),
    samples: z.array(z.number()),
    sampleSize: z.number(),
    windowSize: z.number(),
    lastUpdated: z.string(),
    standardDeviation: z.number(),
  })
);

const alertsArraySchema = z.array(
  z.object({
    anomalyId: z.string(),
    alerts: z.array(
      z.object({
        id: z.string(),
        anomalyId: z.string(),
        channels: z.array(z.enum(['dashboard', 'email', 'webhook', 'sms'])),
        sentAt: z.string(),
        acknowledgedAt: z.string().optional(),
        status: z.enum(['sent', 'acknowledged', 'failed']),
        error: z.string().optional(),
        webhookUrl: z.string().optional(),
        emailAddress: z.string().optional(),
      })
    ),
  })
);

const MAX_HISTORY_SIZE = 1000;
const MAX_ALERTS = 1000;

class MetricsHistoryManager implements IMetricsHistory {
  private history: Map<string, MetricsHistory> = new Map();
  private maxHistorySize: number;

  constructor(maxHistorySize: number = MAX_HISTORY_SIZE) {
    this.maxHistorySize = maxHistorySize;
  }

  generateKey(serviceName: string, metricType: AnomalyType, metric: string): string {
    return `${serviceName}:${metricType}:${metric}`;
  }

  addMetric(serviceName: string, metricType: AnomalyType, metric: string, value: number): void {
    const key = this.generateKey(serviceName, metricType, metric);
    const history = this.history.get(key);

    if (!history) {
      const values = [{
        timestamp: new Date().toISOString(),
        value,
      }];
      this.history.set(key, {
        serviceName,
        metricType,
        metric,
        values,
        rollingAverage: value,
        standardDeviation: 0,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      history.values.push({
        timestamp: new Date().toISOString(),
        value,
      });

      if (history.values.length > this.maxHistorySize) {
        history.values.shift();
      }

      history.rollingAverage = this.calculateRollingAverage(
        history.values.map(v => v.value)
      );
      history.standardDeviation = this.calculateStandardDeviation(
        history.values.map(v => v.value),
        history.rollingAverage
      );
      history.lastUpdated = new Date().toISOString();
    }
  }

  getHistory(serviceName: string, metricType: AnomalyType, metric: string): MetricsHistory | null {
    const key = this.generateKey(serviceName, metricType, metric);
    return this.history.get(key) || null;
  }

  getBaseline(serviceName: string, metricType: AnomalyType, metric: string): number {
    const history = this.getHistory(serviceName, metricType, metric);
    return history?.rollingAverage || 0;
  }

  calculateRollingAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
    return Math.round(Math.sqrt(avgSquaredDiff) * 100) / 100;
  }

  cleanupOldMetrics(maxAgeDays: number = 30): void {
    const cutoffTime = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    for (const [key, history] of this.history.entries()) {
      history.values = history.values.filter(
        v => new Date(v.timestamp).getTime() > cutoffTime
      );

      if (history.values.length === 0) {
        this.history.delete(key);
      } else {
        history.rollingAverage = this.calculateRollingAverage(
          history.values.map(v => v.value)
        );
        history.standardDeviation = this.calculateStandardDeviation(
          history.values.map(v => v.value),
          history.rollingAverage
        );
      }
    }
  }

  reset(): void {
    this.history.clear();
  }
}

class AnomalyDetector implements IAnomalyDetector {
  private anomalies: Map<string, Anomaly> = new Map();
  private thresholds: Map<AnomalyType, AnomalyThreshold> = new Map();
  private baselines: Map<string, BaselineData> = new Map();
  private alerts: Map<string, AnomalyAlert[]> = new Map();
  private metricsHistory: MetricsHistoryManager;
  private anomaliesValidator: StorageValidator<Anomaly[]>;
  private thresholdsValidator: StorageValidator<AnomalyThreshold[]>;
  private baselinesValidator: StorageValidator<BaselineData[]>;
  private alertsValidator: StorageValidator<{ anomalyId: string; alerts: AnomalyAlert[] }[]>;

  constructor() {
    this.metricsHistory = new MetricsHistoryManager(MAX_HISTORY_SIZE);

    this.anomaliesValidator = new StorageValidator<Anomaly[]>({
      schema: anomalyArraySchema,
      defaultValue: [],
      storageKey: STORAGE_KEYS.ANOMALIES,
      logErrors: true,
    });

    this.thresholdsValidator = new StorageValidator<AnomalyThreshold[]>({
      schema: anomalyThresholdArraySchema,
      defaultValue: [],
      storageKey: STORAGE_KEYS.THRESHOLDS,
      logErrors: true,
    });

    this.baselinesValidator = new StorageValidator<BaselineData[]>({
      schema: baselineDataArraySchema,
      defaultValue: [],
      storageKey: STORAGE_KEYS.BASELINES,
      logErrors: true,
    });

    this.alertsValidator = new StorageValidator<{ anomalyId: string; alerts: AnomalyAlert[] }[]>({
      schema: alertsArraySchema,
      defaultValue: [],
      storageKey: STORAGE_KEYS.ALERTS,
      logErrors: true,
    });

    this.loadAnomalies();
    this.loadThresholds();
    this.loadBaselines();
    this.loadAlerts();
  }

  loadAnomalies(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.ANOMALIES);
    if (stored) {
      const anomalies = this.anomaliesValidator.safeParseFromStorage(stored);
      anomalies.forEach(anomaly => {
        if (anomaly && anomaly.id) {
          this.anomalies.set(anomaly.id, anomaly);
        }
      });
    }
  }

  saveAnomalies(): void {
    const anomaliesArray = Array.from(this.anomalies.values());
    const result = this.anomaliesValidator.parse(anomaliesArray);

    if (result.success) {
      localStorage.setItem(STORAGE_KEYS.ANOMALIES, JSON.stringify(result.data));
    } else {
      console.error('[AnomalyDetector] Failed to save anomalies:', result.error);
    }
  }

  loadThresholds(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
    if (stored) {
      const thresholds = this.thresholdsValidator.safeParseFromStorage(stored);
      thresholds.forEach(threshold => this.thresholds.set(threshold.metricType, threshold));
    } else {
      Object.entries(DEFAULT_ANOMALY_THRESHOLDS).forEach(([type, threshold]) => {
        this.thresholds.set(type as AnomalyType, threshold);
      });
      this.saveThresholds();
    }
  }

  saveThresholds(): void {
    const thresholdsArray = Array.from(this.thresholds.values());
    const result = this.thresholdsValidator.parse(thresholdsArray);

    if (result.success) {
      localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(result.data));
    } else {
      console.error('[AnomalyDetector] Failed to save thresholds:', result.error);
    }
  }

  loadBaselines(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.BASELINES);
    if (stored) {
      const baselines = this.baselinesValidator.safeParseFromStorage(stored);
      baselines.forEach(baseline => {
        this.baselines.set(`${baseline.metricType}:${baseline.metric}`, baseline);
      });
    }
  }

  saveBaselines(): void {
    const baselinesArray = Array.from(this.baselines.values());
    const result = this.baselinesValidator.parse(baselinesArray);

    if (result.success) {
      localStorage.setItem(STORAGE_KEYS.BASELINES, JSON.stringify(result.data));
    } else {
      console.error('[AnomalyDetector] Failed to save baselines:', result.error);
    }
  }

  loadAlerts(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (stored) {
      const alerts = this.alertsValidator.safeParseFromStorage(stored);
      alerts.forEach(item => this.alerts.set(item.anomalyId, item.alerts));
    }
  }

  saveAlerts(): void {
    const alertsArray = Array.from(this.alerts.entries()).map(([anomalyId, alerts]) => ({
      anomalyId,
      alerts,
    }));
    const result = this.alertsValidator.parse(alertsArray);

    if (result.success) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(result.data));
    } else {
      console.error('[AnomalyDetector] Failed to save alerts:', result.error);
    }
  }

  detectAnomaly(
    serviceName: string,
    metricType: AnomalyType,
    metric: string,
    currentValue: number
  ): AnomalyDetectionResult {
    this.metricsHistory.addMetric(serviceName, metricType, metric, currentValue);
    const history = this.metricsHistory.getHistory(serviceName, metricType, metric);

    if (!history || history.values.length < MIN_SAMPLES_FOR_BASELINE) {
      return {
        anomaly: null,
        baseline: {
          metricType,
          metric,
          baseline: currentValue,
          samples: [currentValue],
          sampleSize: 1,
          windowSize: 7,
          lastUpdated: new Date().toISOString(),
          standardDeviation: 0,
        },
        isAnomaly: false,
        confidence: 0,
      };
    }

    const threshold = this.thresholds.get(metricType) || DEFAULT_ANOMALY_THRESHOLDS[metricType];
    const baseline = this.updateBaseline(metricType, metric, currentValue);

    let isAnomaly = false;
    let anomaly: Anomaly | null = null;
    let confidence = 0;

    if (threshold.thresholdMethod === 'z_score') {
      const zScore = this.calculateZScore(
        currentValue,
        baseline.baseline,
        baseline.standardDeviation
      );

      if (Math.abs(zScore) >= threshold.zScoreThreshold) {
        isAnomaly = true;
        confidence = Math.min(MAX_CONFIDENCE_PERCENT, Math.abs(zScore) * CONFIDENCE_MULTIPLIER);

        const severity = this.calculateSeverity(zScore, threshold.sensitivityLevel);
        const description = this.generateDescription(metricType, metric, currentValue, baseline.baseline, zScore);
        const recommendation = this.generateRecommendation(metricType, severity);

        anomaly = this.createAnomaly(
          metricType,
          metric,
          currentValue,
          baseline.baseline,
          Math.abs(zScore),
          threshold.zScoreThreshold,
          severity,
          description,
          recommendation,
          zScore
        );
      }
    } else if (threshold.thresholdMethod === 'moving_average') {
      const movingAvg = this.calculateMovingAverage(baseline.samples);
      const deviationPercent = Math.abs((currentValue - movingAvg) / movingAvg) * 100;

      if (deviationPercent >= MOVING_AVERAGE_DEVIATION_THRESHOLD) {
        isAnomaly = true;
        confidence = Math.min(MAX_CONFIDENCE_PERCENT, deviationPercent);

        const severity = this.calculateSeverityFromPercent(deviationPercent, threshold.sensitivityLevel);
        const description = this.generateDescription(
          metricType,
          metric,
          currentValue,
          movingAvg,
          deviationPercent
        );
        const recommendation = this.generateRecommendation(metricType, severity);

        anomaly = this.createAnomaly(
          metricType,
          metric,
          currentValue,
          movingAvg,
          deviationPercent,
          50,
          severity,
          description,
          recommendation
        );
      }
    }

    if (anomaly) {
      this.anomalies.set(anomaly.id, anomaly);
      this.saveAnomalies();

      if (threshold.enabled && threshold.alertChannels.length > 0) {
        this.sendAlert(anomaly, threshold.alertChannels);
      }
    }

    return {
      anomaly,
      baseline,
      isAnomaly,
      confidence,
    };
  }

  checkTrafficAnomalies(serviceName: string, requestRate: number): AnomalyDetectionResult {
    return this.detectAnomaly(serviceName, 'traffic', 'request_rate', requestRate);
  }

  checkErrorAnomalies(serviceName: string, errorRate: number): AnomalyDetectionResult {
    return this.detectAnomaly(serviceName, 'error', 'error_rate', errorRate);
  }

  checkPerformanceAnomalies(metricName: string, value: number): AnomalyDetectionResult {
    return this.detectAnomaly('application', 'performance', metricName, value);
  }

  calculateZScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return Math.round(((value - mean) / stdDev) * 100) / 100;
  }

  calculateMovingAverage(values: number[]): number {
    return this.metricsHistory.calculateRollingAverage(values);
  }

  updateBaseline(metricType: AnomalyType, metric: string, value: number): BaselineData {
    const key = `${metricType}:${metric}`;
    const existing = this.baselines.get(key);

    if (existing) {
      existing.samples.push(value);
      if (existing.samples.length > existing.windowSize * HOURS_PER_DAY) {
        existing.samples.shift();
      }
      existing.baseline = this.calculateMovingAverage(existing.samples);
      existing.sampleSize = existing.samples.length;
      existing.standardDeviation = this.metricsHistory.calculateStandardDeviation(
        existing.samples,
        existing.baseline
      );
      existing.lastUpdated = new Date().toISOString();
      this.baselines.set(key, existing);
    } else {
      const baseline: BaselineData = {
        metricType,
        metric,
        baseline: value,
        samples: [value],
        sampleSize: 1,
        windowSize: DEFAULT_BASELINE_WINDOW_DAYS * HOURS_PER_DAY,
        lastUpdated: new Date().toISOString(),
        standardDeviation: 0,
      };
      this.baselines.set(key, baseline);
    }

    this.saveBaselines();
    return this.baselines.get(key)!;
  }

  getBaselines(): BaselineData[] {
    return Array.from(this.baselines.values());
  }

  getAnomalies(filters?: {
    type?: AnomalyType;
    severity?: AnomalySeverity;
    status?: AnomalyStatus;
    startDate?: string;
    endDate?: string;
  }): Anomaly[] {
    let anomalies = Array.from(this.anomalies.values());

    if (filters) {
      if (filters.type) {
        anomalies = anomalies.filter(a => a.type === filters.type);
      }
      if (filters.severity) {
        anomalies = anomalies.filter(a => a.severity === filters.severity);
      }
      if (filters.status) {
        anomalies = anomalies.filter(a => a.status === filters.status);
      }
      if (filters.startDate) {
        anomalies = anomalies.filter(a => a.detectedAt >= filters.startDate!);
      }
      if (filters.endDate) {
        anomalies = anomalies.filter(a => a.detectedAt <= filters.endDate!);
      }
    }

    return anomalies.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  getAnomaly(id: string): Anomaly | undefined {
    return this.anomalies.get(id);
  }

  confirmAnomaly(id: string): boolean {
    const anomaly = this.anomalies.get(id);
    if (!anomaly || anomaly.status !== 'detected') {
      return false;
    }
    anomaly.status = 'confirmed';
    anomaly.confirmedAt = new Date().toISOString();
    this.saveAnomalies();
    return true;
  }

  markFalsePositive(id: string): boolean {
    const anomaly = this.anomalies.get(id);
    if (!anomaly) {
      return false;
    }
    anomaly.status = 'false_positive';
    this.saveAnomalies();
    return true;
  }

  acknowledgeAnomaly(id: string, userId: string): boolean {
    const anomaly = this.anomalies.get(id);
    if (!anomaly) {
      return false;
    }
    anomaly.status = 'investigating';
    anomaly.acknowledgedBy = userId;
    this.saveAnomalies();
    return true;
  }

  async sendAlert(anomaly: Anomaly, channels: AlertChannel[]): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = [];

    if (!anomaly || !anomaly.id) {
      return alerts;
    }

    for (const channel of channels) {
      const alert: AnomalyAlert = {
        id: this.generateAlertId(),
        anomalyId: anomaly.id,
        channels: [channel],
        sentAt: new Date().toISOString(),
        status: 'sent',
      };

      switch (channel) {
        case 'dashboard':
          alert.status = 'sent';
          break;
        case 'email':
          alert.status = 'sent';
          break;
        case 'webhook':
          alert.webhookUrl = this.thresholds.get(anomaly.type)?.webhookUrl;
          alert.status = 'sent';
          break;
        case 'sms':
          alert.status = 'sent';
          break;
      }

      alerts.push(alert);
    }

    const existingAlerts = this.alerts.get(anomaly.id) || [];
    const updatedAlerts = [...existingAlerts, ...alerts].slice(-MAX_ALERTS);
    this.alerts.set(anomaly.id, updatedAlerts);
    this.saveAlerts();

    return alerts;
  }

  getAlerts(anomalyId?: string): AnomalyAlert[] {
    if (anomalyId) {
      return this.alerts.get(anomalyId) || [];
    }
    return Array.from(this.alerts.values()).flat();
  }

  getThreshold(metricType: AnomalyType): AnomalyThreshold | null {
    return this.thresholds.get(metricType) || null;
  }

  updateThreshold(metricType: AnomalyType, threshold: Partial<AnomalyThreshold>): AnomalyThreshold {
    const existing = this.thresholds.get(metricType) || DEFAULT_ANOMALY_THRESHOLDS[metricType];
    const updated: AnomalyThreshold = {
      ...existing,
      ...threshold,
      metricType,
    };
    this.thresholds.set(metricType, updated);
    this.saveThresholds();
    return updated;
  }

  getStatistics(): AnomalyStatistics {
    const anomalies = Array.from(this.anomalies.values());
    const activeAnomalies = anomalies.filter(a => a.status === 'detected');
    const confirmedAnomalies = anomalies.filter(a => a.status === 'confirmed');
    const falsePositives = anomalies.filter(a => a.status === 'false_positive');

    const anomaliesByType: Record<AnomalyType, number> = {
      traffic: anomalies.filter(a => a.type === 'traffic').length,
      error: anomalies.filter(a => a.type === 'error').length,
      performance: anomalies.filter(a => a.type === 'performance').length,
    };

    const anomaliesBySeverity: Record<AnomalySeverity, number> = {
      low: anomalies.filter(a => a.severity === 'low').length,
      medium: anomalies.filter(a => a.severity === 'medium').length,
      high: anomalies.filter(a => a.severity === 'high').length,
      critical: anomalies.filter(a => a.severity === 'critical').length,
    };

    const lastDetection = anomalies.length > 0
      ? anomalies.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())[0].detectedAt
      : null;

    const detectionRate = anomalies.length > 0
      ? Math.round((confirmedAnomalies.length / (anomalies.length - falsePositives.length || 1)) * 100)
      : 0;

    return {
      totalAnomalies: anomalies.length,
      activeAnomalies: activeAnomalies.length,
      confirmedAnomalies: confirmedAnomalies.length,
      falsePositives: falsePositives.length,
      anomaliesByType,
      anomaliesBySeverity,
      detectionRate,
      lastDetectionTime: lastDetection,
    };
  }

  getAnomaliesRequiringAttention(): Anomaly[] {
    return this.getAnomalies({ status: 'detected' })
      .filter(a => a.severity === 'high' || a.severity === 'critical')
      .sort((a, b) => new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime());
  }

  clearAnomalies(olderThan?: string): void {
    if (olderThan) {
      const cutoff = new Date(olderThan).getTime();
      for (const [id, anomaly] of this.anomalies.entries()) {
        if (new Date(anomaly.detectedAt).getTime() < cutoff) {
          this.anomalies.delete(id);
        }
      }
    } else {
      this.anomalies.clear();
    }
    this.saveAnomalies();
  }

  reset(): void {
    this.anomalies.clear();
    this.thresholds.clear();
    this.baselines.clear();
    this.alerts.clear();
    this.metricsHistory.reset();

    Object.entries(DEFAULT_ANOMALY_THRESHOLDS).forEach(([type, threshold]) => {
      this.thresholds.set(type as AnomalyType, threshold);
    });

    localStorage.removeItem(STORAGE_KEYS.ANOMALIES);
    localStorage.removeItem(STORAGE_KEYS.BASELINES);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    this.saveThresholds();
  }

  private generateAnomalyId(): string {
    return `ANO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createAnomaly(
    type: AnomalyType,
    metric: string,
    actualValue: number,
    expectedValue: number,
    deviation: number,
    threshold: number,
    severity: AnomalySeverity,
    description: string,
    recommendation: string,
    zScore?: number
  ): Anomaly {
    return {
      id: this.generateAnomalyId(),
      type,
      severity,
      status: 'detected',
      metric,
      metricType: type,
      actualValue,
      expectedValue,
      deviation,
      zScore,
      threshold,
      detectedAt: new Date().toISOString(),
      description,
      recommendation,
    };
  }

  private calculateSeverity(zScore: number, sensitivity: string): AnomalySeverity {
    const absZScore = Math.abs(zScore);

    const sensitivityMultiplier = sensitivity === 'low'
      ? SENSITIVITY_MULTIPLIERS.LOW
      : sensitivity === 'high'
      ? SENSITIVITY_MULTIPLIERS.HIGH
      : SENSITIVITY_MULTIPLIERS.MEDIUM;

    if (absZScore >= Z_SCORE_THRESHOLDS.CRITICAL * sensitivityMultiplier) {
      return 'critical';
    } else if (absZScore >= Z_SCORE_THRESHOLDS.HIGH * sensitivityMultiplier) {
      return 'high';
    } else if (absZScore >= Z_SCORE_THRESHOLDS.MEDIUM * sensitivityMultiplier) {
      return 'medium';
    }
    return 'low';
  }

  private calculateSeverityFromPercent(deviationPercent: number, sensitivity: string): AnomalySeverity {
    const sensitivityMultiplier = sensitivity === 'low'
      ? SENSITIVITY_MULTIPLIERS.LOW
      : sensitivity === 'high'
      ? SENSITIVITY_MULTIPLIERS.HIGH
      : SENSITIVITY_MULTIPLIERS.MEDIUM;

    if (deviationPercent >= DEVIATION_THRESHOLDS.CRITICAL * sensitivityMultiplier) {
      return 'critical';
    } else if (deviationPercent >= DEVIATION_THRESHOLDS.HIGH * sensitivityMultiplier) {
      return 'high';
    } else if (deviationPercent >= DEVIATION_THRESHOLDS.MEDIUM * sensitivityMultiplier) {
      return 'medium';
    }
    return 'low';
  }

  private generateDescription(
    type: AnomalyType,
    metric: string,
    actual: number,
    expected: number,
    deviation: number
  ): string {
    const percentChange = ((actual - expected) / expected) * 100;
    const direction = percentChange > 0 ? 'increased' : 'decreased';

    switch (type) {
      case 'traffic':
        return `Traffic anomaly detected: ${metric} has ${direction} by ${Math.abs(percentChange).toFixed(1)}% (${actual} vs expected ${expected}). Deviation: ${deviation.toFixed(2)}σ.`;
      case 'error':
        return `Error rate anomaly detected: ${metric} has ${direction} by ${Math.abs(percentChange).toFixed(1)}% (${actual} vs expected ${expected}). Deviation: ${deviation.toFixed(2)}σ.`;
      case 'performance':
        return `Performance anomaly detected: ${metric} has ${direction} by ${Math.abs(percentChange).toFixed(1)}% (${actual} vs expected ${expected}). Deviation: ${deviation.toFixed(2)}%.`;
      default:
        return `Anomaly detected in ${metric}: actual value ${actual} deviates from expected ${expected} by ${deviation.toFixed(2)}.`;
    }
  }

  private generateRecommendation(type: AnomalyType, severity: AnomalySeverity): string {
    const severityPrefix = {
      low: 'Investigate',
      medium: 'Investigate and monitor',
      high: 'Investigate immediately',
      critical: 'Investigate urgently',
    }[severity];

    switch (type) {
      case 'traffic':
        return `${severityPrefix} traffic spike/drop. Check for DDoS attacks, recent deployments, or infrastructure issues.`;
      case 'error':
        return `${severityPrefix} error rate increase. Check application logs, recent deployments, and third-party service status.`;
      case 'performance':
        return `${severityPrefix} performance degradation. Check resource utilization, database queries, and CDN status.`;
      default:
        return `${severityPrefix} the detected anomaly and take appropriate action.`;
    }
  }
}

export { AnomalyDetector, MetricsHistoryManager };

let detectorInstance: AnomalyDetector | null = null;
export const anomalyDetector = new Proxy({} as AnomalyDetector, {
  get(_target, prop: string | symbol) {
    if (!detectorInstance && typeof window !== 'undefined') {
      detectorInstance = new AnomalyDetector();
    }
    if (!detectorInstance) {
      return () => {};
    }
    const value = (detectorInstance as unknown as Record<string, unknown>)[String(prop)];
    return typeof value === 'function' ? value.bind(detectorInstance) : value;
  },
});
export default anomalyDetector;
