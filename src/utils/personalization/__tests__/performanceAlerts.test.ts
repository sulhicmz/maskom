import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PersonalizationPerformanceAlerts } from '../performanceAlerts';
import type { 
  PerformanceAlert, 
  PerformanceAlertConfig,
} from '../../../../../types/personalization';

describe('PersonalizationPerformanceAlerts', () => {
  let performanceAlerts: PersonalizationPerformanceAlerts;
  let mockImpactAnalyzer: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockImpactAnalyzer = {
      calculateImpactMetrics: vi.fn(),
      calculateSegmentPerformance: vi.fn(),
      calculateRuleEffectiveness: vi.fn(),
      calculateROI: vi.fn(),
      calculateInvestment: vi.fn(),
      calculateRevenue: vi.fn(),
      calculateRevenueLift: vi.fn(),
      calculateEffectivenessScore: vi.fn(),
      calculateTrend: vi.fn(),
      calculateTrendForRule: vi.fn(),
      calculateROIMetrics: vi.fn(),
      calculateCohortAnalysis: vi.fn(),
      calculateABTestMetrics: vi.fn(),
      calculatePValue: vi.fn(),
      normalCDF: vi.fn(),
      getComprehensiveAnalytics: vi.fn(),
      generateChartData: vi.fn(),
      generateMultiSeriesChartData: vi.fn(),
      exportToCSV: vi.fn(),
    };

    performanceAlerts = new PersonalizationPerformanceAlerts(mockImpactAnalyzer);
  });

  afterEach(() => {
    performanceAlerts.reset();
    localStorage.clear();
  });

  describe('Constructor', () => {
    it('should initialize with default alert configs', () => {
      const config = performanceAlerts.getAlertConfig('conversion_drop');
      expect(config).toBeTruthy();
      expect(config?.enabled).toBe(true);
      expect(config?.thresholdValue).toBe(15);
    });

    it('should load existing alerts from localStorage', () => {
      const existingAlert: PerformanceAlert = {
        id: 'test-alert-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date().toISOString(),
        message: 'Test alert',
        recommendations: ['Fix this'],
        channels: ['dashboard'],
      };

      localStorage.setItem('personalization_alerts', JSON.stringify([existingAlert]));
      
      const newInstance = new PersonalizationPerformanceAlerts(mockImpactAnalyzer);
      const alerts = newInstance.getAlerts();
      
      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('test-alert-1');
    });
  });

  describe('checkRulePerformance', () => {
    it('should detect conversion drop when conversion rate decreases beyond threshold', () => {
      const ruleId = 'rule-1';
      const previousMetrics = {
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        segment: 'new_visitor',
        totalImpressions: 1000,
        totalConversions: 100,
        conversionRate: 10,
        totalEngagements: 200,
        engagementRate: 20,
        liftPercentage: 15,
        conversionLift: 5,
        engagementLift: 3,
        revenueGenerated: 1000,
        roi: 200,
        effectivenessScore: 80,
        startDate: '2026-01-01',
        endDate: '2026-01-30',
        trend: 'stable',
      };

      const latestMetrics = {
        ...previousMetrics,
        totalConversions: 80,
        conversionRate: 8,
      };

      performanceAlerts['updateRuleMetrics'](ruleId, previousMetrics);
      performanceAlerts['updateRuleMetrics'](ruleId, latestMetrics);

      const alert = performanceAlerts.checkRulePerformance(ruleId);

      expect(alert).toBeTruthy();
      expect(alert?.alertType).toBe('conversion_drop');
      expect(alert?.severity).toBe('critical');
      expect(alert?.ruleId).toBe(ruleId);
    });

    it('should return null when no metrics history exists', () => {
      const alert = performanceAlerts.checkRulePerformance('non-existent-rule');
      expect(alert).toBeNull();
    });

    it('should detect negative lift alert', () => {
      const ruleId = 'rule-2';
      const previousMetrics = {
        ruleId: 'rule-2',
        ruleName: 'Test Rule 2',
        segment: 'returning_visitor',
        totalImpressions: 1000,
        totalConversions: 100,
        conversionRate: 10,
        totalEngagements: 200,
        engagementRate: 20,
        liftPercentage: 5,
        conversionLift: 2,
        engagementLift: 1,
        revenueGenerated: 500,
        roi: 100,
        effectivenessScore: 70,
        startDate: '2026-01-01',
        endDate: '2026-01-30',
        trend: 'stable',
      };

      const latestMetrics = {
        ...previousMetrics,
        liftPercentage: -5,
      };

      performanceAlerts['updateRuleMetrics'](ruleId, previousMetrics);
      performanceAlerts['updateRuleMetrics'](ruleId, latestMetrics);

      const alert = performanceAlerts.checkRulePerformance(ruleId);

      expect(alert).toBeTruthy();
      expect(alert?.alertType).toBe('negative_lift');
      expect(alert?.severity).toBe('critical');
    });
  });

  describe('updateAlertConfig', () => {
    it('should update alert configuration', () => {
      const updatedConfig = performanceAlerts.updateAlertConfig('conversion_drop', {
        thresholdValue: 20,
        severity: 'warning',
        enabled: false,
      });

      expect(updatedConfig.thresholdValue).toBe(20);
      expect(updatedConfig.severity).toBe('warning');
      expect(updatedConfig.enabled).toBe(false);
    });

    it('should persist updated config to localStorage', () => {
      performanceAlerts.updateAlertConfig('engagement_drop', {
        thresholdValue: 25,
      });

      const stored = localStorage.getItem('personalization_alert_configs');
      const configs = JSON.parse(stored || '[]');
      const engagementConfig = configs.find((c: PerformanceAlertConfig) => c.alertType === 'engagement_drop');

      expect(engagementConfig?.thresholdValue).toBe(25);
    });
  });

  describe('getAlerts', () => {
    it('should return all alerts when no filters applied', () => {
      const testAlert: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date().toISOString(),
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      performanceAlerts['alerts'].set('test-1', testAlert);

      const alerts = performanceAlerts.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('test-1');
    });

    it('should filter alerts by type', () => {
      const alert1: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule 1',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date().toISOString(),
        message: 'Test 1',
        recommendations: [],
        channels: ['dashboard'],
      };

      const alert2: PerformanceAlert = {
        ...alert1,
        id: 'test-2',
        alertType: 'engagement_drop',
        ruleName: 'Test Rule 2',
      };

      performanceAlerts['alerts'].set('test-1', alert1);
      performanceAlerts['alerts'].set('test-2', alert2);

      const alerts = performanceAlerts.getAlerts({ type: 'conversion_drop' });
      expect(alerts).toHaveLength(1);
      expect(alerts[0].alertType).toBe('conversion_drop');
    });

    it('should filter alerts by severity', () => {
      const alert1: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date().toISOString(),
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      const alert2: PerformanceAlert = {
        ...alert1,
        id: 'test-2',
        severity: 'warning',
        alertType: 'engagement_drop',
      };

      performanceAlerts['alerts'].set('test-1', alert1);
      performanceAlerts['alerts'].set('test-2', alert2);

      const alerts = performanceAlerts.getAlerts({ severity: 'critical' });
      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('critical');
    });

    it('should filter alerts by status', () => {
      const alert1: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date().toISOString(),
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      const alert2: PerformanceAlert = {
        ...alert1,
        id: 'test-2',
        status: 'acknowledged',
      };

      performanceAlerts['alerts'].set('test-1', alert1);
      performanceAlerts['alerts'].set('test-2', alert2);

      const alerts = performanceAlerts.getAlerts({ status: 'active' });
      expect(alerts).toHaveLength(1);
      expect(alerts[0].status).toBe('active');
    });

    it('should filter alerts by date range', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const today = new Date().toISOString();

      const alert1: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: yesterday,
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      const alert2: PerformanceAlert = {
        ...alert1,
        id: 'test-2',
        detectedAt: today,
      };

      performanceAlerts['alerts'].set('test-1', alert1);
      performanceAlerts['alerts'].set('test-2', alert2);

      const alerts = performanceAlerts.getAlerts({ startDate: today });
      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe('test-2');
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge an active alert', () => {
      const alert: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date().toISOString(),
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      performanceAlerts['alerts'].set('test-1', alert);

      const result = performanceAlerts.acknowledgeAlert('test-1', 'admin');
      expect(result).toBe(true);

      const updatedAlert = performanceAlerts.getAlerts()[0];
      expect(updatedAlert.status).toBe('acknowledged');
      expect(updatedAlert.acknowledgedBy).toBe('admin');
    });

    it('should not acknowledge an already acknowledged alert', () => {
      const alert: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'acknowledged',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date().toISOString(),
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      performanceAlerts['alerts'].set('test-1', alert);

      const result = performanceAlerts.acknowledgeAlert('test-1', 'admin');
      expect(result).toBe(false);
    });

    it('should return false for non-existent alert', () => {
      const result = performanceAlerts.acknowledgeAlert('non-existent', 'admin');
      expect(result).toBe(false);
    });
  });

  describe('resolveAlert', () => {
    it('should resolve an alert and create history entry', () => {
      const alert: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date(Date.now() - 3600000).toISOString(),
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      performanceAlerts['alerts'].set('test-1', alert);

      const result = performanceAlerts.resolveAlert('test-1', 'rule_disabled', 'Test resolution');
      expect(result).toBe(true);

      const updatedAlert = performanceAlerts.getAlerts()[0];
      expect(updatedAlert.status).toBe('resolved');
      expect(updatedAlert.resolution).toBe('rule_disabled');
      expect(updatedAlert.resolutionNotes).toBe('Test resolution');

      const history = performanceAlerts.getAlertHistory();
      expect(history).toHaveLength(1);
      expect(history[0].alertId).toBe('test-1');
      expect(history[0].resolution).toBe('rule_disabled');
    });

    it('should calculate time to resolve correctly', () => {
      const detectedAt = new Date(Date.now() - 7200000).toISOString();
      const alert: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt,
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      performanceAlerts['alerts'].set('test-1', alert);

      performanceAlerts.resolveAlert('test-1', 'rule_disabled', 'Test');

      const history = performanceAlerts.getAlertHistory()[0];
      expect(history.timeToResolve).toBe(120);
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', () => {
      const alert1: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Rule 1',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date().toISOString(),
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      const alert2: PerformanceAlert = {
        ...alert1,
        id: 'test-2',
        alertType: 'engagement_drop',
        severity: 'warning',
        status: 'acknowledged',
        ruleId: 'rule-2',
        ruleName: 'Rule 2',
      };

      const alert3: PerformanceAlert = {
        ...alert1,
        id: 'test-3',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Rule 1',
      };

      performanceAlerts['alerts'].set('test-1', alert1);
      performanceAlerts['alerts'].set('test-2', alert2);
      performanceAlerts['alerts'].set('test-3', alert3);

      const stats = performanceAlerts.getStatistics();

      expect(stats.totalAlerts).toBe(3);
      expect(stats.activeAlerts).toBe(2);
      expect(stats.acknowledgedAlerts).toBe(1);
      expect(stats.alertsByType.conversion_drop).toBe(2);
      expect(stats.alertsByType.engagement_drop).toBe(1);
      expect(stats.alertsBySeverity.critical).toBe(2);
      expect(stats.alertsBySeverity.warning).toBe(1);
      expect(stats.alertsByRule['rule-1']).toBe(2);
      expect(stats.alertsByRule['rule-2']).toBe(1);
    });

    it('should calculate average resolution time correctly', () => {
      performanceAlerts['alertHistory'].set('hist-1', {
        alertId: 'test-1',
        ruleId: 'rule-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        detectedAt: new Date(Date.now() - 3600000).toISOString(),
        resolvedAt: new Date(Date.now() - 1800000).toISOString(),
        timeToResolve: 30,
        resolution: 'rule_disabled',
        impactAssessment: 'Test impact',
      });

      performanceAlerts['alertHistory'].set('hist-2', {
        alertId: 'test-2',
        ruleId: 'rule-1',
        alertType: 'engagement_drop',
        severity: 'warning',
        detectedAt: new Date(Date.now() - 7200000).toISOString(),
        resolvedAt: new Date(Date.now() - 3600000).toISOString(),
        timeToResolve: 60,
        resolution: 'variants_adjusted',
        impactAssessment: 'Test impact 2',
      });

      const stats = performanceAlerts.getStatistics();
      expect(stats.avgResolutionTime).toBe(45);
    });
  });

  describe('clearResolvedAlerts', () => {
    it('should clear resolved alerts older than specified days', () => {
      const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
      const recentDate = new Date().toISOString();

      const alert1: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'resolved',
        resolvedAt: oldDate,
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: oldDate,
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      const alert2: PerformanceAlert = {
        ...alert1,
        id: 'test-2',
        detectedAt: recentDate,
        resolvedAt: recentDate,
        status: 'resolved',
      };

      const alert3: PerformanceAlert = {
        ...alert1,
        id: 'test-3',
        status: 'active',
        detectedAt: recentDate,
      };

      performanceAlerts['alerts'].set('test-1', alert1);
      performanceAlerts['alerts'].set('test-2', alert2);
      performanceAlerts['alerts'].set('test-3', alert3);

      performanceAlerts.clearResolvedAlerts(30);

      const alerts = performanceAlerts.getAlerts();
      expect(alerts).toHaveLength(2);
      expect(alerts.find(a => a.id === 'test-1')).toBeUndefined();
      expect(alerts.find(a => a.id === 'test-2')).toBeTruthy();
      expect(alerts.find(a => a.id === 'test-3')).toBeTruthy();
    });
  });

  describe('reset', () => {
    it('should clear all data and reset to defaults', () => {
      const alert: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date().toISOString(),
        message: 'Test',
        recommendations: [],
        channels: ['dashboard'],
      };

      performanceAlerts['alerts'].set('test-1', alert);
      performanceAlerts['alertHistory'].set('hist-1', {
        alertId: 'test-1',
        ruleId: 'rule-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        detectedAt: new Date().toISOString(),
        impactAssessment: 'Test',
      });

      performanceAlerts.updateAlertConfig('conversion_drop', { enabled: false });

      performanceAlerts.reset();

      expect(performanceAlerts.getAlerts()).toHaveLength(0);
      expect(performanceAlerts.getAlertHistory()).toHaveLength(0);

      const config = performanceAlerts.getAlertConfig('conversion_drop');
      expect(config?.enabled).toBe(true);
      expect(config?.thresholdValue).toBe(15);
    });
  });

  describe('sendAlert', () => {
    it('should log dashboard alerts to console', () => {
      const alert: PerformanceAlert = {
        id: 'test-1',
        alertType: 'conversion_drop',
        severity: 'critical',
        status: 'active',
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        currentValue: 10,
        previousValue: 20,
        thresholdValue: 15,
        thresholdUnit: 'percent',
        percentChange: -50,
        detectedAt: new Date().toISOString(),
        message: 'Test alert',
        recommendations: [],
        channels: ['dashboard'],
      };

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      performanceAlerts.sendAlert(alert);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Personalization Performance Alert] Test alert')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Alert Type Detection', () => {
    it('should detect zero lift correctly', () => {
      const ruleId = 'rule-1';
      const metrics = {
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        segment: 'new_visitor',
        totalImpressions: 1000,
        totalConversions: 100,
        conversionRate: 10,
        totalEngagements: 200,
        engagementRate: 20,
        liftPercentage: 0,
        conversionLift: 0,
        engagementLift: 0,
        revenueGenerated: 500,
        roi: 50,
        effectivenessScore: 50,
        startDate: '2026-01-01',
        endDate: '2026-01-30',
        trend: 'stable',
      };

      const previousMetrics = {
        ...metrics,
        liftPercentage: 5,
      };

      performanceAlerts['updateRuleMetrics'](ruleId, previousMetrics);
      performanceAlerts['updateRuleMetrics'](ruleId, metrics);

      const alert = performanceAlerts.checkRulePerformance(ruleId);

      expect(alert?.alertType).toBe('zero_lift');
      expect(alert?.severity).toBe('warning');
    });

    it('should detect lift degradation correctly', () => {
      const ruleId = 'rule-2';
      const previousMetrics = {
        ruleId: 'rule-2',
        ruleName: 'Test Rule 2',
        segment: 'returning_visitor',
        totalImpressions: 1000,
        totalConversions: 100,
        conversionRate: 10,
        totalEngagements: 200,
        engagementRate: 20,
        liftPercentage: 20,
        conversionLift: 5,
        engagementLift: 3,
        revenueGenerated: 1000,
        roi: 100,
        effectivenessScore: 80,
        startDate: '2026-01-01',
        endDate: '2026-01-30',
        trend: 'up',
      };

      const latestMetrics = {
        ...previousMetrics,
        liftPercentage: 15,
      };

      performanceAlerts['updateRuleMetrics'](ruleId, previousMetrics);
      performanceAlerts['updateRuleMetrics'](ruleId, latestMetrics);

      const alert = performanceAlerts.checkRulePerformance(ruleId);

      expect(alert?.alertType).toBe('lift_degradation');
      expect(alert?.severity).toBe('warning');
    });

    it('should detect rule underperforming correctly', () => {
      const ruleId = 'rule-3';
      const metrics = {
        ruleId: 'rule-3',
        ruleName: 'Test Rule 3',
        segment: 'frequent_reader',
        totalImpressions: 1000,
        totalConversions: 50,
        conversionRate: 5,
        totalEngagements: 100,
        engagementRate: 10,
        liftPercentage: 2,
        conversionLift: -1,
        engagementLift: -2,
        revenueGenerated: 100,
        roi: -50,
        effectivenessScore: 3,
        startDate: '2026-01-01',
        endDate: '2026-01-30',
        trend: 'down',
      };

      const previousMetrics = {
        ...metrics,
        effectivenessScore: 6,
      };

      performanceAlerts['updateRuleMetrics'](ruleId, previousMetrics);
      performanceAlerts['updateRuleMetrics'](ruleId, metrics);

      const alert = performanceAlerts.checkRulePerformance(ruleId);

      expect(alert?.alertType).toBe('rule_underperforming');
      expect(alert?.severity).toBe('info');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing impact analyzer gracefully', () => {
      const noAnalyzerInstance = new PersonalizationPerformanceAlerts(null);
      const result = noAnalyzerInstance.checkRulePerformance('rule-1');
      expect(result).toBeNull();
    });

    it('should handle empty metrics history', () => {
      performanceAlerts['ruleMetricsHistory'].set('rule-1', []);
      const result = performanceAlerts.checkRulePerformance('rule-1');
      expect(result).toBeNull();
    });

    it('should handle single metrics entry', () => {
      const metrics = {
        ruleId: 'rule-1',
        ruleName: 'Test Rule',
        segment: 'new_visitor',
        totalImpressions: 1000,
        totalConversions: 100,
        conversionRate: 10,
        totalEngagements: 200,
        engagementRate: 20,
        liftPercentage: 15,
        conversionLift: 5,
        engagementLift: 3,
        revenueGenerated: 1000,
        roi: 100,
        effectivenessScore: 80,
        startDate: '2026-01-01',
        endDate: '2026-01-30',
        trend: 'stable',
      };

      performanceAlerts['updateRuleMetrics']('rule-1', metrics);
      const result = performanceAlerts.checkRulePerformance('rule-1');
      expect(result).toBeNull();
    });
  });
});
