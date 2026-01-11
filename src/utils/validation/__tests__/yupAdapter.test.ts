import * as yup from 'yup';
import {
    createEmailFieldSchema,
    createPasswordFieldSchema,
    createNameFieldSchema,
    createRequiredFieldSchema,
    createEmailPasswordSchema,
    createContactFormSchema,
    createSignUpFormSchema,
    createBlogFormSchema
} from '../yupAdapter';

describe('Yup Adapter - createEmailFieldSchema', () => {
    test('should create schema with default label', () => {
        const schema = createEmailFieldSchema();
        expect(schema.type).toBe('string');
        
        expect(schema.isValidSync('test@example.com')).toBe(true);
    });

    test('should require email field', () => {
        const schema = createEmailFieldSchema();
        expect(() => schema.validateSync('')).toThrow('Email diperlukan');
    });

    test('should require undefined email', () => {
        const schema = createEmailFieldSchema();
        expect(() => schema.validateSync(undefined as unknown as string)).toThrow('Email diperlukan');
    });

    test('should validate valid email format', () => {
        const schema = createEmailFieldSchema();
        expect(schema.isValidSync('test@example.com')).toBe(true);
        expect(schema.isValidSync('user.name+tag@example.co.uk')).toBe(true);
        expect(schema.isValidSync('first.last@domain.org')).toBe(true);
    });

    test('should reject invalid email format', () => {
        const schema = createEmailFieldSchema();
        expect(schema.isValidSync('invalid')).toBe(false);
        expect(schema.isValidSync('@example.com')).toBe(false);
        expect(schema.isValidSync('test@')).toBe(false);
    });

    test('should use custom label in required error message', () => {
        const schema = createEmailFieldSchema('Alamat Email');
        expect(() => schema.validateSync('')).toThrow('Alamat Email diperlukan');
    });

    test('should use custom label in format error message', () => {
        const schema = createEmailFieldSchema('Alamat Email');
        expect(() => schema.validateSync('invalid')).toThrow('Alamat Email tidak valid');
    });

    test('should set label field', () => {
        const schema = createEmailFieldSchema('Custom Email');
        expect(schema.spec.label).toBe('Custom Email');
    });
});

describe('Yup Adapter - createPasswordFieldSchema', () => {
    test('should create schema with default label', () => {
        const schema = createPasswordFieldSchema();
        expect(schema.type).toBe('string');
    });

    test('should require password field', () => {
        const schema = createPasswordFieldSchema();
        expect(() => schema.validateSync('')).toThrow('Kata sandi diperlukan');
    });

    test('should require undefined password', () => {
        const schema = createPasswordFieldSchema();
        expect(() => schema.validateSync(undefined as unknown as string)).toThrow('Kata sandi diperlukan');
    });

    test('should validate password with minimum 8 characters', () => {
        const schema = createPasswordFieldSchema();
        expect(schema.isValidSync('12345678')).toBe(true);
        expect(schema.isValidSync('abcdefgh')).toBe(true);
        expect(schema.isValidSync('Abc123!@')).toBe(true);
    });

    test('should reject password with less than 8 characters', () => {
        const schema = createPasswordFieldSchema();
        expect(schema.isValidSync('')).toBe(false);
        expect(schema.isValidSync('1234567')).toBe(false);
        expect(schema.isValidSync('abc')).toBe(false);
    });

    test('should use custom label in required error message', () => {
        const schema = createPasswordFieldSchema('Password');
        expect(() => schema.validateSync('')).toThrow('Password diperlukan');
    });

    test('should use custom label in min error message', () => {
        const schema = createPasswordFieldSchema('Password');
        expect(() => schema.validateSync('short')).toThrow('Password minimal 8 karakter');
    });

    test('should set label field', () => {
        const schema = createPasswordFieldSchema('Custom Password');
        expect(schema.spec.label).toBe('Custom Password');
    });
});

