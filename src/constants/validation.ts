export const VALIDATION = {
    MIN_PASSWORD_LENGTH: 8,
    RATING_MIN: 0,
    RATING_MAX: 5
} as const;

export const PASSWORD_VALIDATION = {
    MIN_LENGTH: VALIDATION.MIN_PASSWORD_LENGTH,
    ERROR_MESSAGE: 'Kata sandi minimal 8 karakter'
} as const;

export const EMAIL_VALIDATION = {
    ERROR_MESSAGE: 'Format email tidak valid'
} as const;

export const REQUIRED_VALIDATION = {
    ERROR_MESSAGE: 'Field ini diperlukan'
} as const;
