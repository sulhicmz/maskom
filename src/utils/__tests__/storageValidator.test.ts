import { StorageValidator, createValidator, validateArray, validateObject } from '../storageValidator';
import { z } from 'zod';

describe('StorageValidator', () => {
  const testSchema = z.object({
    id: z.string(),
    name: z.string(),
    count: z.number(),
  });

  const testData = {
    id: 'test-1',
    name: 'Test Item',
    count: 42,
  };

  describe('StorageValidator class', () => {
    let validator: StorageValidator;

    beforeEach(() => {
      validator = new StorageValidator({
        schema: testSchema,
        defaultValue: { id: 'default', name: 'Default', count: 0 },
        storageKey: 'test_key',
        logErrors: false,
      });
    });

    describe('parse', () => {
      it('should successfully parse valid data', () => {
        const result = validator.parse(testData);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(testData);
      });

      it('should fail to parse invalid data', () => {
        const invalidData = { id: 'test-1', name: 'Test' };
        const result = validator.parse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should fail to parse null data', () => {
        const result = validator.parse(null);
        expect(result.success).toBe(false);
      });

      it('should fail to parse undefined data', () => {
        const result = validator.parse(undefined);
        expect(result.success).toBe(false);
      });
    });

    describe('validate', () => {
      it('should return valid data for correct input', () => {
        const result = validator.validate(testData);
        expect(result).toEqual(testData);
      });

      it('should return default value for invalid input', () => {
        const invalidData = { id: 'test-1', name: 'Test' };
        const result = validator.validate(invalidData);
        expect(result).toEqual({ id: 'default', name: 'Default', count: 0 });
      });
    });

    describe('safeParseFromStorage', () => {
      beforeEach(() => {
        localStorage.clear();
      });

      it('should parse valid JSON from storage', () => {
        localStorage.setItem('test_key', JSON.stringify(testData));
        const result = validator.safeParseFromStorage(localStorage.getItem('test_key'));
        expect(result).toEqual(testData);
      });

      it('should return default value for invalid JSON', () => {
        localStorage.setItem('test_key', '{ invalid json');
        const result = validator.safeParseFromStorage(localStorage.getItem('test_key'));
        expect(result).toEqual({ id: 'default', name: 'Default', count: 0 });
      });

      it('should return default value for null storage', () => {
        const result = validator.safeParseFromStorage(null);
        expect(result).toEqual({ id: 'default', name: 'Default', count: 0 });
      });

      it('should return default value for empty string storage', () => {
        const result = validator.safeParseFromStorage('');
        expect(result).toEqual({ id: 'default', name: 'Default', count: 0 });
      });
    });
  });

  describe('createValidator helper', () => {
    it('should create a new StorageValidator instance', () => {
      const validator = createValidator({
        schema: testSchema,
        defaultValue: { id: 'default', name: 'Default', count: 0 },
        storageKey: 'test_key',
      });
      expect(validator).toBeInstanceOf(StorageValidator);
    });
  });

  describe('validateArray helper', () => {
    const itemSchema = z.object({
      id: z.string(),
      name: z.string(),
    });

    const validArray = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    it('should validate a valid array', () => {
      const result = validateArray(validArray, itemSchema, []);
      expect(result).toEqual(validArray);
    });

    it('should return default for invalid array', () => {
      const invalidArray = [{ id: '1' }, { id: '2' }];
      const result = validateArray(invalidArray, itemSchema, []);
      expect(result).toEqual([]);
    });

    it('should return default for non-array input', () => {
      const result = validateArray('not an array' as any, itemSchema, []);
      expect(result).toEqual([]);
    });
  });

  describe('validateObject helper', () => {
    const objectSchema = z.object({
      id: z.string(),
      name: z.string(),
    });

    const validObject = { id: '1', name: 'Item 1' };

    it('should validate a valid object', () => {
      const result = validateObject(validObject, objectSchema, { id: '', name: '' });
      expect(result).toEqual(validObject);
    });

    it('should return default for invalid object', () => {
      const invalidObject = { id: '1' };
      const result = validateObject(invalidObject, objectSchema, { id: '', name: '' });
      expect(result).toEqual({ id: '', name: '' });
    });

    it('should return default for non-object input', () => {
      const result = validateObject(null as any, objectSchema, { id: '', name: '' });
      expect(result).toEqual({ id: '', name: '' });
    });
  });
});
