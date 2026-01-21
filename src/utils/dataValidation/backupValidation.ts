import type { ValidationResult } from './baseValidation';
import { validateDataArray } from './baseValidation';

function validateISO8601Date(value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, errors: ['Date must be a string'] };
  }
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!iso8601Regex.test(value)) {
    return { isValid: false, errors: ['Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)'] };
  }
  try {
    new Date(value);
    return { isValid: true, errors: [] };
  } catch {
    return { isValid: false, errors: ['Invalid date format'] };
  }
}
import type {
  BackupMetadata,
  DisasterRecoveryPlan,
  RestoreStep,
  EmergencyContact,
  ValidationChecklist,
  BackupType,
  BackupStatus,
  BackupEncryption,
} from '@/types/backup';
import type { DataRelationship, RelationshipType } from '@/types/data';

const BACKUP_TYPES = ['full', 'incremental'] as const;
const BACKUP_STATUSES = ['pending', 'in_progress', 'completed', 'failed'] as const;
const BACKUP_ENCRYPTIONS = ['AES-256', 'none'] as const;
const RELATIONSHIP_TYPES = ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'] as const;

const VALID_COLLECTIONS = [
  'BlogCommentData',
  'InnerBlogData',
  'BlogTagData',
  'BlogCategoryData',
  'CampaignData',
  'EmailTemplateData',
] as const;

export function validateBackupType(value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, errors: ['Backup type must be a string'] };
  }
  if (!BACKUP_TYPES.includes(value as BackupType)) {
    return { isValid: false, errors: [`Invalid backup type: '${value}'. Must be one of: ${BACKUP_TYPES.join(', ')}`] };
  }
  return { isValid: true, errors: [] };
}

export function validateBackupStatus(value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, errors: ['Backup status must be a string'] };
  }
  if (!BACKUP_STATUSES.includes(value as BackupStatus)) {
    return { isValid: false, errors: [`Invalid backup status: '${value}'. Must be one of: ${BACKUP_STATUSES.join(', ')}`] };
  }
  return { isValid: true, errors: [] };
}

export function validateBackupEncryption(value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, errors: ['Backup encryption must be a string'] };
  }
  if (!BACKUP_ENCRYPTIONS.includes(value as BackupEncryption)) {
    return { isValid: false, errors: [`Invalid backup encryption: '${value}'. Must be one of: ${BACKUP_ENCRYPTIONS.join(', ')}`] };
  }
  return { isValid: true, errors: [] };
}

