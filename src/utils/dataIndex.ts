export interface IdIndex<T> {
  get(id: number): T | undefined;
  has(id: number): boolean;
  getAll(): T[];
  size: number;
}

export interface PageIndex<T> {
  get(page: string): T[];
  has(page: string): boolean;
  getAllPages(): string[];
  size: number;
}

export interface MultiFieldIndex<T> {
  get(key: string): T[] | undefined;
  has(key: string): boolean;
  getAllKeys(): string[];
  size: number;
}

export class MapIdIndex<T extends { id: number }> implements IdIndex<T> {
  constructor(private map: Map<number, T>) {}

  get(id: number): T | undefined {
    return this.map.get(id);
  }

  has(id: number): boolean {
    return this.map.has(id);
  }

  getAll(): T[] {
    return Array.from(this.map.values());
  }

  get size(): number {
    return this.map.size;
  }
}

export class MapPageIndex<T extends { page: string }> implements PageIndex<T> {
  constructor(private map: Map<string, T[]>) {}

  get(page: string): T[] {
    return this.map.get(page) ?? [];
  }

  has(page: string): boolean {
    return this.map.has(page);
  }

  getAllPages(): string[] {
    return Array.from(this.map.keys());
  }

  get size(): number {
    return this.map.size;
  }
}

export class MapMultiFieldIndex<T> implements MultiFieldIndex<T> {
  constructor(private map: Map<string, T[]>) {}

  get(key: string): T[] | undefined {
    return this.map.get(key);
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.map.keys());
  }

  get size(): number {
    return this.map.size;
  }
}

export function createIdIndex<T extends { id: number }>(
  items: T[]
): IdIndex<T> {
  const map = new Map<number, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return new MapIdIndex(map);
}

export function createPageIndex<T extends { page: string }>(
  items: T[]
): PageIndex<T> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const existing = map.get(item.page) ?? [];
    existing.push(item);
    map.set(item.page, existing);
  }
  return new MapPageIndex(map);
}

export function createMultiFieldIndex<T>(
  items: T[],
  fields: (keyof T)[]
): MultiFieldIndex<T> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = fields.map((field) => String(item[field] ?? "")).join("|");
    const existing = map.get(key) ?? [];
    existing.push(item);
    map.set(key, existing);
  }
  return new MapMultiFieldIndex(map);
}

export function getDataById<T extends { id: number }>(
  items: T[],
  id: number,
  index?: IdIndex<T>
): T | undefined {
  if (index) {
    return index.get(id);
  }
  return items.find((item) => item.id === id);
}

export function getDataByPage<T extends { page: string }>(
  items: T[],
  page: string,
  index?: PageIndex<T>
): T[] {
  if (index) {
    return index.get(page);
  }
  return items.filter((item) => item.page === page);
}

export function getDataByMultiField<T>(
  items: T[],
  fields: (keyof T)[],
  criteria: Partial<Record<keyof T, unknown>>,
  index?: MultiFieldIndex<T>
): T[] {
  if (index) {
    const key = fields.map((field) => String(criteria[field] ?? "")).join("|");
    return index.get(key) ?? [];
  }
  return items.filter((item) =>
    fields.every((field) => item[field] === criteria[field])
  );
}
