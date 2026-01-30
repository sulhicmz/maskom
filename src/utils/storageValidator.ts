import { z } from 'zod';
import type {
  IStorageValidator,
  ValidationResult
} from '@/types/storageValidator';

export interface StorageValidatorOptions<T> {
  schema: z.ZodSchema<T>;
  defaultValue: T;
  storageKey: string;
  logErrors?: boolean;
}

export class StorageValidator<T = unknown> implements IStorageValidator<T> {
  private schema: z.ZodSchema<T>;
  private defaultValue: T;
  private storageKey: string;
  private logErrors: boolean;
 
  constructor(options: StorageValidatorOptions<T>) {
    this.schema = options.schema;
    this.defaultValue = options.defaultValue;
    this.storageKey = options.storageKey;
    this.logErrors = options.logErrors ?? true;
  }
 
  parse(data: unknown): ValidationResult<T> {
    try {
      const result = this.schema.safeParse(data);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }

      if (this.logErrors) {
        console.error(`[StorageValidator:${this.storageKey}] Validation error:`, result.error.flatten());
      }

      return {
        success: false,
        error: this.formatZodError(result.error),
      };
    } catch (error) {
      if (this.logErrors) {
        console.error(`[StorageValidator:${this.storageKey}] Parse error:`, error);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parse error',
      };
    }
  }

  validate(data: unknown): T {
    const result = this.parse(data);
    
    if (result.success && result.data !== undefined) {
      return result.data;
    }

    if (this.logErrors && !result.success) {
      console.warn(
        `[StorageValidator:${this.storageKey}] Using default value due to validation failure:`,
        result.error
      );
    }

    return this.defaultValue;
  }

  safeParseFromStorage(stored: string | null): T {
    if (!stored) {
      return this.defaultValue;
    }

    try {
      const parsed = JSON.parse(stored);
      return this.validate(parsed);
    } catch (error) {
      if (this.logErrors) {
        console.error(
          `[StorageValidator:${this.storageKey}] JSON parse error, using default:`,
          error
        );
      }
      return this.defaultValue;
    }
  }

  private formatZodError(error: z.ZodError): string {
    const issues = error.issues.map((issue: z.ZodIssue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    });
    return issues.join('; ');
  }
}

export function createValidator<T>(options: StorageValidatorOptions<T>): StorageValidator<T> {
  return new StorageValidator<T>(options);
}

export function validateArray<T>(
  items: unknown[],
  itemSchema: z.ZodSchema<T>,
  defaultValue: T[]
): T[] {
  const arraySchema = z.array(itemSchema);
  const result = arraySchema.safeParse(items);
  
  if (result.success) {
    return result.data;
  }
  
  console.error('Array validation error:', result.error.flatten());
  return defaultValue;
}

export function validateObject<T>(
  obj: unknown,
  objectSchema: z.ZodSchema<T>,
  defaultValue: T
): T {
  const result = objectSchema.safeParse(obj);
  
  if (result.success) {
    return result.data;
  }
  
  console.error('Object validation error:', result.error.flatten());
  return defaultValue;
}

export type { ValidationResult } from '@/types/storageValidator';
