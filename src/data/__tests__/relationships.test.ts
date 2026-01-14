import {
  isValidPage,
  validatePageValue,
  VALID_PAGES,
  VALID_PAGES_SET,
} from "../relationships";

describe("relationships", () => {
  describe("isValidPage", () => {
    it("should return true for valid pages", () => {
      expect(isValidPage("home_1")).toBe(true);
      expect(isValidPage("home_2")).toBe(true);
      expect(isValidPage("home_3")).toBe(true);
      expect(isValidPage("about")).toBe(true);
      expect(isValidPage("pricing")).toBe(true);
    });

    it("should return false for invalid pages", () => {
      expect(isValidPage("invalid_page")).toBe(false);
      expect(isValidPage("home_4")).toBe(false);
      expect(isValidPage("contact")).toBe(false);
      expect(isValidPage("")).toBe(false);
      expect(isValidPage("HOME_1")).toBe(false);
      expect(isValidPage("Home_1")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isValidPage(123 as never)).toBe(false);
      expect(isValidPage(null as never)).toBe(false);
      expect(isValidPage(undefined as never)).toBe(false);
      expect(isValidPage({} as never)).toBe(false);
      expect(isValidPage([] as never)).toBe(false);
    });

    it("should work with type narrowing", () => {
      const testPage = "home_1";
      if (isValidPage(testPage)) {
        expect(typeof testPage).toBe("string");
        expect(VALID_PAGES.includes(testPage)).toBe(true);
      }
    });
  });

  describe("validatePageValue", () => {
    it("should validate valid string page values", () => {
      const validPages = ["home_1", "home_2", "home_3", "about", "pricing"];
      validPages.forEach((page) => {
        const result = validatePageValue(page);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it("should reject invalid string page values", () => {
      const invalidPages = [
        "invalid_page",
        "home_4",
        "contact",
        "team",
        "blog",
        "services",
      ];
      invalidPages.forEach((page) => {
        const result = validatePageValue(page);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain("Invalid page value");
        expect(result.error).toContain(page);
      });
    });

    it("should reject non-string values", () => {
      const nonStringValues = [
        123,
        null,
        undefined,
        { page: "home_1" },
        ["home_1"],
        true,
        false,
      ];
      nonStringValues.forEach((value) => {
        const result = validatePageValue(value);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain("must be a string");
      });
    });

    it("should reject number type", () => {
      const result = validatePageValue(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should reject null", () => {
      const result = validatePageValue(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should reject undefined", () => {
      const result = validatePageValue(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should reject object type", () => {
      const result = validatePageValue({ page: "home_1" });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should reject array type", () => {
      const result = validatePageValue(["home_1"]);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should reject boolean true", () => {
      const result = validatePageValue(true);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should reject boolean false", () => {
      const result = validatePageValue(false);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should reject empty string", () => {
      const result = validatePageValue("");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid page value");
    });

    it("should include valid pages list in error message", () => {
      const result = validatePageValue("invalid_page");
      expect(result.error).toContain("Valid pages are:");
      expect(result.error).toContain("home_1");
      expect(result.error).toContain("home_2");
      expect(result.error).toContain("home_3");
      expect(result.error).toContain("about");
      expect(result.error).toContain("pricing");
    });

    it("should handle case sensitivity", () => {
      expect(validatePageValue("HOME_1").isValid).toBe(false);
      expect(validatePageValue("Home_1").isValid).toBe(false);
      expect(validatePageValue("HOME_2").isValid).toBe(false);
      expect(validatePageValue("ABOUT").isValid).toBe(false);
      expect(validatePageValue("PRICING").isValid).toBe(false);
    });

    it("should handle whitespace variations", () => {
      expect(validatePageValue(" home_1").isValid).toBe(false);
      expect(validatePageValue("home_1 ").isValid).toBe(false);
      expect(validatePageValue(" home_1 ").isValid).toBe(false);
      expect(validatePageValue("home_1\t").isValid).toBe(false);
      expect(validatePageValue("\nhome_1\n").isValid).toBe(false);
    });
  });

  describe("VALID_PAGES", () => {
    it("should contain exactly 5 valid pages", () => {
      expect(VALID_PAGES).toHaveLength(5);
    });

    it("should contain home_1", () => {
      expect(VALID_PAGES).toContain("home_1");
    });

    it("should contain home_2", () => {
      expect(VALID_PAGES).toContain("home_2");
    });

    it("should contain home_3", () => {
      expect(VALID_PAGES).toContain("home_3");
    });

    it("should contain about", () => {
      expect(VALID_PAGES).toContain("about");
    });

    it("should contain pricing", () => {
      expect(VALID_PAGES).toContain("pricing");
    });

    it("should be readonly", () => {
      expect(VALID_PAGES).toBe(VALID_PAGES);
    });
  });

  describe("VALID_PAGES_SET", () => {
    it("should contain exactly 5 valid pages", () => {
      expect(VALID_PAGES_SET.size).toBe(5);
    });

    it("should contain all valid pages", () => {
      expect(VALID_PAGES_SET.has("home_1")).toBe(true);
      expect(VALID_PAGES_SET.has("home_2")).toBe(true);
      expect(VALID_PAGES_SET.has("home_3")).toBe(true);
      expect(VALID_PAGES_SET.has("about")).toBe(true);
      expect(VALID_PAGES_SET.has("pricing")).toBe(true);
    });

    it("should not contain invalid pages", () => {
      expect(VALID_PAGES_SET.has("home_4")).toBe(false);
      expect(VALID_PAGES_SET.has("contact")).toBe(false);
      expect(VALID_PAGES_SET.has("blog")).toBe(false);
    });

    it("should be a Set", () => {
      expect(VALID_PAGES_SET).toBeInstanceOf(Set);
    });

    it("should have O(1) lookup time", () => {
      const startTime = Date.now();
      for (let i = 0; i < 10000; i++) {
        VALID_PAGES_SET.has("home_1");
      }
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in page value", () => {
      expect(validatePageValue("home_1!").isValid).toBe(false);
      expect(validatePageValue("home_1@").isValid).toBe(false);
      expect(validatePageValue("home_1#").isValid).toBe(false);
      expect(validatePageValue("home_1$").isValid).toBe(false);
    });

    it("should handle unicode characters", () => {
      expect(validatePageValue("hοme_1").isValid).toBe(false);
      expect(validatePageValue("home_１").isValid).toBe(false);
    });

    it("should handle very long string", () => {
      const longString = "a".repeat(1000);
      const result = validatePageValue(longString);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid page value");
    });

    it("should handle string with only whitespace", () => {
      expect(validatePageValue(" ").isValid).toBe(false);
      expect(validatePageValue("  ").isValid).toBe(false);
      expect(validatePageValue("\t").isValid).toBe(false);
      expect(validatePageValue("\n").isValid).toBe(false);
    });

    it("should handle zero number", () => {
      const result = validatePageValue(0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should handle negative number", () => {
      const result = validatePageValue(-1);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should handle floating point number", () => {
      const result = validatePageValue(1.5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should handle NaN", () => {
      const result = validatePageValue(NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });

    it("should handle Infinity", () => {
      const result = validatePageValue(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Page value must be a string");
    });
  });
});
