import { describe, it, expect } from 'vitest';
import { segmentationEngine } from '../segmentationEngine';
import type { BehaviorSignal } from '@/types/personalization';

describe('SegmentationEngine', () => {
  const createMockBehaviors = (
    count: number,
    sessionCount: number = 1,
    daysActive: number = 1
  ): BehaviorSignal[] => {
    const behaviors: BehaviorSignal[] = [];
    const dayMs = 24 * 60 * 60 * 1000;
    const baseTime = Date.now() - (daysActive - 1) * dayMs;

    for (let i = 0; i < count; i++) {
      const sessionIndex = Math.floor((i / count) * sessionCount);
      const timeOffset = Math.floor((i / count) * daysActive * dayMs);
      
      behaviors.push({
        id: `behavior_${i}`,
        sessionId: `session_${sessionIndex}`,
        type: 'page_view',
        contentType: 'blog_post',
        contentId: `post_${i % 10}`,
        timestamp: baseTime + timeOffset,
      });
    }

    return behaviors;
  };

  describe('Segment Evaluation', () => {
    it('should classify new visitor correctly', () => {
      const behaviors = createMockBehaviors(3, 1);
      const segment = segmentationEngine.evaluateSegment(behaviors);

      expect(segment).toBe('new_visitor');
    });

    it('should classify returning visitor correctly', () => {
      const behaviors = createMockBehaviors(10, 3, 5);
      const segment = segmentationEngine.evaluateSegment(behaviors);

      expect(segment).toBe('returning_visitor');
    });

    it('should classify frequent reader correctly', () => {
      const behaviors = createMockBehaviors(25, 10, 10);
      behaviors.forEach((b) => {
        b.type = 'time_on_page';
        b.value = 90000; // 90 seconds average
      });
      const segment = segmentationEngine.evaluateSegment(behaviors);

      expect(segment).toBe('frequent_reader');
    });

    it('should classify engaged user correctly', () => {
      const behaviors = createMockBehaviors(18, 5, 7);
      for (let i = 0; i < 6; i++) {
        behaviors.push({
          id: `bookmark_${i}`,
          sessionId: behaviors[i].sessionId,
          type: 'bookmark',
          contentType: 'blog_post',
          contentId: `post_${i}`,
          timestamp: behaviors[i].timestamp,
        });
      }
      const segment = segmentationEngine.evaluateSegment(behaviors);

      expect(segment).toBe('engaged_user');
    });

    it('should classify content creator correctly', () => {
      const behaviors = createMockBehaviors(55, 25, 35);
      const segment = segmentationEngine.evaluateSegment(behaviors);

      expect(segment).toBe('content_creator');
    });

    it('should classify dormant user correctly', () => {
      const behaviors = [
        {
          id: 'old_behavior',
          sessionId: 'old_session',
          type: 'page_view' as const,
          contentType: 'blog_post' as const,
          contentId: 'old_post',
          timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
        },
      ];
      const segment = segmentationEngine.evaluateSegment(behaviors);

      expect(segment).toBe('dormant_user');
    });
  });

  describe('Segment Info', () => {
    it('should return segment info for valid segment', () => {
      const info = segmentationEngine.getSegmentInfo('new_visitor');

      expect(info).toBeDefined();
      expect(info?.segment).toBe('new_visitor');
      expect(info?.name).toBe('New Visitor');
      expect(info?.description).toBeDefined();
    });

    it('should return undefined for invalid segment', () => {
      const info = segmentationEngine.getSegmentInfo('invalid_segment' as any);
      expect(info).toBeUndefined();
    });

    it('should return all segments', () => {
      const segments = segmentationEngine.getAllSegments();

      expect(segments).toHaveLength(6);
      expect(segments.map((s) => s.segment)).toEqual(
        expect.arrayContaining([
          'new_visitor',
          'returning_visitor',
          'frequent_reader',
          'content_creator',
          'engaged_user',
          'dormant_user',
        ])
      );
    });
  });

  describe('Segment Prediction', () => {
    it('should predict new_visitor to returning_visitor transition', () => {
      const behaviors = createMockBehaviors(8, 2, 3);
      behaviors.push({
        id: 'extra',
        sessionId: 'session_1',
        type: 'page_view',
        contentType: 'blog_post',
        contentId: 'post_8',
        timestamp: Date.now(),
      });

      const prediction = segmentationEngine.predictNextSegment(behaviors);
      expect(prediction).toBe('returning_visitor');
    });

    it('should predict returning_visitor to engaged_user transition', () => {
      const behaviors = createMockBehaviors(18, 5, 7);
      for (let i = 0; i < 6; i++) {
        behaviors.push({
          id: `bookmark_${i}`,
          sessionId: `session_${i % 5}`,
          type: 'bookmark',
          contentType: 'blog_post',
          contentId: `post_${i}`,
          timestamp: behaviors[i].timestamp,
        });
      }

      const prediction = segmentationEngine.predictNextSegment(behaviors);
      expect(prediction).toBe('engaged_user');
    });

    it('should predict returning_visitor to frequent_reader transition', () => {
      const behaviors = createMockBehaviors(22, 9, 12);
      behaviors.forEach((b) => {
        b.type = 'time_on_page';
        b.value = 70000;
      });

      const prediction = segmentationEngine.predictNextSegment(behaviors);
      expect(prediction).toBe('frequent_reader');
    });

    it('should predict engaged_user to content_creator transition', () => {
      const behaviors = createMockBehaviors(55, 25, 35);
      for (let i = 0; i < 6; i++) {
        behaviors.push({
          id: `bookmark_${i}`,
          sessionId: `session_${i % 25}`,
          type: 'bookmark',
          contentType: 'blog_post',
          contentId: `post_${i}`,
          timestamp: behaviors[i].timestamp,
        });
      }

      const prediction = segmentationEngine.predictNextSegment(behaviors);
      expect(prediction).toBe('content_creator');
    });

    it('should return null for no prediction', () => {
      const behaviors = createMockBehaviors(3, 1, 1);
      const prediction = segmentationEngine.predictNextSegment(behaviors);
      expect(prediction).toBeNull();
    });
  });

  describe('Segment Transition Path', () => {
    it('should calculate transition path from new_visitor to returning_visitor', () => {
      const path = segmentationEngine.getSegmentTransitionPath('new_visitor', 'returning_visitor');
      expect(path).toEqual(['new_visitor', 'returning_visitor']);
    });

    it('should calculate transition path from new_visitor to frequent_reader', () => {
      const path = segmentationEngine.getSegmentTransitionPath('new_visitor', 'frequent_reader');
      expect(path).toEqual(['new_visitor', 'returning_visitor', 'engaged_user', 'frequent_reader']);
    });

    it('should calculate transition path from new_visitor to content_creator', () => {
      const path = segmentationEngine.getSegmentTransitionPath('new_visitor', 'content_creator');
      expect(path).toEqual(['new_visitor', 'returning_visitor', 'engaged_user', 'frequent_reader', 'content_creator']);
    });

    it('should return empty array for same segment', () => {
      const path = segmentationEngine.getSegmentTransitionPath('new_visitor', 'new_visitor');
      expect(path).toEqual([]);
    });

    it('should return empty array for reverse transition', () => {
      const path = segmentationEngine.getSegmentTransitionPath('content_creator', 'new_visitor');
      expect(path).toEqual([]);
    });

    it('should return empty array for invalid segments', () => {
      const path = segmentationEngine.getSegmentTransitionPath('new_visitor', 'invalid' as any);
      expect(path).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty behaviors', () => {
      const segment = segmentationEngine.evaluateSegment([]);
      expect(segment).toBe('new_visitor');
    });

    it('should handle behaviors with missing properties', () => {
      const behaviors = [
        {
          id: 'test',
          sessionId: 'test_session',
          type: 'page_view' as const,
          contentType: 'blog_post' as const,
          contentId: 'test_post',
          timestamp: Date.now(),
        },
      ];
      const segment = segmentationEngine.evaluateSegment(behaviors);
      expect(segment).toBeDefined();
    });

    it('should handle single behavior', () => {
      const behaviors = [
        {
          id: 'single',
          sessionId: 'session_1',
          type: 'page_view' as const,
          contentType: 'blog_post' as const,
          contentId: 'post_1',
          timestamp: Date.now(),
        },
      ];
      const segment = segmentationEngine.evaluateSegment(behaviors);
      expect(segment).toBe('new_visitor');
    });
  });
});
