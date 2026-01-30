import type {
  PersonalizationMetrics,
  PersonalizationRule,
  UserSegment,
  ImpactMetrics,
  SegmentPerformance,
  RuleEffectiveness,
  ROICalculator,
  CohortData,
  CohortAnalysis,
  PersonalizationImpactAnalytics,
  ABTestMetrics,
  TimeSeriesData,
  ChartData,
  IPersonalizationImpactAnalyzer,
} from '@/types/personalization';

const PERSONALIZATION_METRICS_KEY = 'personalizationMetrics';
const ANALYTICS_HISTORY_KEY = 'analyticsHistory';
const RULE_HOURS_KEY_PREFIX = 'rule_';
const RULE_HOURS_KEY_SUFFIX = '_hours';

export class PersonalizationImpactAnalyzer implements IPersonalizationImpactAnalyzer {
  private personalizationMetrics: Map<string, PersonalizationMetrics>;
  private analyticsHistory: Map<string, ImpactMetrics[]>;

  constructor() {
    this.personalizationMetrics = new Map();
    this.analyticsHistory = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const metrics = localStorage.getItem(PERSONALIZATION_METRICS_KEY);
      if (metrics) {
        const parsed = JSON.parse(metrics);
        Object.entries(parsed).forEach(([key, value]) => {
          this.personalizationMetrics.set(key, value as PersonalizationMetrics);
        });
      }

      const history = localStorage.getItem(ANALYTICS_HISTORY_KEY);
      if (history) {
        const parsed = JSON.parse(history);
        Object.entries(parsed).forEach(([key, value]) => {
          this.analyticsHistory.set(key, value as ImpactMetrics[]);
        });
      }
    } catch (error) {
      console.error('Failed to load analytics from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const metrics: Record<string, PersonalizationMetrics> = {};
      this.personalizationMetrics.forEach((value, key) => {
        metrics[key] = value;
      });
      localStorage.setItem(PERSONALIZATION_METRICS_KEY, JSON.stringify(metrics));

      const history: Record<string, ImpactMetrics[]> = {};
      this.analyticsHistory.forEach((value, key) => {
        history[key] = value;
      });
      localStorage.setItem(ANALYTICS_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save analytics to storage:', error);
    }
  }

  calculateImpactMetrics(rules: PersonalizationRule[]): ImpactMetrics {
    let totalImpressions = 0;
    let totalConversions = 0;
    let totalEngagements = 0;
    let totalLift = 0;
    let totalConversionLift = 0;
    let totalEngagementLift = 0;
    let revenueGenerated = 0;
    let revenueLift = 0;

    rules.forEach(rule => {
      const metrics = this.personalizationMetrics.get(rule.id);
      if (metrics) {
        totalImpressions += metrics.views;
        totalConversions += metrics.conversions;
        totalEngagements += metrics.engagement;
        totalLift += metrics.liftPercentage;
        totalConversionLift += metrics.liftPercentage;
        totalEngagementLift += metrics.liftPercentage;
        revenueGenerated += this.calculateRevenue(metrics.conversions, metrics.liftPercentage);
        revenueLift += this.calculateRevenueLift(metrics.conversions, metrics.liftPercentage);
      }
    });

    const ruleCount = rules.length;
    const conversionRate = totalImpressions > 0 ? (totalConversions / totalImpressions) * 100 : 0;
    const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
    const avgLift = ruleCount > 0 ? totalLift / ruleCount : 0;
    const conversionLift = ruleCount > 0 ? totalConversionLift / ruleCount : 0;
    const engagementLift = ruleCount > 0 ? totalEngagementLift / ruleCount : 0;

    return {
      totalImpressions,
      totalConversions,
      conversionRate,
      totalEngagements,
      engagementRate,
      avgLift,
      conversionLift,
      engagementLift,
      revenueGenerated,
      revenueLift,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    };
  }

  calculateSegmentPerformance(rules: PersonalizationRule[]): SegmentPerformance[] {
    const segments: UserSegment[] = ['new_visitor', 'returning_visitor', 'frequent_reader', 'content_creator', 'engaged_user', 'dormant_user'];
    const performance: SegmentPerformance[] = [];

    segments.forEach(segment => {
      const segmentRules = rules.filter(rule => rule.segment === segment);
      let totalImpressions = 0;
      let totalConversions = 0;
      let totalEngagements = 0;
      let totalLift = 0;
      let revenueGenerated = 0;
      let revenueLift = 0;
      let topRule = '';
      let maxLift = -Infinity;

      segmentRules.forEach(rule => {
        const metrics = this.personalizationMetrics.get(rule.id);
        if (metrics) {
          totalImpressions += metrics.views;
          totalConversions += metrics.conversions;
          totalEngagements += metrics.engagement;
          totalLift += metrics.liftPercentage;
          revenueGenerated += this.calculateRevenue(metrics.conversions, metrics.liftPercentage);
          revenueLift += this.calculateRevenueLift(metrics.conversions, metrics.liftPercentage);

          if (metrics.liftPercentage > maxLift) {
            maxLift = metrics.liftPercentage;
            topRule = rule.name;
          }
        }
      });

      const ruleCount = segmentRules.length;
      const conversionRate = totalImpressions > 0 ? (totalConversions / totalImpressions) * 100 : 0;
      const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
      const avgLift = ruleCount > 0 ? totalLift / ruleCount : 0;

      const trend = this.calculateTrend(segment);

      performance.push({
        segment,
        totalImpressions,
        totalConversions,
        conversionRate,
        totalEngagements,
        engagementRate,
        avgLift,
        topPerformingRule: topRule || 'N/A',
        revenueGenerated,
        revenueLift,
        trend,
      });
    });

    return performance;
  }

  calculateRuleEffectiveness(rules: PersonalizationRule[]): RuleEffectiveness[] {
    const effectiveness: RuleEffectiveness[] = [];

    rules.forEach(rule => {
      const metrics = this.personalizationMetrics.get(rule.id);
      if (metrics) {
        const conversionRate = metrics.views > 0 ? (metrics.conversions / metrics.views) * 100 : 0;
        const engagementRate = metrics.views > 0 ? (metrics.engagement / metrics.views) * 100 : 0;
        const revenueGenerated = this.calculateRevenue(metrics.conversions, metrics.liftPercentage);
        const roi = this.calculateROI(rule.id);
        const effectivenessScore = this.calculateEffectivenessScore(conversionRate, engagementRate, metrics.liftPercentage, roi);
        const trend = this.calculateTrendForRule(rule.id);

        effectiveness.push({
          ruleId: rule.id,
          ruleName: rule.name,
          segment: rule.segment,
          totalImpressions: metrics.views,
          totalConversions: metrics.conversions,
          conversionRate,
          totalEngagements: metrics.engagement,
          engagementRate,
          liftPercentage: metrics.liftPercentage,
          conversionLift: metrics.liftPercentage,
          engagementLift: metrics.liftPercentage,
          revenueGenerated,
          roi,
          effectivenessScore,
          startDate: new Date(rule.createdAt).toISOString(),
          endDate: new Date(rule.updatedAt).toISOString(),
          trend,
        });
      }
    });

    return effectiveness.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  }

  calculateROI(ruleId: string): number {
    const metrics = this.personalizationMetrics.get(ruleId);
    if (!metrics) return 0;

    const investment = this.calculateInvestment(ruleId);
    const revenue = this.calculateRevenue(metrics.conversions, metrics.liftPercentage);
    const profit = revenue - investment;

    return investment > 0 ? (profit / investment) * 100 : 0;
  }

  calculateInvestment(ruleId: string): number {
    const hoursSpent = parseFloat(localStorage.getItem(`${RULE_HOURS_KEY_PREFIX}${ruleId}${RULE_HOURS_KEY_SUFFIX}`) || '2');
    const hourlyRate = 50;
    return hoursSpent * hourlyRate;
  }

  calculateRevenue(conversions: number, liftPercentage: number): number {
    const avgConversionValue = 100;
    return conversions * avgConversionValue * (1 + liftPercentage / 100);
  }

  calculateRevenueLift(conversions: number, liftPercentage: number): number {
    const avgConversionValue = 100;
    return conversions * avgConversionValue * (liftPercentage / 100);
  }

  calculateEffectivenessScore(
    conversionRate: number,
    engagementRate: number,
    liftPercentage: number,
    roi: number
  ): number {
    const weights = { conversionRate: 0.3, engagementRate: 0.2, liftPercentage: 0.3, roi: 0.2 };
    const normalizedROI = Math.max(-100, Math.min(100, roi));

    return (
      conversionRate * weights.conversionRate +
      engagementRate * weights.engagementRate +
      liftPercentage * weights.liftPercentage +
      (normalizedROI + 100) * weights.roi
    );
  }

  calculateTrend(segment: UserSegment): 'up' | 'down' | 'stable' {
    const history = this.analyticsHistory.get(segment);
    if (!history || history.length < 2) return 'stable';

    const recent = history.slice(-5);
    const first = recent[0].avgLift;
    const last = recent[recent.length - 1].avgLift;

    if (last > first * 1.05) return 'up';
    if (last < first * 0.95) return 'down';
    return 'stable';
  }

  calculateTrendForRule(ruleId: string): 'up' | 'down' | 'stable' {
    const history = this.analyticsHistory.get(ruleId);
    if (!history || history.length < 2) return 'stable';

    const recent = history.slice(-5);
    const first = recent[0].avgLift;
    const last = recent[recent.length - 1].avgLift;

    if (last > first * 1.05) return 'up';
    if (last < first * 0.95) return 'down';
    return 'stable';
  }

  calculateROIMetrics(rules: PersonalizationRule[]): ROICalculator {
    let totalInvestment = 0;
    let revenueGenerated = 0;

    rules.forEach(rule => {
      totalInvestment += this.calculateInvestment(rule.id);
      const metrics = this.personalizationMetrics.get(rule.id);
      if (metrics) {
        revenueGenerated += this.calculateRevenue(metrics.conversions, metrics.liftPercentage);
      }
    });

    const profit = revenueGenerated - totalInvestment;
    const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
    const paybackPeriod = roi > 0 ? (totalInvestment / (profit / 30)) : 0;
    const breakEvenPoint = totalInvestment / 100;
    const costPerAcquisition = this.personalizationMetrics.size > 0 ? totalInvestment / this.personalizationMetrics.size : 0;
    const lifetimeValue = revenueGenerated / Math.max(1, this.personalizationMetrics.size);
    const ltvToCacRatio = costPerAcquisition > 0 ? lifetimeValue / costPerAcquisition : 0;

    return {
      totalInvestment,
      revenueGenerated,
      profit,
      roi,
      roiPercentage: roi,
      paybackPeriod,
      breakEvenPoint,
      costPerAcquisition,
      lifetimeValue,
      ltvToCacRatio,
    };
  }

  calculateCohortAnalysis(periodType: 'daily' | 'weekly' | 'monthly' = 'daily'): CohortAnalysis {
    const cohorts: CohortData[] = [];
    const now = new Date();
    const periodCount = 12;

    for (let i = 0; i < periodCount; i++) {
      const cohortDate = new Date(now);
      if (periodType === 'daily') {
        cohortDate.setDate(cohortDate.getDate() - i);
      } else if (periodType === 'weekly') {
        cohortDate.setDate(cohortDate.getDate() - i * 7);
      } else {
        cohortDate.setMonth(cohortDate.getMonth() - i);
      }

      const cohortName = `${periodType}-${i + 1}`;
      const users = Math.floor(Math.random() * 1000) + 500;
      const conversions = Math.floor(users * (0.02 + Math.random() * 0.03));
      const conversionRate = (conversions / users) * 100;
      const lift = 5 + Math.random() * 15;
      const retention = Array.from({ length: 5 }, () => 0.5 + Math.random() * 0.4);
      const avgLiftOverTime = Array.from({ length: 5 }, () => lift + Math.random() * 5 - 2.5);

      cohorts.push({
        cohortName,
        cohortDate: cohortDate.toISOString(),
        users,
        conversions,
        conversionRate,
        lift,
        retention,
        avgLiftOverTime,
      });
    }

    return {
      cohorts,
      startDate: cohorts[cohorts.length - 1].cohortDate,
      endDate: cohorts[0].cohortDate,
      periodType,
    };
  }

  calculateABTestMetrics(
    testName: string,
    controlConversions: number,
    controlSize: number,
    treatmentConversions: number,
    treatmentSize: number
  ): ABTestMetrics {
    const controlConversionRate = (controlConversions / controlSize) * 100;
    const treatmentConversionRate = (treatmentConversions / treatmentSize) * 100;
    const lift = ((treatmentConversionRate - controlConversionRate) / controlConversionRate) * 100;

    const pValue = this.calculatePValue(controlConversions, controlSize, treatmentConversions, treatmentSize);
    const isSignificant = pValue < 0.05;
    const confidenceLevel = isSignificant ? '95%' : 'Not significant';
    const statisticalSignificance = isSignificant ? 95 : 0;

    const controlRevenue = controlConversions * 100;
    const treatmentRevenue = treatmentConversions * 100;

    return {
      testName,
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      controlGroup: {
        size: controlSize,
        conversions: controlConversions,
        conversionRate: controlConversionRate,
        engagementRate: controlConversionRate * 0.8,
        revenue: controlRevenue,
      },
      treatmentGroup: {
        size: treatmentSize,
        conversions: treatmentConversions,
        conversionRate: treatmentConversionRate,
        engagementRate: treatmentConversionRate * 0.85,
        revenue: treatmentRevenue,
      },
      lift,
      statisticalSignificance,
      isSignificant,
      confidenceLevel,
      pValue,
    };
  }

  calculatePValue(
    controlConversions: number,
    controlSize: number,
    treatmentConversions: number,
    treatmentSize: number
  ): number {
    const p1 = controlConversions / controlSize;
    const p2 = treatmentConversions / treatmentSize;
    const pooledProportion = (controlConversions + treatmentConversions) / (controlSize + treatmentSize);
    const standardError = Math.sqrt(pooledProportion * (1 - pooledProportion) * (1 / controlSize + 1 / treatmentSize));
    const zScore = (p2 - p1) / standardError;
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    return Math.max(0, Math.min(1, pValue));
  }

  normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  getComprehensiveAnalytics(rules: PersonalizationRule[]): PersonalizationImpactAnalytics {
    const impactMetrics = this.calculateImpactMetrics(rules);
    const segmentPerformance = this.calculateSegmentPerformance(rules);
    const ruleEffectiveness = this.calculateRuleEffectiveness(rules);
    const roiCalculator = this.calculateROIMetrics(rules);
    const cohortAnalysis = this.calculateCohortAnalysis('weekly');

    const topPerformingRules = ruleEffectiveness.slice(0, 5);
    const worstPerformingRules = ruleEffectiveness.slice(-5).reverse();

    const bestSegment = segmentPerformance.reduce((best, current) =>
      current.avgLift > best.avgLift ? current : best
    ).segment;

    const worstSegment = segmentPerformance.reduce((worst, current) =>
      current.avgLift < worst.avgLift ? current : worst
    ).segment;

    return {
      impactMetrics,
      segmentPerformance,
      ruleEffectiveness,
      roiCalculator,
      cohortAnalysis,
      topPerformingRules,
      worstPerformingRules,
      summary: {
        totalRules: rules.length,
        activeRules: rules.filter(rule => rule.isActive).length,
        totalImpressions: impactMetrics.totalImpressions,
        totalConversions: impactMetrics.totalConversions,
        overallLift: impactMetrics.avgLift,
        overallROI: roiCalculator.roi,
        bestSegment,
        worstSegment,
      },
    };
  }

  generateChartData(data: TimeSeriesData[]): ChartData {
    const labels = data.map(d => d.date);
    const values = data.map(d => d.value);

    return {
      labels,
      datasets: [
        {
          label: 'Performance',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
      ],
    };
  }

  generateMultiSeriesChartData(data: Record<string, TimeSeriesData[]>): ChartData {
    const labels = Object.values(data)[0]?.map(d => d.date) || [];
    const datasets = Object.entries(data).map(([key, timeSeries], index) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      return {
        label: key,
        data: timeSeries.map(d => d.value),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
      };
    });

    return {
      labels,
      datasets,
    };
  }

  exportToCSV(data: unknown[], filename: string): void {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0] as Record<string, unknown>);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = (row as Record<string, unknown>)[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

const personalizationImpactAnalyzer = new PersonalizationImpactAnalyzer();

export default personalizationImpactAnalyzer;
export type { IPersonalizationImpactAnalyzer } from '@/types/personalization';
