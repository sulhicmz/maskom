import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('test', 300));
      expect(result.current).toBe('test');
    });

    it('should return updated value after delay', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'initial' },
      });

      expect(result.current).toBe('initial');

      act(() => {
        rerender({ value: 'updated' });
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('should use default 300ms delay when not specified', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
        initialProps: { value: 'initial' },
      });

      act(() => {
        rerender({ value: 'updated' });
      });

      act(() => {
        jest.advanceTimersByTime(299);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });
  });

  describe('Rapid Changes', () => {
    it('should debounce multiple rapid changes', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'initial' },
      });

      act(() => {
        rerender({ value: 'change1' });
        rerender({ value: 'change2' });
        rerender({ value: 'change3' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current).toBe('change3');
      });
    });

    it('should reset timer on each change', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'initial' },
      });

      act(() => {
        rerender({ value: 'change1' });
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current).toBe('initial');

      act(() => {
        rerender({ value: 'change2' });
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current).toBe('change2');
      });
    });
  });

  describe('Different Types', () => {
    it('should debounce string values', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'hello' },
      });

      act(() => {
        rerender({ value: 'world' });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current).toBe('world');
      });
    });

    it('should debounce number values', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 0 },
      });

      act(() => {
        rerender({ value: 42 });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current).toBe(42);
      });
    });

    it('should debounce array values', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: [1, 2, 3] },
      });

      act(() => {
        rerender({ value: [4, 5, 6] });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current).toEqual([4, 5, 6]);
      });
    });

    it('should debounce object values', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: { name: 'initial' } },
      });

      act(() => {
        rerender({ value: { name: 'updated' } });
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current).toEqual({ name: 'updated' });
      });
    });
  });

  describe('Custom Delay Values', () => {
    it('should use custom delay of 100ms', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: 'initial' },
      });

      act(() => {
        rerender({ value: 'updated' });
      });

      act(() => {
        jest.advanceTimersByTime(99);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });

    it('should use custom delay of 500ms', async () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
        initialProps: { value: 'initial' },
      });

      act(() => {
        rerender({ value: 'updated' });
      });

      act(() => {
        jest.advanceTimersByTime(499);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(result.current).toBe('updated');
      });
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { unmount, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'initial' },
      });

      act(() => {
        rerender({ value: 'updated' });
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should create debounced callback function', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      expect(typeof result.current).toBe('function');
    });

    it('should execute callback after delay', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current();
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to callback', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current('arg1', 'arg2', 123);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });
  });

  describe('Rapid Calls', () => {
    it('should debounce multiple rapid calls', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current();
        result.current();
        result.current();
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should only execute last call with arguments', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current('first');
        result.current('second');
        result.current('third');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('third');
    });

    it('should reset timer on each call', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current('first');
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        result.current('second');
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('second');
    });
  });

  describe('Default Delay', () => {
    it('should use default 300ms delay when not specified', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback));

      act(() => {
        result.current();
      });

      act(() => {
        jest.advanceTimersByTime(299);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      const callback = jest.fn();
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { unmount, result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current();
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Callback Return Type', () => {
    it('should preserve callback return type', () => {
      const callback = jest.fn(() => 'result');
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      expect(typeof result.current).toBe('function');
    });

    it('should work with async callback', async () => {
      const callback = jest.fn(async () => 'async result');
      const { result } = renderHook(() => useDebouncedCallback(callback, 300));

      act(() => {
        result.current();
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });
});
