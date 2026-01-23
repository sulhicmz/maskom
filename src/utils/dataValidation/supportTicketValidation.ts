import type { SupportTicket, TicketComment, TicketStatus, TicketPriority, TicketCategory } from '@/types/data';

const VALID_TICKET_STATUSES: TicketStatus[] = [
  'open',
  'in_progress',
  'resolved',
  'closed',
];

const VALID_TICKET_PRIORITIES: TicketPriority[] = [
  'low',
  'medium',
  'high',
  'critical',
];

const VALID_TICKET_CATEGORIES: TicketCategory[] = [
  'technical',
  'billing',
  'feature_request',
  'bug_report',
  'general_inquiry',
  'account_issue',
];

export const validateTicketStatus = (
  status: TicketStatus
): { isValid: boolean; errors: string[] } => {
  return VALID_TICKET_STATUSES.includes(status)
    ? { isValid: true, errors: [] }
    : { isValid: false, errors: [`Invalid ticket status: ${status}`] };
};

export const validateTicketPriority = (
  priority: TicketPriority
): { isValid: boolean; errors: string[] } => {
  return VALID_TICKET_PRIORITIES.includes(priority)
    ? { isValid: true, errors: [] }
    : { isValid: false, errors: [`Invalid ticket priority: ${priority}`] };
};

export const validateTicketCategory = (
  category: TicketCategory
): { isValid: boolean; errors: string[] } => {
  return VALID_TICKET_CATEGORIES.includes(category)
    ? { isValid: true, errors: [] }
    : { isValid: false, errors: [`Invalid ticket category: ${category}`] };
};

