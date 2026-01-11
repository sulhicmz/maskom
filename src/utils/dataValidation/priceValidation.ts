import type { PriceItem, PriceDetailItem } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validatePriceDetailItem = createValidator<PriceDetailItem>({
  typeName: "PriceDetailItem",
  numberFields: [
    { key: "id", required: true, min: 1 },
  ],
  stringFields: [
    { key: "sub_title", required: true },
    { key: "btn", required: true },
  ],
  arrayFields: [
    {
      key: "feature",
      required: true,
      itemValidator: (feature: unknown, index: number) => {
        if (typeof feature !== "string" || feature.trim() === "") {
          return `PriceDetailItem[1]: feature[${index}] must be a non-empty string`;
        }
        return null;
      },
    },
  ],
  customRules: [
    (item) => {
      if (item.price < 0) {
        return `PriceDetailItem[${item.id}]: price must be a non-negative number`;
      }
      return null;
    },
    (item) => {
      if (item.currency && (typeof item.currency !== "string" || item.currency.trim() === "")) {
        return `PriceDetailItem[${item.id}]: currency must be a non-empty string if provided`;
      }
      return null;
    },
    (item) => {
      if (item.price_label && (typeof item.price_label !== "string" || item.price_label.trim() === "")) {
        return `PriceDetailItem[${item.id}]: price_label must be a non-empty string if provided`;
      }
      return null;
    },
    (item) => {
      if (item.note && (typeof item.note !== "string" || item.note.trim() === "")) {
        return `PriceDetailItem[${item.id}]: note must be a non-empty string if provided`;
      }
      return null;
    },
  ],
});

export const validatePriceItem = createValidator<PriceItem>({
  typeName: "PriceItem",
  baseValidation: true,
  arrayFields: [
    {
      key: "price_details",
      required: true,
      itemValidator: (detail: unknown) => {
        const result = validatePriceDetailItem(detail as PriceDetailItem);
        return result.errors.length > 0 ? result.errors[0] : null;
      },
    },
  ],
});
