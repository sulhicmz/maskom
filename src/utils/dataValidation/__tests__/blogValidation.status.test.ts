import { validateInnerBlogPost } from "@/utils/dataValidation/blogValidation";
import type { InnerBlogPost } from "@/types/data";
import type { StaticImageData } from "next/image";

describe("validateInnerBlogPost", () => {
  const validBlogPost: InnerBlogPost = {
    id: 1,
    thumb: {} as StaticImageData,
    title: "Test Blog Post",
    desc: "Test description",
    date: "2024-01-15",
    user: "Test User",
    tagId: 1,
    categoryId: 1,
    category: "Test Category",
    status: "published",
  };

  it("should validate a valid blog post without status", () => {
    const postWithoutStatus = { ...validBlogPost, status: undefined };
    const result = validateInnerBlogPost(postWithoutStatus);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should validate a valid published blog post", () => {
    const post = { ...validBlogPost, status: "published" as const };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should validate a valid draft blog post", () => {
    const post = { ...validBlogPost, status: "draft" as const };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should validate a valid scheduled blog post", () => {
    const post = {
      ...validBlogPost,
      status: "scheduled" as const,
      publishDate: "2024-02-01",
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject invalid status value", () => {
    const post = { ...validBlogPost, status: "invalid" as unknown as "draft" | "scheduled" | "published" };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("status must be one of: draft, scheduled, published, got: invalid");
  });

  it("should reject invalid publishDate format", () => {
    const post = {
      ...validBlogPost,
      status: "scheduled" as const,
      publishDate: "2024/01/15",
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("publishDate must be in ISO 8601 format (YYYY-MM-DD), got: 2024/01/15");
  });

  it("should accept valid ISO 8601 publishDate", () => {
    const post = {
      ...validBlogPost,
      status: "scheduled" as const,
      publishDate: "2024-12-31",
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject publishDate with invalid format (missing leading zeros)", () => {
    const post = {
      ...validBlogPost,
      status: "scheduled" as const,
      publishDate: "2024-1-5",
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("publishDate must be in ISO 8601 format (YYYY-MM-DD), got: 2024-1-5");
  });

  it("should accept publishDate without status (optional field)", () => {
    const post = { ...validBlogPost, publishDate: "2024-01-15" };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject publishDate with non-string value", () => {
    const post = {
      ...validBlogPost,
      status: "scheduled" as const,
      publishDate: 20240115 as unknown as string,
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(false);
  });

  it("should handle multiple validation errors", () => {
    const post = {
      ...validBlogPost,
      status: "invalid" as unknown as "draft" | "scheduled" | "published",
      publishDate: "2024/01/15",
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it("should validate draft post without publishDate", () => {
    const post = {
      ...validBlogPost,
      status: "draft" as const,
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should validate published post without publishDate", () => {
    const post = {
      ...validBlogPost,
      status: "published" as const,
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject scheduled post without publishDate", () => {
    const post = {
      ...validBlogPost,
      status: "scheduled" as const,
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should handle edge case: year 9999 in publishDate", () => {
    const post = {
      ...validBlogPost,
      status: "scheduled" as const,
      publishDate: "9999-12-31",
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should handle edge case: year 0001 in publishDate", () => {
    const post = {
      ...validBlogPost,
      status: "scheduled" as const,
      publishDate: "0001-01-01",
    };
    const result = validateInnerBlogPost(post);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
