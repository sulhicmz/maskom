export interface Migration<T = unknown, U = unknown> {
  version: string;
  description: string;
  up: (data: T) => U;
  down?: (data: U) => T;
}

export interface MigrationHistory {
  storageKey: string;
  migrations: string[];
  lastMigratedAt: string;
}

export interface MigrationResult {
  success: boolean;
  migrated: boolean;
  fromVersion?: string;
  toVersion?: string;
  error?: string;
}

export interface MigrationOptions {
  storageKey: string;
  currentVersion: string;
  migrations: Migration[];
  logMigrations?: boolean;
}

export interface IStorageMigration<T = unknown> {
  migrate(data: unknown): MigrationResult;
  rollback(data: unknown, targetVersion?: string): MigrationResult;
  getCurrentVersion(): string;
  resetHistory(): void;
}
