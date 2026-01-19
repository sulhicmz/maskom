import {
  validateRecipientCriteria,
  validateRecipientSegment,
  validateRecipientList,
  validateEmailCampaign,
  validateCampaigns,
  validateCampaignMetrics,
  validateCampaignABTest,
} from '../campaignValidation';

import type {
  EmailCampaign,
  RecipientCriteria,
  RecipientSegment,
  RecipientList,
  CampaignMetrics,
  CampaignABTest,
} from '@/types/campaign';

describe('validateRecipientCriteria', () => {
  it('should validate a valid RecipientCriteria with all fields', () => {
    const criteria: RecipientCriteria = {
      role: ['user', 'editor'],
      tags: ['newsletter', 'active'],
      customCriteria: { lastLoginDays: 30 },
    };

    const result = validateRecipientCriteria(criteria);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should validate an empty RecipientCriteria', () => {
    const criteria: RecipientCriteria = {};

    const result = validateRecipientCriteria(criteria);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject RecipientCriteria with non-array role', () => {
    const criteria = {
      role: 'user' as unknown as string[],
    };

    const result = validateRecipientCriteria(criteria);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientCriteria.role must be an array if provided');
  });

  it('should reject RecipientCriteria with empty string in role array', () => {
    const criteria: RecipientCriteria = {
      role: ['user', ''],
    };

    const result = validateRecipientCriteria(criteria);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientCriteria.role must be an array of non-empty strings');
  });

  it('should reject RecipientCriteria with non-array tags', () => {
    const criteria = {
      tags: 'newsletter' as unknown as string[],
    };

    const result = validateRecipientCriteria(criteria);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientCriteria.tags must be an array if provided');
  });

  it('should reject RecipientCriteria with non-object customCriteria', () => {
    const criteria = {
      customCriteria: 'invalid' as unknown as Record<string, string | number | boolean>,
    };

    const result = validateRecipientCriteria(criteria);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientCriteria.customCriteria must be an object if provided');
  });
});

describe('validateRecipientSegment', () => {
  it('should validate a valid RecipientSegment', () => {
    const segment: RecipientSegment = {
      id: 'SEG-001',
      name: 'Active Users',
      criteria: { role: ['user'] },
      count: 150,
    };

    const result = validateRecipientSegment(segment);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject RecipientSegment with empty id', () => {
    const segment = {
      id: '',
      name: 'Active Users',
      criteria: { role: ['user'] },
      count: 150,
    };

    const result = validateRecipientSegment(segment);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientSegment.id must be a non-empty string');
  });

  it('should reject RecipientSegment with empty name', () => {
    const segment: RecipientSegment = {
      id: 'SEG-001',
      name: '',
      criteria: { role: ['user'] },
      count: 150,
    };

    const result = validateRecipientSegment(segment);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientSegment.name must be a non-empty string');
  });

  it('should reject RecipientSegment with invalid criteria', () => {
    const segment: RecipientSegment = {
      id: 'SEG-001',
      name: 'Active Users',
      criteria: { role: 'user' as unknown as string[] },
      count: 150,
    };

    const result = validateRecipientSegment(segment);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientSegment.criteria: RecipientCriteria.role must be an array if provided');
  });

  it('should reject RecipientSegment with negative count', () => {
    const segment: RecipientSegment = {
      id: 'SEG-001',
      name: 'Active Users',
      criteria: { role: ['user'] },
      count: -5,
    };

    const result = validateRecipientSegment(segment);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientSegment.count must be a non-negative number');
  });
});

