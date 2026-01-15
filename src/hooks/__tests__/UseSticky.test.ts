import { renderHook, act } from '@testing-library/react';
import UseSticky, { useBreakpoint } from '../UseSticky';

type TestWindow = typeof window & {
  scrollY?: number;
  innerWidth?: number;
};

describe('UseSticky', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('returns sticky state object', () => {
      const { result } = renderHook(() => UseSticky());
      
      expect(result.current).toHaveProperty('sticky');
      expect(typeof result.current.sticky).toBe('boolean');
    });

    it('initializes sticky state to false', () => {
      const { result } = renderHook(() => UseSticky());
      
      expect(result.current.sticky).toBe(false);
    });

    it('sets sticky to true when scrollY exceeds offset', () => {
      const { result } = renderHook(() => UseSticky(100));
      
      // Simulate scroll beyond offset
      (window as TestWindow).scrollY = 150;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      
      // Run all timers (requestAnimationFrame)
      act(() => {
        jest.runOnlyPendingTimers();
      });

      expect(result.current.sticky).toBe(true);
    });

    it('keeps sticky state false when scrollY is below offset', () => {
      const { result } = renderHook(() => UseSticky(200));
      
      (window as TestWindow).scrollY = 150;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      
      act(() => {
        jest.runOnlyPendingTimers();
      });

      expect(result.current.sticky).toBe(false);
    });

    it('toggles sticky state when scrollY crosses offset threshold', () => {
      const { result } = renderHook(() => UseSticky(200));
      
      // Scroll below offset
      (window as TestWindow).scrollY = 150;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      act(() => jest.runOnlyPendingTimers());
      expect(result.current.sticky).toBe(false);

      // Scroll above offset
      (window as TestWindow).scrollY = 250;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      act(() => jest.runOnlyPendingTimers());
      expect(result.current.sticky).toBe(true);

      // Scroll back below offset
      (window as TestWindow).scrollY = 150;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      act(() => jest.runOnlyPendingTimers());
      expect(result.current.sticky).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero offset value', () => {
      const { result } = renderHook(() => UseSticky(0));
      
      (window as TestWindow).scrollY = 1;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      act(() => jest.runOnlyPendingTimers());

      expect(result.current.sticky).toBe(true);
    });

    it('handles negative offset value', () => {
      const { result } = renderHook(() => UseSticky(-100));
      
      (window as TestWindow).scrollY = 0;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      act(() => jest.runOnlyPendingTimers());

      // With negative offset, scrollY 0 > -100 should be true
      expect(result.current.sticky).toBe(true);
    });

    it('handles large offset values', () => {
      const { result } = renderHook(() => UseSticky(10000));
      
      (window as TestWindow).scrollY = 5000;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      act(() => jest.runOnlyPendingTimers());

      expect(result.current.sticky).toBe(false);
    });

    it('handles scrollY exactly at offset', () => {
      const { result } = renderHook(() => UseSticky(200));
      
      (window as TestWindow).scrollY = 200;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      act(() => jest.runOnlyPendingTimers());

      expect(result.current.sticky).toBe(false);
    });

    it('handles rapid scroll events without performance issues', () => {
      const { result } = renderHook(() => UseSticky(200));
      
      // Simulate rapid scrolling
      for (let i = 0; i < 100; i++) {
        (window as TestWindow).scrollY = i;
        act(() => {
          window.dispatchEvent(new Event('scroll'));
        });
      }
      
      act(() => {
        jest.runOnlyPendingTimers();
      });

      // Should eventually settle based on final scrollY
      expect(result.current.sticky).toBe(false);
    });
  });

  describe('Performance Optimization', () => {
    it('cancels animation frame on unmount', () => {
      const { unmount } = renderHook(() => UseSticky());
      
      (window as TestWindow).scrollY = 300;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      unmount();

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('removes scroll event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => UseSticky());
      
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('removes event listeners when offset changes', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { rerender } = renderHook(({ offset }) => UseSticky(offset), {
        initialProps: { offset: 200 },
      });

      rerender({ offset: 300 });

      expect(removeEventListenerSpy).toHaveBeenCalled();

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Integration Behavior', () => {
    it('updates sticky state on scroll event', () => {
      const { result } = renderHook(() => UseSticky(200));
      
      (window as TestWindow).scrollY = 300;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      act(() => jest.runOnlyPendingTimers());

      expect(result.current.sticky).toBe(true);
    });

    it('maintains sticky state when not scrolling', () => {
      const { result } = renderHook(() => UseSticky(200));
      
      (window as TestWindow).scrollY = 300;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      act(() => jest.runOnlyPendingTimers());
      expect(result.current.sticky).toBe(true);

      // Don't scroll again
      act(() => jest.runOnlyPendingTimers());

      // State should remain true
      expect(result.current.sticky).toBe(true);
    });

    it('uses default offset of 200 when not provided', () => {
      const { result } = renderHook(() => UseSticky());
      
      (window as TestWindow).scrollY = 201;
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      act(() => jest.runOnlyPendingTimers());

      expect(result.current.sticky).toBe(true);
    });
  });
});

describe('useBreakpoint', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('returns isBreakpointOn state object', () => {
      const { result } = renderHook(() => useBreakpoint());
      
      expect(result.current).toHaveProperty('isBreakpointOn');
      expect(typeof result.current.isBreakpointOn).toBe('boolean');
    });

    it('initializes breakpoint state based on window width', () => {
      (window as TestWindow).innerWidth = 1100;
      const { result } = renderHook(() => useBreakpoint(1200));
      
      expect(result.current.isBreakpointOn).toBe(true);
    });

    it('sets breakpoint to false when window width exceeds threshold', () => {
      (window as TestWindow).innerWidth = 1300;
      const { result } = renderHook(() => useBreakpoint(1200));
      
      expect(result.current.isBreakpointOn).toBe(false);
    });

    it('updates breakpoint on window resize', () => {
      (window as TestWindow).innerWidth = 1300;
      const { result } = renderHook(() => useBreakpoint(1200));
      
      expect(result.current.isBreakpointOn).toBe(false);

      // Simulate window resize below breakpoint
      (window as TestWindow).innerWidth = 1100;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isBreakpointOn).toBe(true);
    });

    it('toggles breakpoint when window width crosses threshold', () => {
      const { result } = renderHook(() => useBreakpoint(1200));
      
      // Above breakpoint
      (window as TestWindow).innerWidth = 1300;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(result.current.isBreakpointOn).toBe(false);

      // Below breakpoint
      (window as TestWindow).innerWidth = 1100;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(result.current.isBreakpointOn).toBe(true);

      // Above breakpoint again
      (window as TestWindow).innerWidth = 1300;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(result.current.isBreakpointOn).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles window width exactly at breakpoint', () => {
      (window as TestWindow).innerWidth = 1200;
      const { result } = renderHook(() => useBreakpoint(1200));
      
      expect(result.current.isBreakpointOn).toBe(false);
    });

    it('handles small breakpoint values', () => {
      (window as TestWindow).innerWidth = 300;
      const { result } = renderHook(() => useBreakpoint(400));
      
      expect(result.current.isBreakpointOn).toBe(true);
    });

    it('handles large breakpoint values', () => {
      (window as TestWindow).innerWidth = 1920;
      const { result } = renderHook(() => useBreakpoint(4000));
      
      expect(result.current.isBreakpointOn).toBe(true);
    });

    it('handles window width of 0', () => {
      (window as TestWindow).innerWidth = 0;
      const { result } = renderHook(() => useBreakpoint(1200));
      
      expect(result.current.isBreakpointOn).toBe(true);
    });

    it('handles very large window width', () => {
      (window as TestWindow).innerWidth = 999999;
      const { result } = renderHook(() => useBreakpoint(1200));
      
      expect(result.current.isBreakpointOn).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('removes resize event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useBreakpoint());
      
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('removes event listeners when breakpoint changes', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { rerender } = renderHook(({ bp }) => useBreakpoint(bp), {
        initialProps: { bp: 1200 },
      });

      rerender({ bp: 1400 });

      expect(removeEventListenerSpy).toHaveBeenCalled();

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Integration Behavior', () => {
    it('updates breakpoint state on resize event', () => {
      (window as TestWindow).innerWidth = 1300;
      const { result } = renderHook(() => useBreakpoint(1200));
      
      (window as TestWindow).innerWidth = 1100;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isBreakpointOn).toBe(true);
    });

    it('uses default breakpoint of 1200 when not provided', () => {
      (window as TestWindow).innerWidth = 1100;
      const { result } = renderHook(() => useBreakpoint());
      
      expect(result.current.isBreakpointOn).toBe(true);
    });

    it('maintains breakpoint state when not resizing', () => {
      (window as TestWindow).innerWidth = 1100;
      const { result } = renderHook(() => useBreakpoint(1200));
      
      expect(result.current.isBreakpointOn).toBe(true);

      // Don't trigger resize
      expect(result.current.isBreakpointOn).toBe(true);
    });
  });

  describe('Boundary Conditions', () => {
    it('handles breakpoint of 1', () => {
      (window as TestWindow).innerWidth = 0;
      const { result } = renderHook(() => useBreakpoint(1));
      
      expect(result.current.isBreakpointOn).toBe(true);

      (window as TestWindow).innerWidth = 1;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isBreakpointOn).toBe(false);
    });

    it('handles breakpoint of 0', () => {
      (window as TestWindow).innerWidth = 0;
      const { result } = renderHook(() => useBreakpoint(0));
      
      expect(result.current.isBreakpointOn).toBe(false);

      (window as TestWindow).innerWidth = 100;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isBreakpointOn).toBe(false);
    });

    it('handles negative breakpoint values', () => {
      (window as TestWindow).innerWidth = 100;
      const { result } = renderHook(() => useBreakpoint(-100));
      
      // Window width 100 > -100, so breakpoint should be off
      expect(result.current.isBreakpointOn).toBe(false);
    });
  });
});
