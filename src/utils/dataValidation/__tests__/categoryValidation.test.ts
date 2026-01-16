/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateCategoryItem, validateInnerBlogPost } from "../blogValidation";
import blog_categories_data from "@/data/BlogCategoryData";

describe("Category Validation", () => {
   describe("validateCategoryItem", () => {
      it("should validate a valid CategoryItem", () => {
         const validCategory = {
            id: 1,
            name: "Konektivitas Terkelola",
         };

         const result = validateCategoryItem(validCategory);

         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should reject CategoryItem with missing id", () => {
         const invalidCategory = {
            id: 0,
            name: "Test Category",
         } as any;

         const result = validateCategoryItem(invalidCategory);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should reject CategoryItem with missing name", () => {
         const invalidCategory = {
            id: 1,
            name: "",
         } as any;

         const result = validateCategoryItem(invalidCategory);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should reject CategoryItem with negative id", () => {
         const invalidCategory = {
            id: -1,
            name: "Test Category",
         } as any;

         const result = validateCategoryItem(invalidCategory);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should validate all blog categories", () => {
         blog_categories_data.forEach((category) => {
            const result = validateCategoryItem(category);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
         });
      });

      it("should accept id of 1 (minimum valid value)", () => {
         const category = {
            id: 1,
            name: "Test Category",
         };

         const result = validateCategoryItem(category);

         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should accept large id values", () => {
         const category = {
            id: 9999,
            name: "Test Category",
         };

         const result = validateCategoryItem(category);

         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should accept category name with special characters and spaces", () => {
         const category = {
            id: 1,
            name: "IoT & Edge Computing",
         };

         const result = validateCategoryItem(category);

         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should accept category name with ampersand", () => {
         const category = {
            id: 1,
            name: "Operations & Support",
         };

         const result = validateCategoryItem(category);

         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should reject category name with only spaces", () => {
         const category = {
            id: 1,
            name: "   ",
         } as any;

         const result = validateCategoryItem(category);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });
   });

   describe("validateInnerBlogPost with categoryId", () => {
      it("should validate InnerBlogPost with valid categoryId", () => {
         const validPost = {
            id: 1,
            thumb: {} as any,
            title: "Test Post",
            desc: "Test description",
            date: "2024-01-01",
            user: "Test User",
            tagId: 1,
            categoryId: 1,
            category: "Konektivitas Terkelola",
         };

         const result = validateInnerBlogPost(validPost);

         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should reject InnerBlogPost with invalid categoryId", () => {
         const invalidPost = {
            id: 1,
            thumb: {} as any,
            title: "Test Post",
            desc: "Test description",
            date: "2024-01-01",
            user: "Test User",
            tagId: 1,
            categoryId: 999,
            category: "Invalid Category",
         };

         const result = validateInnerBlogPost(invalidPost);

         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("categoryId must reference a valid category (got: 999)");
      });

      it("should reject InnerBlogPost with categoryId of 0", () => {
         const invalidPost = {
            id: 1,
            thumb: {} as any,
            title: "Test Post",
            desc: "Test description",
            date: "2024-01-01",
            user: "Test User",
            tagId: 1,
            categoryId: 0,
            category: "Test Category",
         } as any;

         const result = validateInnerBlogPost(invalidPost);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should reject InnerBlogPost with negative categoryId", () => {
         const invalidPost = {
            id: 1,
            thumb: {} as any,
            title: "Test Post",
            desc: "Test description",
            date: "2024-01-01",
            user: "Test User",
            tagId: 1,
            categoryId: -1,
            category: "Test Category",
         } as any;

         const result = validateInnerBlogPost(invalidPost);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should validate InnerBlogPost with all valid categoryIds from BlogCategoryData", () => {
         const allCategoryIds = blog_categories_data.map((cat) => cat.id);

         allCategoryIds.forEach((categoryId) => {
            const post = {
               id: 1,
               thumb: {} as any,
               title: "Test Post",
               desc: "Test description",
               date: "2024-01-01",
               user: "Test User",
               tagId: 1,
               categoryId,
               category: blog_categories_data.find((c) => c.id === categoryId)?.name,
            };

            const result = validateInnerBlogPost(post);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
         });
      });

      it("should require categoryId to be a number", () => {
         const invalidPost = {
            id: 1,
            thumb: {} as any,
            title: "Test Post",
            desc: "Test description",
            date: "2024-01-01",
            user: "Test User",
            tagId: 1,
            categoryId: "1" as any,
            category: "Test Category",
         };

         const result = validateInnerBlogPost(invalidPost);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });
   });

   describe("Data Integrity", () => {
      it("should validate that all blog posts reference valid categories", () => {
         const validCategoryIds = new Set(blog_categories_data.map((cat) => cat.id));

         const testPosts = blog_categories_data.map((category) => ({
            id: 1,
            thumb: {} as any,
            title: "Test Post",
            desc: "Test description",
            date: "2024-01-01",
            user: "Test User",
            tagId: 1,
            categoryId: category.id,
            category: category.name,
         }));

         testPosts.forEach((post) => {
            const result = validateInnerBlogPost(post);

            expect(result.isValid).toBe(true);
            expect(validCategoryIds.has(post.categoryId)).toBe(true);
         });
      });

      it("should catch orphaned category references", () => {
         const orphanedPost = {
            id: 1,
            thumb: {} as any,
            title: "Test Post",
            desc: "Test description",
            date: "2024-01-01",
            user: "Test User",
            tagId: 1,
            categoryId: 999,
            category: "Orphaned Category",
         };

         const result = validateInnerBlogPost(orphanedPost);

         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("categoryId must reference a valid category (got: 999)");
      });
   });

   describe("Edge Cases", () => {
      it("should handle empty category name with valid id", () => {
         const category = {
            id: 1,
            name: "",
         } as any;

         const result = validateCategoryItem(category);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should handle very long category names", () => {
         const category = {
            id: 1,
            name: "a".repeat(1000),
         };

         const result = validateCategoryItem(category);

         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should handle missing categoryId in InnerBlogPost", () => {
         const post = {
            id: 1,
            thumb: {} as any,
            title: "Test Post",
            desc: "Test description",
            date: "2024-01-01",
            user: "Test User",
            tagId: 1,
            category: "Test Category",
         } as any;

         const result = validateInnerBlogPost(post);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should handle both categoryId and category as undefined", () => {
         const post = {
            id: 1,
            thumb: {} as any,
            title: "Test Post",
            desc: "Test description",
            date: "2024-01-01",
            user: "Test User",
            tagId: 1,
         } as any;

         const result = validateInnerBlogPost(post);

         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });
   });
});
