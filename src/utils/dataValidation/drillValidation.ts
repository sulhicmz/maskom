import {
  DrillType,
  DrillStatus,
  DrillSchedule,
  type BackupDrill,
  type DrillScheduleDetails,
  type DrillResults,
} from '@/types/drill';

const VALID_DRILL_TYPES: DrillType[] = [
  DrillType.FULL_RESTORE,
  DrillType.PARTIAL_RESTORE,
  DrillType.INTEGRITY_CHECK,
];

const VALID_DRILL_STATUSES: DrillStatus[] = [
  DrillStatus.SCHEDULED,
  DrillStatus.RUNNING,
  DrillStatus.PASSED,
  DrillStatus.FAILED,
  DrillStatus.CANCELLED,
];

const VALID_DRILL_SCHEDULES: DrillSchedule[] = [
  DrillSchedule.DAILY,
  DrillSchedule.WEEKLY,
  DrillSchedule.MONTHLY,
  DrillSchedule.MANUAL,
];

export const validateDrillType = (
  type: DrillType
): { isValid: boolean; errors: string[] } => {
  return VALID_DRILL_TYPES.includes(type)
    ? { isValid: true, errors: [] }
    : { isValid: false, errors: [`Invalid drill type: ${type}`] };
};

export const validateDrillStatus = (
  status: DrillStatus
): { isValid: boolean; errors: string[] } => {
  return VALID_DRILL_STATUSES.includes(status)
    ? { isValid: true, errors: [] }
    : { isValid: false, errors: [`Invalid drill status: ${status}`] };
};

export const validateDrillSchedule = (
  schedule: DrillSchedule
): { isValid: boolean; errors: string[] } => {
  return VALID_DRILL_SCHEDULES.includes(schedule)
    ? { isValid: true, errors: [] }
    : { isValid: false, errors: [`Invalid drill schedule: ${schedule}`] };
};

export const validateDrillResults = (
  results: DrillResults | undefined
): { isValid: boolean; errors: string[] } => {
  if (!results) {
    return { isValid: true, errors: [] };
  }

  const errors: string[] = [];

  if (typeof results.restoreDuration !== 'number' || results.restoreDuration < 0) {
    errors.push('restoreDuration must be a non-negative number');
  }

  if (typeof results.integrityCheckPassed !== 'boolean') {
    errors.push('integrityCheckPassed must be a boolean');
  }

  if (typeof results.dataLossDetected !== 'boolean') {
    errors.push('dataLossDetected must be a boolean');
  }

  if (typeof results.itemsRestored !== 'number' || results.itemsRestored < 0) {
    errors.push('itemsRestored must be a non-negative number');
  }

  if (typeof results.checksumValid !== 'boolean') {
    errors.push('checksumValid must be a boolean');
  }

  if (results.warnings && !Array.isArray(results.warnings)) {
    errors.push('warnings must be an array');
  }

  if (results.errors && !Array.isArray(results.errors)) {
    errors.push('errors must be an array');
  }

  return errors.length === 0
    ? { isValid: true, errors: [] }
    : { isValid: false, errors };
};

