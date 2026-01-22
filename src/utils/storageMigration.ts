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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface MigrationOptions<T = unknown> {
  storageKey: string;
  currentVersion: string;
  migrations: Migration[];
  logMigrations?: boolean;
}

const HISTORY_KEY = 'maskom_migration_history';

export class StorageMigration<T = unknown> {
  private storageKey: string;
  private currentVersion: string;
  private migrations: Map<string, Migration>;
  private logMigrations: boolean;

  constructor(options: MigrationOptions<T>) {
    this.storageKey = options.storageKey;
    this.currentVersion = options.currentVersion;
    this.migrations = new Map();
    this.logMigrations = options.logMigrations ?? true;

    options.migrations.forEach(migration => {
      this.migrations.set(migration.version, migration);
    });
  }

  migrate(data: unknown): MigrationResult {
    const history = this.loadHistory();
    const entry = history.find(h => h.storageKey === this.storageKey);
    const lastMigratedVersion = entry?.migrations?.[entry.migrations.length - 1] || '0.0.0';
    const dataVersion = data !== null && typeof data === 'object' && 'version' in data ? this.normalizeVersion((data as Record<string, unknown>).version as string | number) : undefined;
    
    if (this.compareVersions(lastMigratedVersion, this.currentVersion) === 0) {
      return {
        success: true,
        migrated: false,
      };
    }
    
    if (dataVersion !== undefined && this.compareVersions(dataVersion, this.currentVersion) >= 0) {
      return {
        success: true,
        migrated: false,
      };
    }
    
    try {
      let result: unknown = data;
      const migrationPath = this.getMigrationPath(lastMigratedVersion);
      
      for (const migration of migrationPath) {
        if (this.logMigrations) {
          console.info(
            `[StorageMigration:${this.storageKey}] Migrating from ${lastMigratedVersion} to ${migration.version}: ${migration.description}`
          );
        }
        
        result = migration.up(result as T);
        this.updateHistory(history, migration.version);
      }
      
      return {
        success: true,
        migrated: true,
        fromVersion: lastMigratedVersion,
        toVersion: this.currentVersion,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown migration error';
      
      console.error(
        `[StorageMigration:${this.storageKey}] Migration failed:`,
        errorMessage
      );
      
      return {
        success: false,
        migrated: false,
        error: errorMessage,
      };
    }
  }

  rollback(data: unknown, targetVersion?: string): MigrationResult {
    const history = this.loadHistory();
    const entry = history.find(h => h.storageKey === this.storageKey);
    const currentVersion = entry?.migrations?.[entry.migrations.length - 1] || this.currentVersion;
    
    if (!targetVersion || targetVersion === currentVersion) {
      return {
        success: true,
        migrated: false,
      };
    }
    
    const migrationPath = this.getRollbackPath(currentVersion, targetVersion);

    if (migrationPath.length === 0) {
      return {
        success: false,
        migrated: false,
        error: `No rollback path found from ${currentVersion} to ${targetVersion}`,
      };
    }

    try {
      let result = data as unknown;

      for (const migration of migrationPath) {
        if (!migration.down) {
          throw new Error(`Migration ${migration.version} does not support rollback`);
        }

        if (this.logMigrations) {
          console.info(
            `[StorageMigration:${this.storageKey}] Rolling back from ${migration.version} to ${targetVersion}`
          );
        }

        result = migration.down(result);
      }

      this.updateHistory(history, targetVersion);

      return {
        success: true,
        migrated: true,
        fromVersion: currentVersion,
        toVersion: targetVersion,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown rollback error';
      
      console.error(
        `[StorageMigration:${this.storageKey}] Rollback failed:`,
        errorMessage
      );

      return {
        success: false,
        migrated: false,
        error: errorMessage,
      };
    }
  }

  private loadHistory(): MigrationHistory[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed as MigrationHistory[];
    } catch (error) {
      console.error('[StorageMigration] Failed to load migration history:', error);
      return [];
    }
  }

  private saveHistory(history: MigrationHistory[]): void {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('[StorageMigration] Failed to save migration history:', error);
    }
  }

  private getLastMigratedVersion(history: MigrationHistory[]): string {
    const entry = history.find(h => h.storageKey === this.storageKey);
    if (!entry || entry.migrations.length === 0) {
      return '0.0.0';
    }
    
    return entry.migrations[entry.migrations.length - 1];
  }

  private updateHistory(history: MigrationHistory[], version: string): void {
    let entry = history.find(h => h.storageKey === this.storageKey);
    
    if (!entry) {
      entry = {
        storageKey: this.storageKey,
        migrations: [version],
        lastMigratedAt: new Date().toISOString(),
      };
      history.push(entry);
    } else {
      if (!entry.migrations.includes(version)) {
        entry.migrations.push(version);
      }
      entry.lastMigratedAt = new Date().toISOString();
    }
    
    this.saveHistory(history);
  }

  private getMigrationPath(fromVersion: string): Migration[] {
    const path: Migration[] = [];
    const versions = this.getSortedVersions();
    
    for (const version of versions) {
      if (this.compareVersions(version, fromVersion) < 0) {
        continue;
      }

      if (this.compareVersions(version, this.currentVersion) > 0) {
        break;
      }

      const migration = this.migrations.get(version);
      if (migration) {
        path.push(migration);
      }
    }

    return path;
  }

  private getRollbackPath(fromVersion: string, toVersion: string): Migration[] {
    const path: Migration[] = [];
    const versions = this.getSortedVersions();
    
    for (let i = versions.length - 1; i >= 0; i--) {
      const version = versions[i];
      
      if (this.compareVersions(version, toVersion) <= 0) {
        break;
      }
      
      const migration = this.migrations.get(version);
      if (migration) {
        path.push(migration);
      }
      
      if (this.compareVersions(version, fromVersion) <= 0) {
        break;
      }
       }
     
     return path;
   }

  private getSortedVersions(): string[] {
    return Array.from(this.migrations.keys()).sort((a, b) =>
      this.compareVersions(a, b)
    );
  }

  private normalizeVersion(version: string | number): string {
    if (typeof version === 'number') {
      return `${version}.0.0`;
    }
    return version;
  }
  
  private compareVersions(a: string | number, b: string | number): number {
    const normalizedA = this.normalizeVersion(a as string);
    const normalizedB = this.normalizeVersion(b as string);
    
    const partsA = normalizedA.split('.').map(Number);
    const partsB = normalizedB.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      const partA = partsA[i] ?? 0;
      const partB = partsB[i] ?? 0;
      
      if (partA < partB) return -1;
      if (partA > partB) return 1;
    }
    
    return 0;
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  resetHistory(): void {
    const history = this.loadHistory();
    const filtered = history.filter(h => h.storageKey !== this.storageKey);
    this.saveHistory(filtered);
  }
}

export function createMigration<T>(options: MigrationOptions<T>): StorageMigration<T> {
  return new StorageMigration(options);
}
