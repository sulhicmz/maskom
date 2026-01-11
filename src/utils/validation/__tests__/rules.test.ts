import {
    EmailRule,
    PasswordRule,
    RequiredRule,
    MinLengthRule,
    MaxLengthRule,
    PatternRule,
    ValidationRule,
    StringValidationRule
} from '../rules';

describe('Validation Rules - EmailRule', () => {
    test('should have correct rule name', () => {
        expect(EmailRule.name).toBe('email');
    });

    test('should have correct regex pattern', () => {
        expect(EmailRule.pattern).toStrictEqual(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    test('should have correct error message', () => {
        expect(EmailRule.errorMessage).toBe('Format email tidak valid');
    });

    test('should validate valid email addresses', () => {
        expect(EmailRule.validate('test@example.com')).toBe(true);
        expect(EmailRule.validate('user.name+tag@example.co.uk')).toBe(true);
        expect(EmailRule.validate('first.last@domain.org')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
        expect(EmailRule.validate('')).toBe(false);
        expect(EmailRule.validate('invalid')).toBe(false);
        expect(EmailRule.validate('@example.com')).toBe(false);
        expect(EmailRule.validate('test@')).toBe(false);
        expect(EmailRule.validate('test@.com')).toBe(false);
        expect(EmailRule.validate('test example.com')).toBe(false);
        expect(EmailRule.validate('test@example')).toBe(false);
    });

    test('should reject emails with spaces', () => {
        expect(EmailRule.validate('test @example.com')).toBe(false);
        expect(EmailRule.validate('test@ example.com')).toBe(false);
        expect(EmailRule.validate('test @ example.com')).toBe(false);
    });

    test('should reject emails with multiple @', () => {
        expect(EmailRule.validate('test@@example.com')).toBe(false);
        expect(EmailRule.validate('test@exam@ple.com')).toBe(false);
    });
});

describe('Validation Rules - PasswordRule', () => {
    test('should have correct rule name', () => {
        expect(PasswordRule.name).toBe('password');
    });

    test('should have correct min length', () => {
        expect(PasswordRule.minLength).toBe(8);
    });

    test('should have correct error message', () => {
        expect(PasswordRule.errorMessage).toBe('Kata sandi minimal 8 karakter');
    });

    test('should validate passwords with 8 or more characters', () => {
        expect(PasswordRule.validate('12345678')).toBe(true);
        expect(PasswordRule.validate('abcdefgh')).toBe(true);
        expect(PasswordRule.validate('Abc123!@')).toBe(true);
        expect(PasswordRule.validate('a'.repeat(20))).toBe(true);
    });

    test('should reject passwords with less than 8 characters', () => {
        expect(PasswordRule.validate('')).toBe(false);
        expect(PasswordRule.validate('1234567')).toBe(false);
        expect(PasswordRule.validate('abc')).toBe(false);
        expect(PasswordRule.validate('Abc1!')).toBe(false);
    });

    test('should reject passwords with exactly 7 characters', () => {
        expect(PasswordRule.validate('1234567')).toBe(false);
        expect(PasswordRule.validate('aaaaaaa')).toBe(false);
    });
});

describe('Validation Rules - RequiredRule', () => {
    test('should have correct rule name', () => {
        expect(RequiredRule.name).toBe('required');
    });

    test('should have correct error message', () => {
        expect(RequiredRule.errorMessage).toBe('Field ini diperlukan');
    });

    test('should validate non-empty strings', () => {
        expect(RequiredRule.validate('test')).toBe(true);
        expect(RequiredRule.validate('a')).toBe(true);
        expect(RequiredRule.validate(' hello ')).toBe(true);
    });

    test('should reject undefined values', () => {
        expect(RequiredRule.validate(undefined as unknown as string)).toBe(false);
    });

    test('should reject null values', () => {
        expect(RequiredRule.validate(null as unknown as string)).toBe(false);
    });

    test('should reject empty strings', () => {
        expect(RequiredRule.validate('')).toBe(false);
    });

    test('should reject whitespace-only strings', () => {
        expect(RequiredRule.validate(' ')).toBe(false);
        expect(RequiredRule.validate('  ')).toBe(false);
        expect(RequiredRule.validate('\t')).toBe(false);
        expect(RequiredRule.validate('\n')).toBe(false);
    });
});

describe('Validation Rules - MinLengthRule', () => {
    test('should create rule with correct min length', () => {
        const rule = MinLengthRule(5);
        expect(rule.name).toBe('minLength');
        expect(rule.validate('hello')).toBe(true);
    });

    test('should have correct error message with min length', () => {
        const rule = MinLengthRule(5);
        expect(rule.errorMessage).toBe('Minimal 5 karakter');
    });

    test('should validate strings at or above min length', () => {
        const rule = MinLengthRule(5);
        expect(rule.validate('hello')).toBe(true);
        expect(rule.validate('hello world')).toBe(true);
        expect(rule.validate('a'.repeat(10))).toBe(true);
    });

    test('should reject strings below min length', () => {
        const rule = MinLengthRule(5);
        expect(rule.validate('')).toBe(false);
        expect(rule.validate('hell')).toBe(false);
        expect(rule.validate('a'.repeat(4))).toBe(false);
    });

    test('should handle zero min length', () => {
        const rule = MinLengthRule(0);
        expect(rule.validate('')).toBe(true);
        expect(rule.validate('a')).toBe(true);
    });

    test('should handle negative min length', () => {
        const rule = MinLengthRule(-1);
        expect(rule.validate('')).toBe(true);
        expect(rule.errorMessage).toBe('Minimal -1 karakter');
    });
});

describe('Validation Rules - MaxLengthRule', () => {
    test('should create rule with correct max length', () => {
        const rule = MaxLengthRule(10);
        expect(rule.name).toBe('maxLength');
        expect(rule.validate('hello')).toBe(true);
    });

    test('should have correct error message with max length', () => {
        const rule = MaxLengthRule(10);
        expect(rule.errorMessage).toBe('Maksimal 10 karakter');
    });

    test('should validate strings at or below max length', () => {
        const rule = MaxLengthRule(10);
        expect(rule.validate('')).toBe(true);
        expect(rule.validate('hello')).toBe(true);
        expect(rule.validate('hello wo')).toBe(true);
        expect(rule.validate('a'.repeat(10))).toBe(true);
    });

    test('should reject strings above max length', () => {
        const rule = MaxLengthRule(10);
        expect(rule.validate('a'.repeat(11))).toBe(false);
        expect(rule.validate('hello world!')).toBe(false);
    });

    test('should handle zero max length', () => {
        const rule = MaxLengthRule(0);
        expect(rule.validate('')).toBe(true);
        expect(rule.validate('a')).toBe(false);
    });
});

describe('Validation Rules - PatternRule', () => {
    test('should create rule with pattern and error message', () => {
        const pattern = /^[A-Z]+$/;
        const errorMessage = 'Hanya huruf kapital';
        const rule = PatternRule(pattern, errorMessage);
        expect(rule.name).toBe('pattern');
        expect(rule.errorMessage).toBe(errorMessage);
    });

    test('should validate strings matching pattern', () => {
        const rule = PatternRule(/^[A-Z]+$/, 'Hanya huruf kapital');
        expect(rule.validate('HELLO')).toBe(true);
        expect(rule.validate('ABC')).toBe(true);
    });

    test('should reject strings not matching pattern', () => {
        const rule = PatternRule(/^[A-Z]+$/, 'Hanya huruf kapital');
        expect(rule.validate('hello')).toBe(false);
        expect(rule.validate('Hello')).toBe(false);
        expect(rule.validate('hello world')).toBe(false);
    });

    test('should work with numeric patterns', () => {
        const rule = PatternRule(/^\d+$/, 'Hanya angka');
        expect(rule.validate('12345')).toBe(true);
        expect(rule.validate('abc')).toBe(false);
        expect(rule.validate('12a34')).toBe(false);
    });

    test('should work with complex patterns', () => {
        const rule = PatternRule(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Email pattern');
        expect(rule.validate('test@example.com')).toBe(true);
        expect(rule.validate('invalid')).toBe(false);
    });

    test('should handle empty string with optional pattern', () => {
        const rule = PatternRule(/^[A-Z]*$/, 'Hanya huruf kapital atau kosong');
        expect(rule.validate('')).toBe(true);
        expect(rule.validate('HELLO')).toBe(true);
        expect(rule.validate('hello')).toBe(false);
    });
});

describe('Validation Rules - Type Safety', () => {
    test('EmailRule should extend ValidationRule', () => {
        const rule: ValidationRule<string> = EmailRule;
        expect(rule.validate('test@example.com')).toBe(true);
    });

    test('PasswordRule should extend StringValidationRule', () => {
        const rule: StringValidationRule = PasswordRule;
        expect(rule.minLength).toBe(8);
        expect(rule.validate('12345678')).toBe(true);
    });

    test('RequiredRule should extend ValidationRule', () => {
        const rule: ValidationRule<string> = RequiredRule;
        expect(rule.validate('test')).toBe(true);
    });

    test('PatternRule should return ValidationRule', () => {
        const rule: ValidationRule<string> = PatternRule(/^[A-Z]+$/, 'Hanya huruf kapital');
        expect(rule.validate('HELLO')).toBe(true);
    });
});

describe('Validation Rules - Edge Cases', () => {
    test('EmailRule should handle very long valid emails', () => {
        const longEmail = `a${'b'.repeat(100)}@example.com`;
        expect(EmailRule.validate(longEmail)).toBe(true);
    });

    test('PasswordRule should handle very long passwords', () => {
        const longPassword = 'a'.repeat(1000);
        expect(PasswordRule.validate(longPassword)).toBe(true);
    });

    test('MinLengthRule should handle large min length', () => {
        const rule = MinLengthRule(100);
        expect(rule.validate('a'.repeat(100))).toBe(true);
        expect(rule.validate('a'.repeat(99))).toBe(false);
    });

    test('MaxLengthRule should handle large max length', () => {
        const rule = MaxLengthRule(1000);
        expect(rule.validate('a'.repeat(1000))).toBe(true);
        expect(rule.validate('a'.repeat(1001))).toBe(false);
    });
});
