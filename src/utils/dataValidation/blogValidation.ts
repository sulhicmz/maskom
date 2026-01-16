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

export const validateBlogCommentItem = createValidator<BlogCommentItem>({
  typeName: "BlogCommentItem",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "name", required: true },
    { key: "date", required: true },
    { key: "content", required: true },
  ],
});

export const validateInnerBlogPost = (item: InnerBlogPost): { isValid: boolean; errors: string[] } => {
   const baseValidation = createValidator<InnerBlogPost>({
     typeName: "InnerBlogPost",
     numberFields: [
       { key: "id", required: true, min: 1 },
       { key: "categoryId", required: true, min: 1 },
       { key: "tagId", required: true, min: 1 },
     ],
     stringFields: [
       { key: "title", required: true },
       { key: "desc", required: true },
       { key: "date", required: true },
       { key: "user", required: true },
       { key: "category", required: false },
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
   }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
};
