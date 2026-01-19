import type {
  ValidationResult,
  ValidationRule,
  StringFieldConfig,
  NumberFieldConfig,
  EnumFieldConfig,
  ArrayFieldConfig,
  ValidationConfig,
} from "./baseValidation";
import {
  createValidator,
  validateBaseDataItem,
  checkDuplicateIds,
  validateDataArray,
} from "./baseValidation";

import {
  validateFeedbackItem,
} from "./feedbackValidation";

import {
  validatePriceItem,
  validatePriceDetailItem,
} from "./priceValidation";

import {
  validateFaqItem,
  validateFaqDetail,
  validateInnerFaqItem,
} from "./faqValidation";

import {
  validateFeatureItem,
  validateFeatureHomeOneItem,
} from "./featureValidation";

import {
  validateProcessItem,
} from "./processValidation";

import {
  validateCauseItem,
} from "./causeValidation";

import {
  validateMenuItem,
  validateNavigationItem,
  validateNavigationSection,
} from "./navigationValidation";

import {
  validateWiFiDevice,
  validateWebsiteTemplate,
  validateAIStep,
} from "./dashboardValidation";

 import {
    validateCategoryItem,
    validateBlogTagItem,
    validateBlogCommentItem,
    validateInnerBlogPost,
    validateViewCount,
    validateEngagementScore,
    validateAvgReadTime,
    validateShareCount,
    validateContentMetrics,
 } from "./blogValidation";

import {
  validateTeamMember,
} from "./teamValidation";

import {
  validateSocialLink,
} from "./socialValidation";

import {
   validateContactInfoItem,
} from "./contactValidation"

import {
   validateUseCaseSidebarItem,
} from "./useCaseValidation"

import {
    validateBlogCategoryData,
} from "./blogCategoryValidation"

import {
    validateMediaItem,
    validateMediaAssets,
 } from "./mediaValidation"

import {
  validateEmailTemplate,
  validateTemplateVariable,
  validateEmailTemplates,
} from "./emailTemplateValidation"

export type {
  ValidationResult,
  ValidationRule,
  StringFieldConfig,
  NumberFieldConfig,
  EnumFieldConfig,
  ArrayFieldConfig,
  ValidationConfig,
};

  export {
     createValidator,
     validateBaseDataItem,
     checkDuplicateIds,
     validateDataArray,
     validateFeedbackItem,
     validatePriceItem,
     validatePriceDetailItem,
     validateFaqItem,
     validateFaqDetail,
     validateInnerFaqItem,
     validateFeatureItem,
     validateFeatureHomeOneItem,
     validateProcessItem,
     validateCauseItem,
     validateMenuItem,
     validateNavigationItem,
     validateNavigationSection,
     validateWiFiDevice,
     validateWebsiteTemplate,
     validateAIStep,
     validateCategoryItem,
     validateBlogTagItem,
     validateBlogCommentItem,
      validateInnerBlogPost,
      validateTeamMember,
      validateSocialLink,
      validateContactInfoItem,
       validateUseCaseSidebarItem,
       validateBlogCategoryData,
       validateMediaItem,
        validateMediaAssets,
       validateEmailTemplate,
       validateTemplateVariable,
       validateEmailTemplates,
       validateViewCount,
      validateEngagementScore,
      validateAvgReadTime,
      validateShareCount,
      validateContentMetrics,
  };
