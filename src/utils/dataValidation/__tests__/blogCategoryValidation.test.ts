import { validateBlogCategoryData } from "../blogCategoryValidation";

describe("validateBlogCategoryData", () => {
   describe("should validate valid category arrays", () => {
      it("should pass with valid categories", () => {
         const validCategories = [
            "Konektivitas Terkelola",
            "Keamanan Jaringan",
            "Operasional & Dukungan"
         ];
         const result = validateBlogCategoryData(validCategories);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });

      it("should pass with single category", () => {
         const singleCategory = ["Konektivitas Terkelola"];
         const result = validateBlogCategoryData(singleCategory);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });

      it("should pass with categories containing special characters", () => {
         const categoriesWithSpecialChars = [
            "Konektivitas & Integrasi",
            "IoT & Edge",
            "Transformasi Digital"
         ];
         const result = validateBlogCategoryData(categoriesWithSpecialChars);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });

      it("should pass with categories containing numbers", () => {
         const categoriesWithNumbers = [
            "Web 3.0",
            "IPv6",
            "5G Networks"
         ];
         const result = validateBlogCategoryData(categoriesWithNumbers);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });

      it("should pass with actual BlogCategoryData", () => {
         const actualCategories = [
            "Konektivitas Terkelola",
            "Keamanan Jaringan",
            "Operasional & Dukungan",
            "Transformasi Digital",
            "Infrastruktur Cloud",
            "IoT & Edge"
         ];
         const result = validateBlogCategoryData(actualCategories);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });
   });

   describe("should fail with invalid input type", () => {
      it("should fail with non-array input", () => {
         const invalidInput = "not an array" as unknown as unknown[];
         const result = validateBlogCategoryData(invalidInput);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("BlogCategoryData must be an array");
      });

      it("should fail with object input", () => {
         const invalidInput = {} as unknown as unknown[];
         const result = validateBlogCategoryData(invalidInput);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("BlogCategoryData must be an array");
      });

      it("should fail with null input", () => {
         const invalidInput = null as unknown as unknown[];
         const result = validateBlogCategoryData(invalidInput);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("BlogCategoryData must be an array");
      });

      it("should fail with undefined input", () => {
         const invalidInput = undefined as unknown as unknown[];
         const result = validateBlogCategoryData(invalidInput);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("BlogCategoryData must be an array");
      });

      it("should fail with number input", () => {
         const invalidInput = 123 as unknown as unknown[];
         const result = validateBlogCategoryData(invalidInput);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("BlogCategoryData must be an array");
      });
   });

   describe("should fail with empty array", () => {
      it("should fail with empty array", () => {
         const emptyArray: string[] = [];
         const result = validateBlogCategoryData(emptyArray);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("BlogCategoryData array must not be empty");
      });
   });

   describe("should fail with non-string items", () => {
      it("should fail with number in array", () => {
         const invalidCategories = ["Valid Category", 123, "Another Valid"];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("must be a string, got number"))).toBe(true);
         expect(result.errors.some(e => e.includes("[1]"))).toBe(true);
      });

      it("should fail with object in array", () => {
         const invalidCategories = ["Valid Category", { name: "Invalid" }, "Another Valid"];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("must be a string, got object"))).toBe(true);
         expect(result.errors.some(e => e.includes("[1]"))).toBe(true);
      });

      it("should fail with null in array", () => {
         const invalidCategories = ["Valid Category", null as unknown, "Another Valid"];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("must be a string, got object"))).toBe(true);
         expect(result.errors.some(e => e.includes("[1]"))).toBe(true);
      });

      it("should fail with undefined in array", () => {
         const invalidCategories = ["Valid Category", undefined as unknown, "Another Valid"];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("must be a string, got undefined"))).toBe(true);
         expect(result.errors.some(e => e.includes("[1]"))).toBe(true);
      });

      it("should fail with boolean in array", () => {
         const invalidCategories = ["Valid Category", true, "Another Valid"];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("must be a string, got boolean"))).toBe(true);
         expect(result.errors.some(e => e.includes("[1]"))).toBe(true);
      });
   });

   describe("should fail with empty or whitespace-only strings", () => {
      it("should fail with empty string", () => {
         const invalidCategories = ["Valid Category", "", "Another Valid"];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("must not be empty or whitespace-only"))).toBe(true);
         expect(result.errors.some(e => e.includes("[1]"))).toBe(true);
      });

      it("should fail with whitespace-only string", () => {
         const invalidCategories = ["Valid Category", "   ", "Another Valid"];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("must not be empty or whitespace-only"))).toBe(true);
         expect(result.errors.some(e => e.includes("[1]"))).toBe(true);
      });

      it("should fail with tab and newline only", () => {
         const invalidCategories = ["Valid Category", "\t\n", "Another Valid"];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("must not be empty or whitespace-only"))).toBe(true);
         expect(result.errors.some(e => e.includes("[1]"))).toBe(true);
      });

      it("should fail with multiple empty strings", () => {
         const invalidCategories = ["", "", ""];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.filter(e => e.includes("must not be empty or whitespace-only"))).toHaveLength(3);
      });
   });

   describe("should fail with duplicate categories", () => {
      it("should fail with exact duplicate", () => {
         const invalidCategories = [
            "Konektivitas Terkelola",
            "Keamanan Jaringan",
            "Konektivitas Terkelola"
         ];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("contains duplicate categories"))).toBe(true);
      });

      it("should fail with multiple duplicates", () => {
         const invalidCategories = [
            "Category A",
            "Category B",
            "Category A",
            "Category C",
            "Category B"
         ];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("contains duplicate categories"))).toBe(true);
      });

      it("should fail with duplicate at end", () => {
         const invalidCategories = [
            "Category A",
            "Category B",
            "Category C",
            "Category B"
         ];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("duplicate of index 1"))).toBe(true);
      });

      it("should fail with exact duplicate including same case", () => {
         const invalidCategories = [
            "keamanan jaringan",
            "keamanan jaringan"
         ];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("contains duplicate categories"))).toBe(true);
      });
   });

   describe("should handle edge cases", () => {
      it("should handle very long category name", () => {
         const longCategory = "A".repeat(500);
         const validCategories = [longCategory];
         const result = validateBlogCategoryData(validCategories);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });

      it("should handle category with emoji", () => {
         const categoriesWithEmoji = ["🌐 Network", "💼 Business", "🔒 Security"];
         const result = validateBlogCategoryData(categoriesWithEmoji);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });

      it("should handle category with unicode characters", () => {
         const categoriesWithUnicode = ["日本語", "한국어", "中文"];
         const result = validateBlogCategoryData(categoriesWithUnicode);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });

      it("should handle category with leading/trailing spaces", () => {
         const categoriesWithSpaces = ["  Valid Category  ", " Another Category "];
         const result = validateBlogCategoryData(categoriesWithSpaces);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });

      it("should handle large array of categories", () => {
         const manyCategories = Array.from({ length: 100 }, (_, i) => `Category ${i}`);
         const result = validateBlogCategoryData(manyCategories);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });
   });

   describe("should combine multiple validation errors", () => {
      it("should report empty array and type errors", () => {
         const result = validateBlogCategoryData([] as unknown[]);
         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should report non-string items and duplicates", () => {
         const invalidCategories = [
            "Valid",
            123 as unknown,
            "Valid",
            null as unknown
         ];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("must be a string"))).toBe(true);
         expect(result.errors.some(e => e.includes("duplicate"))).toBe(true);
      });

      it("should report empty strings and duplicates", () => {
         const invalidCategories = [
            "Category A",
            "",
            "Category B",
            "Category A"
         ];
         const result = validateBlogCategoryData(invalidCategories);
         expect(result.isValid).toBe(false);
         expect(result.errors.some(e => e.includes("must not be empty"))).toBe(true);
         expect(result.errors.some(e => e.includes("duplicate"))).toBe(true);
      });
   });
});
