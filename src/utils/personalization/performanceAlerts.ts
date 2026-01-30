import { z } from 'zod';
import {
  AlertSeverity,
  AlertStatus,
  AlertChannel,
  PerformanceAlertType,
  PerformanceAlertConfig,
  PerformanceAlert,
  AlertHistory,
  PerformanceAlertStatistics,
  AlertResolution,
  IPersonalizationPerformanceAlerts,
  PersonalizationRule,
  RuleEffectiveness,
  UserSegment,
} from '@/types/personalization';
import { StorageValidator } from '@/utils/storageValidator';
import type { IPersonalizationImpactAnalyzer } from '@/types/personalization';

const STORAGE_KEYS = {
  ALERTS: 'personalization_alerts',
  ALERT_CONFIGS: 'personalization_alert_configs',
  ALERT_HISTORY: 'personalization_alert_history',
  ALERT_STATS: 'personalization_alert_stats',
};

const DEFAULT_CHECK_INTERVAL = 10; // minutes
const DEFAULT_SLIDING_WINDOW = 24; // hours
const MAX_ALERTS = 1000;
const MAX_HISTORY = 500;

const performanceAlertArraySchema = z.array(
  z.object({
    id: z.string(),
    alertType: z.enum(['conversion_drop', 'engagement_drop', 'lift_degradation', 'rule_underperforming', 'zero_lift', 'negative_lift']),
    severity: z.enum(['critical', 'warning', 'info']),
    status: z.enum(['active', 'acknowledged', 'resolved']),
    ruleId: z.string(),
    ruleName: z.string(),
    segment: z.enum(['new_visitor', 'returning_visitor', 'frequent_reader', 'content_creator', 'engaged_user', 'dormant_user']).optional(),
    currentValue: z.number(),
    previousValue: z.number(),
    thresholdValue: z.number(),
    thresholdUnit: z.enum(['percent', 'absolute']),
    percentChange: z.number(),
    detectedAt: z.string(),
    acknowledgedAt: z.string().optional(),
    resolvedAt: z.string().optional(),
    acknowledgedBy: z.string().optional(),
    resolution: z.enum(['rule_disabled', 'variants_adjusted', 'conditions_modified', 'threshold_updated', 'ignored', 'monitoring_continued']).optional(),
    resolutionNotes: z.string().optional(),
    message: z.string(),
    recommendations: z.array(z.string()),
    channels: z.array(z.enum(['dashboard', 'email', 'webhook'])),
  })
);

const alertConfigArraySchema = z.array(
  z.object({
    alertType: z.enum(['conversion_drop', 'engagement_drop', 'lift_degradation', 'rule_underperforming', 'zero_lift', 'negative_lift']),
    enabled: z.boolean(),
    severity: z.enum(['critical', 'warning', 'info']),
    thresholdValue: z.number(),
    thresholdUnit: z.enum(['percent', 'absolute']),
    checkInterval: z.number(),
    slidingWindowHours: z.number(),
    alertChannels: z.array(z.enum(['dashboard', 'email', 'webhook'])),
    webhookUrl: z.string().optional(),
    emailAddress: z.string().optional(),
  })
);

const alertHistoryArraySchema = z.array(
  z.object({
    alertId: z.string(),
    ruleId: z.string(),
    alertType: z.enum(['conversion_drop', 'engagement_drop', 'lift_degradation', 'rule_underperforming', 'zero_lift', 'negative_lift']),
    severity: z.enum(['critical', 'warning', 'info']),
    detectedAt: z.string(),
    resolvedAt: z.string().optional(),
    timeToResolve: z.number().optional(),
    resolution: z.enum(['rule_disabled', 'variants_adjusted', 'conditions_modified', 'threshold_updated', 'ignored', 'monitoring_continued']).optional(),
    impactAssessment: z.string(),
  })
);

