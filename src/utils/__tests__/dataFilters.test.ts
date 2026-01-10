import { filterByCriteria, filterByPage, filterWithPagination, createPageFilter, filterItems } from '../dataFilters';

interface TestItem {
  id: number;
  name: string;
  page: string;
  active: boolean;
  value?: number;
}

describe('dataFilters', () => {
  describe('filterByCriteria', () => {
    it('should return all items when no criteria provided', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false }
      ];

      const result = filterByCriteria(items, {});

      expect(result).toEqual(items);
    });

    it('should filter by single string criteria', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false }
      ];

      const result = filterByCriteria(items, { page: 'home' });

      expect(result).toHaveLength(1);
      expect(result[0].page).toBe('home');
    });

    it('should filter by boolean criteria', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false },
        { id: 3, name: 'Item 3', page: 'contact', active: true }
      ];

      const result = filterByCriteria(items, { active: true });

      expect(result).toHaveLength(2);
      expect(result.every(item => item.active)).toBe(true);
    });

    it('should filter by number criteria', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true, value: 10 },
        { id: 2, name: 'Item 2', page: 'about', active: false, value: 20 },
        { id: 3, name: 'Item 3', page: 'contact', active: true, value: 10 }
      ];

      const result = filterByCriteria(items, { value: 10 });

      expect(result).toHaveLength(2);
      expect(result.every(item => item.value === 10)).toBe(true);
    });

    it('should filter by multiple criteria', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true, value: 10 },
        { id: 2, name: 'Item 2', page: 'home', active: false, value: 10 },
        { id: 3, name: 'Item 3', page: 'about', active: true, value: 20 }
      ];

      const result = filterByCriteria(items, { page: 'home', active: false });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(items[1]);
    });

    it('should filter using custom function criteria', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true, value: 10 },
        { id: 2, name: 'Item 2', page: 'about', active: false, value: 20 },
        { id: 3, name: 'Item 3', page: 'contact', active: true, value: 30 }
      ];

      const customFilter = (item: TestItem) => item.value !== undefined && item.value > 15;

      const result = filterByCriteria(items, { custom: customFilter });

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(20);
      expect(result[1].value).toBe(30);
    });

    it('should filter using function as value for specific key', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true, value: 10 },
        { id: 2, name: 'Item 2', page: 'about', active: false, value: 20 },
        { id: 3, name: 'Item 3', page: 'contact', active: true, value: 30 }
      ];

      const valueFilter = (val: unknown) => typeof val === 'number' && val > 15;

      const result = filterByCriteria(items, { value: valueFilter });

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(20);
      expect(result[1].value).toBe(30);
    });

    it('should return empty array when no items match criteria', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false }
      ];

      const result = filterByCriteria(items, { page: 'nonexistent' });

      expect(result).toHaveLength(0);
    });

    it('should handle empty items array', () => {
      const items: TestItem[] = [];

      const result = filterByCriteria(items, { page: 'home' });

      expect(result).toHaveLength(0);
    });

    it('should combine custom filter with other criteria', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true, value: 10 },
        { id: 2, name: 'Item 2', page: 'home', active: true, value: 25 },
        { id: 3, name: 'Item 3', page: 'about', active: true, value: 30 }
      ];

      const customFilter = (item: TestItem) => item.value !== undefined && item.value > 20;

      const result = filterByCriteria(items, { page: 'home', custom: customFilter });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(items[1]);
    });

    it('should handle items with optional properties', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false, value: 20 }
      ];

      const result = filterByCriteria(items, { value: 20 });

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(20);
    });
  });

  describe('filterByPage', () => {
    it('should filter items by page property', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false },
        { id: 3, name: 'Item 3', page: 'home', active: true }
      ];

      const result = filterByPage(items, 'home');

      expect(result).toHaveLength(2);
      expect(result.every(item => item.page === 'home')).toBe(true);
    });

    it('should return empty array when page not found', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false }
      ];

      const result = filterByPage(items, 'nonexistent');

      expect(result).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const items: TestItem[] = [];

      const result = filterByPage(items, 'home');

      expect(result).toHaveLength(0);
    });

    it('should handle page with special characters', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home-1', active: true },
        { id: 2, name: 'Item 2', page: 'about_2', active: false },
        { id: 3, name: 'Item 3', page: 'home-1', active: true }
      ];

      const result = filterByPage(items, 'home-1');

      expect(result).toHaveLength(2);
    });
  });

  describe('filterWithPagination', () => {
    it('should return all items when no pagination provided', () => {
      const items = [1, 2, 3, 4, 5];

      const result = filterWithPagination(items);

      expect(result).toEqual(items);
    });

    it('should return all items when undefined pagination provided', () => {
      const items = [1, 2, 3, 4, 5];

      const result = filterWithPagination(items, undefined);

      expect(result).toEqual(items);
    });

    it('should apply limit only', () => {
      const items = [1, 2, 3, 4, 5];

      const result = filterWithPagination(items, { limit: 3 });

      expect(result).toEqual([1, 2, 3]);
    });

    it('should apply offset only', () => {
      const items = [1, 2, 3, 4, 5];

      const result = filterWithPagination(items, { offset: 2 });

      expect(result).toEqual([3, 4, 5]);
    });

    it('should apply both limit and offset', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8];

      const result = filterWithPagination(items, { offset: 2, limit: 3 });

      expect(result).toEqual([3, 4, 5]);
    });

    it('should handle offset beyond array length', () => {
      const items = [1, 2, 3, 4, 5];

      const result = filterWithPagination(items, { offset: 10, limit: 3 });

      expect(result).toHaveLength(0);
    });

    it('should handle limit beyond remaining items', () => {
      const items = [1, 2, 3, 4, 5];

      const result = filterWithPagination(items, { offset: 3, limit: 10 });

      expect(result).toEqual([4, 5]);
    });

    it('should handle zero limit', () => {
      const items = [1, 2, 3, 4, 5];

      const result = filterWithPagination(items, { limit: 0 });

      expect(result).toHaveLength(0);
    });

    it('should handle zero offset', () => {
      const items = [1, 2, 3, 4, 5];

      const result = filterWithPagination(items, { offset: 0, limit: 3 });

      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
      const items: number[] = [];

      const result = filterWithPagination(items, { offset: 2, limit: 3 });

      expect(result).toHaveLength(0);
    });

    it('should work with objects', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false },
        { id: 3, name: 'Item 3', page: 'home', active: true }
      ];

      const result = filterWithPagination(items, { offset: 1, limit: 1 });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(items[1]);
    });
  });

  describe('createPageFilter', () => {
    it('should create a filter function for specified page', () => {
      const filter = createPageFilter<TestItem>('home');

      const item1 = { id: 1, name: 'Item 1', page: 'home', active: true };
      const item2 = { id: 2, name: 'Item 2', page: 'about', active: false };

      expect(filter(item1)).toBe(true);
      expect(filter(item2)).toBe(false);
    });

    it('should work with different page names', () => {
      const filter = createPageFilter<TestItem>('about');

      const item1 = { id: 1, name: 'Item 1', page: 'home', active: true };
      const item2 = { id: 2, name: 'Item 2', page: 'about', active: false };

      expect(filter(item1)).toBe(false);
      expect(filter(item2)).toBe(true);
    });

    it('should handle empty page string', () => {
      const filter = createPageFilter<TestItem>('');

      const item = { id: 1, name: 'Item 1', page: '', active: true };

      expect(filter(item)).toBe(true);
    });
  });

  describe('filterItems', () => {
    it('should filter by page without pagination', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false },
        { id: 3, name: 'Item 3', page: 'home', active: true }
      ];

      const result = filterItems(items, 'home');

      expect(result).toHaveLength(2);
      expect(result.every(item => item.page === 'home')).toBe(true);
    });

    it('should filter by page with pagination', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'home', active: false },
        { id: 3, name: 'Item 3', page: 'home', active: true },
        { id: 4, name: 'Item 4', page: 'about', active: false }
      ];

      const result = filterItems(items, 'home', { limit: 2 });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(items[0]);
      expect(result[1]).toEqual(items[1]);
    });

    it('should filter by page with offset and limit', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'home', active: false },
        { id: 3, name: 'Item 3', page: 'home', active: true },
        { id: 4, name: 'Item 4', page: 'about', active: false }
      ];

      const result = filterItems(items, 'home', { offset: 1, limit: 1 });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(items[1]);
    });

    it('should return empty array when page not found', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false }
      ];

      const result = filterItems(items, 'nonexistent');

      expect(result).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const items: TestItem[] = [];

      const result = filterItems(items, 'home', { limit: 5 });

      expect(result).toHaveLength(0);
    });

    it('should handle pagination beyond filtered results', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'home', active: true },
        { id: 2, name: 'Item 2', page: 'home', active: false },
        { id: 3, name: 'Item 3', page: 'about', active: true }
      ];

      const result = filterItems(items, 'home', { offset: 5, limit: 10 });

      expect(result).toHaveLength(0);
    });

    it('should apply pagination after page filtering', () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item 1', page: 'about', active: true },
        { id: 2, name: 'Item 2', page: 'about', active: false },
        { id: 3, name: 'Item 3', page: 'home', active: true },
        { id: 4, name: 'Item 4', page: 'home', active: false }
      ];

      const result = filterItems(items, 'home', { offset: 1, limit: 1 });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(items[3]);
    });
  });
});
