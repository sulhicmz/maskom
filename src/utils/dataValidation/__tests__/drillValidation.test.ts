import {
  validateDrillType,
  validateDrillStatus,
  validateDrillSchedule,
  validateDrillResults,
  validateBackupDrill,
  validateDrillScheduleDetails,
  validateBackupDrills,
  validateDrillSchedules,
} from '../drillValidation';
import { DrillType, DrillStatus, DrillSchedule } from '@/types/drill';

describe('drillValidation', () => {
  describe('validateDrillType', () => {
    it('should accept valid drill types', () => {
      const result1 = validateDrillType(DrillType.FULL_RESTORE);
      expect(result1.isValid).toBe(true);
      expect(result1.errors).toHaveLength(0);

      const result2 = validateDrillType(DrillType.PARTIAL_RESTORE);
      expect(result2.isValid).toBe(true);
      expect(result2.errors).toHaveLength(0);

      const result3 = validateDrillType(DrillType.INTEGRITY_CHECK);
      expect(result3.isValid).toBe(true);
      expect(result3.errors).toHaveLength(0);
    });

    it('should reject invalid drill type', () => {
      const result = validateDrillType('invalid_type' as DrillType);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid drill type: invalid_type');
    });
  });

  describe('validateDrillStatus', () => {
    it('should accept valid drill statuses', () => {
      const validStatuses = [
        DrillStatus.SCHEDULED,
        DrillStatus.RUNNING,
        DrillStatus.PASSED,
        DrillStatus.FAILED,
        DrillStatus.CANCELLED,
      ];

      validStatuses.forEach((status) => {
        const result = validateDrillStatus(status);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid drill status', () => {
      const result = validateDrillStatus('invalid_status' as DrillStatus);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid drill status: invalid_status');
    });
  });

  describe('validateDrillSchedule', () => {
    it('should accept valid drill schedules', () => {
      const validSchedules = [
        DrillSchedule.DAILY,
        DrillSchedule.WEEKLY,
        DrillSchedule.MONTHLY,
        DrillSchedule.MANUAL,
      ];

      validSchedules.forEach((schedule) => {
        const result = validateDrillSchedule(schedule);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid drill schedule', () => {
      const result = validateDrillSchedule('invalid_schedule' as DrillSchedule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid drill schedule: invalid_schedule');
    });
  });

  describe('validateDrillResults', () => {
    it('should accept undefined results', () => {
      const result = validateDrillResults(undefined);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept valid drill results', () => {
      const results = {
        restoreDuration: 120,
        integrityCheckPassed: true,
        dataLossDetected: false,
        itemsRestored: 500,
        checksumValid: true,
        warnings: [],
      };

      const result = validateDrillResults(results);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept valid drill results with errors', () => {
      const results = {
        restoreDuration: 120,
        integrityCheckPassed: true,
        dataLossDetected: false,
        itemsRestored: 500,
        checksumValid: true,
        errors: ['Restore timeout'],
      };

      const result = validateDrillResults(results);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative restoreDuration', () => {
      const results = {
        restoreDuration: -1,
        integrityCheckPassed: true,
        dataLossDetected: false,
        itemsRestored: 500,
        checksumValid: true,
      };

      const result = validateDrillResults(results);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'restoreDuration must be a non-negative number'
      );
    });

    it('should reject invalid integrityCheckPassed type', () => {
      const results = {
        restoreDuration: 120,
        integrityCheckPassed: 'true' as unknown as boolean,
        dataLossDetected: false,
        itemsRestored: 500,
        checksumValid: true,
      };

      const result = validateDrillResults(results);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('integrityCheckPassed must be a boolean');
    });

    it('should reject invalid dataLossDetected type', () => {
      const results = {
        restoreDuration: 120,
        integrityCheckPassed: true,
        dataLossDetected: 'false' as unknown as boolean,
        itemsRestored: 500,
        checksumValid: true,
      };

      const result = validateDrillResults(results);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('dataLossDetected must be a boolean');
    });

    it('should reject negative itemsRestored', () => {
      const results = {
        restoreDuration: 120,
        integrityCheckPassed: true,
        dataLossDetected: false,
        itemsRestored: -1,
        checksumValid: true,
      };

      const result = validateDrillResults(results);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'itemsRestored must be a non-negative number'
      );
    });

    it('should reject invalid checksumValid type', () => {
      const results = {
        restoreDuration: 120,
        integrityCheckPassed: true,
        dataLossDetected: false,
        itemsRestored: 500,
        checksumValid: 'true' as unknown as boolean,
      };

      const result = validateDrillResults(results);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('checksumValid must be a boolean');
    });

    it('should reject invalid warnings type', () => {
      const results = {
        restoreDuration: 120,
        integrityCheckPassed: true,
        dataLossDetected: false,
        itemsRestored: 500,
        checksumValid: true,
        warnings: 'invalid' as unknown as string[],
      };

      const result = validateDrillResults(results);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('warnings must be an array');
    });

    it('should reject invalid errors type', () => {
      const results = {
        restoreDuration: 120,
        integrityCheckPassed: true,
        dataLossDetected: false,
        itemsRestored: 500,
        checksumValid: true,
        errors: 'invalid' as unknown as string[],
      };

      const result = validateDrillResults(results);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('errors must be an array');
    });
  });

  describe('validateBackupDrill', () => {
    it('should accept valid backup drill with all fields', () => {
      const drill = {
        id: 'drill-001',
        backupId: 'backup-full-20250119',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: 145,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: '2025-01-19T02:02:25.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept valid backup drill with optional fields', () => {
      const drill = {
        id: 'drill-002',
        backupId: 'backup-full-20250118',
        drillType: DrillType.INTEGRITY_CHECK,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-18T02:00:00.000Z',
        duration: 23,
        results: {
          restoreDuration: 0,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 0,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: '2025-01-18T02:00:23.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject drill with empty id', () => {
      const drill = {
        id: '',
        backupId: 'backup-full-20250119',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: 145,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: '2025-01-19T02:02:25.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('id must be a non-empty string');
    });

    it('should reject drill with empty backupId', () => {
      const drill = {
        id: 'drill-001',
        backupId: '',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: 145,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: '2025-01-19T02:02:25.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('backupId must be a non-empty string');
    });

    it('should reject drill with invalid drillType', () => {
      const drill = {
        id: 'drill-001',
        backupId: 'backup-full-20250119',
        drillType: 'invalid' as DrillType,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: 145,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: '2025-01-19T02:02:25.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid drill type'))).toBe(
        true
      );
    });

    it('should reject drill with invalid status', () => {
      const drill = {
        id: 'drill-001',
        backupId: 'backup-full-20250119',
        drillType: DrillType.FULL_RESTORE,
        status: 'invalid' as DrillStatus,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: 145,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: '2025-01-19T02:02:25.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid drill status'))).toBe(
        true
      );
    });

    it('should reject drill with invalid timestamp', () => {
      const drill = {
        id: 'drill-001',
        backupId: 'backup-full-20250119',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.PASSED,
        timestamp: 'invalid-date',
        duration: 145,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: '2025-01-19T02:02:25.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'timestamp must be a valid ISO 8601 date string'
      );
    });

    it('should reject drill with negative duration', () => {
      const drill = {
        id: 'drill-001',
        backupId: 'backup-full-20250119',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: -1,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: '2025-01-19T02:02:25.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('duration must be a non-negative number');
    });

    it('should reject drill with invalid results', () => {
      const drill = {
        id: 'drill-001',
        backupId: 'backup-full-20250119',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: 145,
        results: {
          restoreDuration: -1,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: '2025-01-19T02:02:25.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.startsWith('results:'))).toBe(true);
    });

    it('should reject drill with invalid completedAt', () => {
      const drill = {
        id: 'drill-001',
        backupId: 'backup-full-20250119',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: 145,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: 'invalid-date',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'completedAt must be a valid ISO 8601 date string'
      );
    });

    it('should reject drill where completedAt is before timestamp', () => {
      const drill = {
        id: 'drill-001',
        backupId: 'backup-full-20250119',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: 145,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: true,
        completedAt: '2025-01-19T01:00:00.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'completedAt must be after or equal to timestamp'
      );
    });

    it('should reject drill with invalid remediationAttempted', () => {
      const drill = {
        id: 'drill-001',
        backupId: 'backup-full-20250119',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: 145,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: 'false' as unknown as boolean,
        notificationSent: true,
        completedAt: '2025-01-19T02:02:25.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('remediationAttempted must be a boolean');
    });

    it('should reject drill with invalid notificationSent', () => {
      const drill = {
        id: 'drill-001',
        backupId: 'backup-full-20250119',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.PASSED,
        timestamp: '2025-01-19T02:00:00.000Z',
        duration: 145,
        results: {
          restoreDuration: 138,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 1247,
          checksumValid: true,
        },
        remediationAttempted: false,
        notificationSent: 'true' as unknown as boolean,
        completedAt: '2025-01-19T02:02:25.000Z',
      };

      const result = validateBackupDrill(drill);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('notificationSent must be a boolean');
    });
  });

  describe('validateDrillScheduleDetails', () => {
    it('should accept valid drill schedule details', () => {
      const schedule = {
        drillId: 'drill-sched-001',
        drillType: DrillType.INTEGRITY_CHECK,
        backupId: 'auto-backup',
        scheduledFor: '2025-01-20T02:00:00.000Z',
        recurrence: DrillSchedule.DAILY,
        enabled: true,
      };

      const result = validateDrillScheduleDetails(schedule);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject schedule with empty drillId', () => {
      const schedule = {
        drillId: '',
        drillType: DrillType.INTEGRITY_CHECK,
        backupId: 'auto-backup',
        scheduledFor: '2025-01-20T02:00:00.000Z',
        recurrence: DrillSchedule.DAILY,
        enabled: true,
      };

      const result = validateDrillScheduleDetails(schedule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('drillId must be a non-empty string');
    });

    it('should reject schedule with invalid drillType', () => {
      const schedule = {
        drillId: 'drill-sched-001',
        drillType: 'invalid' as DrillType,
        backupId: 'auto-backup',
        scheduledFor: '2025-01-20T02:00:00.000Z',
        recurrence: DrillSchedule.DAILY,
        enabled: true,
      };

      const result = validateDrillScheduleDetails(schedule);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid drill type'))).toBe(
        true
      );
    });

    it('should reject schedule with empty backupId', () => {
      const schedule = {
        drillId: 'drill-sched-001',
        drillType: DrillType.INTEGRITY_CHECK,
        backupId: '',
        scheduledFor: '2025-01-20T02:00:00.000Z',
        recurrence: DrillSchedule.DAILY,
        enabled: true,
      };

      const result = validateDrillScheduleDetails(schedule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('backupId must be a non-empty string');
    });

    it('should reject schedule with invalid scheduledFor', () => {
      const schedule = {
        drillId: 'drill-sched-001',
        drillType: DrillType.INTEGRITY_CHECK,
        backupId: 'auto-backup',
        scheduledFor: 'invalid-date',
        recurrence: DrillSchedule.DAILY,
        enabled: true,
      };

      const result = validateDrillScheduleDetails(schedule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'scheduledFor must be a valid ISO 8601 date string'
      );
    });

    it('should reject schedule with invalid recurrence', () => {
      const schedule = {
        drillId: 'drill-sched-001',
        drillType: DrillType.INTEGRITY_CHECK,
        backupId: 'auto-backup',
        scheduledFor: '2025-01-20T02:00:00.000Z',
        recurrence: 'invalid' as DrillSchedule,
        enabled: true,
      };

      const result = validateDrillScheduleDetails(schedule);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid drill schedule'))).toBe(
        true
      );
    });

    it('should reject schedule with invalid enabled', () => {
      const schedule = {
        drillId: 'drill-sched-001',
        drillType: DrillType.INTEGRITY_CHECK,
        backupId: 'auto-backup',
        scheduledFor: '2025-01-20T02:00:00.000Z',
        recurrence: DrillSchedule.DAILY,
        enabled: 'true' as unknown as boolean,
      };

      const result = validateDrillScheduleDetails(schedule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('enabled must be a boolean');
    });
  });

  describe('validateBackupDrills', () => {
    it('should accept valid array of backup drills', () => {
      const drills = [
        {
          id: 'drill-001',
          backupId: 'backup-full-20250119',
          drillType: DrillType.FULL_RESTORE,
          status: DrillStatus.PASSED,
          timestamp: '2025-01-19T02:00:00.000Z',
          duration: 145,
          remediationAttempted: false,
          notificationSent: true,
          completedAt: '2025-01-19T02:02:25.000Z',
        },
        {
          id: 'drill-002',
          backupId: 'backup-full-20250118',
          drillType: DrillType.INTEGRITY_CHECK,
          status: DrillStatus.PASSED,
          timestamp: '2025-01-18T02:00:00.000Z',
          duration: 23,
          remediationAttempted: false,
          notificationSent: true,
          completedAt: '2025-01-18T02:00:23.000Z',
        },
      ];

      const result = validateBackupDrills(drills);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate drill IDs', () => {
      const drills = [
        {
          id: 'drill-001',
          backupId: 'backup-full-20250119',
          drillType: DrillType.FULL_RESTORE,
          status: DrillStatus.PASSED,
          timestamp: '2025-01-19T02:00:00.000Z',
          duration: 145,
          remediationAttempted: false,
          notificationSent: true,
          completedAt: '2025-01-19T02:02:25.000Z',
        },
        {
          id: 'drill-001',
          backupId: 'backup-full-20250118',
          drillType: DrillType.INTEGRITY_CHECK,
          status: DrillStatus.PASSED,
          timestamp: '2025-01-18T02:00:00.000Z',
          duration: 23,
          remediationAttempted: false,
          notificationSent: true,
          completedAt: '2025-01-18T02:00:23.000Z',
        },
      ];

      const result = validateBackupDrills(drills);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate drill ID'))).toBe(true);
    });

    it('should validate all drills in array', () => {
      const drills = [
        {
          id: 'drill-001',
          backupId: 'backup-full-20250119',
          drillType: DrillType.FULL_RESTORE,
          status: DrillStatus.PASSED,
          timestamp: '2025-01-19T02:00:00.000Z',
          duration: 145,
          remediationAttempted: false,
          notificationSent: true,
          completedAt: '2025-01-19T02:02:25.000Z',
        },
        {
          id: 'drill-002',
          backupId: '',
          drillType: DrillType.INTEGRITY_CHECK,
          status: DrillStatus.PASSED,
          timestamp: '2025-01-18T02:00:00.000Z',
          duration: 23,
          remediationAttempted: false,
          notificationSent: true,
          completedAt: '2025-01-18T02:00:23.000Z',
        },
      ];

      const result = validateBackupDrills(drills);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(e => e.includes('backupId must be a non-empty string'))
      ).toBe(true);
    });
  });

  describe('validateDrillSchedules', () => {
    it('should accept valid array of drill schedules', () => {
      const schedules = [
        {
          drillId: 'drill-sched-001',
          drillType: DrillType.INTEGRITY_CHECK,
          backupId: 'auto-backup',
          scheduledFor: '2025-01-20T02:00:00.000Z',
          recurrence: DrillSchedule.DAILY,
          enabled: true,
        },
        {
          drillId: 'drill-sched-002',
          drillType: DrillType.PARTIAL_RESTORE,
          backupId: 'auto-backup',
          scheduledFor: '2025-01-19T03:00:00.000Z',
          recurrence: DrillSchedule.WEEKLY,
          enabled: true,
        },
      ];

      const result = validateDrillSchedules(schedules);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate schedule IDs', () => {
      const schedules = [
        {
          drillId: 'drill-sched-001',
          drillType: DrillType.INTEGRITY_CHECK,
          backupId: 'auto-backup',
          scheduledFor: '2025-01-20T02:00:00.000Z',
          recurrence: DrillSchedule.DAILY,
          enabled: true,
        },
        {
          drillId: 'drill-sched-001',
          drillType: DrillType.PARTIAL_RESTORE,
          backupId: 'auto-backup',
          scheduledFor: '2025-01-19T03:00:00.000Z',
          recurrence: DrillSchedule.WEEKLY,
          enabled: true,
        },
      ];

      const result = validateDrillSchedules(schedules);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(e => e.includes('Duplicate schedule ID'))
      ).toBe(true);
    });

    it('should validate all schedules in array', () => {
      const schedules = [
        {
          drillId: 'drill-sched-001',
          drillType: DrillType.INTEGRITY_CHECK,
          backupId: 'auto-backup',
          scheduledFor: '2025-01-20T02:00:00.000Z',
          recurrence: DrillSchedule.DAILY,
          enabled: true,
        },
        {
          drillId: 'drill-sched-002',
          drillType: DrillType.PARTIAL_RESTORE,
          backupId: '',
          scheduledFor: '2025-01-19T03:00:00.000Z',
          recurrence: DrillSchedule.WEEKLY,
          enabled: true,
        },
      ];

      const result = validateDrillSchedules(schedules);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(e => e.includes('backupId must be a non-empty string'))
      ).toBe(true);
    });
  });
});
