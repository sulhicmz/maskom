import {
    validateEmail,
    validatePassword,
    validateRequired,
    type ValidationResult
} from '../directAdapter';

describe('Direct Adapter - validateEmail', () => {
    test('should return valid: true for valid email addresses', () => {
        expect(validateEmail('test@example.com')).toEqual({ valid: true });
        expect(validateEmail('user.name+tag@example.co.uk')).toEqual({ valid: true });
        expect(validateEmail('first.last@domain.org')).toEqual({ valid: true });
    });

    test('should return valid: false with error for empty string', () => {
        const result = validateEmail('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Email diperlukan');
    });

    test('should return valid: false with error for whitespace-only string', () => {
        const result = validateEmail('   ');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Email diperlukan');
    });

    test('should return valid: false with error for invalid email format', () => {
        const result1 = validateEmail('invalid');
        expect(result1.valid).toBe(false);
        expect(result1.error).toBe('Format email tidak valid');

        const result2 = validateEmail('@example.com');
        expect(result2.valid).toBe(false);
        expect(result2.error).toBe('Format email tidak valid');

        const result3 = validateEmail('test@');
        expect(result3.valid).toBe(false);
        expect(result3.error).toBe('Format email tidak valid');
    });

    test('should reject email with leading/trailing spaces', () => {
        expect(validateEmail(' test@example.com ')).toEqual({ valid: false, error: 'Format email tidak valid' });
        expect(validateEmail('  test@example.com')).toEqual({ valid: false, error: 'Format email tidak valid' });
        expect(validateEmail('test@example.com  ')).toEqual({ valid: false, error: 'Format email tidak valid' });
    });

    test('should reject emails without @ symbol', () => {
        const result = validateEmail('testexample.com');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Format email tidak valid');
    });

    test('should reject emails with multiple @ symbols', () => {
        const result = validateEmail('test@@example.com');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Format email tidak valid');
    });

    test('should return ValidationResult type', () => {
        const result: ValidationResult = validateEmail('test@example.com');
        expect(typeof result.valid).toBe('boolean');
        if (!result.valid) {
            expect(typeof result.error).toBe('string');
        }
    });
});

describe('Direct Adapter - validatePassword', () => {
    test('should return valid: true for passwords with 8 or more characters', () => {
        expect(validatePassword('12345678')).toEqual({ valid: true });
        expect(validatePassword('abcdefgh')).toEqual({ valid: true });
        expect(validatePassword('Abc123!@')).toEqual({ valid: true });
        expect(validatePassword('a'.repeat(20))).toEqual({ valid: true });
    });

    test('should return valid: false with error for empty string', () => {
        const result = validatePassword('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Kata sandi diperlukan');
    });

    test('should return valid: false with error for whitespace-only string', () => {
        const result = validatePassword('   ');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Kata sandi diperlukan');
    });

    test('should return valid: false with error for passwords with less than 8 characters', () => {
        const result1 = validatePassword('1234567');
        expect(result1.valid).toBe(false);
        expect(result1.error).toBe('Kata sandi minimal 8 karakter');

        const result2 = validatePassword('abc');
        expect(result2.valid).toBe(false);
        expect(result2.error).toBe('Kata sandi minimal 8 karakter');

        const result3 = validatePassword('Abc1!');
        expect(result3.valid).toBe(false);
        expect(result3.error).toBe('Kata sandi minimal 8 karakter');
    });

    test('should handle custom min length', () => {
        expect(validatePassword('123456', 6)).toEqual({ valid: true });
        expect(validatePassword('12345', 6)).toEqual({ valid: false, error: 'Kata sandi minimal 8 karakter' });
    });

    test('should handle password with leading/trailing spaces', () => {
        expect(validatePassword(' 12345678 ')).toEqual({ valid: true });
        expect(validatePassword('12345678  ')).toEqual({ valid: true });
        expect(validatePassword('  12345678')).toEqual({ valid: true });
    });

    test('should handle very long passwords', () => {
        expect(validatePassword('a'.repeat(100))).toEqual({ valid: true });
        expect(validatePassword('a'.repeat(1000))).toEqual({ valid: true });
    });

    test('should handle zero min length', () => {
        expect(validatePassword('a', 0)).toEqual({ valid: true });
        expect(validatePassword('12345678', 0)).toEqual({ valid: true });
    });

    test('should return ValidationResult type', () => {
        const result: ValidationResult = validatePassword('12345678');
        expect(typeof result.valid).toBe('boolean');
        if (!result.valid) {
            expect(typeof result.error).toBe('string');
        }
    });
});