export const validateSupportTicket = (
  ticket: SupportTicket
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof ticket.id !== 'number' || ticket.id <= 0) {
    errors.push('id must be a positive number');
  }

  if (typeof ticket.ticketNumber !== 'string' || ticket.ticketNumber.trim() === '') {
    errors.push('ticketNumber must be a non-empty string');
  }

  if (!ticket.ticketNumber.match(/^TKT-\d{4}-\d{4}$/)) {
    errors.push('ticketNumber must match format TKT-YYYY-NNNN (e.g., TKT-2026-0001)');
  }

  if (typeof ticket.title !== 'string' || ticket.title.trim() === '') {
    errors.push('title must be a non-empty string');
  }

  if (typeof ticket.title !== 'string' || ticket.title.length > 200) {
    errors.push('title must not exceed 200 characters');
  }

  if (typeof ticket.description !== 'string' || ticket.description.trim() === '') {
    errors.push('description must be a non-empty string');
  }

  const statusResult = validateTicketStatus(ticket.status);
  if (!statusResult.isValid) {
    errors.push(...statusResult.errors);
  }

  const priorityResult = validateTicketPriority(ticket.priority);
  if (!priorityResult.isValid) {
    errors.push(...priorityResult.errors);
  }

  const categoryResult = validateTicketCategory(ticket.category);
  if (!categoryResult.isValid) {
    errors.push(...categoryResult.errors);
  }

  if (typeof ticket.requesterName !== 'string' || ticket.requesterName.trim() === '') {
    errors.push('requesterName must be a non-empty string');
  }

  if (typeof ticket.requesterEmail !== 'string' || ticket.requesterEmail.trim() === '') {
    errors.push('requesterEmail must be a non-empty string');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(ticket.requesterEmail)) {
    errors.push('requesterEmail must be a valid email address');
  }

  if (ticket.requesterPhone !== undefined) {
    if (typeof ticket.requesterPhone !== 'string' || ticket.requesterPhone.trim() === '') {
      errors.push('requesterPhone must be a non-empty string if provided');
    }
  }

  if (ticket.assignedTo !== undefined && typeof ticket.assignedTo !== 'number') {
    errors.push('assignedTo must be a number if provided');
  }

  if (typeof ticket.createdAt !== 'string' || ticket.createdAt.trim() === '') {
    errors.push('createdAt must be a non-empty string');
  }

  if (typeof ticket.createdAt === 'string' && isNaN(Date.parse(ticket.createdAt))) {
    errors.push('createdAt must be a valid ISO 8601 date string');
  }

  if (typeof ticket.updatedAt !== 'string' || ticket.updatedAt.trim() === '') {
    errors.push('updatedAt must be a non-empty string');
  }

  if (typeof ticket.updatedAt === 'string' && isNaN(Date.parse(ticket.updatedAt))) {
    errors.push('updatedAt must be a valid ISO 8601 date string');
  }

  if (ticket.resolvedAt !== undefined) {
    if (typeof ticket.resolvedAt !== 'string' || ticket.resolvedAt.trim() === '') {
      errors.push('resolvedAt must be a non-empty string if provided');
    }
    if (typeof ticket.resolvedAt === 'string' && isNaN(Date.parse(ticket.resolvedAt))) {
      errors.push('resolvedAt must be a valid ISO 8601 date string');
    }
  }

  if (ticket.closedAt !== undefined) {
    if (typeof ticket.closedAt !== 'string' || ticket.closedAt.trim() === '') {
      errors.push('closedAt must be a non-empty string if provided');
    }
    if (typeof ticket.closedAt === 'string' && isNaN(Date.parse(ticket.closedAt))) {
      errors.push('closedAt must be a valid ISO 8601 date string');
    }
  }

  if (ticket.dueDate !== undefined) {
    if (typeof ticket.dueDate !== 'string' || ticket.dueDate.trim() === '') {
      errors.push('dueDate must be a non-empty string if provided');
    }
    if (typeof ticket.dueDate === 'string' && isNaN(Date.parse(ticket.dueDate))) {
      errors.push('dueDate must be a valid ISO 8601 date string');
    }
  }

  if (ticket.tags !== undefined && !Array.isArray(ticket.tags)) {
    errors.push('tags must be an array if provided');
  }

  if (ticket.attachments !== undefined && !Array.isArray(ticket.attachments)) {
    errors.push('attachments must be an array if provided');
  }

  if (ticket.satisfactionRating !== undefined) {
    if (typeof ticket.satisfactionRating !== 'number') {
      errors.push('satisfactionRating must be a number if provided');
    }
    if (typeof ticket.satisfactionRating === 'number' && (ticket.satisfactionRating < 1 || ticket.satisfactionRating > 5)) {
      errors.push('satisfactionRating must be between 1 and 5');
    }
  }

  if (ticket.comments !== undefined && !Array.isArray(ticket.comments)) {
    errors.push('comments must be an array if provided');
  }

  if (ticket.comments !== undefined) {
    ticket.comments.forEach((comment, index) => {
      const result = validateTicketComment(comment);
      if (!result.isValid) {
        errors.push(...result.errors.map((e) => `comments[${index}]: ${e}`));
      }
    });
  }

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateSupportTickets = (
  tickets: SupportTicket[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const ids = new Set<number>();
  const ticketNumbers = new Set<string>();

  tickets.forEach((ticket, index) => {
    if (ids.has(ticket.id)) {
      errors.push(`SupportTicket at index ${index}: Duplicate ticket ID: ${ticket.id}`);
    }
    ids.add(ticket.id);

    if (ticketNumbers.has(ticket.ticketNumber)) {
      errors.push(`SupportTicket at index ${index}: Duplicate ticket number: ${ticket.ticketNumber}`);
    }
    ticketNumbers.add(ticket.ticketNumber);

    const result = validateSupportTicket(ticket);
    if (!result.isValid) {
      errors.push(...result.errors.map((e) => `SupportTicket[${ticket.ticketNumber}]: ${e}`));
    }
  });

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateTicketComment = (
  comment: TicketComment
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof comment.id !== 'number' || comment.id <= 0) {
    errors.push('id must be a positive number');
  }

  if (typeof comment.ticketId !== 'number' || comment.ticketId <= 0) {
    errors.push('ticketId must be a positive number');
  }

  if (typeof comment.authorName !== 'string' || comment.authorName.trim() === '') {
    errors.push('authorName must be a non-empty string');
  }

  if (typeof comment.authorEmail !== 'string' || comment.authorEmail.trim() === '') {
    errors.push('authorEmail must be a non-empty string');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(comment.authorEmail)) {
    errors.push('authorEmail must be a valid email address');
  }

  if (comment.authorRole !== undefined && !['user', 'support', 'admin'].includes(comment.authorRole)) {
    errors.push('authorRole must be one of: user, support, admin');
  }

  if (typeof comment.content !== 'string' || comment.content.trim() === '') {
    errors.push('content must be a non-empty string');
  }

  if (typeof comment.isInternal !== 'boolean') {
    errors.push('isInternal must be a boolean');
  }

  if (typeof comment.createdAt !== 'string' || comment.createdAt.trim() === '') {
    errors.push('createdAt must be a non-empty string');
  }

  if (typeof comment.createdAt === 'string' && isNaN(Date.parse(comment.createdAt))) {
    errors.push('createdAt must be a valid ISO 8601 date string');
  }

  if (comment.attachments !== undefined && !Array.isArray(comment.attachments)) {
    errors.push('attachments must be an array if provided');
  }

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};

export const validateTicketComments = (
  comments: TicketComment[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const ids = new Set<number>();

  comments.forEach((comment, index) => {
    if (ids.has(comment.id)) {
      errors.push(`TicketComment at index ${index}: Duplicate comment ID: ${comment.id}`);
    }
    ids.add(comment.id);

    const result = validateTicketComment(comment);
    if (!result.isValid) {
      errors.push(...result.errors.map((e) => `TicketComment[${comment.id}]: ${e}`));
    }
  });

  return errors.length === 0 ? { isValid: true, errors: [] } : { isValid: false, errors };
};