describe('validateRecipientList', () => {
  it('should validate a valid RecipientList', () => {
    const list: RecipientList = {
      id: 'LIST-001',
      name: 'All Users',
      segments: [
        {
          id: 'SEG-001',
          name: 'Active Users',
          criteria: { role: ['user'] },
          count: 150,
        },
      ],
      totalRecipients: 150,
      createdAt: '2026-01-19T00:00:00.000Z',
      updatedAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateRecipientList(list);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject RecipientList with empty id', () => {
    const list = {
      id: '',
      name: 'All Users',
      segments: [
        {
          id: 'SEG-001',
          name: 'Active Users',
          criteria: { role: ['user'] },
          count: 150,
        },
      ],
      totalRecipients: 150,
      createdAt: '2026-01-19T00:00:00.000Z',
      updatedAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateRecipientList(list);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientList.id must be a non-empty string');
  });

  it('should reject RecipientList with empty segments array', () => {
    const list = {
      id: 'LIST-001',
      name: 'All Users',
      segments: [],
      totalRecipients: 0,
      createdAt: '2026-01-19T00:00:00.000Z',
      updatedAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateRecipientList(list);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientList.segments must contain at least one segment');
  });

  it('should reject RecipientList with mismatched totalRecipients', () => {
    const list: RecipientList = {
      id: 'LIST-001',
      name: 'All Users',
      segments: [
        {
          id: 'SEG-001',
          name: 'Active Users',
          criteria: { role: ['user'] },
          count: 150,
        },
      ],
      totalRecipients: 100,
      createdAt: '2026-01-19T00:00:00.000Z',
      updatedAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateRecipientList(list);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientList.totalRecipients (100) must equal sum of segment counts (150)');
  });

  it('should reject RecipientList with negative totalRecipients', () => {
    const list: RecipientList = {
      id: 'LIST-001',
      name: 'All Users',
      segments: [
        {
          id: 'SEG-001',
          name: 'Active Users',
          criteria: { role: ['user'] },
          count: 150,
        },
      ],
      totalRecipients: -10,
      createdAt: '2026-01-19T00:00:00.000Z',
      updatedAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateRecipientList(list);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientList.totalRecipients must be a non-negative number');
  });

  it('should reject RecipientList with missing createdAt', () => {
    const list = {
      id: 'LIST-001',
      name: 'All Users',
      segments: [
        {
          id: 'SEG-001',
          name: 'Active Users',
          criteria: { role: ['user'] },
          count: 150,
        },
      ],
      totalRecipients: 150,
      updatedAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateRecipientList(list);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientList.createdAt must be an ISO 8601 date string');
  });

  it('should reject RecipientList with missing updatedAt', () => {
    const list = {
      id: 'LIST-001',
      name: 'All Users',
      segments: [
        {
          id: 'SEG-001',
          name: 'Active Users',
          criteria: { role: ['user'] },
          count: 150,
        },
      ],
      totalRecipients: 150,
      createdAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateRecipientList(list);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RecipientList.updatedAt must be an ISO 8601 date string');
  });
});

describe('validateEmailCampaign', () => {
  it('should validate a valid draft campaign', () => {
    const campaign: EmailCampaign = {
      id: 'CAMP-001',
      name: 'Welcome Newsletter',
      templateId: 1,
      recipientLists: [
        {
          id: 'LIST-001',
          name: 'All Users',
          segments: [
            {
              id: 'SEG-001',
              name: 'All Users',
              criteria: {},
              count: 100,
            },
          ],
          totalRecipients: 100,
          createdAt: '2026-01-19T00:00:00.000Z',
          updatedAt: '2026-01-19T00:00:00.000Z',
        },
      ],
      status: 'draft',
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      createdAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateEmailCampaign(campaign);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should validate a scheduled campaign with scheduledFor date', () => {
    const campaign: EmailCampaign = {
      id: 'CAMP-002',
      name: 'Weekly Digest',
      templateId: 2,
      recipientLists: [
        {
          id: 'LIST-002',
          name: 'Subscribers',
          segments: [
            {
              id: 'SEG-002',
              name: 'All',
              criteria: {},
              count: 500,
            },
          ],
          totalRecipients: 500,
          createdAt: '2026-01-19T00:00:00.000Z',
          updatedAt: '2026-01-19T00:00:00.000Z',
        },
      ],
      scheduledFor: '2026-01-20T09:00:00.000Z',
      status: 'scheduled',
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      createdAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateEmailCampaign(campaign);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should validate a sent campaign with sentAt date', () => {
    const campaign: EmailCampaign = {
      id: 'CAMP-003',
      name: 'Monthly Newsletter',
      templateId: 3,
      recipientLists: [
        {
          id: 'LIST-003',
          name: 'Monthly Subscribers',
          segments: [
            {
              id: 'SEG-003',
              name: 'Monthly',
              criteria: {},
              count: 350,
            },
          ],
          totalRecipients: 350,
          createdAt: '2026-01-19T00:00:00.000Z',
          updatedAt: '2026-01-19T00:00:00.000Z',
        },
      ],
      status: 'sent',
      sentCount: 350,
      openCount: 280,
      clickCount: 140,
      bounceCount: 5,
      createdAt: '2026-01-19T00:00:00.000Z',
      sentAt: '2026-01-19T09:00:00.000Z',
    };

    const result = validateEmailCampaign(campaign);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject campaign with invalid status', () => {
    const campaign = {
      id: 'CAMP-001',
      name: 'Test Campaign',
      templateId: 1,
      recipientLists: [
        {
          id: 'LIST-001',
          name: 'Test',
          segments: [
            {
              id: 'SEG-001',
              name: 'Test',
              criteria: {},
              count: 10,
            },
          ],
          totalRecipients: 10,
          createdAt: '2026-01-19T00:00:00.000Z',
          updatedAt: '2026-01-19T00:00:00.000Z',
        },
      ],
      status: 'invalid' as const,
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      createdAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateEmailCampaign(campaign);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailCampaign.status must be one of: draft, scheduled, sending, sent, cancelled');
  });

  it('should reject campaign with negative sentCount', () => {
    const campaign: EmailCampaign = {
      id: 'CAMP-001',
      name: 'Test Campaign',
      templateId: 1,
      recipientLists: [
        {
          id: 'LIST-001',
          name: 'Test',
          segments: [
            {
              id: 'SEG-001',
              name: 'Test',
              criteria: {},
              count: 10,
            },
          ],
          totalRecipients: 10,
          createdAt: '2026-01-19T00:00:00.000Z',
          updatedAt: '2026-01-19T00:00:00.000Z',
        },
      ],
      status: 'draft',
      sentCount: -5,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      createdAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateEmailCampaign(campaign);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailCampaign: sentCount must be a positive number');
  });

  it('should reject sent campaign without sentAt', () => {
    const campaign: EmailCampaign = {
      id: 'CAMP-001',
      name: 'Test Campaign',
      templateId: 1,
      recipientLists: [
        {
          id: 'LIST-001',
          name: 'Test',
          segments: [
            {
              id: 'SEG-001',
              name: 'Test',
              criteria: {},
              count: 10,
            },
          ],
          totalRecipients: 10,
          createdAt: '2026-01-19T00:00:00.000Z',
          updatedAt: '2026-01-19T00:00:00.000Z',
        },
      ],
      status: 'sent',
      sentCount: 10,
      openCount: 5,
      clickCount: 2,
      bounceCount: 0,
      createdAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateEmailCampaign(campaign);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailCampaign with status "sent" must have a valid sentAt date');
  });

  it('should reject scheduled campaign without scheduledFor', () => {
    const campaign: EmailCampaign = {
      id: 'CAMP-001',
      name: 'Test Campaign',
      templateId: 1,
      recipientLists: [
        {
          id: 'LIST-001',
          name: 'Test',
          segments: [
            {
              id: 'SEG-001',
              name: 'Test',
              criteria: {},
              count: 10,
            },
          ],
          totalRecipients: 10,
          createdAt: '2026-01-19T00:00:00.000Z',
          updatedAt: '2026-01-19T00:00:00.000Z',
        },
      ],
      status: 'scheduled',
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      createdAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateEmailCampaign(campaign);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('EmailCampaign with status "scheduled" must have a valid scheduledFor date');
  });

  it('should accept campaign with optional subject', () => {
    const campaign: EmailCampaign = {
      id: 'CAMP-001',
      name: 'Test Campaign',
      templateId: 1,
      recipientLists: [
        {
          id: 'LIST-001',
          name: 'Test',
          segments: [
            {
              id: 'SEG-001',
              name: 'Test',
              criteria: {},
              count: 10,
            },
          ],
          totalRecipients: 10,
          createdAt: '2026-01-19T00:00:00.000Z',
          updatedAt: '2026-01-19T00:00:00.000Z',
        },
      ],
      status: 'draft',
      subject: 'Custom Subject',
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      createdAt: '2026-01-19T00:00:00.000Z',
    };

    const result = validateEmailCampaign(campaign);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept campaign with optional variableValues', () => {
    const campaign: EmailCampaign = {
      id: 'CAMP-001',
      name: 'Test Campaign',
      templateId: 1,
      recipientLists: [
        {
          id: 'LIST-001',
          name: 'Test',
          segments: [
            {
              id: 'SEG-001',
              name: 'Test',
              criteria: {},
              count: 10,
            },
          ],
          totalRecipients: 10,
          createdAt: '2026-01-19T00:00:00.000Z',
          updatedAt: '2026-01-19T00:00:00.000Z',
        },
      ],
      status: 'draft',
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      createdAt: '2026-01-19T00:00:00.000Z',
      variableValues: { name: 'Test User', email: 'test@example.com' },
    };

    const result = validateEmailCampaign(campaign);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('validateCampaigns', () => {
  it('should validate an array of valid campaigns', () => {
    const campaigns: EmailCampaign[] = [
      {
        id: 'CAMP-001',
        name: 'Campaign 1',
        templateId: 1,
        recipientLists: [
          {
            id: 'LIST-001',
            name: 'Test',
            segments: [
              {
                id: 'SEG-001',
                name: 'Test',
                criteria: {},
                count: 10,
              },
            ],
            totalRecipients: 10,
            createdAt: '2026-01-19T00:00:00.000Z',
            updatedAt: '2026-01-19T00:00:00.000Z',
          },
        ],
        status: 'draft',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        createdAt: '2026-01-19T00:00:00.000Z',
      },
      {
        id: 'CAMP-002',
        name: 'Campaign 2',
        templateId: 2,
        recipientLists: [
          {
            id: 'LIST-002',
            name: 'Test',
            segments: [
              {
                id: 'SEG-002',
                name: 'Test',
                criteria: {},
                count: 20,
              },
            ],
            totalRecipients: 20,
            createdAt: '2026-01-19T00:00:00.000Z',
            updatedAt: '2026-01-19T00:00:00.000Z',
          },
        ],
        status: 'draft',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        createdAt: '2026-01-19T00:00:00.000Z',
      },
    ];

    const result = validateCampaigns(campaigns);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject campaigns with duplicate IDs', () => {
    const campaigns: EmailCampaign[] = [
      {
        id: 'CAMP-001',
        name: 'Campaign 1',
        templateId: 1,
        recipientLists: [
          {
            id: 'LIST-001',
            name: 'Test',
            segments: [
              {
                id: 'SEG-001',
                name: 'Test',
                criteria: {},
                count: 10,
              },
            ],
            totalRecipients: 10,
            createdAt: '2026-01-19T00:00:00.000Z',
            updatedAt: '2026-01-19T00:00:00.000Z',
          },
        ],
        status: 'draft',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        createdAt: '2026-01-19T00:00:00.000Z',
      },
      {
        id: 'CAMP-001',
        name: 'Campaign 2',
        templateId: 2,
        recipientLists: [
          {
            id: 'LIST-002',
            name: 'Test',
            segments: [
              {
                id: 'SEG-002',
                name: 'Test',
                criteria: {},
                count: 20,
              },
            ],
            totalRecipients: 20,
            createdAt: '2026-01-19T00:00:00.000Z',
            updatedAt: '2026-01-19T00:00:00.000Z',
          },
        ],
        status: 'draft',
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        bounceCount: 0,
        createdAt: '2026-01-19T00:00:00.000Z',
      },
    ];

    const result = validateCampaigns(campaigns);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Duplicate campaign ID "CAMP-001" found at indices: 0, 1');
  });
});

describe('validateCampaignMetrics', () => {
  it('should validate valid campaign metrics', () => {
    const metrics: CampaignMetrics = {
      sentCount: 350,
      openCount: 280,
      openRate: 80.0,
      clickCount: 140,
      clickRate: 40.0,
      bounceCount: 5,
      bounceRate: 1.43,
    };

    const result = validateCampaignMetrics(metrics);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject metrics with negative sentCount', () => {
    const metrics: CampaignMetrics = {
      sentCount: -10,
      openCount: 280,
      openRate: 80.0,
      clickCount: 140,
      clickRate: 40.0,
      bounceCount: 5,
      bounceRate: 1.43,
    };

    const result = validateCampaignMetrics(metrics);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('CampaignMetrics.sentCount must be a non-negative number');
  });

  it('should reject metrics with openRate > 100', () => {
    const metrics: CampaignMetrics = {
      sentCount: 350,
      openCount: 280,
      openRate: 150.0,
      clickCount: 140,
      clickRate: 40.0,
      bounceCount: 5,
      bounceRate: 1.43,
    };

    const result = validateCampaignMetrics(metrics);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('CampaignMetrics.openRate must be a number between 0 and 100');
  });

  it('should reject metrics with openRate < 0', () => {
    const metrics: CampaignMetrics = {
      sentCount: 350,
      openCount: 280,
      openRate: -10.0,
      clickCount: 140,
      clickRate: 40.0,
      bounceCount: 5,
      bounceRate: 1.43,
    };

    const result = validateCampaignMetrics(metrics);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('CampaignMetrics.openRate must be a number between 0 and 100');
  });

  it('should reject metrics with negative bounceCount', () => {
    const metrics: CampaignMetrics = {
      sentCount: 350,
      openCount: 280,
      openRate: 80.0,
      clickCount: 140,
      clickRate: 40.0,
      bounceCount: -5,
      bounceRate: 1.43,
    };

    const result = validateCampaignMetrics(metrics);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('CampaignMetrics.bounceCount must be a non-negative number');
  });
});

describe('validateCampaignABTest', () => {
  it('should validate a valid A/B test variant A', () => {
    const abTest: CampaignABTest = {
      id: 'ABTEST-001',
      campaignId: 'CAMP-001',
      variant: 'A',
      subject: 'Subject Line A',
      sentCount: 100,
      openCount: 80,
      clickCount: 30,
    };

    const result = validateCampaignABTest(abTest);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should validate a valid A/B test variant B', () => {
    const abTest: CampaignABTest = {
      id: 'ABTEST-002',
      campaignId: 'CAMP-001',
      variant: 'B',
      subject: 'Subject Line B',
      sentCount: 100,
      openCount: 85,
      clickCount: 35,
      winner: 'B',
    };

    const result = validateCampaignABTest(abTest);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject A/B test with empty id', () => {
    const abTest = {
      id: '',
      campaignId: 'CAMP-001',
      variant: 'A' as const,
      subject: 'Subject Line A',
      sentCount: 100,
      openCount: 80,
      clickCount: 30,
    };

    const result = validateCampaignABTest(abTest);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('CampaignABTest.id must be a non-empty string');
  });

  it('should reject A/B test with invalid variant', () => {
    const abTest = {
      id: 'ABTEST-001',
      campaignId: 'CAMP-001',
      variant: 'C' as const,
      subject: 'Subject Line A',
      sentCount: 100,
      openCount: 80,
      clickCount: 30,
    };

    const result = validateCampaignABTest(abTest);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('CampaignABTest.variant must be either "A" or "B"');
  });

  it('should reject A/B test with negative sentCount', () => {
    const abTest: CampaignABTest = {
      id: 'ABTEST-001',
      campaignId: 'CAMP-001',
      variant: 'A',
      subject: 'Subject Line A',
      sentCount: -50,
      openCount: 80,
      clickCount: 30,
    };

    const result = validateCampaignABTest(abTest);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('CampaignABTest.sentCount must be a non-negative number');
  });

  it('should reject A/B test with invalid winner', () => {
    const abTest = {
      id: 'ABTEST-001',
      campaignId: 'CAMP-001',
      variant: 'A' as const,
      subject: 'Subject Line A',
      sentCount: 100,
      openCount: 80,
      clickCount: 30,
      winner: 'C' as const,
    };

    const result = validateCampaignABTest(abTest);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('CampaignABTest.winner must be either "A", "B", or "none" if provided');
  });
});
