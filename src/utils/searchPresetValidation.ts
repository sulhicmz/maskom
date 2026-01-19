import { SearchPreset } from '@/types/search';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePresetName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || typeof name !== 'string') {
    errors.push('Preset name is required');
    return { valid: false, errors };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 3) {
    errors.push('Preset name must be at least 3 characters long');
  }

  if (trimmedName.length > 30) {
    errors.push('Preset name must be at most 30 characters long');
  }

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
    errors.push('Preset name can only contain letters, numbers, spaces, hyphens, and underscores');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateSearchPreset(preset: SearchPreset): ValidationResult {
  const errors: string[] = [];

  if (!preset.id || typeof preset.id !== 'number') {
    errors.push('Preset must have a valid id');
  }

  const nameValidation = validatePresetName(preset.name);
  if (!nameValidation.valid) {
    errors.push(...nameValidation.errors);
  }

  if (preset.search !== undefined && typeof preset.search !== 'string') {
    errors.push('Search query must be a string if provided');
  }

  if (preset.category !== undefined && 
      preset.category !== null && 
      typeof preset.category !== 'number') {
    errors.push('Category must be a number or null if provided');
  }

  if (preset.tag !== undefined && 
      preset.tag !== null && 
      typeof preset.tag !== 'number') {
    errors.push('Tag must be a number or null if provided');
  }

  if (!preset.createdAt || typeof preset.createdAt !== 'string') {
    errors.push('Preset must have a valid createdAt timestamp');
  } else {
    const date = new Date(preset.createdAt);
    if (isNaN(date.getTime())) {
      errors.push('createdAt must be a valid ISO date string');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function isMaxPresetsReached(count: number): boolean {
  return count >= 10;
}
