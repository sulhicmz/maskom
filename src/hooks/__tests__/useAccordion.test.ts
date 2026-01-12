import { renderHook, act } from "@testing-library/react";
import { useAccordion } from "../useAccordion";

describe("useAccordion", () => {
  describe("Default Behavior", () => {
    it("should initialize with null activeId by default", () => {
      const { result } = renderHook(() => useAccordion());
      
      expect(result.current.activeId).toBeNull();
    });

    it("should initialize with specified initialId", () => {
      const { result } = renderHook(() => useAccordion({ initialId: 5 }));
      
      expect(result.current.activeId).toBe(5);
    });
  });

  describe("Toggle Functionality", () => {
    it("should set activeId when toggling non-active item", () => {
      const { result } = renderHook(() => useAccordion());
      
      act(() => {
        result.current.toggle(1);
      });
      
      expect(result.current.activeId).toBe(1);
    });

    it("should clear activeId when toggling active item", () => {
      const { result } = renderHook(() => useAccordion({ initialId: 1 }));
      
      act(() => {
        result.current.toggle(1);
      });
      
      expect(result.current.activeId).toBeNull();
    });

    it("should switch to new item when toggling different item", () => {
      const { result } = renderHook(() => useAccordion({ initialId: 1 }));
      
      act(() => {
        result.current.toggle(2);
      });
      
      expect(result.current.activeId).toBe(2);
    });
  });

  describe("setActiveId Functionality", () => {
    it("should set activeId to specified value", () => {
      const { result } = renderHook(() => useAccordion());
      
      act(() => {
        result.current.setActiveId(10);
      });
      
      expect(result.current.activeId).toBe(10);
    });

    it("should set activeId to null", () => {
      const { result } = renderHook(() => useAccordion({ initialId: 5 }));
      
      act(() => {
        result.current.setActiveId(null);
      });
      
      expect(result.current.activeId).toBeNull();
    });
  });

  describe("Custom Options", () => {
    it("should support allowMultiple option (reserved for future)", () => {
      const { result } = renderHook(() => useAccordion({ allowMultiple: true }));
      
      expect(result.current.activeId).toBeNull();
      expect(() => result.current.toggle(1)).not.toThrow();
    });

    it("should support initialId option", () => {
      const { result } = renderHook(() => useAccordion({ initialId: 42 }));
      
      expect(result.current.activeId).toBe(42);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero as valid id", () => {
      const { result } = renderHook(() => useAccordion());
      
      act(() => {
        result.current.toggle(0);
      });
      
      expect(result.current.activeId).toBe(0);
    });

    it("should handle negative numbers as valid ids", () => {
      const { result } = renderHook(() => useAccordion());
      
      act(() => {
        result.current.toggle(-5);
      });
      
      expect(result.current.activeId).toBe(-5);
    });

    it("should handle rapid toggle operations", () => {
      const { result } = renderHook(() => useAccordion());
      
      act(() => {
        result.current.toggle(1);
        result.current.toggle(2);
        result.current.toggle(3);
      });
      
      expect(result.current.activeId).toBe(3);
    });
  });
});
