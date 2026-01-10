import * as yup from "yup";

export function createEmailFieldSchema(label: string): yup.StringSchema<string | undefined, yup.AnyObject, undefined, "" | undefined> {
    return yup.string().required(`${label} diperlukan`).email(`${label} tidak valid`).label(label);
}

export function createPasswordFieldSchema(label: string): yup.StringSchema<string | undefined, yup.AnyObject, undefined, "" | undefined> {
    return yup.string().required(`${label} diperlukan`).min(8, `${label} minimal 8 karakter`).label(label);
}

export function createNameFieldSchema(label: string): yup.StringSchema<string | undefined, yup.AnyObject, undefined, "" | undefined> {
    return yup.string().required(`${label} diperlukan`).label(label);
}

export function createRequiredFieldSchema(label: string): yup.StringSchema<string | undefined, yup.AnyObject, undefined, "" | undefined> {
    return yup.string().required(`${label} diperlukan`).label(label);
}

export function createEmailPasswordSchema(emailLabel: string = "Email", passwordLabel: string = "Kata sandi"): yup.ObjectSchema<{ email: string; password: string }> {
    return yup.object({
        email: createEmailFieldSchema(emailLabel),
        password: createPasswordFieldSchema(passwordLabel),
    }).required();
}

export function createContactFormSchema(): yup.ObjectSchema<{ user_name: string; user_email: string; message: string }> {
    return yup.object({
        user_name: createNameFieldSchema("Nama"),
        user_email: createEmailFieldSchema("Email"),
        message: createRequiredFieldSchema("Pesan"),
    }).required();
}

export function createSignUpFormSchema(): yup.ObjectSchema<{ name: string; email: string; password: string }> {
    return yup.object({
        name: createNameFieldSchema("Nama"),
        email: createEmailFieldSchema("Email"),
        password: createPasswordFieldSchema("Kata sandi"),
    }).required();
}

export function createBlogFormSchema(): yup.ObjectSchema<{ name: string; email: string; message: string }> {
    return yup.object({
        name: createNameFieldSchema("Nama"),
        email: createEmailFieldSchema("Email"),
        message: createRequiredFieldSchema("Pesan"),
    }).required();
}
