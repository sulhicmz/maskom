import { createValidator } from "./baseValidation";
import { UseCaseSidebarItem } from "@/types/data";

export const validateUseCaseSidebarItem = createValidator<UseCaseSidebarItem>({
   requiredFields: ["id", "title", "link"],
   validators: {
      id: (value) => {
         if (typeof value !== "number" || value <= 0) {
            return { valid: false, message: "id must be a positive number" };
         }
         return { valid: true };
      },
      title: (value) => {
         if (typeof value !== "string" || value.trim().length === 0) {
            return { valid: false, message: "title must be a non-empty string" };
         }
         return { valid: true };
      },
      link: (value) => {
         if (typeof value !== "string" || value.trim().length === 0) {
            return { valid: false, message: "link must be a non-empty string" };
         }
         return { valid: true };
      }
   }
});
