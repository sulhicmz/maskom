export enum ActivityAction {
    LOGIN = 'login',
    LOGOUT = 'logout',
    PASSWORD_CHANGE = 'password_change',
    MFA_ENABLED = 'mfa_enabled',
    MFA_DISABLED = 'mfa_disabled',
    BACKUP_CODES_GENERATED = 'backup_codes_generated',
    ROLE_CHANGE = 'role_change',
    ROLE_ASSIGNED = 'role_assigned',
    ROLE_REMOVED = 'role_removed',
    PERMISSION_GRANTED = 'permission_granted',
    PERMISSION_REVOKED = 'permission_revoked',
    CONTENT_PUBLISH = 'content_publish',
    CONTENT_UPDATE = 'content_update',
    CONTENT_DELETE = 'content_delete',
    CONTENT_SCHEDULE = 'content_schedule',
    SETTINGS_CHANGE = 'settings_change',
    BACKUP_CREATE = 'backup_create',
    BACKUP_RESTORE = 'backup_restore',
    BACKUP_DELETE = 'backup_delete',
    CACHE_CLEAR = 'cache_clear',
    APM_CONFIG_CHANGE = 'apm_config_change',
    USER_REGISTER = 'user_register',
    USER_DELETE = 'user_delete',
    API_ACCESS = 'api_access',
    COMMENT_CREATE = 'comment_create',
    COMMENT_DELETE = 'comment_delete',
    COMMENT_MODERATE = 'comment_moderate',
}

export interface ActivityLog {
    id: string;
    userId: string;
    action: ActivityAction;
    resource: string;
    resourceId?: string;
    details: Record<string, any>;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    errorMessage?: string;
}

export interface ActivityLogFilter {
    userId?: string;
    action?: ActivityAction[];
    resource?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    success?: boolean;
    limit?: number;
    offset?: number;
}

export interface ActivityStatistics {
    totalLogs: number;
    successfulLogs: number;
    failedLogs: number;
    logsByAction: Record<ActivityAction, number>;
    logsByUser: Record<string, number>;
    logsByResource: Record<string, number>;
    recentActivity: ActivityLog[];
    todayActivity: number;
    last24hActivity: number;
    last7DaysActivity: number;
    last30DaysActivity: number;
}

export interface AlertRule {
    id: string;
    name: string;
    description: string;
    action: ActivityAction;
    threshold: number;
    timeWindow: number; // in minutes
    enabled: boolean;
    alertEmail?: string;
}

export interface SuspiciousActivityAlert {
    id: string;
    ruleId: string;
    ruleName: string;
    triggeredAt: string;
    userId?: string;
    action: ActivityAction;
    count: number;
    threshold: number;
    activities: ActivityLog[];
    resolved: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
}
