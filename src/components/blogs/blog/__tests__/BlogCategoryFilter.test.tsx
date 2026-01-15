import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogCategoryFilter from '../BlogCategoryFilter';

describe('BlogCategoryFilter', () => {
  describe('Rendering', () => {
    it('should render category filter with title', () => {
      render(
        <BlogCategoryFilter selectedCategory="" onCategoryChange={jest.fn()} />
      );

      expect(screen.getByText('Kategori')).toBeInTheDocument();
    });

    it('should render dropdown select element', () => {
      const mockOnCategoryChange = jest.fn();
      render(
        <BlogCategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );

      const select = screen.getByLabelText('Filter kategori artikel');
      expect(select).toBeInTheDocument();
      expect(select.tagName.toLowerCase()).toBe('select');
    });

    it('should render "Semua Kategori" as first option', () => {
      const mockOnCategoryChange = jest.fn();
      render(
        <BlogCategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );

      const select = screen.getByLabelText('Filter kategori artikel') as HTMLSelectElement;
      const firstOption = select.options[0];

      expect(firstOption).toHaveValue('');
      expect(firstOption.textContent).toBe('Semua Kategori');
    });

    it('should render all category options', () => {
      const mockOnCategoryChange = jest.fn();
      render(
        <BlogCategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );

      const select = screen.getByLabelText('Filter kategori artikel') as HTMLSelectElement;

      expect(select.options.length).toBe(7);
      expect(select.options[1]).toHaveTextContent('Konektivitas Terkelola');
      expect(select.options[2]).toHaveTextContent('Keamanan Jaringan');
      expect(select.options[3]).toHaveTextContent('Operasional & Dukungan');
      expect(select.options[4]).toHaveTextContent('Transformasi Digital');
      expect(select.options[5]).toHaveTextContent('Infrastruktur Cloud');
      expect(select.options[6]).toHaveTextContent('IoT & Edge');
    });

    it('should not render reset button when no category selected', () => {
      const mockOnCategoryChange = jest.fn();
      render(
        <BlogCategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );

      expect(screen.queryByLabelText('Hapus filter kategori')).not.toBeInTheDocument();
    });

    it('should render reset button when category selected', () => {
      const mockOnCategoryChange = jest.fn();
      render(
        <BlogCategoryFilter
          selectedCategory="Konektivitas Terkelola"
          onCategoryChange={mockOnCategoryChange}
        />
      );

      expect(screen.getByLabelText('Hapus filter kategori')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
  });

  describe('Category Selection', () => {
    it('should call onCategoryChange when option selected', () => {
      const mockOnCategoryChange = jest.fn();
      render(
        <BlogCategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );

      const select = screen.getByLabelText('Filter kategori artikel');

      fireEvent.change(select, { target: { value: 'Konektivitas Terkelola' } });

      expect(mockOnCategoryChange).toHaveBeenCalledWith('Konektivitas Terkelola');
    });

    it('should call onCategoryChange with empty string when "Semua Kategori" selected', () => {
      const mockOnCategoryChange = jest.fn();
      render(
        <BlogCategoryFilter
          selectedCategory="Konektivitas Terkelola"
          onCategoryChange={mockOnCategoryChange}
        />
      );

      const select = screen.getByLabelText('Filter kategori artikel');

      fireEvent.change(select, { target: { value: '' } });

      expect(mockOnCategoryChange).toHaveBeenCalledWith('');
    });

    it('should update select value when selectedCategory prop changes', () => {
      const mockOnCategoryChange = jest.fn();
      const { rerender } = render(
        <BlogCategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );

      const select = screen.getByLabelText('Filter kategori artikel') as HTMLSelectElement;
      expect(select.value).toBe('');

      rerender(
        <BlogCategoryFilter
          selectedCategory="Konektivitas Terkelola"
          onCategoryChange={mockOnCategoryChange}
        />
      );

      expect(select.value).toBe('Konektivitas Terkelola');
    });
  });

  describe('Reset Filter', () => {
    it('should clear selected category when reset button clicked', () => {
      const mockOnCategoryChange = jest.fn();
      render(
        <BlogCategoryFilter
          selectedCategory="Konektivitas Terkelola"
          onCategoryChange={mockOnCategoryChange}
        />
      );

      const resetBtn = screen.getByLabelText('Hapus filter kategori');
      fireEvent.click(resetBtn);

      expect(mockOnCategoryChange).toHaveBeenCalledWith('');
    });

    it('should hide reset button after clearing category', () => {
      const mockOnCategoryChange = jest.fn();
      const { rerender } = render(
        <BlogCategoryFilter
          selectedCategory="Konektivitas Terkelola"
          onCategoryChange={mockOnCategoryChange}
        />
      );

      const resetBtn = screen.getByLabelText('Hapus filter kategori');
      expect(resetBtn).toBeInTheDocument();

      fireEvent.click(resetBtn);

      rerender(
        <BlogCategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );

      expect(screen.queryByLabelText('Hapus filter kategori')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on select element', () => {
      const mockOnCategoryChange = jest.fn();
      render(
        <BlogCategoryFilter selectedCategory="" onCategoryChange={mockOnCategoryChange} />
      );

      const select = screen.getByLabelText('Filter kategori artikel');
      expect(select).toBeInTheDocument();
    });

    it('should have proper aria-label on reset button', () => {
      const mockOnCategoryChange = jest.fn();
      render(
        <BlogCategoryFilter
          selectedCategory="Konektivitas Terkelola"
          onCategoryChange={mockOnCategoryChange}
        />
      );

      const resetBtn = screen.getByLabelText('Hapus filter kategori');
      expect(resetBtn).toBeInTheDocument();
    });
  });
});
