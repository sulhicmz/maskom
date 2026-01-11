import type { ProcessItem } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateProcessItem = createValidator<ProcessItem>({
  typeName: "ProcessItem",
  baseValidation: true,
  stringFields: [
    { key: "count", required: true },
    { key: "title", required: true },
    { key: "desc", required: true },
  ],
});
