import {
  approveComment,
  rejectComment,
  markAsSpam,
  bulkModerateComments,
  calculateModerationStats,
  filterCommentsByStatus,
} from '../moderation';
import { BlogCommentItem } from '@/types/data';

const createMockComment = (id: number, status = 'pending' as const): BlogCommentItem => ({
  id,
  blogId: 1,
  parentId: null,
  avatar: { src: '/avatar.jpg', height: 100, width: 100, blurDataURL: '' },
  name: 'Test User',
  date: '2023-08-27',
  content: 'Test comment content',
  status,
  upvotes: 0,
  downvotes: 0,
});

describe('Moderation Utilities', () => {
  describe('approveComment', () => {
    it('should approve a comment and set moderation metadata', () => {
      const comment = createMockComment(1, 'pending');
      const moderatorId = 42;
      const approved = approveComment(comment, moderatorId);

      expect(approved.status).toBe('approved');
      expect(approved.moderatedAt).toBeDefined();
      expect(approved.moderatedBy).toBe(moderatorId);
      expect(approved.id).toBe(1);
      expect(approved.content).toBe(comment.content);
    });

    it('should not modify other comment properties', () => {
      const comment = createMockComment(1, 'rejected');
      const approved = approveComment(comment, 99);

      expect(approved.id).toBe(comment.id);
      expect(approved.blogId).toBe(comment.blogId);
      expect(approved.name).toBe(comment.name);
      expect(approved.content).toBe(comment.content);
      expect(approved.upvotes).toBe(comment.upvotes);
      expect(approved.downvotes).toBe(comment.downvotes);
    });

    it('should override existing moderation metadata', () => {
      const comment = createMockComment(1, 'approved');
      comment.moderatedAt = '2023-01-01';
      comment.moderatedBy = 50;
      const approved = approveComment(comment, 100);

      expect(approved.status).toBe('approved');
      expect(approved.moderatedAt).not.toBe('2023-01-01');
      expect(approved.moderatedBy).toBe(100);
    });
  });

  describe('rejectComment', () => {
    it('should reject a comment and set moderation metadata', () => {
      const comment = createMockComment(2, 'pending');
      const moderatorId = 55;
      const rejected = rejectComment(comment, moderatorId);

      expect(rejected.status).toBe('rejected');
      expect(rejected.moderatedAt).toBeDefined();
      expect(rejected.moderatedBy).toBe(moderatorId);
    });

    it('should not modify other comment properties', () => {
      const comment = createMockComment(2, 'pending');
      const rejected = rejectComment(comment, 77);

      expect(rejected.id).toBe(comment.id);
      expect(rejected.blogId).toBe(comment.blogId);
      expect(rejected.name).toBe(comment.name);
      expect(rejected.content).toBe(comment.content);
    });
  });

  describe('markAsSpam', () => {
    it('should mark a comment as spam and set moderation metadata', () => {
      const comment = createMockComment(3, 'pending');
      const moderatorId = 88;
      const spam = markAsSpam(comment, moderatorId);

      expect(spam.status).toBe('spam');
      expect(spam.moderatedAt).toBeDefined();
      expect(spam.moderatedBy).toBe(moderatorId);
    });

    it('should not modify other comment properties', () => {
      const comment = createMockComment(3, 'approved');
      const spam = markAsSpam(comment, 111);

      expect(spam.id).toBe(comment.id);
      expect(spam.blogId).toBe(comment.blogId);
      expect(spam.name).toBe(comment.name);
      expect(spam.content).toBe(comment.content);
    });
  });

  describe('bulkModerateComments', () => {
    it('should bulk approve selected comments', () => {
      const comments = [
        createMockComment(1, 'pending'),
        createMockComment(2, 'pending'),
        createMockComment(3, 'approved'),
        createMockComment(4, 'pending'),
      ];
      const selectedIds = [1, 2, 4];
      const moderatorId = 10;
      const result = bulkModerateComments(
        comments,
        selectedIds,
        'approved',
        moderatorId
      );

      expect(result.length).toBe(4);
      expect(result[0].status).toBe('approved');
      expect(result[1].status).toBe('approved');
      expect(result[2].status).toBe('approved');
      expect(result[3].status).toBe('approved');
      expect(result[0].moderatedBy).toBe(moderatorId);
      expect(result[1].moderatedBy).toBe(moderatorId);
      expect(result[3].moderatedBy).toBe(moderatorId);
    });

    it('should bulk reject selected comments', () => {
      const comments = [
        createMockComment(1, 'pending'),
        createMockComment(2, 'pending'),
        createMockComment(3, 'pending'),
      ];
      const selectedIds = [1, 3];
      const moderatorId = 20;
      const result = bulkModerateComments(
        comments,
        selectedIds,
        'rejected',
        moderatorId
      );

      expect(result[0].status).toBe('rejected');
      expect(result[1].status).toBe('pending');
      expect(result[2].status).toBe('rejected');
    });

    it('should bulk mark selected comments as spam', () => {
      const comments = [
        createMockComment(1, 'pending'),
        createMockComment(2, 'approved'),
        createMockComment(3, 'rejected'),
      ];
      const selectedIds = [1, 2];
      const moderatorId = 30;
      const result = bulkModerateComments(
        comments,
        selectedIds,
        'spam',
        moderatorId
      );

      expect(result[0].status).toBe('spam');
      expect(result[1].status).toBe('spam');
      expect(result[2].status).toBe('rejected');
    });

    it('should handle empty selected comments array', () => {
      const comments = [
        createMockComment(1, 'pending'),
        createMockComment(2, 'pending'),
      ];
      const selectedIds: number[] = [];
      const result = bulkModerateComments(
        comments,
        selectedIds,
        'approved',
        40
      );

      expect(result.length).toBe(2);
      expect(result[0].status).toBe('pending');
      expect(result[1].status).toBe('pending');
    });

    it('should handle all comments selected', () => {
      const comments = [
        createMockComment(1, 'pending'),
        createMockComment(2, 'pending'),
        createMockComment(3, 'pending'),
      ];
      const selectedIds = [1, 2, 3];
      const moderatorId = 50;
      const result = bulkModerateComments(
        comments,
        selectedIds,
        'rejected',
        moderatorId
      );

      expect(result.every((comment) => comment.status === 'rejected')).toBe(true);
      expect(
        result.every((comment) => comment.moderatedBy === moderatorId)
      ).toBe(true);
    });
  });

  describe('calculateModerationStats', () => {
    it('should calculate correct stats for all comment statuses', () => {
      const comments = [
        createMockComment(1, 'pending'),
        createMockComment(2, 'pending'),
        createMockComment(3, 'approved'),
        createMockComment(4, 'approved'),
        createMockComment(5, 'approved'),
        createMockComment(6, 'rejected'),
        createMockComment(7, 'rejected'),
        createMockComment(8, 'spam'),
        createMockComment(9, 'spam'),
        createMockComment(10, 'spam'),
      ];

      const stats = calculateModerationStats(comments);

      expect(stats.total).toBe(10);
      expect(stats.pending).toBe(2);
      expect(stats.approved).toBe(3);
      expect(stats.rejected).toBe(2);
      expect(stats.spam).toBe(3);
    });

    it('should handle empty comments array', () => {
      const stats = calculateModerationStats([]);

      expect(stats.total).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.approved).toBe(0);
      expect(stats.rejected).toBe(0);
      expect(stats.spam).toBe(0);
    });

    it('should handle single status comments', () => {
      const comments = [
        createMockComment(1, 'approved'),
        createMockComment(2, 'approved'),
        createMockComment(3, 'approved'),
      ];

      const stats = calculateModerationStats(comments);

      expect(stats.total).toBe(3);
      expect(stats.approved).toBe(3);
      expect(stats.pending).toBe(0);
      expect(stats.rejected).toBe(0);
      expect(stats.spam).toBe(0);
    });

    it('should handle comments with no moderation metadata', () => {
      const comments = [
        createMockComment(1, 'pending'),
        createMockComment(2, 'approved'),
        createMockComment(3, 'rejected'),
      ];

      const stats = calculateModerationStats(comments);

      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.approved).toBe(1);
      expect(stats.rejected).toBe(1);
      expect(stats.spam).toBe(0);
    });
  });

  describe('filterCommentsByStatus', () => {
    const comments = [
      createMockComment(1, 'pending'),
      createMockComment(2, 'approved'),
      createMockComment(3, 'rejected'),
      createMockComment(4, 'spam'),
      createMockComment(5, 'pending'),
    ];

    it('should filter comments by pending status', () => {
      const result = filterCommentsByStatus(comments, 'pending');

      expect(result.length).toBe(2);
      expect(result.every((c) => c.status === 'pending')).toBe(true);
    });

    it('should filter comments by approved status', () => {
      const result = filterCommentsByStatus(comments, 'approved');

      expect(result.length).toBe(1);
      expect(result[0].status).toBe('approved');
    });

    it('should filter comments by rejected status', () => {
      const result = filterCommentsByStatus(comments, 'rejected');

      expect(result.length).toBe(1);
      expect(result[0].status).toBe('rejected');
    });

    it('should filter comments by spam status', () => {
      const result = filterCommentsByStatus(comments, 'spam');

      expect(result.length).toBe(1);
      expect(result[0].status).toBe('spam');
    });

    it('should return all comments when status is "all"', () => {
      const result = filterCommentsByStatus(comments, 'all');

      expect(result.length).toBe(5);
      expect(result).toEqual(comments);
    });

    it('should return empty array when no comments match status', () => {
      const pendingOnly = [createMockComment(1, 'pending')];
      const result = filterCommentsByStatus(pendingOnly, 'spam');

      expect(result).toEqual([]);
    });

    it('should handle empty comments array', () => {
      const result = filterCommentsByStatus([], 'all');

      expect(result).toEqual([]);
    });

    it('should not modify original comments array', () => {
      const commentsCopy = [...comments];
      filterCommentsByStatus(comments, 'approved');

      expect(comments).toEqual(commentsCopy);
    });
  });
});
