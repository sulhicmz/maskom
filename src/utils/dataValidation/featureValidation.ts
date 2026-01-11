import type { FeatureItem, FeatureHomeOneItem } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateFeatureItem = createValidator<FeatureItem>({
  typeName: "FeatureItem",
  baseValidation: true,
  stringFields: [
    { key: "icon", required: true },
    { key: "title", required: true },
    { key: "desc", required: true },
  ],
});

export const validateFeatureHomeOneItem = createValidator<FeatureHomeOneItem>({
  typeName: "FeatureHomeOneItem",
  numberFields: [
    { key: "id", required: true, min: 1 },
  ],
  stringFields: [
    { key: "icon", required: true },
    { key: "title", required: true },
    { key: "desc", required: true },
  ],
});
