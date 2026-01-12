import {
  createValidator,
  validateBaseDataItem,
  validateDataArray,
  checkDuplicateIds,
  type ValidationResult,
  type ValidationConfig,
} from "@/utils/dataValidation/baseValidation";
import type { BaseDataItem } from "@/types/data";

describe("baseValidation", () => {
  describe("validateBaseDataItem", () => {
    it("should validate a valid BaseDataItem", () => {
      const item: BaseDataItem = {
        id: 1,
        page: "home_1",
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject item with negative ID", () => {
      const item = {
        id: -1,
        page: "home_1",
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem[-1]: id must be a positive number");
    });

    it("should reject item with zero ID", () => {
      const item = {
        id: 0,
        page: "home_1",
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem[0]: id must be a positive number");
    });

    it("should reject item with string ID", () => {
      const item = {
        id: "1" as unknown as number,
        page: "home_1",
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem[1]: id must be a positive number");
    });

    it("should reject item with undefined ID", () => {
      const item = {
        id: undefined as unknown as number,
        page: "home_1",
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem[undefined]: id must be a positive number");
    });

    it("should reject item with empty page", () => {
      const item = {
        id: 1,
        page: "",
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem[1]: page must be a non-empty string");
    });

    it("should reject item with whitespace-only page", () => {
      const item = {
        id: 1,
        page: "   ",
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem[1]: page must be a non-empty string");
    });

    it("should reject item with non-string page", () => {
      const item = {
        id: 1,
        page: 123 as unknown as string,
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem[1]: page must be a non-empty string");
    });

    it("should reject item with undefined page", () => {
      const item = {
        id: 1,
        page: undefined as unknown as string,
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem[1]: page must be a non-empty string");
    });

    it("should reject item with both invalid ID and page", () => {
      const item = {
        id: 0,
        page: "",
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain("TestItem[0]: id must be a positive number");
      expect(result.errors).toContain("TestItem[0]: page must be a non-empty string");
    });

    it("should accept large positive ID", () => {
      const item = {
        id: Number.MAX_SAFE_INTEGER,
        page: "home_1",
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept page with special characters", () => {
      const item = {
        id: 1,
        page: "home-page_123",
      };
      const result = validateBaseDataItem(item, "TestItem");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("createValidator", () => {
    interface TestItem {
      name: string;
      age: number;
      status: "active" | "inactive";
      tags: string[];
    }

    it("should create validator with empty config", () => {
      const config: ValidationConfig<unknown> = {
        typeName: "EmptyConfig",
      };
      const validator = createValidator(config);
      const result = validator({});
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate string fields", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "StringConfig",
        stringFields: [
          { key: "name", required: true },
        ],
      };
      const validator = createValidator(config);

      const validItem: TestItem = { name: "John", age: 25, status: "active", tags: [] };
      expect(validator(validItem).isValid).toBe(true);

      const invalidItem: TestItem = { name: "", age: 25, status: "active", tags: [] };
      expect(validator(invalidItem).isValid).toBe(false);
      expect(validator(invalidItem).errors).toContain("StringConfig: name must be a non-empty string");
    });

    it("should validate number fields", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "NumberConfig",
        numberFields: [
          { key: "age", required: true, min: 0 },
        ],
      };
      const validator = createValidator(config);

      const validItem: TestItem = { name: "John", age: 25, status: "active", tags: [] };
      expect(validator(validItem).isValid).toBe(true);

      const invalidItem: TestItem = { name: "John", age: -5, status: "active", tags: [] };
      expect(validator(invalidItem).isValid).toBe(false);
      expect(validator(invalidItem).errors).toContain("NumberConfig: age must be a positive number");
    });

    it("should validate enum fields", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "EnumConfig",
        enumFields: [
          { key: "status", required: true, allowedValues: ["active", "inactive"] as const },
        ],
      };
      const validator = createValidator(config);

      const validItem: TestItem = { name: "John", age: 25, status: "active", tags: [] };
      expect(validator(validItem).isValid).toBe(true);

      const invalidItem = { name: "John", age: 25, status: "pending" as "active" | "inactive", tags: [] };
      expect(validator(invalidItem).isValid).toBe(false);
      expect(validator(invalidItem).errors).toContain('EnumConfig: status must be either "active" or "inactive"');
    });

    it("should validate array fields", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "ArrayConfig",
        arrayFields: [
          { key: "tags", required: true },
        ],
      };
      const validator = createValidator(config);

      const validItem: TestItem = { name: "John", age: 25, status: "active", tags: ["tag1", "tag2"] };
      expect(validator(validItem).isValid).toBe(true);

      const invalidItem: TestItem = { name: "John", age: 25, status: "active", tags: [] };
      expect(validator(invalidItem).isValid).toBe(false);
      expect(validator(invalidItem).errors).toContain("ArrayConfig: tags must be a non-empty array");
    });

    it("should validate array fields with item validator", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "ArrayItemConfig",
        arrayFields: [
          {
            key: "tags",
            required: true,
            itemValidator: (item: unknown, index: number) => {
              if (typeof item !== "string" || item.trim() === "") {
                return `ArrayItemConfig: tags[${index}] must be a non-empty string`;
              }
              return null;
            },
          },
        ],
      };
      const validator = createValidator(config);

      const validItem: TestItem = { name: "John", age: 25, status: "active", tags: ["tag1", "tag2"] };
      expect(validator(validItem).isValid).toBe(true);

      const invalidItem: TestItem = { name: "John", age: 25, status: "active", tags: ["tag1", ""] };
      expect(validator(invalidItem).isValid).toBe(false);
      expect(validator(invalidItem).errors).toContain("ArrayItemConfig: tags[1] must be a non-empty string");
    });

    it("should validate optional array fields with item validator", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "OptionalArrayConfig",
        arrayFields: [
          {
            key: "tags",
            required: false,
            itemValidator: (item: unknown, index: number) => {
              if (typeof item !== "string" || item.trim() === "") {
                return `OptionalArrayConfig: tags[${index}] must be a non-empty string`;
              }
              return null;
            },
          },
        ],
      };
      const validator = createValidator(config);

      const emptyArrayItem: TestItem = { name: "John", age: 25, status: "active", tags: [] };
      expect(validator(emptyArrayItem).isValid).toBe(true);

      const noTagsItem = { name: "John", age: 25, status: "active", tags: undefined } as unknown as TestItem;
      expect(validator(noTagsItem).isValid).toBe(true);

      const invalidItem: TestItem = { name: "John", age: 25, status: "active", tags: ["tag1", ""] };
      expect(validator(invalidItem).isValid).toBe(false);
    });

    it("should validate with baseValidation enabled", () => {
      interface TestBaseItem extends BaseDataItem {
        name: string;
      }

      const config: ValidationConfig<TestBaseItem> = {
        typeName: "BaseValidationConfig",
        baseValidation: true,
        stringFields: [
          { key: "name", required: true },
        ],
      };
      const validator = createValidator(config);

      const validItem: TestBaseItem = { id: 1, page: "home_1", name: "Test" };
      expect(validator(validItem).isValid).toBe(true);

      const invalidIdItem: TestBaseItem = { id: 0, page: "home_1", name: "Test" };
      expect(validator(invalidIdItem).isValid).toBe(false);
      expect(validator(invalidIdItem).errors).toContain("BaseValidationConfig[0]: id must be a positive number");
    });

    it("should validate with custom rules", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "CustomRuleConfig",
        stringFields: [
          { key: "name", required: true },
        ],
        customRules: [
          (item) => {
            if (item.name.length < 3) {
              return "CustomRuleConfig: name must be at least 3 characters";
            }
            return null;
          },
          (item) => {
            if (item.age < 18) {
              return "CustomRuleConfig: age must be at least 18";
            }
            return null;
          },
        ],
      };
      const validator = createValidator(config);

      const validItem: TestItem = { name: "John", age: 25, status: "active", tags: [] };
      expect(validator(validItem).isValid).toBe(true);

      const nameTooShortItem: TestItem = { name: "Jo", age: 25, status: "active", tags: [] };
      expect(validator(nameTooShortItem).isValid).toBe(false);
      expect(validator(nameTooShortItem).errors).toContain("CustomRuleConfig: name must be at least 3 characters");

      const ageTooYoungItem: TestItem = { name: "John", age: 15, status: "active", tags: [] };
      expect(validator(ageTooYoungItem).isValid).toBe(false);
      expect(validator(ageTooYoungItem).errors).toContain("CustomRuleConfig: age must be at least 18");
    });

    it("should combine all validation rules", () => {
      interface TestBaseItem extends BaseDataItem {
        name: string;
        age: number;
        status: "active" | "inactive";
        tags: string[];
      }

      const config: ValidationConfig<TestBaseItem> = {
        typeName: "CombinedConfig",
        baseValidation: true,
        stringFields: [
          { key: "name", required: true },
        ],
        numberFields: [
          { key: "age", required: true, min: 18 },
        ],
        enumFields: [
          { key: "status", required: true, allowedValues: ["active", "inactive"] as const },
        ],
        arrayFields: [
          { key: "tags", required: true },
        ],
        customRules: [
          (item) => {
            if (item.name.length < 3) {
              return "CombinedConfig: name must be at least 3 characters";
            }
            return null;
          },
        ],
      };
      const validator = createValidator(config);

      const validItem: TestBaseItem = { id: 1, page: "home_1", name: "John", age: 25, status: "active", tags: ["tag1"] };
      expect(validator(validItem).isValid).toBe(true);
      expect(validator(validItem).errors).toHaveLength(0);
    });

    it("should collect all errors from multiple validation failures", () => {
      interface TestBaseItem extends BaseDataItem {
        name: string;
        age: number;
        status: "active" | "inactive";
        tags: string[];
      }

      const config: ValidationConfig<TestBaseItem> = {
        typeName: "MultipleErrorConfig",
        baseValidation: true,
        stringFields: [
          { key: "name", required: true },
        ],
        numberFields: [
          { key: "age", required: true, min: 18 },
        ],
        enumFields: [
          { key: "status", required: true, allowedValues: ["active", "inactive"] as const },
        ],
        arrayFields: [
          { key: "tags", required: true },
        ],
      };
      const validator = createValidator(config);

      const invalidItem: TestBaseItem = {
        id: 0,
        page: "",
        name: "",
        age: 15,
        status: "pending" as "active" | "inactive",
        tags: [],
      };
      const result = validator(invalidItem);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(5);
      expect(result.errors).toContain("MultipleErrorConfig[0]: id must be a positive number");
      expect(result.errors).toContain("MultipleErrorConfig[0]: page must be a non-empty string");
      expect(result.errors).toContain("MultipleErrorConfig: name must be a non-empty string");
    });

    it("should handle number field without min constraint", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "NoMinConfig",
        numberFields: [
          { key: "age", required: true },
        ],
      };
      const validator = createValidator(config);

      const negativeItem: TestItem = { name: "John", age: -5, status: "active", tags: [] };
      expect(validator(negativeItem).isValid).toBe(true);
    });

    it("should handle non-array value for array field", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "NonArrayConfig",
        arrayFields: [
          { key: "tags", required: true },
        ],
      };
      const validator = createValidator(config);

      const invalidItem = { name: "John", age: 25, status: "active", tags: "not-an-array" };
      const result = validator(invalidItem as unknown as TestItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("NonArrayConfig: tags must be a non-empty array");
    });

    it("should handle non-string value for string field", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "NonStringConfig",
        stringFields: [
          { key: "name", required: true },
        ],
      };
      const validator = createValidator(config);

      const invalidItem = { name: 123, age: 25, status: "active", tags: [] };
      const result = validator(invalidItem as unknown as TestItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("NonStringConfig: name must be a non-empty string");
    });

    it("should handle non-number value for number field", () => {
      const config: ValidationConfig<TestItem> = {
        typeName: "NonNumberConfig",
        numberFields: [
          { key: "age", required: true },
        ],
      };
      const validator = createValidator(config);

      const invalidItem = { name: "John", age: "25", status: "active", tags: [] };
      const result = validator(invalidItem as unknown as TestItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("NonNumberConfig: age must be a number");
    });
  });

  describe("validateDataArray", () => {
    interface TestItem {
      id: number;
      value: string;
    }

    const mockValidator = (item: TestItem): ValidationResult => {
      if (item.value === "") {
        return { isValid: false, errors: [`TestItem[${item.id}]: value cannot be empty`] };
      }
      return { isValid: true, errors: [] };
    };

    it("should validate empty array", () => {
      const result = validateDataArray([], mockValidator);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate array with single valid item", () => {
      const items = [{ id: 1, value: "test" }];
      const result = validateDataArray(items, mockValidator);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate array with multiple valid items", () => {
      const items = [
        { id: 1, value: "test1" },
        { id: 2, value: "test2" },
        { id: 3, value: "test3" },
      ];
      const result = validateDataArray(items, mockValidator);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should collect errors from all invalid items", () => {
      const items = [
        { id: 1, value: "" },
        { id: 2, value: "test" },
        { id: 3, value: "" },
      ];
      const result = validateDataArray(items, mockValidator);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain("TestItem[1]: value cannot be empty");
      expect(result.errors).toContain("TestItem[3]: value cannot be empty");
    });

    it("should handle large arrays efficiently", () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `test${i}` }));
      const result = validateDataArray(items, mockValidator);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("checkDuplicateIds", () => {
    it("should pass with all unique IDs", () => {
      const items: BaseDataItem[] = [
        { id: 1, page: "page1" },
        { id: 2, page: "page2" },
        { id: 3, page: "page3" },
      ];
      const result = checkDuplicateIds(items, "TestItem");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect single duplicate ID", () => {
      const items: BaseDataItem[] = [
        { id: 1, page: "page1" },
        { id: 1, page: "page2" },
        { id: 2, page: "page3" },
      ];
      const result = checkDuplicateIds(items, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem: Duplicate id 1 found in pages: page1, page2");
    });

    it("should detect multiple duplicate IDs", () => {
      const items: BaseDataItem[] = [
        { id: 1, page: "page1" },
        { id: 1, page: "page2" },
        { id: 2, page: "page3" },
        { id: 2, page: "page4" },
        { id: 3, page: "page5" },
      ];
      const result = checkDuplicateIds(items, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem: Duplicate id 1 found in pages: page1, page2");
      expect(result.errors).toContain("TestItem: Duplicate id 2 found in pages: page3, page4");
    });

    it("should detect ID appearing more than twice", () => {
      const items: BaseDataItem[] = [
        { id: 1, page: "page1" },
        { id: 1, page: "page2" },
        { id: 1, page: "page3" },
      ];
      const result = checkDuplicateIds(items, "TestItem");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("TestItem: Duplicate id 1 found in pages: page1, page2, page3");
    });

    it("should handle empty array", () => {
      const result = checkDuplicateIds([], "TestItem");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle single item array", () => {
      const items: BaseDataItem[] = [{ id: 1, page: "page1" }];
      const result = checkDuplicateIds(items, "TestItem");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle large ID numbers", () => {
      const items: BaseDataItem[] = [
        { id: Number.MAX_SAFE_INTEGER, page: "page1" },
        { id: Number.MAX_SAFE_INTEGER - 1, page: "page2" },
      ];
      const result = checkDuplicateIds(items, "TestItem");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
