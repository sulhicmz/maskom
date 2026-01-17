import { render, screen } from '@testing-library/react';
import AutoSaveIndicator from '../AutoSaveIndicator';

describe('AutoSaveIndicator', () => {
   describe('rendering behavior', () => {
      test('should render nothing when lastSavedAt is null and not auto-saving', () => {
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={null} isAutoSaving={false} />
         );
         
         expect(container.firstChild).toBeNull();
      });

      test('should render saving indicator when isAutoSaving is true', () => {
         render(
            <AutoSaveIndicator lastSavedAt={null} isAutoSaving={true} />
         );
         
         expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
         expect(screen.getByText('💾')).toBeInTheDocument();
      });

      test('should render saved indicator with lastSavedAt when not auto-saving', () => {
         const lastSavedAt = new Date(Date.now() - 120000);
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={lastSavedAt} isAutoSaving={false} />
         );
         
         const statusSpan = container.querySelector('.auto-save-status');
         expect(statusSpan).toHaveTextContent(/Disimpan/);
         expect(statusSpan).toHaveTextContent(/2 menit yang lalu/);
         expect(screen.getByText('✓')).toBeInTheDocument();
      });

      test('should apply custom className when provided', () => {
         const { container } = render(
            <AutoSaveIndicator 
               lastSavedAt={new Date()} 
               isAutoSaving={false} 
               className="custom-class" 
            />
         );
         
         const indicator = container.firstChild as HTMLElement;
         expect(indicator).toHaveClass('auto-save-indicator');
         expect(indicator).toHaveClass('custom-class');
      });
   });

   describe('time formatting', () => {
      test('should display "baru saja" for saves within last minute', () => {
         const lastSavedAt = new Date(Date.now() - 30000);
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={lastSavedAt} isAutoSaving={false} />
         );
         
         const statusSpan = container.querySelector('.auto-save-status');
         expect(statusSpan).toHaveTextContent(/Disimpan/);
         expect(statusSpan).toHaveTextContent(/baru saja/);
      });

      test('should display minutes for saves within last hour', () => {
         const lastSavedAt = new Date(Date.now() - 1800000);
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={lastSavedAt} isAutoSaving={false} />
         );
         
         const statusSpan = container.querySelector('.auto-save-status');
         expect(statusSpan).toHaveTextContent(/Disimpan/);
         expect(statusSpan).toHaveTextContent(/30 menit yang lalu/);
      });

      test('should display hours for saves within last day', () => {
         const lastSavedAt = new Date(Date.now() - 7200000);
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={lastSavedAt} isAutoSaving={false} />
         );
         
         const statusSpan = container.querySelector('.auto-save-status');
         expect(statusSpan).toHaveTextContent(/Disimpan/);
         expect(statusSpan).toHaveTextContent(/2 jam yang lalu/);
      });

      test('should display days for saves older than 24 hours', () => {
         const lastSavedAt = new Date(Date.now() - 172800000);
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={lastSavedAt} isAutoSaving={false} />
         );
         
         const statusSpan = container.querySelector('.auto-save-status');
         expect(statusSpan).toHaveTextContent(/Disimpan/);
         expect(statusSpan).toHaveTextContent(/2 hari yang lalu/);
      });
   });

   describe('state priority', () => {
      test('should show saving status even when lastSavedAt is provided', () => {
         const lastSavedAt = new Date();
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={lastSavedAt} isAutoSaving={true} />
         );
         
         expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
         const statusSpan = container.querySelector('.auto-save-status');
         expect(statusSpan).not.toHaveTextContent(/Disimpan/);
      });
   });

   describe('accessibility', () => {
      test('should have role="status" for accessibility', () => {
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={new Date()} isAutoSaving={false} />
         );
         
         const indicator = container.firstChild as HTMLElement;
         expect(indicator).toHaveAttribute('role', 'status');
      });

      test('should have aria-live="polite" for screen readers', () => {
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={new Date()} isAutoSaving={false} />
         );
         
         const indicator = container.firstChild as HTMLElement;
         expect(indicator).toHaveAttribute('aria-live', 'polite');
      });

      test('should have aria-hidden="true" on icon elements', () => {
         render(
            <AutoSaveIndicator lastSavedAt={new Date()} isAutoSaving={true} />
         );
         
         const icon = screen.getByText('💾');
         expect(icon).toHaveAttribute('aria-hidden', 'true');
      });

      test('should have aria-hidden="true" on checkmark icon', () => {
         render(
            <AutoSaveIndicator lastSavedAt={new Date()} isAutoSaving={false} />
         );
         
         const icon = screen.getByText('✓');
         expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
   });

   describe('memoization', () => {
      test('should have displayName set for debugging', () => {
         expect(AutoSaveIndicator.displayName).toBe('AutoSaveIndicator');
      });

      test('should re-render when lastSavedAt changes', () => {
         const { rerender, container } = render(
            <AutoSaveIndicator lastSavedAt={new Date(Date.now() - 30000)} isAutoSaving={false} />
         );
         
         let statusSpan = container.querySelector('.auto-save-status');
         expect(statusSpan).toHaveTextContent(/Disimpan/);
         expect(statusSpan).toHaveTextContent(/baru saja/);
         
         const newTime = new Date(Date.now() - 7200000);
         rerender(
            <AutoSaveIndicator lastSavedAt={newTime} isAutoSaving={false} />
         );
         
         statusSpan = container.querySelector('.auto-save-status');
         expect(statusSpan).toHaveTextContent(/Disimpan/);
         expect(statusSpan).toHaveTextContent(/2 jam yang lalu/);
      });
   });

   describe('CSS classes', () => {
      test('should have correct CSS classes for saving state', () => {
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={null} isAutoSaving={true} />
         );
         
         const indicator = container.firstChild as HTMLElement;
         expect(indicator).toHaveClass('auto-save-indicator');
         
         const statusSpan = indicator.querySelector('.auto-save-status');
         expect(statusSpan).toHaveClass('auto-save-saving');
         
         const iconSpan = indicator.querySelector('.auto-save-icon');
         expect(iconSpan).toBeInTheDocument();
      });

      test('should have correct CSS classes for saved state', () => {
         const { container } = render(
            <AutoSaveIndicator lastSavedAt={new Date()} isAutoSaving={false} />
         );
         
         const indicator = container.firstChild as HTMLElement;
         expect(indicator).toHaveClass('auto-save-indicator');
         
         const statusSpan = indicator.querySelector('.auto-save-status');
         expect(statusSpan).toHaveClass('auto-save-saved');
         
         const iconSpan = indicator.querySelector('.auto-save-icon');
         expect(iconSpan).toBeInTheDocument();
      });
   });
});
