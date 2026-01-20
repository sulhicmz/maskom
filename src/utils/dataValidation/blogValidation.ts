import type { BlogCommentItem, InnerBlogPost, BlogTagItem, CategoryItem } from "@/types/data";
import { createValidator } from "./baseValidation";
import blog_categories_data from "@/data/BlogCategoryData";

export const validateCategoryItem = createValidator<CategoryItem>({
    typeName: "CategoryItem",
    numberFields: [{ key: "id", required: true, min: 1 }],
    stringFields: [{ key: "name", required: true }],
});

export const validateBlogTagItem = createValidator<BlogTagItem>({
    typeName: "BlogTagItem",
    numberFields: [{ key: "id", required: true, min: 1 }],
    stringFields: [{ key: "name", required: true }],
});

export const validateBlogCommentItem = (item: BlogCommentItem): { isValid: boolean; errors: string[] } => {
  const baseValidation = createValidator<BlogCommentItem>({
    typeName: "BlogCommentItem",
    numberFields: [
      { key: "id", required: true, min: 1 },
      { key: "parentId", required: false, min: 1 },
      { key: "blogId", required: true, min: 1 },
      { key: "upvotes", required: true, min: 0 },
      { key: "downvotes", required: true, min: 0 },
    ],
    stringFields: [
      { key: "name", required: true },
      { key: "date", required: true },
      { key: "content", required: true },
    ],
  })(item);

  const errors: string[] = [...baseValidation.errors];

  const validStatuses = ['pending', 'approved', 'rejected', 'spam'] as const;
  if (!validStatuses.includes(item.status)) {
    errors.push(`status must be one of: pending, approved, rejected, spam, got: ${item.status}`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
};

export const validateInnerBlogPost = (item: InnerBlogPost): { isValid: boolean; errors: string[] } => {
    const baseValidation = createValidator<InnerBlogPost>({
      typeName: "InnerBlogPost",
      numberFields: [
        { key: "id", required: true, min:1 },
        { key: "categoryId", required: true, min:1 },
        { key: "tagId", required: true, min:1 },
        { key: "viewCount", required: false, min:0 },
        { key: "engagementScore", required: false, min:0, max:100 },
        { key: "shareCount", required: false, min:0 },
        { key: "avgReadTime", required: false, min:0 },
      ],
      stringFields: [
        { key: "title", required: true },
        { key: "desc", required: true },
        { key: "date", required: true },
        { key: "user", required: true },
        { key: "category", required: false },
        { key: "lastViewedAt", required: false },
      ],
    })(item);

    const errors: string[] = [...baseValidation.errors];

    if (baseValidation.isValid) {
       const validCategoryIds = new Set(blog_categories_data.map((cat) => cat.id));
       if (!validCategoryIds.has(item.categoryId)) {
         errors.push(`categoryId must reference a valid category (got: ${item.categoryId})`);
       }

       if ('status' in item && item.status !== undefined) {
        const validStatuses = ['draft', 'scheduled', 'published'] as const;
        if (!validStatuses.includes(item.status as 'draft' | 'scheduled' | 'published')) {
          errors.push(`status must be one of: draft, scheduled, published, got: ${item.status}`);
        }
      }

      if ('publishDate' in item && item.publishDate !== undefined) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(item.publishDate)) {
          errors.push(`publishDate must be in ISO 8601 format (YYYY-MM-DD), got: ${item.publishDate}`);
        }
      }

      if ('lastViewedAt' in item && item.lastViewedAt !== undefined) {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?$/;
        if (!isoDateRegex.test(item.lastViewedAt)) {
          errors.push(`lastViewedAt must be in ISO 8601 format with time (YYYY-MM-DDTHH:mm:ss.sssZ), got: ${item.lastViewedAt}`);
        }
      }
    }

   if (errors.length > 0) {
     return { isValid: false, errors };
   }

   return { isValid: true, errors: [] };
};