const DEFAULT_ALERT_CONFIGS: Record<PerformanceAlertType, PerformanceAlertConfig> = {
  conversion_drop: {
    alertType: 'conversion_drop',
    enabled: true,
    severity: 'critical',
    thresholdValue: 15,
    thresholdUnit: 'percent',
    checkInterval: DEFAULT_CHECK_INTERVAL,
    slidingWindowHours: DEFAULT_SLIDING_WINDOW,
    alertChannels: ['dashboard', 'email'],
  },
  engagement_drop: {
    alertType: 'engagement_drop',
    enabled: true,
    severity: 'warning',
    thresholdValue: 20,
    thresholdUnit: 'percent',
    checkInterval: DEFAULT_CHECK_INTERVAL,
    slidingWindowHours: DEFAULT_SLIDING_WINDOW,
    alertChannels: ['dashboard', 'email'],
  },
  lift_degradation: {
    alertType: 'lift_degradation',
    enabled: true,
    severity: 'warning',
    thresholdValue: 10,
    thresholdUnit: 'percent',
    checkInterval: DEFAULT_CHECK_INTERVAL,
    slidingWindowHours: DEFAULT_SLIDING_WINDOW,
    alertChannels: ['dashboard', 'email'],
  },
  rule_underperforming: {
    alertType: 'rule_underperforming',
    enabled: true,
    severity: 'info',
    thresholdValue: 5,
    thresholdUnit: 'percent',
    checkInterval: DEFAULT_CHECK_INTERVAL,
    slidingWindowHours: DEFAULT_SLIDING_WINDOW,
    alertChannels: ['dashboard'],
  },
  zero_lift: {
    alertType: 'zero_lift',
    enabled: true,
    severity: 'warning',
    thresholdValue: 0,
    thresholdUnit: 'percent',
    checkInterval: DEFAULT_CHECK_INTERVAL,
    slidingWindowHours: DEFAULT_SLIDING_WINDOW,
    alertChannels: ['dashboard', 'email'],
  },
  negative_lift: {
    alertType: 'negative_lift',
    enabled: true,
    severity: 'critical',
    thresholdValue: -1,
    thresholdUnit: 'percent',
    checkInterval: DEFAULT_CHECK_INTERVAL,
    slidingWindowHours: DEFAULT_SLIDING_WINDOW,
    alertChannels: ['dashboard', 'email'],
  },
};

class PersonalizationPerformanceAlerts implements IPersonalizationPerformanceAlerts {
  private alerts: Map<string, PerformanceAlert> = new Map();
  private alertConfigs: Map<PerformanceAlertType, PerformanceAlertConfig> = new Map();
  private alertHistory: Map<string, AlertHistory> = new Map();
  private checkIntervals: Map<PerformanceAlertType, NodeJS.Timeout> = new Map();
  private impactAnalyzer: IPersonalizationImpactAnalyzer | null = null;
  private ruleMetricsHistory: Map<string, RuleEffectiveness[]> = new Map();

  private alertsValidator: StorageValidator<PerformanceAlert[]>;
  private alertConfigsValidator: StorageValidator<PerformanceAlertConfig[]>;
  private alertHistoryValidator: StorageValidator<AlertHistory[]>;

  constructor(impactAnalyzer: IPersonalizationImpactAnalyzer | null = null) {
    this.impactAnalyzer = impactAnalyzer;

    this.alertsValidator = new StorageValidator<PerformanceAlert[]>({
      schema: performanceAlertArraySchema,
      defaultValue: [],
      storageKey: STORAGE_KEYS.ALERTS,
      logErrors: true,
    });

    this.alertConfigsValidator = new StorageValidator<PerformanceAlertConfig[]>({
      schema: alertConfigArraySchema,
      defaultValue: [],
      storageKey: STORAGE_KEYS.ALERT_CONFIGS,
      logErrors: true,
    });

    this.alertHistoryValidator = new StorageValidator<AlertHistory[]>({
      schema: alertHistoryArraySchema,
      defaultValue: [],
      storageKey: STORAGE_KEYS.ALERT_HISTORY,
      logErrors: true,
    });

    this.loadAlerts();
    this.loadAlertConfigs();
    this.loadAlertHistory();
    this.schedulePeriodicChecks();
  }

  setImpactAnalyzer(analyzer: IPersonalizationImpactAnalyzer): void {
    this.impactAnalyzer = analyzer;
  }

  loadAlerts(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (stored) {
      const alerts = this.alertsValidator.safeParseFromStorage(stored);
      alerts.forEach(alert => {
        if (alert && alert.id) {
          this.alerts.set(alert.id, alert);
        }
      });
    }
  }

