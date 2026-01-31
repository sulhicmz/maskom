export { behaviorTracker, BehaviorTracker } from './behaviorTracker';
export { segmentationEngine, SegmentationEngine } from './segmentationEngine';
export { personalizationEngine, PersonalizationEngine } from './personalizationEngine';
export { ruleVersionStorage, RuleVersionStorage } from './ruleVersionStorage';
export {
  personalizationTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
  searchTemplates,
  getRecommendedTemplates,
} from './templateLibrary';
export {
  getTemplateMetrics,
  getTemplateMetricsById,
  updateTemplateMetrics,
  recordTemplateApplication,
  recordTemplateDeactivation,
  recordTemplatePerformance,
  rateTemplate,
  getTemplateUsageStats,
  getTemplateUsageByTemplateId,
  recordTemplateUsage,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  clearTemplateData,
  getTemplateSummaryStats,
  getTopPerformingTemplates,
  getMostUsedTemplates,
} from './templateStorage';
export { recommendationEngine, RecommendationEngine } from './recommendationEngine';
export {
  personalizationExperimentAutomation,
  PersonalizationExperimentAutomation,
} from './experimentAutomation';
export type {
  BehaviorSignal,
  ContentType,
  UserProfile,
  UserSegment,
  ContentVariant,
  PersonalizationRule,
  RuleCondition,
  PersonalizationMetrics,
  PersonalizationAnalytics,
  PersonalizationConfig,
  PersonalizationTrigger,
  PersonalizationRuleVersion,
  RuleVersionDiff,
  TemplateCategory,
  PersonalizationTemplate,
  TemplateMetadata,
  TemplateApplicationConfig,
  TemplatePerformanceMetrics,
  TemplateUsageStats,
} from '@/types/personalization';
export type {
  RecommendationAlgorithm,
  RecommendationScore,
  RecommendationExplanation,
  RecommendationFeedback,
  RecommendationMetrics,
  RecommendationConfig,
  ColdStartStrategy,
} from '@/types/recommendation';
export type {
  ExperimentStatus,
  ExperimentScheduleMode,
  ExperimentSuccessMetric,
  ExperimentTemplateType,
  ExperimentVariant,
  PersonalizationExperiment,
  ExperimentAutomationConfig,
  ExperimentResult,
  ExperimentAlert,
  ExperimentTemplate,
  ExperimentQueue,
  ExperimentHistory,
  IPersonalizationExperimentAutomation,
} from '@/types/personalization';
