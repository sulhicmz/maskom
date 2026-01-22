import { z } from 'zod';

export const JoinRequestSchema = z.object({
  action: z.literal('join'),
  postId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  userId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  username: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/)
});

export const LeaveRequestSchema = z.object({
  action: z.literal('leave'),
  sessionId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  userId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
});

const PositionSchema = z.object({
  line: z.number().int().nonnegative().max(100000),
  column: z.number().int().nonnegative().max(10000)
});

export const CursorUpdateRequestSchema = z.object({
  action: z.literal('cursor_update'),
  sessionId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  userId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  cursorPosition: PositionSchema,
  selection: z.object({
    start: PositionSchema,
    end: PositionSchema
  }).optional()
});

const EditOperationSchema = z.object({
  type: z.enum(['insert', 'delete', 'replace']),
  position: PositionSchema,
  content: z.string().max(10000).optional(),
  length: z.number().int().nonnegative().max(10000).optional()
});

export const EditRequestSchema = z.object({
  action: z.literal('edit'),
  sessionId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  userId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  editOperation: EditOperationSchema
});

const CommentContentSchema = z.object({
  content: z.string().min(1).max(1000),
  position: PositionSchema
});

export const CommentRequestSchema = z.object({
  action: z.literal('comment'),
  sessionId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  userId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  username: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  comment: CommentContentSchema
});

export const CollaborationRequestSchema = z.discriminatedUnion('action', [
  JoinRequestSchema,
  LeaveRequestSchema,
  CursorUpdateRequestSchema,
  EditRequestSchema,
  CommentRequestSchema
]);

export type JoinRequest = z.infer<typeof JoinRequestSchema>;
export type LeaveRequest = z.infer<typeof LeaveRequestSchema>;
export type CursorUpdateRequest = z.infer<typeof CursorUpdateRequestSchema>;
export type EditRequest = z.infer<typeof EditRequestSchema>;
export type CommentRequest = z.infer<typeof CommentRequestSchema>;
export type CollaborationRequest = z.infer<typeof CollaborationRequestSchema>;
