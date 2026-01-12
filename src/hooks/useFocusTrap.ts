import { useEffect, useRef, RefObject } from "react";

interface UseFocusTrapOptions {
    isActive?: boolean;
    returnFocus?: boolean;
    focusSelector?: string;
}

export const useFocusTrap = (
    containerRef: RefObject<HTMLElement>,
    options: UseFocusTrapOptions = {}
) => {
    const {
        isActive = true,
        returnFocus = true,
        focusSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    } = options;

    const previousActiveElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) {
            return;
        }

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            focusSelector
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (!firstFocusable) {
            return;
        }

        previousActiveElementRef.current = document.activeElement as HTMLElement;
        firstFocusable.focus();

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') {
                return;
            }

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isActive) {
                previousActiveElementRef.current?.focus();
            }
        };

        container.addEventListener('keydown', handleTabKey);
        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            container.removeEventListener('keydown', handleTabKey);
            document.removeEventListener('keydown', handleEscapeKey);

            if (returnFocus && previousActiveElementRef.current) {
                previousActiveElementRef.current.focus();
            }
        };
    }, [isActive, containerRef, focusSelector, returnFocus]);

    return { containerRef };
};
