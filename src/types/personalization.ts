export type UserSegment = 'new_visitor' | 'returning_visitor' | 'frequent_reader' | 'content_creator' | 'engaged_user' | 'dormant_user';

export type PersonalizationTrigger = 'on_page_load' | 'on_scroll' | 'on_click' | 'time_on_page' | 'session_start';

export type ContentType = 'blog_post' | 'service' | 'page' | 'custom';

export interface BehaviorSignal {
  id: string;
  userId?: string;
  sessionId: string;
  type: 'page_view' | 'scroll_depth' | 'click' | 'time_on_page' | 'bookmark';
  contentType?: ContentType;
  contentId?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface UserProfile {
  userId?: string;
  sessionId: string;
  segment: UserSegment;
  interests: string[]; // categories, tags
  preferredContentType: ContentType;
  behaviorHistory: BehaviorSignal[];
  engagementScore: number;
  lastActive: number;
  preferences: {
    allowPersonalization: boolean;
    allowTracking: boolean;
    theme?: 'light' | 'dark';
    language?: string;
  };
}

export interface ContentVariant {
  id: string;
  contentId: string;
  variantName: string;
  segment: UserSegment;
  contentType: ContentType;
  content: Record<string, unknown>;
  weight: number; // probability for this variant
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  segment: UserSegment;
  trigger: PersonalizationTrigger;
  contentType: ContentType;
  variants: ContentVariant[];
  isActive: boolean;
  priority: number; // higher priority rules evaluated first
  conditions: RuleCondition[];
  createdAt: number;
  updatedAt: number;
}

export interface RuleCondition {
  field: 'category' | 'tag' | 'contentType' | 'timeOnPage' | 'scrollDepth' | 'engagementScore';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface PersonalizationMetrics {
  ruleId: string;
  segment: UserSegment;
  variantId: string;
  views: number;
  clicks: number;
  engagement: number;
  conversions: number;
  liftPercentage: number; // improvement over control
  startDate: number;
  endDate: number;
}

export interface PersonalizationAnalytics {
  totalRules: number;
  activeRules: number;
  totalVariants: number;
  activeVariants: number;
  totalImpressions: number;
  totalEngagements: number;
  overallLift: number;
  segmentPerformance: Record<UserSegment, PersonalizationMetrics>;
  topPerformingRules: PersonalizationMetrics[];
  startDate: number;
  endDate: number;
}

export interface PersonalizationConfig {
  enabled: boolean;
  defaultBehaviorTracking: boolean;
  behaviorRetentionDays: number;
  maxBehaviorHistory: number;
  segmentUpdateInterval: number; // milliseconds
  analyticsEnabled: boolean;
  abTestIntegration: boolean;
  minSampleSize: number; // for statistical significance
}

export interface PersonalizationRuleVersion {
  id: string;
  ruleId: string;
  content: PersonalizationRule;
  timestamp: string;
  notes: string;
  author: string;
  performanceMetrics?: {
    views?: number;
    clicks?: number;
    conversions?: number;
    liftPercentage?: number;
  };
}

export interface RuleVersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'added' | 'removed' | 'changed';
}

export interface IRuleVersionStorage {
  getRuleVersions(ruleId: string): PersonalizationRuleVersion[];
  saveVersion(version: PersonalizationRuleVersion): void;
  deleteVersion(ruleId: string, versionId: string): void;
  clearRuleVersions(ruleId: string): void;
  compareVersions(version1: PersonalizationRuleVersion, version2: PersonalizationRuleVersion): RuleVersionDiff[];
  getVersionCount(ruleId: string): number;
}

export interface IPersonalizationEngine {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  createRule(rule: Omit<PersonalizationRule, 'id' | 'createdAt' | 'updatedAt'>): PersonalizationRule;
  updateRule(id: string, updates: Partial<PersonalizationRule>): PersonalizationRule | null;
  deleteRule(id: string): boolean;
  getRule(id: string): PersonalizationRule | undefined;
  getAllRules(): PersonalizationRule[];
  getActiveRules(): PersonalizationRule[];
  createVariant(variant: Omit<ContentVariant, 'id' | 'createdAt' | 'updatedAt'>): ContentVariant;
  updateVariant(id: string, updates: Partial<ContentVariant>): ContentVariant | null;
  deleteVariant(id: string): boolean;
  getVariant(id: string): ContentVariant | undefined;
  getVariantsForContent(contentId: string): ContentVariant[];
  getVariantForUser(contentId: string, userSegment: UserSegment, userId?: string): ContentVariant | null;
  evaluateConditions(conditions: RuleCondition[], context: Record<string, unknown>): boolean;
  personalizeContent(contentId: string, userSegment: UserSegment, contentType: ContentType, context: Record<string, unknown>, userId?: string): Record<string, unknown> | null;
  trackImpression(ruleId: string, variantId: string, segment: UserSegment): void;
  trackClick(ruleId: string): void;
  trackEngagement(ruleId: string, value: number): void;
  trackConversion(ruleId: string): void;
  getMetrics(ruleId: string): PersonalizationMetrics | undefined;
  getAllMetrics(): PersonalizationMetrics[];
  calculateLift(ruleId: string, baselineConversionRate: number): number;
  getAnalytics(): {
    totalRules: number;
    activeRules: number;
    totalVariants: number;
    activeVariants: number;
    totalImpressions: number;
    totalEngagements: number;
    overallLift: number;
  };
  reset(): void;
  getRuleVersions(ruleId: string): PersonalizationRuleVersion[];
  createRuleVersion(rule: PersonalizationRule, notes?: string): PersonalizationRuleVersion | null;
  restoreRuleVersion(ruleId: string, versionId: string): PersonalizationRule | null;
  deleteRuleVersion(ruleId: string, versionId: string): boolean;
  compareRuleVersions(ruleId: string, version1Id: string, version2Id: string): RuleVersionDiff[] | null;
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

/**
 * Template categories for organizing rule templates
 */
export type TemplateCategory =
  | 'engagement-based'
  | 'segment-based'
  | 'behavioral'
  | 'content-type'
  | 'time-based'
  | 'geographic';

/**
 * Personalization template metadata
 */
export interface PersonalizationTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rule: PersonalizationRule;
  variants: ContentVariant[];
  metadata: TemplateMetadata;
}

/**
 * Template metadata for categorization and search
 */
export interface TemplateMetadata {
  tags: string[];
  targetSegments: string[];
  contentType: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  estimatedLift: number;
  useCases: string[];
  prerequisites: string[];
}

/**
 * Template application configuration
 */
export interface TemplateApplicationConfig {
  customizeConditions?: boolean;
  customizeVariants?: boolean;
  customizePriority?: boolean;
  activateImmediately?: boolean;
  notes?: string;
}

/**
 * Template performance metrics
 */
export interface TemplatePerformanceMetrics {
  templateId: string;
  timesUsed: number;
  activeCount: number;
  avgLift: number;
  bestLift: number;
  lastUsed: string;
  rating: number;
  lift?: number;
}

/**
 * Template usage statistics
 */
export interface TemplateUsageStats {
  templateId: string;
  appliedAt: string;
  ruleId: string;
  isActive: boolean;
  impressions: number;
  lift: number;
  rating?: number;
}

// ============================================================================
// IMPACT ANALYTICS TYPES
// ============================================================================

export interface ImpactMetrics {
  totalImpressions: number;
  totalConversions: number;
  conversionRate: number;
  totalEngagements: number;
  engagementRate: number;
  avgLift: number;
  conversionLift: number;
  engagementLift: number;
  revenueGenerated: number;
  revenueLift: number;
  startDate: string;
  endDate: string;
}

export interface SegmentPerformance {
  segment: UserSegment;
  totalImpressions: number;
  totalConversions: number;
  conversionRate: number;
  totalEngagements: number;
  engagementRate: number;
  avgLift: number;
  topPerformingRule: string;
  revenueGenerated: number;
  revenueLift: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RuleEffectiveness {
  ruleId: string;
  ruleName: string;
  segment: UserSegment;
  totalImpressions: number;
  totalConversions: number;
  conversionRate: number;
  totalEngagements: number;
  engagementRate: number;
  liftPercentage: number;
  conversionLift: number;
  engagementLift: number;
  revenueGenerated: number;
  roi: number;
  effectivenessScore: number;
  startDate: string;
  endDate: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ROICalculator {
  totalInvestment: number;
  revenueGenerated: number;
  profit: number;
  roi: number;
  roiPercentage: number;
  paybackPeriod: number;
  breakEvenPoint: number;
  costPerAcquisition: number;
  lifetimeValue: number;
  ltvToCacRatio: number;
}

export interface CohortData {
  cohortName: string;
  cohortDate: string;
  users: number;
  conversions: number;
  conversionRate: number;
  lift: number;
  retention: number[];
  avgLiftOverTime: number[];
}

export interface CohortAnalysis {
  cohorts: CohortData[];
  startDate: string;
  endDate: string;
  periodType: 'daily' | 'weekly' | 'monthly';
}

export interface PersonalizationImpactAnalytics {
  impactMetrics: ImpactMetrics;
  segmentPerformance: SegmentPerformance[];
  ruleEffectiveness: RuleEffectiveness[];
  roiCalculator: ROICalculator;
  cohortAnalysis: CohortAnalysis;
  topPerformingRules: RuleEffectiveness[];
  worstPerformingRules: RuleEffectiveness[];
  summary: {
    totalRules: number;
    activeRules: number;
    totalImpressions: number;
    totalConversions: number;
    overallLift: number;
    overallROI: number;
    bestSegment: string;
    worstSegment: string;
  };
}

export interface ABTestMetrics {
  testName: string;
  startDate: string;
  endDate: string;
  controlGroup: {
    size: number;
    conversions: number;
    conversionRate: number;
    engagementRate: number;
    revenue: number;
  };
  treatmentGroup: {
    size: number;
    conversions: number;
    conversionRate: number;
    engagementRate: number;
    revenue: number;
  };
  lift: number;
  statisticalSignificance: number;
  isSignificant: boolean;
  confidenceLevel: string;
  pValue: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

// ============================================================================
// PREVIEW TYPES
// ============================================================================

/**
 * Device types for preview mode
 */
export type PreviewDeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * Preview session history
 */
export interface PreviewHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  segment: UserSegment;
  device: PreviewDeviceType;
  contentType: ContentType;
  personalizedContent: Record<string, unknown> | null;
  timestamp: string;
  validationResults: PreviewValidationResult;
}

/**
 * Validation result for preview
 */
export interface PreviewValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error (blocks preview)
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation warning (doesn't block preview)
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// IMPACT ANALYZER INTERFACE
// ============================================================================

/**
 * Interface for personalization impact analyzer
 * Provides methods for calculating impact metrics, segment performance,
 * rule effectiveness, ROI, cohort analysis, and A/B test metrics
 */
export interface IPersonalizationImpactAnalyzer {
  calculateImpactMetrics(rules: PersonalizationRule[]): ImpactMetrics;
  calculateSegmentPerformance(rules: PersonalizationRule[]): SegmentPerformance[];
  calculateRuleEffectiveness(rules: PersonalizationRule[]): RuleEffectiveness[];
  calculateROI(ruleId: string): number;
  calculateInvestment(ruleId: string): number;
  calculateRevenue(conversions: number, liftPercentage: number): number;
  calculateRevenueLift(conversions: number, liftPercentage: number): number;
  calculateEffectivenessScore(
    conversionRate: number,
    engagementRate: number,
    liftPercentage: number,
    roi: number
  ): number;
  calculateTrend(segment: UserSegment): 'up' | 'down' | 'stable';
  calculateTrendForRule(ruleId: string): 'up' | 'down' | 'stable';
  calculateROIMetrics(rules: PersonalizationRule[]): ROICalculator;
  calculateCohortAnalysis(periodType?: 'daily' | 'weekly' | 'monthly'): CohortAnalysis;
  calculateABTestMetrics(
    testName: string,
    controlConversions: number,
    controlSize: number,
    treatmentConversions: number,
    treatmentSize: number
  ): ABTestMetrics;
  calculatePValue(
    controlConversions: number,
    controlSize: number,
    treatmentConversions: number,
    treatmentSize: number
  ): number;
  normalCDF(x: number): number;
  getComprehensiveAnalytics(rules: PersonalizationRule[]): PersonalizationImpactAnalytics;
  generateChartData(data: TimeSeriesData[]): ChartData;
  generateMultiSeriesChartData(data: Record<string, TimeSeriesData[]>): ChartData;
  exportToCSV(data: unknown[], filename: string): void;
}

// ============================================================================
// PERFORMANCE ALERTS TYPES
// ============================================================================

/**
 * Alert severity levels for personalization performance alerts
 */
export type AlertSeverity = 'critical' | 'warning' | 'info';

/**
 * Alert status tracking
 */
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

/**
 * Alert channel for sending notifications
 */
export type AlertChannel = 'dashboard' | 'email' | 'webhook';

/**
 * Performance alert types
 */
export type PerformanceAlertType = 
  | 'conversion_drop'
  | 'engagement_drop'
  | 'lift_degradation'
  | 'rule_underperforming'
  | 'zero_lift'
  | 'negative_lift';

/**
 * Alert resolution action taken
 */
export type AlertResolution = 
  | 'rule_disabled'
  | 'variants_adjusted'
  | 'conditions_modified'
  | 'threshold_updated'
  | 'ignored'
  | 'monitoring_continued';

/**
 * Performance alert configuration
 */
export interface PerformanceAlertConfig {
  alertType: PerformanceAlertType;
  enabled: boolean;
  severity: AlertSeverity;
  thresholdValue: number;
  thresholdUnit: 'percent' | 'absolute';
  checkInterval: number; // minutes
  slidingWindowHours: number;
  alertChannels: AlertChannel[];
  webhookUrl?: string;
  emailAddress?: string;
}

/**
 * Performance alert instance
 */
export interface PerformanceAlert {
  id: string;
  alertType: PerformanceAlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  ruleId: string;
  ruleName: string;
  segment?: UserSegment;
  currentValue: number;
  previousValue: number;
  thresholdValue: number;
  thresholdUnit: 'percent' | 'absolute';
  percentChange: number;
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  resolution?: AlertResolution;
  resolutionNotes?: string;
  message: string;
  recommendations: string[];
  channels: AlertChannel[];
}

/**
 * Alert history with resolution tracking
 */
export interface AlertHistory {
  alertId: string;
  ruleId: string;
  alertType: PerformanceAlertType;
  severity: AlertSeverity;
  detectedAt: string;
  resolvedAt?: string;
  timeToResolve?: number; // minutes
  resolution?: AlertResolution;
  impactAssessment: string;
}

/**
 * Performance alert statistics
 */
export interface PerformanceAlertStatistics {
  totalAlerts: number;
  activeAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  alertsByType: Record<PerformanceAlertType, number>;
  alertsBySeverity: Record<AlertSeverity, number>;
  avgResolutionTime: number;
  alertsByRule: Record<string, number>;
  topFailingRules: Array<{ ruleId: string; ruleName: string; alertCount: number }>;
}

/**
 * Interface for personalization performance alerts system
 */
export interface IPersonalizationPerformanceAlerts {
  checkRulePerformance(ruleId: string): PerformanceAlert | null;
  checkAllRules(): PerformanceAlert[];
  updateAlertConfig(alertType: PerformanceAlertType, config: Partial<PerformanceAlertConfig>): PerformanceAlertConfig;
  getAlertConfig(alertType: PerformanceAlertType): PerformanceAlertConfig | null;
  getAlerts(filters?: {
    type?: PerformanceAlertType;
    severity?: AlertSeverity;
    status?: AlertStatus;
    ruleId?: string;
    startDate?: string;
    endDate?: string;
  }): PerformanceAlert[];
  acknowledgeAlert(alertId: string, userId: string): boolean;
  resolveAlert(alertId: string, resolution: AlertResolution, notes?: string): boolean;
  getAlertHistory(ruleId?: string): AlertHistory[];
  getStatistics(): PerformanceAlertStatistics;
  sendAlert(alert: PerformanceAlert): Promise<void>;
  schedulePeriodicChecks(): void;
  clearResolvedAlerts(olderThanDays?: number): void;
  reset(): void;
}
