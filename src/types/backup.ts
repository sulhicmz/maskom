export type BackupType = 'full' | 'incremental'

export type BackupStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export type BackupEncryption = 'AES-256' | 'none'

export type StorageType = 'localStorage' | 's3' | 'gcs' | 'azure' | 'none'

export type BackupSchedule = 'manual' | 'daily' | 'weekly' | 'monthly'

export type BackupHealthStatus = 'healthy' | 'warning' | 'critical'

export interface BackupMetadata {
  id: string
  timestamp: string
  type: BackupType
  size: number
  checksum: string
  encryption: BackupEncryption
  retention: string
  status: BackupStatus
  errorMessage?: string
  version: string
}

export interface BackupData {
  userData: UserDataBackup
  contentData: ContentDataBackup
  settingsData: SettingsDataBackup
  activityLogs: ActivityLogBackup[]
  backupInfo: BackupInfo
}

export interface UserDataBackup {
  authState: AuthStateBackup[]
  preferences: UserPreferencesBackup[]
  mfaSettings: MFASettingsBackup[]
}

export interface AuthStateBackup {
  userId: string
  email: string
  role: string
  mfaEnabled: boolean
  mfaEnabledAt?: string
}

export interface UserPreferencesBackup {
  userId: string
  preferences: {
    preferredCategories: number[]
    preferredTags: number[]
    maxRecommendations: number
    enablePersonalizedRecs: boolean
  }
}

export interface MFASettingsBackup {
  userId: string
  mfaEnabled: boolean
  mfaSecret?: string
  mfaBackupCodes?: string[]
  mfaEnabledAt?: string
}

export interface BookmarkBackup {
  id: string
  url: string
  title: string
  date: string
}

export interface ReadingHistoryBackup {
  id: string
  url: string
  title: string
  readAt: string
}

export interface ContentDataBackup {
  bookmarks?: BookmarkBackup[]
  readingHistory?: ReadingHistoryBackup[]
  blogPosts?: BlogPostBackup[]
  blogComments?: BlogCommentBackup[]
  mediaAssets?: MediaAssetBackup[]
}

export interface BlogPostBackup {
  id: number
  title: string
  slug: string
  description: string
  content: string
  image: string
  category: number
  tagId: number
  author: string
  date: string
  status: string
  publishDate?: string
}

export interface BlogCommentBackup {
  id: number
  blogId: number
  author: string
  email: string
  website: string
  message: string
  date: string
  status: string
  parentId?: number
  votes: number
}

export interface MediaAssetBackup {
  id: number
  url: string
  type: string
  alt: string
  tags: number[]
  uploadedAt: string
}

export interface SettingsDataBackup {
  appSettings?: Record<string, unknown>[]
  uiSettings?: Record<string, unknown>[]
  themeSettings?: Record<string, unknown>[]
  notificationSettings?: Record<string, unknown>[]
  cacheConfig?: CacheConfigBackup
  apmConfig?: APMConfigBackup
  rbacConfig?: RBACConfigBackup
  backupConfig?: BackupConfigBackup
}

export interface CacheConfigBackup {
  cacheFirstExtensions: string[]
  networkFirstPatterns: string[]
  cacheTTL: {
    staticAssets: number
    apiResponses: number
    images: number
    fonts: number
  }
  cacheSizeLimit: number
  cleanupPolicy: {
    enabled: boolean
    maxAge: number
    maxEntries: number
    autoCleanupInterval: number
  }
}

export interface APMConfigBackup {
  provider: string
  enabled: boolean
  environment: string
  sampleRate: number
}

export interface RBACConfigBackup {
  roles: {
    admin: string[]
    editor: string[]
    user: string[]
  }
  permissions: {
    view_analytics: string[]
    manage_users: string[]
    manage_roles: string[]
    manage_content: string[]
    publish_content: string[]
    edit_content: string[]
    delete_content: string[]
    view_admin_dashboard: string[]
    manage_settings: string[]
  }
}

export interface BackupConfigBackup {
  enabled: boolean
  schedule: BackupSchedule
  time: string
  retentionDays: number
  storageType: StorageType
  encryptionEnabled: boolean
  compressionEnabled: boolean
  retentionPolicy: RetentionPolicy
}

export interface ActivityLogBackup {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  timestamp: string
  ipAddress: string
  userAgent: string
  success: boolean
  errorMessage?: string
}

export interface BackupInfo {
  backupId: string
  backupType: BackupType
  backupDate: string
  backupVersion: string
  applicationVersion: string
  backupSize: number
  checksum: string
  encrypted: boolean
  compressed: boolean
}

export interface BackupConfig {
  enabled: boolean
  schedule: BackupSchedule
  time: string
  retentionDays: number
  storageType: StorageType
  encryptionEnabled: boolean
  compressionEnabled: boolean
  retentionPolicy: RetentionPolicy
}

export interface RetentionPolicy {
  keepLastCount: number
  keepDailyFor: number
  keepWeeklyFor: number
  keepMonthlyFor: number
  maxSizeGB: number
}

export interface DisasterRecoveryPlan {
  rto: string
  rpo: string
  backupStrategy: string
  restoreSteps: RestoreStep[]
  contactInfo: EmergencyContact[]
  validationChecklist: ValidationChecklist
}

export interface RestoreStep {
  step: number
  title: string
  description: string
  estimatedTime: string
  dependencies: number[]
}

