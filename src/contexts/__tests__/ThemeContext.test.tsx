import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

function TestComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
      <button onClick={() => setTheme('light')} data-testid="set-light">Set Light</button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">Set Dark</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Initialization', () => {
    it('renders children without errors', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme')).toBeInTheDocument();
    });

    it('initializes with system preference (light) by default', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
    });

    it('initializes with system preference (dark) when system prefers dark', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: true,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });

    it('initializes with stored theme from localStorage', () => {
      localStorage.setItem('maskom-theme', 'dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });

    it('applies theme to DOM element', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });
    });
  });

  describe('Theme Toggle', () => {
    it('toggles theme from light to dark', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
      
      fireEvent.click(screen.getByTestId('toggle'));
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(localStorage.getItem('maskom-theme')).toBe('dark');
      });
    });

    it('toggles theme from dark to light', async () => {
      localStorage.setItem('maskom-theme', 'dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
      
      fireEvent.click(screen.getByTestId('toggle'));
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(localStorage.getItem('maskom-theme')).toBe('light');
      });
    });

    it('persists theme to localStorage on toggle', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      await waitFor(() => {
        expect(localStorage.getItem('maskom-theme')).toBe('light');
      });
      
      fireEvent.click(screen.getByTestId('toggle'));
      
      await waitFor(() => {
        expect(localStorage.getItem('maskom-theme')).toBe('dark');
      });
    });

    it('updates DOM data-theme attribute on toggle', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });
      
      fireEvent.click(screen.getByTestId('toggle'));
      
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });
  });

  describe('Set Theme', () => {
    it('sets theme to light explicitly', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
      
      fireEvent.click(screen.getByTestId('set-dark'));
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
      
      fireEvent.click(screen.getByTestId('set-light'));
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(localStorage.getItem('maskom-theme')).toBe('light');
      });
    });

    it('sets theme to dark explicitly', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
      
      fireEvent.click(screen.getByTestId('set-dark'));
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(localStorage.getItem('maskom-theme')).toBe('dark');
      });
    });
  });

  describe('useTheme Hook', () => {
    it('throws error when used outside ThemeProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      function TestHookOutsideProvider() {
        const { theme } = useTheme();
        return <span>{theme}</span>;
      }

      expect(() => {
        render(<TestHookOutsideProvider />);
      }).toThrow('useTheme must be used within a ThemeProvider');
      
      consoleError.mockRestore();
    });

    it('provides theme value to child components', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
    });

    it('provides toggleTheme function', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      await waitFor(() => {
        const toggleButton = screen.getByTestId('toggle');
        expect(toggleButton).toBeInTheDocument();
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });

    it('provides setTheme function', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      await waitFor(() => {
        const setLightButton = screen.getByTestId('set-light');
        const setDarkButton = screen.getByTestId('set-dark');
        expect(setLightButton).toBeInTheDocument();
        expect(setDarkButton).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles localStorage unavailability gracefully', () => {
      const originalGetItem = Storage.prototype.getItem;
      const originalSetItem = Storage.prototype.setItem;
      
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('localStorage unavailable');
      });
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('localStorage unavailable');
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });

      Storage.prototype.getItem = originalGetItem;
      Storage.prototype.setItem = originalSetItem;
    });

    it('handles invalid stored theme value', () => {
      localStorage.setItem('maskom-theme', 'invalid');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
    });

    it('handles null stored theme value', () => {
      localStorage.setItem('maskom-theme', 'null');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
    });
  });
});
