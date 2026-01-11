import type { BlogCommentItem, InnerBlogPost } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateBlogCommentItem = createValidator<BlogCommentItem>({
  typeName: "BlogCommentItem",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "name", required: true },
    { key: "date", required: true },
    { key: "content", required: true },
  ],
});

export const validateInnerBlogPost = createValidator<InnerBlogPost>({
  typeName: "InnerBlogPost",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "title", required: true },
    { key: "desc", required: true },
    { key: "date", required: true },
    { key: "user", required: true },
    { key: "tag", required: true },
  ],
});
