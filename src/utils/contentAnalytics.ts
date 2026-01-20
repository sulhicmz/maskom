import { InnerBlogPost } from "@/types/data";

export interface ContentMetrics {
  viewCount: number;
  engagementScore: number;
  shareCount: number;
  avgReadTime: number;
  lastViewedAt: string | undefined;
}

export interface EngagementInput {
  commentCount?: number;
  shareCount?: number;
  bookmarkCount?: number;
  viewCount?: number;
  avgReadTime?: number;
}

const SHARE_WEIGHT = 0.4;
const BOOKMARK_WEIGHT = 0.2;
const COMMENT_WEIGHT = 0.1;
const MAX_ENGAGEMENT_SCORE = 100;
const WORDS_PER_MINUTE = 200;

export function calculateEngagementScore(input: EngagementInput): number {
  const { commentCount = 0, shareCount = 0, bookmarkCount = 0, viewCount = 0, avgReadTime = 0 } = input;

  if (viewCount === 0) {
    return 0;
  }

  const shareRate = Math.min(shareCount / viewCount, 1) * 100;
  const bookmarkRate = Math.min(bookmarkCount / viewCount, 1) * 100;
  const commentRate = Math.min(commentCount / viewCount, 1) * 100;
  const readTimeScore = Math.min(avgReadTime / 60 * 20, 100);

  const weightedScore =
    (shareRate * SHARE_WEIGHT) +
    (bookmarkRate * BOOKMARK_WEIGHT) +
    (commentRate * COMMENT_WEIGHT) +
    readTimeScore;

  return Math.min(weightedScore, MAX_ENGAGEMENT_SCORE);
}

export function calculateAvgReadTime(content: string): number {
  if (!content || typeof content !== "string") {
    return 0;
  }

  const words = content.trim().split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;
  const readTimeMinutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  const readTimeSeconds = readTimeMinutes * 60;

  return readTimeSeconds;
}

const VIEW_STORAGE_KEY = "content_views";
const VIEW_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

interface StoredView {
  postId: number;
  viewedAt: number;
}

export function trackContentView(postId: number): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    const views: StoredView[] = stored ? JSON.parse(stored) : [];

    const existingViewIndex = views.findIndex((view) => view.postId === postId);
    const now = Date.now();

    if (existingViewIndex >= 0) {
      views[existingViewIndex].viewedAt = now;
    } else {
      views.push({ postId, viewedAt: now });
    }

    const validViews = views.filter((view) => now - view.viewedAt < VIEW_EXPIRATION_MS);
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(validViews));
  } catch (error) {
    console.error("Failed to track content view:", error);
  }
}

export function getViewedPosts(): StoredView[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const views: StoredView[] = JSON.parse(stored);
    const now = Date.now();
    const validViews = views.filter((view) => now - view.viewedAt < VIEW_EXPIRATION_MS);

    return validViews;
  } catch (error) {
    console.error("Failed to get viewed posts:", error);
    return [];
  }
}

export function clearReadingHistory(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(VIEW_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear reading history:", error);
  }
}

export function getTopPerformingPosts(posts: InnerBlogPost[], limit: number = 10): InnerBlogPost[] {
  const postsWithMetrics = posts.filter(
    (post) => post.status === "published" && typeof post.engagementScore === "number"
  );

  return postsWithMetrics
    .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
    .slice(0, limit);
}

export function getMostViewedPosts(posts: InnerBlogPost[], limit: number = 10): InnerBlogPost[] {
  const postsWithMetrics = posts.filter(
    (post) => post.status === "published" && typeof post.viewCount === "number"
  );

  return postsWithMetrics
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, limit);
}

export function getMostSharedPosts(posts: InnerBlogPost[], limit: number = 10): InnerBlogPost[] {
  const postsWithMetrics = posts.filter(
    (post) => post.status === "published" && typeof post.shareCount === "number"
  );

  return postsWithMetrics
    .sort((a, b) => (b.shareCount || 0) - (a.shareCount || 0))
    .slice(0, limit);
}

export function getContentPerformanceSummary(posts: InnerBlogPost[]) {
  const publishedPosts = posts.filter((post) => post.status === "published");

  if (publishedPosts.length === 0) {
    return {
      totalPosts: 0,
      totalViews: 0,
      totalShares: 0,
      avgEngagementScore: 0,
      avgReadTime: 0,
      topPerformingPosts: [],
    };
  }

  const totalViews = publishedPosts.reduce((sum, post) => sum + (post.viewCount || 0), 0);
  const totalShares = publishedPosts.reduce((sum, post) => sum + (post.shareCount || 0), 0);
  const avgEngagementScore =
    publishedPosts.reduce((sum, post) => sum + (post.engagementScore || 0), 0) / publishedPosts.length;
  const avgReadTime =
    publishedPosts.reduce((sum, post) => sum + (post.avgReadTime || 0), 0) / publishedPosts.length;

  return {
    totalPosts: publishedPosts.length,
    totalViews,
    totalShares,
    avgEngagementScore: Math.round(avgEngagementScore),
    avgReadTime: Math.round(avgReadTime),
    topPerformingPosts: getTopPerformingPosts(posts, 5),
  };
}