describe('Yup Adapter - createNameFieldSchema', () => {
    test('should create schema with default label', () => {
        const schema = createNameFieldSchema();
        expect(schema.type).toBe('string');
    });

    test('should require name field', () => {
        const schema = createNameFieldSchema();
        expect(() => schema.validateSync('')).toThrow('Nama diperlukan');
    });

    test('should validate name with minimum 2 characters', () => {
        const schema = createNameFieldSchema();
        expect(schema.isValidSync('AB')).toBe(true);
        expect(schema.isValidSync('John')).toBe(true);
        expect(schema.isValidSync('Jane Doe')).toBe(true);
    });

    test('should reject name with less than 2 characters', () => {
        const schema = createNameFieldSchema();
        expect(schema.isValidSync('')).toBe(false);
        expect(schema.isValidSync('A')).toBe(false);
    });

    test('should use custom label in required error message', () => {
        const schema = createNameFieldSchema('Full Name');
        expect(() => schema.validateSync('')).toThrow('Full Name diperlukan');
    });

    test('should use custom label in min error message', () => {
        const schema = createNameFieldSchema('Full Name');
        expect(() => schema.validateSync('A')).toThrow('Full Name minimal 2 karakter');
    });

    test('should set label field', () => {
        const schema = createNameFieldSchema('Custom Name');
        expect(schema.spec.label).toBe('Custom Name');
    });
});

describe('Yup Adapter - createRequiredFieldSchema', () => {
    test('should create schema with provided label', () => {
        const schema = createRequiredFieldSchema('Test Field');
        expect(schema.type).toBe('string');
    });

    test('should require field with provided label', () => {
        const schema = createRequiredFieldSchema('Test Field');
        expect(() => schema.validateSync('')).toThrow('Test Field diperlukan');
    });

    test('should validate non-empty string', () => {
        const schema = createRequiredFieldSchema('Test Field');
        expect(schema.isValidSync('test')).toBe(true);
        expect(schema.isValidSync('a')).toBe(true);
        expect(schema.isValidSync('test content')).toBe(true);
    });

    test('should reject empty string', () => {
        const schema = createRequiredFieldSchema('Test Field');
        expect(schema.isValidSync('')).toBe(false);
    });

    test('should reject undefined', () => {
        const schema = createRequiredFieldSchema('Test Field');
        expect(schema.isValidSync(undefined as unknown as string)).toBe(false);
    });

    test('should set label field', () => {
        const schema = createRequiredFieldSchema('Custom Label');
        expect(schema.spec.label).toBe('Custom Label');
    });

    test('should work with various label names', () => {
        const schema1 = createRequiredFieldSchema('Pesan');
        expect(() => schema1.validateSync('')).toThrow('Pesan diperlukan');
        
        const schema2 = createRequiredFieldSchema('Komentar');
        expect(() => schema2.validateSync('')).toThrow('Komentar diperlukan');
    });
});

describe('Yup Adapter - createEmailPasswordSchema', () => {
    test('should create object schema with email and password fields', () => {
        const schema = createEmailPasswordSchema();
        const validData = { email: 'test@example.com', password: '12345678' };
        expect(schema.isValidSync(validData)).toBe(true);
    });

    test('should require both email and password', () => {
        const schema = createEmailPasswordSchema();
        expect(() => schema.validateSync({ email: '', password: '12345678' })).toThrow('Email diperlukan');
        expect(() => schema.validateSync({ email: 'test@example.com', password: '' })).toThrow('Kata sandi diperlukan');
    });

    test('should validate email format', () => {
        const schema = createEmailPasswordSchema();
        expect(schema.isValidSync({ email: 'invalid', password: '12345678' })).toBe(false);
    });

    test('should validate password minimum length', () => {
        const schema = createEmailPasswordSchema();
        expect(schema.isValidSync({ email: 'test@example.com', password: '1234567' })).toBe(false);
    });

    test('should use default labels in error messages', () => {
        const schema = createEmailPasswordSchema();
        expect(() => schema.validateSync({ email: '', password: '12345678' })).toThrow('Email diperlukan');
        expect(() => schema.validateSync({ email: 'test@example.com', password: '' })).toThrow('Kata sandi diperlukan');
    });

    test('should use custom labels in error messages', () => {
        const schema = createEmailPasswordSchema('Alamat Email', 'Password');
        expect(() => schema.validateSync({ email: '', password: '12345678' })).toThrow('Alamat Email diperlukan');
        expect(() => schema.validateSync({ email: 'test@example.com', password: '' })).toThrow('Password diperlukan');
    });

    test('should require object (not undefined)', () => {
        const schema = createEmailPasswordSchema();
        expect(() => schema.validateSync(undefined as unknown)).toThrow();
    });
});

