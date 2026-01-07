import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
    const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    it('returns correct initial state', () => {
        const { result } = renderHook(() => usePagination({ data: testData, itemsPerPage: 3 }));

        expect(result.current.currentItems).toEqual([1, 2, 3]);
        expect(result.current.pageCount).toBe(4);
        expect(result.current.itemOffset).toBe(0);
    });

    it('handles empty data array', () => {
        const { result } = renderHook(() => usePagination({ data: [], itemsPerPage: 3 }));

        expect(result.current.currentItems).toEqual([]);
        expect(result.current.pageCount).toBe(0);
        expect(result.current.itemOffset).toBe(0);
    });

    it('calculates correct page count for various data sizes', () => {
        const { result: result1 } = renderHook(() => usePagination({ data: [1, 2], itemsPerPage: 3 }));
        expect(result1.current.pageCount).toBe(1);

        const { result: result2 } = renderHook(() => usePagination({ data: [1, 2, 3], itemsPerPage: 3 }));
        expect(result2.current.pageCount).toBe(1);

        const { result: result3 } = renderHook(() => usePagination({ data: [1, 2, 3, 4], itemsPerPage: 3 }));
        expect(result3.current.pageCount).toBe(2);
    });

    it('updates current items when page changes', () => {
        const { result } = renderHook(() => usePagination({ data: testData, itemsPerPage: 3 }));

        expect(result.current.currentItems).toEqual([1, 2, 3]);

        act(() => {
            result.current.handlePageClick({ selected: 1 });
        });

        expect(result.current.currentItems).toEqual([4, 5, 6]);
        expect(result.current.itemOffset).toBe(3);
    });

    it('updates current items to last page', () => {
        const { result } = renderHook(() => usePagination({ data: testData, itemsPerPage: 3 }));

        act(() => {
            result.current.handlePageClick({ selected: 3 });
        });

        expect(result.current.currentItems).toEqual([10]);
        expect(result.current.itemOffset).toBe(9);
    });

    it('handles page selection out of bounds', () => {
        const { result } = renderHook(() => usePagination({ data: testData, itemsPerPage: 3 }));

        act(() => {
            result.current.handlePageClick({ selected: 10 });
        });

        expect(result.current.currentItems).toEqual([1, 2, 3]);
    });

    it('resets to first page when navigating back', () => {
        const { result } = renderHook(() => usePagination({ data: testData, itemsPerPage: 3 }));

        act(() => {
            result.current.handlePageClick({ selected: 2 });
        });

        expect(result.current.currentItems).toEqual([7, 8, 9]);
        expect(result.current.itemOffset).toBe(6);

        act(() => {
            result.current.handlePageClick({ selected: 0 });
        });

        expect(result.current.currentItems).toEqual([1, 2, 3]);
        expect(result.current.itemOffset).toBe(0);
    });

    it('handles different itemsPerPage values', () => {
        const { result: result1 } = renderHook(() => usePagination({ data: testData, itemsPerPage: 5 }));
        expect(result1.current.currentItems).toEqual([1, 2, 3, 4, 5]);
        expect(result1.current.pageCount).toBe(2);

        const { result: result2 } = renderHook(() => usePagination({ data: testData, itemsPerPage: 1 }));
        expect(result2.current.currentItems).toEqual([1]);
        expect(result2.current.pageCount).toBe(10);
    });

    it('handles data with single item per page', () => {
        const { result } = renderHook(() => usePagination({ data: [1, 2, 3], itemsPerPage: 1 }));

        expect(result.current.currentItems).toEqual([1]);

        act(() => {
            result.current.handlePageClick({ selected: 1 });
        });

        expect(result.current.currentItems).toEqual([2]);

        act(() => {
            result.current.handlePageClick({ selected: 2 });
        });

        expect(result.current.currentItems).toEqual([3]);
    });

    it('handles negative page selection', () => {
        const { result } = renderHook(() => usePagination({ data: testData, itemsPerPage: 3 }));

        act(() => {
            result.current.handlePageClick({ selected: -1 });
        });

        expect(result.current.itemOffset).toBe(-3);
    });

    it('works with complex data types', () => {
        const complexData = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
        ];

        const { result } = renderHook(() => usePagination({ data: complexData, itemsPerPage: 2 }));

        expect(result.current.currentItems).toEqual([
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ]);

        act(() => {
            result.current.handlePageClick({ selected: 1 });
        });

        expect(result.current.currentItems).toEqual([{ id: 3, name: 'Item 3' }]);
    });
});
