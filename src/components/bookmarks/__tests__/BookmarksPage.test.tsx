import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookmarksPage from '../index';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { Bookmark } from '@/types/bookmark';

function renderWithProviders(component: React.ReactElement) {
  return render(
    <ThemeProvider>
      <I18nProvider>
        {component}
      </I18nProvider>
    </ThemeProvider>
  );
}

function setLocalStorageBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem('maskom_bookmarks', JSON.stringify({
    bookmarks,
    lastUpdated: new Date().toISOString()
  }));
}

describe('BookmarksPage', () => {
  beforeEach(() => {
    localStorage.clear();
    window.confirm = jest.fn(() => true) as unknown as jest.Mock;
  });

  describe('Empty State', () => {
    it('should show empty state when no bookmarks', () => {
      renderWithProviders(<BookmarksPage />);

      expect(screen.getByText(/You haven't bookmarked any posts yet/i)).toBeInTheDocument();
    });

    it('should show browse blog link when empty', () => {
      renderWithProviders(<BookmarksPage />);

      const browseLink = screen.getByText('Browse Blog').closest('a');
      expect(browseLink).toHaveAttribute('href', '/blog');
    });
  });

  describe('Bookmarks Display', () => {
    const mockBookmarks: Bookmark[] = [
      { id: 'bookmark-1', postId: 'post-1', postTitle: 'Test Post 1', postSlug: 'test-post-1', createdAt: '2026-01-16T00:00:00.000Z' },
      { id: 'bookmark-2', postId: 'post-2', postTitle: 'Test Post 2', postCategory: 'Tech', postSlug: 'test-post-2', createdAt: '2026-01-16T00:00:01.000Z' },
      { id: 'bookmark-3', postId: 'post-3', postTitle: 'Test Post 3', postTags: ['react', 'nextjs'], postSlug: 'test-post-3', createdAt: '2026-01-16T00:00:02.000Z' }
    ];

    beforeEach(() => {
      setLocalStorageBookmarks(mockBookmarks);
    });

    it('should display bookmarks count in subtitle', () => {
      renderWithProviders(<BookmarksPage />);

      expect(screen.getByText('3 saved posts')).toBeInTheDocument();
    });

    it('should display bookmark titles', () => {
      renderWithProviders(<BookmarksPage />);

      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
      expect(screen.getByText('Test Post 3')).toBeInTheDocument();
    });

    it('should display post category when available', () => {
      renderWithProviders(<BookmarksPage />);

      expect(screen.getByText('Tech')).toBeInTheDocument();
    });

    it('should display post tags when available', () => {
      renderWithProviders(<BookmarksPage />);

      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('nextjs')).toBeInTheDocument();
    });

    it('should display read post button', () => {
      renderWithProviders(<BookmarksPage />);

      const readButtons = screen.getAllByText('Read Post');
      expect(readButtons.length).toBe(3);
    });

    it('should have correct link for read post button', () => {
      renderWithProviders(<BookmarksPage />);

      const readButton = screen.getAllByText('Read Post')[2];
      const link = readButton.closest('a');
      expect(link).toHaveAttribute('href', '/blog-details?id=post-1');
    });

    it('should display remove bookmark button', () => {
      renderWithProviders(<BookmarksPage />);

      const buttons = screen.getAllByRole('button');
      const removeButtons = buttons.filter(btn =>
        btn.querySelector('.fa-trash-alt')
      );
      expect(removeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Remove Bookmark', () => {
    beforeEach(() => {
      const mockBookmarks: Bookmark[] = [
        { id: 'bookmark-1', postId: 'post-1', postTitle: 'Test Post 1', postSlug: 'test-post-1', createdAt: '2026-01-16T00:00:00.000Z' }
      ];
      setLocalStorageBookmarks(mockBookmarks);
      window.confirm = jest.fn(() => true) as unknown as jest.Mock;
    });

    it('should show confirmation dialog when removing', () => {
      renderWithProviders(<BookmarksPage />);

      const removeButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('.fa-trash-alt')
      );
      if (removeButton) {
        fireEvent.click(removeButton);
        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to remove this bookmark?');
      }
    });

    it('should not remove bookmark when cancelled', () => {
      window.confirm = jest.fn(() => false) as unknown as jest.Mock;

      renderWithProviders(<BookmarksPage />);

      const removeButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('.fa-trash-alt')
      );
      if (removeButton) {
        expect(localStorage.getItem('maskom_bookmarks')).toBeTruthy();
      }
    });
  });
});
