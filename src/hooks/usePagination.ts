import { useState } from "react";

interface UsePaginationParams<T> {
  data: T[];
  itemsPerPage: number;
}

interface UsePaginationReturn<T> {
  currentItems: T[];
  pageCount: number;
  itemOffset: number;
  handlePageClick: (event: { selected: number }) => void;
}

export function usePagination<T>({ data, itemsPerPage }: UsePaginationParams<T>): UsePaginationReturn<T> {
  const [itemOffset, setItemOffset] = useState(0);

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = data.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(data.length / itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % data.length;
    setItemOffset(newOffset);
  };

  return {
    currentItems,
    pageCount,
    itemOffset,
    handlePageClick,
  };
}
