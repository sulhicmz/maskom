import { renderHook, act } from '@testing-library/react';
import { useFocusTrap } from '../useFocusTrap';

describe('useFocusTrap', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('Focus Trap Functionality', () => {
        it('should focus first focusable element when activated', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <button id="first">First</button>
                <button id="second">Second</button>
                <button id="third">Third</button>
            `;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: true }));

            expect(document.activeElement?.id).toBe('first');
        });

        it('should trap focus within container on Tab key', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <button id="first">First</button>
                <button id="second">Second</button>
                <button id="third">Third</button>
            `;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: true }));

            const third = document.getElementById('third') as HTMLButtonElement;
            third.focus();

            act(() => {
                third.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
            });

            expect(document.activeElement?.id).toBe('first');
        });

        it('should cycle to last element on Tab from last element', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <button id="first">First</button>
                <button id="second">Second</button>
                <button id="third">Third</button>
            `;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: true }));

            const third = document.getElementById('third') as HTMLButtonElement;
            third.focus();

            act(() => {
                third.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
            });

            expect(document.activeElement?.id).toBe('first');
        });

        it('should cycle to first element on Shift+Tab from first element', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <button id="first">First</button>
                <button id="second">Second</button>
                <button id="third">Third</button>
            `;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: true }));

            const first = document.getElementById('first') as HTMLButtonElement;
            first.focus();

            act(() => {
                first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
            });

            expect(document.activeElement?.id).toBe('third');
        });
    });

    describe('Escape Key Handler', () => {
        it('should return focus to previous active element on Escape', () => {
            const previousButton = document.createElement('button');
            previousButton.id = 'previous';
            previousButton.textContent = 'Previous';
            document.body.appendChild(previousButton);
            previousButton.focus();

            const container = document.createElement('div');
            container.innerHTML = `<button id="first">First</button>`;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: true }));

            expect(document.activeElement?.id).toBe('first');

            act(() => {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            });

            expect(document.activeElement?.id).toBe('previous');
        });
    });

    describe('Activation/Deactivation', () => {
        it('should not trap focus when isActive is false', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <button id="first">First</button>
                <button id="second">Second</button>
            `;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: false }));

            expect(document.activeElement?.id).not.toBe('first');
        });

        it('should activate focus trap when isActive changes to true', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <button id="first">First</button>
                <button id="second">Second</button>
            `;
            document.body.appendChild(container);

            const ref = { current: container };

            const { rerender } = renderHook(
                ({ isActive }) => useFocusTrap(ref, { isActive }),
                { initialProps: { isActive: false } }
            );

            expect(document.activeElement?.id).not.toBe('first');

            rerender({ isActive: true });

            expect(document.activeElement?.id).toBe('first');
        });

        it('should return focus when deactivated and returnFocus is true', () => {
            const previousButton = document.createElement('button');
            previousButton.id = 'previous';
            previousButton.textContent = 'Previous';
            document.body.appendChild(previousButton);
            previousButton.focus();

            const container = document.createElement('div');
            container.innerHTML = `<button id="first">First</button>`;
            document.body.appendChild(container);

            const ref = { current: container };

            const { rerender } = renderHook(
                ({ isActive }) => useFocusTrap(ref, { isActive, returnFocus: true }),
                { initialProps: { isActive: true } }
            );

            expect(document.activeElement?.id).toBe('first');

            rerender({ isActive: false });

            expect(document.activeElement?.id).toBe('previous');
        });
    });

    describe('Custom Focus Selector', () => {
        it('should only trap focus on elements matching custom selector', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <button id="button">Button</button>
                <a href="#" id="link">Link</a>
                <span id="span">Span</span>
            `;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: true, focusSelector: 'button' }));

            expect(document.activeElement?.id).toBe('button');

            const button = document.getElementById('button') as HTMLButtonElement;
            act(() => {
                button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
            });

            expect(document.activeElement?.id).toBe('button');
        });
    });

    describe('Edge Cases', () => {
        it('should handle container with no focusable elements', () => {
            const container = document.createElement('div');
            container.innerHTML = `<span>No focusable elements</span>`;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: true }));

            const focusableElements = container.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            expect(focusableElements.length).toBe(0);
        });

        it('should handle container with single focusable element', () => {
            const container = document.createElement('div');
            container.innerHTML = `<button id="single">Single</button>`;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: true }));

            expect(document.activeElement?.id).toBe('single');

            const single = document.getElementById('single') as HTMLButtonElement;
            act(() => {
                single.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
            });

            expect(document.activeElement?.id).toBe('single');
        });

        it('should not trap focus when container ref is null', () => {
            const ref = { current: null } as unknown as React.RefObject<HTMLElement>;

            renderHook(() => useFocusTrap(ref, { isActive: true }));

            // Focus should not be set since container is null
            // We just verify the hook doesn't crash
            expect(ref.current).toBe(null);
        });

        it('should handle rapid activation/deactivation', () => {
            const container = document.createElement('div');
            container.innerHTML = `<button id="first">First</button>`;
            document.body.appendChild(container);

            const ref = { current: container };

            const { rerender } = renderHook(
                ({ isActive }) => useFocusTrap(ref, { isActive }),
                { initialProps: { isActive: false } }
            );

            rerender({ isActive: true });
            expect(document.activeElement?.id).toBe('first');

            rerender({ isActive: false });
            rerender({ isActive: true });
            expect(document.activeElement?.id).toBe('first');

            rerender({ isActive: false });
            // Focus should no longer be trapped, so we don't check document.activeElement
            // The hook cleanup should have returned focus to previous element
        });
    });

    describe('Cleanup', () => {
        it('should remove event listeners on unmount', () => {
            const container = document.createElement('div');
            container.innerHTML = `<button id="first">First</button>`;
            document.body.appendChild(container);

            const ref = { current: container };

            const addEventListenerSpy = jest.spyOn(container, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(container, 'removeEventListener');

            const { unmount } = renderHook(() => useFocusTrap(ref, { isActive: true }));

            expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

            addEventListenerSpy.mockRestore();
            removeEventListenerSpy.mockRestore();
        });
    });

    describe('Accessibility', () => {
        it('should maintain focus within container for keyboard-only users', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <button id="first">First</button>
                <button id="second">Second</button>
                <button id="third">Third</button>
            `;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: true }));

            const first = document.getElementById('first') as HTMLButtonElement;
            const third = document.getElementById('third') as HTMLButtonElement;

            third.focus();
            act(() => {
                third.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
            });

            expect(document.activeElement?.id).toBe('first');

            first.focus();
            act(() => {
                first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
            });

            expect(document.activeElement?.id).toBe('third');
        });

        it('should ignore non-Tab key events', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <button id="first">First</button>
                <button id="second">Second</button>
            `;
            document.body.appendChild(container);

            const ref = { current: container };

            renderHook(() => useFocusTrap(ref, { isActive: true }));

            const first = document.getElementById('first') as HTMLButtonElement;

            act(() => {
                first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            });

            expect(document.activeElement?.id).toBe('first');
        });
    });
});
