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

export function validateWiFiDevice(item: WiFiDevice): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`WiFiDevice: id must be a positive number`);
  }

  if (typeof item.name !== "string" || item.name.trim() === "") {
    errors.push(`WiFiDevice[${item.id}]: name must be a non-empty string`);
  }

  if (typeof item.ip !== "string" || item.ip.trim() === "") {
    errors.push(`WiFiDevice[${item.id}]: ip must be a non-empty string`);
  }

  if (!["Online", "Offline"].includes(item.status)) {
    errors.push(`WiFiDevice[${item.id}]: status must be either "Online" or "Offline"`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateWebsiteTemplate(item: WebsiteTemplate): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`WebsiteTemplate: id must be a positive number`);
  }

  if (typeof item.name !== "string" || item.name.trim() === "") {
    errors.push(`WebsiteTemplate[${item.id}]: name must be a non-empty string`);
  }

  if (typeof item.preview !== "string" || item.preview.trim() === "") {
    errors.push(`WebsiteTemplate[${item.id}]: preview must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAIStep(item: AIStep): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`AIStep: id must be a positive number`);
  }

  if (typeof item.title !== "string" || item.title.trim() === "") {
    errors.push(`AIStep[${item.id}]: title must be a non-empty string`);
  }

  if (typeof item.content !== "string" || item.content.trim() === "") {
    errors.push(`AIStep[${item.id}]: content must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateBlogCommentItem(item: BlogCommentItem): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`BlogCommentItem: id must be a positive number`);
  }

  if (typeof item.name !== "string" || item.name.trim() === "") {
    errors.push(`BlogCommentItem[${item.id}]: name must be a non-empty string`);
  }

  if (typeof item.date !== "string" || item.date.trim() === "") {
    errors.push(`BlogCommentItem[${item.id}]: date must be a non-empty string`);
  }

  if (typeof item.content !== "string" || item.content.trim() === "") {
    errors.push(`BlogCommentItem[${item.id}]: content must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateTeamMember(item: TeamMember): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`TeamMember: id must be a positive number`);
  }

  if (typeof item.title !== "string" || item.title.trim() === "") {
    errors.push(`TeamMember[${item.id}]: title must be a non-empty string`);
  }

  if (typeof item.designation !== "string" || item.designation.trim() === "") {
    errors.push(`TeamMember[${item.id}]: designation must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateInnerBlogPost(item: InnerBlogPost): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`InnerBlogPost: id must be a positive number`);
  }

  if (typeof item.title !== "string" || item.title.trim() === "") {
    errors.push(`InnerBlogPost[${item.id}]: title must be a non-empty string`);
  }

  if (typeof item.desc !== "string" || item.desc.trim() === "") {
    errors.push(`InnerBlogPost[${item.id}]: desc must be a non-empty string`);
  }

  if (typeof item.date !== "string" || item.date.trim() === "") {
    errors.push(`InnerBlogPost[${item.id}]: date must be a non-empty string`);
  }

  if (typeof item.user !== "string" || item.user.trim() === "") {
    errors.push(`InnerBlogPost[${item.id}]: user must be a non-empty string`);
  }

  if (typeof item.tag !== "string" || item.tag.trim() === "") {
    errors.push(`InnerBlogPost[${item.id}]: tag must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFaqDetail(item: FaqDetail): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`FaqDetail: id must be a positive number`);
  }

  if (typeof item.title !== "string" || item.title.trim() === "") {
    errors.push(`FaqDetail[${item.id}]: title must be a non-empty string`);
  }

  if (typeof item.desc !== "string" || item.desc.trim() === "") {
    errors.push(`FaqDetail[${item.id}]: desc must be a non-empty string`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateInnerFaqItem(item: InnerFaqItem): ValidationResult {
  const errors: string[] = [];

  if (typeof item.id !== "number" || item.id <= 0) {
    errors.push(`InnerFaqItem: id must be a positive number`);
  }

  if (!Array.isArray(item.faq_details) || item.faq_details.length === 0) {
    errors.push(`InnerFaqItem[${item.id}]: faq_details must be a non-empty array`);
    return { isValid: false, errors };
  }

  item.faq_details.forEach((detail) => {
    const detailResult = validateFaqDetail(detail);
    errors.push(...detailResult.errors);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSocialLink(item: SocialLink): ValidationResult {
  const errors: string[] = [];

  if (typeof item.url !== "string" || item.url.trim() === "") {
    errors.push(`SocialLink: url must be a non-empty string`);
  }

  if (typeof item.iconClass !== "string" || item.iconClass.trim() === "") {
    errors.push(`SocialLink[${item.url}]: iconClass must be a non-empty string`);
  }

  if (typeof item.ariaLabel !== "string" || item.ariaLabel.trim() === "") {
    errors.push(`SocialLink[${item.url}]: ariaLabel must be a non-empty string`);
  }

  if (item.target && !["_blank", "_self"].includes(item.target)) {
    errors.push(`SocialLink[${item.url}]: target must be either "_blank" or "_self"`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateNavigationItem(item: NavigationItem): ValidationResult {
  const errors: string[] = [];

  if (typeof item.url !== "string" || item.url.trim() === "") {
    errors.push(`NavigationItem: url must be a non-empty string`);
  }

  if (typeof item.label !== "string" || item.label.trim() === "") {
    errors.push(`NavigationItem[${item.url}]: label must be a non-empty string`);
  }

  if (item.target && !["_blank", "_self"].includes(item.target)) {
    errors.push(`NavigationItem[${item.url}]: target must be either "_blank" or "_self"`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateNavigationSection(item: NavigationSection): ValidationResult {
  const errors: string[] = [];

  if (typeof item.title !== "string" || item.title.trim() === "") {
    errors.push(`NavigationSection: title must be a non-empty string`);
  }

  if (!Array.isArray(item.items) || item.items.length === 0) {
    errors.push(`NavigationSection[${item.title}]: items must be a non-empty array`);
    return { isValid: false, errors };
  }

  item.items.forEach((navItem) => {
    const navItemResult = validateNavigationItem(navItem);
    errors.push(...navItemResult.errors);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
