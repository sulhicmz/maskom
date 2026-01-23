import { Storage, createStorage, getStorageValue, setStorageValue, removeStorageValue, clearStorage } from '../storage';
import { z } from 'zod';

describe('Storage', () => {
    const mockLocalStorage = {
        storage: {} as Record<string, string>,
        clear() {
            this.storage = {};
        },
        getItem(key: string) {
            return this.storage[key] || null;
        },
        setItem(key: string, value: string) {
            this.storage[key] = value;
        },
        removeItem(key: string) {
            delete this.storage[key];
        }
    };

    beforeEach(() => {
        mockLocalStorage.clear();
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create storage with required config', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: 'default' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            expect(storage).toBeDefined();
            expect(storage.getCurrentVersion()).toBe('1.0.0');
        });

        it('should use provided version', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: 'default' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue,
                version: '2.0.0'
            });

            expect(storage.getCurrentVersion()).toBe('2.0.0');
        });

        it('should create migration when provided', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: 'default' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue,
                migrations: [{
                    version: '1.0.0',
                    description: 'Initial',
                    up: (data: any) => data,
                    down: (data: any) => data
                }]
            });

            expect(storage).toBeDefined();
        });
    });

    describe('get', () => {
        it('should return default value when no data exists', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: 'default' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.get();
            expect(result).toEqual(defaultValue);
        });

        it('should return stored data when valid', () => {
            const schema = z.object({ name: z.string(), age: z.number() });
            const data = { name: 'John', age: 30 };
            
            localStorage.setItem('test-key', JSON.stringify(data));
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue: { name: '', age: 0 }
            });

            const result = storage.get();
            expect(result).toEqual(data);
        });

        it('should return default value when stored data is invalid', () => {
            const schema = z.object({ name: z.string(), age: z.number() });
            const defaultValue = { name: 'default', age: 0 };
            
            localStorage.setItem('test-key', JSON.stringify({ name: 'John', age: 'invalid' }));
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.get();
            expect(result).toEqual(defaultValue);
        });

        it('should return default value when stored data is corrupted', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: 'default' };
            
            localStorage.setItem('test-key', 'invalid-json');
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.get();
            expect(result).toEqual(defaultValue);
        });

        it('should handle localStorage errors gracefully', () => {
            const originalGetItem = mockLocalStorage.getItem;
            mockLocalStorage.getItem = () => {
                throw new Error('localStorage error');
            };
            
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: 'default' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.get();
            expect(result).toEqual(defaultValue);
            
            mockLocalStorage.getItem = originalGetItem;
        });
    });

    describe('set', () => {
        it('should store valid data and return success', () => {
            const schema = z.object({ name: z.string(), age: z.number() });
            const defaultValue = { name: '', age: 0 };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.set({ name: 'John', age: 30 });
            
            expect(result.success).toBe(true);
            expect(localStorage.getItem('test-key')).toBe(JSON.stringify({ name: 'John', age: 30 }));
        });

        it('should reject invalid data and return error', () => {
            const schema = z.object({ name: z.string(), age: z.number() });
            const defaultValue = { name: '', age: 0 };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.set({ name: 'John', age: 'invalid' } as any);
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid data schema');
        });

        it('should handle localStorage errors', () => {
            const originalSetItem = mockLocalStorage.setItem;
            mockLocalStorage.setItem = () => {
                throw new Error('quota exceeded');
            };
            
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.set({ name: 'John' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('quota exceeded');
            
            mockLocalStorage.setItem = originalSetItem;
        });
    });

    describe('remove', () => {
        it('should remove data from localStorage', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            localStorage.setItem('test-key', JSON.stringify({ name: 'John' }));
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            storage.remove();
            expect(localStorage.getItem('test-key')).toBeNull();
        });
    });

    describe('clear', () => {
        it('should remove data and reset migration history', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            localStorage.setItem('test-key', JSON.stringify({ name: 'John' }));
            localStorage.setItem('test-key_migration_history', JSON.stringify([]));
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue,
                migrations: [{
                    version: '1.0.0',
                    description: 'Initial',
                    up: (data: any) => data,
                    down: (data: any) => data
                }]
            });

            storage.clear();
            expect(localStorage.getItem('test-key')).toBeNull();
        });
    });

    describe('validate', () => {
        it('should validate valid data', () => {
            const schema = z.object({ name: z.string(), age: z.number() });
            const defaultValue = { name: '', age: 0 };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.validate({ name: 'John', age: 30 });
            expect(result.success).toBe(true);
        });

        it('should reject invalid data', () => {
            const schema = z.object({ name: z.string(), age: z.number() });
            const defaultValue = { name: '', age: 0 };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.validate({ name: 'John', age: 'invalid' } as any);
            expect(result.success).toBe(false);
        });
    });

    describe('migrate', () => {
        it('should return success when no migration configured', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.migrate({ name: 'John' });
            expect(result.success).toBe(true);
            expect(result.migrated).toBe(false);
        });

        it('should return success when migration succeeds', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue,
                migrations: [{
                    version: '1.0.0',
                    description: 'Initial',
                    up: (data: any) => ({ ...data, migrated: true }),
                    down: (data: any) => data
                }]
            });

            const result = storage.migrate({ name: 'John' });
            expect(result.success).toBe(true);
        });
    });

    describe('rollback', () => {
        it('should return error when no migration configured', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            const result = storage.rollback({ name: 'John' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('No migration configured');
        });
    });

    describe('getCurrentVersion', () => {
        it('should return current version', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue,
                version: '3.0.0'
            });

            expect(storage.getCurrentVersion()).toBe('3.0.0');
        });
    });

    describe('getStorageKey', () => {
        it('should return storage key', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            const storage = new Storage({
                key: 'custom-key',
                schema,
                defaultValue
            });

            expect(storage.getStorageKey()).toBe('custom-key');
        });
    });

    describe('hasValue', () => {
        it('should return true when value exists', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            localStorage.setItem('test-key', JSON.stringify({ name: 'John' }));
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            expect(storage.hasValue()).toBe(true);
        });

        it('should return false when value does not exist', () => {
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            expect(storage.hasValue()).toBe(false);
        });

        it('should return false on localStorage error', () => {
            const originalGetItem = mockLocalStorage.getItem;
            mockLocalStorage.getItem = () => {
                throw new Error('localStorage error');
            };
            
            const schema = z.object({ name: z.string() });
            const defaultValue = { name: '' };
            
            const storage = new Storage({
                key: 'test-key',
                schema,
                defaultValue
            });

            expect(storage.hasValue()).toBe(false);
            
            mockLocalStorage.getItem = originalGetItem;
        });
    });
});

