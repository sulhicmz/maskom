import type { FaqItem, FaqDetail, InnerFaqItem } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateFaqItem = createValidator<FaqItem>({
  typeName: "FaqItem",
  baseValidation: true,
  stringFields: [
    { key: "question", required: true },
    { key: "answer", required: true },
  ],
});

export const validateFaqDetail = createValidator<FaqDetail>({
  typeName: "FaqDetail",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "title", required: true },
    { key: "desc", required: true },
  ],
});

export const validateInnerFaqItem = createValidator<InnerFaqItem>({
  typeName: "InnerFaqItem",
  numberFields: [{ key: "id", required: true, min: 1 }],
  arrayFields: [
    {
      key: "faq_details",
      required: true,
      itemValidator: (detail: unknown) => {
        const result = validateFaqDetail(detail as FaqDetail);
        return result.errors.length > 0 ? result.errors[0] : null;
      },
    },
  ],
});
