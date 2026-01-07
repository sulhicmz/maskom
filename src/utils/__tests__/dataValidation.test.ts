import {
  validateFeedbackItem,
  validateFaqItem,
  validatePriceItem,
  validatePriceDetailItem,
  validateFeatureItem,
  validateProcessItem,
  validateCauseItem,
  validateMenuItem,
  checkDuplicateIds,
  validateDataArray,
} from "@/utils/dataValidation";
import {
  FeedbackItem,
  FaqItem,
  PriceItem,
  FeatureItem,
  ProcessItem,
  CauseItem,
  MenuItem,
} from "@/types/data";

const mockStaticImageData = {
  src: "",
  height: 100,
  width: 100,
  blurDataURL: "",
  blurWidth: 100,
  blurHeight: 100,
} as const;

describe("dataValidation", () => {
  describe("validateFeedbackItem", () => {
    it("should validate a valid feedback item", () => {
      const item: FeedbackItem = {
        id: 1,
        page: "home_1",
        avatar: mockStaticImageData,
        name: "John Doe",
        designation: "CEO",
        desc: "Great service",
        rating: "5.0",
      };
      const result = validateFeedbackItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject feedback item with invalid rating", () => {
      const item: FeedbackItem = {
        id: 1,
        page: "home_1",
        avatar: mockStaticImageData,
        name: "John Doe",
        designation: "CEO",
        desc: "Great service",
        rating: "6.0",
      };
      const result = validateFeedbackItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FeedbackItem[1]: rating must be a number between 0 and 5");
    });

    it("should reject feedback item with negative rating", () => {
      const item: FeedbackItem = {
        id: 1,
        page: "home_1",
        avatar: mockStaticImageData,
        name: "John Doe",
        designation: "CEO",
        desc: "Great service",
        rating: "-1.0",
      };
      const result = validateFeedbackItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FeedbackItem[1]: rating must be a number between 0 and 5");
    });

    it("should reject feedback item with missing name", () => {
      const item: FeedbackItem = {
        id: 1,
        page: "home_1",
        avatar: mockStaticImageData,
        name: "",
        designation: "CEO",
        desc: "Great service",
        rating: "5.0",
      };
      const result = validateFeedbackItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FeedbackItem[1]: name must be a non-empty string");
    });

    it("should reject feedback item with invalid id", () => {
      const item: FeedbackItem = {
        id: -1,
        page: "home_1",
        avatar: mockStaticImageData,
        name: "John Doe",
        designation: "CEO",
        desc: "Great service",
        rating: "5.0",
      };
      const result = validateFeedbackItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FeedbackItem[-1]: id must be a positive number");
    });
  });

  describe("validateFaqItem", () => {
    it("should validate a valid FAQ item", () => {
      const item: FaqItem = {
        id: 1,
        page: "home_1",
        question: "What is your service?",
        answer: "We provide great service",
      };
      const result = validateFaqItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject FAQ item with empty question", () => {
      const item: FaqItem = {
        id: 1,
        page: "home_1",
        question: "",
        answer: "We provide great service",
      };
      const result = validateFaqItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FaqItem[1]: question must be a non-empty string");
    });

    it("should reject FAQ item with missing answer", () => {
      const item: FaqItem = {
        id: 1,
        page: "home_1",
        question: "What is your service?",
        answer: "",
      };
      const result = validateFaqItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FaqItem[1]: answer must be a non-empty string");
    });
  });

  describe("validatePriceDetailItem", () => {
    it("should validate a valid price detail item", () => {
      const item = {
        id: 1,
        sub_title: "Basic",
        price: 1000,
        btn: "Buy",
        feature: ["Feature 1", "Feature 2"],
      };
      const result = validatePriceDetailItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject price detail item with negative price", () => {
      const item = {
        id: 1,
        sub_title: "Basic",
        price: -1000,
        btn: "Buy",
        feature: ["Feature 1"],
      };
      const result = validatePriceDetailItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("PriceDetailItem[1]: price must be a non-negative number");
    });

    it("should reject price detail item with empty feature array", () => {
      const item = {
        id: 1,
        sub_title: "Basic",
        price: 1000,
        btn: "Buy",
        feature: [],
      };
      const result = validatePriceDetailItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("PriceDetailItem[1]: feature must be a non-empty array");
    });

    it("should reject price detail item with empty feature string", () => {
      const item = {
        id: 1,
        sub_title: "Basic",
        price: 1000,
        btn: "Buy",
        feature: ["Feature 1", ""],
      };
      const result = validatePriceDetailItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("PriceDetailItem[1]: feature[1] must be a non-empty string");
    });
  });

  describe("validatePriceItem", () => {
    it("should validate a valid price item", () => {
      const item: PriceItem = {
        id: 1,
        page: "home_1",
        price_details: [
          {
            id: 1,
            sub_title: "Basic",
            price: 1000,
            btn: "Buy",
            feature: ["Feature 1"],
          },
        ],
      };
      const result = validatePriceItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject price item with invalid price detail", () => {
      const item: PriceItem = {
        id: 1,
        page: "home_1",
        price_details: [
          {
            id: 1,
            sub_title: "Basic",
            price: -1000,
            btn: "Buy",
            feature: ["Feature 1"],
          },
        ],
      };
      const result = validatePriceItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("PriceDetailItem[1]: price must be a non-negative number");
    });
  });

  describe("validateFeatureItem", () => {
    it("should validate a valid feature item", () => {
      const item: FeatureItem = {
        id: 1,
        page: "home_1",
        icon: "icon-name",
        title: "Feature Title",
        desc: "Feature description",
      };
      const result = validateFeatureItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject feature item with empty icon", () => {
      const item: FeatureItem = {
        id: 1,
        page: "home_1",
        icon: "",
        title: "Feature Title",
        desc: "Feature description",
      };
      const result = validateFeatureItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FeatureItem[1]: icon must be a non-empty string");
    });
  });

  describe("validateProcessItem", () => {
    it("should validate a valid process item", () => {
      const item: ProcessItem = {
        id: 1,
        page: "home_1",
        img: mockStaticImageData,
        count: "01",
        title: "Process Title",
        desc: "Process description",
      };
      const result = validateProcessItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject process item with empty count", () => {
      const item: ProcessItem = {
        id: 1,
        page: "home_1",
        img: mockStaticImageData,
        count: "",
        title: "Process Title",
        desc: "Process description",
      };
      const result = validateProcessItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("ProcessItem[1]: count must be a non-empty string");
    });
  });

  describe("validateCauseItem", () => {
    it("should validate a valid cause item", () => {
      const item: CauseItem = {
        id: 1,
        page: "home_1",
        icon: "icon-name",
        title: "Cause Title",
        desc: "Cause description",
      };
      const result = validateCauseItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject cause item with empty icon", () => {
      const item: CauseItem = {
        id: 1,
        page: "home_1",
        icon: "",
        title: "Cause Title",
        desc: "Cause description",
      };
      const result = validateCauseItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("CauseItem[1]: icon must be a non-empty string");
    });
  });

  describe("validateMenuItem", () => {
    it("should validate a valid menu item without dropdown", () => {
      const item: MenuItem = {
        id: 1,
        title: "Home",
        link: "/",
        has_dropdown: false,
      };
      const result = validateMenuItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate a valid menu item with dropdown", () => {
      const item: MenuItem = {
        id: 1,
        title: "Services",
        link: "/services",
        has_dropdown: true,
        sub_menus: [
          { link: "/services/web", title: "Web" },
          { link: "/services/mobile", title: "Mobile" },
        ],
      };
      const result = validateMenuItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject menu item with has_dropdown=true but no sub_menus", () => {
      const item: MenuItem = {
        id: 1,
        title: "Services",
        link: "/services",
        has_dropdown: true,
      };
      const result = validateMenuItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("MenuItem[1]: sub_menus must be a non-empty array when has_dropdown is true");
    });

    it("should reject menu item with empty sub_menu title", () => {
      const item: MenuItem = {
        id: 1,
        title: "Services",
        link: "/services",
        has_dropdown: true,
        sub_menus: [{ link: "/services/web", title: "" }],
      };
      const result = validateMenuItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("MenuItem[1]: sub_menus[0].title must be a non-empty string");
    });

    it("should reject menu item with has_dropdown=false but has sub_menus", () => {
      const item: MenuItem = {
        id: 1,
        title: "Services",
        link: "/services",
        has_dropdown: false,
        sub_menus: [{ link: "/services/web", title: "Web" }],
      };
      const result = validateMenuItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("checkDuplicateIds", () => {
    it("should pass with unique IDs", () => {
      const items: FaqItem[] = [
        { id: 1, page: "home_1", question: "Q1", answer: "A1" },
        { id: 2, page: "home_2", question: "Q2", answer: "A2" },
        { id: 3, page: "home_3", question: "Q3", answer: "A3" },
      ];
      const result = checkDuplicateIds(items, "FaqItem");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect duplicate IDs", () => {
      const items: FaqItem[] = [
        { id: 1, page: "home_1", question: "Q1", answer: "A1" },
        { id: 1, page: "home_2", question: "Q2", answer: "A2" },
        { id: 2, page: "home_1", question: "Q3", answer: "A3" },
      ];
      const result = checkDuplicateIds(items, "FaqItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FaqItem: Duplicate id 1 found in pages: home_1, home_2");
    });

    it("should detect multiple duplicate IDs", () => {
      const items: FaqItem[] = [
        { id: 1, page: "home_1", question: "Q1", answer: "A1" },
        { id: 1, page: "home_2", question: "Q2", answer: "A2" },
        { id: 2, page: "home_1", question: "Q3", answer: "A3" },
        { id: 2, page: "home_2", question: "Q4", answer: "A4" },
      ];
      const result = checkDuplicateIds(items, "FaqItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FaqItem: Duplicate id 1 found in pages: home_1, home_2");
      expect(result.errors).toContain("FaqItem: Duplicate id 2 found in pages: home_1, home_2");
    });
  });

  describe("validateDataArray", () => {
    it("should validate all items in array", () => {
      const items: FeedbackItem[] = [
        {
          id: 1,
          page: "home_1",
          avatar: mockStaticImageData,
          name: "John Doe",
          designation: "CEO",
          desc: "Great service",
          rating: "5.0",
        },
        {
          id: 2,
          page: "home_2",
          avatar: mockStaticImageData,
          name: "Jane Doe",
          designation: "CTO",
          desc: "Excellent support",
          rating: "4.8",
        },
      ];
      const result = validateDataArray(items, validateFeedbackItem);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should collect errors from all invalid items", () => {
      const items: FeedbackItem[] = [
        {
          id: 1,
          page: "home_1",
          avatar: mockStaticImageData,
          name: "",
          designation: "CEO",
          desc: "Great service",
          rating: "5.0",
        },
        {
          id: 2,
          page: "home_2",
          avatar: mockStaticImageData,
          name: "Jane Doe",
          designation: "CTO",
          desc: "Excellent support",
          rating: "6.0",
        },
      ];
      const result = validateDataArray(items, validateFeedbackItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FeedbackItem[1]: name must be a non-empty string");
      expect(result.errors).toContain("FeedbackItem[2]: rating must be a number between 0 and 5");
    });
  });
});
