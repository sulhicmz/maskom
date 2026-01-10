export type FilterCriteria<T> = {
  [K in keyof T]?: T[K] | ((value: T[K]) => boolean);
} & {
  custom?: (item: T) => boolean;
};

export type PageFilter = {
  page: string;
};

export type PaginationFilter = {
  limit?: number;
  offset?: number;
};
