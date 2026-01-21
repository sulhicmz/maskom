import {
  ActivityAction,
  ActivityLog,
  ActivityLogFilter,
  ActivityStatistics,
  ActivityDetails,
  AlertRule,
  SuspiciousActivityAlert,
} from '@/types/audit';

const VALID_ACTIVITY_ACTIONS: ActivityAction[] = [
  ActivityAction.LOGIN,
  ActivityAction.LOGOUT,
  ActivityAction.PASSWORD_CHANGE,
  ActivityAction.MFA_ENABLED,
  ActivityAction.MFA_DISABLED,
  ActivityAction.BACKUP_CODES_GENERATED,
  ActivityAction.ROLE_CHANGE,
  ActivityAction.ROLE_ASSIGNED,
  ActivityAction.ROLE_REMOVED,
  ActivityAction.PERMISSION_GRANTED,
  ActivityAction.PERMISSION_REVOKED,
  ActivityAction.CONTENT_PUBLISH,
  ActivityAction.CONTENT_UPDATE,
  ActivityAction.CONTENT_DELETE,
  ActivityAction.CONTENT_SCHEDULE,
  ActivityAction.SETTINGS_CHANGE,
  ActivityAction.BACKUP_CREATE,
  ActivityAction.BACKUP_RESTORE,
  ActivityAction.BACKUP_DELETE,
  ActivityAction.CACHE_CLEAR,
  ActivityAction.APM_CONFIG_CHANGE,
  ActivityAction.USER_REGISTER,
  ActivityAction.USER_DELETE,
  ActivityAction.API_ACCESS,
  ActivityAction.COMMENT_CREATE,
  ActivityAction.COMMENT_DELETE,
  ActivityAction.COMMENT_MODERATE,
];

export const validateActivityAction = (
  action: ActivityAction
): { isValid: boolean; errors: string[] } => {
  return VALID_ACTIVITY_ACTIONS.includes(action)
    ? { isValid: true, errors: [] }
    : { isValid: false, errors: [`Invalid activity action: ${action}`] };
};

export const validateActivityDetails = (
  details: ActivityDetails
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    errors.push('Details must be a non-null object');
    return { isValid: false, errors };
  }

  for (const [key, value] of Object.entries(details)) {
    const isValidType = (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null ||
      value === undefined ||
      Array.isArray(value)
    );

    if (!isValidType) {
      errors.push(`Details.${key} has invalid type: ${typeof value}. Must be string, number, boolean, null, undefined, or array`);
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const arrayItem = value[i];
        const isValidItemType = (
          typeof arrayItem === 'string' ||
          typeof arrayItem === 'number' ||
          typeof arrayItem === 'boolean'
        );
        if (!isValidItemType) {
          errors.push(`Details.${key}[${i}] has invalid type: ${typeof arrayItem}. Must be string, number, or boolean`);
        }
      }
    }
  }

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateActivityLog = (
  log: ActivityLog
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!log.id || typeof log.id !== 'string' || log.id.trim() === '') {
    errors.push('id must be a non-empty string');
  }

  if (!log.userId || typeof log.userId !== 'string' || log.userId.trim() === '') {
    errors.push('userId must be a non-empty string');
  }

  const actionValidation = validateActivityAction(log.action);
  if (!actionValidation.isValid) {
    errors.push(...actionValidation.errors);
  }

  if (!log.resource || typeof log.resource !== 'string' || log.resource.trim() === '') {
    errors.push('resource must be a non-empty string');
  }

  if (log.resourceId !== undefined) {
    if (typeof log.resourceId !== 'string' || log.resourceId.trim() === '') {
      errors.push('resourceId must be a non-empty string if provided');
    }
  }

  const detailsValidation = validateActivityDetails(log.details);
  if (!detailsValidation.isValid) {
    errors.push(...detailsValidation.errors.map(e => `details: ${e}`));
  }

  if (!log.timestamp || typeof log.timestamp !== 'string') {
    errors.push('timestamp must be a string');
  } else {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
    if (!isoDateRegex.test(log.timestamp)) {
      errors.push('timestamp must be in ISO 8601 format (e.g., 2024-01-15T10:30:00.000Z)');
    }
  }

  if (!log.ipAddress || typeof log.ipAddress !== 'string' || log.ipAddress.trim() === '') {
    errors.push('ipAddress must be a non-empty string');
  } else {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(log.ipAddress)) {
      errors.push('ipAddress must be a valid IPv4 address');
    }
  }

  if (!log.userAgent || typeof log.userAgent !== 'string' || log.userAgent.trim() === '') {
    errors.push('userAgent must be a non-empty string');
  }

  if (typeof log.success !== 'boolean') {
    errors.push('success must be a boolean');
  }

  if (log.errorMessage !== undefined) {
    if (typeof log.errorMessage !== 'string') {
      errors.push('errorMessage must be a string if provided');
    }
  }

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateActivityLogs = (
  logs: ActivityLog[]
): { isValid: boolean; errors: string[] } => {
  const allErrors: string[] = [];

  if (!Array.isArray(logs)) {
    return { isValid: false, errors: ['Activity logs must be an array'] };
  }

  const idSet = new Set<string>();

  logs.forEach((log, index) => {
    const validation = validateActivityLog(log);
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        allErrors.push(`ActivityLog[${index}]: ${error}`);
      });
    }

    if (idSet.has(log.id)) {
      allErrors.push(`ActivityLog[${index}]: Duplicate id ${log.id} found`);
    }
    idSet.add(log.id);
  });

  return allErrors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors: allErrors };
};

