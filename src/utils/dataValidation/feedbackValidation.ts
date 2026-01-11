import type { FeedbackItem } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateFeedbackItem = createValidator<FeedbackItem>({
  typeName: "FeedbackItem",
  baseValidation: true,
  stringFields: [
    { key: "name", required: true },
    { key: "designation", required: true },
    { key: "desc", required: true },
    { key: "rating", required: true },
  ],
  customRules: [
    (item) => {
      const ratingValue = parseFloat(item.rating);
      if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
        return `FeedbackItem[${item.id}]: rating must be a number between 0 and 5`;
      }
      return null;
    },
  ],
});
