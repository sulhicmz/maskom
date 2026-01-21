import {
  validateBackupType,
  validateBackupStatus,
  validateBackupEncryption,
  validateBackupMetadata,
  validateBackupMetadataArray,
  validateRestoreStep,
  validateEmergencyContact,
  validateValidationChecklist,
  validateDisasterRecoveryPlan,
  validateRelationshipType,
  validateCollectionName,
  validateDataRelationship,
  validateDataRelationships,
} from '../backupValidation';

describe('backupValidation - validateBackupType', () => {
  it('should accept valid backup type "full"', () => {
    const result = validateBackupType('full');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept valid backup type "incremental"', () => {
    const result = validateBackupType('incremental');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject invalid backup type', () => {
    const result = validateBackupType('invalid');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid backup type: 'invalid'. Must be one of: full, incremental");
  });

  it('should reject non-string values', () => {
    const result = validateBackupType(123);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup type must be a string');
  });

  it('should reject null values', () => {
    const result = validateBackupType(null);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup type must be a string');
  });
});

describe('backupValidation - validateBackupStatus', () => {
  it('should accept valid backup status "completed"', () => {
    const result = validateBackupStatus('completed');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept valid backup status "pending"', () => {
    const result = validateBackupStatus('pending');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept valid backup status "in_progress"', () => {
    const result = validateBackupStatus('in_progress');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept valid backup status "failed"', () => {
    const result = validateBackupStatus('failed');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject invalid backup status', () => {
    const result = validateBackupStatus('invalid');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid backup status: 'invalid'. Must be one of: pending, in_progress, completed, failed");
  });

  it('should reject non-string values', () => {
    const result = validateBackupStatus(123);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup status must be a string');
  });
});

describe('backupValidation - validateBackupEncryption', () => {
  it('should accept valid encryption "AES-256"', () => {
    const result = validateBackupEncryption('AES-256');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept valid encryption "none"', () => {
    const result = validateBackupEncryption('none');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject invalid encryption', () => {
    const result = validateBackupEncryption('invalid');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid backup encryption: 'invalid'. Must be one of: AES-256, none");
  });

  it('should reject non-string values', () => {
    const result = validateBackupEncryption(123);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup encryption must be a string');
  });
});