export const validateActivityLogFilter = (
  filter: ActivityLogFilter
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (filter.userId !== undefined) {
    if (typeof filter.userId !== 'string' || filter.userId.trim() === '') {
      errors.push('userId must be a non-empty string if provided');
    }
  }

  if (filter.action !== undefined) {
    if (!Array.isArray(filter.action)) {
      errors.push('action must be an array if provided');
    } else {
      filter.action.forEach((action, index) => {
        const actionValidation = validateActivityAction(action);
        if (!actionValidation.isValid) {
          errors.push(`action[${index}]: ${actionValidation.errors[0]}`);
        }
      });
    }
  }

  if (filter.resource !== undefined) {
    if (typeof filter.resource !== 'string' || filter.resource.trim() === '') {
      errors.push('resource must be a non-empty string if provided');
    }
  }

  if (filter.resourceId !== undefined) {
    if (typeof filter.resourceId !== 'string' || filter.resourceId.trim() === '') {
      errors.push('resourceId must be a non-empty string if provided');
    }
  }

  if (filter.startDate !== undefined) {
    if (typeof filter.startDate !== 'string') {
      errors.push('startDate must be a string if provided');
    } else {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
      if (!isoDateRegex.test(filter.startDate)) {
        errors.push('startDate must be in ISO 8601 format if provided');
      }
    }
  }

  if (filter.endDate !== undefined) {
    if (typeof filter.endDate !== 'string') {
      errors.push('endDate must be a string if provided');
    } else {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
      if (!isoDateRegex.test(filter.endDate)) {
        errors.push('endDate must be in ISO 8601 format if provided');
      }
    }
  }

  if (filter.startDate !== undefined && filter.endDate !== undefined) {
    const start = new Date(filter.startDate);
    const end = new Date(filter.endDate);
    if (start > end) {
      errors.push('startDate must be before or equal to endDate');
    }
  }

  if (filter.success !== undefined) {
    if (typeof filter.success !== 'boolean') {
      errors.push('success must be a boolean if provided');
    }
  }

  if (filter.limit !== undefined) {
    if (typeof filter.limit !== 'number' || filter.limit <= 0) {
      errors.push('limit must be a positive number if provided');
    }
  }

  if (filter.offset !== undefined) {
    if (typeof filter.offset !== 'number' || filter.offset < 0) {
      errors.push('offset must be a non-negative number if provided');
    }
  }

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateActivityStatistics = (
  stats: ActivityStatistics
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof stats.totalLogs !== 'number' || stats.totalLogs < 0) {
    errors.push('totalLogs must be a non-negative number');
  }

  if (typeof stats.successfulLogs !== 'number' || stats.successfulLogs < 0) {
    errors.push('successfulLogs must be a non-negative number');
  }

  if (typeof stats.failedLogs !== 'number' || stats.failedLogs < 0) {
    errors.push('failedLogs must be a non-negative number');
  }

  if (stats.successfulLogs + stats.failedLogs !== stats.totalLogs) {
    errors.push('successfulLogs + failedLogs must equal totalLogs');
  }

  if (!stats.logsByAction || typeof stats.logsByAction !== 'object') {
    errors.push('logsByAction must be an object');
  } else {
    for (const [action, count] of Object.entries(stats.logsByAction)) {
      const actionValidation = validateActivityAction(action as ActivityAction);
      if (!actionValidation.isValid) {
        errors.push(`logsByAction: Invalid action ${action}`);
      }
      if (typeof count !== 'number' || count < 0) {
        errors.push(`logsByAction[${action}]: count must be a non-negative number`);
      }
    }
  }

  if (!stats.logsByUser || typeof stats.logsByUser !== 'object') {
    errors.push('logsByUser must be an object');
  } else {
    for (const [userId, count] of Object.entries(stats.logsByUser)) {
      if (typeof userId !== 'string' || userId.trim() === '') {
        errors.push(`logsByUser: userId must be a non-empty string`);
      }
      if (typeof count !== 'number' || count < 0) {
        errors.push(`logsByUser[${userId}]: count must be a non-negative number`);
      }
    }
  }

  if (!stats.logsByResource || typeof stats.logsByResource !== 'object') {
    errors.push('logsByResource must be an object');
  } else {
    for (const [resource, count] of Object.entries(stats.logsByResource)) {
      if (typeof resource !== 'string' || resource.trim() === '') {
        errors.push(`logsByResource: resource must be a non-empty string`);
      }
      if (typeof count !== 'number' || count < 0) {
        errors.push(`logsByResource[${resource}]: count must be a non-negative number`);
      }
    }
  }

  if (!Array.isArray(stats.recentActivity)) {
    errors.push('recentActivity must be an array');
  } else {
    stats.recentActivity.forEach((log, index) => {
      const validation = validateActivityLog(log);
      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          errors.push(`recentActivity[${index}]: ${error}`);
        });
      }
    });
  }

  if (typeof stats.todayActivity !== 'number' || stats.todayActivity < 0) {
    errors.push('todayActivity must be a non-negative number');
  }

  if (typeof stats.last24hActivity !== 'number' || stats.last24hActivity < 0) {
    errors.push('last24hActivity must be a non-negative number');
  }

  if (typeof stats.last7DaysActivity !== 'number' || stats.last7DaysActivity < 0) {
    errors.push('last7DaysActivity must be a non-negative number');
  }

  if (typeof stats.last30DaysActivity !== 'number' || stats.last30DaysActivity < 0) {
    errors.push('last30DaysActivity must be a non-negative number');
  }

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateAlertRule = (
  rule: AlertRule
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!rule.id || typeof rule.id !== 'string' || rule.id.trim() === '') {
    errors.push('id must be a non-empty string');
  }

  if (!rule.name || typeof rule.name !== 'string' || rule.name.trim() === '') {
    errors.push('name must be a non-empty string');
  }

  if (!rule.description || typeof rule.description !== 'string' || rule.description.trim() === '') {
    errors.push('description must be a non-empty string');
  }

  const actionValidation = validateActivityAction(rule.action);
  if (!actionValidation.isValid) {
    errors.push(...actionValidation.errors);
  }

  if (typeof rule.threshold !== 'number' || rule.threshold <= 0) {
    errors.push('threshold must be a positive number');
  }

  if (typeof rule.timeWindow !== 'number' || rule.timeWindow <= 0) {
    errors.push('timeWindow must be a positive number (in minutes)');
  }

  if (typeof rule.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (rule.alertEmail !== undefined) {
    if (typeof rule.alertEmail !== 'string' || rule.alertEmail.trim() === '') {
      errors.push('alertEmail must be a non-empty string if provided');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rule.alertEmail)) {
        errors.push('alertEmail must be a valid email address');
      }
    }
  }

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateSuspiciousActivityAlert = (
  alert: SuspiciousActivityAlert
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!alert.id || typeof alert.id !== 'string' || alert.id.trim() === '') {
    errors.push('id must be a non-empty string');
  }

  if (!alert.ruleId || typeof alert.ruleId !== 'string' || alert.ruleId.trim() === '') {
    errors.push('ruleId must be a non-empty string');
  }

  if (!alert.ruleName || typeof alert.ruleName !== 'string' || alert.ruleName.trim() === '') {
    errors.push('ruleName must be a non-empty string');
  }

  if (!alert.triggeredAt || typeof alert.triggeredAt !== 'string') {
    errors.push('triggeredAt must be a string');
  } else {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
    if (!isoDateRegex.test(alert.triggeredAt)) {
      errors.push('triggeredAt must be in ISO 8601 format');
    }
  }

  if (alert.userId !== undefined) {
    if (typeof alert.userId !== 'string' || alert.userId.trim() === '') {
      errors.push('userId must be a non-empty string if provided');
    }
  }

  const actionValidation = validateActivityAction(alert.action);
  if (!actionValidation.isValid) {
    errors.push(...actionValidation.errors);
  }

  if (typeof alert.count !== 'number' || alert.count <= 0) {
    errors.push('count must be a positive number');
  }

  if (typeof alert.threshold !== 'number' || alert.threshold <= 0) {
    errors.push('threshold must be a positive number');
  }

  if (typeof alert.timeWindow !== 'number' || alert.timeWindow <= 0) {
    errors.push('timeWindow must be a positive number (in minutes)');
  }

  if (!Array.isArray(alert.activities)) {
    errors.push('activities must be an array');
  } else {
    if (alert.activities.length === 0) {
      errors.push('activities must not be empty');
    }
    alert.activities.forEach((log, index) => {
      const validation = validateActivityLog(log);
      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          errors.push(`activities[${index}]: ${error}`);
        });
      }
    });
  }

  if (typeof alert.resolved !== 'boolean') {
    errors.push('resolved must be a boolean');
  }

  if (alert.resolved) {
    if (!alert.resolvedAt || typeof alert.resolvedAt !== 'string') {
      errors.push('resolvedAt must be a string when resolved is true');
    } else {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
      if (!isoDateRegex.test(alert.resolvedAt)) {
        errors.push('resolvedAt must be in ISO 8601 format');
      }
    }

    if (!alert.resolvedBy || typeof alert.resolvedBy !== 'string' || alert.resolvedBy.trim() === '') {
      errors.push('resolvedBy must be a non-empty string when resolved is true');
    }
  }

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};
