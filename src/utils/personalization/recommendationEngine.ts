import { BehaviorSignal, ContentType, UserProfile, UserSegment } from '@/types/personalization';
import { BehaviorTracker } from './behaviorTracker';
import { InnerBlogPost } from '@/types/data';
import inner_blog_data from '@/data/InnerBlogData';
import blog_categories_data, { blogCategoryById } from '@/data/BlogCategoryData';
import tags, { tagsById } from '@/data/BlogTagData';
import type {
  Recommendation,
  RecommendationAlgorithm,
  RecommendationConfig,
  RecommendationExplanation,
  RecommendationFeedback,
  RecommendationMetrics,
  RecommendationScore,
  ColdStartStrategy
} from '@/types/recommendation';

const RECOMMENDATION_STORAGE_KEY = 'recommendations';
const FEEDBACK_STORAGE_KEY = 'recommendation_feedback';
const METRICS_STORAGE_KEY = 'recommendation_metrics';
const MAX_CACHE_SIZE = 100;
const FEATURE_WEIGHTS = {
  categoryMatch: 0.4,
  tagMatch: 0.3,
  readingHistory: 0.2,
  engagement: 0.1
} as const;

class RecommendationEngine {
  private behaviorTracker: BehaviorTracker;
  private userProfile: UserProfile | null = null;
  private recommendationsCache: Map<number, Recommendation> = new Map();
  private feedbackHistory: RecommendationFeedback[] = [];
  private recommendationMetrics: RecommendationMetrics | null = null;

  constructor() {
    this.behaviorTracker = new BehaviorTracker();
    this.loadRecommendations();
    this.loadFeedbackHistory();
    this.loadMetrics();
  }

