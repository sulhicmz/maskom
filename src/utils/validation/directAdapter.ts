import { EmailRule, PasswordRule, RequiredRule } from './rules';

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export function validateEmail(email: string): ValidationResult {
    if (!email || email.trim() === '') {
        return { valid: false, error: 'Email diperlukan' };
    }
    if (!EmailRule.validate(email)) {
        return { valid: false, error: EmailRule.errorMessage };
    }
    return { valid: true };
}

export function validatePassword(password: string, minLength: number = 8): ValidationResult {
    if (!password || password.trim() === '') {
        return { valid: false, error: 'Kata sandi diperlukan' };
    }
    if (password.length < minLength) {
        return { valid: false, error: PasswordRule.errorMessage };
    }
    return { valid: true };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
    if (!value || value.trim() === '') {
        return { valid: false, error: RequiredRule.errorMessage.replace('Field ini', fieldName) };
    }
    return { valid: true };
}
