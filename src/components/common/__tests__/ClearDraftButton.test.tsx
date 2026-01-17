import { render, screen, fireEvent } from '@testing-library/react';
import ClearDraftButton from '../ClearDraftButton';

describe('ClearDraftButton', () => {
   const mockOnClearDraft = jest.fn();

   beforeEach(() => {
      mockOnClearDraft.mockClear();
      global.confirm = jest.fn();
   });

   afterEach(() => {
      jest.restoreAllMocks();
   });

   describe('rendering behavior', () => {
      test('should render button with correct text', () => {
         render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         expect(screen.getByText('🗑️ Hapus Draft')).toBeInTheDocument();
      });

      test('should apply custom className when provided', () => {
         const { container } = render(
            <ClearDraftButton 
               hasDraft={true} 
               onClearDraft={mockOnClearDraft} 
               className="custom-class" 
            />
         );
         
         const button = container.querySelector('button');
         expect(button).toHaveClass('clear-draft-btn');
         expect(button).toHaveClass('custom-class');
      });

      test('should have correct type attribute', () => {
         const { container } = render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         expect(button).toHaveAttribute('type', 'button');
      });
   });

   describe('disabled state', () => {
      test('should be disabled when hasDraft is false', () => {
         const { container } = render(
            <ClearDraftButton hasDraft={false} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         expect(button).toBeDisabled();
      });

      test('should be disabled when disabled prop is true', () => {
         const { container } = render(
            <ClearDraftButton 
               hasDraft={true} 
               onClearDraft={mockOnClearDraft} 
               disabled={true} 
            />
         );
         
         const button = container.querySelector('button');
         expect(button).toBeDisabled();
      });

      test('should be enabled when hasDraft is true and disabled is false', () => {
         const { container } = render(
            <ClearDraftButton 
               hasDraft={true} 
               onClearDraft={mockOnClearDraft} 
               disabled={false} 
            />
         );
         
         const button = container.querySelector('button');
         expect(button).not.toBeDisabled();
      });

      test('should be disabled when both hasDraft is false and disabled is true', () => {
         const { container } = render(
            <ClearDraftButton 
               hasDraft={false} 
               onClearDraft={mockOnClearDraft} 
               disabled={true} 
            />
         );
         
         const button = container.querySelector('button');
         expect(button).toBeDisabled();
      });
   });

   describe('click behavior', () => {
      test('should show confirmation dialog when clicked and hasDraft is true', () => {
         global.confirm = jest.fn(() => true);
         
         const { container } = render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         fireEvent.click(button);
         
         expect(global.confirm).toHaveBeenCalledWith('Apakah Anda yakin ingin menghapus draft ini?');
      });

      test('should call onClearDraft when user confirms dialog', () => {
         global.confirm = jest.fn(() => true);
         
         const { container } = render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         fireEvent.click(button);
         
         expect(global.confirm).toHaveBeenCalledTimes(1);
         expect(mockOnClearDraft).toHaveBeenCalledTimes(1);
      });

      test('should not call onClearDraft when user cancels dialog', () => {
         global.confirm = jest.fn(() => false);
         
         const { container } = render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         fireEvent.click(button);
         
         expect(global.confirm).toHaveBeenCalledTimes(1);
         expect(mockOnClearDraft).not.toHaveBeenCalled();
      });

      test('should not show dialog or call onClearDraft when hasDraft is false', () => {
         global.confirm = jest.fn();
         
         const { container } = render(
            <ClearDraftButton hasDraft={false} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         fireEvent.click(button);
         
         expect(global.confirm).not.toHaveBeenCalled();
         expect(mockOnClearDraft).not.toHaveBeenCalled();
      });

      test('should not show dialog or call onClearDraft when disabled is true', () => {
         global.confirm = jest.fn();
         
         const { container } = render(
            <ClearDraftButton 
               hasDraft={true} 
               onClearDraft={mockOnClearDraft} 
               disabled={true} 
            />
         );
         
         const button = container.querySelector('button');
         fireEvent.click(button);
         
         expect(global.confirm).not.toHaveBeenCalled();
         expect(mockOnClearDraft).not.toHaveBeenCalled();
      });
   });

   describe('confirmation dialog content', () => {
      test('should show correct confirmation message in Indonesian', () => {
         global.confirm = jest.fn(() => true);
         
         const { container } = render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         fireEvent.click(button);
         
         expect(global.confirm).toHaveBeenCalledWith('Apakah Anda yakin ingin menghapus draft ini?');
      });
   });

   describe('accessibility', () => {
      test('should have aria-label for screen readers', () => {
         const { container } = render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         expect(button).toHaveAttribute('aria-label', 'Hapus draft');
      });

      test('should have title attribute for tooltip', () => {
         const { container } = render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         expect(button).toHaveAttribute('title', 'Hapus draft yang tersimpan');
      });

      test('should maintain accessibility attributes when disabled', () => {
         const { container } = render(
            <ClearDraftButton 
               hasDraft={false} 
               onClearDraft={mockOnClearDraft} 
            />
         );
         
         const button = container.querySelector('button');
         expect(button).toHaveAttribute('aria-label', 'Hapus draft');
         expect(button).toHaveAttribute('title', 'Hapus draft yang tersimpan');
         expect(button).toBeDisabled();
      });
   });

   describe('memoization', () => {
      test('should have displayName set for debugging', () => {
         expect(ClearDraftButton.displayName).toBe('ClearDraftButton');
      });

      test('should re-render when hasDraft changes', () => {
         const { container, rerender } = render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         let button = container.querySelector('button');
         expect(button).not.toBeDisabled();
         
         rerender(
            <ClearDraftButton hasDraft={false} onClearDraft={mockOnClearDraft} />
         );
         
         button = container.querySelector('button');
         expect(button).toBeDisabled();
      });

      test('should re-render when disabled prop changes', () => {
         const { container, rerender } = render(
            <ClearDraftButton 
               hasDraft={true} 
               onClearDraft={mockOnClearDraft} 
               disabled={false} 
            />
         );
         
         let button = container.querySelector('button');
         expect(button).not.toBeDisabled();
         
         rerender(
            <ClearDraftButton 
               hasDraft={true} 
               onClearDraft={mockOnClearDraft} 
               disabled={true} 
            />
         );
         
         button = container.querySelector('button');
         expect(button).toBeDisabled();
      });
   });

   describe('CSS classes', () => {
      test('should have base CSS class', () => {
         const { container } = render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         expect(button).toHaveClass('clear-draft-btn');
      });

      test('should combine custom className with base class', () => {
         const { container } = render(
            <ClearDraftButton 
               hasDraft={true} 
               onClearDraft={mockOnClearDraft} 
               className="btn-primary btn-large" 
            />
         );
         
         const button = container.querySelector('button');
         expect(button).toHaveClass('clear-draft-btn');
         expect(button).toHaveClass('btn-primary');
         expect(button).toHaveClass('btn-large');
      });
   });

   describe('edge cases', () => {
      test('should handle empty className gracefully', () => {
         const { container } = render(
            <ClearDraftButton 
               hasDraft={true} 
               onClearDraft={mockOnClearDraft} 
               className="" 
            />
         );
         
         const button = container.querySelector('button');
         expect(button).toHaveClass('clear-draft-btn');
         expect(button.className).toBe('clear-draft-btn ');
      });

      test('should handle rapid clicks correctly', () => {
         global.confirm = jest.fn(() => true);
         
         const { container } = render(
            <ClearDraftButton hasDraft={true} onClearDraft={mockOnClearDraft} />
         );
         
         const button = container.querySelector('button');
         
         fireEvent.click(button);
         fireEvent.click(button);
         fireEvent.click(button);
         
         expect(global.confirm).toHaveBeenCalledTimes(3);
         expect(mockOnClearDraft).toHaveBeenCalledTimes(3);
      });
   });
});
