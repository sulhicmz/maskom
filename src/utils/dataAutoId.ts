import { BaseDataItem } from "@/types/data";

export interface AutoIdGeneratorOptions {
  startFrom?: number;
  incrementBy?: number;
  collectionName?: string;
}

export class AutoIdGenerator {
  private static readonly DEFAULT_START = 1;
  private static readonly DEFAULT_INCREMENT = 1;

  private currentId: number;
  private increment: number;
  private collectionName: string;
  private usedIds: Set<number>;

  constructor(options: AutoIdGeneratorOptions = {}) {
    this.increment = options.incrementBy ?? AutoIdGenerator.DEFAULT_INCREMENT;
    this.collectionName = options.collectionName ?? "unnamed";
    this.currentId = options.startFrom ?? AutoIdGenerator.DEFAULT_START;
    this.usedIds = new Set<number>();
  }

  next(): number {
    const id = this.currentId;

    if (this.usedIds.has(id)) {
      throw new Error(
        `Duplicate ID detected: ${id} in collection "${this.collectionName}"`
      );
    }

    this.usedIds.add(id);
    this.currentId += this.increment;

    return id;
  }

  nextId(): number {
    return this.next();
  }

  reset(startFrom: number = AutoIdGenerator.DEFAULT_START): void {
    this.currentId = startFrom;
    this.usedIds.clear();
  }

  getCurrentId(): number {
    return this.currentId;
  }

  getUsedIds(): readonly number[] {
    return Array.from(this.usedIds);
  }

  hasUsedId(id: number): boolean {
    return this.usedIds.has(id);
  }
}

export interface AutoIdArrayResult<T extends BaseDataItem> {
  data: T[];
  generator: AutoIdGenerator;
}

export function autoIdArray<T extends BaseDataItem>(
  items: Omit<T, "id">[],
  options?: AutoIdGeneratorOptions
): AutoIdArrayResult<T> {
  const generator = new AutoIdGenerator(options);
  const data: T[] = [];

  for (const item of items) {
    data.push({
      ...item,
      id: generator.next(),
    } as T);
  }

  return { data, generator };
}

export function createAutoIdGenerator(
  options?: AutoIdGeneratorOptions
): AutoIdGenerator {
  return new AutoIdGenerator(options);
}
