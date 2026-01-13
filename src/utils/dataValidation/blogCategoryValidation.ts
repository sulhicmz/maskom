import type { ValidationResult } from "./baseValidation";

export function validateBlogCategoryData(categories: unknown[]): ValidationResult {
   const errors: string[] = [];

   // Check if input is an array
   if (!Array.isArray(categories)) {
      return {
         isValid: false,
         errors: ["BlogCategoryData must be an array"],
      };
   }

   // Check if array is not empty
   if (categories.length === 0) {
      errors.push("BlogCategoryData array must not be empty");
   }

   // Validate each category
   for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      // Check if item is a string
      if (typeof category !== "string") {
         errors.push(`BlogCategoryData[${i}]: category must be a string, got ${typeof category}`);
         continue;
      }

      // Check if string is not empty or whitespace-only
      if (category.trim() === "") {
         errors.push(`BlogCategoryData[${i}]: category must not be empty or whitespace-only`);
      }
   }

   // Check for duplicates (case-sensitive)
   const seen = new Set<string>();
   const duplicateIndices: number[] = [];
   for (let i = 0; i < categories.length; i++) {
      const category = categories[i] as string;
      if (seen.has(category)) {
         duplicateIndices.push(i);
      } else {
         seen.add(category);
      }
   }

   if (duplicateIndices.length > 0) {
      const duplicates = duplicateIndices.map(i => {
         const category = categories[i] as string;
         const firstIndex = categories.indexOf(category);
         return `index ${i} (duplicate of index ${firstIndex}: "${category}")`;
      }).join(", ");
      errors.push(`BlogCategoryData contains duplicate categories at ${duplicates}`);
   }

   return {
      isValid: errors.length === 0,
      errors,
   };
}
