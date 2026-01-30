export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface IStorageValidator<T = unknown> {
  parse(data: unknown): ValidationResult<T>;
  validate(data: unknown): T;
  safeParseFromStorage(stored: string | null): T;
}

