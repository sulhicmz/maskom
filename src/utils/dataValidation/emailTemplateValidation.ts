import type { EmailTemplate, TemplateVariable } from "@/types/data";
import { createValidator } from "./baseValidation";

const VARIABLE_REGEX = /^\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}$/;

export const validateTemplateVariable = (item: TemplateVariable) => {
  const errors: string[] = [];

  if (typeof item.key !== 'string' || item.key.trim() === '') {
    errors.push('TemplateVariable.key must be a non-empty string');
  } else if (!VARIABLE_REGEX.test(`{{${item.key}}}`)) {
    errors.push(`TemplateVariable.key "${item.key}" must match variable format (e.g., {{authorName}})`);
  }

  if (typeof item.description !== 'string' || item.description.trim() === '') {
    errors.push('TemplateVariable.description must be a non-empty string');
  }

  if (typeof item.required !== 'boolean') {
    errors.push('TemplateVariable.required must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEmailTemplate = createValidator<EmailTemplate>({
  typeName: 'EmailTemplate',
  baseValidation: false,
  stringFields: [
    { key: 'name', required: true },
    { key: 'subject', required: true },
    { key: 'body', required: true },
    { key: 'category', required: true },
  ],
  arrayFields: [
    {
      key: 'tags',
      required: false,
      itemValidator: (item: unknown) => {
        if (typeof item !== 'string') {
          return 'EmailTemplate.tags must be an array of strings';
        }
        return null;
      },
    },
  ],
  customRules: [
    (item) => {
      if (!item.variables || !Array.isArray(item.variables)) {
        return 'EmailTemplate.variables must be an array';
      }
      return null;
    },
    (item) => {
      if (!item.createdAt || typeof item.createdAt !== 'string') {
        return 'EmailTemplate.createdAt must be an ISO 8601 date string';
      }
      return null;
    },
    (item) => {
      if (!item.updatedAt || typeof item.updatedAt !== 'string') {
        return 'EmailTemplate.updatedAt must be an ISO 8601 date string';
      }
      return null;
    },
    (item) => {
      if (item.sentCount !== undefined && typeof item.sentCount !== 'number') {
        return 'EmailTemplate.sentCount must be a number';
      }
      return null;
    },
  ],
});

export const validateEmailTemplates = (templates: EmailTemplate[]) => {
  const errors: string[] = [];

  templates.forEach((template, index) => {
    const result = validateEmailTemplate(template);
    if (!result.isValid) {
      errors.push(`EmailTemplate[${index}]: ${result.errors.join(', ')}`);
    }

    if (template.variables && Array.isArray(template.variables)) {
      template.variables.forEach((variable, varIndex) => {
        const varResult = validateTemplateVariable(variable);
        if (!varResult.isValid) {
          errors.push(`EmailTemplate[${index}].variables[${varIndex}]: ${varResult.errors.join(', ')}`);
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};