import {
  AnomalyDetector,
} from '../anomalyDetector';

describe('AnomalyDetector', () => {
  let detector: AnomalyDetector;

  beforeEach(() => {
    localStorage.clear();
    detector = new AnomalyDetector();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with default thresholds', () => {
      const trafficThreshold = detector.getThreshold('traffic');
      const errorThreshold = detector.getThreshold('error');
      const performanceThreshold = detector.getThreshold('performance');

      expect(trafficThreshold).not.toBeNull();
      expect(errorThreshold).not.toBeNull();
      expect(performanceThreshold).not.toBeNull();

      expect(trafficThreshold?.metricType).toBe('traffic');
      expect(errorThreshold?.metricType).toBe('error');
      expect(performanceThreshold?.metricType).toBe('performance');

      expect(trafficThreshold?.enabled).toBe(true);
      expect(errorThreshold?.enabled).toBe(true);
      expect(performanceThreshold?.enabled).toBe(true);
    });

    it('should persist thresholds to localStorage', () => {
      detector.updateThreshold('traffic', { zScoreThreshold: 5 });
      const newDetector = new AnomalyDetector();
      const threshold = newDetector.getThreshold('traffic');
      expect(threshold?.zScoreThreshold).toBe(5);
    });

    it('should load anomalies from localStorage', () => {
      const anomalies = localStorage.getItem('anomalies');
      expect(anomalies).toBeNull();

      for (let i = 0; i < 10; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }
      detector.detectAnomaly('service1', 'traffic', 'request_rate', 1000);
      const newDetector = new AnomalyDetector();
      const loadedAnomalies = newDetector.getAnomalies();
      expect(loadedAnomalies.length).toBeGreaterThan(0);
    });
  });

  describe('Z-Score Calculation', () => {
    it('should calculate z-score correctly', () => {
      const zScore = detector.calculateZScore(150, 100, 10);
      expect(zScore).toBe(5);
    });

    it('should calculate z-score for below average values', () => {
      const zScore = detector.calculateZScore(50, 100, 10);
      expect(zScore).toBe(-5);
    });

    it('should return 0 when standard deviation is 0', () => {
      const zScore = detector.calculateZScore(100, 100, 0);
      expect(zScore).toBe(0);
    });

    it('should round z-score to 2 decimal places', () => {
      const zScore = detector.calculateZScore(105, 100, 3);
      expect(zScore).toBe(1.67);
    });
  });

  describe('Moving Average Calculation', () => {
    it('should calculate moving average correctly', () => {
      const values = [10, 20, 30, 40, 50];
      const avg = detector.calculateMovingAverage(values);
      expect(avg).toBe(30);
    });

    it('should handle empty array', () => {
      const avg = detector.calculateMovingAverage([]);
      expect(avg).toBe(0);
    });

    it('should handle single value', () => {
      const avg = detector.calculateMovingAverage([100]);
      expect(avg).toBe(100);
    });
  });

  describe('Baseline Management', () => {
    it('should update baseline with new value', () => {
      const baseline = detector.updateBaseline('traffic', 'request_rate', 100);
      expect(baseline.metricType).toBe('traffic');
      expect(baseline.metric).toBe('request_rate');
      expect(baseline.baseline).toBe(100);
      expect(baseline.samples).toHaveLength(1);
    });

    it('should calculate baseline from multiple samples', () => {
      detector.updateBaseline('traffic', 'request_rate', 100);
      detector.updateBaseline('traffic', 'request_rate', 200);
      detector.updateBaseline('traffic', 'request_rate', 300);

      const baseline = detector.getBaselines().find(
        b => b.metricType === 'traffic' && b.metric === 'request_rate'
      );
      expect(baseline?.baseline).toBe(200);
    });

    it('should limit sample size to window size', () => {
      const largeWindow = 100;
      const baseline = detector.updateBaseline('traffic', 'request_rate', 100);
      expect(baseline.samples).toHaveLength(1);

      for (let i = 0; i < largeWindow + 10; i++) {
        detector.updateBaseline('traffic', 'request_rate', i);
      }

      const updatedBaseline = detector.getBaselines().find(
        b => b.metricType === 'traffic' && b.metric === 'request_rate'
      );
      expect(updatedBaseline?.samples.length).toBeLessThanOrEqual(largeWindow);
    });

    it('should persist baselines to localStorage', () => {
      detector.updateBaseline('traffic', 'request_rate', 100);
      const newDetector = new AnomalyDetector();
      const baselines = newDetector.getBaselines();
      expect(baselines.length).toBeGreaterThan(0);
    });
  });

  describe('Anomaly Detection', () => {
    it('should detect traffic anomaly when z-score exceeds threshold', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      const result = detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);

      expect(result.isAnomaly).toBe(true);
      expect(result.anomaly).not.toBeNull();
      expect(result.anomaly?.type).toBe('traffic');
      expect(result.anomaly?.severity).not.toBe('low');
    });

    it('should detect error anomaly when error rate spikes', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'error', 'error_rate', 0.01);
      }

      const result = detector.detectAnomaly('service1', 'error', 'error_rate', 0.5);

      expect(result.isAnomaly).toBe(true);
      expect(result.anomaly?.type).toBe('error');
      expect(result.anomaly?.severity).not.toBe('low');
    });

    it('should detect performance anomaly for metrics', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('application', 'performance', 'lcp', 2000);
      }

      const result = detector.detectAnomaly('application', 'performance', 'lcp', 8000);

      expect(result.isAnomaly).toBe(true);
      expect(result.anomaly?.type).toBe('performance');
    });

    it('should not detect anomaly for normal variations', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      const result = detector.detectAnomaly('service1', 'traffic', 'request_rate', 110);

      expect(result.isAnomaly).toBe(false);
      expect(result.anomaly).toBeNull();
    });

    it('should not detect anomaly with insufficient history', () => {
      const result = detector.detectAnomaly('service1', 'traffic', 'request_rate', 1000);

      expect(result.isAnomaly).toBe(false);
      expect(result.anomaly).toBeNull();
    });

    it('should calculate correct z-score in anomaly', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      const result = detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);

      expect(result.anomaly?.zScore).toBeGreaterThan(3);
    });

    it('should assign correct severity based on z-score', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      const result = detector.detectAnomaly('service1', 'traffic', 'request_rate', 1000);
      expect(['high', 'critical']).toContain(result.anomaly?.severity);
    });

    it('should create unique anomaly IDs', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      const anomalies = detector.getAnomalies();
      const uniqueIds = new Set(anomalies.map(a => a.id));
      expect(uniqueIds.size).toBe(anomalies.length);
    });
  });

  describe('Anomaly Filtering', () => {
    beforeEach(() => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }
      detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);
      detector.detectAnomaly('service1', 'error', 'error_rate', 0.5);
      detector.detectAnomaly('application', 'performance', 'lcp', 8000);
    });

    it('should filter anomalies by type', () => {
      const trafficAnomalies = detector.getAnomalies({ type: 'traffic' });
      const errorAnomalies = detector.getAnomalies({ type: 'error' });
      const performanceAnomalies = detector.getAnomalies({ type: 'performance' });

      expect(trafficAnomalies.length).toBeGreaterThan(0);
      expect(errorAnomalies.length).toBeGreaterThan(0);
      expect(performanceAnomalies.length).toBeGreaterThan(0);

      expect(trafficAnomalies.every(a => a.type === 'traffic')).toBe(true);
      expect(errorAnomalies.every(a => a.type === 'error')).toBe(true);
      expect(performanceAnomalies.every(a => a.type === 'performance')).toBe(true);
    });

    it('should filter anomalies by severity', () => {
      const highSeverityAnomalies = detector.getAnomalies({ severity: 'high' });
      expect(highSeverityAnomalies.every(a => a.severity === 'high')).toBe(true);
    });

    it('should filter anomalies by status', () => {
      const detectedAnomalies = detector.getAnomalies({ status: 'detected' });
      expect(detectedAnomalies.every(a => a.status === 'detected')).toBe(true);
    });

    it('should sort anomalies by detected time descending', () => {
      const anomalies = detector.getAnomalies();
      for (let i = 0; i < anomalies.length - 1; i++) {
        expect(new Date(anomalies[i].detectedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(anomalies[i + 1].detectedAt).getTime()
        );
      }
    });
  });

  describe('Anomaly Status Management', () => {
    let anomalyId: string;

    beforeEach(() => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }
      const result = detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);
      anomalyId = result.anomaly!.id;
    });

    it('should confirm anomaly', () => {
      const confirmed = detector.confirmAnomaly(anomalyId);
      expect(confirmed).toBe(true);

      const anomaly = detector.getAnomaly(anomalyId);
      expect(anomaly?.status).toBe('confirmed');
      expect(anomaly?.confirmedAt).not.toBeUndefined();
    });

    it('should not confirm already confirmed anomaly', () => {
      detector.confirmAnomaly(anomalyId);
      const confirmed = detector.confirmAnomaly(anomalyId);
      expect(confirmed).toBe(false);
    });

    it('should mark anomaly as false positive', () => {
      const marked = detector.markFalsePositive(anomalyId);
      expect(marked).toBe(true);

      const anomaly = detector.getAnomaly(anomalyId);
      expect(anomaly?.status).toBe('false_positive');
    });

    it('should acknowledge anomaly with user ID', () => {
      const acknowledged = detector.acknowledgeAnomaly(anomalyId, 'user123');
      expect(acknowledged).toBe(true);

      const anomaly = detector.getAnomaly(anomalyId);
      expect(anomaly?.status).toBe('investigating');
      expect(anomaly?.acknowledgedBy).toBe('user123');
    });

    it('should not manage non-existent anomaly', () => {
      const confirmed = detector.confirmAnomaly('non-existent');
      const marked = detector.markFalsePositive('non-existent');
      const acknowledged = detector.acknowledgeAnomaly('non-existent', 'user123');

      expect(confirmed).toBe(false);
      expect(marked).toBe(false);
      expect(acknowledged).toBe(false);
    });
  });

  describe('Threshold Management', () => {
    it('should update threshold configuration', () => {
      const updated = detector.updateThreshold('traffic', {
        zScoreThreshold: 4,
        sensitivityLevel: 'low',
      });

      expect(updated.zScoreThreshold).toBe(4);
      expect(updated.sensitivityLevel).toBe('low');
    });

    it('should preserve other threshold properties when updating', () => {
      const original = detector.getThreshold('traffic');
      const updated = detector.updateThreshold('traffic', { zScoreThreshold: 4 });

      expect(updated.metricType).toBe(original?.metricType);
      expect(updated.thresholdMethod).toBe(original?.thresholdMethod);
      expect(updated.alertChannels).toEqual(original?.alertChannels);
    });

    it('should persist updated thresholds', () => {
      detector.updateThreshold('traffic', { zScoreThreshold: 5 });
      const newDetector = new AnomalyDetector();
      const threshold = newDetector.getThreshold('traffic');
      expect(threshold?.zScoreThreshold).toBe(5);
    });

    it('should use new threshold for detection', () => {
      detector.updateThreshold('traffic', { zScoreThreshold: 5 });

      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      const result = detector.detectAnomaly('service1', 'traffic', 'request_rate', 400);
      expect(result.isAnomaly).toBe(false);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 95 + Math.random() * 10);
      }
      detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);
      detector.detectAnomaly('service1', 'error', 'error_rate', 0.5);

      const anomalies = detector.getAnomalies();
      if (anomalies.length > 0) {
        detector.confirmAnomaly(anomalies[0].id);
      }
      if (anomalies.length > 1) {
        detector.markFalsePositive(anomalies[1].id);
      }
    });

    it('should calculate total anomalies count', () => {
      const stats = detector.getStatistics();
      expect(stats.totalAnomalies).toBeGreaterThan(0);
    });

    it('should count active anomalies', () => {
      const stats = detector.getStatistics();
      expect(stats.activeAnomalies).toBeGreaterThan(0);
    });

    it('should count confirmed anomalies', () => {
      const stats = detector.getStatistics();
      expect(stats.confirmedAnomalies).toBeGreaterThan(0);
    });

    it('should count false positives', () => {
      const stats = detector.getStatistics();
      expect(stats.falsePositives).toBeGreaterThan(0);
    });

    it('should count anomalies by type', () => {
      const stats = detector.getStatistics();
      expect(stats.anomaliesByType.traffic).toBeGreaterThan(0);
      expect(stats.anomaliesByType.error).toBeGreaterThan(0);
    });

    it('should count anomalies by severity', () => {
      const stats = detector.getStatistics();
      expect(stats.anomaliesBySeverity).toBeDefined();
    });

    it('should have last detection time', () => {
      const stats = detector.getStatistics();
      expect(stats.lastDetectionTime).not.toBeNull();
    });
  });

  describe('Anomalies Requiring Attention', () => {
    it('should return high and critical severity anomalies', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }
      detector.detectAnomaly('service1', 'traffic', 'request_rate', 1000);

      const requiringAttention = detector.getAnomaliesRequiringAttention();
      expect(requiringAttention.length).toBeGreaterThan(0);
      expect(requiringAttention.every(a => a.severity === 'high' || a.severity === 'critical')).toBe(true);
    });

    it('should sort anomalies by detection time ascending', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }
      detector.detectAnomaly('service1', 'traffic', 'request_rate', 1000);
      detector.detectAnomaly('service1', 'traffic', 'request_rate', 800);

      const requiringAttention = detector.getAnomaliesRequiringAttention();
      for (let i = 0; i < requiringAttention.length - 1; i++) {
        expect(new Date(requiringAttention[i].detectedAt).getTime()).toBeLessThanOrEqual(
          new Date(requiringAttention[i + 1].detectedAt).getTime()
        );
      }
    });
  });

  describe('Alert System', () => {
    it('should send alerts for detected anomaly', async () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      const result = detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);
      const alerts = await detector.sendAlert(result.anomaly!, ['dashboard', 'email']);

      expect(alerts).toHaveLength(2);
      expect(alerts.every(a => a.status === 'sent')).toBe(true);
    });

    it('should persist alerts to localStorage', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      const result = detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);
      detector.sendAlert(result.anomaly!, ['dashboard']);

      const alerts = detector.getAlerts(result.anomaly!.id);
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should get alerts by anomaly ID', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      const result = detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);
      detector.sendAlert(result.anomaly!, ['dashboard', 'email']);

      const alerts = detector.getAlerts(result.anomaly!.id);
      expect(alerts).toHaveLength(2);
    });

    it('should get all alerts when no ID provided', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      const result1 = detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);
      const result2 = detector.detectAnomaly('service1', 'error', 'error_rate', 0.5);

      detector.sendAlert(result1.anomaly!, ['dashboard']);
      detector.sendAlert(result2.anomaly!, ['email']);

      const allAlerts = detector.getAlerts();
      expect(allAlerts.length).toBeGreaterThan(0);
    });
  });

  describe('Data Cleanup', () => {
    it('should clear old anomalies', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }
      detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);

      const beforeClear = detector.getAnomalies().length;
      detector.clearAnomalies('2099-01-01');
      const afterClear = detector.getAnomalies().length;

      expect(afterClear).toBe(0);
      expect(beforeClear).toBeGreaterThan(afterClear);
    });

    it('should clear all anomalies when no date specified', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }

      detector.clearAnomalies();
      const anomalies = detector.getAnomalies();
      expect(anomalies).toHaveLength(0);
    });

    it('should reset all data', () => {
      for (let i = 0; i < 20; i++) {
        detector.detectAnomaly('service1', 'traffic', 'request_rate', 100);
      }
      detector.detectAnomaly('service1', 'traffic', 'request_rate', 500);

      detector.reset();

      const anomalies = detector.getAnomalies();
      const baselines = detector.getBaselines();
      const alerts = detector.getAlerts();

      expect(anomalies).toHaveLength(0);
      expect(baselines).toHaveLength(0);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Convenience Methods', () => {
    it('should check traffic anomalies', () => {
      for (let i = 0; i < 20; i++) {
        detector.checkTrafficAnomalies('service1', 100);
      }

      const result = detector.checkTrafficAnomalies('service1', 500);
      expect(result.isAnomaly).toBe(true);
    });

    it('should check error anomalies', () => {
      for (let i = 0; i < 20; i++) {
        detector.checkErrorAnomalies('service1', 0.01);
      }

      const result = detector.checkErrorAnomalies('service1', 0.5);
      expect(result.isAnomaly).toBe(true);
    });

    it('should check performance anomalies', () => {
      for (let i = 0; i < 20; i++) {
        detector.checkPerformanceAnomalies('lcp', 2000);
      }

      const result = detector.checkPerformanceAnomalies('lcp', 8000);
      expect(result.isAnomaly).toBe(true);
    });
  });
});
