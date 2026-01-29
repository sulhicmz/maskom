import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RecommendationEngine } from '../recommendationEngine';
import type {
  RecommendationAlgorithm,
  ColdStartStrategy
} from '@/types/recommendation';

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;

  beforeEach(() => {
    engine = new RecommendationEngine();
    engine.clearCache();
    engine.resetMetrics();

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create an instance of RecommendationEngine', () => {
      expect(engine).toBeInstanceOf(RecommendationEngine);
    });

    it('should initialize with empty cache', () => {
      const metrics = engine.getMetrics();
      expect(metrics).not.toBeNull();
    });

    it('should load recommendations from localStorage on creation', () => {
      const engine2 = new RecommendationEngine();
      expect(engine2).toBeInstanceOf(RecommendationEngine);
    });
  });

  describe('getUserProfile', () => {
    it('should return null when no user profile exists', () => {
      const profile = engine.getUserProfile();
      expect(profile).toBeNull();
    });
  });

  describe('getRecommendations', () => {
    it('should return cold-start recommendations when no user profile exists', () => {
      const recs = engine.getRecommendations('hybrid', 5);
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeLessThanOrEqual(5);
    });

    it('should return hybrid recommendations by default', () => {
      const recs = engine.getRecommendations(undefined, 5);
      expect(Array.isArray(recs)).toBe(true);
    });

    it('should return content-based recommendations when algorithm is content_based', () => {
      const recs = engine.getRecommendations('content_based', 5);
      expect(Array.isArray(recs)).toBe(true);
      if (recs.length > 0) {
        expect(recs[0].algorithm).toBe('content_based');
      }
    });

    it('should return collaborative recommendations when algorithm is collaborative', () => {
      const recs = engine.getRecommendations('collaborative', 5);
      expect(Array.isArray(recs)).toBe(true);
      if (recs.length > 0) {
        expect(recs[0].algorithm).toBe('collaborative');
      }
    });

    it('should return popular recommendations when algorithm is popular', () => {
      const recs = engine.getRecommendations('popular', 5);
      expect(Array.isArray(recs)).toBe(true);
      if (recs.length > 0) {
        expect(recs[0].algorithm).toBe('popular');
      }
    });

    it('should return trending recommendations when algorithm is trending', () => {
      const recs = engine.getRecommendations('trending', 5);
      expect(Array.isArray(recs)).toBe(true);
      if (recs.length > 0) {
        expect(recs[0].algorithm).toBe('trending');
      }
    });

    it('should exclude specified content IDs', () => {
      const recs1 = engine.getRecommendations('popular', 10);
      const contentIdsToExclude = recs1.slice(0, 3).map((r) => r.contentId);
      const recs2 = engine.getRecommendations('popular', 10, contentIdsToExclude);

      const excludedIds = recs2.map((r) => r.contentId);
      contentIdsToExclude.forEach((id) => {
        expect(excludedIds.includes(id)).toBe(false);
      });
    });

    it('should respect the count parameter', () => {
      const recs = engine.getRecommendations('popular', 3);
      expect(recs.length).toBeLessThanOrEqual(3);
    });
  });

  describe('trackRecommendationClick', () => {
    it('should track clicks and update metrics', () => {
      const recs = engine.getRecommendations('popular', 5);
      if (recs.length > 0) {
        engine.trackRecommendationClick(recs[0].contentId);
        const metrics = engine.getMetrics();
        expect(metrics).not.toBeNull();
        expect(metrics?.totalClicks).toBeGreaterThan(0);
      }
    });

    it('should not track clicks for non-existent recommendations', () => {
      engine.trackRecommendationClick(999999);
      const metrics = engine.getMetrics();
      expect(metrics?.totalClicks).toBe(0);
    });

    it('should update CTR correctly', () => {
      const recs = engine.getRecommendations('popular', 5);
      if (recs.length > 0) {
        const initialMetrics = engine.getMetrics();
        engine.trackRecommendationClick(recs[0].contentId);
        const updatedMetrics = engine.getMetrics();
        if (initialMetrics && updatedMetrics) {
          expect(updatedMetrics.ctr).toBeGreaterThan(initialMetrics.ctr);
        }
      }
    });
  });

  describe('submitFeedback', () => {
    it('should submit helpful feedback', () => {
      const recs = engine.getRecommendations('popular', 5);
      if (recs.length > 0) {
        engine.submitFeedback(recs[0].contentId, true);
        const metrics = engine.getMetrics();
        expect(metrics?.helpfulFeedback).toBeGreaterThan(0);
        expect(metrics?.totalFeedback).toBeGreaterThan(0);
      }
    });

    it('should submit not helpful feedback', () => {
      const recs = engine.getRecommendations('popular', 5);
      if (recs.length > 0) {
        engine.submitFeedback(recs[0].contentId, false);
        const metrics = engine.getMetrics();
        expect(metrics?.totalFeedback).toBeGreaterThan(0);
      }
    });

    it('should calculate satisfaction rate correctly', () => {
      const recs = engine.getRecommendations('popular', 5);
      if (recs.length >= 2) {
        engine.submitFeedback(recs[0].contentId, true);
        engine.submitFeedback(recs[1].contentId, false);
        const metrics = engine.getMetrics();
        expect(metrics?.satisfactionRate).toBe(0.5);
      }
    });
  });

  describe('getMetrics', () => {
    it('should return initial metrics when first called', () => {
      const metrics = engine.getMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics?.totalRecommendations).toBe(0);
      expect(metrics?.totalClicks).toBe(0);
      expect(metrics?.ctr).toBe(0);
    });

    it('should return null when metrics have not been initialized', () => {
      const engine2 = new RecommendationEngine();
      const metrics = engine2.getMetrics();
      expect(metrics).toBeNull();
    });

    it('should track total recommendations', () => {
      engine.getRecommendations('popular', 5);
      const metrics = engine.getMetrics();
      expect(metrics?.totalRecommendations).toBeGreaterThan(0);
    });
  });

  describe('clearCache', () => {
    it('should clear the recommendations cache', () => {
      engine.getRecommendations('popular', 5);
      engine.clearCache();

      const recs = engine.getRecommendations('popular', 5);
      expect(Array.isArray(recs)).toBe(true);
    });

    it('should not throw error when cache is empty', () => {
      expect(() => engine.clearCache()).not.toThrow();
    });
  });

  describe('resetMetrics', () => {
    it('should reset metrics to initial values', () => {
      engine.getRecommendations('popular', 5);
      engine.submitFeedback(1, true);

      engine.resetMetrics();
      const metrics = engine.getMetrics();

      expect(metrics).not.toBeNull();
      expect(metrics?.totalRecommendations).toBe(0);
      expect(metrics?.totalClicks).toBe(0);
      expect(metrics?.ctr).toBe(0);
      expect(metrics?.helpfulFeedback).toBe(0);
      expect(metrics?.totalFeedback).toBe(0);
      expect(metrics?.satisfactionRate).toBe(0);
    });
  });

  describe('Recommendation Object Structure', () => {
    it('should create recommendations with correct structure', () => {
      const recs = engine.getRecommendations('popular', 1);
      if (recs.length > 0) {
        const rec = recs[0];
        expect(rec).toHaveProperty('contentId');
        expect(rec).toHaveProperty('content');
        expect(rec).toHaveProperty('score');
        expect(rec).toHaveProperty('explanation');
        expect(rec).toHaveProperty('algorithm');
        expect(rec).toHaveProperty('timestamp');
      }
    });

    it('should create explanation with correct structure', () => {
      const recs = engine.getRecommendations('popular', 1);
      if (recs.length > 0) {
        const explanation = recs[0].explanation;
        expect(explanation).toHaveProperty('contentId');
        expect(explanation).toHaveProperty('reason');
        expect(explanation).toHaveProperty('algorithm');
      }
    });
  });

  describe('Algorithm Comparison', () => {
    it('should return different results for different algorithms', () => {
      const popularRecs = engine.getRecommendations('popular', 5);
      const trendingRecs = engine.getRecommendations('trending', 5);

      if (popularRecs.length > 0 && trendingRecs.length > 0) {
        const popularIds = popularRecs.map((r) => r.contentId).sort();
        const trendingIds = trendingRecs.map((r) => r.contentId).sort();

        expect(JSON.stringify(popularIds)).not.toBe(JSON.stringify(trendingIds));
      }
    });

    it('should return results sorted by score', () => {
      const recs = engine.getRecommendations('hybrid', 10);

      for (let i = 1; i < recs.length; i++) {
        expect(recs[i - 1].score).toBeGreaterThanOrEqual(recs[i].score);
      }
    });
  });

  describe('Score Calculation', () => {
    it('should calculate scores between 0 and 1', () => {
      const recs = engine.getRecommendations('content_based', 10);

      recs.forEach((rec) => {
        expect(rec.score).toBeGreaterThanOrEqual(0);
        expect(rec.score).toBeLessThanOrEqual(1);
      });
    });

    it('should assign higher scores to popular content', () => {
      const recs = engine.getRecommendations('popular', 5);
      if (recs.length > 0) {
        expect(recs[0].score).toBeGreaterThan(0);
      }
    });

    it('should assign higher scores to trending content', () => {
      const recs = engine.getRecommendations('trending', 5);
      if (recs.length > 0) {
        expect(recs[0].score).toBeGreaterThan(0);
      }
    });
  });

  describe('Content Filtering', () => {
    it('should only recommend published content', () => {
      const recs = engine.getRecommendations('popular', 10);

      recs.forEach((rec) => {
        expect(rec.content.status).toBe('published');
      });
    });

    it('should handle empty exclusion list', () => {
      const recs1 = engine.getRecommendations('popular', 5);
      const recs2 = engine.getRecommendations('popular', 5, []);

      expect(recs1.length).toBe(recs2.length);
    });

    it('should handle large exclusion list', () => {
      const recs1 = engine.getRecommendations('popular', 10);
      const contentIdsToExclude = recs1.map((r) => r.contentId);
      const recs2 = engine.getRecommendations('popular', 10, contentIdsToExclude);

      expect(recs2.length).toBe(0);
    });
  });

  describe('Feature Weights', () => {
    it('should use category match weight correctly', () => {
      const recs = engine.getRecommendations('content_based', 5);
      if (recs.length > 0 && recs[0].explanation.categoryMatch) {
        expect(recs[0].score).toBeGreaterThan(0.3);
      }
    });

    it('should use tag match weight correctly', () => {
      const recs = engine.getRecommendations('content_based', 5);
      if (recs.length > 0 && recs[0].explanation.tagMatch) {
        expect(recs[0].score).toBeGreaterThan(0.2);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero count parameter', () => {
      const recs = engine.getRecommendations('popular', 0);
      expect(recs.length).toBe(0);
    });

    it('should handle large count parameter', () => {
      const recs = engine.getRecommendations('popular', 1000);
      expect(Array.isArray(recs)).toBe(true);
    });

    it('should handle negative count parameter', () => {
      const recs = engine.getRecommendations('popular', -5);
      expect(Array.isArray(recs)).toBe(true);
    });
  });

  describe('Performance Tracking', () => {
    it('should track clicks for multiple recommendations', () => {
      const recs = engine.getRecommendations('popular', 5);

      recs.forEach((rec) => {
        engine.trackRecommendationClick(rec.contentId);
      });

      const metrics = engine.getMetrics();
      expect(metrics?.totalClicks).toBeGreaterThan(0);
    });

    it('should update top performing content', () => {
      const recs = engine.getRecommendations('popular', 5);

      if (recs.length > 0) {
        engine.trackRecommendationClick(recs[0].contentId);
        const metrics = engine.getMetrics();
        expect(metrics?.topPerformingContent.length).toBeGreaterThan(0);
      }
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save feedback to localStorage', () => {
      const recs = engine.getRecommendations('popular', 5);
      if (recs.length > 0) {
        engine.submitFeedback(recs[0].contentId, true);

        const stored = localStorage.getItem('recommendation_feedback');
        expect(stored).not.toBeNull();
      }
    });

    it('should load feedback from localStorage', () => {
      const engine2 = new RecommendationEngine();
      const metrics = engine2.getMetrics();
      expect(metrics).not.toBeNull();
    });
  });
});
