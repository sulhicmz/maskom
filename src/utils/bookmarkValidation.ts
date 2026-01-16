import { Bookmark } from '@/types/bookmark';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateBookmark(bookmark: Bookmark): ValidationResult {
  const errors: string[] = [];

  if (!bookmark.id || typeof bookmark.id !== 'string') {
    errors.push('Bookmark must have a valid id');
  }

  if (!bookmark.postId || typeof bookmark.postId !== 'string') {
    errors.push('Bookmark must have a valid postId');
  }

  if (!bookmark.postTitle || typeof bookmark.postTitle !== 'string') {
    errors.push('Bookmark must have a valid postTitle');
  }

  if (bookmark.postSlug !== undefined && typeof bookmark.postSlug !== 'string') {
    errors.push('postSlug must be a string if provided');
  }

  if (bookmark.postCategory !== undefined && typeof bookmark.postCategory !== 'string') {
    errors.push('postCategory must be a string if provided');
  }

  if (bookmark.postTags !== undefined && !Array.isArray(bookmark.postTags)) {
    errors.push('postTags must be an array if provided');
  }

  if (!bookmark.createdAt || typeof bookmark.createdAt !== 'string') {
    errors.push('Bookmark must have a valid createdAt timestamp');
  } else {
    const date = new Date(bookmark.createdAt);
    if (isNaN(date.getTime())) {
      errors.push('createdAt must be a valid ISO date string');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validatePostId(postId: string): boolean {
  return typeof postId === 'string' && postId.trim().length > 0;
}
