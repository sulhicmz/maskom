import { renderHook, act } from '@testing-library/react';
import { useTabs } from '../useTabs';

describe('useTabs', () => {
  describe('Default Behavior', () => {
    it('should initialize with default tab 0', () => {
      const { result } = renderHook(() => useTabs());
      expect(result.current.activeTab).toBe(0);
    });

    it('should return activeTab, setActiveTab, handleTabClick, handleKeyDown', () => {
      const { result } = renderHook(() => useTabs());
      expect(result.current.activeTab).toBeDefined();
      expect(result.current.setActiveTab).toBeDefined();
      expect(result.current.handleTabClick).toBeDefined();
      expect(result.current.handleKeyDown).toBeDefined();
    });
  });

  describe('Tab Navigation', () => {
    it('should update activeTab when handleTabClick is called', () => {
      const { result } = renderHook(() => useTabs({ tabCount: 3 }));
      
      act(() => {
        result.current.handleTabClick(1);
      });
      
      expect(result.current.activeTab).toBe(1);
      
      act(() => {
        result.current.handleTabClick(2);
      });
      
      expect(result.current.activeTab).toBe(2);
    });

    it('should navigate to next tab on ArrowRight key', () => {
      const { result } = renderHook(() => useTabs({ tabCount: 3 }));
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLButtonElement>;
      
      act(() => {
        result.current.handleKeyDown(mockEvent, 0);
      });
      
      expect(result.current.activeTab).toBe(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should wrap to first tab on ArrowRight at last tab', () => {
      const { result } = renderHook(() => useTabs({ tabCount: 3 }));
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLButtonElement>;
      
      act(() => {
        result.current.setActiveTab(2);
      });
      
      act(() => {
        result.current.handleKeyDown(mockEvent, 2);
      });
      
      expect(result.current.activeTab).toBe(0);
    });

    it('should navigate to previous tab on ArrowLeft key', () => {
      const { result } = renderHook(() => useTabs({ tabCount: 3 }));
      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLButtonElement>;
      
      act(() => {
        result.current.setActiveTab(2);
      });
      
      act(() => {
        result.current.handleKeyDown(mockEvent, 2);
      });
      
      expect(result.current.activeTab).toBe(1);
    });

    it('should wrap to last tab on ArrowLeft at first tab', () => {
      const { result } = renderHook(() => useTabs({ tabCount: 3 }));
      const mockEvent = {
        key: 'ArrowLeft',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLButtonElement>;
      
      act(() => {
        result.current.handleKeyDown(mockEvent, 0);
      });
      
      expect(result.current.activeTab).toBe(2);
    });

    it('should activate tab on Enter key', () => {
      const { result } = renderHook(() => useTabs({ tabCount: 3 }));
      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLButtonElement>;
      
      act(() => {
        result.current.handleKeyDown(mockEvent, 1);
      });
      
      expect(result.current.activeTab).toBe(1);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should activate tab on Space key', () => {
      const { result } = renderHook(() => useTabs({ tabCount: 3 }));
      const mockEvent = {
        key: ' ',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLButtonElement>;
      
      act(() => {
        result.current.handleKeyDown(mockEvent, 2);
      });
      
      expect(result.current.activeTab).toBe(2);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Custom Options', () => {
    it('should initialize with custom default tab', () => {
      const { result } = renderHook(() => useTabs({ defaultTab: 2, tabCount: 3 }));
      expect(result.current.activeTab).toBe(2);
    });

    it('should not handle keyboard navigation when disabled', () => {
      const { result } = renderHook(() => useTabs({ 
        tabCount: 3,
        enableKeyboardNavigation: false 
      }));
      const mockEvent = {
        key: 'ArrowRight',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLButtonElement>;
      
      act(() => {
        result.current.handleKeyDown(mockEvent, 0);
      });
      
      expect(result.current.activeTab).toBe(0);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('setActiveTab', () => {
    it('should set activeTab directly', () => {
      const { result } = renderHook(() => useTabs());
      
      act(() => {
        result.current.setActiveTab(1);
      });
      
      expect(result.current.activeTab).toBe(1);
    });

    it('should set activeTab to 0 directly', () => {
      const { result } = renderHook(() => useTabs());
      
      act(() => {
        result.current.setActiveTab(0);
      });
      
      expect(result.current.activeTab).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tabCount of 1', () => {
      const { result } = renderHook(() => useTabs({ tabCount: 1 }));
      expect(result.current.activeTab).toBe(0);
    });

    it('should handle large tabCount', () => {
      const { result } = renderHook(() => useTabs({ tabCount: 10 }));
      expect(result.current.activeTab).toBe(0);
      
      act(() => {
        result.current.handleTabClick(9);
      });
      
      expect(result.current.activeTab).toBe(9);
    });

    it('should handle unknown keys in handleKeyDown', () => {
      const { result } = renderHook(() => useTabs({ tabCount: 3 }));
      const mockEvent = {
        key: 'Tab',
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLButtonElement>;
      
      act(() => {
        result.current.handleKeyDown(mockEvent, 0);
      });
      
      expect(result.current.activeTab).toBe(0);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });
});