describe('Direct Adapter - validateRequired', () => {
    test('should return valid: true for non-empty strings', () => {
        expect(validateRequired('test', 'Test Field')).toEqual({ valid: true });
        expect(validateRequired('a', 'Test Field')).toEqual({ valid: true });
        expect(validateRequired(' hello ', 'Test Field')).toEqual({ valid: true });
    });

    test('should return valid: false with error for empty string', () => {
        const result = validateRequired('', 'Test Field');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Test Field diperlukan');
    });

    test('should return valid: false with error for whitespace-only strings', () => {
        const result1 = validateRequired(' ', 'Test Field');
        expect(result1.valid).toBe(false);
        expect(result1.error).toBe('Test Field diperlukan');

        const result2 = validateRequired('  ', 'Test Field');
        expect(result2.valid).toBe(false);
        expect(result2.error).toBe('Test Field diperlukan');

        const result3 = validateRequired('\t', 'Test Field');
        expect(result3.valid).toBe(false);
        expect(result3.error).toBe('Test Field diperlukan');
    });

    test('should handle custom field name in error message', () => {
        const result1 = validateRequired('', 'Nama');
        expect(result1.error).toBe('Nama diperlukan');

        const result2 = validateRequired('', 'Email');
        expect(result2.error).toBe('Email diperlukan');

        const result3 = validateRequired('', 'Pesan');
        expect(result3.error).toBe('Pesan diperlukan');
    });

    test('should handle special characters in field name', () => {
        const result = validateRequired('', "User's Name");
        expect(result.error).toBe("User's Name diperlukan");
    });

    test('should return ValidationResult type', () => {
        const result: ValidationResult = validateRequired('test', 'Test Field');
        expect(typeof result.valid).toBe('boolean');
        if (!result.valid) {
            expect(typeof result.error).toBe('string');
        }
    });
});

describe('Direct Adapter - Error Message Consistency', () => {
    test('email error messages should match yup adapter', () => {
        expect(validateEmail('').error).toBe('Email diperlukan');
        expect(validateEmail('invalid').error).toBe('Format email tidak valid');
    });

    test('password error messages should match yup adapter', () => {
        expect(validatePassword('').error).toBe('Kata sandi diperlukan');
        expect(validatePassword('123').error).toBe('Kata sandi minimal 8 karakter');
    });

    test('required error messages should use field name correctly', () => {
        expect(validateRequired('', 'Nama').error).toBe('Nama diperlukan');
        expect(validateRequired('', 'Email').error).toBe('Email diperlukan');
    });
});

describe('Direct Adapter - Edge Cases', () => {
    describe('validateEmail edge cases', () => {
        test('should handle very long valid emails', () => {
            const longEmail = `a${'b'.repeat(100)}@example.com`;
            expect(validateEmail(longEmail)).toEqual({ valid: true });
        });

        test('should handle email with subdomains', () => {
            expect(validateEmail('test@mail.example.com')).toEqual({ valid: true });
            expect(validateEmail('user@sub.sub.example.com')).toEqual({ valid: true });
        });

        test('should handle email with numbers in domain', () => {
            expect(validateEmail('test@example123.com')).toEqual({ valid: true });
            expect(validateEmail('test@123.com')).toEqual({ valid: true });
        });
    });

    describe('validatePassword edge cases', () => {
        test('should handle password with special characters', () => {
            expect(validatePassword('!@#$%^&*()')).toEqual({ valid: true });
            expect(validatePassword('Abc123!@#')).toEqual({ valid: true });
        });

        test('should handle password with Unicode characters', () => {
            expect(validatePassword('12345678')).toEqual({ valid: true });
            expect(validatePassword('αβγδεζηθ')).toEqual({ valid: true });
        });
    });

    describe('validateRequired edge cases', () => {
        test('should handle string with only newlines', () => {
            const result = validateRequired('\n', 'Test');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Test diperlukan');
        });

        test('should handle string with only carriage return', () => {
            const result = validateRequired('\r', 'Test');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Test diperlukan');
        });
    });
});

describe('Direct Adapter - Type Safety', () => {
    test('validateEmail should accept string input', () => {
        const result: ValidationResult = validateEmail('test@example.com');
        expect(typeof result.valid).toBe('boolean');
    });

    test('validatePassword should accept string input and optional number', () => {
        const result1: ValidationResult = validatePassword('12345678');
        const result2: ValidationResult = validatePassword('12345678', 10);
        expect(typeof result1.valid).toBe('boolean');
        expect(typeof result2.valid).toBe('boolean');
    });

    test('validateRequired should accept string input and string field name', () => {
        const result: ValidationResult = validateRequired('test', 'Field');
        expect(typeof result.valid).toBe('boolean');
    });
});

describe('Direct Adapter - Consistency with Validation Rules', () => {
    test('validateEmail should use EmailRule from rules.ts', () => {
        const validEmail = 'test@example.com';
        const invalidEmail = 'invalid';
        
        expect(validateEmail(validEmail).valid).toBe(true);
        expect(validateEmail(invalidEmail).valid).toBe(false);
        expect(validateEmail(invalidEmail).error).toBe('Format email tidak valid');
    });

    test('validatePassword should use PasswordRule from rules.ts', () => {
        const validPassword = '12345678';
        const invalidPassword = '1234567';
        
        expect(validatePassword(validPassword).valid).toBe(true);
        expect(validatePassword(invalidPassword).valid).toBe(false);
        expect(validatePassword(invalidPassword).error).toBe('Kata sandi minimal 8 karakter');
    });

    test('validateRequired should use RequiredRule from rules.ts', () => {
        const validValue = 'test';
        const invalidValue = '';
        
        expect(validateRequired(validValue, 'Field').valid).toBe(true);
        expect(validateRequired(invalidValue, 'Field').valid).toBe(false);
        expect(validateRequired(invalidValue, 'Field').error).toBe('Field diperlukan');
    });
});