describe('createStorage', () => {
    it('should create Storage instance', () => {
        const schema = z.object({ name: z.string() });
        const defaultValue = { name: 'default' };
        
        const storage = createStorage({
            key: 'test-key',
            schema,
            defaultValue
        });

        expect(storage).toBeInstanceOf(Storage);
    });
});

describe('getStorageValue', () => {
    const mockLocalStorage = {
        storage: {} as Record<string, string>,
        clear() {
            this.storage = {};
        },
        getItem(key: string) {
            return this.storage[key] || null;
        },
        setItem(key: string, value: string) {
            this.storage[key] = value;
        }
    };

    beforeEach(() => {
        mockLocalStorage.clear();
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });
        jest.clearAllMocks();
    });

    it('should return default value when no data exists', () => {
        const schema = z.object({ name: z.string() });
        const defaultValue = { name: 'default' };
        
        const result = getStorageValue('test-key', schema, defaultValue);
        expect(result).toEqual(defaultValue);
    });

    it('should return parsed data when valid', () => {
        const schema = z.object({ name: z.string(), age: z.number() });
        const data = { name: 'John', age: 30 };
        const defaultValue = { name: '', age: 0 };
        
        localStorage.setItem('test-key', JSON.stringify(data));
        
        const result = getStorageValue('test-key', schema, defaultValue);
        expect(result).toEqual(data);
    });

    it('should return default value when data is invalid', () => {
        const schema = z.object({ name: z.string(), age: z.number() });
        const defaultValue = { name: 'default', age: 0 };
        
        localStorage.setItem('test-key', JSON.stringify({ name: 'John', age: 'invalid' }));
        
        const result = getStorageValue('test-key', schema, defaultValue);
        expect(result).toEqual(defaultValue);
    });

    it('should return default value when JSON is corrupted', () => {
        const schema = z.object({ name: z.string() });
        const defaultValue = { name: 'default' };
        
        localStorage.setItem('test-key', 'invalid-json');
        
        const result = getStorageValue('test-key', schema, defaultValue);
        expect(result).toEqual(defaultValue);
    });
});

