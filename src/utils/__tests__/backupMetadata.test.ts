import {
  generateBackupId,
  calculateChecksum,
  getBackupMetadataById,
  calculateRetentionCompliance
} from '../backupMetadata';
import { BackupMetadata } from '@/types/backup';

describe('generateBackupId', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-21T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should generate backup ID for full backup type', () => {
    const id = generateBackupId('full');

    expect(id).toMatch(/^backup-\d{4}-\d{2}-\d{2}-full-[a-z0-9]{6}$/);
    expect(id).toContain('backup-2026-01-21-full-');
  });

  it('should generate backup ID for incremental backup type', () => {
    const id = generateBackupId('incremental');

    expect(id).toMatch(/^backup-\d{4}-\d{2}-\d{2}-incremental-[a-z0-9]{6}$/);
    expect(id).toContain('backup-2026-01-21-incremental-');
  });

  it('should generate unique IDs on successive calls', () => {
    const id1 = generateBackupId('full');
    const id2 = generateBackupId('full');

    expect(id1).not.toBe(id2);
  });

  it('should handle different backup types', () => {
    const fullId = generateBackupId('full');
    const incrementalId = generateBackupId('incremental');

    expect(fullId).toContain('-full-');
    expect(incrementalId).toContain('-incremental-');
  });

  it('should include random component', () => {
    const id = generateBackupId('full');
    const parts = id.split('-');

    expect(parts.length).toBeGreaterThanOrEqual(4);
    expect(parts[parts.length - 1]).toMatch(/^[a-z0-9]{6}$/);
  });

  it('should use ISO date format', () => {
    const id = generateBackupId('full');

    expect(id).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

describe('calculateChecksum', () => {
  it('should return consistent checksum for same input', () => {
    const data = 'test data string';
    const hash1 = calculateChecksum(data);
    const hash2 = calculateChecksum(data);

    expect(hash1).toBe(hash2);
  });

  it('should return different checksums for different inputs', () => {
    const hash1 = calculateChecksum('data1');
    const hash2 = calculateChecksum('data2');

    expect(hash1).not.toBe(hash2);
  });

  it('should return 32-character hex string', () => {
    const data = 'test data';
    const hash = calculateChecksum(data);

    expect(hash).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should handle empty string', () => {
    const hash = calculateChecksum('');

    expect(hash).toMatch(/^[0-9a-f]{32}$/);
    expect(hash).not.toBe('');
  });

  it('should handle special characters', () => {
    const data = 'Hello @#$% World! 🌍';
    const hash = calculateChecksum(data);

    expect(hash).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should handle large input', () => {
    const data = 'x'.repeat(10000);
    const hash = calculateChecksum(data);

    expect(hash).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should handle unicode characters', () => {
    const data = '测试 中文 테스트';
    const hash = calculateChecksum(data);

    expect(hash).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should handle numeric string', () => {
    const data = '1234567890';
    const hash = calculateChecksum(data);

    expect(hash).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should handle whitespace', () => {
    const data1 = 'test data';
    const data2 = 'test data ';
    const hash1 = calculateChecksum(data1);
    const hash2 = calculateChecksum(data2);

    expect(hash1).not.toBe(hash2);
  });

  it('should handle JSON string', () => {
    const data = JSON.stringify({ key: 'value', nested: { prop: 123 } });
    const hash = calculateChecksum(data);

    expect(hash).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should handle newlines and tabs', () => {
    const data = 'line1\nline2\ttabbed';
    const hash = calculateChecksum(data);

    expect(hash).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe('getBackupMetadataById', () => {
  const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    const getItem = (key: string) => store[key] || null;
    const setItem = (key: string, value: string) => { store[key] = value; };

    return {
      getItem: jest.fn(getItem),
      setItem: jest.fn(setItem),
      reset: jest.fn(() => {
        store = {};
        mockLocalStorage.getItem.mockClear();
        mockLocalStorage.setItem.mockClear();
      })
    };
  })();

  beforeEach(() => {
    mockLocalStorage.reset();
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  afterEach(() => {
    delete (global as any).localStorage;
  });

  it('should return null in server environment', async () => {
    delete (global as any).window;

    const result = await getBackupMetadataById('backup-1');

    expect(result).toBeNull();
  });

  it('should return null when no metadata stored', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const result = await getBackupMetadataById('backup-1');

    expect(result).toBeNull();
  });

  it('should return null when metadata not found', async () => {
    const metadataList: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-21T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'abc123'
      }
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(metadataList));

    const result = await getBackupMetadataById('backup-nonexistent');

    expect(result).toBeNull();
  });

  it('should return metadata when found', async () => {
    const metadataList: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-21T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'abc123'
      },
      {
        id: 'backup-2',
        type: 'incremental',
        size: 512,
        timestamp: '2026-01-21T13:00:00Z',
        status: 'completed',
        retention: '7 days',
        checksum: 'def456'
      }
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(metadataList));

    const result = await getBackupMetadataById('backup-2');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('backup-2');
    expect(result?.type).toBe('incremental');
  });

  it('should return first matching metadata', async () => {
    const metadataList: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-21T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'abc123'
      },
      {
        id: 'backup-2',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-21T13:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'def456'
      }
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(metadataList));

    const result = await getBackupMetadataById('backup-1');

    expect(result?.id).toBe('backup-1');
  });

  it('should handle corrupted localStorage data', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json');

    const result = await getBackupMetadataById('backup-1');

    expect(result).toBeNull();
  });

  it('should handle localStorage errors', async () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const result = await getBackupMetadataById('backup-1');

    expect(result).toBeNull();
  });
});

