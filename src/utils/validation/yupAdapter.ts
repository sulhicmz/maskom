import * as yup from 'yup';
import { PasswordRule, EmailRule } from './rules';

export function createEmailFieldSchema(label: string = "Email") {
    return yup.string()
        .required(`${label} diperlukan`)
        .matches(EmailRule.pattern, `${label} tidak valid`)
        .label(label);
}

export function createPasswordFieldSchema(label: string = "Kata sandi") {
    return yup.string()
        .required(`${label} diperlukan`)
        .min(PasswordRule.minLength || 8, `${label} minimal 8 karakter`)
        .label(label);
}

export function createNameFieldSchema(label: string = "Nama") {
    return yup.string()
        .required(`${label} diperlukan`)
        .min(2, `${label} minimal 2 karakter`)
        .label(label);
}

export function createRequiredFieldSchema(label: string) {
    return yup.string()
        .required(`${label} diperlukan`)
        .label(label);
}

export function createEmailPasswordSchema(emailLabel: string = "Email", passwordLabel: string = "Kata sandi") {
    return yup.object().shape({
        email: createEmailFieldSchema(emailLabel),
        password: createPasswordFieldSchema(passwordLabel)
    }).required();
}

export function createContactFormSchema() {
    return yup.object().shape({
        user_name: createNameFieldSchema("Nama"),
        user_email: createEmailFieldSchema("Email"),
        message: createRequiredFieldSchema("Pesan")
    }).required();
}

export function createSignUpFormSchema() {
    return yup.object().shape({
        name: createNameFieldSchema("Nama"),
        email: createEmailFieldSchema("Email"),
        password: createPasswordFieldSchema("Kata sandi")
    }).required();
}

export function createBlogFormSchema() {
    return yup.object().shape({
        name: createNameFieldSchema("Nama"),
        email: createEmailFieldSchema("Email"),
        message: createRequiredFieldSchema("Pesan")
    }).required();
}

export function createNewsletterFormSchema() {
    return yup.object().shape({
        email: createEmailFieldSchema("Email")
    }).required();
}

export function createCommentFormSchema() {
    return yup.object().shape({
        name: createNameFieldSchema("Nama"),
        email: createEmailFieldSchema("Email"),
        content: yup.string()
            .required("Komentar diperlukan")
            .min(10, "Komentar minimal 10 karakter")
            .max(1000, "Komentar maksimal 1000 karakter")
            .label("Komentar")
    }).required();
}
