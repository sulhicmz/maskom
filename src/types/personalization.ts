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
// EXPERIMENT AUTOMATION TYPES
// ============================================================================

/**
 * Experiment automation status
 */
export type ExperimentStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';

/**
 * Experiment automation configuration
 */
export type ExperimentScheduleMode = 'sequential' | 'parallel' | 'manual';

/**
 * Experiment success metric for auto-winner declaration
 */
export type ExperimentSuccessMetric = 'conversion_rate' | 'engagement_rate' | 'lift' | 'revenue';

/**
 * Experiment template type
 */
export type ExperimentTemplateType = 'headline_test' | 'cta_test' | 'layout_test' | 'content_test';

/**
 * Personalization experiment variant with automation tracking
 */
export interface ExperimentVariant {
  id: string;
  experimentId: string;
  variantName: string;
  ruleId: string;
  weight: number;
  isControl: boolean;
  metrics: {
    impressions: number;
    conversions: number;
    engagement: number;
    revenue: number;
  };
  assignedUsers: string[];
}

/**
 * Personalization experiment with automation support
 */
export interface PersonalizationExperiment {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  scheduleMode: ExperimentScheduleMode;
  successMetric: ExperimentSuccessMetric;
  variants: ExperimentVariant[];
  rules: PersonalizationRule[];
  automationConfig: ExperimentAutomationConfig;
  createdAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  winner?: ExperimentResult;
  alerts: ExperimentAlert[];
}

/**
 * Experiment automation configuration
 */
export interface ExperimentAutomationConfig {
  autoStart: boolean;
  autoStop: boolean;
  autoWinnerDeclaration: boolean;
  minSampleSize: number;
  minDuration: number;
  maxDuration: number;
  confidenceThreshold: number;
  sampleSizeThreshold: number;
  durationThreshold: number;
  stopOnNegativeLift: boolean;
  rollbackOnFailure: boolean;
}

/**
 * Experiment result with statistical significance
 */
export interface ExperimentResult {
  experimentId: string;
  winnerId: string;
  winnerName: string;
  loserId: string;
  loserName: string;
  statisticalSignificance: boolean;
  pValue: number;
  confidenceLevel: number;
  confidenceInterval: {
    winner: { lower: number; upper: number };
    loser: { lower: number; upper: number };
  };
  lift: number;
  declaredAt: string;
}

/**
 * Experiment alert for notifications
 */
export interface ExperimentAlert {
  id: string;
  experimentId: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: string;
  acknowledged: boolean;
}

/**
 * Experiment template for quick setup
 */
export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  type: ExperimentTemplateType;
  category: 'engagement' | 'conversion' | 'retention';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  config: ExperimentAutomationConfig;
  variants: Omit<ExperimentVariant, 'experimentId' | 'id' | 'assignedUsers' | 'metrics'>[];
  useCases: string[];
  expectedDuration: number;
  estimatedLift: number;
}

/**
 * Experiment scheduling queue
 */
export interface ExperimentQueue {
  experiments: PersonalizationExperiment[];
  currentExperiment?: string;
  mode: ExperimentScheduleMode;
}

/**
 * Experiment history and statistics
 */
export interface ExperimentHistory {
  experimentId: string;
  statusChanges: {
    from: ExperimentStatus;
    to: ExperimentStatus;
    timestamp: string;
  }[];
  metricsSnapshots: {
    timestamp: string;
    variantId: string;
    metrics: ExperimentVariant['metrics'];
  }[];
  alerts: ExperimentAlert[];
}

/**
 * Interface for personalization experiment automation engine
 */
export interface IPersonalizationExperimentAutomation {
  createExperiment(config: Omit<PersonalizationExperiment, 'id' | 'createdAt' | 'alerts'>): PersonalizationExperiment;
  startExperiment(experimentId: string): boolean;
  stopExperiment(experimentId: string, reason?: string): boolean;
  pauseExperiment(experimentId: string): boolean;
  resumeExperiment(experimentId: string): boolean;
  deleteExperiment(experimentId: string): boolean;
  getExperiment(experimentId: string): PersonalizationExperiment | undefined;
  getAllExperiments(): PersonalizationExperiment[];
  getExperimentsByStatus(status: ExperimentStatus): PersonalizationExperiment[];
  scheduleExperiment(experimentId: string, scheduledAt: string): boolean;
  declareWinner(experimentId: string): ExperimentResult | null;
  rollbackExperiment(experimentId: string): boolean;
  getExperimentHistory(experimentId: string): ExperimentHistory | undefined;
  getAvailableTemplates(): ExperimentTemplate[];
  applyTemplate(templateId: string, config: Partial<ExperimentAutomationConfig>): PersonalizationExperiment;
  trackMetric(experimentId: string, variantId: string, metric: keyof ExperimentVariant['metrics'], value: number): void;
  processAutomationRules(): void;
  checkAlerts(): ExperimentAlert[];
  getExperimentQueue(): ExperimentQueue;
  addExperimentToQueue(experimentId: string): void;
  removeExperimentFromQueue(experimentId: string): void;
}
