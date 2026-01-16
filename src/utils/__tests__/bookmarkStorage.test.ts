import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { addBookmark, removeBookmark, getBookmarks, bookmarkExists, clearBookmarks, getBookmarkCount } from '../bookmarkStorage';
import { validateBookmark, validatePostId } from '../bookmarkValidation';

describe('bookmarkStorage', () => {
  const STORAGE_KEY = 'maskom_bookmarks';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('addBookmark', () => {
    it('should add a bookmark successfully', () => {
      const bookmark = {
        postId: 'post-1',
        postTitle: 'Test Post',
        postSlug: 'test-post',
        postCategory: 'Technology',
        postTags: ['tech', 'test']
      };

      const addedBookmark = addBookmark(bookmark);

      expect(addedBookmark).toHaveProperty('id');
      expect(addedBookmark.postId).toBe('post-1');
      expect(addedBookmark.postTitle).toBe('Test Post');
      expect(addedBookmark).toHaveProperty('createdAt');
    });

    it('should store bookmark in localStorage', () => {
      const bookmark = {
        postId: 'post-1',
        postTitle: 'Test Post'
      };

      addBookmark(bookmark);

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const data = JSON.parse(stored!);
      expect(data.bookmarks).toHaveLength(1);
      expect(data.bookmarks[0].postId).toBe('post-1');
    });

    it('should add multiple bookmarks', () => {
      const bookmark1 = { postId: 'post-1', postTitle: 'Post 1' };
      const bookmark2 = { postId: 'post-2', postTitle: 'Post 2' };

      addBookmark(bookmark1);
      addBookmark(bookmark2);

      const bookmarks = getBookmarks();
      expect(bookmarks).toHaveLength(2);
    });

    it('should generate unique IDs for bookmarks', async () => {
      const bookmark = { postId: 'post-1', postTitle: 'Test Post' };

      const bookmark1 = addBookmark(bookmark);
      await new Promise(resolve => setTimeout(resolve, 1));
      const bookmark2 = addBookmark(bookmark);

      expect(bookmark1.id).not.toBe(bookmark2.id);
    });

    it('should create timestamps in ISO format', () => {
      const bookmark = { postId: 'post-1', postTitle: 'Test Post' };

      const addedBookmark = addBookmark(bookmark);

      expect(() => new Date(addedBookmark.createdAt)).not.toThrow();
    });
  });

  describe('removeBookmark', () => {
    it('should remove a bookmark successfully', () => {
      const bookmark = { postId: 'post-1', postTitle: 'Test Post' };

      addBookmark(bookmark);
      expect(bookmarkExists('post-1')).toBe(true);

      const removed = removeBookmark('post-1');

      expect(removed).toBe(true);
      expect(bookmarkExists('post-1')).toBe(false);
    });

    it('should return false when bookmark does not exist', () => {
      const removed = removeBookmark('non-existent-post');

      expect(removed).toBe(false);
    });

    it('should remove only the specified bookmark', () => {
      const bookmark1 = { postId: 'post-1', postTitle: 'Post 1' };
      const bookmark2 = { postId: 'post-2', postTitle: 'Post 2' };

      addBookmark(bookmark1);
      addBookmark(bookmark2);

      removeBookmark('post-1');

      const bookmarks = getBookmarks();
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].postId).toBe('post-2');
    });

    it('should update lastUpdated timestamp', async () => {
      const bookmark = { postId: 'post-1', postTitle: 'Test Post' };

      addBookmark(bookmark);
      const addedData = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      const addedLastUpdated = new Date(addedData.lastUpdated).getTime();

      await new Promise(resolve => setTimeout(resolve, 10));
      removeBookmark('post-1');

      const removedData = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      const removedLastUpdated = new Date(removedData.lastUpdated).getTime();
      expect(removedLastUpdated).toBeGreaterThanOrEqual(addedLastUpdated);
    });
  });

  describe('getBookmarks', () => {
    it('should return empty array when no bookmarks exist', () => {
      const bookmarks = getBookmarks();

      expect(bookmarks).toEqual([]);
      expect(bookmarks).toHaveLength(0);
    });

    it('should return all bookmarks sorted by createdAt (newest first)', async () => {
      const bookmark1 = { postId: 'post-1', postTitle: 'Post 1' };
      const bookmark2 = { postId: 'post-2', postTitle: 'Post 2' };
      const bookmark3 = { postId: 'post-3', postTitle: 'Post 3' };

      addBookmark(bookmark1);
      await new Promise(resolve => setTimeout(resolve, 10));
      addBookmark(bookmark2);
      await new Promise(resolve => setTimeout(resolve, 10));
      addBookmark(bookmark3);

      const bookmarks = getBookmarks();

      expect(bookmarks).toHaveLength(3);
      expect(bookmarks[0].postId).toBe('post-3');
      expect(bookmarks[1].postId).toBe('post-2');
      expect(bookmarks[2].postId).toBe('post-1');
    });

    it('should not modify original storage data', () => {
      const bookmark = { postId: 'post-1', postTitle: 'Test Post' };

      addBookmark(bookmark);

      const bookmarks1 = getBookmarks();
      const bookmarks2 = getBookmarks();

      expect(bookmarks1).toEqual(bookmarks2);
    });
  });

  describe('bookmarkExists', () => {
    it('should return true when bookmark exists', () => {
      const bookmark = { postId: 'post-1', postTitle: 'Test Post' };

      addBookmark(bookmark);

      expect(bookmarkExists('post-1')).toBe(true);
    });

    it('should return false when bookmark does not exist', () => {
      expect(bookmarkExists('non-existent-post')).toBe(false);
    });

    it('should check by postId only', () => {
      const bookmark = { postId: 'post-1', postTitle: 'Test Post' };

      addBookmark(bookmark);

      expect(bookmarkExists('post-1')).toBe(true);
    });
  });

  describe('clearBookmarks', () => {
    it('should clear all bookmarks', () => {
      const bookmark1 = { postId: 'post-1', postTitle: 'Post 1' };
      const bookmark2 = { postId: 'post-2', postTitle: 'Post 2' };

      addBookmark(bookmark1);
      addBookmark(bookmark2);

      clearBookmarks();

      const bookmarks = getBookmarks();
      expect(bookmarks).toHaveLength(0);
    });

    it('should update lastUpdated timestamp', () => {
      const bookmark = { postId: 'post-1', postTitle: 'Test Post' };

      addBookmark(bookmark);

      clearBookmarks();

      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(data).toHaveProperty('lastUpdated');
    });
  });

  describe('getBookmarkCount', () => {
    it('should return 0 when no bookmarks exist', () => {
      const count = getBookmarkCount();

      expect(count).toBe(0);
    });

    it('should return correct bookmark count', () => {
      const bookmark1 = { postId: 'post-1', postTitle: 'Post 1' };
      const bookmark2 = { postId: 'post-2', postTitle: 'Post 2' };
      const bookmark3 = { postId: 'post-3', postTitle: 'Post 3' };

      addBookmark(bookmark1);
      addBookmark(bookmark2);
      addBookmark(bookmark3);

      const count = getBookmarkCount();

      expect(count).toBe(3);
    });
  });

  describe('LocalStorage Error Handling', () => {
    it('should handle localStorage quota exceeded error gracefully', () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        (error as unknown as { name: string }).name = 'QuotaExceededError';
        throw error;
      });

      const bookmark = { postId: 'post-1', postTitle: 'Test Post' };
      
      expect(() => addBookmark(bookmark)).not.toThrow();
      
      const bookmarks = getBookmarks();
      expect(bookmarks).toHaveLength(0);

      mockSetItem.mockRestore();
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json{');

      const bookmarks = getBookmarks();
      
      expect(bookmarks).toEqual([]);
      expect(bookmarks).toHaveLength(0);
    });

    it('should handle localStorage.getItem throwing error', () => {
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const bookmarks = getBookmarks();
      
      expect(bookmarks).toEqual([]);
      expect(bookmarks).toHaveLength(0);

      mockGetItem.mockRestore();
    });

    it('should return empty array when localStorage is empty', () => {
      localStorage.removeItem(STORAGE_KEY);

      const bookmarks = getBookmarks();
      
      expect(bookmarks).toEqual([]);
      expect(bookmarks).toHaveLength(0);
    });

    it('should handle localStorage.setItem throwing error on addBookmark', () => {
      let setItemCallCount = 0;
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        setItemCallCount++;
        if (setItemCallCount === 1) {
          throw new Error('Storage error');
        }
      });

      const bookmark = { postId: 'post-1', postTitle: 'Test Post' };
      
      expect(() => addBookmark(bookmark)).not.toThrow();

      mockSetItem.mockRestore();
    });

    it('should handle localStorage.setItem throwing error on removeBookmark', () => {
      addBookmark({ postId: 'post-1', postTitle: 'Test Post' });
      
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = removeBookmark('post-1');
      
      expect(result).toBe(true);

      mockSetItem.mockRestore();
      
      const bookmarks = getBookmarks();
      expect(bookmarks.length).toBe(1);
      expect(bookmarks[0].postId).toBe('post-1');
    });

    it('should handle localStorage.setItem throwing error on clearBookmarks', () => {
      addBookmark({ postId: 'post-1', postTitle: 'Test Post' });
      
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearBookmarks()).not.toThrow();

      mockSetItem.mockRestore();
    });

    it('should handle bookmarkExists when localStorage throws error', () => {
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const exists = bookmarkExists('post-1');
      
      expect(exists).toBe(false);

      mockGetItem.mockRestore();
    });

    it('should handle getBookmarkCount when localStorage throws error', () => {
      const mockGetItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const count = getBookmarkCount();
      
      expect(count).toBe(0);

      mockGetItem.mockRestore();
    });
  });
});

