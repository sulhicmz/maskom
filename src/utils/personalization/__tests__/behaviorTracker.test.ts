import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { behaviorTracker } from '../behaviorTracker';

describe('BehaviorTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    behaviorTracker.reset();
  });

  afterEach(() => {
    localStorage.clear();
    behaviorTracker.reset();
  });

  describe('Session Management', () => {
    it('should generate unique session ID on initialization', () => {
      const profile1 = behaviorTracker.getUserProfile();
      const sessionId1 = profile1.sessionId;

      behaviorTracker.clearSessionData();
      const profile2 = behaviorTracker.getUserProfile();
      const sessionId2 = profile2.sessionId;

      expect(sessionId1).toBeDefined();
      expect(sessionId2).toBeDefined();
      expect(sessionId1).not.toBe(sessionId2);
    });

    it.skip('should clear session data and generate new session', () => {
      behaviorTracker.trackPageView('blog_post', 'post_1');
      const behaviorsBefore = behaviorTracker.getSessionBehaviors();
      expect(behaviorsBefore.length).toBe(1);

      behaviorTracker.clearSessionData();
      const behaviorsAfter = behaviorTracker.getSessionBehaviors();
      expect(behaviorsAfter.length).toBe(0);

      const profile1 = behaviorTracker.getUserProfile();
      const profile2 = behaviorTracker.getUserProfile();
      expect(profile1.sessionId).not.toBe(profile2.sessionId);
    });
  });

  describe('Behavior Tracking', () => {
    it('should track page view', () => {
      behaviorTracker.trackPageView('blog_post', 'post_1', { category: 'Technology' });

      const behaviors = behaviorTracker.getSessionBehaviors();
      expect(behaviors).toHaveLength(1);
      expect(behaviors[0].type).toBe('page_view');
      expect(behaviors[0].contentType).toBe('blog_post');
      expect(behaviors[0].contentId).toBe('post_1');
      expect(behaviors[0].metadata?.category).toBe('Technology');
    });

    it('should track scroll depth', () => {
      behaviorTracker.trackScrollDepth('blog_post', 'post_1', 50);

      const behaviors = behaviorTracker.getSessionBehaviors();
      expect(behaviors).toHaveLength(1);
      expect(behaviors[0].type).toBe('scroll_depth');
      expect(behaviors[0].value).toBe(50);
    });

    it('should track click', () => {
      behaviorTracker.trackClick('blog_post', 'post_1', 'read_more_button');

      const behaviors = behaviorTracker.getSessionBehaviors();
      expect(behaviors).toHaveLength(1);
      expect(behaviors[0].type).toBe('click');
      expect(behaviors[0].metadata?.element).toBe('read_more_button');
    });

    it('should track time on page', () => {
      behaviorTracker.trackTimeOnPage('blog_post', 'post_1', 30000);

      const behaviors = behaviorTracker.getSessionBehaviors();
      expect(behaviors).toHaveLength(1);
      expect(behaviors[0].type).toBe('time_on_page');
      expect(behaviors[0].value).toBe(30000);
    });

    it('should track bookmark', () => {
      behaviorTracker.trackBookmark('blog_post', 'post_1');

      const behaviors = behaviorTracker.getSessionBehaviors();
      expect(behaviors).toHaveLength(1);
      expect(behaviors[0].type).toBe('bookmark');
    });

    it('should track multiple behaviors in sequence', () => {
      behaviorTracker.trackPageView('blog_post', 'post_1');
      behaviorTracker.trackScrollDepth('blog_post', 'post_1', 25);
      behaviorTracker.trackTimeOnPage('blog_post', 'post_1', 15000);

      const behaviors = behaviorTracker.getSessionBehaviors();
      expect(behaviors).toHaveLength(3);
      expect(behaviors[0].type).toBe('page_view');
      expect(behaviors[1].type).toBe('scroll_depth');
      expect(behaviors[2].type).toBe('time_on_page');
    });
  });

  describe('User Profile Calculation', () => {
    it('should classify new visitor correctly', () => {
      behaviorTracker.trackPageView('blog_post', 'post_1');
      behaviorTracker.trackPageView('blog_post', 'post_2');

      const profile = behaviorTracker.getUserProfile();
      expect(profile.segment).toBe('new_visitor');
    });

    it.skip('should classify returning visitor correctly', () => {
      for (let i = 0; i < 10; i++) {
        behaviorTracker.trackPageView('blog_post', `post_${i}`);
        behaviorTracker.clearSessionData();
      }

      const profile = behaviorTracker.getUserProfile();
      expect(profile.segment).toBe('returning_visitor');
    });

    it.skip('should classify engaged user correctly', () => {
      for (let i = 0; i < 10; i++) {
        behaviorTracker.trackPageView('blog_post', `post_${i}`);
        behaviorTracker.trackBookmark('blog_post', `post_${i}`);
      }

      const profile = behaviorTracker.getUserProfile();
      expect(profile.segment).toBe('engaged_user');
    });

    it('should extract interests from behavior metadata', () => {
      behaviorTracker.trackPageView('blog_post', 'post_1', { category: 'Technology' });
      behaviorTracker.trackPageView('blog_post', 'post_2', { category: 'Technology' });
      behaviorTracker.trackPageView('blog_post', 'post_3', { category: 'Business' });
      behaviorTracker.trackPageView('blog_post', 'post_4', { tag: ['react', 'javascript'] });

      const profile = behaviorTracker.getUserProfile();
      expect(profile.interests.length).toBeGreaterThan(0);
      expect(profile.interests).toContain('Technology');
    });

    it('should calculate preferred content type', () => {
      for (let i = 0; i < 5; i++) {
        behaviorTracker.trackPageView('blog_post', `post_${i}`);
      }
      for (let i = 0; i < 2; i++) {
        behaviorTracker.trackPageView('service', `service_${i}`);
      }

      const profile = behaviorTracker.getUserProfile();
      expect(profile.preferredContentType).toBe('blog_post');
    });

    it('should calculate engagement score', () => {
      behaviorTracker.trackPageView('blog_post', 'post_1');
      behaviorTracker.trackClick('blog_post', 'post_1');
      behaviorTracker.trackBookmark('blog_post', 'post_1');
      behaviorTracker.trackScrollDepth('blog_post', 'post_1', 80);

      const profile = behaviorTracker.getUserProfile();
      expect(profile.engagementScore).toBeGreaterThan(0);
      expect(profile.engagementScore).toBeLessThanOrEqual(100);
    });

    it('should update user profile', () => {
      behaviorTracker.trackPageView('blog_post', 'post_1');
      behaviorTracker.getUserProfile();

      behaviorTracker.updateUserProfile({
        preferences: {
          allowPersonalization: false,
          allowTracking: false,
          theme: 'dark',
          language: 'id',
        },
      });

      const profile2 = behaviorTracker.getUserProfile();
      expect(profile2.preferences.allowPersonalization).toBe(false);
      expect(profile2.preferences.allowTracking).toBe(false);
      expect(profile2.preferences.theme).toBe('dark');
      expect(profile2.preferences.language).toBe('id');
    });
  });

  describe('Opt-out Management', () => {
    it('should set opt-out status', () => {
      expect(behaviorTracker.isOptedOut()).toBe(false);

      behaviorTracker.setOptOut(true);
      expect(behaviorTracker.isOptedOut()).toBe(true);

      behaviorTracker.setOptOut(false);
      expect(behaviorTracker.isOptedOut()).toBe(false);
    });

    it('should respect opt-out in profile preferences', () => {
      behaviorTracker.setOptOut(true);
      const profile = behaviorTracker.getUserProfile();
      expect(profile.preferences.allowPersonalization).toBe(false);
      expect(profile.preferences.allowTracking).toBe(false);
    });
  });

  describe('Behavior History Persistence', () => {
    it('should persist behavior history to localStorage', () => {
      behaviorTracker.trackPageView('blog_post', 'post_1');
      behaviorTracker.trackPageView('blog_post', 'post_2');

      const stored = localStorage.getItem('user_behavior_history');
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(2);
    });

    it('should load behavior history from localStorage', () => {
      behaviorTracker.trackPageView('blog_post', 'existing_post');
      behaviorTracker.reset();

      const profile = behaviorTracker.getUserProfile();
      const mockHistory = [
        {
          id: 'test_id',
          sessionId: profile.sessionId,
          type: 'page_view' as const,
          contentType: 'blog_post' as const,
          contentId: 'test_post',
          timestamp: Date.now(),
        },
      ];

      localStorage.setItem('user_behavior_history', JSON.stringify(mockHistory));
      (behaviorTracker as any).loadBehaviorHistory();

      const behaviors = behaviorTracker.getBehaviorHistory();
      expect(behaviors).toHaveLength(1);
      expect(behaviors[0].contentId).toBe('test_post');
    });

    it.skip('should clean up old behaviors', () => {
      behaviorTracker.trackPageView('blog_post', 'existing_post');
      behaviorTracker.reset();

      const profile = behaviorTracker.getUserProfile();
      const oldTimestamp = Date.now() - 35 * 24 * 60 * 60 * 1000; // 35 days ago

      const mockHistory = [
        {
          id: 'old_id',
          sessionId: profile.sessionId,
          type: 'page_view' as const,
          contentType: 'blog_post' as const,
          contentId: 'old_post',
          timestamp: oldTimestamp,
        },
        {
          id: 'new_id',
          sessionId: profile.sessionId,
          type: 'page_view' as const,
          contentType: 'blog_post' as const,
          contentId: 'new_post',
          timestamp: Date.now(),
        },
      ];

      localStorage.setItem('user_behavior_history', JSON.stringify(mockHistory));
      (behaviorTracker as any).loadBehaviorHistory();

      const behaviors = behaviorTracker.getBehaviorHistory();

      expect(behaviors).toHaveLength(1);
      expect(behaviors[0].id).toBe('new_id');
    });

    it('should limit history to maximum size', () => {
      for (let i = 0; i < 510; i++) {
        behaviorTracker.trackPageView('blog_post', `post_${i}`);
      }

      const behaviors = behaviorTracker.getBehaviorHistory();
      expect(behaviors.length).toBeLessThanOrEqual(500);
    });
  });

  describe('Utility Methods', () => {
    it('should get behaviors filtered by user ID', () => {
      localStorage.setItem('user', JSON.stringify({ id: 'user_123' }));

      behaviorTracker.trackPageView('blog_post', 'post_1');

      const userBehaviors = behaviorTracker.getBehaviorHistory('user_123');
      expect(userBehaviors.length).toBe(1);
    });

    it('should reset all data', () => {
      behaviorTracker.trackPageView('blog_post', 'post_1');
      behaviorTracker.trackBookmark('blog_post', 'post_1');

      expect(behaviorTracker.getSessionBehaviors().length).toBe(2);

      behaviorTracker.reset();

      expect(behaviorTracker.getSessionBehaviors().length).toBe(0);
      expect(localStorage.getItem('user_behavior_history')).toBeNull();
    });
  });
});
