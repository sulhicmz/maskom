import {
  BaseDataItem,
  FeedbackItem,
  FaqItem,
  PriceItem,
  PriceDetailItem,
  FeatureItem,
  ProcessItem,
  CauseItem,
  MenuItem,
} from "@/types/data";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateBaseDataItem(item: BaseDataItem, itemName: string): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`${itemName}[${item.id}]: id must be a positive number`);
  }

  if (typeof item.page !== "string" || item.page.trim() === "") {
    errors.push(`${itemName}[${item.id}]: page must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFeedbackItem(item: FeedbackItem): ValidationResult {
  const errors: string[] = [];
  const baseResult = validateBaseDataItem(item, "FeedbackItem");

  errors.push(...baseResult.errors);

  if (typeof item.name !== "string" || item.name.trim() === "") {
    errors.push(`FeedbackItem[${item.id}]: name must be a non-empty string`);
  }

  if (typeof item.designation !== "string" || item.designation.trim() === "") {
    errors.push(`FeedbackItem[${item.id}]: designation must be a non-empty string`);
  }

  if (typeof item.desc !== "string" || item.desc.trim() === "") {
    errors.push(`FeedbackItem[${item.id}]: desc must be a non-empty string`);
  }

  if (typeof item.rating !== "string" || item.rating.trim() === "") {
    errors.push(`FeedbackItem[${item.id}]: rating must be a non-empty string`);
  }

  const ratingValue = parseFloat(item.rating);
  if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
    errors.push(`FeedbackItem[${item.id}]: rating must be a number between 0 and 5`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFaqItem(item: FaqItem): ValidationResult {
  const errors: string[] = [];
  const baseResult = validateBaseDataItem(item, "FaqItem");

  errors.push(...baseResult.errors);

  if (typeof item.question !== "string" || item.question.trim() === "") {
    errors.push(`FaqItem[${item.id}]: question must be a non-empty string`);
  }

  if (typeof item.answer !== "string" || item.answer.trim() === "") {
    errors.push(`FaqItem[${item.id}]: answer must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePriceDetailItem(item: PriceDetailItem): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`PriceDetailItem[${item.id}]: id must be a positive number`);
  }

  if (typeof item.sub_title !== "string" || item.sub_title.trim() === "") {
    errors.push(`PriceDetailItem[${item.id}]: sub_title must be a non-empty string`);
  }

  if (typeof item.price !== "number" || item.price < 0) {
    errors.push(`PriceDetailItem[${item.id}]: price must be a non-negative number`);
  }

  if (typeof item.btn !== "string" || item.btn.trim() === "") {
    errors.push(`PriceDetailItem[${item.id}]: btn must be a non-empty string`);
  }

  if (!Array.isArray(item.feature) || item.feature.length === 0) {
    errors.push(`PriceDetailItem[${item.id}]: feature must be a non-empty array`);
  }

  item.feature.forEach((feature, index) => {
    if (typeof feature !== "string" || feature.trim() === "") {
      errors.push(`PriceDetailItem[${item.id}]: feature[${index}] must be a non-empty string`);
    }
  });

  if (item.currency && (typeof item.currency !== "string" || item.currency.trim() === "")) {
    errors.push(`PriceDetailItem[${item.id}]: currency must be a non-empty string if provided`);
  }

  if (item.price_label && (typeof item.price_label !== "string" || item.price_label.trim() === "")) {
    errors.push(`PriceDetailItem[${item.id}]: price_label must be a non-empty string if provided`);
  }

  if (item.note && (typeof item.note !== "string" || item.note.trim() === "")) {
    errors.push(`PriceDetailItem[${item.id}]: note must be a non-empty string if provided`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePriceItem(item: PriceItem): ValidationResult {
  const errors: string[] = [];
  const baseResult = validateBaseDataItem(item, "PriceItem");

  errors.push(...baseResult.errors);

  if (!Array.isArray(item.price_details) || item.price_details.length === 0) {
    errors.push(`PriceItem[${item.id}]: price_details must be a non-empty array`);
    return { isValid: false, errors };
  }

  item.price_details.forEach((detail) => {
    const detailResult = validatePriceDetailItem(detail);
    errors.push(...detailResult.errors);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFeatureItem(item: FeatureItem): ValidationResult {
  const errors: string[] = [];
  const baseResult = validateBaseDataItem(item, "FeatureItem");

  errors.push(...baseResult.errors);

  if (typeof item.icon !== "string" || item.icon.trim() === "") {
    errors.push(`FeatureItem[${item.id}]: icon must be a non-empty string`);
  }

  if (typeof item.title !== "string" || item.title.trim() === "") {
    errors.push(`FeatureItem[${item.id}]: title must be a non-empty string`);
  }

  if (typeof item.desc !== "string" || item.desc.trim() === "") {
    errors.push(`FeatureItem[${item.id}]: desc must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateProcessItem(item: ProcessItem): ValidationResult {
  const errors: string[] = [];
  const baseResult = validateBaseDataItem(item, "ProcessItem");

  errors.push(...baseResult.errors);

  if (typeof item.count !== "string" || item.count.trim() === "") {
    errors.push(`ProcessItem[${item.id}]: count must be a non-empty string`);
  }

  if (typeof item.title !== "string" || item.title.trim() === "") {
    errors.push(`ProcessItem[${item.id}]: title must be a non-empty string`);
  }

  if (typeof item.desc !== "string" || item.desc.trim() === "") {
    errors.push(`ProcessItem[${item.id}]: desc must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateCauseItem(item: CauseItem): ValidationResult {
  const errors: string[] = [];
  const baseResult = validateBaseDataItem(item, "CauseItem");

  errors.push(...baseResult.errors);

  if (typeof item.icon !== "string" || item.icon.trim() === "") {
    errors.push(`CauseItem[${item.id}]: icon must be a non-empty string`);
  }

  if (typeof item.title !== "string" || item.title.trim() === "") {
    errors.push(`CauseItem[${item.id}]: title must be a non-empty string`);
  }

  if (typeof item.desc !== "string" || item.desc.trim() === "") {
    errors.push(`CauseItem[${item.id}]: desc must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateMenuItem(item: MenuItem): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`MenuItem[${item.id}]: id must be a positive number`);
  }

  if (typeof item.title !== "string" || item.title.trim() === "") {
    errors.push(`MenuItem[${item.id}]: title must be a non-empty string`);
  }

  if (typeof item.link !== "string" || item.link.trim() === "") {
    errors.push(`MenuItem[${item.id}]: link must be a non-empty string`);
  }

  if (typeof item.has_dropdown !== "boolean") {
    errors.push(`MenuItem[${item.id}]: has_dropdown must be a boolean`);
  }

  if (item.has_dropdown) {
    if (!Array.isArray(item.sub_menus) || item.sub_menus.length === 0) {
      errors.push(`MenuItem[${item.id}]: sub_menus must be a non-empty array when has_dropdown is true`);
    }

    item.sub_menus?.forEach((sub, index) => {
      if (typeof sub.link !== "string" || sub.link.trim() === "") {
        errors.push(`MenuItem[${item.id}]: sub_menus[${index}].link must be a non-empty string`);
      }
      if (typeof sub.title !== "string" || sub.title.trim() === "") {
        errors.push(`MenuItem[${item.id}]: sub_menus[${index}].title must be a non-empty string`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function checkDuplicateIds<T extends BaseDataItem>(
  items: T[],
  itemName: string
): ValidationResult {
  const errors: string[] = [];
  const idMap = new Map<number, string[]>();

  items.forEach((item) => {
    const page = item.page;
    if (!idMap.has(item.id)) {
      idMap.set(item.id, []);
    }
    idMap.get(item.id)!.push(page);
  });

  idMap.forEach((pages, id) => {
    if (pages.length > 1) {
      errors.push(
        `${itemName}: Duplicate id ${id} found in pages: ${pages.join(", ")}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateDataArray<T>(
  items: T[],
  validator: (item: T) => ValidationResult
): ValidationResult {
  const allErrors: string[] = [];

  items.forEach((item) => {
    const result = validator(item);
    allErrors.push(...result.errors);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
