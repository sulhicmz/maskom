import {
  parseTemplateVariables,
  substituteVariables,
  validateTemplateVariables,
  validateRequiredVariables,
  substituteTemplateVariables,
} from '../templateUtils';

import type { EmailTemplate, TemplateVariable } from '@/types/data';
import type { VariableSubstitution } from '../templateUtils';

describe('parseTemplateVariables', () => {
  it('should parse single variable from template', () => {
    const template = 'Hello {{userName}}!';
    const result = parseTemplateVariables(template);

    expect(result).toEqual(['userName']);
  });

  it('should parse multiple variables from template', () => {
    const template = 'Hello {{userName}}, your order {{orderId}} is ready!';
    const result = parseTemplateVariables(template);

    expect(result).toEqual(['userName', 'orderId']);
  });

  it('should remove duplicate variables', () => {
    const template = 'Hello {{userName}}, your {{userName}} is ready!';
    const result = parseTemplateVariables(template);

    expect(result).toEqual(['userName']);
  });

  it('should return empty array for template with no variables', () => {
    const template = 'Hello world!';
    const result = parseTemplateVariables(template);

    expect(result).toEqual([]);
  });

  it('should parse variables with underscores', () => {
    const template = 'Hello {{user_name}}!';
    const result = parseTemplateVariables(template);

    expect(result).toEqual(['user_name']);
  });

  it('should parse variables with numbers', () => {
    const template = 'Order {{order123}} is ready!';
    const result = parseTemplateVariables(template);

    expect(result).toEqual(['order123']);
  });

  it('should parse variables with mixed case', () => {
    const template = 'Hello {{userName}}, {{ORDER_ID}} is ready!';
    const result = parseTemplateVariables(template);

    expect(result).toEqual(['userName', 'ORDER_ID']);
  });
});

describe('substituteVariables', () => {
  it('should substitute single variable in template', () => {
    const template = 'Hello {{userName}}!';
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: 'John', required: true },
    ];

    const result = substituteVariables(template, substitutions);

    expect(result).toBe('Hello John!');
  });

  it('should substitute multiple variables in template', () => {
    const template = 'Hello {{userName}}, your order {{orderId}} is ready!';
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: 'John', required: true },
      { key: 'orderId', value: '12345', required: true },
    ];

    const result = substituteVariables(template, substitutions);

    expect(result).toBe('Hello John, your order 12345 is ready!');
  });

  it('should handle variable appearing multiple times', () => {
    const template = 'Dear {{userName}}, thank you {{userName}} for your order!';
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: 'John', required: true },
    ];

    const result = substituteVariables(template, substitutions);

    expect(result).toBe('Dear John, thank you John for your order!');
  });

  it('should handle empty substitution value', () => {
    const template = 'Hello {{userName}}!';
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: '', required: false },
    ];

    const result = substituteVariables(template, substitutions);

    expect(result).toBe('Hello !');
  });

  it('should leave variables without substitution unchanged', () => {
    const template = 'Hello {{userName}}, your order {{orderId}} is ready!';
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: 'John', required: true },
    ];

    const result = substituteVariables(template, substitutions);

    expect(result).toBe('Hello John, your order {{orderId}} is ready!');
  });
});

describe('validateTemplateVariables', () => {
  const variables: TemplateVariable[] = [
    { key: 'userName', description: 'User name', required: true },
    { key: 'orderId', description: 'Order ID', required: false },
  ];

  it('should validate when all template variables are defined', () => {
    const template = 'Hello {{userName}}, your order {{orderId}} is ready!';

    const result = validateTemplateVariables(template, variables);

    expect(result.isValid).toBe(true);
    expect(result.missingVariables).toEqual([]);
    expect(result.extraVariables).toEqual([]);
  });

  it('should detect missing required variables', () => {
    const template = 'Hello {{userName}}, your order {{orderId}} is ready!';
    const vars: TemplateVariable[] = [{ key: 'userName', description: 'User name', required: true }];

    const result = validateTemplateVariables(template, vars);

    expect(result.isValid).toBe(false);
    expect(result.missingVariables).toEqual(['orderId']);
    expect(result.extraVariables).toEqual([]);
  });

  it('should detect extra defined variables', () => {
    const template = 'Hello {{userName}}!';
    const result = validateTemplateVariables(template, variables);

    expect(result.isValid).toBe(false);
    expect(result.missingVariables).toEqual([]);
    expect(result.extraVariables).toEqual(['orderId']);
  });

  it('should detect both missing and extra variables', () => {
    const template = 'Hello {{userName}}!';
    const vars: TemplateVariable[] = [
      { key: 'userName', description: 'User name', required: true },
      { key: 'productId', description: 'Product ID', required: true },
    ];

    const result = validateTemplateVariables(template, vars);

    expect(result.isValid).toBe(false);
    expect(result.missingVariables).toEqual([]);
    expect(result.extraVariables).toEqual(['productId']);
  });
});

describe('validateRequiredVariables', () => {
  const variables: TemplateVariable[] = [
    { key: 'userName', description: 'User name', required: true },
    { key: 'orderId', description: 'Order ID', required: true },
    { key: 'optionalVar', description: 'Optional', required: false },
  ];

  it('should return empty array when all required variables have values', () => {
    const template = 'Hello {{userName}}, {{orderId}}!';
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: 'John', required: true },
      { key: 'orderId', value: '123', required: true },
    ];

    const result = validateRequiredVariables(template, variables, substitutions);

    expect(result).toEqual([]);
  });

  it('should detect missing required variables', () => {
    const template = 'Hello {{userName}}, {{orderId}}!';
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: 'John', required: true },
    ];

    const result = validateRequiredVariables(template, variables, substitutions);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('orderId');
    expect(result[0].required).toBe(true);
  });

  it('should ignore missing optional variables', () => {
    const template = 'Hello {{userName}}!';
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: 'John', required: true },
    ];

    const result = validateRequiredVariables(template, variables, substitutions);

    expect(result).toEqual([]);
  });

  it('should treat empty string as missing value', () => {
    const template = 'Hello {{userName}}, {{orderId}}!';
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: 'John', required: true },
      { key: 'orderId', value: '', required: true },
    ];

    const result = validateRequiredVariables(template, variables, substitutions);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('orderId');
  });
});

describe('substituteTemplateVariables', () => {
  const template: EmailTemplate = {
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome {{userName}}!',
    body: 'Hello {{userName}}, your order {{orderId}} is ready!',
    category: 'onboarding',
    tags: ['welcome'],
    variables: [
      { key: 'userName', description: 'User name', required: true },
      { key: 'orderId', description: 'Order ID', required: true },
    ],
    createdAt: '2026-01-19T00:00:00.000Z',
    updatedAt: '2026-01-19T00:00:00.000Z',
  };

  it('should substitute variables in both subject and body', () => {
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: 'John', required: true },
      { key: 'orderId', value: '12345', required: true },
    ];

    const result = substituteTemplateVariables(template, substitutions);

    expect(result.subject).toBe('Welcome John!');
    expect(result.body).toBe('Hello John, your order 12345 is ready!');
    expect(result.errors).toEqual([]);
  });

  it('should return error for missing required variable', () => {
    const substitutions: VariableSubstitution[] = [
      { key: 'userName', value: 'John', required: true },
    ];

    const result = substituteTemplateVariables(template, substitutions);

    expect(result.errors).toContain('Missing required variables: orderId');
  });

  it('should return multiple errors for multiple missing required variables', () => {
    const substitutions: VariableSubstitution[] = [];

    const result = substituteTemplateVariables(template, substitutions);

    expect(result.errors).toContain('Missing required variables: userName, orderId');
  });
});