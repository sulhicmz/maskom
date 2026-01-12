import {
  validateFeedbackItem,
  validateFaqItem,
  validatePriceItem,
  validateFeatureItem,
  validateProcessItem,
  validateCauseItem,
  validateMenuItem,
  validateWiFiDevice,
  validateWebsiteTemplate,
  validateAIStep,
  validateBlogTagItem,
  validateBlogCommentItem,
  validateTeamMember,
  validateInnerBlogPost,
  validateInnerFaqItem,
  validateSocialLink,
  validateNavigationSection,
} from "@/utils/dataValidation";
import FeedbackData from "@/data/FeedbackData";
import FaqData from "@/data/FaqData";
import PriceData from "@/data/PriceData";
import FeatureData from "@/data/FeatureData";
import ProcessData from "@/data/ProcessData";
import CauseData from "@/data/CauseData";
import MenuData from "@/data/MenuData";
import DashboardData from "@/data/DashboardData";
import BlogTagData from "@/data/BlogTagData";
import BlogCommentData from "@/data/BlogCommentData";
import TeamData from "@/data/TeamData";
import InnerBlogData from "@/data/InnerBlogData";
import InnerFaqData from "@/data/InnerFaqData";
import { socialLinks, navigationSections } from "@/data/SocialMediaData";

describe("Data Integrity Validation", () => {
  describe("FeedbackData", () => {
    it("should pass validation for all items", () => {
      FeedbackData.forEach((item) => {
        const result = validateFeedbackItem(item);
        if (!result.isValid) {
          console.error(`FeedbackItem errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("FaqData", () => {
    it("should pass validation for all items", () => {
      FaqData.forEach((item) => {
        const result = validateFaqItem(item);
        if (!result.isValid) {
          console.error(`FaqItem errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("PriceData", () => {
    it("should pass validation for all items", () => {
      PriceData.forEach((item) => {
        const result = validatePriceItem(item);
        if (!result.isValid) {
          console.error(`PriceItem errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("FeatureData", () => {
    it("should pass validation for all items", () => {
      FeatureData.forEach((item) => {
        const result = validateFeatureItem(item);
        if (!result.isValid) {
          console.error(`FeatureItem errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("ProcessData", () => {
    it("should pass validation for all items", () => {
      ProcessData.forEach((item) => {
        const result = validateProcessItem(item);
        if (!result.isValid) {
          console.error(`ProcessItem errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("CauseData", () => {
    it("should pass validation for all items", () => {
      CauseData.forEach((item) => {
        const result = validateCauseItem(item);
        if (!result.isValid) {
          console.error(`CauseItem errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("MenuData", () => {
    it("should pass validation for all items", () => {
      MenuData.forEach((item) => {
        const result = validateMenuItem(item);
        if (!result.isValid) {
          console.error(`MenuItem errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("DashboardData", () => {
    it("should validate wifiDevices", () => {
      DashboardData.wifiDevices.forEach((item) => {
        const result = validateWiFiDevice(item);
        if (!result.isValid) {
          console.error(`WiFiDevice errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });

    it("should validate websiteTemplates", () => {
      DashboardData.websiteTemplates.forEach((item) => {
        const result = validateWebsiteTemplate(item);
        if (!result.isValid) {
          console.error(`WebsiteTemplate errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });

    it("should validate aiAutomationSteps", () => {
      DashboardData.aiAutomationSteps.forEach((item) => {
        const result = validateAIStep(item);
        if (!result.isValid) {
          console.error(`AIStep errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("BlogTagData", () => {
    it("should pass validation for all items", () => {
      BlogTagData.forEach((item) => {
        const result = validateBlogTagItem(item);
        if (!result.isValid) {
          console.error(`BlogTagItem errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("BlogCommentData", () => {
    it("should pass validation for all items", () => {
      BlogCommentData.forEach((item) => {
        const result = validateBlogCommentItem(item);
        if (!result.isValid) {
          console.error(`BlogCommentItem errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("TeamData", () => {
    it("should pass validation for all items", () => {
      TeamData.forEach((item) => {
        const result = validateTeamMember(item);
        if (!result.isValid) {
          console.error(`TeamMember errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("InnerBlogData", () => {
    it("should pass validation for all items", () => {
      InnerBlogData.forEach((item) => {
        const result = validateInnerBlogPost(item);
        if (!result.isValid) {
          console.error(`InnerBlogPost errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("InnerFaqData", () => {
    it("should pass validation for all items", () => {
      InnerFaqData.forEach((item) => {
        const result = validateInnerFaqItem(item);
        if (!result.isValid) {
          console.error(`InnerFaqItem errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("SocialMediaData", () => {
    it("should validate socialLinks", () => {
      socialLinks.forEach((item) => {
        const result = validateSocialLink(item);
        if (!result.isValid) {
          console.error(`SocialLink errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });

    it("should validate navigationSections", () => {
      navigationSections.forEach((item) => {
        const result = validateNavigationSection(item);
        if (!result.isValid) {
          console.error(`NavigationSection errors:`, result.errors);
        }
        expect(result.isValid).toBe(true);
      });
    });
  });
});