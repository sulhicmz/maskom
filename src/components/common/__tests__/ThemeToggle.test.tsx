import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

function renderWithTheme() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Rendering', () => {
    it('renders without errors', () => {
      renderWithTheme();
      const toggleButton = screen.getByRole('button', { name: /switch to/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('renders moon icon in light theme', async () => {
      renderWithTheme();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('renders sun icon in dark theme', async () => {
      localStorage.setItem('maskom-theme', 'dark');

      renderWithTheme();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const toggleButton = screen.getByRole('button', { name: /switch to light mode/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('has correct CSS class', () => {
      renderWithTheme();
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveClass('theme-toggle-btn');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label in light theme', async () => {
      renderWithTheme();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    it('has proper aria-label in dark theme', async () => {
      localStorage.setItem('maskom-theme', 'dark');

      renderWithTheme();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const toggleButton = screen.getByRole('button', { name: /switch to light mode/i });
      expect(toggleButton).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('has proper title attribute in light theme', async () => {
      renderWithTheme();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('title', 'Switch to dark mode');
    });

    it('has proper title attribute in dark theme', async () => {
      localStorage.setItem('maskom-theme', 'dark');

      renderWithTheme();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('title', 'Switch to light mode');
    });

    it('is keyboard accessible', () => {
      renderWithTheme();
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeEnabled();
    });

    it('has aria-hidden on icon', () => {
      renderWithTheme();
      const icon = screen.getByLabelText(/Switch to/i).querySelector('.theme-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Functionality', () => {
    it('toggles theme when clicked', async () => {
      renderWithTheme();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
      fireEvent.click(toggleButton);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    });

    it('changes icon on theme toggle', async () => {
      const { container } = renderWithTheme();

      await new Promise(resolve => setTimeout(resolve, 100));

      let icon = container.querySelector('.theme-icon-moon');
      expect(icon).toBeInTheDocument();

      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      await new Promise(resolve => setTimeout(resolve, 100));

      icon = container.querySelector('.theme-icon-sun');
      expect(icon).toBeInTheDocument();
    });

    it('persists theme preference to localStorage', async () => {
      renderWithTheme();

      await new Promise(resolve => setTimeout(resolve, 100));

      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(localStorage.getItem('maskom-theme')).toBe('dark');
    });

    it('updates DOM data-theme attribute', async () => {
      renderWithTheme();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Visual Appearance', () => {
    it('has correct CSS class', () => {
      renderWithTheme();
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveClass('theme-toggle-btn');
    });
  });

  describe('Integration', () => {
    it('works with ThemeProvider context', async () => {
      renderWithTheme();
      const toggleButton = screen.getByRole('button');
      
      expect(toggleButton).toBeInTheDocument();
      
      fireEvent.click(toggleButton);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem('maskom-theme')).toBe('dark');
    });

    it('maintains theme across re-renders', async () => {
      const { rerender } = renderWithTheme();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const initialButton = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(initialButton).toBeInTheDocument();
      
      rerender(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const updatedButton = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(updatedButton).toBeInTheDocument();
    });
  });
});
