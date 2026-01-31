'use client';

import React, { useState, useEffect, memo } from 'react';
import { bookmarkExists, addBookmark, removeBookmark } from '@/utils/bookmarkStorage';

export interface BookmarkButtonProps {
  postId: string;
  postTitle: string;
  postSlug?: string;
  postCategory?: string;
  postTags?: string[];
  className?: string;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export default memo(function BookmarkButton({
  postId,
  postTitle,
  postSlug,
  postCategory,
  postTags,
  className = '',
  onBookmarkChange
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const bookmarked = bookmarkExists(postId);
    setIsBookmarked(bookmarked);
  }, [postId]);

  const handleToggleBookmark = () => {
    if (isToggling) return;

    setIsToggling(true);

    if (isBookmarked) {
      const removed = removeBookmark(postId);
      if (removed) {
        setIsBookmarked(false);
        onBookmarkChange?.(false);
      }
    } else {
      addBookmark({
        postId,
        postTitle,
        postSlug,
        postCategory,
        postTags
      });
      setIsBookmarked(true);
      onBookmarkChange?.(true);
    }

    setIsToggling(false);
  };

  if (!mounted) {
    return (
      <button
        className={className}
        aria-label="Bookmark this post"
        disabled
      >
        <i className="far fa-bookmark" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      className={className}
      onClick={handleToggleBookmark}
      aria-label={isToggling ? 'Saving bookmark...' : (isBookmarked ? 'Remove from bookmarks' : 'Bookmark this post')}
      aria-pressed={isBookmarked}
      aria-busy={isToggling}
      disabled={isToggling}
      type="button"
    >
      {isToggling ? (
        <i className="fas fa-spinner fa-spin" aria-hidden="true" />
      ) : isBookmarked ? (
        <i className="fas fa-bookmark" aria-hidden="true" />
      ) : (
        <i className="far fa-bookmark" aria-hidden="true" />
      )}
    </button>
  );
});
