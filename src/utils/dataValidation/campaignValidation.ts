import type { EmailCampaign, RecipientCriteria, RecipientSegment, RecipientList, CampaignStatus, CampaignMetrics, CampaignABTest } from "@/types/campaign";
import { createValidator } from "./baseValidation";

const VALID_CAMPAIGN_STATUSES: CampaignStatus[] = ['draft', 'scheduled', 'sending', 'sent', 'cancelled'];

export const validateRecipientCriteria = (criteria: RecipientCriteria): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (criteria.role !== undefined) {
    if (!Array.isArray(criteria.role)) {
      errors.push('RecipientCriteria.role must be an array if provided');
    } else if (!criteria.role.every(r => typeof r === 'string' && r.trim() !== '')) {
      errors.push('RecipientCriteria.role must be an array of non-empty strings');
    }
  }

  if (criteria.tags !== undefined) {
    if (!Array.isArray(criteria.tags)) {
      errors.push('RecipientCriteria.tags must be an array if provided');
    } else if (!criteria.tags.every(t => typeof t === 'string' && t.trim() !== '')) {
      errors.push('RecipientCriteria.tags must be an array of non-empty strings');
    }
  }

  if (criteria.customCriteria !== undefined) {
    if (typeof criteria.customCriteria !== 'object' || criteria.customCriteria === null) {
      errors.push('RecipientCriteria.customCriteria must be an object if provided');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRecipientSegment = (segment: RecipientSegment): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof segment.id !== 'string' || segment.id.trim() === '') {
    errors.push('RecipientSegment.id must be a non-empty string');
  }

  if (typeof segment.name !== 'string' || segment.name.trim() === '') {
    errors.push('RecipientSegment.name must be a non-empty string');
  }

  const criteriaResult = validateRecipientCriteria(segment.criteria);
  if (!criteriaResult.isValid) {
    errors.push(...criteriaResult.errors.map(e => `RecipientSegment.criteria: ${e}`));
  }

  if (typeof segment.count !== 'number' || segment.count < 0) {
    errors.push('RecipientSegment.count must be a non-negative number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRecipientList = (list: RecipientList): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof list.id !== 'string' || list.id.trim() === '') {
    errors.push('RecipientList.id must be a non-empty string');
  }

  if (typeof list.name !== 'string' || list.name.trim() === '') {
    errors.push('RecipientList.name must be a non-empty string');
  }

  if (!Array.isArray(list.segments)) {
    errors.push('RecipientList.segments must be an array');
  } else if (list.segments.length === 0) {
    errors.push('RecipientList.segments must contain at least one segment');
  } else {
    list.segments.forEach((segment, index) => {
      const segmentResult = validateRecipientSegment(segment);
      if (!segmentResult.isValid) {
        errors.push(...segmentResult.errors.map(e => `RecipientList.segments[${index}]: ${e}`));
      }
    });
  }

  if (typeof list.totalRecipients !== 'number' || list.totalRecipients < 0) {
    errors.push('RecipientList.totalRecipients must be a non-negative number');
  } else if (list.segments.length > 0) {
    const actualTotal = list.segments.reduce((sum, seg) => sum + seg.count, 0);
    if (list.totalRecipients !== actualTotal) {
      errors.push(`RecipientList.totalRecipients (${list.totalRecipients}) must equal sum of segment counts (${actualTotal})`);
    }
  }

  if (!list.createdAt || typeof list.createdAt !== 'string') {
    errors.push('RecipientList.createdAt must be an ISO 8601 date string');
  }

  if (!list.updatedAt || typeof list.updatedAt !== 'string') {
    errors.push('RecipientList.updatedAt must be an ISO 8601 date string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEmailCampaign = createValidator<EmailCampaign>({
  typeName: 'EmailCampaign',
  baseValidation: false,
  stringFields: [
    { key: 'id', required: true },
    { key: 'name', required: true },
    { key: 'status', required: true },
  ],
  numberFields: [
    { key: 'templateId', required: true },
    { key: 'sentCount', required: true, min: 0 },
    { key: 'openCount', required: true, min: 0 },
    { key: 'clickCount', required: true, min: 0 },
    { key: 'bounceCount', required: true, min: 0 },
  ],
  arrayFields: [
    {
      key: 'recipientLists',
      required: true,
      itemValidator: (item: unknown) => {
        const result = validateRecipientList(item as RecipientList);
        if (!result.isValid) {
          return result.errors.join(', ');
        }
        return null;
      },
    },
  ],
  customRules: [
    (item) => {
      if (typeof item.status !== 'string' || !VALID_CAMPAIGN_STATUSES.includes(item.status as CampaignStatus)) {
        return `EmailCampaign.status must be one of: ${VALID_CAMPAIGN_STATUSES.join(', ')}`;
      }
      return null;
    },
    (item) => {
      if (!item.createdAt || typeof item.createdAt !== 'string') {
        return 'EmailCampaign.createdAt must be an ISO 8601 date string';
      }
      return null;
    },
    (item) => {
      if (item.scheduledFor !== undefined && typeof item.scheduledFor !== 'string') {
        return 'EmailCampaign.scheduledFor must be an ISO 8601 date string if provided';
      }
      return null;
    },
    (item) => {
      if (item.subject !== undefined && typeof item.subject !== 'string') {
        return 'EmailCampaign.subject must be a string if provided';
      }
      return null;
    },
    (item) => {
      if (item.previewText !== undefined && typeof item.previewText !== 'string') {
        return 'EmailCampaign.previewText must be a string if provided';
      }
      return null;
    },
    (item) => {
      if (item.sentAt !== undefined && typeof item.sentAt !== 'string') {
        return 'EmailCampaign.sentAt must be an ISO 8601 date string if provided';
      }
      return null;
    },
    (item) => {
      if (item.variableValues !== undefined && (typeof item.variableValues !== 'object' || item.variableValues === null)) {
        return 'EmailCampaign.variableValues must be an object if provided';
      }
      return null;
    },
    (item) => {
      if (item.status === 'sent' && !item.sentAt) {
        return 'EmailCampaign with status "sent" must have a valid sentAt date';
      }
      return null;
    },
    (item) => {
      if (item.status === 'scheduled' && !item.scheduledFor) {
        return 'EmailCampaign with status "scheduled" must have a valid scheduledFor date';
      }
      return null;
    },
    (item) => {
      if (item.status === 'sending' && item.sentCount > 0) {
        return 'EmailCampaign with status "sending" should have sentCount of 0 (campaign is not complete)';
      }
      return null;
    },
  ],
});

export const validateCampaigns = (campaigns: EmailCampaign[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  campaigns.forEach((campaign, index) => {
    const result = validateEmailCampaign(campaign);
    if (!result.isValid) {
      errors.push(`EmailCampaign[${index}]: ${result.errors.join(', ')}`);
    }

    if (campaign.recipientLists && Array.isArray(campaign.recipientLists)) {
      campaign.recipientLists.forEach((list, listIndex) => {
        const listResult = validateRecipientList(list);
        if (!listResult.isValid) {
          errors.push(`EmailCampaign[${index}].recipientLists[${listIndex}]: ${listResult.errors.join(', ')}`);
        }
      });
    }
  });

  const idMap = new Map<string, number[]>();
  campaigns.forEach((campaign, index) => {
    if (!idMap.has(campaign.id)) {
      idMap.set(campaign.id, []);
    }
    idMap.get(campaign.id)!.push(index);
  });

  idMap.forEach((indices, id) => {
    if (indices.length > 1) {
      errors.push(`Duplicate campaign ID "${id}" found at indices: ${indices.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateCampaignMetrics = (metrics: CampaignMetrics): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof metrics.sentCount !== 'number' || metrics.sentCount < 0) {
    errors.push('CampaignMetrics.sentCount must be a non-negative number');
  }

  if (typeof metrics.openCount !== 'number' || metrics.openCount < 0) {
    errors.push('CampaignMetrics.openCount must be a non-negative number');
  }

  if (typeof metrics.openRate !== 'number' || metrics.openRate < 0 || metrics.openRate > 100) {
    errors.push('CampaignMetrics.openRate must be a number between 0 and 100');
  }

  if (typeof metrics.clickCount !== 'number' || metrics.clickCount < 0) {
    errors.push('CampaignMetrics.clickCount must be a non-negative number');
  }

  if (typeof metrics.clickRate !== 'number' || metrics.clickRate < 0 || metrics.clickRate > 100) {
    errors.push('CampaignMetrics.clickRate must be a number between 0 and 100');
  }

  if (typeof metrics.bounceCount !== 'number' || metrics.bounceCount < 0) {
    errors.push('CampaignMetrics.bounceCount must be a non-negative number');
  }

  if (typeof metrics.bounceRate !== 'number' || metrics.bounceRate < 0 || metrics.bounceRate > 100) {
    errors.push('CampaignMetrics.bounceRate must be a number between 0 and 100');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateCampaignABTest = (abTest: CampaignABTest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof abTest.id !== 'string' || abTest.id.trim() === '') {
    errors.push('CampaignABTest.id must be a non-empty string');
  }

  if (typeof abTest.campaignId !== 'string' || abTest.campaignId.trim() === '') {
    errors.push('CampaignABTest.campaignId must be a non-empty string');
  }

  if (abTest.variant !== 'A' && abTest.variant !== 'B') {
    errors.push('CampaignABTest.variant must be either "A" or "B"');
  }

  if (typeof abTest.subject !== 'string' || abTest.subject.trim() === '') {
    errors.push('CampaignABTest.subject must be a non-empty string');
  }

  if (typeof abTest.sentCount !== 'number' || abTest.sentCount < 0) {
    errors.push('CampaignABTest.sentCount must be a non-negative number');
  }

  if (typeof abTest.openCount !== 'number' || abTest.openCount < 0) {
    errors.push('CampaignABTest.openCount must be a non-negative number');
  }

  if (typeof abTest.clickCount !== 'number' || abTest.clickCount < 0) {
    errors.push('CampaignABTest.clickCount must be a non-negative number');
  }

  if (abTest.winner !== undefined && abTest.winner !== 'A' && abTest.winner !== 'B' && abTest.winner !== 'none') {
    errors.push('CampaignABTest.winner must be either "A", "B", or "none" if provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