describe('Yup Adapter - createContactFormSchema', () => {
    test('should create schema with user_name, user_email, and message fields', () => {
        const schema = createContactFormSchema();
        const validData = {
            user_name: 'John Doe',
            user_email: 'john@example.com',
            message: 'Test message'
        };
        expect(schema.isValidSync(validData)).toBe(true);
    });

    test('should require user_name field', () => {
        const schema = createContactFormSchema();
        expect(() => schema.validateSync({
            user_name: '',
            user_email: 'test@example.com',
            message: 'test'
        })).toThrow('Nama diperlukan');
    });

    test('should require user_email field', () => {
        const schema = createContactFormSchema();
        expect(() => schema.validateSync({
            user_name: 'John Doe',
            user_email: '',
            message: 'test'
        })).toThrow('Email diperlukan');
    });

    test('should require message field', () => {
        const schema = createContactFormSchema();
        expect(() => schema.validateSync({
            user_name: 'John Doe',
            user_email: 'test@example.com',
            message: ''
        })).toThrow('Pesan diperlukan');
    });

    test('should validate user_name minimum length', () => {
        const schema = createContactFormSchema();
        expect(schema.isValidSync({
            user_name: 'J',
            user_email: 'test@example.com',
            message: 'test'
        })).toBe(false);
    });

    test('should validate user_email format', () => {
        const schema = createContactFormSchema();
        expect(schema.isValidSync({
            user_name: 'John Doe',
            user_email: 'invalid',
            message: 'test'
        })).toBe(false);
    });

    test('should require object (not undefined)', () => {
        const schema = createContactFormSchema();
        expect(() => schema.validateSync(undefined as unknown)).toThrow();
    });
});

describe('Yup Adapter - createSignUpFormSchema', () => {
    test('should create schema with name, email, and password fields', () => {
        const schema = createSignUpFormSchema();
        const validData = {
            name: 'John Doe',
            email: 'john@example.com',
            password: '12345678'
        };
        expect(schema.isValidSync(validData)).toBe(true);
    });

    test('should require name field', () => {
        const schema = createSignUpFormSchema();
        expect(() => schema.validateSync({
            name: '',
            email: 'test@example.com',
            password: '12345678'
        })).toThrow('Nama diperlukan');
    });

    test('should require email field', () => {
        const schema = createSignUpFormSchema();
        expect(() => schema.validateSync({
            name: 'John Doe',
            email: '',
            password: '12345678'
        })).toThrow('Email diperlukan');
    });

    test('should require password field', () => {
        const schema = createSignUpFormSchema();
        expect(() => schema.validateSync({
            name: 'John Doe',
            email: 'test@example.com',
            password: ''
        })).toThrow('Kata sandi diperlukan');
    });

    test('should validate name minimum length', () => {
        const schema = createSignUpFormSchema();
        expect(schema.isValidSync({
            name: 'J',
            email: 'test@example.com',
            password: '12345678'
        })).toBe(false);
    });

    test('should validate email format', () => {
        const schema = createSignUpFormSchema();
        expect(schema.isValidSync({
            name: 'John Doe',
            email: 'invalid',
            password: '12345678'
        })).toBe(false);
    });

    test('should validate password minimum length', () => {
        const schema = createSignUpFormSchema();
        expect(schema.isValidSync({
            name: 'John Doe',
            email: 'test@example.com',
            password: '1234567'
        })).toBe(false);
    });

    test('should require object (not undefined)', () => {
        const schema = createSignUpFormSchema();
        expect(() => schema.validateSync(undefined as unknown)).toThrow();
    });
});

