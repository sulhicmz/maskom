import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogSearch from '../BlogSearch';

describe('BlogSearch', () => {
  describe('Rendering', () => {
    it('should render search input with placeholder', () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="" onSearchChange={mockOnSearchChange} />);

      expect(screen.getByPlaceholderText('Cari artikel...')).toBeInTheDocument();
      expect(screen.getByLabelText('Cari artikel')).toBeInTheDocument();
    });

    it('should render search input with initial value', () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="test query" onSearchChange={mockOnSearchChange} />);

      expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
    });

    it('should not render clear button when query is empty', () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="" onSearchChange={mockOnSearchChange} />);

      expect(screen.queryByLabelText('Hapus pencarian')).not.toBeInTheDocument();
    });

    it('should render clear button when query has value', () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="test" onSearchChange={mockOnSearchChange} />);

      expect(screen.getByLabelText('Hapus pencarian')).toBeInTheDocument();
    });

    it('should render clear button with ✕ symbol', () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="test" onSearchChange={mockOnSearchChange} />);

      const clearBtn = screen.getByLabelText('Hapus pencarian');
      expect(clearBtn).toHaveTextContent('✕');
    });
  });

  describe('Input Handling', () => {
    it('should call onSearchChange with debounced input', async () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="" onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Cari artikel...');

      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockOnSearchChange).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('test');
      }, { timeout: 500 });
    });

    it('should update local state immediately on input change', () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="" onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Cari artikel...') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'test' } });

      expect(input.value).toBe('test');
    });

    it('should debounce search to avoid excessive calls', async () => {
      const mockOnSearchChange = jest.fn();
      jest.useFakeTimers();
      render(<BlogSearch searchQuery="" onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Cari artikel...');

      fireEvent.change(input, { target: { value: 't' } });
      fireEvent.change(input, { target: { value: 'te' } });
      fireEvent.change(input, { target: { value: 'tes' } });
      fireEvent.change(input, { target: { value: 'test' } });

      jest.advanceTimersByTime(299);
      expect(mockOnSearchChange).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
      expect(mockOnSearchChange).toHaveBeenCalledWith('test');

      jest.useRealTimers();
    });

    it('should cancel previous debounce on new input', async () => {
      const mockOnSearchChange = jest.fn();
      jest.useFakeTimers();
      render(<BlogSearch searchQuery="" onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Cari artikel...');

      fireEvent.change(input, { target: { value: 'first' } });

      jest.advanceTimersByTime(200);

      fireEvent.change(input, { target: { value: 'second' } });

      jest.advanceTimersByTime(300);

      expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
      expect(mockOnSearchChange).toHaveBeenCalledWith('second');

      jest.useRealTimers();
    });
  });

  describe('Clear Search', () => {
    it('should clear search when clear button clicked', () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="test" onSearchChange={mockOnSearchChange} />);

      const clearBtn = screen.getByLabelText('Hapus pencarian');
      fireEvent.click(clearBtn);

      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });

    it('should update local state to empty when clear clicked', () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="test" onSearchChange={mockOnSearchChange} />);

      const clearBtn = screen.getByLabelText('Hapus pencarian');
      const input = screen.getByPlaceholderText('Cari artikel...') as HTMLInputElement;

      fireEvent.click(clearBtn);

      expect(input.value).toBe('');
    });

    it('should hide clear button after clearing search', () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="test" onSearchChange={mockOnSearchChange} />);

      const clearBtn = screen.getByLabelText('Hapus pencarian');
      fireEvent.click(clearBtn);

      expect(screen.queryByLabelText('Hapus pencarian')).not.toBeInTheDocument();
    });
  });

  describe('Sync with External State', () => {
    it('should update local query when searchQuery prop changes', () => {
      const mockOnSearchChange = jest.fn();
      const { rerender } = render(
        <BlogSearch searchQuery="first" onSearchChange={mockOnSearchChange} />
      );

      const input = screen.getByPlaceholderText('Cari artikel...') as HTMLInputElement;
      expect(input.value).toBe('first');

      rerender(<BlogSearch searchQuery="second" onSearchChange={mockOnSearchChange} />);

      expect(input.value).toBe('second');
    });

    it('should preserve local typing when prop unchanged', () => {
      const mockOnSearchChange = jest.fn();
      render(<BlogSearch searchQuery="" onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Cari artikel...') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'local input' } });

      expect(input.value).toBe('local input');
    });
  });
});
