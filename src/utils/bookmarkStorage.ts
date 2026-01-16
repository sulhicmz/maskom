import { Bookmark, BookmarkStorage } from '@/types/bookmark';

const STORAGE_KEY = 'maskom_bookmarks';

function getStorageData(): BookmarkStorage {
  if (typeof window === 'undefined') {
    return { bookmarks: [], lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: BookmarkStorage = JSON.parse(stored);
      return data;
    }
  } catch (error) {
    console.error('Error reading bookmarks from storage:', error);
  }

  return { bookmarks: [], lastUpdated: new Date().toISOString() };
}

function setStorageData(data: BookmarkStorage): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving bookmarks to storage:', error);
  }
}

export function addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark {
  const storageData = getStorageData();
  const id = `${bookmark.postId}-${Date.now()}`;
  const newBookmark: Bookmark = {
    ...bookmark,
    id,
    createdAt: new Date().toISOString()
  };

  storageData.bookmarks.push(newBookmark);
  storageData.lastUpdated = new Date().toISOString();
  setStorageData(storageData);

  return newBookmark;
}

export function removeBookmark(postId: string): boolean {
  const storageData = getStorageData();
  const initialLength = storageData.bookmarks.length;
  storageData.bookmarks = storageData.bookmarks.filter(b => b.postId !== postId);

  if (storageData.bookmarks.length < initialLength) {
    storageData.lastUpdated = new Date().toISOString();
    setStorageData(storageData);
    return true;
  }

  return false;
}

export function getBookmarks(): Bookmark[] {
  const storageData = getStorageData();
  return storageData.bookmarks.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function bookmarkExists(postId: string): boolean {
  const storageData = getStorageData();
  return storageData.bookmarks.some(b => b.postId === postId);
}

export function clearBookmarks(): void {
  const storageData: BookmarkStorage = {
    bookmarks: [],
    lastUpdated: new Date().toISOString()
  };
  setStorageData(storageData);
}

export function getBookmarkCount(): number {
  return getStorageData().bookmarks.length;
}
