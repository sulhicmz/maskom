import {
  validatePageField,
  validatePageFields,
  getPageStats,
  filterByPage,
} from "../pageValidation";
import type { BaseDataItem } from "@/types/data";

describe("pageValidation", () => {
  const mockItems: BaseDataItem[] = [
    { id: 1, page: "home_1" },
    { id: 2, page: "home_2" },
    { id: 3, page: "home_3" },
    { id: 4, page: "about" },
    { id: 5, page: "pricing" },
  ];

  describe("validatePageField", () => {
    it("should validate a valid page", () => {
      const item: BaseDataItem = { id: 1, page: "home_1" };
      const result = validatePageField(item);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid page", () => {
      const item: BaseDataItem = { id: 1, page: "invalid_page" };
      const result = validatePageField(item);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Invalid page value");
      expect(result.itemId).toBe("1");
    });

    it("should handle all valid pages", () => {
      const validPages = ["home_1", "home_2", "home_3", "about", "pricing"];
      validPages.forEach((page, index) => {
        const item: BaseDataItem = { id: index + 1, page: page as "home_1" | "home_2" | "home_3" | "about" | "pricing" };
        const result = validatePageField(item);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("validatePageFields", () => {
    it("should validate all items when all pages are valid", () => {
      const result = validatePageFields(mockItems);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toBe(5);
    });

    it("should return errors for invalid page values", () => {
      const itemsWithErrors: BaseDataItem[] = [
        { id: 1, page: "home_1" },
        { id: 2, page: "invalid" },
        { id: 3, page: "home_3" },
        { id: 4, page: "wrong_page" },
      ];
      const result = validatePageFields(itemsWithErrors);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].itemId).toBe("2");
      expect(result.errors[1].itemId).toBe("4");
      expect(result.validItems).toBe(2);
    });

    it("should handle empty array", () => {
      const result = validatePageFields([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toBe(0);
    });

    it("should report all invalid pages", () => {
      const allInvalid: BaseDataItem[] = [
        { id: 1, page: "page_a" },
        { id: 2, page: "page_b" },
        { id: 3, page: "page_c" },
      ];
      const result = validatePageFields(allInvalid);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.validItems).toBe(0);
    });
  });

  describe("getPageStats", () => {
    it("should return correct page statistics", () => {
      const items: BaseDataItem[] = [
        { id: 1, page: "home_1" },
        { id: 2, page: "home_1" },
        { id: 3, page: "home_2" },
        { id: 4, page: "about" },
      ];
      const result = getPageStats(items);
      expect(result.totalPages).toBe(3);
      expect(result.pageCounts["home_1"]).toBe(2);
      expect(result.pageCounts["home_2"]).toBe(1);
      expect(result.pageCounts["about"]).toBe(1);
      expect(result.itemCount).toBe(4);
    });

    it("should handle single page", () => {
      const items: BaseDataItem[] = [
        { id: 1, page: "home_1" },
        { id: 2, page: "home_1" },
        { id: 3, page: "home_1" },
      ];
      const result = getPageStats(items);
      expect(result.totalPages).toBe(1);
      expect(result.pageCounts["home_1"]).toBe(3);
      expect(result.itemCount).toBe(3);
    });

    it("should handle empty array", () => {
      const result = getPageStats([]);
      expect(result.totalPages).toBe(0);
      expect(result.pageCounts).toEqual({});
      expect(result.itemCount).toBe(0);
    });

    it("should include all valid pages in counts", () => {
      const items: BaseDataItem[] = [
        { id: 1, page: "home_1" },
        { id: 2, page: "home_2" },
        { id: 3, page: "home_3" },
        { id: 4, page: "about" },
        { id: 5, page: "pricing" },
      ];
      const result = getPageStats(items);
      expect(result.totalPages).toBe(5);
      expect(Object.keys(result.pageCounts)).toHaveLength(5);
    });
  });

  describe("filterByPage", () => {
    it("should filter items by valid page", () => {
      const items: BaseDataItem[] = [
        { id: 1, page: "home_1" },
        { id: 2, page: "home_2" },
        { id: 3, page: "home_1" },
      ];
      const result = filterByPage(items, "home_1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });

    it("should throw error for invalid page", () => {
      const items: BaseDataItem[] = [
        { id: 1, page: "home_1" },
        { id: 2, page: "home_2" },
      ];
      expect(() => {
        filterByPage(items, "invalid_page");
      }).toThrow("Invalid page: 'invalid_page'");
    });

    it("should return empty array when no items match page", () => {
      const items: BaseDataItem[] = [
        { id: 1, page: "home_1" },
        { id: 2, page: "home_2" },
      ];
      const result = filterByPage(items, "home_3");
      expect(result).toHaveLength(0);
    });

    it("should handle empty array", () => {
      const result = filterByPage([], "home_1");
      expect(result).toHaveLength(0);
    });
  });
});
