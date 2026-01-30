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
