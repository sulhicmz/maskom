import type { BaseDataItem } from "@/types/data";
import { VALID_PAGES, isValidPage, validatePageValue } from "@/data/relationships";

export function validatePageField<T extends BaseDataItem>(item: T): { isValid: boolean; error?: string; itemId?: string } {
  const result = validatePageValue(item.page);
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error,
      itemId: String(item.id),
    };
  }
  return { isValid: true };
}

export function validatePageFields<T extends BaseDataItem>(items: T[]): {
  isValid: boolean;
  errors: Array<{ error: string; itemId: string }>;
  validItems: number;
} {
  const errors: Array<{ error: string; itemId: string }> = [];
  let validItems = 0;

  for (const item of items) {
    const result = validatePageField(item);
    if (result.isValid) {
      validItems++;
    } else {
      errors.push({
        error: result.error ?? "Unknown error",
        itemId: result.itemId ?? "unknown",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validItems,
  };
}

export function getPageStats<T extends BaseDataItem>(items: T[]): {
  totalPages: number;
  pageCounts: Record<string, number>;
  itemCount: number;
} {
  const pageCounts: Record<string, number> = {};
  const validPages = new Set<string>(VALID_PAGES);

  for (const item of items) {
    const page = item.page;
    if (validPages.has(page)) {
      pageCounts[page] = (pageCounts[page] ?? 0) + 1;
    }
  }

  return {
    totalPages: Object.keys(pageCounts).length,
    pageCounts,
    itemCount: items.length,
  };
}

export function filterByPage<T extends BaseDataItem>(items: T[], page: string): T[] {
  if (!isValidPage(page)) {
    throw new Error(`Invalid page: '${page}'. Valid pages are: ${VALID_PAGES.join(", ")}`);
  }
  return items.filter((item) => item.page === page);
}
