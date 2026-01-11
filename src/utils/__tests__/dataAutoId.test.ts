import {
  AutoIdGenerator,
  autoIdArray,
  createAutoIdGenerator,
} from "../dataAutoId";
import { BaseDataItem } from "@/types/data";

describe("AutoIdGenerator", () => {
  describe("constructor", () => {
    it("should create generator with default values", () => {
      const generator = new AutoIdGenerator();
      expect(generator.getCurrentId()).toBe(1);
    });

    it("should create generator with custom startFrom", () => {
      const generator = new AutoIdGenerator({ startFrom: 10 });
      expect(generator.getCurrentId()).toBe(10);
    });

    it("should create generator with custom incrementBy", () => {
      const generator = new AutoIdGenerator({ incrementBy: 5 });
      expect(generator.getCurrentId()).toBe(1);
      expect(generator.next()).toBe(1);
      expect(generator.getCurrentId()).toBe(6);
    });

    it("should create generator with collectionName", () => {
      const generator = new AutoIdGenerator({ collectionName: "test" });
      expect(generator.next()).toBe(1);
    });
  });

  describe("next() / nextId()", () => {
    it("should return incrementing IDs starting from 1", () => {
      const generator = new AutoIdGenerator();
      expect(generator.next()).toBe(1);
      expect(generator.next()).toBe(2);
      expect(generator.next()).toBe(3);
    });

    it("should return incrementing IDs starting from custom start", () => {
      const generator = new AutoIdGenerator({ startFrom: 100 });
      expect(generator.next()).toBe(100);
      expect(generator.next()).toBe(101);
      expect(generator.next()).toBe(102);
    });

    it("should return IDs with custom increment", () => {
      const generator = new AutoIdGenerator({ incrementBy: 10 });
      expect(generator.next()).toBe(1);
      expect(generator.next()).toBe(11);
      expect(generator.next()).toBe(21);
    });

    it("should support nextId() as alias for next()", () => {
      const generator = new AutoIdGenerator();
      expect(generator.nextId()).toBe(1);
      expect(generator.next()).toBe(2);
      expect(generator.nextId()).toBe(3);
    });
  });

  describe("duplicate detection", () => {
    it("should track used IDs", () => {
      const generator = new AutoIdGenerator();
      const id1 = generator.next();
      const id2 = generator.next();

      expect(generator.hasUsedId(id1)).toBe(true);
      expect(generator.hasUsedId(id2)).toBe(true);
      expect(generator.hasUsedId(999)).toBe(false);
    });

    it("should throw error if ID would duplicate", () => {
      const generator = new AutoIdGenerator({ incrementBy: 0 });

      generator.next();

      expect(() => generator.next()).toThrow(
        /Duplicate ID detected: 1 in collection/
      );
    });

    it("should throw error with collectionName in message", () => {
      const generator = new AutoIdGenerator({
        collectionName: "test_collection",
        incrementBy: 0,
      });

      generator.next();

      expect(() => generator.next()).toThrow(
        'Duplicate ID detected: 1 in collection "test_collection"'
      );
    });

    it("should prevent duplicate IDs after reset", () => {
      const generator = new AutoIdGenerator();
      const id1 = generator.next();

      generator.reset();
      const id2 = generator.next();

      expect(id2).toBe(id1);
    });
  });

  describe("reset()", () => {
    it("should reset to default start value", () => {
      const generator = new AutoIdGenerator({ startFrom: 100 });
      generator.next();
      generator.next();

      generator.reset();

      expect(generator.getCurrentId()).toBe(1);
      expect(generator.next()).toBe(1);
    });

    it("should reset to custom start value", () => {
      const generator = new AutoIdGenerator({ startFrom: 10 });
      generator.next();

      generator.reset(50);

      expect(generator.getCurrentId()).toBe(50);
      expect(generator.next()).toBe(50);
    });

    it("should clear used IDs set after reset", () => {
      const generator = new AutoIdGenerator();
      generator.next();
      generator.next();

      generator.reset();

      expect(generator.getUsedIds().length).toBe(0);
      expect(generator.hasUsedId(1)).toBe(false);
    });

    it("should allow reusing IDs after reset", () => {
      const generator = new AutoIdGenerator();
      const id1 = generator.next();
      generator.next();

      generator.reset();

      const id3 = generator.next();
      expect(id3).toBe(1);
      expect(id3).toBe(id1);
    });
  });

  describe("getCurrentId()", () => {
    it("should return current ID before next() is called", () => {
      const generator = new AutoIdGenerator({ startFrom: 5 });
      expect(generator.getCurrentId()).toBe(5);
    });

    it("should return next ID after next() is called", () => {
      const generator = new AutoIdGenerator({ startFrom: 1 });
      generator.next();
      generator.next();

      expect(generator.getCurrentId()).toBe(3);
    });
  });

  describe("getUsedIds()", () => {
    it("should return empty array initially", () => {
      const generator = new AutoIdGenerator();
      const usedIds = generator.getUsedIds();

      expect(usedIds).toEqual([]);
      expect(usedIds.length).toBe(0);
    });

    it("should return array of all used IDs", () => {
      const generator = new AutoIdGenerator();
      generator.next();
      generator.next();
      generator.next();

      const usedIds = generator.getUsedIds();

      expect(usedIds).toEqual([1, 2, 3]);
    });

    it("should return readonly array", () => {
      const generator = new AutoIdGenerator();
      generator.next();

      const usedIds = generator.getUsedIds() as number[];

      usedIds.push(999);

      expect(generator.getUsedIds()).not.toContain(999);
    });
  });

  describe("edge cases", () => {
    it("should handle zero startFrom value", () => {
      const generator = new AutoIdGenerator({ startFrom: 0 });
      expect(generator.next()).toBe(0);
      expect(generator.next()).toBe(1);
    });

    it("should handle negative startFrom value", () => {
      const generator = new AutoIdGenerator({ startFrom: -5 });
      expect(generator.next()).toBe(-5);
      expect(generator.next()).toBe(-4);
    });

    it("should handle large increment values", () => {
      const generator = new AutoIdGenerator({ incrementBy: 1000 });
      expect(generator.next()).toBe(1);
      expect(generator.next()).toBe(1001);
    });

    it("should handle many IDs without performance issues", () => {
      const generator = new AutoIdGenerator();

      for (let i = 0; i < 10000; i++) {
        generator.next();
      }

      expect(generator.getCurrentId()).toBe(10001);
      expect(generator.getUsedIds().length).toBe(10000);
    });
  });
});

