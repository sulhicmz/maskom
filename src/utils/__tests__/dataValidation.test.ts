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
  validateWiFiDevice,
  validateWebsiteTemplate,
  validateAIStep,
  validateBlogCommentItem,
  validateTeamMember,
  validateInnerBlogPost,
  validateFaqDetail,
  validateInnerFaqItem,
  validateSocialLink,
  validateNavigationItem,
  validateNavigationSection,
} from "@/utils/dataValidation";
import {
  FeedbackItem,
  FaqItem,
  PriceItem,
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

  describe("validateWiFiDevice", () => {
    it("should validate a valid WiFi device", () => {
      const item: WiFiDevice = { id: 1, name: "Device 1", ip: "192.168.1.10", status: "Online" };
      const result = validateWiFiDevice(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject WiFi device with invalid status", () => {
      const item: WiFiDevice = { id: 1, name: "Device 1", ip: "192.168.1.10", status: "Connected" as "Online" | "Offline" };
      const result = validateWiFiDevice(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("WiFiDevice[1]: status must be either \"Online\" or \"Offline\"");
    });

    it("should reject WiFi device with empty name", () => {
      const item: WiFiDevice = { id: 1, name: "", ip: "192.168.1.10", status: "Online" };
      const result = validateWiFiDevice(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("WiFiDevice[1]: name must be a non-empty string");
    });

    it("should reject WiFi device with invalid id", () => {
      const item: WiFiDevice = { id: -1, name: "Device 1", ip: "192.168.1.10", status: "Online" };
      const result = validateWiFiDevice(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("WiFiDevice: id must be a positive number");
    });
  });

  describe("validateWebsiteTemplate", () => {
    it("should validate a valid website template", () => {
      const item: WebsiteTemplate = { id: 1, name: "Business Template", preview: "/assets/images/template1.jpg" };
      const result = validateWebsiteTemplate(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject website template with empty name", () => {
      const item: WebsiteTemplate = { id: 1, name: "", preview: "/assets/images/template1.jpg" };
      const result = validateWebsiteTemplate(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("WebsiteTemplate[1]: name must be a non-empty string");
    });

    it("should reject website template with empty preview", () => {
      const item: WebsiteTemplate = { id: 1, name: "Business Template", preview: "" };
      const result = validateWebsiteTemplate(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("WebsiteTemplate[1]: preview must be a non-empty string");
    });
  });

  describe("validateAIStep", () => {
    it("should validate a valid AI step", () => {
      const item: AIStep = { id: 1, title: "Choose Type", content: "Select chatbot or recommendations" };
      const result = validateAIStep(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject AI step with empty title", () => {
      const item: AIStep = { id: 1, title: "", content: "Select chatbot or recommendations" };
      const result = validateAIStep(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("AIStep[1]: title must be a non-empty string");
    });

    it("should reject AI step with empty content", () => {
      const item: AIStep = { id: 1, title: "Choose Type", content: "" };
      const result = validateAIStep(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("AIStep[1]: content must be a non-empty string");
    });
  });

  describe("validateBlogCommentItem", () => {
    it("should validate a valid blog comment", () => {
      const item: BlogCommentItem = {
        id: 1,
        avatar: mockStaticImageData,
        name: "John Doe",
        date: "27 Aug, 2023",
        content: "Great article",
      };
      const result = validateBlogCommentItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject blog comment with empty name", () => {
      const item: BlogCommentItem = {
        id: 1,
        avatar: mockStaticImageData,
        name: "",
        date: "27 Aug, 2023",
        content: "Great article",
      };
      const result = validateBlogCommentItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("BlogCommentItem[1]: name must be a non-empty string");
    });

    it("should reject blog comment with empty content", () => {
      const item: BlogCommentItem = {
        id: 1,
        avatar: mockStaticImageData,
        name: "John Doe",
        date: "27 Aug, 2023",
        content: "",
      };
      const result = validateBlogCommentItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("BlogCommentItem[1]: content must be a non-empty string");
    });
  });

  describe("validateTeamMember", () => {
    it("should validate a valid team member", () => {
      const item: TeamMember = {
        id: 1,
        img: mockStaticImageData,
        title: "John Doe",
        designation: "CEO",
      };
      const result = validateTeamMember(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject team member with empty title", () => {
      const item: TeamMember = {
        id: 1,
        img: mockStaticImageData,
        title: "",
        designation: "CEO",
      };
      const result = validateTeamMember(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TeamMember[1]: title must be a non-empty string");
    });

    it("should reject team member with empty designation", () => {
      const item: TeamMember = {
        id: 1,
        img: mockStaticImageData,
        title: "John Doe",
        designation: "",
      };
      const result = validateTeamMember(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TeamMember[1]: designation must be a non-empty string");
    });
  });

  describe("validateInnerBlogPost", () => {
    it("should validate a valid inner blog post", () => {
      const item: InnerBlogPost = {
        id: 1,
        thumb: mockStaticImageData,
        title: "Blog Title",
        desc: "Blog description",
        date: "15 Mar 2024",
        user: "Author",
        tag: "Tech",
      };
      const result = validateInnerBlogPost(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject blog post with empty tag", () => {
      const item: InnerBlogPost = {
        id: 1,
        thumb: mockStaticImageData,
        title: "Blog Title",
        desc: "Blog description",
        date: "15 Mar 2024",
        user: "Author",
        tag: "",
      };
      const result = validateInnerBlogPost(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("InnerBlogPost[1]: tag must be a non-empty string");
    });

    it("should reject blog post with empty user", () => {
      const item: InnerBlogPost = {
        id: 1,
        thumb: mockStaticImageData,
        title: "Blog Title",
        desc: "Blog description",
        date: "15 Mar 2024",
        user: "",
        tag: "Tech",
      };
      const result = validateInnerBlogPost(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("InnerBlogPost[1]: user must be a non-empty string");
    });
  });

  describe("validateFaqDetail", () => {
    it("should validate a valid FAQ detail", () => {
      const item: FaqDetail = { id: 1, title: "Question", desc: "Answer" };
      const result = validateFaqDetail(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject FAQ detail with empty title", () => {
      const item: FaqDetail = { id: 1, title: "", desc: "Answer" };
      const result = validateFaqDetail(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FaqDetail[1]: title must be a non-empty string");
    });

    it("should reject FAQ detail with empty desc", () => {
      const item: FaqDetail = { id: 1, title: "Question", desc: "" };
      const result = validateFaqDetail(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FaqDetail[1]: desc must be a non-empty string");
    });
  });

  describe("validateInnerFaqItem", () => {
    it("should validate a valid inner FAQ item", () => {
      const item: InnerFaqItem = {
        id: 1,
        faq_details: [
          { id: 1, title: "Question 1", desc: "Answer 1" },
          { id: 2, title: "Question 2", desc: "Answer 2" },
        ],
      };
      const result = validateInnerFaqItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject inner FAQ item with empty faq_details", () => {
      const item: InnerFaqItem = { id: 1, faq_details: [] };
      const result = validateInnerFaqItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("InnerFaqItem[1]: faq_details must be a non-empty array");
    });

    it("should reject inner FAQ item with invalid detail", () => {
      const item: InnerFaqItem = {
        id: 1,
        faq_details: [{ id: 1, title: "", desc: "Answer" }],
      };
      const result = validateInnerFaqItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("FaqDetail[1]: title must be a non-empty string");
    });
  });

  describe("validateSocialLink", () => {
    it("should validate a valid social link", () => {
      const item: SocialLink = {
        url: "https://instagram.com",
        iconClass: "fab fa-instagram",
        ariaLabel: "Instagram",
        target: "_blank",
      };
      const result = validateSocialLink(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject social link with empty url", () => {
      const item: SocialLink = { url: "", iconClass: "fab fa-instagram", ariaLabel: "Instagram" };
      const result = validateSocialLink(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("SocialLink: url must be a non-empty string");
    });

    it("should reject social link with invalid target", () => {
      const item: SocialLink = {
        url: "https://instagram.com",
        iconClass: "fab fa-instagram",
        ariaLabel: "Instagram",
        target: "_top" as "_blank" | "_self",
      };
      const result = validateSocialLink(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("SocialLink[https://instagram.com]: target must be either \"_blank\" or \"_self\"");
    });
  });

  describe("validateNavigationItem", () => {
    it("should validate a valid navigation item", () => {
      const item: NavigationItem = { url: "/about", label: "About", target: "_self" };
      const result = validateNavigationItem(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject navigation item with empty label", () => {
      const item: NavigationItem = { url: "/about", label: "" };
      const result = validateNavigationItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("NavigationItem[/about]: label must be a non-empty string");
    });

    it("should reject navigation item with invalid target", () => {
      const item: NavigationItem = { url: "/about", label: "About", target: "_top" as "_blank" | "_self" };
      const result = validateNavigationItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("NavigationItem[/about]: target must be either \"_blank\" or \"_self\"");
    });
  });

  describe("validateNavigationSection", () => {
    it("should validate a valid navigation section", () => {
      const item: NavigationSection = {
        title: "Main",
        items: [
          { url: "/home", label: "Home" },
          { url: "/about", label: "About" },
        ],
      };
      const result = validateNavigationSection(item);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject navigation section with empty title", () => {
      const item: NavigationSection = {
        title: "",
        items: [{ url: "/home", label: "Home" }],
      };
      const result = validateNavigationSection(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("NavigationSection: title must be a non-empty string");
    });

    it("should reject navigation section with empty items", () => {
      const item: NavigationSection = { title: "Main", items: [] };
      const result = validateNavigationSection(item);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("NavigationSection[Main]: items must be a non-empty array");
    });
  });
});