export interface EmergencyContact {
  name: string
  role: string
  email: string
  phone: string
  priority: number
}

export interface ValidationChecklist {
  dataIntegrity: boolean
  backupVerification: boolean
  rollbackPlan: boolean
  notificationSent: boolean
  documented: boolean
}

export interface BackupStatistics {
  totalBackups: number
  successfulBackups: number
  failedBackups: number
  totalBackupSize: number
  lastBackupDate: string | null
  lastBackupStatus: BackupStatus
  retentionCompliance: number
  healthStatus: BackupHealthStatus
}

export interface RestoreResult {
  success: boolean
  backupId: string
  restoreDate: string
  restoreTime: number
  itemsRestored: number
  errors: string[]
  warnings: string[]
}

export const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  enabled: true,
  schedule: 'weekly',
  time: '02:00',
  retentionDays: 30,
  storageType: 'localStorage',
  encryptionEnabled: true,
  compressionEnabled: true,
  retentionPolicy: {
    keepLastCount: 5,
    keepDailyFor: 7,
    keepWeeklyFor: 4,
    keepMonthlyFor: 12,
    maxSizeGB: 10,
  },
}

export const DEFAULT_DISASTER_RECOVERY_PLAN: DisasterRecoveryPlan = {
  rto: '4 hours',
  rpo: '24 hours',
  backupStrategy: 'Full backup weekly, incremental daily',
  restoreSteps: [
    {
      step: 1,
      title: 'Identify Backup Source',
      description: 'Select the most recent backup from the backup list',
      estimatedTime: '5 minutes',
      dependencies: [],
    },
    {
      step: 2,
      title: 'Download Backup File',
      description: 'Download the selected backup file to your local machine',
      estimatedTime: '10 minutes',
      dependencies: [1],
    },
    {
      step: 3,
      title: 'Verify Backup Integrity',
      description: 'Validate the backup checksum and encryption status',
      estimatedTime: '2 minutes',
      dependencies: [2],
    },
    {
      step: 4,
      title: 'Restore Application State',
      description: 'Apply the backup to restore application data and settings',
      estimatedTime: '15 minutes',
      dependencies: [3],
    },
    {
      step: 5,
      title: 'Validate Restore',
      description: 'Verify that all data has been restored correctly',
      estimatedTime: '10 minutes',
      dependencies: [4],
    },
    {
      step: 6,
      title: 'Notify Stakeholders',
      description: 'Send notifications to team members about restore completion',
      estimatedTime: '5 minutes',
      dependencies: [5],
    },
  ],
  contactInfo: [
    {
      name: 'System Administrator',
      role: 'Primary Contact',
      email: 'admin@example.com',
      phone: '+62-21-1234-5678',
      priority: 1,
    },
    {
      name: 'DevOps Engineer',
      role: 'Technical Contact',
      email: 'devops@example.com',
      phone: '+62-21-8765-4321',
      priority: 2,
    },
  ],
  validationChecklist: {
    dataIntegrity: false,
    backupVerification: false,
    rollbackPlan: false,
    notificationSent: false,
    documented: false,
  },
}

export const BACKUP_STORAGE_KEY = 'maskom_backup_config'
export const BACKUP_METADATA_KEY = 'maskom_backup_metadata'
export const BACKUP_DATA_KEY_PREFIX = 'maskom_backup_data_'
export const DISASTER_RECOVERY_PLAN_KEY = 'maskom_disaster_recovery_plan'

export interface BackupProgress {
  current: number
  total: number
  message: string
}

export type BackupProgressCallback = (progress: BackupProgress) => void

export interface BackupSchedulerConfig {
  id: string
  schedule: BackupSchedule
  time: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
  config: BackupConfig
}

export type BackupSchedulerNotificationType = 'success' | 'error' | 'warning'

export interface BackupSchedulerNotification {
  type: BackupSchedulerNotificationType
  message: string
  backupId?: string
  timestamp: string
}

export type BackupSchedulerNotificationCallback = (notification: BackupSchedulerNotification) => void

export interface IBackupScheduler {
  initializeScheduler(): Promise<void>
  scheduleBackup(
    schedule: BackupSchedule,
    time: string,
    config: BackupConfig,
  ): Promise<boolean>
  cancelScheduledBackup(): Promise<boolean>
  onNotification(callback: BackupSchedulerNotificationCallback): void
  offNotification(callback: BackupSchedulerNotificationCallback): void
  getScheduledBackup(): BackupSchedulerConfig | null
  getLastScheduledBackupRun(): Promise<Date | null>
}

export interface IBackupEngine {
  createFullBackup(
    config: BackupConfig,
    onProgress?: BackupProgressCallback,
  ): Promise<BackupMetadata>
  createIncrementalBackup(
    config: BackupConfig,
    lastFullBackup: BackupMetadata | null,
    onProgress?: BackupProgressCallback,
  ): Promise<BackupMetadata>
  restoreBackup(
    backupId: string,
    onProgress?: BackupProgressCallback,
  ): Promise<RestoreResult>
  verifyBackupIntegrity(backupId: string): Promise<boolean>
  getBackupStatistics(): Promise<BackupStatistics>
  deleteBackup(backupId: string): Promise<boolean>
  exportBackupToFile(backupId: string): Promise<Blob | null>
  getBackupMetadataList(): Promise<BackupMetadata[]>
  getBackupMetadataById(backupId: string): Promise<BackupMetadata | null>
}
