import { 
  validatePresetName, 
  validateSearchPreset, 
  isMaxPresetsReached 
} from '../searchPresetValidation';
import { SearchPreset } from '../../types/search';

describe('searchPresetValidation', () => {
  describe('validatePresetName', () => {
    it('should pass with valid name', () => {
      const result = validatePresetName('Tech Articles');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass with name containing spaces', () => {
      const result = validatePresetName('My Tech Articles');

      expect(result.valid).toBe(true);
    });

    it('should pass with name containing hyphens and underscores', () => {
      const result = validatePresetName('Tech-Articles_2024');

      expect(result.valid).toBe(true);
    });

    it('should fail with name less than 3 characters', () => {
      const result = validatePresetName('AB');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preset name must be at least 3 characters long');
    });

    it('should fail with name more than 30 characters', () => {
      const longName = 'a'.repeat(31);
      const result = validatePresetName(longName);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preset name must be at most 30 characters long');
    });

    it('should fail with name containing special characters', () => {
      const result = validatePresetName('Test@#$%');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preset name can only contain letters, numbers, spaces, hyphens, and underscores');
    });

    it('should fail with empty string', () => {
      const result = validatePresetName('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preset name is required');
    });

    it('should fail with non-string value', () => {
      const result = validatePresetName(null as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preset name is required');
    });

    it('should trim whitespace before validation', () => {
      const result = validatePresetName('  Valid Name  ');

      expect(result.valid).toBe(true);
    });

    it('should fail if trimmed name is too short', () => {
      const result = validatePresetName('  AB  ');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preset name must be at least 3 characters long');
    });

    it('should fail if trimmed name is too long', () => {
      const longName = '  ' + 'a'.repeat(31) + '  ';
      const result = validatePresetName(longName);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preset name must be at most 30 characters long');
    });
  });

  describe('validateSearchPreset', () => {
    it('should pass with valid preset', () => {
      const preset: SearchPreset = {
        id: 1,
        name: 'Valid Preset',
        search: 'technology',
        category: 1,
        tag: 5,
        createdAt: new Date().toISOString()
      };

      const result = validateSearchPreset(preset);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with invalid id', () => {
      const preset: SearchPreset = {
        id: NaN as any,
        name: 'Test',
        search: 'test',
        createdAt: new Date().toISOString()
      };

      const result = validateSearchPreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('id'))).toBe(true);
    });

    it('should fail with invalid name', () => {
      const preset: SearchPreset = {
        id: 1,
        name: 'AB',
        search: 'test',
        createdAt: new Date().toISOString()
      };

      const result = validateSearchPreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid search type', () => {
      const preset: SearchPreset = {
        id: 1,
        name: 'Valid Preset',
        search: null as any,
        createdAt: new Date().toISOString()
      };

      const result = validateSearchPreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Search query'))).toBe(true);
    });

    it('should fail with invalid category type', () => {
      const preset: SearchPreset = {
        id: 1,
        name: 'Valid Preset',
        search: 'test',
        category: 'invalid' as any,
        createdAt: new Date().toISOString()
      };

      const result = validateSearchPreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Category'))).toBe(true);
    });

    it('should fail with invalid tag type', () => {
      const preset: SearchPreset = {
        id: 1,
        name: 'Valid Preset',
        search: 'test',
        tag: 'invalid' as any,
        createdAt: new Date().toISOString()
      };

      const result = validateSearchPreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Tag'))).toBe(true);
    });

    it('should fail with invalid date', () => {
      const preset: SearchPreset = {
        id: 1,
        name: 'Valid Preset',
        search: 'test',
        createdAt: 'invalid-date'
      };

      const result = validateSearchPreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('createdAt'))).toBe(true);
    });

    it('should fail with missing createdAt', () => {
      const preset: SearchPreset = {
        id: 1,
        name: 'Valid Preset',
        search: 'test',
        createdAt: '' as any
      };

      const result = validateSearchPreset(preset);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('createdAt'))).toBe(true);
    });

    it('should pass with optional fields omitted', () => {
      const preset: SearchPreset = {
        id: 1,
        name: 'Valid Preset',
        search: 'test',
        createdAt: new Date().toISOString()
      };

      const result = validateSearchPreset(preset);

      expect(result.valid).toBe(true);
    });

    it('should pass with null category and tag', () => {
      const preset: SearchPreset = {
        id: 1,
        name: 'Valid Preset',
        search: 'test',
        category: null,
        tag: null,
        createdAt: new Date().toISOString()
      };

      const result = validateSearchPreset(preset);

      expect(result.valid).toBe(true);
    });
  });

  describe('isMaxPresetsReached', () => {
    it('should return false when count is below 10', () => {
      expect(isMaxPresetsReached(5)).toBe(false);
      expect(isMaxPresetsReached(9)).toBe(false);
    });

    it('should return true when count is 10', () => {
      expect(isMaxPresetsReached(10)).toBe(true);
    });

    it('should return true when count is above 10', () => {
      expect(isMaxPresetsReached(15)).toBe(true);
    });

    it('should return false when count is 0', () => {
      expect(isMaxPresetsReached(0)).toBe(false);
    });
  });
});
