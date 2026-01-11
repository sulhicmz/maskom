import type { BaseDataItem } from "@/types/data";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule<T> {
  validate: (item: T) => string | null;
}

export interface StringFieldConfig {
  key: string;
  required: boolean;
}

export interface NumberFieldConfig {
  key: string;
  required: boolean;
  min?: number;
  max?: number;
}

export interface EnumFieldConfig {
  key: string;
  required: boolean;
  allowedValues: readonly unknown[];
}

export interface ArrayFieldConfig {
  key: string;
  required: boolean;
  itemValidator?: (item: unknown, index: number) => string | null;
}

export interface ValidationConfig<T> {
  typeName: string;
  stringFields?: StringFieldConfig[];
  numberFields?: NumberFieldConfig[];
  enumFields?: EnumFieldConfig[];
  arrayFields?: ArrayFieldConfig[];
  customRules?: Array<(item: T) => string | null>;
  baseValidation?: boolean;
}

export function createValidator<T>(config: ValidationConfig<T>): (item: T) => ValidationResult {
  return (item: T): ValidationResult => {
    const errors: string[] = [];
    const itemId = typeof (item as BaseDataItem & { id?: number }).id === "number" ? (item as BaseDataItem & { id?: number }).id! : "";

    if (config.baseValidation) {
      const baseResult = validateBaseDataItem(item as BaseDataItem, config.typeName);
      errors.push(...baseResult.errors);
    }

    if (config.stringFields) {
      for (const field of config.stringFields) {
        const value = (item as Record<string, unknown>)[field.key];
        if (field.required) {
          if (typeof value !== "string" || value.trim() === "") {
            errors.push(
              `${config.typeName}${itemId ? `[${itemId}]` : ""}: ${field.key} must be a non-empty string`
            );
          }
        }
      }
    }

    if (config.numberFields) {
      for (const field of config.numberFields) {
        const value = (item as Record<string, unknown>)[field.key];
        if (field.required) {
          if (typeof value !== "number") {
            errors.push(
              `${config.typeName}${itemId ? `[${itemId}]` : ""}: ${field.key} must be a number`
            );
          } else {
            if (field.min !== undefined && value < field.min) {
              errors.push(
                `${config.typeName}${itemId ? `[${itemId}]` : ""}: ${field.key} must be a positive number`
              );
            }
          }
        }
      }
    }

    if (config.enumFields) {
      for (const field of config.enumFields) {
        const value = (item as Record<string, unknown>)[field.key];
        if (field.required) {
          if (!field.allowedValues.includes(value as string)) {
            const allowed = field.allowedValues as unknown as string[];
            errors.push(
              `${config.typeName}${itemId ? `[${itemId}]` : ""}: ${field.key} must be either "${allowed[0]}" or "${allowed[1]}"`
            );
          }
        }
      }
    }

    if (config.arrayFields) {
      for (const field of config.arrayFields) {
        const value = (item as Record<string, unknown>)[field.key];
        if (field.required) {
          if (!Array.isArray(value) || value.length === 0) {
            errors.push(
              `${config.typeName}${itemId ? `[${itemId}]` : ""}: ${field.key} must be a non-empty array`
            );
          } else if (field.itemValidator) {
            value.forEach((item: unknown, index: number) => {
              const error = field.itemValidator!(item, index);
              if (error) {
                errors.push(error);
              }
            });
          }
        } else if (Array.isArray(value) && value.length > 0 && field.itemValidator) {
          value.forEach((item: unknown, index: number) => {
            const error = field.itemValidator!(item, index);
            if (error) {
              errors.push(error);
            }
          });
        }
      }
    }

    if (config.customRules) {
      for (const rule of config.customRules) {
        const error = rule(item);
        if (error) {
          errors.push(error);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };
}

export function validateBaseDataItem(item: BaseDataItem, itemName: string): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`${itemName}[${item.id}]: id must be a positive number`);
  }

  if (typeof item.page !== "string" || item.page.trim() === "") {
    errors.push(`${itemName}[${item.id}]: page must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function checkDuplicateIds<T extends BaseDataItem>(
  items: T[],
  itemName: string
): ValidationResult {
  const errors: string[] = [];
  const idMap = new Map<number, string[]>();

  items.forEach((item) => {
    const page = item.page;
    if (!idMap.has(item.id)) {
      idMap.set(item.id, []);
    }
    idMap.get(item.id)!.push(page);
  });

  idMap.forEach((pages, id) => {
    if (pages.length > 1) {
      errors.push(
        `${itemName}: Duplicate id ${id} found in pages: ${pages.join(", ")}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateDataArray<T>(
  items: T[],
  validator: (item: T) => ValidationResult
): ValidationResult {
  const allErrors: string[] = [];

  items.forEach((item) => {
    const result = validator(item);
    allErrors.push(...result.errors);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
