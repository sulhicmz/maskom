import {
  validateEmailTemplate,
  validateTemplateVariable,
  validateEmailTemplates,
} from '../emailTemplateValidation';

import type { EmailTemplate, TemplateVariable } from '@/types/data';

describe('validateTemplateVariable', () => {
  it('should validate a valid TemplateVariable', () => {
    const variable: TemplateVariable = {
      key: 'authorName',
      description: 'The name of the blog post author',
      required: true,
    };

    const result = validateTemplateVariable(variable);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject TemplateVariable with empty key', () => {
    const variable: TemplateVariable = {
      key: '',
      description: 'The name of the blog post author',
      required: true,
    };

    const result = validateTemplateVariable(variable);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('TemplateVariable.key must be a non-empty string');
  });

  it('should reject TemplateVariable with non-string key', () => {
    const variable = {
      key: null as unknown as string,
      description: 'The name of the blog post author',
      required: true,
    };

    const result = validateTemplateVariable(variable);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('TemplateVariable.key must be a non-empty string');
  });

  it('should reject TemplateVariable with invalid key format', () => {
    const variable: TemplateVariable = {
      key: '123invalid',
      description: 'The name of the blog post author',
      required: true,
    };

    const result = validateTemplateVariable(variable);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('TemplateVariable.key "123invalid" must match variable format (e.g., {{authorName}})');
  });

  it('should reject TemplateVariable with empty description', () => {
    const variable: TemplateVariable = {
      key: 'authorName',
      description: '',
      required: true,
    };

    const result = validateTemplateVariable(variable);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('TemplateVariable.description must be a non-empty string');
  });

  it('should reject TemplateVariable with non-string description', () => {
    const variable = {
      key: 'authorName',
      description: null as unknown as string,
      required: true,
    };

    const result = validateTemplateVariable(variable);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('TemplateVariable.description must be a non-empty string');
  });

  it('should reject TemplateVariable with non-boolean required', () => {
    const variable = {
      key: 'authorName',
      description: 'The name of the blog post author',
      required: null as unknown as boolean,
    };

    const result = validateTemplateVariable(variable);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('TemplateVariable.required must be a boolean');
  });

  it('should accept TemplateVariable with valid key format with numbers', () => {
    const variable: TemplateVariable = {
      key: 'user123',
      description: 'The user ID',
      required: true,
    };

    const result = validateTemplateVariable(variable);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept TemplateVariable with valid key format with underscores', () => {
    const variable: TemplateVariable = {
      key: 'author_name',
      description: 'The name of the blog post author',
      required: true,
    };

    const result = validateTemplateVariable(variable);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject TemplateVariable with key starting with number', () => {
    const variable: TemplateVariable = {
      key: '123author',
      description: 'The name of the blog post author',
      required: true,
    };

    const result = validateTemplateVariable(variable);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('TemplateVariable.key "123author" must match variable format (e.g., {{authorName}})');
  });
});

describe('validateEmailTemplate', () => {
  const createValidTemplate = (): EmailTemplate => ({
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to our platform!',
    body: 'Hello {{userName}}, welcome to our platform!',
    category: 'onboarding',
    tags: ['welcome', 'onboarding'],
    variables: [
      {
        key: 'userName',
        description: 'The name of the user',
        required: true,
      },
    ],
    createdAt: '2026-01-19T00:00:00.000Z',
    updatedAt: '2026-01-19T00:00:00.000Z',
  });

  it('should validate a valid EmailTemplate', () => {
    const template = createValidTemplate();

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject EmailTemplate with empty name', () => {
    const template = { ...createValidTemplate(), name: '' };

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate: name must be a non-empty string');
  });

  it('should reject EmailTemplate with empty subject', () => {
    const template = { ...createValidTemplate(), subject: '' };

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate: subject must be a non-empty string');
  });

  it('should reject EmailTemplate with empty body', () => {
    const template = { ...createValidTemplate(), body: '' };

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate: body must be a non-empty string');
  });

  it('should reject EmailTemplate with empty category', () => {
    const template = { ...createValidTemplate(), category: '' };

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate: category must be a non-empty string');
  });

  it('should accept EmailTemplate with missing tags', () => {
    const template = { ...createValidTemplate(), tags: [] };

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject EmailTemplate with non-string tags', () => {
    const template = {
      ...createValidTemplate(),
      tags: ['valid', 123 as unknown as string],
    };

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate.tags must be an array of strings');
  });

  it('should reject EmailTemplate with invalid variables type', () => {
    const template = {
      ...createValidTemplate(),
      variables: null as unknown as TemplateVariable[],
    };

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate.variables must be an array');
  });

  it('should reject EmailTemplate with missing createdAt', () => {
    const template = { ...createValidTemplate(), createdAt: '' as unknown as string };

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate.createdAt must be an ISO 8601 date string');
  });

  it('should reject EmailTemplate with missing updatedAt', () => {
    const template = { ...createValidTemplate(), updatedAt: '' as unknown as string };

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate.updatedAt must be an ISO 8601 date string');
  });

  it('should reject EmailTemplate with non-number sentCount', () => {
    const template = {
      ...createValidTemplate(),
      sentCount: 'invalid' as unknown as number,
    };

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate.sentCount must be a number');
  });

  it('should accept EmailTemplate without sentCount', () => {
    const template = { ...createValidTemplate() };
    delete (template as Partial<EmailTemplate>).sentCount;

    const result = validateEmailTemplate(template);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('validateEmailTemplates', () => {
  const createValidTemplate = (): EmailTemplate => ({
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to our platform!',
    body: 'Hello {{userName}}, welcome to our platform!',
    category: 'onboarding',
    tags: ['welcome'],
    variables: [
      {
        key: 'userName',
        description: 'The name of the user',
        required: true,
      },
    ],
    createdAt: '2026-01-19T00:00:00.000Z',
    updatedAt: '2026-01-19T00:00:00.000Z',
  });

  it('should validate an array of valid EmailTemplates', () => {
    const templates = [createValidTemplate()];

    const result = validateEmailTemplates(templates);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject array with invalid EmailTemplate', () => {
    const templates = [
      createValidTemplate(),
      { ...createValidTemplate(), name: '' },
    ];

    const result = validateEmailTemplates(templates);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate[1]: EmailTemplate: name must be a non-empty string');
  });

  it('should reject array with invalid TemplateVariable', () => {
    const templates = [
      {
        ...createValidTemplate(),
        variables: [{ key: '', description: '', required: true }],
      },
    ];

    const result = validateEmailTemplates(templates);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailTemplate[0].variables[0]: TemplateVariable.key must be a non-empty string, TemplateVariable.description must be a non-empty string');
  });

  it('should accept empty array of EmailTemplates', () => {
    const result = validateEmailTemplates([]);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should validate multiple EmailTemplates with errors', () => {
    const templates = [
      createValidTemplate(),
      { ...createValidTemplate(), name: '' },
      { ...createValidTemplate(), subject: '' },
    ];

    const result = validateEmailTemplates(templates);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});