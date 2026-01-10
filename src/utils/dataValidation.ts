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
  WiFiDevice,
  WebsiteTemplate,
  AIStep,
  BlogCommentItem,
  TeamMember,
  InnerBlogPost,
  InnerFaqItem,
  FaqDetail,
  SocialLink,
  NavigationItem,
  NavigationSection,
} from "@/types/data";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule<T> {
  validate: (item: T) => string | null;
}

export interface StringFieldConfig {
  key: string;
  required: boolean;
}

export interface NumberFieldConfig {
  key: string;
  required: boolean;
  min?: number;
  max?: number;
}

export interface EnumFieldConfig {
  key: string;
  required: boolean;
  allowedValues: readonly unknown[];
}

export interface ArrayFieldConfig {
  key: string;
  required: boolean;
  itemValidator?: (item: unknown, index: number) => string | null;
}

export interface ValidationConfig<T> {
  typeName: string;
  stringFields?: StringFieldConfig[];
  numberFields?: NumberFieldConfig[];
  enumFields?: EnumFieldConfig[];
  arrayFields?: ArrayFieldConfig[];
  customRules?: Array<(item: T) => string | null>;
  baseValidation?: boolean;
}

function createValidator<T>(config: ValidationConfig<T>): (item: T) => ValidationResult {
  return (item: T): ValidationResult => {
    const errors: string[] = [];
    const itemId = typeof (item as BaseDataItem & { id?: number }).id === "number" ? (item as BaseDataItem & { id?: number }).id! : "";

    if (config.baseValidation) {
      const baseResult = validateBaseDataItem(item as BaseDataItem, config.typeName);
      errors.push(...baseResult.errors);
    }

    if (config.stringFields) {
      for (const field of config.stringFields) {
        const value = (item as Record<string, unknown>)[field.key];
        if (field.required) {
          if (typeof value !== "string" || value.trim() === "") {
            errors.push(
              `${config.typeName}${itemId ? `[${itemId}]` : ""}: ${field.key} must be a non-empty string`
            );
          }
        }
      }
    }

    if (config.numberFields) {
      for (const field of config.numberFields) {
        const value = (item as Record<string, unknown>)[field.key];
        if (field.required) {
          if (typeof value !== "number") {
            errors.push(
              `${config.typeName}${itemId ? `[${itemId}]` : ""}: ${field.key} must be a number`
            );
          } else {
            if (field.min !== undefined && value < field.min) {
              errors.push(
                `${config.typeName}${itemId ? `[${itemId}]` : ""}: ${field.key} must be a positive number`
              );
            }
          }
        }
      }
    }

    if (config.enumFields) {
      for (const field of config.enumFields) {
        const value = (item as Record<string, unknown>)[field.key];
        if (field.required) {
          if (!field.allowedValues.includes(value as string)) {
            const allowed = field.allowedValues as unknown as string[];
            errors.push(
              `${config.typeName}${itemId ? `[${itemId}]` : ""}: ${field.key} must be either "${allowed[0]}" or "${allowed[1]}"`
            );
          }
        }
      }
    }

    if (config.arrayFields) {
      for (const field of config.arrayFields) {
        const value = (item as Record<string, unknown>)[field.key];
        if (field.required) {
          if (!Array.isArray(value) || value.length === 0) {
            errors.push(
              `${config.typeName}${itemId ? `[${itemId}]` : ""}: ${field.key} must be a non-empty array`
            );
          } else if (field.itemValidator) {
            value.forEach((item: unknown, index: number) => {
              const error = field.itemValidator!(item, index);
              if (error) {
                errors.push(error);
              }
            });
          }
        }
      }
    }

    if (config.customRules) {
      for (const rule of config.customRules) {
        const error = rule(item);
        if (error) {
          errors.push(error);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };
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

export const validateFaqItem = createValidator<FaqItem>({
  typeName: "FaqItem",
  baseValidation: true,
  stringFields: [
    { key: "question", required: true },
    { key: "answer", required: true },
  ],
});

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

export const validateFeatureItem = createValidator<FeatureItem>({
  typeName: "FeatureItem",
  baseValidation: true,
  stringFields: [
    { key: "icon", required: true },
    { key: "title", required: true },
    { key: "desc", required: true },
  ],
});

export const validateProcessItem = createValidator<ProcessItem>({
  typeName: "ProcessItem",
  baseValidation: true,
  stringFields: [
    { key: "count", required: true },
    { key: "title", required: true },
    { key: "desc", required: true },
  ],
});

export const validateCauseItem = createValidator<CauseItem>({
  typeName: "CauseItem",
  baseValidation: true,
  stringFields: [
    { key: "icon", required: true },
    { key: "title", required: true },
    { key: "desc", required: true },
  ],
});

export const validateMenuItem = createValidator<MenuItem>({
  typeName: "MenuItem",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "title", required: true },
    { key: "link", required: true },
  ],
  enumFields: [
    { key: "has_dropdown", required: true, allowedValues: [true, false] },
  ],
  customRules: [
    (item) => {
      if (item.has_dropdown) {
        if (!Array.isArray(item.sub_menus) || item.sub_menus.length === 0) {
          return `MenuItem[${item.id}]: sub_menus must be a non-empty array when has_dropdown is true`;
        }
        for (let i = 0; i < (item.sub_menus || []).length; i++) {
          const sub = item.sub_menus![i];
          if (typeof sub.link !== "string" || sub.link.trim() === "") {
            return `MenuItem[${item.id}]: sub_menus[${i}].link must be a non-empty string`;
          }
          if (typeof sub.title !== "string" || sub.title.trim() === "") {
            return `MenuItem[${item.id}]: sub_menus[${i}].title must be a non-empty string`;
          }
        }
      }
      return null;
    },
  ],
});

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

export const validateWiFiDevice = createValidator<WiFiDevice>({
  typeName: "WiFiDevice",
  numberFields: [],
  stringFields: [
    { key: "name", required: true },
    { key: "ip", required: true },
  ],
  enumFields: [
    { key: "status", required: true, allowedValues: ["Online", "Offline"] },
  ],
  customRules: [
    (item) => {
      if (typeof item.id !== "number" || item.id <= 0) {
        return "WiFiDevice: id must be a positive number";
      }
      return null;
    },
  ],
});

export const validateWebsiteTemplate = createValidator<WebsiteTemplate>({
  typeName: "WebsiteTemplate",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "name", required: true },
    { key: "preview", required: true },
  ],
});