describe('setStorageValue', () => {
    const mockLocalStorage = {
        storage: {} as Record<string, string>,
        clear() {
            this.storage = {};
        },
        getItem(key: string) {
            return this.storage[key] || null;
        },
        setItem(key: string, value: string) {
            this.storage[key] = value;
        }
    };

    beforeEach(() => {
        mockLocalStorage.clear();
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });
        jest.clearAllMocks();
    });

    it('should store valid data and return true', () => {
        const schema = z.object({ name: z.string(), age: z.number() });
        
        const result = setStorageValue('test-key', schema, { name: 'John', age: 30 });
        
        expect(result).toBe(true);
        expect(localStorage.getItem('test-key')).toBe(JSON.stringify({ name: 'John', age: 30 }));
    });

    it('should reject invalid data and return false', () => {
        const schema = z.object({ name: z.string(), age: z.number() });
        
        const result = setStorageValue('test-key', schema, { name: 'John', age: 'invalid' } as any);
        
        expect(result).toBe(false);
    });

    it('should handle localStorage errors and return false', () => {
        const originalSetItem = mockLocalStorage.setItem;
        mockLocalStorage.setItem = () => {
            throw new Error('quota exceeded');
        };
        
        const schema = z.object({ name: z.string() });
        
        const result = setStorageValue('test-key', schema, { name: 'John' });
        
        expect(result).toBe(false);
        
        mockLocalStorage.setItem = originalSetItem;
    });
});

describe('removeStorageValue', () => {
    const mockLocalStorage = {
        storage: {} as Record<string, string>,
        clear() {
            this.storage = {};
        },
        getItem(key: string) {
            return this.storage[key] || null;
        },
        setItem(key: string, value: string) {
            this.storage[key] = value;
        },
        removeItem(key: string) {
            delete this.storage[key];
        }
    };

    beforeEach(() => {
        mockLocalStorage.clear();
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });
        jest.clearAllMocks();
    });

    it('should remove value from localStorage', () => {
        localStorage.setItem('test-key', 'test-value');
        
        removeStorageValue('test-key');
        expect(localStorage.getItem('test-key')).toBeNull();
    });
});

describe('clearStorage', () => {
    const mockLocalStorage = {
        storage: {} as Record<string, string>,
        clear() {
            this.storage = {};
        },
        getItem(key: string) {
            return this.storage[key] || null;
        },
        setItem(key: string, value: string) {
            this.storage[key] = value;
        },
        removeItem(key: string) {
            delete this.storage[key];
        }
    };

    beforeEach(() => {
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });
        jest.clearAllMocks();
    });

    it('should clear all localStorage data', () => {
        localStorage.setItem('key1', 'value1');
        localStorage.setItem('key2', 'value2');
        localStorage.setItem('key3', 'value3');
        
        clearStorage();
        expect(localStorage.getItem('key1')).toBeNull();
        expect(localStorage.getItem('key2')).toBeNull();
        expect(localStorage.getItem('key3')).toBeNull();
    });
});
