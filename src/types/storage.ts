import { z } from 'zod';
import { ValidationResult } from './storageValidator';
import { Migration, MigrationResult } from './storageMigration';

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

export interface IStorage<T = unknown> {
  get(): T;
  set(value: T): StorageOperationResult;
  remove(): void;
  clear(): void;
  validate(data: unknown): ValidationResult<T>;
  migrate(data: unknown): MigrationResult;
  rollback(data: unknown, targetVersion?: string): MigrationResult;
  getCurrentVersion(): string;
  getStorageKey(): string;
  hasValue(): boolean;
}
