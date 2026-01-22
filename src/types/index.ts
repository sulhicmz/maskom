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

// Backup types (BackupConfig, BackupMetadata, DisasterRecoveryPlan, etc.)
export * from './backup';

// Audit types (ActivityLog, ActivityAction, etc.)
export * from './audit';

// Auth types (User, LoginCredentials, etc.)
export type { User } from '../services/auth/types';

// A/B Test types (ABTest, ABTestVariant, etc.)
export * from './abTest';
