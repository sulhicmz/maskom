import type { EmailTemplate, TemplateVariable } from '@/types/data';

const VARIABLE_REGEX = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

export interface VariableSubstitution {
  key: string;
  value: string;
  required: boolean;
}

export interface MissingVariableError {
  key: string;
  required: boolean;
}

export function parseTemplateVariables(template: string): string[] {
  const matches = template.matchAll(VARIABLE_REGEX);
  const variables = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      variables.add(match[1]);
    }
  }

  return Array.from(variables);
}

export function substituteVariables(
  template: string,
  substitutions: VariableSubstitution[],
): string {
  let result = template;

  for (const substitution of substitutions) {
    const regex = new RegExp(`\\{\\{${substitution.key}\\}\\}`, 'g');
    result = result.replace(regex, substitution.value);
  }

  return result;
}

export function validateTemplateVariables(
  template: string,
  variables: TemplateVariable[],
): {
    isValid: boolean;
    missingVariables: string[];
    extraVariables: string[];
  } {
  const templateVariables = parseTemplateVariables(template);
  const definedVariables = new Map(
    variables.map((v) => [v.key, v.required]),
  );

  const missingVariables: string[] = [];
  const extraVariables: string[] = [];

  for (const templateVar of templateVariables) {
    if (!definedVariables.has(templateVar)) {
      missingVariables.push(templateVar);
    }
  }

  for (const definedVar of definedVariables.keys()) {
    if (!templateVariables.includes(definedVar)) {
      extraVariables.push(definedVar);
    }
  }

  return {
    isValid: missingVariables.length === 0 && extraVariables.length === 0,
    missingVariables,
    extraVariables,
  };
}

export function validateRequiredVariables(
  template: string,
  variables: TemplateVariable[],
  substitutions: VariableSubstitution[],
): MissingVariableError[] {
  const missing: MissingVariableError[] = [];
  const templateVariables = parseTemplateVariables(template);

  for (const variable of variables) {
    if (variable.required && templateVariables.includes(variable.key)) {
      const hasValue = substitutions.some((sub) => sub.key === variable.key && sub.value !== '');
      if (!hasValue) {
        missing.push({
          key: variable.key,
          required: variable.required,
        });
      }
    }
  }

  return missing;
}

export function substituteTemplateVariables(
  template: EmailTemplate,
  substitutions: VariableSubstitution[],
): {
  subject: string;
  body: string;
  errors: string[];
} {
  const errors: string[] = [];
  const missingRequired = validateRequiredVariables(template.body, template.variables, substitutions);

  if (missingRequired.length > 0) {
    errors.push(
      `Missing required variables: ${missingRequired.map((m) => m.key).join(', ')}`,
    );
  }

  const subject = substituteVariables(template.subject, substitutions);
  const body = substituteVariables(template.body, substitutions);

  return {
    subject,
    body,
    errors,
  };
}