  private loadRecommendations(): void {
    try {
      const stored = localStorage.getItem(RECOMMENDATION_STORAGE_KEY);
      if (stored) {
        const cached: Array<{ contentId: number; rec: Recommendation }> = JSON.parse(stored);
        cached.forEach(({ contentId, rec }) => {
          this.recommendationsCache.set(contentId, rec);
        });
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  }

  private saveRecommendations(): void {
    try {
      const cached = Array.from(this.recommendationsCache.entries()).slice(0, MAX_CACHE_SIZE);
      localStorage.setItem(RECOMMENDATION_STORAGE_KEY, JSON.stringify(cached));
      this.recommendationsCache = new Map(cached);
    } catch (error) {
      console.error('Failed to save recommendations:', error);
    }
  }

  private loadFeedbackHistory(): void {
    try {
      const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (stored) {
        this.feedbackHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load feedback history:', error);
    }
  }

  private saveFeedbackHistory(): void {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(this.feedbackHistory));
    } catch (error) {
      console.error('Failed to save feedback history:', error);
    }
  }

  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem(METRICS_STORAGE_KEY);
      if (stored) {
        this.recommendationMetrics = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }

  private saveMetrics(): void {
    if (!this.recommendationMetrics) return;

    try {
      localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(this.recommendationMetrics));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  trackRecommendationClick(contentId: number): void {
    const rec = this.recommendationsCache.get(contentId);
    if (rec) {
      if (!this.recommendationMetrics) {
        this.recommendationMetrics = this.initializeMetrics();
      }
      this.recommendationMetrics.totalClicks++;
      this.recommendationMetrics.ctr = this.recommendationMetrics.totalClicks / this.recommendationMetrics.totalRecommendations;

      const topPerforming = this.recommendationMetrics.topPerformingContent;
      const existing = topPerforming.find((item) => item.contentId === contentId);
      if (existing) {
        existing.clicks++;
        existing.ctr = existing.clicks / this.recommendationMetrics.totalRecommendations;
      } else {
        topPerforming.push({
          contentId,
          clicks: 1,
          ctr: 1 / this.recommendationMetrics.totalRecommendations
        });
      }
      this.saveMetrics();
    }
  }

  submitFeedback(contentId: number, helpful: boolean): void {
    const feedback: RecommendationFeedback = {
      contentId,
      helpful,
      timestamp: Date.now(),
      userId: this.getUserProfile()?.userId
    };
    this.feedbackHistory.push(feedback);
    this.saveFeedbackHistory();

    if (this.recommendationMetrics) {
      if (helpful) {
        this.recommendationMetrics.helpfulFeedback++;
      }
      this.recommendationMetrics.totalFeedback++;
      this.recommendationMetrics.satisfactionRate = this.recommendationMetrics.helpfulFeedback / this.recommendationMetrics.totalFeedback;
      this.saveMetrics();
    }
  }

  getUserProfile(): UserProfile | null {
    if (!this.userProfile) {
      this.userProfile = this.behaviorTracker.getUserProfile();
    }
    return this.userProfile;
  }

  getRecommendations(
    algorithm: RecommendationAlgorithm = 'hybrid',
    count: number = 10,
    excludeContentIds: number[] = []
  ): Recommendation[] {
    const userProfile = this.getUserProfile();

    if (!userProfile) {
      return this.getColdStartRecommendations(count, excludeContentIds);
    }

    let recommendations: Recommendation[] = [];

    switch (algorithm) {
      case 'content_based':
        recommendations = this.getContentBasedRecommendations(userProfile, count, excludeContentIds);
        break;
      case 'collaborative':
        recommendations = this.getCollaborativeRecommendations(userProfile, count, excludeContentIds);
        break;
      case 'hybrid':
        recommendations = this.getHybridRecommendations(userProfile, count, excludeContentIds);
        break;
      case 'popular':
        recommendations = this.getPopularRecommendations(count, excludeContentIds);
        break;
      case 'trending':
        recommendations = this.getTrendingRecommendations(count, excludeContentIds);
        break;
      default:
        recommendations = this.getHybridRecommendations(userProfile, count, excludeContentIds);
    }

    this.updateRecommendationsCache(recommendations);
    return recommendations;
  }

  private getColdStartRecommendations(
    count: number,
    excludeContentIds: number[]
  ): Recommendation[] {
    const userProfile = this.getUserProfile();
    const strategy = userProfile?.preferences.language === 'id' ? 'popular' : 'trending';

    if (strategy === 'popular') {
      return this.getPopularRecommendations(count, excludeContentIds);
    } else if (strategy === 'trending') {
      return this.getTrendingRecommendations(count, excludeContentIds);
    } else {
      const recentPosts = inner_blog_data
        .filter((post) => !excludeContentIds.includes(post.id))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, count);

      return recentPosts.map((post) => this.createRecommendation(post, 0.7, 'popular', 'newest', []));
    }
  }

  private getContentBasedRecommendations(
    userProfile: UserProfile,
    count: number,
    excludeContentIds: number[]
  ): Recommendation[] {
    const userInterests = userProfile.interests;
    const scores: RecommendationScore[] = [];

    for (const post of inner_blog_data) {
      if (excludeContentIds.includes(post.id)) continue;
      if (post.status !== 'published') continue;

      const score = this.calculateContentBasedScore(post, userProfile);
      if (score.score > 0) {
        scores.push(score);
      }
    }

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, count).map((score) => {
      const post = inner_blog_data.find((p) => p.id === score.contentId);
      if (!post) {
        throw new Error(`Post with id ${score.contentId} not found`);
      }
      return this.createRecommendation(
        post,
        score.score,
        score.algorithm,
        score.algorithm,
        score.reasons
      );
    });
  }