describe('Yup Adapter - createBlogFormSchema', () => {
    test('should create schema with name, email, and message fields', () => {
        const schema = createBlogFormSchema();
        const validData = {
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Test comment'
        };
        expect(schema.isValidSync(validData)).toBe(true);
    });

    test('should require name field', () => {
        const schema = createBlogFormSchema();
        expect(() => schema.validateSync({
            name: '',
            email: 'test@example.com',
            message: 'test'
        })).toThrow('Nama diperlukan');
    });

    test('should require email field', () => {
        const schema = createBlogFormSchema();
        expect(() => schema.validateSync({
            name: 'John Doe',
            email: '',
            message: 'test'
        })).toThrow('Email diperlukan');
    });

    test('should require message field', () => {
        const schema = createBlogFormSchema();
        expect(() => schema.validateSync({
            name: 'John Doe',
            email: 'test@example.com',
            message: ''
        })).toThrow('Pesan diperlukan');
    });

    test('should validate name minimum length', () => {
        const schema = createBlogFormSchema();
        expect(schema.isValidSync({
            name: 'J',
            email: 'test@example.com',
            message: 'test'
        })).toBe(false);
    });

    test('should validate email format', () => {
        const schema = createBlogFormSchema();
        expect(schema.isValidSync({
            name: 'John Doe',
            email: 'invalid',
            message: 'test'
        })).toBe(false);
    });

    test('should require object (not undefined)', () => {
        const schema = createBlogFormSchema();
        expect(() => schema.validateSync(undefined as unknown)).toThrow();
    });
});

describe('Yup Adapter - Schema Type Safety', () => {
    test('createEmailFieldSchema should return yup StringSchema', () => {
        const schema = createEmailFieldSchema();
        expect(schema).toBeInstanceOf(yup.StringSchema);
    });

    test('createPasswordFieldSchema should return yup StringSchema', () => {
        const schema = createPasswordFieldSchema();
        expect(schema).toBeInstanceOf(yup.StringSchema);
    });

    test('createNameFieldSchema should return yup StringSchema', () => {
        const schema = createNameFieldSchema();
        expect(schema).toBeInstanceOf(yup.StringSchema);
    });

    test('createRequiredFieldSchema should return yup StringSchema', () => {
        const schema = createRequiredFieldSchema('Test');
        expect(schema).toBeInstanceOf(yup.StringSchema);
    });

    test('createEmailPasswordSchema should return yup ObjectSchema', () => {
        const schema = createEmailPasswordSchema();
        expect(schema).toBeInstanceOf(yup.ObjectSchema);
    });

    test('createContactFormSchema should return yup ObjectSchema', () => {
        const schema = createContactFormSchema();
        expect(schema).toBeInstanceOf(yup.ObjectSchema);
    });

    test('createSignUpFormSchema should return yup ObjectSchema', () => {
        const schema = createSignUpFormSchema();
        expect(schema).toBeInstanceOf(yup.ObjectSchema);
    });

    test('createBlogFormSchema should return yup ObjectSchema', () => {
        const schema = createBlogFormSchema();
        expect(schema).toBeInstanceOf(yup.ObjectSchema);
    });
});

describe('Yup Adapter - Edge Cases', () => {
    test('should handle whitespace in email field', () => {
        const schema = createEmailFieldSchema();
        expect(schema.isValidSync(' test@example.com ')).toBe(false);
        expect(schema.isValidSync('  test@example.com')).toBe(false);
        expect(schema.isValidSync('test@example.com  ')).toBe(false);
    });

    test('should handle whitespace in name field', () => {
        const schema = createNameFieldSchema();
        expect(schema.isValidSync(' John Doe ')).toBe(true);
    });

    test('should handle whitespace in password field', () => {
        const schema = createPasswordFieldSchema();
        expect(schema.isValidSync(' 12345678 ')).toBe(true);
        expect(schema.isValidSync('12345678  ')).toBe(true);
        expect(schema.isValidSync('  12345678')).toBe(true);
    });

    test('should handle whitespace in name field', () => {
        const schema = createNameFieldSchema();
        expect(schema.isValidSync(' John Doe ')).toBe(true);
    });

    test('should handle whitespace in password field', () => {
        const schema = createPasswordFieldSchema();
        expect(schema.isValidSync(' 12345678 ')).toBe(true);
    });

    test('should handle Unicode characters in name', () => {
        const schema = createNameFieldSchema();
        expect(schema.isValidSync('John Döe')).toBe(true);
        expect(schema.isValidSync('李明')).toBe(true);
    });

    test('should handle special characters in email', () => {
        const schema = createEmailFieldSchema();
        expect(schema.isValidSync('user+tag@example.com')).toBe(true);
        expect(schema.isValidSync('user.name@example.co.uk')).toBe(true);
    });
});
