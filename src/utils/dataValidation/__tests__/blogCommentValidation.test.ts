import { validateBlogCommentItem } from "@/utils/dataValidation/blogValidation";
import type { BlogCommentItem } from "@/types/data";
import type { StaticImageData } from "next/image";

describe("validateBlogCommentItem", () => {
  const validComment: BlogCommentItem = {
    id: 1,
    blogId: 1,
    parentId: null,
    avatar: {} as StaticImageData,
    name: "Test User",
    date: "2024-01-15",
    content: "Test comment content",
    status: "approved",
    upvotes: 5,
    downvotes: 0,
  };

  describe("Basic Validation", () => {
    it("should validate a valid comment with parentId: null", () => {
      const result = validateBlogCommentItem(validComment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate a valid comment with valid parentId", () => {
      const comment = { ...validComment, parentId: 2 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject comment with missing required fields", () => {
      const invalidComment = { ...validComment, name: undefined };
      const result = validateBlogCommentItem(invalidComment as BlogCommentItem);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject comment with invalid id", () => {
      const comment = { ...validComment, id: 0 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("id must be a positive number"))).toBe(true);
    });

    it("should reject comment with negative blogId", () => {
      const comment = { ...validComment, blogId: -1 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("blogId") && e.includes("positive number"))).toBe(true);
    });
  });

  describe("Status Validation", () => {
    it("should accept valid status: pending", () => {
      const comment = { ...validComment, status: "pending" as const };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept valid status: approved", () => {
      const comment = { ...validComment, status: "approved" as const };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept valid status: rejected", () => {
      const comment = { ...validComment, status: "rejected" as const };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

        it("should reject invalid status", () => {
            const comment = { ...validComment, status: "invalid" as unknown as "pending" | "approved" | "rejected" };
            const result = validateBlogCommentItem(comment);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("status must be one of: pending, approved, rejected, spam, got: invalid");
        });
  });

  describe("Parent ID Validation", () => {
    it("should accept parentId: null (root comment)", () => {
      const comment = { ...validComment, parentId: null };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept valid parentId (reply)", () => {
      const comment = { ...validComment, parentId: 5 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept parentId: 1 (minimum valid value)", () => {
      const comment = { ...validComment, parentId: 1 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Votes Validation", () => {
    it("should accept upvotes: 0", () => {
      const comment = { ...validComment, upvotes: 0 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept positive upvotes", () => {
      const comment = { ...validComment, upvotes: 100 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject negative upvotes", () => {
      const comment = { ...validComment, upvotes: -1 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("upvotes") && e.includes("positive number"))).toBe(true);
    });

    it("should accept downvotes: 0", () => {
      const comment = { ...validComment, downvotes: 0 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept positive downvotes", () => {
      const comment = { ...validComment, downvotes: 50 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject negative downvotes", () => {
      const comment = { ...validComment, downvotes: -1 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("downvotes") && e.includes("positive number"))).toBe(true);
    });
  });

  describe("String Field Validation", () => {
    it("should reject missing name", () => {
      const comment = { ...validComment, name: "" };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(false);
      const hasNameError = result.errors.some(e => e.includes('name must be a non-empty string'));
      expect(hasNameError).toBe(true);
    });

    it("should reject missing date", () => {
      const comment = { ...validComment, date: "" };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(false);
      const hasDateError = result.errors.some(e => e.includes('date must be a non-empty string'));
      expect(hasDateError).toBe(true);
    });

    it("should reject missing content", () => {
      const comment = { ...validComment, content: "" };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(false);
      const hasContentError = result.errors.some(e => e.includes('content must be a non-empty string'));
      expect(hasContentError).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large upvote count", () => {
      const comment = { ...validComment, upvotes: 999999999 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle very large downvote count", () => {
      const comment = { ...validComment, downvotes: 999999999 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle multiple validation errors", () => {
      const comment = {
        ...validComment,
        status: "invalid" as unknown as "pending" | "approved" | "rejected",
        name: "",
      };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it("should handle parentId with very large value", () => {
      const comment = { ...validComment, parentId: 999999999 };
      const result = validateBlogCommentItem(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Threading Scenarios", () => {
    it("should validate root comment (parentId: null)", () => {
      const rootComment = { ...validComment, parentId: null };
      const result = validateBlogCommentItem(rootComment);
      expect(result.isValid).toBe(true);
    });

    it("should validate reply comment (parentId set)", () => {
      const replyComment = { ...validComment, parentId: 1 };
      const result = validateBlogCommentItem(replyComment);
      expect(result.isValid).toBe(true);
    });

    it("should validate deep nesting (large parentId)", () => {
      const deepComment = { ...validComment, parentId: 99999 };
      const result = validateBlogCommentItem(deepComment);
      expect(result.isValid).toBe(true);
    });
  });

  describe("Moderation Workflow Scenarios", () => {
    it("should validate pending comment (awaiting moderation)", () => {
      const pendingComment = { ...validComment, status: "pending" as const };
      const result = validateBlogCommentItem(pendingComment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate approved comment (published)", () => {
      const approvedComment = { ...validComment, status: "approved" as const };
      const result = validateBlogCommentItem(approvedComment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate rejected comment (hidden)", () => {
      const rejectedComment = { ...validComment, status: "rejected" as const };
      const result = validateBlogCommentItem(rejectedComment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate comment with zero votes (new comment)", () => {
      const newComment = {
        ...validComment,
        status: "pending" as const,
        upvotes: 0,
        downvotes: 0,
      };
      const result = validateBlogCommentItem(newComment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
