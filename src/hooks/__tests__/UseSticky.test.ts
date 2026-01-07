import { renderHook, act, waitFor } from '@testing-library/react';
import UseSticky, { useBreakpoint } from '../UseSticky';

describe('UseSticky', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'scrollY', {
            writable: true,
            configurable: true,
            value: 0,
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns sticky as false initially', () => {
        const { result } = renderHook(() => UseSticky(200));

        expect(result.current.sticky).toBe(false);
    });

    it('updates sticky to true when scroll position exceeds offset', async () => {
        const { result } = renderHook(() => UseSticky(200));

        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 250 });
            window.dispatchEvent(new Event('scroll'));
        });

        await waitFor(() => {
            expect(result.current.sticky).toBe(true);
        });
    });

    it('updates sticky to false when scroll position is below offset', async () => {
        const { result } = renderHook(() => UseSticky(200));

        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 250 });
            window.dispatchEvent(new Event('scroll'));
        });

        await waitFor(() => {
            expect(result.current.sticky).toBe(true);
        });

        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 150 });
            window.dispatchEvent(new Event('scroll'));
        });

        await waitFor(() => {
            expect(result.current.sticky).toBe(false);
        });
    });

    it('uses default offset of 200 when not provided', async () => {
        const { result } = renderHook(() => UseSticky());

        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 201 });
            window.dispatchEvent(new Event('scroll'));
        });

        await waitFor(() => {
            expect(result.current.sticky).toBe(true);
        });
    });

    it('uses custom offset when provided', async () => {
        const { result } = renderHook(() => UseSticky(100));

        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 150 });
            window.dispatchEvent(new Event('scroll'));
        });

        await waitFor(() => {
            expect(result.current.sticky).toBe(true);
        });

        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 50 });
            window.dispatchEvent(new Event('scroll'));
        });

        await waitFor(() => {
            expect(result.current.sticky).toBe(false);
        });
    });

    it('handles scroll events at exact offset boundary', async () => {
        const { result } = renderHook(() => UseSticky(200));

        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 200 });
            window.dispatchEvent(new Event('scroll'));
        });

        await waitFor(() => {
            expect(result.current.sticky).toBe(false);
        });

        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 201 });
            window.dispatchEvent(new Event('scroll'));
        });

        await waitFor(() => {
            expect(result.current.sticky).toBe(true);
        });
    });

    it('cleans up event listener on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
        const { unmount } = renderHook(() => UseSticky());

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
        removeEventListenerSpy.mockRestore();
    });

    it('handles SSR scenario gracefully', () => {
        const { result } = renderHook(() => UseSticky(200));

        expect(result.current.sticky).toBe(false);
    });
});

describe('useBreakpoint', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200,
        });
    });

    it('returns isBreakpointOn as false initially for desktop', () => {
        const { result } = renderHook(() => useBreakpoint(1200));

        expect(result.current.isBreakpointOn).toBe(false);
    });

    it('returns isBreakpointOn as true when below breakpoint', async () => {
        const { result } = renderHook(() => useBreakpoint(1200));

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 1100 });
            window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
            expect(result.current.isBreakpointOn).toBe(true);
        });
    });

    it('uses default breakpoint of 1200 when not provided', async () => {
        const { result } = renderHook(() => useBreakpoint());

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 1199 });
            window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
            expect(result.current.isBreakpointOn).toBe(true);
        });
    });

    it('uses custom breakpoint when provided', async () => {
        const { result } = renderHook(() => useBreakpoint(768));

        expect(result.current.isBreakpointOn).toBe(false);

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 767 });
            window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
            expect(result.current.isBreakpointOn).toBe(true);
        });
    });

    it('handles resize events across breakpoint boundary', async () => {
        const { result } = renderHook(() => useBreakpoint(1200));

        expect(result.current.isBreakpointOn).toBe(false);

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 900 });
            window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
            expect(result.current.isBreakpointOn).toBe(true);
        });

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 1300 });
            window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
            expect(result.current.isBreakpointOn).toBe(false);
        });
    });

    it('handles exact breakpoint boundary', async () => {
        const { result } = renderHook(() => useBreakpoint(1200));

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 1200 });
            window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
            expect(result.current.isBreakpointOn).toBe(false);
        });

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 1199 });
            window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
            expect(result.current.isBreakpointOn).toBe(true);
        });
    });

    it('cleans up event listener on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
        const { unmount } = renderHook(() => useBreakpoint());

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        removeEventListenerSpy.mockRestore();
    });

    it('handles SSR scenario gracefully', () => {
        const { result } = renderHook(() => useBreakpoint(1200));

        expect(result.current.isBreakpointOn).toBe(false);
    });

    it('handles multiple resize events', async () => {
        const { result } = renderHook(() => useBreakpoint(1200));

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 1100 });
            window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
            expect(result.current.isBreakpointOn).toBe(true);
        });

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 800 });
            window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
            expect(result.current.isBreakpointOn).toBe(true);
        });

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 1400 });
            window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
            expect(result.current.isBreakpointOn).toBe(false);
        });
    });
});
