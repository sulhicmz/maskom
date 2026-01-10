export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email || email.trim() === '') {
        return { valid: false, error: 'Email diperlukan' };
    }
    if (!isValidEmail(email)) {
        return { valid: false, error: 'Format email tidak valid' };
    }
    return { valid: true };
}

export function validatePassword(password: string, minLength: number = 8): { valid: boolean; error?: string } {
    if (!password || password.trim() === '') {
        return { valid: false, error: 'Kata sandi diperlukan' };
    }
    if (password.length < minLength) {
        return { valid: false, error: `Kata sandi minimal ${minLength} karakter` };
    }
    return { valid: true };
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; error?: string } {
    if (!value || value.trim() === '') {
        return { valid: false, error: `${fieldName} diperlukan` };
    }
    return { valid: true };
}