export function validateBackupMetadata(item: unknown): ValidationResult {
  if (typeof item !== 'object' || item === null) {
    return { isValid: false, errors: ['Backup metadata must be an object'] };
  }

  const data = item as BackupMetadata;
  const errors: string[] = [];

  if (typeof data.id !== 'string' || data.id.trim().length === 0) {
    errors.push('Backup ID must be a non-empty string');
  }

  const timestampResult = validateISO8601Date(data.timestamp);
  if (!timestampResult.isValid) {
    errors.push(...timestampResult.errors.map(e => `Timestamp: ${e}`));
  }

  const typeResult = validateBackupType(data.type);
  if (!typeResult.isValid) {
    errors.push(...typeResult.errors.map(e => `Type: ${e}`));
  }

  if (typeof data.size !== 'number' || data.size < 0) {
    errors.push('Backup size must be a non-negative number');
  }

  if (typeof data.checksum !== 'string' || data.checksum.length !== 64) {
    errors.push('Backup checksum must be a 64-character string (SHA-256)');
  }

  const encryptionResult = validateBackupEncryption(data.encryption);
  if (!encryptionResult.isValid) {
    errors.push(...encryptionResult.errors.map(e => `Encryption: ${e}`));
  }

  if (typeof data.retention !== 'string' || data.retention.trim().length === 0) {
    errors.push('Backup retention must be a non-empty string');
  }

  const statusResult = validateBackupStatus(data.status);
  if (!statusResult.isValid) {
    errors.push(...statusResult.errors.map(e => `Status: ${e}`));
  }

  if (data.errorMessage !== undefined && typeof data.errorMessage !== 'string') {
    errors.push('Error message must be a string when provided');
  }

  if (typeof data.version !== 'string' || data.version.trim().length === 0) {
    errors.push('Backup version must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateBackupMetadataArray(items: unknown): ValidationResult {
  if (!Array.isArray(items)) {
    return { isValid: false, errors: ['Backup metadata must be an array'] };
  }
  return validateDataArray(items, validateBackupMetadata);
}

export function validateRestoreStep(item: unknown): ValidationResult {
  if (typeof item !== 'object' || item === null) {
    return { isValid: false, errors: ['Restore step must be an object'] };
  }

  const data = item as RestoreStep;
  const errors: string[] = [];

  if (typeof data.step !== 'number' || data.step < 1) {
    errors.push('Step number must be a positive integer');
  }

  if (typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Restore step title must be a non-empty string');
  }

  if (typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push('Restore step description must be a non-empty string');
  }

  if (typeof data.estimatedTime !== 'string' || data.estimatedTime.trim().length === 0) {
    errors.push('Estimated time must be a non-empty string');
  }

  if (!Array.isArray(data.dependencies)) {
    errors.push('Dependencies must be an array');
  } else if (data.dependencies.some(dep => typeof dep !== 'number' || dep < 0)) {
    errors.push('All dependencies must be non-negative integers');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateEmergencyContact(item: unknown): ValidationResult {
  if (typeof item !== 'object' || item === null) {
    return { isValid: false, errors: ['Emergency contact must be an object'] };
  }

  const data = item as EmergencyContact;
  const errors: string[] = [];

  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Contact name must be a non-empty string');
  }

  if (typeof data.role !== 'string' || data.role.trim().length === 0) {
    errors.push('Contact role must be a non-empty string');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof data.email !== 'string' || !emailRegex.test(data.email)) {
    errors.push('Contact email must be a valid email address');
  }

  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (typeof data.phone !== 'string' || !phoneRegex.test(data.phone)) {
    errors.push('Contact phone must be a valid phone number');
  }

  if (typeof data.priority !== 'number' || data.priority < 1 || data.priority > 5) {
    errors.push('Contact priority must be a number between 1 and 5');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateValidationChecklist(item: unknown): ValidationResult {
  if (typeof item !== 'object' || item === null) {
    return { isValid: false, errors: ['Validation checklist must be an object'] };
  }

  const data = item as ValidationChecklist;
  const errors: string[] = [];

  if (typeof data.dataIntegrity !== 'boolean') {
    errors.push('Data integrity must be a boolean');
  }

  if (typeof data.backupVerification !== 'boolean') {
    errors.push('Backup verification must be a boolean');
  }

  if (typeof data.rollbackPlan !== 'boolean') {
    errors.push('Rollback plan must be a boolean');
  }

  if (typeof data.notificationSent !== 'boolean') {
    errors.push('Notification sent must be a boolean');
  }

  if (typeof data.documented !== 'boolean') {
    errors.push('Documented must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateDisasterRecoveryPlan(item: unknown): ValidationResult {
  if (typeof item !== 'object' || item === null) {
    return { isValid: false, errors: ['Disaster recovery plan must be an object'] };
  }

  const data = item as DisasterRecoveryPlan;
  const errors: string[] = [];

  if (typeof data.rto !== 'string' || data.rto.trim().length === 0) {
    errors.push('RTO (Recovery Time Objective) must be a non-empty string');
  }

  if (typeof data.rpo !== 'string' || data.rpo.trim().length === 0) {
    errors.push('RPO (Recovery Point Objective) must be a non-empty string');
  }

  if (typeof data.backupStrategy !== 'string' || data.backupStrategy.trim().length === 0) {
    errors.push('Backup strategy must be a non-empty string');
  }

  if (!Array.isArray(data.restoreSteps)) {
    errors.push('Restore steps must be an array');
  } else if (data.restoreSteps.length === 0) {
    errors.push('Restore steps must contain at least one step');
  } else {
    data.restoreSteps.forEach((step, index) => {
      const stepResult = validateRestoreStep(step);
      if (!stepResult.isValid) {
        errors.push(`Restore step ${index + 1}: ${stepResult.errors.join(', ')}`);
      }
    });
  }

  if (!Array.isArray(data.contactInfo)) {
    errors.push('Contact info must be an array');
  } else if (data.contactInfo.length === 0) {
    errors.push('Contact info must contain at least one contact');
  } else {
    data.contactInfo.forEach((contact, index) => {
      const contactResult = validateEmergencyContact(contact);
      if (!contactResult.isValid) {
        errors.push(`Contact ${index + 1}: ${contactResult.errors.join(', ')}`);
      }
    });
  }

  const checklistResult = validateValidationChecklist(data.validationChecklist);
  if (!checklistResult.isValid) {
    errors.push(...checklistResult.errors.map(e => `Validation checklist: ${e}`));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRelationshipType(value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, errors: ['Relationship type must be a string'] };
  }
  if (!RELATIONSHIP_TYPES.includes(value as RelationshipType)) {
    return { isValid: false, errors: [`Invalid relationship type: '${value}'. Must be one of: ${RELATIONSHIP_TYPES.join(', ')}`] };
  }
  return { isValid: true, errors: [] };
}

export function validateCollectionName(value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, errors: ['Collection name must be a string'] };
  }
  if (!VALID_COLLECTIONS.includes(value as typeof VALID_COLLECTIONS[number])) {
    return { isValid: false, errors: [`Invalid collection name: '${value}'. Valid collections are: ${VALID_COLLECTIONS.join(', ')}`] };
  }
  return { isValid: true, errors: [] };
}

export function validateDataRelationship(item: unknown): ValidationResult {
  if (typeof item !== 'object' || item === null) {
    return { isValid: false, errors: ['Data relationship must be an object'] };
  }

  const data = item as DataRelationship;
  const errors: string[] = [];

  const sourceResult = validateCollectionName(data.sourceCollection);
  if (!sourceResult.isValid) {
    errors.push(`Source collection: ${sourceResult.errors.join(', ')}`);
  }

  const targetResult = validateCollectionName(data.targetCollection);
  if (!targetResult.isValid) {
    errors.push(`Target collection: ${targetResult.errors.join(', ')}`);
  }

  if (typeof data.sourceField !== 'string' || data.sourceField.trim().length === 0) {
    errors.push('Source field must be a non-empty string');
  }

  if (typeof data.targetField !== 'string' || data.targetField.trim().length === 0) {
    errors.push('Target field must be a non-empty string');
  }

  const typeResult = validateRelationshipType(data.type);
  if (!typeResult.isValid) {
    errors.push(`Relationship type: ${typeResult.errors.join(', ')}`);
  }

  if (data.optional !== undefined && typeof data.optional !== 'boolean') {
    errors.push('Optional must be a boolean when provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateDataRelationships(items: unknown): ValidationResult {
  if (!Array.isArray(items)) {
    return { isValid: false, errors: ['Data relationships must be an array'] };
  }

  const errors: string[] = [];

  items.forEach((item, index) => {
    const result = validateDataRelationship(item);
    if (!result.isValid) {
      errors.push(`Relationship ${index + 1}: ${result.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
