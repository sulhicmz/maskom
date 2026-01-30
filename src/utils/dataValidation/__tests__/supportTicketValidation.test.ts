import {
  validateTicketStatus,
  validateTicketPriority,
  validateTicketCategory,
  validateSupportTicket,
  validateSupportTickets,
  validateTicketComment,
  validateTicketComments
} from '@/utils/dataValidation/supportTicketValidation';
import type { SupportTicket, TicketComment, TicketStatus, TicketPriority, TicketCategory } from '@/types/data';

describe('supportTicketValidation', () => {
  const validTicket: SupportTicket = {
    id: 1,
    ticketNumber: 'TKT-2026-0001',
    title: 'Test Ticket Title',
    description: 'Test ticket description for validation',
    status: 'open' as TicketStatus,
    priority: 'medium' as TicketPriority,
    category: 'technical' as TicketCategory,
    requesterName: 'Test User',
    requesterEmail: 'test@example.com',
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-01-20T08:00:00.000Z',
  };

  const validComment: TicketComment = {
    id: 1,
    ticketId: 1,
    authorName: 'Test User',
    authorEmail: 'test@example.com',
    content: 'Test comment content',
    isInternal: false,
    createdAt: '2026-01-20T08:00:00.000Z',
  };

  describe('validateTicketStatus', () => {
    it('should validate valid status: open', () => {
      const result = validateTicketStatus('open' as TicketStatus);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid status: in_progress', () => {
      const result = validateTicketStatus('in_progress' as TicketStatus);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid status: resolved', () => {
      const result = validateTicketStatus('resolved' as TicketStatus);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid status: closed', () => {
      const result = validateTicketStatus('closed' as TicketStatus);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid status', () => {
      const result = validateTicketStatus('invalid_status' as TicketStatus);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid ticket status');
    });
  });

  describe('validateTicketPriority', () => {
    it('should validate valid priority: low', () => {
      const result = validateTicketPriority('low' as TicketPriority);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid priority: medium', () => {
      const result = validateTicketPriority('medium' as TicketPriority);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid priority: high', () => {
      const result = validateTicketPriority('high' as TicketPriority);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid priority: critical', () => {
      const result = validateTicketPriority('critical' as TicketPriority);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid priority', () => {
      const result = validateTicketPriority('invalid_priority' as TicketPriority);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid ticket priority');
    });
  });

  describe('validateTicketCategory', () => {
    it('should validate valid category: technical', () => {
      const result = validateTicketCategory('technical' as TicketCategory);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid category: billing', () => {
      const result = validateTicketCategory('billing' as TicketCategory);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid category: feature_request', () => {
      const result = validateTicketCategory('feature_request' as TicketCategory);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid category: bug_report', () => {
      const result = validateTicketCategory('bug_report' as TicketCategory);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid category: general_inquiry', () => {
      const result = validateTicketCategory('general_inquiry' as TicketCategory);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid category: account_issue', () => {
      const result = validateTicketCategory('account_issue' as TicketCategory);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid category', () => {
      const result = validateTicketCategory('invalid_category' as TicketCategory);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid ticket category');
    });
  });

  describe('validateSupportTicket', () => {
    describe('Basic Field Validation', () => {
      it('should validate a valid ticket', () => {
        const result = validateSupportTicket(validTicket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject ticket with missing id', () => {
        const ticket = { ...validTicket, id: undefined };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('id must be a positive number'))).toBe(true);
      });

      it('should reject ticket with zero id', () => {
        const ticket = { ...validTicket, id: 0 };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('id must be a positive number'))).toBe(true);
      });

      it('should reject ticket with negative id', () => {
        const ticket = { ...validTicket, id: -1 };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('id must be a positive number'))).toBe(true);
      });

      it('should reject ticket with missing ticketNumber', () => {
        const ticket = { ...validTicket, ticketNumber: '' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('ticketNumber must be a non-empty string'))).toBe(true);
      });

      it('should reject ticket with invalid ticketNumber format - no prefix', () => {
        const ticket = { ...validTicket, ticketNumber: '2026-0001' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('ticketNumber must match format'))).toBe(true);
      });

      it('should accept ticketNumber with any valid 4-digit year', () => {
        const ticket = { ...validTicket, ticketNumber: 'TKT-1999-0001' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject ticket with invalid ticketNumber format - wrong number format', () => {
        const ticket = { ...validTicket, ticketNumber: 'TKT-2026-1' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('ticketNumber must match format'))).toBe(true);
      });
    });

    describe('Title Validation', () => {
      it('should accept title within 200 characters', () => {
        const ticket = { ...validTicket, title: 'A'.repeat(200) };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject empty title', () => {
        const ticket = { ...validTicket, title: '' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('title must be a non-empty string'))).toBe(true);
      });

      it('should reject title exceeding 200 characters', () => {
        const ticket = { ...validTicket, title: 'A'.repeat(201) };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('title must not exceed 200 characters'))).toBe(true);
      });
    });

    describe('Description Validation', () => {
      it('should accept valid description', () => {
        const result = validateSupportTicket(validTicket);
        expect(result.isValid).toBe(true);
      });

      it('should reject empty description', () => {
        const ticket = { ...validTicket, description: '' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('description must be a non-empty string'))).toBe(true);
      });
    });

    describe('Requester Validation', () => {
      it('should accept valid requester email', () => {
        const result = validateSupportTicket(validTicket);
        expect(result.isValid).toBe(true);
      });

      it('should reject empty requester name', () => {
        const ticket = { ...validTicket, requesterName: '' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('requesterName must be a non-empty string'))).toBe(true);
      });

      it('should reject empty requester email', () => {
        const ticket = { ...validTicket, requesterEmail: '' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('requesterEmail must be a non-empty string'))).toBe(true);
      });

      it('should reject invalid email format - no @', () => {
        const ticket = { ...validTicket, requesterEmail: 'invalidemail.com' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('requesterEmail must be a valid email address'))).toBe(true);
      });

      it('should reject invalid email format - no domain', () => {
        const ticket = { ...validTicket, requesterEmail: 'test@' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('requesterEmail must be a valid email address'))).toBe(true);
      });

      it('should accept valid requester phone when provided', () => {
        const ticket = { ...validTicket, requesterPhone: '+6281234567890' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject empty requester phone when provided', () => {
        const ticket = { ...validTicket, requesterPhone: '' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('requesterPhone must be a non-empty string if provided'))).toBe(true);
      });

      it('should accept ticket without requester phone', () => {
        const ticket = { ...validTicket, requesterPhone: undefined };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Assignment Validation', () => {
      it('should accept valid assignedTo when provided', () => {
        const ticket = { ...validTicket, assignedTo: 1 };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject non-numeric assignedTo', () => {
        const ticket = { ...validTicket, assignedTo: 'invalid' as unknown as number };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('assignedTo must be a number if provided'))).toBe(true);
      });

      it('should accept ticket without assignedTo', () => {
        const ticket = { ...validTicket, assignedTo: undefined };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Date Validation', () => {
      it('should accept valid ISO 8601 dates', () => {
        const result = validateSupportTicket(validTicket);
        expect(result.isValid).toBe(true);
      });

      it('should reject empty createdAt', () => {
        const ticket = { ...validTicket, createdAt: '' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('createdAt must be a non-empty string'))).toBe(true);
      });

      it('should reject invalid createdAt format', () => {
        const ticket = { ...validTicket, createdAt: 'invalid-date' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('createdAt must be a valid ISO 8601 date string'))).toBe(true);
      });

      it('should reject empty updatedAt', () => {
        const ticket = { ...validTicket, updatedAt: '' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('updatedAt must be a non-empty string'))).toBe(true);
      });

      it('should reject invalid updatedAt format', () => {
        const ticket = { ...validTicket, updatedAt: 'not-a-date' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('updatedAt must be a valid ISO 8601 date string'))).toBe(true);
      });

      it('should accept valid resolvedAt when provided', () => {
        const ticket = { ...validTicket, resolvedAt: '2026-01-20T10:00:00.000Z' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
      });

      it('should reject empty resolvedAt when provided', () => {
        const ticket = { ...validTicket, resolvedAt: '' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('resolvedAt must be a non-empty string if provided'))).toBe(true);
      });

      it('should reject invalid resolvedAt format', () => {
        const ticket = { ...validTicket, resolvedAt: 'invalid' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('resolvedAt must be a valid ISO 8601 date string'))).toBe(true);
      });

      it('should accept valid closedAt when provided', () => {
        const ticket = { ...validTicket, closedAt: '2026-01-20T12:00:00.000Z' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
      });

      it('should accept valid dueDate when provided', () => {
        const ticket = { ...validTicket, dueDate: '2026-01-25T18:00:00.000Z' };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Arrays Validation', () => {
      it('should accept valid tags array', () => {
        const ticket = { ...validTicket, tags: ['tag1', 'tag2', 'tag3'] };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject tags when not an array', () => {
        const ticket = { ...validTicket, tags: 'not-an-array' as unknown as string[] };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('tags must be an array if provided'))).toBe(true);
      });

      it('should accept valid attachments array', () => {
        const ticket = { ...validTicket, attachments: ['file1.pdf', 'file2.jpg'] };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject attachments when not an array', () => {
        const ticket = { ...validTicket, attachments: 'not-an-array' as unknown as string[] };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('attachments must be an array if provided'))).toBe(true);
      });

      it('should accept valid comments array', () => {
        const ticket = { ...validTicket, comments: [validComment] };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it.skip('should reject comments when not an array', () => {
        const ticket = { ...validTicket, comments: 'not-an-array' as unknown as TicketComment[] };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('comments must be an array if provided'))).toBe(true);
      });
    });

    describe('Satisfaction Rating Validation', () => {
      it('should accept valid satisfaction rating: 1', () => {
        const ticket = { ...validTicket, satisfactionRating: 1 };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should accept valid satisfaction rating: 3', () => {
        const ticket = { ...validTicket, satisfactionRating: 3 };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should accept valid satisfaction rating: 5', () => {
        const ticket = { ...validTicket, satisfactionRating: 5 };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject satisfaction rating below 1', () => {
        const ticket = { ...validTicket, satisfactionRating: 0 };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('satisfactionRating must be between 1 and 5'))).toBe(true);
      });

      it('should reject satisfaction rating above 5', () => {
        const ticket = { ...validTicket, satisfactionRating: 6 };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('satisfactionRating must be between 1 and 5'))).toBe(true);
      });

      it('should reject non-numeric satisfaction rating', () => {
        const ticket = { ...validTicket, satisfactionRating: 'invalid' as unknown as number };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('satisfactionRating must be a number if provided'))).toBe(true);
      });

      it('should accept ticket without satisfaction rating', () => {
        const ticket = { ...validTicket, satisfactionRating: undefined };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Comments Validation', () => {
      it('should accept valid comments array', () => {
        const ticket = { ...validTicket, comments: [validComment] };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate and reject invalid comment in comments array', () => {
        const invalidComment = { ...validComment, authorEmail: 'invalid-email' };
        const ticket = { ...validTicket, comments: [invalidComment] };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('comments[0]'))).toBe(true);
      });

      it('should validate multiple comments in array', () => {
        const comments = [
          { ...validComment, id: 1, authorEmail: 'user1@example.com' },
          { ...validComment, id: 2, authorEmail: 'user2@example.com' },
          { ...validComment, id: 3, authorEmail: 'user3@example.com' }
        ];
        const ticket = { ...validTicket, comments };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Edge Cases', () => {
      it('should handle multiple validation errors', () => {
        const ticket = {
          ...validTicket,
          id: -1,
          title: '',
          requesterEmail: 'invalid'
        };
        const result = validateSupportTicket(ticket);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(2);
      });

      it('should handle all optional fields missing', () => {
        const minimalTicket = {
          id: 1,
          ticketNumber: 'TKT-2026-0001',
          title: 'Test',
          description: 'Test description',
          status: 'open' as TicketStatus,
          priority: 'medium' as TicketPriority,
          category: 'technical' as TicketCategory,
          requesterName: 'Test',
          requesterEmail: 'test@example.com',
          createdAt: '2026-01-20T08:00:00.000Z',
          updatedAt: '2026-01-20T08:00:00.000Z',
        };
        const result = validateSupportTicket(minimalTicket);
        expect(result.isValid).toBe(true);
      });

      it('should handle all optional fields present', () => {
        const fullTicket = {
          ...validTicket,
          requesterPhone: '+6281234567890',
          assignedTo: 1,
          resolvedAt: '2026-01-20T10:00:00.000Z',
          closedAt: '2026-01-20T12:00:00.000Z',
          dueDate: '2026-01-25T18:00:00.000Z',
          tags: ['tag1', 'tag2'],
          attachments: ['file1.pdf'],
          satisfactionRating: 5,
          comments: [validComment]
        };
        const result = validateSupportTicket(fullTicket);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('validateSupportTickets', () => {
    it('should validate array of valid tickets', () => {
      const tickets = [
        { ...validTicket, id: 1, ticketNumber: 'TKT-2026-0001' },
        { ...validTicket, id: 2, ticketNumber: 'TKT-2026-0002' },
        { ...validTicket, id: 3, ticketNumber: 'TKT-2026-0003' },
      ];
      const result = validateSupportTickets(tickets);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject array with duplicate ticket IDs', () => {
      const tickets = [
        { ...validTicket, id: 1, ticketNumber: 'TKT-2026-0001' },
        { ...validTicket, id: 1, ticketNumber: 'TKT-2026-0002' },
      ];
      const result = validateSupportTickets(tickets);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate ticket ID'))).toBe(true);
    });

    it('should reject array with duplicate ticket numbers', () => {
      const tickets = [
        { ...validTicket, id: 1, ticketNumber: 'TKT-2026-0001' },
        { ...validTicket, id: 2, ticketNumber: 'TKT-2026-0001' },
      ];
      const result = validateSupportTickets(tickets);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate ticket number'))).toBe(true);
    });

    it('should reject array with invalid ticket', () => {
      const tickets = [
        { ...validTicket, id: 1, ticketNumber: 'TKT-2026-0001' },
        { ...validTicket, id: 0, ticketNumber: 'TKT-2026-0002' },
      ];
      const result = validateSupportTickets(tickets);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate empty array', () => {
      const result = validateSupportTickets([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate single ticket array', () => {
      const tickets = [{ ...validTicket, id: 1, ticketNumber: 'TKT-2026-0001' }];
      const result = validateSupportTickets(tickets);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle multiple validation errors in array', () => {
      const tickets = [
        { ...validTicket, id: 1, ticketNumber: 'TKT-2026-0001' },
        { ...validTicket, id: -1, ticketNumber: 'TKT-2026-0002' },
        { ...validTicket, id: 1, ticketNumber: 'TKT-2026-0003' },
      ];
      const result = validateSupportTickets(tickets);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateTicketComment', () => {
    describe('Basic Field Validation', () => {
      it('should validate a valid comment', () => {
        const result = validateTicketComment(validComment);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject comment with missing id', () => {
        const comment = { ...validComment, id: undefined };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('id must be a positive number'))).toBe(true);
      });

      it('should reject comment with zero id', () => {
        const comment = { ...validComment, id: 0 };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('id must be a positive number'))).toBe(true);
      });

      it('should reject comment with negative id', () => {
        const comment = { ...validComment, id: -1 };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('id must be a positive number'))).toBe(true);
      });

      it('should reject comment with missing ticketId', () => {
        const comment = { ...validComment, ticketId: undefined };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('ticketId must be a positive number'))).toBe(true);
      });

      it('should reject comment with zero ticketId', () => {
        const comment = { ...validComment, ticketId: 0 };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('ticketId must be a positive number'))).toBe(true);
      });

      it('should reject comment with negative ticketId', () => {
        const comment = { ...validComment, ticketId: -1 };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('ticketId must be a positive number'))).toBe(true);
      });
    });

    describe('Author Validation', () => {
      it('should accept valid author name', () => {
        const result = validateTicketComment(validComment);
        expect(result.isValid).toBe(true);
      });

      it('should reject empty author name', () => {
        const comment = { ...validComment, authorName: '' };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('authorName must be a non-empty string'))).toBe(true);
      });

      it('should reject empty author email', () => {
        const comment = { ...validComment, authorEmail: '' };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('authorEmail must be a non-empty string'))).toBe(true);
      });

      it('should reject invalid author email format', () => {
        const comment = { ...validComment, authorEmail: 'invalid-email' };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('authorEmail must be a valid email address'))).toBe(true);
      });
    });

    describe('Author Role Validation', () => {
      it('should accept valid author role: user', () => {
        const comment = { ...validComment, authorRole: 'user' as const };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(true);
      });

      it('should accept valid author role: support', () => {
        const comment = { ...validComment, authorRole: 'support' as const };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(true);
      });

      it('should accept valid author role: admin', () => {
        const comment = { ...validComment, authorRole: 'admin' as const };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(true);
      });

      it('should accept comment without author role', () => {
        const comment = { ...validComment, authorRole: undefined };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid author role', () => {
        const comment = { ...validComment, authorRole: 'invalid_role' as 'user' | 'support' | 'admin' };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('authorRole must be one of: user, support, admin'))).toBe(true);
      });
    });

    describe('Content Validation', () => {
      it('should accept valid content', () => {
        const result = validateTicketComment(validComment);
        expect(result.isValid).toBe(true);
      });

      it('should reject empty content', () => {
        const comment = { ...validComment, content: '' };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('content must be a non-empty string'))).toBe(true);
      });
    });

    describe('isInternal Validation', () => {
      it('should accept isInternal: true', () => {
        const comment = { ...validComment, isInternal: true };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(true);
      });

      it('should accept isInternal: false', () => {
        const comment = { ...validComment, isInternal: false };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(true);
      });

      it('should reject non-boolean isInternal', () => {
        const comment = { ...validComment, isInternal: 'yes' as unknown as boolean };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('isInternal must be a boolean'))).toBe(true);
      });
    });

    describe('Date Validation', () => {
      it('should accept valid ISO 8601 createdAt', () => {
        const result = validateTicketComment(validComment);
        expect(result.isValid).toBe(true);
      });

      it('should reject empty createdAt', () => {
        const comment = { ...validComment, createdAt: '' };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('createdAt must be a non-empty string'))).toBe(true);
      });

      it('should reject invalid createdAt format', () => {
        const comment = { ...validComment, createdAt: 'invalid-date' };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('createdAt must be a valid ISO 8601 date string'))).toBe(true);
      });
    });

    describe('Attachments Validation', () => {
      it('should accept valid attachments array', () => {
        const comment = { ...validComment, attachments: ['file1.pdf', 'file2.jpg'] };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(true);
      });

      it('should reject attachments when not an array', () => {
        const comment = { ...validComment, attachments: 'not-an-array' as unknown as string[] };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('attachments must be an array if provided'))).toBe(true);
      });

      it('should accept comment without attachments', () => {
        const comment = { ...validComment, attachments: undefined };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should handle multiple validation errors', () => {
        const comment = {
          ...validComment,
          id: -1,
          authorName: '',
          content: '',
        };
        const result = validateTicketComment(comment);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(2);
      });

      it('should handle minimal valid comment', () => {
        const minimalComment = {
          id: 1,
          ticketId: 1,
          authorName: 'Test',
          authorEmail: 'test@example.com',
          content: 'Test content',
          isInternal: false,
          createdAt: '2026-01-20T08:00:00.000Z',
        };
        const result = validateTicketComment(minimalComment);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle all fields present', () => {
        const fullComment = {
          ...validComment,
          authorRole: 'support' as const,
          attachments: ['file1.pdf', 'file2.jpg'],
        };
        const result = validateTicketComment(fullComment);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('validateTicketComments', () => {
    it('should validate array of valid comments', () => {
      const comments = [
        { ...validComment, id: 1 },
        { ...validComment, id: 2 },
        { ...validComment, id: 3 },
      ];
      const result = validateTicketComments(comments);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject array with duplicate comment IDs', () => {
      const comments = [
        { ...validComment, id: 1 },
        { ...validComment, id: 1 },
      ];
      const result = validateTicketComments(comments);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate comment ID'))).toBe(true);
    });

    it('should reject array with invalid comment', () => {
      const comments = [
        { ...validComment, id: 1 },
        { ...validComment, id: 0 },
      ];
      const result = validateTicketComments(comments);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate empty array', () => {
      const result = validateTicketComments([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate single comment array', () => {
      const comments = [{ ...validComment, id: 1 }];
      const result = validateTicketComments(comments);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle multiple validation errors in array', () => {
      const comments = [
        { ...validComment, id: 1 },
        { ...validComment, id: -1 },
        { ...validComment, id: 1 },
      ];
      const result = validateTicketComments(comments);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should validate comments with different roles', () => {
      const comments = [
        { ...validComment, id: 1, authorRole: 'user' as const },
        { ...validComment, id: 2, authorRole: 'support' as const },
        { ...validComment, id: 3, authorRole: 'admin' as const },
        { ...validComment, id: 4, authorRole: undefined },
      ];
      const result = validateTicketComments(comments);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Integration Tests', () => {
    it('should validate complete ticket with comments', () => {
      const comments = [
        { ...validComment, id: 1, authorRole: 'user' as const },
        { ...validComment, id: 2, authorRole: 'support' as const },
        { ...validComment, id: 3, authorRole: 'admin' as const, isInternal: true },
      ];
      const ticket = {
        ...validTicket,
        id: 1,
        ticketNumber: 'TKT-2026-0001',
        requesterPhone: '+6281234567890',
        assignedTo: 1,
        tags: ['tag1', 'tag2', 'tag3'],
        attachments: ['file1.pdf', 'file2.jpg'],
        comments,
        satisfactionRating: 5,
      };
      const result = validateSupportTicket(ticket);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate array of complete tickets with comments', () => {
      const comments1 = [
        { ...validComment, id: 1, ticketId: 1 },
        { ...validComment, id: 2, ticketId: 1 },
      ];
      const comments2 = [
        { ...validComment, id: 3, ticketId: 2 },
      ];
      const tickets = [
        {
          ...validTicket,
          id: 1,
          ticketNumber: 'TKT-2026-0001',
          comments: comments1,
          satisfactionRating: 5,
        },
        {
          ...validTicket,
          id: 2,
          ticketNumber: 'TKT-2026-0002',
          comments: comments2,
          satisfactionRating: 4,
        },
      ];
      const result = validateSupportTickets(tickets);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid comment within ticket comments array', () => {
      const comments = [
        { ...validComment, id: 1, authorEmail: 'invalid-email' },
      ];
      const ticket = {
        ...validTicket,
        id: 1,
        ticketNumber: 'TKT-2026-0001',
        comments,
      };
      const result = validateSupportTicket(ticket);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('comments[0]'))).toBe(true);
    });
  });
});
