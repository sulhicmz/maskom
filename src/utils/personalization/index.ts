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