export const validateViewCount = (viewCount: unknown): { isValid: boolean; errors: string[] } => {
   const errors: string[] = [];

   if (typeof viewCount !== "number") {
     errors.push(`viewCount must be a number, got: ${typeof viewCount}`);
     return { isValid: false, errors };
   }

   if (!Number.isInteger(viewCount)) {
     errors.push(`viewCount must be an integer, got: ${viewCount}`);
   }

   if (viewCount < 0) {
     errors.push(`viewCount must be non-negative, got: ${viewCount}`);
   }

   if (viewCount > Number.MAX_SAFE_INTEGER) {
     errors.push(`viewCount exceeds maximum safe integer value, got: ${viewCount}`);
   }

   return { isValid: errors.length === 0, errors };
};

export const validateEngagementScore = (engagementScore: unknown): { isValid: boolean; errors: string[] } => {
   const errors: string[] = [];

   if (typeof engagementScore !== "number") {
     errors.push(`engagementScore must be a number, got: ${typeof engagementScore}`);
     return { isValid: false, errors };
   }

   if (!Number.isInteger(engagementScore)) {
     errors.push(`engagementScore must be an integer, got: ${engagementScore}`);
   }

   if (engagementScore < 0) {
     errors.push(`engagementScore must be non-negative, got: ${engagementScore}`);
   }

   if (engagementScore > 100) {
     errors.push(`engagementScore must be at most 100, got: ${engagementScore}`);
   }

   return { isValid: errors.length === 0, errors };
};

export const validateAvgReadTime = (avgReadTime: unknown): { isValid: boolean; errors: string[] } => {
   const errors: string[] = [];

   if (typeof avgReadTime !== "number") {
     errors.push(`avgReadTime must be a number, got: ${typeof avgReadTime}`);
     return { isValid: false, errors };
   }

   if (avgReadTime < 0) {
     errors.push(`avgReadTime must be non-negative, got: ${avgReadTime}`);
   }

   if (!Number.isFinite(avgReadTime)) {
     errors.push(`avgReadTime must be a finite number, got: ${avgReadTime}`);
   }

   return { isValid: errors.length === 0, errors };
};

export const validateShareCount = (shareCount: unknown): { isValid: boolean; errors: string[] } => {
   const errors: string[] = [];

   if (typeof shareCount !== "number") {
     errors.push(`shareCount must be a number, got: ${typeof shareCount}`);
     return { isValid: false, errors };
   }

   if (!Number.isInteger(shareCount)) {
     errors.push(`shareCount must be an integer, got: ${shareCount}`);
   }

   if (shareCount < 0) {
     errors.push(`shareCount must be non-negative, got: ${shareCount}`);
   }

   return { isValid: errors.length === 0, errors };
};

export const validateContentMetrics = (metrics: {
   viewCount?: number;
   engagementScore?: number;
   shareCount?: number;
   avgReadTime?: number;
}): { isValid: boolean; errors: string[] } => {
   const errors: string[] = [];

   if (metrics.viewCount !== undefined) {
     const viewCountValidation = validateViewCount(metrics.viewCount);
     if (!viewCountValidation.isValid) {
       errors.push(...viewCountValidation.errors);
     }
   }

   if (metrics.engagementScore !== undefined) {
     const engagementScoreValidation = validateEngagementScore(metrics.engagementScore);
     if (!engagementScoreValidation.isValid) {
       errors.push(...engagementScoreValidation.errors);
     }
   }

   if (metrics.shareCount !== undefined) {
     const shareCountValidation = validateShareCount(metrics.shareCount);
     if (!shareCountValidation.isValid) {
       errors.push(...shareCountValidation.errors);
     }
   }

   if (metrics.avgReadTime !== undefined) {
     const avgReadTimeValidation = validateAvgReadTime(metrics.avgReadTime);
     if (!avgReadTimeValidation.isValid) {
       errors.push(...avgReadTimeValidation.errors);
     }
   }

   return { isValid: errors.length === 0, errors };
};
