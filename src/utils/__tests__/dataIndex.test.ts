import {
  createIdIndex,
  createPageIndex,
  createMultiFieldIndex,
  getDataById,
  getDataByPage,
  getDataByMultiField,
  type IdIndex,
  type PageIndex,
  type MultiFieldIndex,
} from "@/utils/dataIndex";

interface TestItem {
  id: number;
  name: string;
  category: string;
}

interface TestPageItem {
  id: number;
  page: string;
  content: string;
}

const testData: TestItem[] = [
  { id: 1, name: "Item 1", category: "A" },
  { id: 2, name: "Item 2", category: "B" },
  { id: 3, name: "Item 3", category: "A" },
];

const testPageData: TestPageItem[] = [
  { id: 1, page: "home", content: "Home content" },
  { id: 2, page: "about", content: "About content" },
  { id: 3, page: "home", content: "Home content 2" },
  { id: 4, page: "contact", content: "Contact content" },
];

describe("dataIndex", () => {
  describe("createIdIndex", () => {
    it("should create index from array", () => {
      const index = createIdIndex(testData);
      expect(index).toBeInstanceOf(Object);
      expect(index.size).toBe(3);
    });

    it("should get item by id", () => {
      const index = createIdIndex(testData);
      const item = index.get(2);
      expect(item).toEqual({ id: 2, name: "Item 2", category: "B" });
    });

    it("should return undefined for non-existent id", () => {
      const index = createIdIndex(testData);
      const item = index.get(99);
      expect(item).toBeUndefined();
    });

    it("should check if id exists", () => {
      const index = createIdIndex(testData);
      expect(index.has(1)).toBe(true);
      expect(index.has(99)).toBe(false);
    });

    it("should get all items", () => {
      const index = createIdIndex(testData);
      const all = index.getAll();
      expect(all).toHaveLength(3);
      expect(all).toContainEqual(testData[0]);
      expect(all).toContainEqual(testData[1]);
      expect(all).toContainEqual(testData[2]);
    });

    it("should handle empty array", () => {
      const index = createIdIndex<TestItem>([]);
      expect(index.size).toBe(0);
      expect(index.get(1)).toBeUndefined();
      expect(index.getAll()).toEqual([]);
    });
  });

  describe("createPageIndex", () => {
    it("should create page index from array", () => {
      const index = createPageIndex(testPageData);
      expect(index).toBeInstanceOf(Object);
      expect(index.size).toBe(3);
    });

    it("should get items by page", () => {
      const index = createPageIndex(testPageData);
      const homeItems = index.get("home");
      expect(homeItems).toHaveLength(2);
      expect(homeItems).toContainEqual(testPageData[0]);
      expect(homeItems).toContainEqual(testPageData[2]);
    });

    it("should return empty array for non-existent page", () => {
      const index = createPageIndex(testPageData);
      const items = index.get("nonexistent");
      expect(items).toEqual([]);
    });

    it("should check if page exists", () => {
      const index = createPageIndex(testPageData);
      expect(index.has("home")).toBe(true);
      expect(index.has("nonexistent")).toBe(false);
    });

    it("should get all pages", () => {
      const index = createPageIndex(testPageData);
      const pages = index.getAllPages();
      expect(pages).toHaveLength(3);
      expect(pages).toContain("home");
      expect(pages).toContain("about");
      expect(pages).toContain("contact");
    });

    it("should handle empty array", () => {
      const index = createPageIndex<TestPageItem>([]);
      expect(index.size).toBe(0);
      expect(index.get("home")).toEqual([]);
      expect(index.getAllPages()).toEqual([]);
    });
  });

  describe("createMultiFieldIndex", () => {
    it("should create multi-field index from array", () => {
      const index = createMultiFieldIndex(testData, ["category"]);
      expect(index).toBeInstanceOf(Object);
      expect(index.size).toBe(2);
    });

    it("should get items by single field key", () => {
      const index = createMultiFieldIndex(testData, ["category"]);
      const categoryAItems = index.get("A");
      expect(categoryAItems).toHaveLength(2);
      expect(categoryAItems).toContainEqual(testData[0]);
      expect(categoryAItems).toContainEqual(testData[2]);
    });

    it("should get items by multi-field key", () => {
      const multiData: TestItem[] = [
        { id: 1, name: "Item 1", category: "A" },
        { id: 2, name: "Item 1", category: "A" },
        { id: 3, name: "Item 2", category: "B" },
      ];
      const index = createMultiFieldIndex(multiData, ["name", "category"]);
      const items = index.get("Item 1|A");
      expect(items).toHaveLength(2);
    });

    it("should return undefined for non-existent key", () => {
      const index = createMultiFieldIndex(testData, ["category"]);
      const items = index.get("nonexistent");
      expect(items).toBeUndefined();
    });

    it("should check if key exists", () => {
      const index = createMultiFieldIndex(testData, ["category"]);
      expect(index.has("A")).toBe(true);
      expect(index.has("nonexistent")).toBe(false);
    });

    it("should get all keys", () => {
      const index = createMultiFieldIndex(testData, ["category"]);
      const keys = index.getAllKeys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain("A");
      expect(keys).toContain("B");
    });

    it("should handle empty array", () => {
      const index = createMultiFieldIndex<TestItem>([], ["category"]);
      expect(index.size).toBe(0);
      expect(index.get("A")).toBeUndefined();
      expect(index.getAllKeys()).toEqual([]);
    });
  });

  describe("getDataById", () => {
    it("should get item by id without index", () => {
      const item = getDataById(testData, 2);
      expect(item).toEqual({ id: 2, name: "Item 2", category: "B" });
    });

    it("should get item by id with index", () => {
      const index = createIdIndex(testData);
      const item = getDataById(testData, 2, index);
      expect(item).toEqual({ id: 2, name: "Item 2", category: "B" });
    });

    it("should return undefined for non-existent id without index", () => {
      const item = getDataById(testData, 99);
      expect(item).toBeUndefined();
    });

    it("should return undefined for non-existent id with index", () => {
      const index = createIdIndex(testData);
      const item = getDataById(testData, 99, index);
      expect(item).toBeUndefined();
    });

    it("should handle empty array", () => {
      const item = getDataById<TestItem>([], 1);
      expect(item).toBeUndefined();
    });
  });

  describe("getDataByPage", () => {
    it("should get items by page without index", () => {
      const items = getDataByPage(testPageData, "home");
      expect(items).toHaveLength(2);
      expect(items).toContainEqual(testPageData[0]);
      expect(items).toContainEqual(testPageData[2]);
    });

    it("should get items by page with index", () => {
      const index = createPageIndex(testPageData);
      const items = getDataByPage(testPageData, "home", index);
      expect(items).toHaveLength(2);
      expect(items).toContainEqual(testPageData[0]);
      expect(items).toContainEqual(testPageData[2]);
    });

    it("should return empty array for non-existent page without index", () => {
      const items = getDataByPage(testPageData, "nonexistent");
      expect(items).toEqual([]);
    });

    it("should return empty array for non-existent page with index", () => {
      const index = createPageIndex(testPageData);
      const items = getDataByPage(testPageData, "nonexistent", index);
      expect(items).toEqual([]);
    });

    it("should handle empty array", () => {
      const items = getDataByPage<TestPageItem>([], "home");
      expect(items).toEqual([]);
    });
  });

  describe("getDataByMultiField", () => {
    it("should get items by multi-field without index", () => {
      const items = getDataByMultiField(testData, ["category"], { category: "A" });
      expect(items).toHaveLength(2);
      expect(items).toContainEqual(testData[0]);
      expect(items).toContainEqual(testData[2]);
    });

    it("should get items by multi-field with index", () => {
      const index = createMultiFieldIndex(testData, ["category"]);
      const items = getDataByMultiField(testData, ["category"], { category: "A" }, index);
      expect(items).toHaveLength(2);
      expect(items).toContainEqual(testData[0]);
      expect(items).toContainEqual(testData[2]);
    });

    it("should return empty array for non-existent key without index", () => {
      const items = getDataByMultiField(testData, ["category"], { category: "Z" });
      expect(items).toEqual([]);
    });

    it("should return empty array for non-existent key with index", () => {
      const index = createMultiFieldIndex(testData, ["category"]);
      const items = getDataByMultiField(testData, ["category"], { category: "Z" }, index);
      expect(items).toEqual([]);
    });

    it("should handle empty array", () => {
      const items = getDataByMultiField<TestItem>([], ["category"], { category: "A" });
      expect(items).toEqual([]);
    });

    it("should filter by multiple fields", () => {
      const multiData: TestItem[] = [
        { id: 1, name: "Item 1", category: "A" },
        { id: 2, name: "Item 1", category: "A" },
        { id: 3, name: "Item 2", category: "B" },
      ];
      const items = getDataByMultiField(multiData, ["name", "category"], { name: "Item 1", category: "A" });
      expect(items).toHaveLength(2);
      expect(items[0].id).toBe(1);
      expect(items[1].id).toBe(2);
    });
  });

  describe("Index interface types", () => {
    it("should export IdIndex type", () => {
      const index: IdIndex<{ id: number }> = createIdIndex([{ id:1 }]);
      expect(index).toBeDefined();
    });

    it("should export PageIndex type", () => {
      const index: PageIndex<{ page: string }> = createPageIndex([
        { page: "home", id:1 },
      ]);
      expect(index).toBeDefined();
    });

    it("should export MultiFieldIndex type", () => {
      const index: MultiFieldIndex<{ id: number }> = createMultiFieldIndex(
        [{ id:1, name: "test" }],
        ["name"]
      );
      expect(index).toBeDefined();
    });
  });

  describe("edge cases - MapIdIndex", () => {
    it("should handle negative ids", () => {
      const data: TestItem[] = [
        { id: -1, name: "Item -1", category: "A" },
        { id: -2, name: "Item -2", category: "B" },
      ];
      const index = createIdIndex(data);
      expect(index.get(-1)).toEqual({ id: -1, name: "Item -1", category: "A" });
      expect(index.get(-2)).toEqual({ id: -2, name: "Item -2", category: "B" });
    });

    it("should handle zero id", () => {
      const data: TestItem[] = [
        { id: 0, name: "Item 0", category: "A" },
      ];
      const index = createIdIndex(data);
      expect(index.get(0)).toEqual({ id: 0, name: "Item 0", category: "A" });
    });

    it("should handle very large ids", () => {
      const data: TestItem[] = [
        { id: 999999999, name: "Large ID", category: "A" },
      ];
      const index = createIdIndex(data);
      expect(index.get(999999999)).toEqual({ id: 999999999, name: "Large ID", category: "A" });
    });

    it("should handle duplicate ids (last wins)", () => {
      const data: TestItem[] = [
        { id: 1, name: "First", category: "A" },
        { id: 1, name: "Second", category: "B" },
      ];
      const index = createIdIndex(data);
      const item = index.get(1);
      expect(item).toBeDefined();
      expect(item?.name).toBe("Second");
      expect(index.size).toBe(1);
    });

    it("should handle items with undefined optional fields", () => {
      const data: (TestItem & { optional?: string })[] = [
        { id: 1, name: "Item 1", category: "A", optional: "value" },
        { id: 2, name: "Item 2", category: "B", optional: undefined },
      ];
      const index = createIdIndex(data);
      expect(index.get(1)).toEqual({ id: 1, name: "Item 1", category: "A", optional: "value" });
      expect(index.get(2)).toEqual({ id: 2, name: "Item 2", category: "B", optional: undefined });
    });
  });

  describe("edge cases - MapPageIndex", () => {
    it("should handle empty string page", () => {
      const data: TestPageItem[] = [
        { id: 1, page: "", content: "Empty page" },
      ];
      const index = createPageIndex(data);
      const items = index.get("");
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({ id: 1, page: "", content: "Empty page" });
    });

    it("should handle special characters in page names", () => {
      const data: TestPageItem[] = [
        { id: 1, page: "page@123", content: "Special" },
        { id: 2, page: "page#tag", content: "Hash" },
      ];
      const index = createPageIndex(data);
      expect(index.get("page@123")).toHaveLength(1);
      expect(index.get("page#tag")).toHaveLength(1);
    });

    it("should handle unicode in page names", () => {
      const data: TestPageItem[] = [
        { id: 1, page: "中文", content: "Chinese" },
        { id: 2, page: "日本語", content: "Japanese" },
      ];
      const index = createPageIndex(data);
      expect(index.get("中文")).toHaveLength(1);
      expect(index.get("日本語")).toHaveLength(1);
    });

    it("should handle many items on same page", () => {
      const data: TestPageItem[] = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        page: "home",
        content: `Item ${i + 1}`,
      }));
      const index = createPageIndex(data);
      const items = index.get("home");
      expect(items).toHaveLength(1000);
      expect(index.size).toBe(1);
    });

    it("should handle items with null/undefined content", () => {
      const data: (TestPageItem & { extra?: string | null })[] = [
        { id: 1, page: "home", content: "Content", extra: null },
        { id: 2, page: "home", content: "More", extra: undefined },
      ];
      const index = createPageIndex(data);
      const items = index.get("home");
      expect(items).toHaveLength(2);
    });
  });

  describe("edge cases - MapMultiFieldIndex", () => {
    it("should handle empty string keys", () => {
      const data: TestItem[] = [
        { id: 1, name: "", category: "A" },
      ];
      const index = createMultiFieldIndex(data, ["name"]);
      expect(index.get("")).toHaveLength(1);
    });

    it("should handle special characters in field values", () => {
      const data: TestItem[] = [
        { id: 1, name: "test@example.com", category: "A" },
        { id: 2, name: "test#123", category: "B" },
      ];
      const index = createMultiFieldIndex(data, ["name"]);
      expect(index.get("test@example.com")).toHaveLength(1);
      expect(index.get("test#123")).toHaveLength(1);
    });

    it("should handle unicode in field values", () => {
      const data: TestItem[] = [
        { id: 1, name: "测试", category: "A" },
        { id: 2, name: "テスト", category: "B" },
      ];
      const index = createMultiFieldIndex(data, ["name"]);
      expect(index.get("测试")).toHaveLength(1);
      expect(index.get("テスト")).toHaveLength(1);
    });

    it("should handle undefined field values", () => {
      const data: (TestItem & { optional?: string })[] = [
        { id: 1, name: "Item 1", category: "A", optional: "value" },
        { id: 2, name: "Item 2", category: "B", optional: undefined },
      ];
      const index = createMultiFieldIndex(data, ["optional"]);
      expect(index.get("value")).toHaveLength(1);
      expect(index.get("undefined")).toBeUndefined();
    });

    it("should handle multi-field keys with special characters", () => {
      const data: TestItem[] = [
        { id: 1, name: "test@123", category: "cat#1" },
      ];
      const index = createMultiFieldIndex(data, ["name", "category"]);
      expect(index.get("test@123|cat#1")).toHaveLength(1);
    });

    it("should handle very long field values", () => {
      const longString = "a".repeat(1000);
      const data: TestItem[] = [
        { id: 1, name: longString, category: "A" },
      ];
      const index = createMultiFieldIndex(data, ["name"]);
      expect(index.get(longString)).toHaveLength(1);
    });
  });

  describe("performance - large datasets", () => {
    it("should handle large array for IdIndex", () => {
      const data: TestItem[] = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        category: i % 2 === 0 ? "A" : "B",
      }));
      const index = createIdIndex(data);
      expect(index.size).toBe(10000);
      expect(index.get(5000)).toEqual({
        id: 5000,
        name: "Item 5000",
        category: "B",
      });
    });

    it("should handle large array for PageIndex", () => {
      const data: TestPageItem[] = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        page: i % 3 === 0 ? "home" : i % 3 === 1 ? "about" : "contact",
        content: `Content ${i + 1}`,
      }));
      const index = createPageIndex(data);
      expect(index.size).toBe(3);
      expect(index.get("home")).toHaveLength(3334);
    });

    it("should handle large array for MultiFieldIndex", () => {
      const data: TestItem[] = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        category: i % 5 === 0 ? "A" : i % 5 === 1 ? "B" : "C",
      }));
      const index = createMultiFieldIndex(data, ["category"]);
      expect(index.size).toBe(3);
      expect(index.get("A")).toHaveLength(2000);
    });
  });
});
