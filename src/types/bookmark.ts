export interface Bookmark {
  id: string;
  postId: string;
  postTitle: string;
  postSlug?: string;
  postCategory?: string;
  postTags?: string[];
  createdAt: string;
}

export interface BookmarkStorage {
  bookmarks: Bookmark[];
  lastUpdated: string;
}
