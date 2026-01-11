import type { CauseItem } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateCauseItem = createValidator<CauseItem>({
  typeName: "CauseItem",
  baseValidation: true,
  stringFields: [
    { key: "icon", required: true },
    { key: "title", required: true },
    { key: "desc", required: true },
  ],
});