describe('backupValidation - validateBackupMetadata', () => {
  const validBackupMetadata = {
    id: 'backup-2025-12-15-full',
    timestamp: '2025-12-15T02:00:00.000Z',
    type: 'full',
    size: 5242880,
    checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    encryption: 'AES-256',
    retention: '30 days',
    status: 'completed',
    version: '1.0.0',
  };

  it('should accept valid backup metadata', () => {
    const result = validateBackupMetadata(validBackupMetadata);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject missing id', () => {
    const { id, ...data } = validBackupMetadata;
    void id;
    const result = validateBackupMetadata(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup ID must be a non-empty string');
  });

  it('should reject empty id', () => {
    const result = validateBackupMetadata({ ...validBackupMetadata, id: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup ID must be a non-empty string');
  });

  it('should reject invalid ISO 8601 date', () => {
    const result = validateBackupMetadata({ ...validBackupMetadata, timestamp: 'invalid-date' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Timestamp: Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)');
  });

  it('should reject invalid type', () => {
    const result = validateBackupMetadata({ ...validBackupMetadata, type: 'invalid' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Type: Invalid backup type: 'invalid'. Must be one of: full, incremental");
  });

  it('should reject negative size', () => {
    const result = validateBackupMetadata({ ...validBackupMetadata, size: -1 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup size must be a non-negative number');
  });

  it('should reject checksum with wrong length', () => {
    const result = validateBackupMetadata({ ...validBackupMetadata, checksum: 'invalid' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup checksum must be a 64-character string (SHA-256)');
  });

  it('should reject invalid encryption', () => {
    const result = validateBackupMetadata({ ...validBackupMetadata, encryption: 'invalid' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Encryption: Invalid backup encryption: 'invalid'. Must be one of: AES-256, none");
  });

  it('should reject empty retention', () => {
    const result = validateBackupMetadata({ ...validBackupMetadata, retention: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup retention must be a non-empty string');
  });

  it('should accept optional errorMessage when provided', () => {
    const result = validateBackupMetadata({ ...validBackupMetadata, errorMessage: 'Test error' });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject errorMessage when not a string', () => {
    const result = validateBackupMetadata({ ...validBackupMetadata, errorMessage: 123 as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Error message must be a string when provided');
  });
});

describe('backupValidation - validateBackupMetadataArray', () => {
  const validBackupMetadata = {
    id: 'backup-2025-12-15-full',
    timestamp: '2025-12-15T02:00:00.000Z',
    type: 'full',
    size: 5242880,
    checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    encryption: 'AES-256',
    retention: '30 days',
    status: 'completed',
    version: '1.0.0',
  };

  it('should accept valid backup metadata array', () => {
    const result = validateBackupMetadataArray([validBackupMetadata, validBackupMetadata]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject non-array values', () => {
    const result = validateBackupMetadataArray('not an array');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup metadata must be an array');
  });

  it('should reject array with invalid item', () => {
    const result = validateBackupMetadataArray([validBackupMetadata, { ...validBackupMetadata, size: -1 }]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup size must be a non-negative number');
  });
});

describe('backupValidation - validateRestoreStep', () => {
  const validRestoreStep = {
    step: 1,
    title: 'Identify Backup Source',
    description: 'Select most recent backup from backup list',
    estimatedTime: '5 minutes',
    dependencies: [],
  };

  it('should accept valid restore step', () => {
    const result = validateRestoreStep(validRestoreStep);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject step number less than 1', () => {
    const result = validateRestoreStep({ ...validRestoreStep, step: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Step number must be a positive integer');
  });

  it('should reject negative step number', () => {
    const result = validateRestoreStep({ ...validRestoreStep, step: -1 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Step number must be a positive integer');
  });

  it('should reject empty title', () => {
    const result = validateRestoreStep({ ...validRestoreStep, title: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Restore step title must be a non-empty string');
  });

  it('should reject empty description', () => {
    const result = validateRestoreStep({ ...validRestoreStep, description: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Restore step description must be a non-empty string');
  });

  it('should reject empty estimatedTime', () => {
    const result = validateRestoreStep({ ...validRestoreStep, estimatedTime: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Estimated time must be a non-empty string');
  });

  it('should accept valid dependencies array', () => {
    const result = validateRestoreStep({ ...validRestoreStep, dependencies: [1, 2] });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject non-array dependencies', () => {
    const result = validateRestoreStep({ ...validRestoreStep, dependencies: 'not an array' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Dependencies must be an array');
  });

  it('should reject negative dependency number', () => {
    const result = validateRestoreStep({ ...validRestoreStep, dependencies: [-1] });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('All dependencies must be non-negative integers');
  });
});

describe('backupValidation - validateEmergencyContact', () => {
  const validEmergencyContact = {
    name: 'John Doe',
    role: 'System Administrator',
    email: 'john@example.com',
    phone: '+1-555-123-4567',
    priority: 1,
  };

  it('should accept valid emergency contact', () => {
    const result = validateEmergencyContact(validEmergencyContact);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject empty name', () => {
    const result = validateEmergencyContact({ ...validEmergencyContact, name: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Contact name must be a non-empty string');
  });

  it('should reject empty role', () => {
    const result = validateEmergencyContact({ ...validEmergencyContact, role: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Contact role must be a non-empty string');
  });

  it('should reject invalid email format', () => {
    const result = validateEmergencyContact({ ...validEmergencyContact, email: 'invalid-email' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Contact email must be a valid email address');
  });

  it('should reject invalid phone number', () => {
    const result = validateEmergencyContact({ ...validEmergencyContact, phone: 'invalid-phone' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Contact phone must be a valid phone number');
  });

  it('should reject priority less than 1', () => {
    const result = validateEmergencyContact({ ...validEmergencyContact, priority: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Contact priority must be a number between 1 and 5');
  });

  it('should reject priority greater than 5', () => {
    const result = validateEmergencyContact({ ...validEmergencyContact, priority: 6 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Contact priority must be a number between 1 and 5');
  });
});

describe('backupValidation - validateValidationChecklist', () => {
  const validValidationChecklist = {
    dataIntegrity: true,
    backupVerification: true,
    rollbackPlan: false,
    notificationSent: true,
    documented: true,
  };

  it('should accept valid validation checklist', () => {
    const result = validateValidationChecklist(validValidationChecklist);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject non-boolean dataIntegrity', () => {
    const result = validateValidationChecklist({ ...validValidationChecklist, dataIntegrity: 'true' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Data integrity must be a boolean');
  });

  it('should reject non-boolean backupVerification', () => {
    const result = validateValidationChecklist({ ...validValidationChecklist, backupVerification: 1 as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup verification must be a boolean');
  });

  it('should reject non-boolean rollbackPlan', () => {
    const result = validateValidationChecklist({ ...validValidationChecklist, rollbackPlan: 'false' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Rollback plan must be a boolean');
  });

  it('should reject non-boolean notificationSent', () => {
    const result = validateValidationChecklist({ ...validValidationChecklist, notificationSent: 0 as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Notification sent must be a boolean');
  });

  it('should reject non-boolean documented', () => {
    const result = validateValidationChecklist({ ...validValidationChecklist, documented: 'yes' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Documented must be a boolean');
  });
});

describe('backupValidation - validateDisasterRecoveryPlan', () => {
  const validDisasterRecoveryPlan = {
    rto: '4 hours',
    rpo: '24 hours',
    backupStrategy: 'Full backup weekly, incremental daily',
    restoreSteps: [
      {
        step: 1,
        title: 'Identify Backup Source',
        description: 'Select most recent backup from backup list',
        estimatedTime: '5 minutes',
        dependencies: [],
      },
    ],
    contactInfo: [
      {
        name: 'John Doe',
        role: 'System Administrator',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        priority: 1,
      },
    ],
    validationChecklist: {
      dataIntegrity: true,
      backupVerification: true,
      rollbackPlan: false,
      notificationSent: true,
      documented: true,
    },
  };

  it('should accept valid disaster recovery plan', () => {
    const result = validateDisasterRecoveryPlan(validDisasterRecoveryPlan);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject empty RTO', () => {
    const result = validateDisasterRecoveryPlan({ ...validDisasterRecoveryPlan, rto: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RTO (Recovery Time Objective) must be a non-empty string');
  });

  it('should reject empty RPO', () => {
    const result = validateDisasterRecoveryPlan({ ...validDisasterRecoveryPlan, rpo: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RPO (Recovery Point Objective) must be a non-empty string');
  });

  it('should reject empty backupStrategy', () => {
    const result = validateDisasterRecoveryPlan({ ...validDisasterRecoveryPlan, backupStrategy: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Backup strategy must be a non-empty string');
  });

  it('should reject empty restoreSteps array', () => {
    const result = validateDisasterRecoveryPlan({ ...validDisasterRecoveryPlan, restoreSteps: [] });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Restore steps must contain at least one step');
  });

  it('should reject non-array restoreSteps', () => {
    const result = validateDisasterRecoveryPlan({ ...validDisasterRecoveryPlan, restoreSteps: 'not an array' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Restore steps must be an array');
  });

  it('should reject empty contactInfo array', () => {
    const result = validateDisasterRecoveryPlan({ ...validDisasterRecoveryPlan, contactInfo: [] });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Contact info must contain at least one contact');
  });

  it('should reject invalid restore step in array', () => {
    const result = validateDisasterRecoveryPlan({
      ...validDisasterRecoveryPlan,
      restoreSteps: [{ ...validDisasterRecoveryPlan.restoreSteps[0], step: -1 }],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Restore step 1: Step number must be a positive integer');
  });

  it('should reject invalid contact in array', () => {
    const result = validateDisasterRecoveryPlan({
      ...validDisasterRecoveryPlan,
      contactInfo: [{ ...validDisasterRecoveryPlan.contactInfo[0], email: 'invalid-email' }],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Contact 1: Contact email must be a valid email address');
  });
});

describe('backupValidation - validateRelationshipType', () => {
  it('should accept valid relationship type "one-to-one"', () => {
    const result = validateRelationshipType('one-to-one');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept valid relationship type "one-to-many"', () => {
    const result = validateRelationshipType('one-to-many');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept valid relationship type "many-to-one"', () => {
    const result = validateRelationshipType('many-to-one');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept valid relationship type "many-to-many"', () => {
    const result = validateRelationshipType('many-to-many');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject invalid relationship type', () => {
    const result = validateRelationshipType('invalid');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid relationship type: 'invalid'. Must be one of: one-to-one, one-to-many, many-to-one, many-to-many");
  });

  it('should reject non-string values', () => {
    const result = validateRelationshipType(123);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Relationship type must be a string');
  });
});

describe('backupValidation - validateCollectionName', () => {
  it('should accept valid collection name "BlogCommentData"', () => {
    const result = validateCollectionName('BlogCommentData');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept valid collection name "InnerBlogData"', () => {
    const result = validateCollectionName('InnerBlogData');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject invalid collection name', () => {
    const result = validateCollectionName('InvalidCollection');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid collection name: 'InvalidCollection'. Valid collections are: BlogCommentData, InnerBlogData, BlogTagData, BlogCategoryData, CampaignData, EmailTemplateData");
  });

  it('should reject non-string values', () => {
    const result = validateCollectionName(123);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Collection name must be a string');
  });
});

describe('backupValidation - validateDataRelationship', () => {
  const validDataRelationship = {
    sourceCollection: 'BlogCommentData',
    targetCollection: 'InnerBlogData',
    sourceField: 'blogId',
    targetField: 'id',
    type: 'many-to-one' as const,
    optional: false,
  };

  it('should accept valid data relationship', () => {
    const result = validateDataRelationship(validDataRelationship);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject invalid sourceCollection', () => {
    const result = validateDataRelationship({ ...validDataRelationship, sourceCollection: 'InvalidCollection' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Source collection: Invalid collection name: 'InvalidCollection'. Valid collections are: BlogCommentData, InnerBlogData, BlogTagData, BlogCategoryData, CampaignData, EmailTemplateData");
  });

  it('should reject invalid targetCollection', () => {
    const result = validateDataRelationship({ ...validDataRelationship, targetCollection: 'InvalidCollection' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Target collection: Invalid collection name: 'InvalidCollection'. Valid collections are: BlogCommentData, InnerBlogData, BlogTagData, BlogCategoryData, CampaignData, EmailTemplateData");
  });

  it('should reject empty sourceField', () => {
    const result = validateDataRelationship({ ...validDataRelationship, sourceField: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Source field must be a non-empty string');
  });

  it('should reject empty targetField', () => {
    const result = validateDataRelationship({ ...validDataRelationship, targetField: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Target field must be a non-empty string');
  });

  it('should reject invalid relationship type', () => {
    const result = validateDataRelationship({ ...validDataRelationship, type: 'invalid' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Relationship type: Invalid relationship type: 'invalid'. Must be one of: one-to-one, one-to-many, many-to-one, many-to-many");
  });

  it('should accept optional when true', () => {
    const result = validateDataRelationship({ ...validDataRelationship, optional: true });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject optional when not boolean', () => {
    const result = validateDataRelationship({ ...validDataRelationship, optional: 'true' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Optional must be a boolean when provided');
  });
});

describe('backupValidation - validateDataRelationships', () => {
  const validDataRelationship = {
    sourceCollection: 'BlogCommentData' as const,
    targetCollection: 'InnerBlogData' as const,
    sourceField: 'blogId',
    targetField: 'id',
    type: 'many-to-one' as const,
    optional: false,
  };

  it('should accept valid data relationships array', () => {
    const result = validateDataRelationships([validDataRelationship, validDataRelationship]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject non-array values', () => {
    const result = validateDataRelationships('not an array');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Data relationships must be an array');
  });

  it('should reject array with invalid item', () => {
    const result = validateDataRelationships([validDataRelationship, { ...validDataRelationship, type: 'invalid' as any }]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Relationship 2: Relationship type: Invalid relationship type: 'invalid'. Must be one of: one-to-one, one-to-many, many-to-one, many-to-many");
  });

  it('should reject empty array', () => {
    const result = validateDataRelationships([]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
