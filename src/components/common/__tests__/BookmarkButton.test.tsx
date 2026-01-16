import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookmarkButton from '../BookmarkButton';
import { addBookmark } from '@/utils/bookmarkStorage';

describe('BookmarkButton', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should render bookmark button', () => {
      render(<BookmarkButton postId="post-1" postTitle="Test Post" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should show outline bookmark when post is not bookmarked', async () => {
      render(<BookmarkButton postId="post-1" postTitle="Test Post" />);

      await waitFor(() => {
        const button = screen.getByLabelText('Bookmark this post');
        expect(button).toBeInTheDocument();
      });
    });

    it('should show filled bookmark when post is bookmarked', async () => {
      addBookmark({ postId: 'post-1', postTitle: 'Test Post' });

      render(<BookmarkButton postId="post-1" postTitle="Test Post" />);

      await waitFor(() => {
        const button = screen.getByLabelText('Remove from bookmarks');
        expect(button).toBeInTheDocument();
      });
    });

    it('should apply custom className', () => {
      render(<BookmarkButton postId="post-1" postTitle="Test Post" className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Bookmark Functionality', () => {
    it('should add bookmark when clicking on unbookmarked post', async () => {
      render(<BookmarkButton postId="post-1" postTitle="Test Post" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByLabelText('Remove from bookmarks')).toBeInTheDocument();
      });
    });

    it('should remove bookmark when clicking on bookmarked post', async () => {
      addBookmark({ postId: 'post-1', postTitle: 'Test Post' });

      render(<BookmarkButton postId="post-1" postTitle="Test Post" />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByLabelText('Bookmark this post')).toBeInTheDocument();
      });
    });
  });

  describe('Callback', () => {
    it('should call onBookmarkChange with true when bookmark is added', async () => {
      const onBookmarkChange = jest.fn();

      render(
        <BookmarkButton
          postId="post-1"
          postTitle="Test Post"
          onBookmarkChange={onBookmarkChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onBookmarkChange).toHaveBeenCalledWith(true);
      });
    });

    it('should call onBookmarkChange with false when bookmark is removed', async () => {
      addBookmark({ postId: 'post-1', postTitle: 'Test Post' });

      const onBookmarkChange = jest.fn();

      render(
        <BookmarkButton
          postId="post-1"
          postTitle="Test Post"
          onBookmarkChange={onBookmarkChange}
        />
      );

      await waitFor(async () => {
        const button = screen.getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
          expect(onBookmarkChange).toHaveBeenCalledWith(false);
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-pressed attribute', () => {
      render(<BookmarkButton postId="post-1" postTitle="Test Post" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have type="button"', () => {
      render(<BookmarkButton postId="post-1" postTitle="Test Post" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should have aria-hidden on icon', () => {
      render(<BookmarkButton postId="post-1" postTitle="Test Post" />);

      const button = screen.getByRole('button');
      const icon = button.querySelector('i');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Additional Props', () => {
    it('should accept postSlug prop', () => {
      render(
        <BookmarkButton
          postId="post-1"
          postTitle="Test Post"
          postSlug="test-post"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should accept postCategory prop', () => {
      render(
        <BookmarkButton
          postId="post-1"
          postTitle="Test Post"
          postCategory="Technology"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should accept postTags prop', () => {
      render(
        <BookmarkButton
          postId="post-1"
          postTitle="Test Post"
          postTags={['tech', 'test']}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});