  saveAlerts(): void {
    const alertsArray = Array.from(this.alerts.values());
    const result = this.alertsValidator.parse(alertsArray);

    if (result.success) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(result.data));
    } else {
      console.error('[PersonalizationPerformanceAlerts] Failed to save alerts:', result.error);
    }
  }

  loadAlertConfigs(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.ALERT_CONFIGS);
    if (stored) {
      const configs = this.alertConfigsValidator.safeParseFromStorage(stored);
      configs.forEach(config => this.alertConfigs.set(config.alertType, config));
    } else {
      Object.entries(DEFAULT_ALERT_CONFIGS).forEach(([type, config]) => {
        this.alertConfigs.set(type as PerformanceAlertType, config);
      });
      this.saveAlertConfigs();
    }
  }

  saveAlertConfigs(): void {
    const configsArray = Array.from(this.alertConfigs.values());
    const result = this.alertConfigsValidator.parse(configsArray);

    if (result.success) {
      localStorage.setItem(STORAGE_KEYS.ALERT_CONFIGS, JSON.stringify(result.data));
    } else {
      console.error('[PersonalizationPerformanceAlerts] Failed to save alert configs:', result.error);
    }
  }

  loadAlertHistory(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.ALERT_HISTORY);
    if (stored) {
      const history = this.alertHistoryValidator.safeParseFromStorage(stored);
      history.forEach(item => {
        if (item && item.alertId) {
          this.alertHistory.set(item.alertId, item);
        }
      });
    }
  }

  saveAlertHistory(): void {
    const historyArray = Array.from(this.alertHistory.values());
    const result = this.alertHistoryValidator.parse(historyArray);

    if (result.success) {
      localStorage.setItem(STORAGE_KEYS.ALERT_HISTORY, JSON.stringify(result.data));
    } else {
      console.error('[PersonalizationPerformanceAlerts] Failed to save alert history:', result.error);
    }
  }

  checkRulePerformance(ruleId: string): PerformanceAlert | null {
    if (!this.impactAnalyzer) {
      console.warn('[PersonalizationPerformanceAlerts] Impact analyzer not set');
      return null;
    }

    const ruleMetricsHistory = this.ruleMetricsHistory.get(ruleId);
    if (!ruleMetricsHistory || ruleMetricsHistory.length < 2) {
      return null;
    }

    const latestMetrics = ruleMetricsHistory[ruleMetricsHistory.length - 1];
    const previousMetrics = ruleMetricsHistory[ruleMetricsHistory.length - 2];

    const alerts: PerformanceAlert[] = [];

    for (const [alertType, config] of this.alertConfigs.entries()) {
      if (!config.enabled) continue;

      const alert = this.checkSpecificAlert(ruleId, alertType, latestMetrics, previousMetrics, config);
      if (alert) {
        alerts.push(alert);
      }
    }

    if (alerts.length > 0) {
      const highestSeverityAlert = alerts.sort((a, b) => {
        const severityOrder = { critical: 3, warning: 2, info: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })[0];

      this.alerts.set(highestSeverityAlert.id, highestSeverityAlert);
      this.saveAlerts();

      this.sendAlert(highestSeverityAlert);

      return highestSeverityAlert;
    }

    return null;
  }

  checkSpecificAlert(
    ruleId: string,
    alertType: PerformanceAlertType,
    latestMetrics: RuleEffectiveness,
    previousMetrics: RuleEffectiveness,
    config: PerformanceAlertConfig
  ): PerformanceAlert | null {
    const ruleName = latestMetrics.ruleName;
    const segment = latestMetrics.segment;

    let currentValue = 0;
    let previousValue = 0;
    let message = '';
    let recommendations: string[] = [];
    let shouldAlert = false;

    switch (alertType) {
      case 'conversion_drop': {
        currentValue = latestMetrics.conversionRate;
        previousValue = previousMetrics.conversionRate;
        const percentChange = ((currentValue - previousValue) / previousValue) * 100;

        if (percentChange <= -config.thresholdValue) {
          shouldAlert = true;
          message = `Conversion rate dropped by ${Math.abs(percentChange).toFixed(1)}% for rule "${ruleName}"`;
          recommendations = [
            'Review rule conditions for accuracy',
            'Check if target audience has changed',
            'Consider adjusting variants or priority',
            'Evaluate if rule is still relevant',
          ];
        }
        break;
      }
      case 'engagement_drop': {
        currentValue = latestMetrics.engagementRate;
        previousValue = previousMetrics.engagementRate;
        const percentChange = ((currentValue - previousValue) / previousValue) * 100;

        if (percentChange <= -config.thresholdValue) {
          shouldAlert = true;
          message = `Engagement rate dropped by ${Math.abs(percentChange).toFixed(1)}% for rule "${ruleName}"`;
          recommendations = [
            'Analyze user behavior changes',
            'Review content relevance',
            'Check if CTAs are effective',
            'Consider A/B testing new variants',
          ];
        }
        break;
      }
      case 'lift_degradation': {
        currentValue = latestMetrics.liftPercentage;
        previousValue = previousMetrics.liftPercentage;
        const percentChange = ((currentValue - previousValue) / Math.abs(previousValue || 1)) * 100;

        if (percentChange <= -config.thresholdValue) {
          shouldAlert = true;
          message = `Lift degraded by ${Math.abs(percentChange).toFixed(1)}% for rule "${ruleName}"`;
          recommendations = [
            'Review recent rule changes',
            'Check competitor activity',
            'Analyze seasonal variations',
            'Consider rule optimization',
          ];
        }
        break;
      }
      case 'rule_underperforming': {
        currentValue = latestMetrics.effectivenessScore;
        previousValue = previousMetrics.effectivenessScore;

        if (currentValue < config.thresholdValue) {
          shouldAlert = true;
          message = `Rule "${ruleName}" is underperforming with effectiveness score of ${currentValue.toFixed(1)}`;
          recommendations = [
            'Compare with top-performing rules',
            'Review rule conditions and variants',
            'Consider adjusting target segment',
            'Check if rule priority is appropriate',
          ];
        }
        break;
      }
      case 'zero_lift': {
        currentValue = latestMetrics.liftPercentage;

        if (currentValue === 0 || Math.abs(currentValue) < 0.1) {
          shouldAlert = true;
          message = `Rule "${ruleName}" has zero or negligible lift`;
          recommendations = [
            'Review rule configuration',
            'Check if variants are distinct enough',
            'Consider disabling the rule',
            'Test new content variants',
          ];
        }
        break;
      }
      case 'negative_lift': {
        currentValue = latestMetrics.liftPercentage;

        if (currentValue < config.thresholdValue) {
          shouldAlert = true;
          message = `Rule "${ruleName}" is generating negative lift (${currentValue.toFixed(1)}%)`;
          recommendations = [
            'Disable rule immediately',
            'Review rule logic and content',
            'Check for conflicting rules',
            'Investigate root cause',
          ];
        }
        break;
      }
    }

    if (!shouldAlert) {
      return null;
    }

    const percentChange = previousValue !== 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

    const alert: PerformanceAlert = {
      id: this.generateAlertId(),
      alertType,
      severity: config.severity,
      status: 'active',
      ruleId,
      ruleName,
      segment,
      currentValue,
      previousValue,
      thresholdValue: config.thresholdValue,
      thresholdUnit: config.thresholdUnit,
      percentChange,
      detectedAt: new Date().toISOString(),
      message,
      recommendations,
      channels: config.alertChannels,
    };

    return alert;
  }

  checkAllRules(): PerformanceAlert[] {
    const allAlerts: PerformanceAlert[] = [];

    for (const ruleId of this.ruleMetricsHistory.keys()) {
      const alert = this.checkRulePerformance(ruleId);
      if (alert) {
        allAlerts.push(alert);
      }
    }

    return allAlerts;
  }

  updateAlertConfig(
    alertType: PerformanceAlertType,
    config: Partial<PerformanceAlertConfig>
  ): PerformanceAlertConfig {
    const existing = this.alertConfigs.get(alertType) || DEFAULT_ALERT_CONFIGS[alertType];
    const updated: PerformanceAlertConfig = {
      ...existing,
      ...config,
      alertType,
    };

    this.alertConfigs.set(alertType, updated);
    this.saveAlertConfigs();

    const interval = this.checkIntervals.get(alertType);
    if (interval) {
      clearInterval(interval);
    }

    if (updated.enabled) {
      this.scheduleAlertCheck(alertType, updated);
    }

    return updated;
  }

  getAlertConfig(alertType: PerformanceAlertType): PerformanceAlertConfig | null {
    return this.alertConfigs.get(alertType) || null;
  }

  getAlerts(filters?: {
    type?: PerformanceAlertType;
    severity?: AlertSeverity;
    status?: AlertStatus;
    ruleId?: string;
    startDate?: string;
    endDate?: string;
  }): PerformanceAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (filters) {
      if (filters.type) {
        alerts = alerts.filter(a => a.alertType === filters.type);
      }
      if (filters.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity);
      }
      if (filters.status) {
        alerts = alerts.filter(a => a.status === filters.status);
      }
      if (filters.ruleId) {
        alerts = alerts.filter(a => a.ruleId === filters.ruleId);
      }
      if (filters.startDate) {
        alerts = alerts.filter(a => a.detectedAt >= filters.startDate!);
      }
      if (filters.endDate) {
        alerts = alerts.filter(a => a.detectedAt <= filters.endDate!);
      }
    }

    return alerts.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.status !== 'active') {
      return false;
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = userId;
    this.alerts.set(alertId, alert);
    this.saveAlerts();

    return true;
  }

  resolveAlert(alertId: string, resolution: AlertResolution, notes?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.resolution = resolution;
    alert.resolutionNotes = notes;
    this.alerts.set(alertId, alert);
    this.saveAlerts();

    const timeToResolve = alert.resolvedAt && alert.detectedAt
      ? Math.round((new Date(alert.resolvedAt).getTime() - new Date(alert.detectedAt).getTime()) / 60000)
      : undefined;

    const historyItem: AlertHistory = {
      alertId,
      ruleId: alert.ruleId,
      alertType: alert.alertType,
      severity: alert.severity,
      detectedAt: alert.detectedAt,
      resolvedAt: alert.resolvedAt,
      timeToResolve,
      resolution,
      impactAssessment: this.generateImpactAssessment(alert, resolution),
    };

    this.alertHistory.set(alertId, historyItem);
    this.saveAlertHistory();

    return true;
  }

  getAlertHistory(ruleId?: string): AlertHistory[] {
    let history = Array.from(this.alertHistory.values());

    if (ruleId) {
      history = history.filter(h => h.ruleId === ruleId);
    }

    return history.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  getStatistics(): PerformanceAlertStatistics {
    const alerts = Array.from(this.alerts.values());
    const history = Array.from(this.alertHistory.values());

    const activeAlerts = alerts.filter(a => a.status === 'active');
    const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');
    const resolvedAlerts = history.filter(h => h.resolvedAt);

    const alertsByType: Record<PerformanceAlertType, number> = {
      conversion_drop: alerts.filter(a => a.alertType === 'conversion_drop').length,
      engagement_drop: alerts.filter(a => a.alertType === 'engagement_drop').length,
      lift_degradation: alerts.filter(a => a.alertType === 'lift_degradation').length,
      rule_underperforming: alerts.filter(a => a.alertType === 'rule_underperforming').length,
      zero_lift: alerts.filter(a => a.alertType === 'zero_lift').length,
      negative_lift: alerts.filter(a => a.alertType === 'negative_lift').length,
    };

    const alertsBySeverity: Record<AlertSeverity, number> = {
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length,
    };

    const alertsByRule: Record<string, number> = {};
    alerts.forEach(alert => {
      alertsByRule[alert.ruleId] = (alertsByRule[alert.ruleId] || 0) + 1;
    });

    const avgResolutionTime = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, h) => sum + (h.timeToResolve || 0), 0) / resolvedAlerts.length
      : 0;

    const topFailingRules = Object.entries(alertsByRule)
      .map(([ruleId, count]) => {
        const alert = alerts.find(a => a.ruleId === ruleId);
        return {
          ruleId,
          ruleName: alert?.ruleName || ruleId,
          alertCount: count,
        };
      })
      .sort((a, b) => b.alertCount - a.alertCount)
      .slice(0, 5);

    return {
      totalAlerts: alerts.length,
      activeAlerts: activeAlerts.length,
      acknowledgedAlerts: acknowledgedAlerts.length,
      resolvedAlerts: resolvedAlerts.length,
      alertsByType,
      alertsBySeverity,
      avgResolutionTime,
      alertsByRule,
      topFailingRules,
    };
  }

  async sendAlert(alert: PerformanceAlert): Promise<void> {
    const config = this.alertConfigs.get(alert.alertType);

    for (const channel of alert.channels) {
      switch (channel) {
        case 'dashboard':
          console.log(`[Personalization Performance Alert] ${alert.message}`);
          break;

        case 'email':
          if (config?.emailAddress) {
            console.log(`[Email Alert] To: ${config.emailAddress}, Subject: Personalization Performance Alert: ${alert.message}`);
          }
          break;

        case 'webhook':
          if (config?.webhookUrl) {
            try {
              await fetch(config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alert),
              });
            } catch (error) {
              console.error('[PersonalizationPerformanceAlerts] Failed to send webhook alert:', error);
            }
          }
          break;
      }
    }
  }

  schedulePeriodicChecks(): void {
    for (const [alertType, config] of this.alertConfigs.entries()) {
      if (config.enabled) {
        this.scheduleAlertCheck(alertType, config);
      }
    }
  }

  scheduleAlertCheck(alertType: PerformanceAlertType, config: PerformanceAlertConfig): void {
    const interval = this.checkIntervals.get(alertType);
    if (interval) {
      clearInterval(interval);
    }

    const newInterval = setInterval(() => {
      this.checkAllRules();
    }, config.checkInterval * 60 * 1000);

    this.checkIntervals.set(alertType, newInterval);
  }

  clearResolvedAlerts(olderThanDays: number = 30): void {
    const cutoffTime = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();

    for (const [id, alert] of this.alerts.entries()) {
      if (alert.status === 'resolved' && alert.resolvedAt && alert.resolvedAt < cutoffTime) {
        this.alerts.delete(id);
      }
    }

    this.saveAlerts();
  }

  reset(): void {
    this.alerts.clear();
    this.alertHistory.clear();
    this.ruleMetricsHistory.clear();

    for (const interval of this.checkIntervals.values()) {
      clearInterval(interval);
    }
    this.checkIntervals.clear();

    Object.entries(DEFAULT_ALERT_CONFIGS).forEach(([type, config]) => {
      this.alertConfigs.set(type as PerformanceAlertType, config);
    });
    this.saveAlertConfigs();

    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.ALERT_HISTORY);
  }

  updateRuleMetrics(ruleId: string, metrics: RuleEffectiveness): void {
    const history = this.ruleMetricsHistory.get(ruleId) || [];
    history.push(metrics);

    if (history.length > 100) {
      history.shift();
    }

    this.ruleMetricsHistory.set(ruleId, history);
  }

  private generateAlertId(): string {
    return `PERF-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateImpactAssessment(alert: PerformanceAlert, resolution: AlertResolution): string {
    const severityMap: Record<AlertSeverity, string> = {
      critical: 'High impact on conversion and user engagement',
      warning: 'Moderate impact requiring attention',
      info: 'Low impact with monitoring needed',
    };

    const baseImpact = severityMap[alert.severity];

    const resolutionImpact: Record<AlertResolution, string> = {
      rule_disabled: 'Rule disabled to prevent further impact',
      variants_adjusted: 'Content variants adjusted for better performance',
      conditions_modified: 'Rule conditions refined for targeting',
      threshold_updated: 'Alert threshold updated for future monitoring',
      ignored: 'Alert acknowledged, monitoring continued',
      monitoring_continued: 'Continued monitoring after investigation',
    };

    return `${baseImpact}. ${resolutionImpact[resolution]}`;
  }
}

export { PersonalizationPerformanceAlerts };

let performanceAlertsInstance: PersonalizationPerformanceAlerts | null = null;

export const performanceAlerts = new Proxy({} as PersonalizationPerformanceAlerts, {
  get(_target, prop: string | symbol) {
    if (!performanceAlertsInstance && typeof window !== 'undefined') {
      performanceAlertsInstance = new PersonalizationPerformanceAlerts();
    }
    if (!performanceAlertsInstance) {
      return () => {};
    }
    const value = (performanceAlertsInstance as unknown as Record<string, unknown>)[String(prop)];
    return typeof value === 'function' ? value.bind(performanceAlertsInstance) : value;
  },
});

export default performanceAlerts;