export const validateBackupDrill = (
  drill: BackupDrill
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof drill.id !== 'string' || drill.id.trim() === '') {
    errors.push('id must be a non-empty string');
  }

  if (typeof drill.backupId !== 'string' || drill.backupId.trim() === '') {
    errors.push('backupId must be a non-empty string');
  }

  const typeResult = validateDrillType(drill.drillType);
  if (!typeResult.isValid) {
    errors.push(...typeResult.errors);
  }

  const statusResult = validateDrillStatus(drill.status);
  if (!statusResult.isValid) {
    errors.push(...statusResult.errors);
  }

  if (
    typeof drill.timestamp !== 'string' ||
    drill.timestamp.trim() === '' ||
    isNaN(Date.parse(drill.timestamp))
  ) {
    errors.push('timestamp must be a valid ISO 8601 date string');
  }

  if (typeof drill.duration !== 'number' || drill.duration < 0) {
    errors.push('duration must be a non-negative number');
  }

  const resultsResult = validateDrillResults(drill.results);
  if (!resultsResult.isValid) {
    errors.push(...resultsResult.errors.map((e) => `results: ${e}`));
  }

  if (drill.errors && !Array.isArray(drill.errors)) {
    errors.push('errors must be an array');
  }

  if (drill.scheduledFor !== undefined) {
    if (
      typeof drill.scheduledFor !== 'string' ||
      drill.scheduledFor.trim() === '' ||
      isNaN(Date.parse(drill.scheduledFor))
    ) {
      errors.push('scheduledFor must be a valid ISO 8601 date string');
    }
  }

  if (drill.startedAt !== undefined) {
    if (
      typeof drill.startedAt !== 'string' ||
      drill.startedAt.trim() === '' ||
      isNaN(Date.parse(drill.startedAt))
    ) {
      errors.push('startedAt must be a valid ISO 8601 date string');
    }
  }
  
  if (drill.completedAt !== undefined) {
    if (
      typeof drill.completedAt !== 'string' ||
      drill.completedAt.trim() === '' ||
      isNaN(Date.parse(drill.completedAt))
    ) {
      errors.push('completedAt must be a valid ISO 8601 date string');
    }
  }

  if (drill.completedAt !== undefined) {
    const completedTime = Date.parse(drill.completedAt);
    const timestampTime = Date.parse(drill.timestamp);
    
    if (!isNaN(completedTime) && !isNaN(timestampTime) && completedTime < timestampTime) {
      errors.push('completedAt must be after or equal to timestamp');
    }
  }

  if (typeof drill.remediationAttempted !== 'boolean') {
    errors.push('remediationAttempted must be a boolean');
  }

  if (typeof drill.notificationSent !== 'boolean') {
    errors.push('notificationSent must be a boolean');
  }

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateDrillScheduleDetails = (
  schedule: DrillScheduleDetails
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof schedule.drillId !== 'string' || schedule.drillId.trim() === '') {
    errors.push('drillId must be a non-empty string');
  }

  const typeResult = validateDrillType(schedule.drillType);
  if (!typeResult.isValid) {
    errors.push(...typeResult.errors);
  }

  if (
    typeof schedule.backupId !== 'string' ||
    schedule.backupId.trim() === ''
  ) {
    errors.push('backupId must be a non-empty string');
  }

  if (
    typeof schedule.scheduledFor !== 'string' ||
    schedule.scheduledFor.trim() === '' ||
    isNaN(Date.parse(schedule.scheduledFor))
  ) {
    errors.push('scheduledFor must be a valid ISO 8601 date string');
  }

  const scheduleResult = validateDrillSchedule(schedule.recurrence);
  if (!scheduleResult.isValid) {
    errors.push(...scheduleResult.errors);
  }

  if (typeof schedule.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateBackupDrills = (
  drills: BackupDrill[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const ids = new Set<string>();

  drills.forEach((drill, index) => {
    if (ids.has(drill.id)) {
      errors.push(`BackupDrill at index ${index}: Duplicate drill ID: ${drill.id}`);
    }
    ids.add(drill.id);

    const result = validateBackupDrill(drill);
    if (!result.isValid) {
      errors.push(
        ...result.errors.map((e) => `BackupDrill[${drill.id}]: ${e}`)
      );
    }
  });

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateDrillSchedules = (
  schedules: DrillScheduleDetails[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const ids = new Set<string>();

  schedules.forEach((schedule, index) => {
    if (ids.has(schedule.drillId)) {
      errors.push(
        `DrillScheduleDetails at index ${index}: Duplicate schedule ID: ${schedule.drillId}`
      );
    }
    ids.add(schedule.drillId);

    const result = validateDrillScheduleDetails(schedule);
    if (!result.isValid) {
      errors.push(
        ...result.errors.map(
          (e) => `DrillScheduleDetails[${schedule.drillId}]: ${e}`
        )
      );
    }
  });

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};
