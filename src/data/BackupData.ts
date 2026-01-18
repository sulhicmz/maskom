import { BackupMetadata, DisasterRecoveryPlan, DEFAULT_DISASTER_RECOVERY_PLAN } from '@/types/backup'

const sampleBackupMetadata: BackupMetadata[] = [
  {
    id: 'backup-2025-12-15-full',
    timestamp: '2025-12-15T02:00:00.000Z',
    type: 'full',
    size: 5242880,
    checksum: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    encryption: 'AES-256',
    retention: '30 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-08-full',
    timestamp: '2025-12-08T02:00:00.000Z',
    type: 'full',
    size: 5190453,
    checksum: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1',
    encryption: 'AES-256',
    retention: '30 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-14-incremental',
    timestamp: '2025-12-14T02:00:00.000Z',
    type: 'incremental',
    size: 524288,
    checksum: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-13-incremental',
    timestamp: '2025-12-13T02:00:00.000Z',
    type: 'incremental',
    size: 498073,
    checksum: 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-12-incremental',
    timestamp: '2025-12-12T02:00:00.000Z',
    type: 'incremental',
    size: 458752,
    checksum: 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-11-incremental',
    timestamp: '2025-12-11T02:00:00.000Z',
    type: 'incremental',
    size: 425984,
    checksum: 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-10-incremental',
    timestamp: '2025-12-10T02:00:00.000Z',
    type: 'incremental',
    size: 393216,
    checksum: 'g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-09-incremental',
    timestamp: '2025-12-09T02:00:00.000Z',
    type: 'incremental',
    size: 360448,
    checksum: 'h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-07-incremental',
    timestamp: '2025-12-07T02:00:00.000Z',
    type: 'incremental',
    size: 327680,
    checksum: 'i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-06-incremental',
    timestamp: '2025-12-06T02:00:00.000Z',
    type: 'incremental',
    size: 294912,
    checksum: 'j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-05-incremental',
    timestamp: '2025-12-05T02:00:00.000Z',
    type: 'incremental',
    size: 262144,
    checksum: 'k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-04-incremental',
    timestamp: '2025-12-04T02:00:00.000Z',
    type: 'incremental',
    size: 229376,
    checksum: 'l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-03-incremental',
    timestamp: '2025-12-03T02:00:00.000Z',
    type: 'incremental',
    size: 196608,
    checksum: 'm3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-02-incremental',
    timestamp: '2025-12-02T02:00:00.000Z',
    type: 'incremental',
    size: 163840,
    checksum: 'n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2m3',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-01-incremental',
    timestamp: '2025-12-01T02:00:00.000Z',
    type: 'incremental',
    size: 131072,
    checksum: 'o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2m3n4',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-11-30-incremental',
    timestamp: '2025-11-30T02:00:00.000Z',
    type: 'incremental',
    size: 98304,
    checksum: 'p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-11-24-full',
    timestamp: '2025-11-24T02:00:00.000Z',
    type: 'full',
    size: 5108960,
    checksum: 'q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    encryption: 'AES-256',
    retention: '30 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-11-23-incremental',
    timestamp: '2025-11-23T02:00:00.000Z',
    type: 'incremental',
    size: 65536,
    checksum: 'r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-11-17-full',
    timestamp: '2025-11-17T02:00:00.000Z',
    type: 'full',
    size: 5027467,
    checksum: 's9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
    encryption: 'AES-256',
    retention: '30 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-16-incremental',
    timestamp: '2025-12-16T02:00:00.000Z',
    type: 'incremental',
    size: 45056,
    checksum: 't0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-17-full',
    timestamp: '2025-12-17T02:00:00.000Z',
    type: 'full',
    size: 5347738,
    checksum: 'u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    encryption: 'AES-256',
    retention: '30 days',
    status: 'completed',
    version: '1.0.0',
  },
  {
    id: 'backup-2025-12-18-incremental',
    timestamp: '2025-12-18T02:00:00.000Z',
    type: 'incremental',
    size: 49152,
    checksum: 'v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
    encryption: 'AES-256',
    retention: '7 days',
    status: 'pending',
    version: '1.0.0',
  },
]

export default sampleBackupMetadata

export const getBackupMetadata = (): BackupMetadata[] => {
  return sampleBackupMetadata
}

export const getBackupById = (id: string): BackupMetadata | undefined => {
  return sampleBackupMetadata.find(backup => backup.id === id)
}

export const getLatestBackup = (): BackupMetadata | undefined => {
  const completedBackups = sampleBackupMetadata
    .filter(backup => backup.status === 'completed')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return completedBackups[0]
}

export const getFullBackups = (): BackupMetadata[] => {
  return sampleBackupMetadata
    .filter(backup => backup.type === 'full' && backup.status === 'completed')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const getIncrementalBackups = (): BackupMetadata[] => {
  return sampleBackupMetadata
    .filter(backup => backup.type === 'incremental' && backup.status === 'completed')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const getRecentBackups = (days: number = 7): BackupMetadata[] => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return sampleBackupMetadata
    .filter(backup => {
      const backupDate = new Date(backup.timestamp)
      return backupDate >= cutoffDate && backup.status === 'completed'
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const getBackupStatistics = () => {
  const completedBackups = sampleBackupMetadata.filter(backup => backup.status === 'completed')
  const failedBackups = sampleBackupMetadata.filter(backup => backup.status === 'failed')
  const fullBackups = completedBackups.filter(backup => backup.type === 'full')
  const incrementalBackups = completedBackups.filter(backup => backup.type === 'incremental')

  return {
    totalBackups: sampleBackupMetadata.length,
    completedBackups: completedBackups.length,
    failedBackups: failedBackups.length,
    fullBackups: fullBackups.length,
    incrementalBackups: incrementalBackups.length,
    totalSize: completedBackups.reduce((sum, backup) => sum + backup.size, 0),
    lastBackupDate: sampleBackupMetadata.length > 0
      ? new Date(sampleBackupMetadata[0].timestamp).toISOString()
      : null,
    lastBackupStatus: sampleBackupMetadata.length > 0
      ? sampleBackupMetadata[0].status
      : null,
  }
}

export const getDisasterRecoveryPlan = (): DisasterRecoveryPlan => {
  return DEFAULT_DISASTER_RECOVERY_PLAN
}
