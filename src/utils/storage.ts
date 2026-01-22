import { z } from 'zod';
import { StorageValidator, StorageValidatorOptions, ValidationResult } from './storageValidator';
import { StorageMigration, Migration, MigrationOptions, MigrationResult } from './storageMigration';

export interface StorageConfig<T> {
  key: string;
  schema: z.ZodSchema<T>;
  defaultValue: T;
  version?: string;
  migrations?: Migration[];
  logErrors?: boolean;
}

export interface StorageOperationResult {
  success: boolean;
  error?: string;
}

export class Storage<T = unknown> {
  private key: string;
  private schema: z.ZodSchema<T>;
  private defaultValue: T;
  private version: string;
  private validator: StorageValidator<T>;
  private migration?: StorageMigration<T>;

  constructor(config: StorageConfig<T>) {
    this.key = config.key;
    this.schema = config.schema;
    this.defaultValue = config.defaultValue;
    this.version = config.version ?? '1.0.0';

    this.validator = new StorageValidator<T>({
      schema: this.schema,
      defaultValue: this.defaultValue,
      storageKey: this.key,
      logErrors: config.logErrors ?? true,
    });

    if (config.migrations && config.migrations.length > 0) {
      this.migration = new StorageMigration<T>({
        storageKey: this.key,
        currentVersion: this.version,
        migrations: config.migrations,
        logMigrations: true,
      });
    }
  }

  get(): T {
    const stored = this.getRaw();
    
    if (!stored) {
      return this.defaultValue;
    }

    const data = this.parseAndValidate(stored);
    
    if (this.migration) {
      const result = this.migration.migrate(data);
      
      if (!result.success) {
        console.error(
          `[Storage:${this.key}] Migration failed:`,
          result.error
        );
        return this.defaultValue;
      }

      if (result.migrated) {
        const migratedData = this.schema.parse(result.migrated ? data : data);
        this.set(migratedData);
      }
    }

    return data;
  }

  set(value: T): StorageOperationResult {
    try {
      const validated = this.schema.safeParse(value);
      
      if (!validated.success) {
        console.error(
          `[Storage:${this.key}] Validation error on set:`,
          validated.error.flatten()
        );
        return {
          success: false,
          error: 'Invalid data schema',
        };
      }

      localStorage.setItem(this.key, JSON.stringify(validated.data));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Storage:${this.key}] Failed to save:`, errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  remove(): void {
    localStorage.removeItem(this.key);
  }

  clear(): void {
    this.remove();
    if (this.migration) {
      this.migration.resetHistory();
    }
  }

  validate(data: unknown): ValidationResult<T> {
    return this.validator.parse(data);
  }

  migrate(data: unknown): MigrationResult {
    if (!this.migration) {
      return {
        success: true,
        migrated: false,
      };
    }

    return this.migration.migrate(data);
  }

  rollback(data: unknown, targetVersion?: string): MigrationResult {
    if (!this.migration) {
      return {
        success: false,
        migrated: false,
        error: 'No migration configured for this storage',
      };
    }

    return this.migration.rollback(data, targetVersion);
  }

  getCurrentVersion(): string {
    return this.version;
  }

  getStorageKey(): string {
    return this.key;
  }

  hasValue(): boolean {
    return this.getRaw() !== null;
  }

  private getRaw(): string | null {
    try {
      return localStorage.getItem(this.key);
    } catch (error) {
      console.error(`[Storage:${this.key}] Failed to read from localStorage:`, error);
      return null;
    }
  }

  private parseAndValidate(stored: string): T {
    try {
      const parsed = JSON.parse(stored);
      return this.validator.validate(parsed);
    } catch (error) {
      console.error(
        `[Storage:${this.key}] Failed to parse stored data, using default:`,
        error
      );
      return this.defaultValue;
    }
  }
}

export function createStorage<T>(config: StorageConfig<T>): Storage<T> {
  return new Storage<T>(config);
}

export function getStorageValue<T>(
  key: string,
  schema: z.ZodSchema<T>,
  defaultValue: T
): T {
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(stored);
    const result = schema.safeParse(parsed);
    
    if (result.success) {
      return result.data;
    }
    
    console.error(`[${key}] Validation error:`, result.error.flatten());
    return defaultValue;
  } catch (error) {
    console.error(`[${key}] Parse error:`, error);
    return defaultValue;
  }
}

export function setStorageValue<T>(
  key: string,
  schema: z.ZodSchema<T>,
  value: T
): boolean {
  try {
    const validated = schema.safeParse(value);
    
    if (!validated.success) {
      console.error(`[${key}] Validation error:`, validated.error.flatten());
      return false;
    }

    localStorage.setItem(key, JSON.stringify(validated.data));
    return true;
  } catch (error) {
    console.error(`[${key}] Failed to save:`, error);
    return false;
  }
}

export function removeStorageValue(key: string): void {
  localStorage.removeItem(key);
}

export function clearStorage(): void {
  localStorage.clear();
}
