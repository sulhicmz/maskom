import { useState } from "react";

export interface UseAccordionOptions {
  initialId?: number | null;
  allowMultiple?: boolean;
}

export interface UseAccordionReturn {
  activeId: number | null;
  toggle: (id: number) => void;
  setActiveId: (id: number | null) => void;
}

export function useAccordion(options: UseAccordionOptions = {}): UseAccordionReturn {
  const { initialId = null } = options;

  const [activeId, setActiveId] = useState<number | null>(initialId);

  const toggle = (id: number) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return { activeId, toggle, setActiveId };
}
