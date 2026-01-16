import type { DataRelationship } from "@/types/data";

export const VALID_PAGES = [
  "about",
  "home_1",
  "home_2",
  "home_3",
  "pricing",
] as const;

export type ValidPage = typeof VALID_PAGES[number];

export const DATA_RELATIONSHIPS: DataRelationship[] = [
   {
     sourceCollection: "BlogCommentData",
     targetCollection: "InnerBlogData",
     sourceField: "blogId",
     targetField: "id",
     type: "many-to-one",
     optional: false,
   },
   {
     sourceCollection: "InnerBlogData",
     targetCollection: "BlogTagData",
     sourceField: "tagId",
     targetField: "id",
     type: "many-to-one",
     optional: false,
   },
   {
     sourceCollection: "InnerBlogData",
     targetCollection: "BlogCategoryData",
     sourceField: "categoryId",
     targetField: "id",
     type: "many-to-one",
     optional: false,
   },
];

export function isValidPage(page: string): page is ValidPage {
  return VALID_PAGES.includes(page as ValidPage);
}

export function validatePageValue(page: unknown): { isValid: boolean; error?: string } {
  if (typeof page !== "string") {
    return { isValid: false, error: "Page value must be a string" };
  }
  if (!isValidPage(page)) {
    return {
      isValid: false,
      error: `Invalid page value: '${page}'. Valid pages are: ${VALID_PAGES.join(", ")}`,
    };
  }
  return { isValid: true };
}

export const VALID_PAGES_SET = new Set<string>(VALID_PAGES);

export default DATA_RELATIONSHIPS;