describe("autoIdArray()", () => {
  const mockItems: Omit<BaseDataItem, "id">[] = [
    { page: "test" },
    { page: "test" },
    { page: "test" },
  ];

  it("should assign auto-generated IDs to array of items", () => {
    const { data } = autoIdArray(mockItems);

    expect(data).toHaveLength(3);
    expect(data[0].id).toBe(1);
    expect(data[1].id).toBe(2);
    expect(data[2].id).toBe(3);
  });

  it("should preserve other properties in items", () => {
    const { data } = autoIdArray(mockItems);

    expect(data[0].page).toBe("test");
    expect(data[1].page).toBe("test");
  });

  it("should start from custom startFrom value", () => {
    const { data } = autoIdArray(mockItems, { startFrom: 10 });

    expect(data[0].id).toBe(10);
    expect(data[1].id).toBe(11);
    expect(data[2].id).toBe(12);
  });

  it("should use custom incrementBy value", () => {
    const { data } = autoIdArray(mockItems, { incrementBy: 5 });

    expect(data[0].id).toBe(1);
    expect(data[1].id).toBe(6);
    expect(data[2].id).toBe(11);
  });

  it("should return generator for continued ID generation", () => {
    const { generator } = autoIdArray(mockItems);

    expect(generator.getCurrentId()).toBe(4);
    expect(generator.next()).toBe(4);
  });

  it("should handle empty array", () => {
    const { data, generator } = autoIdArray([]);

    expect(data).toEqual([]);
    expect(generator.getCurrentId()).toBe(1);
  });
});

describe("createAutoIdGenerator()", () => {
  it("should create new AutoIdGenerator instance", () => {
    const generator = createAutoIdGenerator();

    expect(generator).toBeInstanceOf(AutoIdGenerator);
    expect(generator.next()).toBe(1);
  });

  it("should pass options to generator", () => {
    const generator = createAutoIdGenerator({
      startFrom: 100,
      incrementBy: 10,
      collectionName: "test",
    });

    expect(generator.next()).toBe(100);
    expect(generator.getCurrentId()).toBe(110);
  });

  it("should work with default options", () => {
    const generator = createAutoIdGenerator({});

    expect(generator.next()).toBe(1);
    expect(generator.getCurrentId()).toBe(2);
  });
});
