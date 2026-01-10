import { FilterCriteria, PaginationFilter } from "@/types/filter";

export function filterByCriteria<T>(
  items: T[],
  criteria: FilterCriteria<T>
): T[] {
  return items.filter((item) => {
    for (const [key, value] of Object.entries(criteria)) {
      if (key === "custom") {
        const customFilter = value as (item: T) => boolean;
        if (!customFilter(item)) {
          return false;
        }
        continue;
      }

      const itemValue = item[key as keyof T];
      const filterValue = value;

      if (typeof filterValue === "function") {
        const filterFn = filterValue as (val: unknown) => boolean;
        if (!filterFn(itemValue)) {
          return false;
        }
      } else if (itemValue !== filterValue) {
        return false;
      }
    }
    return true;
  });
}

export function filterByPage<T extends { page: string }>(
  items: T[],
  page: string
): T[] {
  return items.filter((item) => item.page === page);
}

export function filterWithPagination<T>(
  items: T[],
  pagination?: PaginationFilter
): T[] {
  if (!pagination || (pagination.limit === undefined && pagination.offset === undefined)) {
    return items;
  }

  const { limit, offset = 0 } = pagination;
  const startIndex = offset;
  const endIndex = limit !== undefined ? offset + limit : undefined;

  return items.slice(startIndex, endIndex);
}

export function createPageFilter<T extends { page: string }>(page: string) {
  return (item: T) => item.page === page;
}

export function filterItems<T extends { page: string }>(
  items: T[],
  page: string,
  pagination?: PaginationFilter
): T[] {
  const filtered = filterByPage(items, page);
  return filterWithPagination(filtered, pagination);
}
