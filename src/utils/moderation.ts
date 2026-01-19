import { BlogCommentItem, CommentModerationStatus } from '@/types/data';

export interface ModerationResult {
  success: boolean;
  error?: string;
}

export interface ModerationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
}

export function approveComment(comment: BlogCommentItem, moderatorId: number): BlogCommentItem {
  return {
    ...comment,
    status: 'approved' as CommentModerationStatus,
    moderatedAt: new Date().toISOString(),
    moderatedBy: moderatorId,
  };
}

export function rejectComment(comment: BlogCommentItem, moderatorId: number): BlogCommentItem {
  return {
    ...comment,
    status: 'rejected' as CommentModerationStatus,
    moderatedAt: new Date().toISOString(),
    moderatedBy: moderatorId,
  };
}

export function markAsSpam(comment: BlogCommentItem, moderatorId: number): BlogCommentItem {
  return {
    ...comment,
    status: 'spam' as CommentModerationStatus,
    moderatedAt: new Date().toISOString(),
    moderatedBy: moderatorId,
  };
}

export function bulkModerateComments(
  comments: BlogCommentItem[],
  commentIds: number[],
  newStatus: CommentModerationStatus,
  moderatorId: number
): BlogCommentItem[] {
  return comments.map((comment) => {
    if (commentIds.includes(comment.id)) {
      const moderatonFn = getModerationFunction(newStatus);
      return moderatonFn(comment, moderatorId);
    }
    return comment;
  });
}

function getModerationFunction(status: CommentModerationStatus): (
  comment: BlogCommentItem,
  moderatorId: number
) => BlogCommentItem {
  switch (status) {
    case 'approved':
      return approveComment;
    case 'rejected':
      return rejectComment;
    case 'spam':
      return markAsSpam;
    default:
      return (comment: BlogCommentItem) => comment;
  }
}

export function calculateModerationStats(comments: BlogCommentItem[]): ModerationStats {
  return comments.reduce(
    (stats, comment) => {
      stats.total++;
      stats[comment.status]++;
      return stats;
    },
    {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      spam: 0,
    } as ModerationStats
  );
}

export function filterCommentsByStatus(
  comments: BlogCommentItem[],
  status: CommentModerationStatus | 'all'
): BlogCommentItem[] {
  if (status === 'all') {
    return comments;
  }
  return comments.filter((comment) => comment.status === status);
}
