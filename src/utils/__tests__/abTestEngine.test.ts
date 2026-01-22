import { abTestEngine } from '@/abTestEngine';
import { ABTest, ABTestVariant, ABTestStatus, ABTestSuccessMetric } from '@/types/abTest';

describe('ABTestEngine', () => {
  beforeEach(() => {
    abTestEngine.resetAll();
    localStorage.clear();
  });

  afterEach(() => {
    abTestEngine.resetAll();
    localStorage.clear();
  });

  describe('createTest', () => {
    it('should create a new A/B test with draft status', () => {
      const variant1: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original Title' },
        assignmentRate: 50,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const variant2: Partial<ABTestVariant> = {
        id: 'v2',
        testId: 'test-1',
        variantName: 'Variant A',
        content: { title: 'New Title' },
        assignmentRate: 50,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 50,
        successMetric: 'views',
        variants: [variant1 as ABTestVariant, variant2 as ABTestVariant],
        minSampleSize: 1000,
        confidenceLevel: 0.95
      });

      expect(test.id).toBeDefined();
      expect(test.status).toBe('draft');
      expect(test.postId).toBe(1);
      expect(test.variants.length).toBe(2);
      expect(test.createdAt).toBeDefined();
    });

    it('should set default values for minSampleSize and confidenceLevel', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'content',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'engagement',
        variants: [variant as ABTestVariant]
      });

      expect(test.minSampleSize).toBe(1000);
      expect(test.confidenceLevel).toBe(0.95);
    });

    it('should persist test to localStorage', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      abTestEngine.createTest({
        postId: 1,
        type: 'layout',
        status: 'draft',
        duration: 14,
        trafficSplit: 100,
        successMetric: 'clicks',
        variants: [variant as ABTestVariant]
      });

      const stored = localStorage.getItem('ab_tests');
      expect(stored).toBeDefined();
      const tests = JSON.parse(stored!);
      expect(tests).toHaveLength(1);
      expect(tests[0].postId).toBe(1);
    });
  });

  describe('startTest', () => {
    it('should start a draft test and set status to running', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      const started = abTestEngine.startTest(test.id);
      expect(started).toBe(true);

      const updatedTest = abTestEngine.getTest(test.id);
      expect(updatedTest?.status).toBe('running');
      expect(updatedTest?.startedAt).toBeDefined();
    });

    it('should not start a test that is already running', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'content',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'engagement',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.startTest(test.id);
      const startedAgain = abTestEngine.startTest(test.id);
      expect(startedAgain).toBe(false);
    });

    it('should not start a test that does not exist', () => {
      const started = abTestEngine.startTest('non-existent');
      expect(started).toBe(false);
    });
  });

  describe('pauseTest', () => {
    it('should pause a running test', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.startTest(test.id);
      const paused = abTestEngine.pauseTest(test.id);
      expect(paused).toBe(true);

      const updatedTest = abTestEngine.getTest(test.id);
      expect(updatedTest?.status).toBe('paused');
    });

    it('should not pause a draft test', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'content',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'engagement',
        variants: [variant as ABTestVariant]
      });

      const paused = abTestEngine.pauseTest(test.id);
      expect(paused).toBe(false);
    });
  });

  describe('completeTest', () => {
    it('should complete a running test and calculate winner', () => {
      const variant1: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 50,
        metrics: { views: 100, clicks: 10, engagement: 50, timeOnPage: 300, conversions: 5 },
        assignedUsers: ['user1', 'user2']
      };

      const variant2: Partial<ABTestVariant> = {
        id: 'v2',
        testId: 'test-1',
        variantName: 'Variant A',
        content: { title: 'New Title' },
        assignmentRate: 50,
        metrics: { views: 150, clicks: 20, engagement: 75, timeOnPage: 400, conversions: 10 },
        assignedUsers: ['user3', 'user4']
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 50,
        successMetric: 'views',
        variants: [variant1 as ABTestVariant, variant2 as ABTestVariant]
      });

      abTestEngine.startTest(test.id);
      const completed = abTestEngine.completeTest(test.id);
      expect(completed).toBe(true);

      const updatedTest = abTestEngine.getTest(test.id);
      expect(updatedTest?.status).toBe('completed');
      expect(updatedTest?.completedAt).toBeDefined();
      expect(updatedTest?.winner).toBeDefined();
      expect(updatedTest?.winner?.winnerId).toBe('v2');
    });

    it('should not complete a test that does not exist', () => {
      const completed = abTestEngine.completeTest('non-existent');
      expect(completed).toBe(false);
    });
  });

  describe('deleteTest', () => {
    it('should delete a test', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      const deleted = abTestEngine.deleteTest(test.id);
      expect(deleted).toBe(true);

      const retrieved = abTestEngine.getTest(test.id);
      expect(retrieved).toBeUndefined();
    });

    it('should not delete a test that does not exist', () => {
      const deleted = abTestEngine.deleteTest('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('assignVariant', () => {
    it('should assign a variant to a running test', () => {
      const variant1: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 50,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const variant2: Partial<ABTestVariant> = {
        id: 'v2',
        testId: 'test-1',
        variantName: 'Variant A',
        content: { title: 'New Title' },
        assignmentRate: 50,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 50,
        successMetric: 'views',
        variants: [variant1 as ABTestVariant, variant2 as ABTestVariant]
      });

      abTestEngine.startTest(test.id);
      const assigned = abTestEngine.assignVariant(test.id);
      expect(assigned).toBeDefined();
      expect(['v1', 'v2']).toContain(assigned?.id);
    });

    it('should return consistent assignment for the same user', () => {
      const variant1: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 50,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const variant2: Partial<ABTestVariant> = {
        id: 'v2',
        testId: 'test-1',
        variantName: 'Variant A',
        content: { title: 'New Title' },
        assignmentRate: 50,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 50,
        successMetric: 'views',
        variants: [variant1 as ABTestVariant, variant2 as ABTestVariant]
      });

      abTestEngine.startTest(test.id);
      const firstAssignment = abTestEngine.assignVariant(test.id);
      const secondAssignment = abTestEngine.assignVariant(test.id);
      expect(firstAssignment?.id).toBe(secondAssignment?.id);
    });

    it('should not assign variant to draft test', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      const assigned = abTestEngine.assignVariant(test.id);
      expect(assigned).toBeNull();
    });
  });

  describe('trackViews', () => {
    it('should increment views metric for a variant', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 10, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.trackViews(test.id, 'v1');
      const updatedTest = abTestEngine.getTest(test.id);
      expect(updatedTest?.variants[0].metrics.views).toBe(11);
    });
  });

  describe('trackClicks', () => {
    it('should increment clicks metric for a variant', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 10, clicks: 5, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'clicks',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.trackClicks(test.id, 'v1');
      const updatedTest = abTestEngine.getTest(test.id);
      expect(updatedTest?.variants[0].metrics.clicks).toBe(6);
    });
  });

  describe('trackEngagement', () => {
    it('should update engagement score for a variant', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 10, clicks: 0, engagement: 50, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'engagement',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.trackEngagement(test.id, 'v1', 75);
      const updatedTest = abTestEngine.getTest(test.id);
      expect(updatedTest?.variants[0].metrics.engagement).toBe(75);
    });
  });

  describe('calculateWinner', () => {
    it('should calculate winner based on views metric', () => {
      const variant1: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 50,
        metrics: { views: 100, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: ['user1', 'user2']
      };

      const variant2: Partial<ABTestVariant> = {
        id: 'v2',
        testId: 'test-1',
        variantName: 'Variant A',
        content: { title: 'New Title' },
        assignmentRate: 50,
        metrics: { views: 150, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: ['user3', 'user4']
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 50,
        successMetric: 'views',
        variants: [variant1 as ABTestVariant, variant2 as ABTestVariant]
      });

      const result = abTestEngine.completeTest(test.id);
      expect(result).toBe(true);
      const updatedTest = abTestEngine.getTest(test.id);
      expect(updatedTest?.winner?.winnerId).toBe('v2');
      expect(updatedTest?.winner?.loserId).toBe('v1');
      expect(updatedTest?.winner?.uplift).toBe(50);
    });

    it('should calculate winner based on engagement metric', () => {
      const variant1: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 50,
        metrics: { views: 100, clicks: 0, engagement: 50, timeOnPage: 0, conversions: 0 },
        assignedUsers: ['user1', 'user2']
      };

      const variant2: Partial<ABTestVariant> = {
        id: 'v2',
        testId: 'test-1',
        variantName: 'Variant A',
        content: { title: 'New Title' },
        assignmentRate: 50,
        metrics: { views: 100, clicks: 0, engagement: 75, timeOnPage: 0, conversions: 0 },
        assignedUsers: ['user3', 'user4']
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'content',
        status: 'draft',
        duration: 7,
        trafficSplit: 50,
        successMetric: 'engagement',
        variants: [variant1 as ABTestVariant, variant2 as ABTestVariant]
      });

      abTestEngine.completeTest(test.id);
      const updatedTest = abTestEngine.getTest(test.id);
      expect(updatedTest?.winner?.winnerId).toBe('v2');
    });

    it('should return null for test with single variant', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 100, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: ['user1', 'user2']
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.completeTest(test.id);
      const updatedTest = abTestEngine.getTest(test.id);
      expect(updatedTest?.winner).toBeNull();
    });
  });

  describe('getAllTests', () => {
    it('should return all tests sorted by creation date', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.createTest({
        postId: 2,
        type: 'content',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'engagement',
        variants: [variant as ABTestVariant]
      });

      const tests = abTestEngine.getAllTests();
      expect(tests).toHaveLength(2);
      expect(tests[0].postId).toBe(2);
      expect(tests[1].postId).toBe(1);
    });
  });

  describe('getTestsByPostId', () => {
    it('should return tests for specific post', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.createTest({
        postId: 1,
        type: 'content',
        status: 'running',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'engagement',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.createTest({
        postId: 2,
        type: 'layout',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'clicks',
        variants: [variant as ABTestVariant]
      });

      const tests = abTestEngine.getTestsByPostId(1);
      expect(tests).toHaveLength(2);
      expect(tests.every(t => t.postId === 1)).toBe(true);
    });
  });

  describe('getTestsByStatus', () => {
    it('should return tests filtered by status', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test1 = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      const test2 = abTestEngine.createTest({
        postId: 2,
        type: 'content',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'engagement',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.startTest(test1.id);

      const draftTests = abTestEngine.getTestsByStatus('draft');
      const runningTests = abTestEngine.getTestsByStatus('running');
      expect(draftTests).toHaveLength(1);
      expect(runningTests).toHaveLength(1);
      expect(draftTests[0].id).toBe(test2.id);
      expect(runningTests[0].id).toBe(test1.id);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics for all tests', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test1 = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      const test2 = abTestEngine.createTest({
        postId: 2,
        type: 'content',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'engagement',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.startTest(test1.id);
      abTestEngine.startTest(test2.id);
      abTestEngine.completeTest(test1.id);
      abTestEngine.completeTest(test2.id);

      const stats = abTestEngine.getStatistics();
      expect(stats.totalTests).toBe(2);
      expect(stats.runningTests).toBe(0);
      expect(stats.completedTests).toBe(2);
      expect(stats.averageDuration).toBeGreaterThan(0);
    });
  });

  describe('getTestsRequiringAttention', () => {
    it('should return tests that have exceeded duration', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 0,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.startTest(test.id);
      const needsAttention = abTestEngine.getTestsRequiringAttention();
      expect(needsAttention).toContainEqual(test);
    });

    it('should return tests that have reached min sample size with significant results', () => {
      const variant1: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 50,
        metrics: { views: 500, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: Array.from({ length: 500 }, (_, i) => `user${i}`)
      };

      const variant2: Partial<ABTestVariant> = {
        id: 'v2',
        testId: 'test-1',
        variantName: 'Variant A',
        content: { title: 'New Title' },
        assignmentRate: 50,
        metrics: { views: 750, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: Array.from({ length: 500 }, (_, i) => `user${i + 500}`)
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 50,
        successMetric: 'views',
        minSampleSize: 1000,
        confidenceLevel: 0.95,
        variants: [variant1 as ABTestVariant, variant2 as ABTestVariant]
      });

      abTestEngine.startTest(test.id);
      const needsAttention = abTestEngine.getTestsRequiringAttention();
      expect(needsAttention.length).toBeGreaterThan(0);
    });
  });

  describe('clearUserAssignments', () => {
    it('should clear all user assignments', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      const test = abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.startTest(test.id);
      abTestEngine.assignVariant(test.id);

      abTestEngine.clearUserAssignments();
      const newAssignment = abTestEngine.assignVariant(test.id);
      expect(newAssignment).not.toBeNull();
    });
  });

  describe('resetAll', () => {
    it('should clear all tests and assignments', () => {
      const variant: Partial<ABTestVariant> = {
        id: 'v1',
        testId: 'test-1',
        variantName: 'Control',
        content: { title: 'Original' },
        assignmentRate: 100,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      };

      abTestEngine.createTest({
        postId: 1,
        type: 'headline',
        status: 'draft',
        duration: 7,
        trafficSplit: 100,
        successMetric: 'views',
        variants: [variant as ABTestVariant]
      });

      abTestEngine.resetAll();
      const tests = abTestEngine.getAllTests();
      expect(tests).toHaveLength(0);
    });
  });
});