describe('bookmarkValidation', () => {
  describe('validateBookmark', () => {
    it('should validate a complete bookmark', () => {
      const bookmark = {
        id: 'bookmark-1',
        postId: 'post-1',
        postTitle: 'Test Post',
        postSlug: 'test-post',
        postCategory: 'Technology',
        postTags: ['tech', 'test'],
        createdAt: '2026-01-16T00:00:00.000Z'
      };

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate bookmark with minimal fields', () => {
      const bookmark = {
        id: 'bookmark-1',
        postId: 'post-1',
        postTitle: 'Test Post',
        createdAt: '2026-01-16T00:00:00.000Z'
      };

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject bookmark without id', () => {
      const bookmark = {
        id: '',
        postId: 'post-1',
        postTitle: 'Test Post',
        createdAt: '2026-01-16T00:00:00.000Z'
      };

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bookmark must have a valid id');
    });

    it('should reject bookmark without postId', () => {
      const bookmark = {
        id: 'bookmark-1',
        postId: '',
        postTitle: 'Test Post',
        createdAt: '2026-01-16T00:00:00.000Z'
      };

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bookmark must have a valid postId');
    });

    it('should reject bookmark without postTitle', () => {
      const bookmark = {
        id: 'bookmark-1',
        postId: 'post-1',
        postTitle: '',
        createdAt: '2026-01-16T00:00:00.000Z'
      };

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bookmark must have a valid postTitle');
    });

    it('should reject bookmark with invalid postSlug type', () => {
      const bookmark = {
        id: 'bookmark-1',
        postId: 'post-1',
        postTitle: 'Test Post',
        postSlug: 123 as unknown,
        createdAt: '2026-01-16T00:00:00.000Z'
      };

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('postSlug must be a string if provided');
    });

    it('should reject bookmark with invalid postCategory type', () => {
      const bookmark = {
        id: 'bookmark-1',
        postId: 'post-1',
        postTitle: 'Test Post',
        postCategory: 123 as unknown,
        createdAt: '2026-01-16T00:00:00.000Z'
      };

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('postCategory must be a string if provided');
    });

    it('should reject bookmark with invalid postTags type', () => {
      const bookmark = {
        id: 'bookmark-1',
        postId: 'post-1',
        postTitle: 'Test Post',
        postTags: 'not-an-array' as unknown,
        createdAt: '2026-01-16T00:00:00.000Z'
      };

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('postTags must be an array if provided');
    });

    it('should reject bookmark without createdAt', () => {
      const bookmark = {
        id: 'bookmark-1',
        postId: 'post-1',
        postTitle: 'Test Post',
        createdAt: ''
      };

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bookmark must have a valid createdAt timestamp');
    });

    it('should reject bookmark with invalid createdAt format', () => {
      const bookmark = {
        id: 'bookmark-1',
        postId: 'post-1',
        postTitle: 'Test Post',
        createdAt: 'invalid-date'
      };

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('createdAt must be a valid ISO date string');
    });

    it('should return multiple errors for multiple validation failures', () => {
      const bookmark = {
        id: '',
        postId: '',
        postTitle: '',
        createdAt: 'invalid'
      } as unknown;

      const result = validateBookmark(bookmark);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validatePostId', () => {
    it('should validate a correct postId', () => {
      expect(validatePostId('post-1')).toBe(true);
    });

    it('should validate postId with numbers and hyphens', () => {
      expect(validatePostId('post-123-test')).toBe(true);
    });

    it('should reject empty postId', () => {
      expect(validatePostId('')).toBe(false);
    });

    it('should reject whitespace only postId', () => {
      expect(validatePostId('   ')).toBe(false);
    });

    it('should reject non-string postId', () => {
      expect(validatePostId(123 as never)).toBe(false);
    });

    it('should reject null postId', () => {
      expect(validatePostId(null as never)).toBe(false);
    });

    it('should reject undefined postId', () => {
      expect(validatePostId(undefined as never)).toBe(false);
    });
  });
});
