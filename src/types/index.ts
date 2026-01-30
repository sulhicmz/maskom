// Centralized type exports for consistent imports across the application
// This file provides a single import point for all application types

// Common types (ServiceResult, ServiceErrorCode, etc.)
export * from './common';

// Data types (BaseDataItem, MenuItem, FeedbackItem, etc.)
export * from './data';

// Analytics types (WebVitalsMetrics, PerformanceMetrics, etc.)
export * from './analytics';

// Blog types (InnerBlogPost, BlogPostStatus, etc.)
export * from './blog';

// Bookmark types
export * from './bookmark';

// Cache types (CacheConfig, CacheStatistics, etc.)
export * from './cache';

// Filter types (FilterCriteria, PaginationFilter)
export * from './filter';

// Search types (SearchPreset, SearchPresetStorage, etc.)
export * from './search';

// MFA types (MFAStatus, MFASetupData, etc.)
export * from './mfa';

// Permission types (Permission enum, PermissionConfig, etc.)
export * from './permission';

// Role types (UserRole, RoleConfig, etc.)
export * from './role';

// APM types (APMUIConfig, APMValidationResult, etc.)
export * from './apm';

// SEO types (SeoProps, BlogPostSchema, etc.)
export * from './seo';

// SEO Monitoring types (SEOAudit, SEOMetrics, SEOIssue, etc.)
export * from './seoMonitor';

// Backup types (BackupConfig, BackupMetadata, DisasterRecoveryPlan, etc.)
export * from './backup';

// Audit types (ActivityLog, ActivityAction, etc.)
export * from './audit';

// Auth types (User, LoginCredentials, etc.)
export type { User } from '../services/auth/types';

// Campaign types (EmailCampaign, CampaignMetrics, etc.)
export * from './campaign';

// Email Queue types (IEmailQueue, QueuedEmail, EmailQueueConfig, etc.)
export * from './emailQueue';

// A/B Test types (ABTest, ABTestVariant, etc.)
export * from './abTest';

// Email Scheduler types (SendTimeInsights, OptimalSendWindow, etc.)
export * from './emailScheduler';

// Anomaly Detection types (Anomaly, AnomalyAlert, AnomalyThreshold, etc.)
export * from './anomaly';

// Dashboard types (UserDashboardData, ReadingHistoryEntry, ActivityEvent, etc.)
export * from './dashboard';

// Accessibility types (AccessibilityAudit, AccessibilityIssue, AccessibilityScore, etc.)
export * from './accessibility';

// Personalization types (BehaviorSignal, UserProfile, PersonalizationRule, etc.)
export * from './personalization';