describe('calculateRetentionCompliance', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-21T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return 100% for empty backup list', () => {
    const backups: BackupMetadata[] = [];

    const compliance = calculateRetentionCompliance(backups);

    expect(compliance).toBe(100);
  });

  it('should calculate 100% compliance for all valid backups', () => {
    const backups: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-20T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'abc123'
      },
      {
        id: 'backup-2',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-19T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'def456'
      }
    ];

    const compliance = calculateRetentionCompliance(backups);

    expect(compliance).toBe(100);
  });

  it('should calculate compliance for mixed valid and expired backups', () => {
    const backups: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-20T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'abc123'
      },
      {
        id: 'backup-2',
        type: 'full',
        size: 1024,
        timestamp: '2025-12-01T12:00:00Z',
        status: 'completed',
        retention: '7 days',
        checksum: 'def456'
      }
    ];

    const compliance = calculateRetentionCompliance(backups);

    expect(compliance).toBe(50);
  });

  it('should return 0% for all expired backups', () => {
    const backups: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2025-01-01T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'abc123'
      },
      {
        id: 'backup-2',
        type: 'full',
        size: 1024,
        timestamp: '2025-12-01T12:00:00Z',
        status: 'completed',
        retention: '7 days',
        checksum: 'def456'
      }
    ];

    const compliance = calculateRetentionCompliance(backups);

    expect(compliance).toBe(0);
  });

  it('should handle 7 day retention', () => {
    const backups: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-20T12:00:00Z',
        status: 'completed',
        retention: '7 days',
        checksum: 'abc123'
      },
      {
        id: 'backup-2',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-10T12:00:00Z',
        status: 'completed',
        retention: '7 days',
        checksum: 'def456'
      }
    ];

    const compliance = calculateRetentionCompliance(backups);

    expect(compliance).toBe(50);
  });

  it('should handle 30 day retention', () => {
    const backups: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-20T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'abc123'
      },
      {
        id: 'backup-2',
        type: 'full',
        size: 1024,
        timestamp: '2025-12-01T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'def456'
      }
    ];

    const compliance = calculateRetentionCompliance(backups);

    expect(compliance).toBe(50);
  });

  it('should handle 90 day retention', () => {
    const backups: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-20T12:00:00Z',
        status: 'completed',
        retention: '90 days',
        checksum: 'abc123'
      }
    ];

    const compliance = calculateRetentionCompliance(backups);

    expect(compliance).toBe(100);
  });

  it('should calculate correct percentage for mixed retention periods', () => {
    const backups: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-20T12:00:00Z',
        status: 'completed',
        retention: '7 days',
        checksum: 'abc123'
      },
      {
        id: 'backup-2',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-19T12:00:00Z',
        status: 'completed',
        retention: '7 days',
        checksum: 'def456'
      },
      {
        id: 'backup-3',
        type: 'full',
        size: 1024,
        timestamp: '2026-01-18T12:00:00Z',
        status: 'completed',
        retention: '7 days',
        checksum: 'ghi789'
      }
    ];

    const compliance = calculateRetentionCompliance(backups);

    expect(compliance).toBe(100);
  });

  it('should handle exactly expired backup', () => {
    const backups: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2025-12-21T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'abc123'
      }
    ];

    const compliance = calculateRetentionCompliance(backups);

    expect(compliance).toBeLessThan(100);
    expect(compliance).toBeGreaterThanOrEqual(0);
  });

  it('should handle leap year dates', () => {
    const backups: BackupMetadata[] = [
      {
        id: 'backup-1',
        type: 'full',
        size: 1024,
        timestamp: '2024-02-20T12:00:00Z',
        status: 'completed',
        retention: '30 days',
        checksum: 'abc123'
      }
    ];

    jest.setSystemTime(new Date('2024-03-22T12:00:00Z'));
    const compliance = calculateRetentionCompliance(backups);

    expect(compliance).toBe(0);
    jest.setSystemTime(new Date('2026-01-21T12:00:00Z'));
  });
});