  private getCollaborativeRecommendations(
    userProfile: UserProfile,
    count: number,
    excludeContentIds: number[]
  ): Recommendation[] {
    const similarUsers = this.findSimilarUsers(userProfile);
    const contentScores = new Map<number, { score: number; reasons: string[] }>();

      for (const user of similarUsers) {
        const userBehaviors = this.behaviorTracker.getBehaviorHistory();
        const userInterests = user.behaviorHistory.filter((b) => b.type === 'page_view').map((b) => parseInt(b.contentId || '0', 10));

        for (const contentId of userInterests) {
          if (excludeContentIds.includes(contentId)) continue;
          const post = inner_blog_data.find((p) => p.id === contentId);
          if (!post || post.status !== 'published') continue;

          const existing = contentScores.get(contentId);
          if (existing) {
            existing.score += user.similarityScore;
            existing.reasons.push(`Liked by similar user (${user.segment})`);
          } else {
            contentScores.set(contentId, {
              score: user.similarityScore,
              reasons: [`Liked by similar user (${user.segment})`]
            });
          }
        }
    }

    const sortedScores = Array.from(contentScores.entries())
      .map(([contentId, data]) => ({ contentId, ...data }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    return sortedScores.map((item) => {
      const post = inner_blog_data.find((p) => p.id === item.contentId);
      if (!post) {
        throw new Error(`Post with id ${item.contentId} not found`);
      }
      return this.createRecommendation(
        post,
        item.score,
        'collaborative',
        'collaborative',
        item.reasons
      );
    });
  }

  private getHybridRecommendations(
    userProfile: UserProfile,
    count: number,
    excludeContentIds: number[]
  ): Recommendation[] {
    const contentBased = this.getContentBasedRecommendations(userProfile, count * 2, excludeContentIds);
    const collaborative = this.getCollaborativeRecommendations(userProfile, count * 2, excludeContentIds);

    const hybridScores = new Map<number, Recommendation>();

    for (const rec of contentBased) {
      hybridScores.set(rec.contentId, {
        ...rec,
        score: rec.score * FEATURE_WEIGHTS.categoryMatch
      });
    }

    for (const rec of collaborative) {
      const existing = hybridScores.get(rec.contentId);
      if (existing) {
        existing.score += rec.score * FEATURE_WEIGHTS.tagMatch;
        existing.explanation.reasons = [
          ...(existing.explanation.reasons || []),
          ...(rec.explanation.reasons || [])
        ];
      } else {
        hybridScores.set(rec.contentId, {
          ...rec,
          score: rec.score * FEATURE_WEIGHTS.tagMatch
        });
      }
    }

    const sorted = Array.from(hybridScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    return sorted;
  }

  private getPopularRecommendations(count: number, excludeContentIds: number[]): Recommendation[] {
    const popularPosts = inner_blog_data
      .filter((post) => !excludeContentIds.includes(post.id) && post.status === 'published')
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, count);

    return popularPosts.map((post) =>
      this.createRecommendation(
        post,
        (post.viewCount || 0) / 10000,
        'popular',
        'popular',
        ['Popular content with high view count']
      )
    );
  }

  private getTrendingRecommendations(count: number, excludeContentIds: number[]): Recommendation[] {
    const trendingPosts = inner_blog_data
      .filter((post) => !excludeContentIds.includes(post.id) && post.status === 'published')
      .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
      .slice(0, count);

    return trendingPosts.map((post) =>
      this.createRecommendation(
        post,
        (post.engagementScore || 0) / 100,
        'trending',
        'trending',
        ['Trending content with high engagement']
      )
    );
  }

  private calculateContentBasedScore(post: InnerBlogPost, userProfile: UserProfile): RecommendationScore {
    const reasons: string[] = [];
    let score = 0;

    const categoryMatch = userProfile.interests.includes(post.category || '');
    if (categoryMatch) {
      score += FEATURE_WEIGHTS.categoryMatch;
      reasons.push(`Matches your interest in ${post.category}`);
    }

    const tag = tagsById.get(post.tagId);
    if (tag && userProfile.interests.includes(tag.name)) {
      score += FEATURE_WEIGHTS.tagMatch;
      reasons.push(`Matches your interest in ${tag.name}`);
    }

    const recentViews = userProfile.behaviorHistory
      .filter((b) => b.type === 'page_view' && b.contentId === post.id.toString())
      .length;

    if (recentViews > 0) {
      score += FEATURE_WEIGHTS.readingHistory * 0.5;
      reasons.push('You have viewed this content before');
    }

    const engagementScore = post.engagementScore || 0;
    if (engagementScore > 70) {
      score += FEATURE_WEIGHTS.engagement;
      reasons.push('Highly engaging content');
    }

    return {
      contentId: post.id,
      score,
      reasons,
      algorithm: 'content_based',
      timestamp: Date.now()
    };
  }

  private findSimilarUsers(userProfile: UserProfile): Array<{ segment: UserSegment; similarityScore: number; behaviorHistory: BehaviorSignal[] }> {
    const allSegments = ['new_visitor', 'returning_visitor', 'frequent_reader', 'content_creator', 'engaged_user', 'dormant_user'] as const;
    const similarUsers: Array<{ segment: UserSegment; similarityScore: number; behaviorHistory: BehaviorSignal[] }> = [];

    for (const segment of allSegments) {
      if (segment === userProfile.segment) continue;

      const similarityScore = this.calculateSegmentSimilarity(userProfile.segment, segment);
      if (similarityScore > 0.3) {
        similarUsers.push({
          segment,
          similarityScore,
          behaviorHistory: []
        });
      }
    }

    return similarUsers.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  private calculateSegmentSimilarity(segment1: UserSegment, segment2: UserSegment): number {
    const engagementLevels: Record<UserSegment, number> = {
      new_visitor: 1,
      returning_visitor: 2,
      frequent_reader: 4,
      content_creator: 3,
      engaged_user: 3,
      dormant_user: 1
    };

    const diff = Math.abs(engagementLevels[segment1] - engagementLevels[segment2]);
    return Math.max(0, 1 - diff / 4);
  }

  private createRecommendation(
    content: InnerBlogPost,
    score: number,
    algorithm: RecommendationAlgorithm,
    coldStartStrategy: ColdStartStrategy | RecommendationAlgorithm,
    reasons: string[]
  ): Recommendation {
    const category = blogCategoryById.get(content.categoryId);
    const tag = tagsById.get(content.tagId);

    const explanation: RecommendationExplanation = {
      contentId: content.id,
      reason: reasons[0] || 'Recommended for you',
      categoryMatch: category !== undefined && reasons.some((r) => r.includes(category.name)),
      tagMatch: tag !== undefined && reasons.some((r) => r.includes(tag.name)),
      engagementScore: content.engagementScore
    };

    return {
      contentId: content.id,
      content,
      score,
      explanation,
      algorithm,
      timestamp: Date.now()
    };
  }

  private updateRecommendationsCache(recommendations: Recommendation[]): void {
    recommendations.forEach((rec) => {
      this.recommendationsCache.set(rec.contentId, rec);
    });

    if (this.recommendationsCache.size > MAX_CACHE_SIZE) {
      const oldest = Array.from(this.recommendationsCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, this.recommendationsCache.size - MAX_CACHE_SIZE);

      oldest.forEach(([id]) => {
        this.recommendationsCache.delete(id);
      });
    }

    this.saveRecommendations();
  }

  private initializeMetrics(): RecommendationMetrics {
    return {
      totalRecommendations: 0,
      totalClicks: 0,
      ctr: 0,
      avgEngagementScore: 0,
      helpfulFeedback: 0,
      totalFeedback: 0,
      satisfactionRate: 0,
      topPerformingContent: [],
      startDate: Date.now(),
      endDate: Date.now()
    };
  }

  getMetrics(): RecommendationMetrics | null {
    return this.recommendationMetrics;
  }

  clearCache(): void {
    this.recommendationsCache.clear();
    this.saveRecommendations();
  }

  resetMetrics(): void {
    this.recommendationMetrics = this.initializeMetrics();
    this.saveMetrics();
  }
}

const recommendationEngine = new RecommendationEngine();

export { RecommendationEngine, recommendationEngine };
