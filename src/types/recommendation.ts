import type { InnerBlogPost } from '@/types/data';

export type RecommendationAlgorithm = 'content_based' | 'collaborative' | 'hybrid' | 'popular' | 'trending';

export type ColdStartStrategy = 'popular' | 'trending' | 'newest' | 'category_based';

export interface RecommendationScore {
  contentId: number;
  score: number;
  reasons: string[];
  algorithm: RecommendationAlgorithm;
  timestamp: number;
}

export interface RecommendationExplanation {
  contentId: number;
  reason: string;
  categoryMatch?: boolean;
  tagMatch?: boolean;
  similarUsers?: number;
  engagementScore?: number;
  reasons?: string[];
}

export interface Recommendation {
  contentId: number;
  content: InnerBlogPost;
  score: number;
  explanation: RecommendationExplanation;
  algorithm: RecommendationAlgorithm;
  timestamp: number;
}

export interface RecommendationFeedback {
  contentId: number;
  helpful: boolean;
  timestamp: number;
  userId?: string;
}

export interface RecommendationMetrics {
  totalRecommendations: number;
  totalClicks: number;
  ctr: number;
  avgEngagementScore: number;
  helpfulFeedback: number;
  totalFeedback: number;
  satisfactionRate: number;
  topPerformingContent: Array<{
    contentId: number;
    clicks: number;
    ctr: number;
  }>;
  startDate: number;
  endDate: number;
}

export interface RecommendationConfig {
  enabled: boolean;
  algorithm: RecommendationAlgorithm;
  coldStartStrategy: ColdStartStrategy;
  maxRecommendations: number;
  cacheSize: number;
  featureWeights: {
    categoryMatch: number;
    tagMatch: number;
    readingHistory: number;
    engagement: number;
  };
  updateInterval: number;
}
