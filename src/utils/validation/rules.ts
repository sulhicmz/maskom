export interface ValidationRule<T = unknown> {
    name: string;
    validate: (value: T) => boolean;
    errorMessage: string;
}

export interface NumberValidationRule extends ValidationRule<number> {
    min?: number;
    max?: number;
}

export interface StringValidationRule extends ValidationRule<string> {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}

export const EmailRule: ValidationRule<string> & { pattern: RegExp } = {
    name: 'email',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    validate: (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    errorMessage: 'Format email tidak valid'
};

export const PasswordRule: StringValidationRule = {
    name: 'password',
    minLength: 8,
    validate: (value: string) => value.length >= 8,
    errorMessage: 'Kata sandi minimal 8 karakter'
};

export const RequiredRule: ValidationRule<string> = {
    name: 'required',
    validate: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    errorMessage: 'Field ini diperlukan'
};

export const MinLengthRule = (minLength: number): ValidationRule<string> => ({
    name: 'minLength',
    validate: (value: string) => value.length >= minLength,
    errorMessage: `Minimal ${minLength} karakter`
});

export const MaxLengthRule = (maxLength: number): ValidationRule<string> => ({
    name: 'maxLength',
    validate: (value: string) => value.length <= maxLength,
    errorMessage: `Maksimal ${maxLength} karakter`
});

export const PatternRule = (pattern: RegExp, errorMessage: string): ValidationRule<string> => ({
    name: 'pattern',
    validate: (value: string) => pattern.test(value),
    errorMessage
});