export const validateAIStep = createValidator<AIStep>({
  typeName: "AIStep",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "title", required: true },
    { key: "content", required: true },
  ],
});

export const validateBlogCommentItem = createValidator<BlogCommentItem>({
  typeName: "BlogCommentItem",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "name", required: true },
    { key: "date", required: true },
    { key: "content", required: true },
  ],
});

export const validateTeamMember = createValidator<TeamMember>({
  typeName: "TeamMember",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "title", required: true },
    { key: "designation", required: true },
  ],
});

export const validateInnerBlogPost = createValidator<InnerBlogPost>({
  typeName: "InnerBlogPost",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "title", required: true },
    { key: "desc", required: true },
    { key: "date", required: true },
    { key: "user", required: true },
    { key: "tag", required: true },
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

export const validateSocialLink = createValidator<SocialLink>({
  typeName: "SocialLink",
  stringFields: [
    { key: "url", required: true },
    { key: "iconClass", required: true },
    { key: "ariaLabel", required: true },
  ],
  enumFields: [
    { key: "target", required: false, allowedValues: ["_blank", "_self"] },
  ],
  customRules: [
    (item) => {
      if (item.target && !["_blank", "_self"].includes(item.target)) {
        return `SocialLink[${item.url}]: target must be either "_blank" or "_self"`;
      }
      return null;
    },
  ],
});

export const validateNavigationItem = createValidator<NavigationItem>({
  typeName: "NavigationItem",
  stringFields: [
    { key: "url", required: true },
  ],
  enumFields: [
    { key: "target", required: false, allowedValues: ["_blank", "_self"] },
  ],
  customRules: [
    (item) => {
      if (typeof item.label !== "string" || item.label.trim() === "") {
        return `NavigationItem[${item.url}]: label must be a non-empty string`;
      }
      return null;
    },
    (item) => {
      if (item.target && !["_blank", "_self"].includes(item.target)) {
        return `NavigationItem[${item.url}]: target must be either "_blank" or "_self"`;
      }
      return null;
    },
  ],
});

export const validateNavigationSection = createValidator<NavigationSection>({
  typeName: "NavigationSection",
  stringFields: [],
  arrayFields: [
    {
      key: "items",
      required: true,
      itemValidator: (navItem: unknown) => {
        const result = validateNavigationItem(navItem as NavigationItem);
        return result.errors.length > 0 ? result.errors[0] : null;
      },
    },
  ],
  customRules: [
    (item) => {
      if (typeof item.title !== "string" || item.title.trim() === "") {
        return "NavigationSection: title must be a non-empty string";
      }
      return null;
    },
    (item) => {
      if (!Array.isArray(item.items) || item.items.length === 0) {
        return `NavigationSection[${item.title}]: items must be a non-empty array`;
      }
      return null;
    },
  ],
});
