export type AnomalyType = 'traffic' | 'error' | 'performance';

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export type AnomalyStatus = 'detected' | 'confirmed' | 'false_positive' | 'investigating';

export type AlertChannel = 'dashboard' | 'email' | 'webhook' | 'sms';

export type ThresholdMethod = 'z_score' | 'moving_average' | 'isolation_forest';

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  metric: string;
  metricType: string;
  actualValue: number;
  expectedValue: number;
  deviation: number;
  zScore?: number;
  threshold: number;
  detectedAt: string;
  confirmedAt?: string;
  acknowledgedBy?: string;
  description: string;
  recommendation: string;
  context?: Record<string, unknown>;
}

export interface AnomalyAlert {
  id: string;
  anomalyId: string;
  channels: AlertChannel[];
  sentAt: string;
  acknowledgedAt?: string;
  status: 'sent' | 'acknowledged' | 'failed';
  error?: string;
  webhookUrl?: string;
  emailAddress?: string;
}

export interface AnomalyThreshold {
  metricType: AnomalyType;
  thresholdMethod: ThresholdMethod;
  sensitivityLevel: 'low' | 'medium' | 'high';
  zScoreThreshold: number;
  movingAverageWindow: number;
  alertChannels: AlertChannel[];
  webhookUrl?: string;
  emailAddress?: string;
  enabled: boolean;
}

export interface BaselineData {
  metricType: string;
  metric: string;
  baseline: number;
  samples: number[];
  sampleSize: number;
  windowSize: number;
  lastUpdated: string;
  standardDeviation: number;
}

export interface MetricsHistory {
  serviceName: string;
  metricType: AnomalyType;
  metric: string;
  values: Array<{
    timestamp: string;
    value: number;
  }>;
  rollingAverage: number;
  standardDeviation: number;
  lastUpdated: string;
}

export interface AnomalyDetectionResult {
  anomaly: Anomaly | null;
  baseline: BaselineData;
  isAnomaly: boolean;
  confidence: number;
}

export interface AnomalyStatistics {
  totalAnomalies: number;
  activeAnomalies: number;
  confirmedAnomalies: number;
  falsePositives: number;
  anomaliesByType: Record<AnomalyType, number>;
  anomaliesBySeverity: Record<AnomalySeverity, number>;
  detectionRate: number;
  lastDetectionTime: string | null;
}

export interface IMetricsHistory {
  addMetric(serviceName: string, metricType: AnomalyType, metric: string, value: number): void;
  getHistory(serviceName: string, metricType: AnomalyType, metric: string): MetricsHistory | null;
  getBaseline(serviceName: string, metricType: AnomalyType, metric: string): number;
  calculateRollingAverage(values: number[]): number;
  calculateStandardDeviation(values: number[], mean: number): number;
  cleanupOldMetrics(maxAgeDays?: number): void;
  reset(): void;
}

export interface IAnomalyDetector {
  loadAnomalies(): void;
  saveAnomalies(): void;
  loadThresholds(): void;
  saveThresholds(): void;
  loadBaselines(): void;
  saveBaselines(): void;
  loadAlerts(): void;
  saveAlerts(): void;
  detectAnomaly(
    serviceName: string,
    metricType: AnomalyType,
    metric: string,
    currentValue: number
  ): AnomalyDetectionResult;
  checkTrafficAnomalies(serviceName: string, requestRate: number): AnomalyDetectionResult;
  checkErrorAnomalies(serviceName: string, errorRate: number): AnomalyDetectionResult;
  checkPerformanceAnomalies(metricName: string, value: number): AnomalyDetectionResult;
  calculateZScore(value: number, mean: number, stdDev: number): number;
  calculateMovingAverage(values: number[]): number;
  updateBaseline(metricType: AnomalyType, metric: string, value: number): BaselineData;
  getBaselines(): BaselineData[];
  getAnomalies(filters?: {
    type?: AnomalyType;
    severity?: AnomalySeverity;
    status?: AnomalyStatus;
    startDate?: string;
    endDate?: string;
  }): Anomaly[];
  getAnomaly(id: string): Anomaly | undefined;
  confirmAnomaly(id: string): boolean;
  markFalsePositive(id: string): boolean;
  acknowledgeAnomaly(id: string, userId: string): boolean;
  sendAlert(anomaly: Anomaly, channels: AlertChannel[]): Promise<AnomalyAlert[]>;
  getAlerts(anomalyId?: string): AnomalyAlert[];
  getThreshold(metricType: AnomalyType): AnomalyThreshold | null;
  updateThreshold(metricType: AnomalyType, threshold: Partial<AnomalyThreshold>): AnomalyThreshold;
  getStatistics(): AnomalyStatistics;
  getAnomaliesRequiringAttention(): Anomaly[];
  clearAnomalies(olderThan?: string): void;
  reset(): void;
}

export const DEFAULT_ANOMALY_THRESHOLDS: Record<AnomalyType, AnomalyThreshold> = {
  traffic: {
    metricType: 'traffic',
    thresholdMethod: 'z_score',
    sensitivityLevel: 'medium',
    zScoreThreshold: 3,
    movingAverageWindow: 7,
    alertChannels: ['dashboard', 'email'],
    enabled: true,
  },
  error: {
    metricType: 'error',
    thresholdMethod: 'z_score',
    sensitivityLevel: 'high',
    zScoreThreshold: 2,
    movingAverageWindow: 7,
    alertChannels: ['dashboard', 'email', 'webhook'],
    enabled: true,
  },
  performance: {
    metricType: 'performance',
    thresholdMethod: 'z_score',
    sensitivityLevel: 'medium',
    zScoreThreshold: 2.5,
    movingAverageWindow: 7,
    alertChannels: ['dashboard', 'email'],
    enabled: true,
  },
};
