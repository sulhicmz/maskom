import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { personalizationEngine } from '../personalizationEngine';

describe('PersonalizationEngine', () => {
  beforeEach(() => {
    localStorage.clear();
    personalizationEngine.reset();
  });

  afterEach(() => {
    localStorage.clear();
    personalizationEngine.reset();
  });

  describe('Rule Management', () => {
    it('should create a new rule', () => {
      const rule = personalizationEngine.createRule({
        name: 'Test Rule',
        description: 'Test description',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      expect(rule.id).toBeDefined();
      expect(rule.name).toBe('Test Rule');
      expect(rule.createdAt).toBeDefined();
      expect(rule.updatedAt).toBeDefined();
    });

    it('should update an existing rule', () => {
      const rule = personalizationEngine.createRule({
        name: 'Original Name',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      const updated = personalizationEngine.updateRule(rule.id, {
        name: 'Updated Name',
        priority: 5,
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.priority).toBe(5);
      expect(updated?.createdAt).toBe(rule.createdAt);
      expect(updated?.updatedAt).toBeGreaterThan(rule.updatedAt);
    });

    it('should return null when updating non-existent rule', () => {
      const updated = personalizationEngine.updateRule('non_existent_id', {
        name: 'Test',
      });
      expect(updated).toBeNull();
    });

    it('should delete a rule', () => {
      const rule = personalizationEngine.createRule({
        name: 'Test Rule',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      const deleted = personalizationEngine.deleteRule(rule.id);
      expect(deleted).toBe(true);

      const retrieved = personalizationEngine.getRule(rule.id);
      expect(retrieved).toBeUndefined();
    });

    it('should return false when deleting non-existent rule', () => {
      const deleted = personalizationEngine.deleteRule('non_existent_id');
      expect(deleted).toBe(false);
    });

    it('should retrieve a rule by ID', () => {
      const rule = personalizationEngine.createRule({
        name: 'Test Rule',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      const retrieved = personalizationEngine.getRule(rule.id);
      expect(retrieved).toEqual(rule);
    });

    it('should retrieve all rules', () => {
      personalizationEngine.createRule({
        name: 'Rule 1',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      personalizationEngine.createRule({
        name: 'Rule 2',
        description: 'Test',
        segment: 'returning_visitor',
        trigger: 'on_scroll',
        contentType: 'blog_post',
        variants: [],
        isActive: false,
        priority: 2,
        conditions: [],
      });

      const allRules = personalizationEngine.getAllRules();
      expect(allRules).toHaveLength(2);
    });

    it('should retrieve only active rules', () => {
      const rule1 = personalizationEngine.createRule({
        name: 'Active Rule',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      personalizationEngine.createRule({
        name: 'Inactive Rule',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [],
        isActive: false,
        priority: 2,
        conditions: [],
      });

      const activeRules = personalizationEngine.getActiveRules();
      expect(activeRules).toHaveLength(1);
      expect(activeRules[0].id).toBe(rule1.id);
    });
  });

  describe('Variant Management', () => {
    it('should create a new variant', () => {
      const variant = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Variant A',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'Welcome!' },
        weight: 1.0,
        isActive: true,
      });

      expect(variant.id).toBeDefined();
      expect(variant.contentId).toBe('post_1');
      expect(variant.createdAt).toBeDefined();
    });

    it('should update an existing variant', () => {
      const variant = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Original',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'Test' },
        weight: 1.0,
        isActive: true,
      });

      const updated = personalizationEngine.updateVariant(variant.id, {
        weight: 0.5,
        isActive: false,
      });

      expect(updated).not.toBeNull();
      expect(updated?.weight).toBe(0.5);
      expect(updated?.isActive).toBe(false);
    });

    it('should delete a variant', () => {
      const variant = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Test',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'Test' },
        weight: 1.0,
        isActive: true,
      });

      const deleted = personalizationEngine.deleteVariant(variant.id);
      expect(deleted).toBe(true);

      const retrieved = personalizationEngine.getVariant(variant.id);
      expect(retrieved).toBeUndefined();
    });

    it('should retrieve variants for specific content', () => {
      personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Variant A',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'A' },
        weight: 1.0,
        isActive: true,
      });

      personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Variant B',
        segment: 'returning_visitor',
        contentType: 'blog_post',
        content: { title: 'B' },
        weight: 1.0,
        isActive: true,
      });

      personalizationEngine.createVariant({
        contentId: 'post_2',
        variantName: 'Variant C',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'C' },
        weight: 1.0,
        isActive: true,
      });

      const variants = personalizationEngine.getVariantsForContent('post_1');
      expect(variants).toHaveLength(2);
      expect(variants.every((v) => v.contentId === 'post_1')).toBe(true);
    });

    it('should get variant for user by segment', () => {
      const variant1 = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'New Visitor Variant',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'New!' },
        weight: 1.0,
        isActive: true,
      });

      personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Returning Visitor Variant',
        segment: 'returning_visitor',
        contentType: 'blog_post',
        content: { title: 'Welcome back!' },
        weight: 1.0,
        isActive: true,
      });

      const variant = personalizationEngine.getVariantForUser('post_1', 'new_visitor');
      expect(variant).toBeDefined();
      expect(variant?.id).toBe(variant1.id);
    });
  });

  describe('Condition Evaluation', () => {
    it('should evaluate equals condition', () => {
      const result = personalizationEngine.evaluateConditions(
        [{ field: 'category', operator: 'equals', value: 'Technology' }],
        { category: 'Technology' }
      );
      expect(result).toBe(true);
    });

    it('should evaluate not_equals condition', () => {
      const result = personalizationEngine.evaluateConditions(
        [{ field: 'category', operator: 'not_equals', value: 'Business' }],
        { category: 'Technology' }
      );
      expect(result).toBe(true);
    });

    it('should evaluate contains condition with array', () => {
      const result = personalizationEngine.evaluateConditions(
        [{ field: 'tag', operator: 'contains', value: 'react' }],
        { tag: ['react', 'javascript', 'typescript'] }
      );
      expect(result).toBe(true);
    });

    it('should evaluate contains condition with string', () => {
      const result = personalizationEngine.evaluateConditions(
        [{ field: 'title', operator: 'contains', value: 'React' }],
        { title: 'React for Beginners' }
      );
      expect(result).toBe(true);
    });

    it('should evaluate greater_than condition', () => {
      const result = personalizationEngine.evaluateConditions(
        [{ field: 'engagementScore', operator: 'greater_than', value: 50 }],
        { engagementScore: 75 }
      );
      expect(result).toBe(true);
    });

    it('should evaluate less_than condition', () => {
      const result = personalizationEngine.evaluateConditions(
        [{ field: 'engagementScore', operator: 'less_than', value: 80 }],
        { engagementScore: 75 }
      );
      expect(result).toBe(true);
    });

    it('should require all conditions to pass', () => {
      const result = personalizationEngine.evaluateConditions(
        [
          { field: 'category', operator: 'equals', value: 'Technology' },
          { field: 'engagementScore', operator: 'greater_than', value: 50 },
        ],
        { category: 'Technology', engagementScore: 75 }
      );
      expect(result).toBe(true);
    });

    it('should return true with empty conditions', () => {
      const result = personalizationEngine.evaluateConditions([], {});
      expect(result).toBe(true);
    });

    it('should return false when any condition fails', () => {
      const result = personalizationEngine.evaluateConditions(
        [
          { field: 'category', operator: 'equals', value: 'Technology' },
          { field: 'engagementScore', operator: 'greater_than', value: 50 },
        ],
        { category: 'Business', engagementScore: 75 }
      );
      expect(result).toBe(false);
    });
  });

  describe('Content Personalization', () => {
    it('should return personalized content based on rule', () => {
      const variant = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Personalized',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'Welcome!' },
        weight: 1.0,
        isActive: true,
      });

      personalizationEngine.createRule({
        name: 'New Visitor Welcome',
        description: 'Show welcome to new visitors',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [variant],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      const personalized = personalizationEngine.personalizeContent(
        'post_1',
        'new_visitor',
        'blog_post',
        {}
      );

      expect(personalized).not.toBeNull();
      expect(personalized).toEqual({ title: 'Welcome!' });
    });

    it('should return null when no matching rule', () => {
      const personalized = personalizationEngine.personalizeContent(
        'post_1',
        'new_visitor',
        'blog_post',
        {}
      );

      expect(personalized).toBeNull();
    });

    it('should evaluate conditions before personalizing', () => {
      const variant = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Tech Content',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'Tech!' },
        weight: 1.0,
        isActive: true,
      });

      personalizationEngine.createRule({
        name: 'Tech Rule',
        description: 'Show tech content',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [variant],
        isActive: true,
        priority: 1,
        conditions: [{ field: 'category', operator: 'equals', value: 'Technology' }],
      });

      const personalized = personalizationEngine.personalizeContent(
        'post_1',
        'new_visitor',
        'blog_post',
        { category: 'Business' }
      );

      expect(personalized).toBeNull();
    });

    it('should respect higher priority rules', () => {
      const variant1 = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'High Priority',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'High!' },
        weight: 1.0,
        isActive: true,
      });

      const variant2 = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Low Priority',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'Low!' },
        weight: 1.0,
        isActive: true,
      });

      personalizationEngine.createRule({
        name: 'Low Priority Rule',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [variant2],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      personalizationEngine.createRule({
        name: 'High Priority Rule',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [variant1],
        isActive: true,
        priority: 10,
        conditions: [],
      });

      const personalized = personalizationEngine.personalizeContent(
        'post_1',
        'new_visitor',
        'blog_post',
        {}
      );

      expect(personalized).toEqual({ title: 'High!' });
    });

    it('should return null when disabled', () => {
      personalizationEngine.setEnabled(false);

      const variant = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Test',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'Test' },
        weight: 1.0,
        isActive: true,
      });

      personalizationEngine.createRule({
        name: 'Test Rule',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [variant],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      const personalized = personalizationEngine.personalizeContent(
        'post_1',
        'new_visitor',
        'blog_post',
        {}
      );

      expect(personalized).toBeNull();

      personalizationEngine.setEnabled(true);
    });
  });

  describe('Metrics Tracking', () => {
    it('should track impressions', () => {
      const metrics = personalizationEngine.getMetrics('rule_1');
      expect(metrics).toBeUndefined();

      personalizationEngine.trackImpression('rule_1', 'variant_1', 'new_visitor');

      const updated = personalizationEngine.getMetrics('rule_1');
      expect(updated).toBeDefined();
      expect(updated?.views).toBe(1);
    });

    it('should track clicks', () => {
      personalizationEngine.trackImpression('rule_1', 'variant_1', 'new_visitor');
      personalizationEngine.trackClick('rule_1');

      const metrics = personalizationEngine.getMetrics('rule_1');
      expect(metrics?.clicks).toBe(1);
    });

    it('should track engagement', () => {
      personalizationEngine.trackImpression('rule_1', 'variant_1', 'new_visitor');
      personalizationEngine.trackEngagement('rule_1', 50);

      const metrics = personalizationEngine.getMetrics('rule_1');
      expect(metrics?.engagement).toBe(50);
    });

    it('should track conversions', () => {
      personalizationEngine.trackImpression('rule_1', 'variant_1', 'new_visitor');
      personalizationEngine.trackConversion('rule_1');

      const metrics = personalizationEngine.getMetrics('rule_1');
      expect(metrics?.conversions).toBe(1);
    });

    it('should calculate lift', () => {
      personalizationEngine.trackImpression('rule_1', 'variant_1', 'new_visitor');
      personalizationEngine.trackConversion('rule_1');

      const lift = personalizationEngine.calculateLift('rule_1', 0.05); // 5% baseline
      expect(lift).toBeDefined();
      expect(lift).toBeGreaterThan(0);
    });

    it('should get all metrics', () => {
      personalizationEngine.trackImpression('rule_1', 'variant_1', 'new_visitor');
      personalizationEngine.trackImpression('rule_2', 'variant_2', 'returning_visitor');

      const allMetrics = personalizationEngine.getAllMetrics();
      expect(allMetrics).toHaveLength(2);
    });

    it('should get analytics summary', () => {
      const variant = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Test',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'Test' },
        weight: 1.0,
        isActive: true,
      });

      const rule = personalizationEngine.createRule({
        name: 'Test Rule',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [variant],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      personalizationEngine.trackImpression(rule.id, variant.id, 'new_visitor');
      personalizationEngine.trackImpression(rule.id, variant.id, 'new_visitor');
      personalizationEngine.trackEngagement(rule.id, 100);

      const analytics = personalizationEngine.getAnalytics();
      expect(analytics.totalRules).toBe(1);
      expect(analytics.activeRules).toBe(1);
      expect(analytics.totalVariants).toBe(1);
      expect(analytics.activeVariants).toBe(1);
      expect(analytics.totalImpressions).toBe(2);
      expect(analytics.totalEngagements).toBe(100);
    });
  });

  describe('Persistence', () => {
    it('should persist rules to localStorage', () => {
      const rule = personalizationEngine.createRule({
        name: 'Test Rule',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      const stored = localStorage.getItem('personalization_rules');
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(rule.id);
    });

    it('should persist variants to localStorage', () => {
      const variant = personalizationEngine.createVariant({
        contentId: 'post_1',
        variantName: 'Test',
        segment: 'new_visitor',
        contentType: 'blog_post',
        content: { title: 'Test' },
        weight: 1.0,
        isActive: true,
      });

      const stored = localStorage.getItem('personalization_variants');
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(variant.id);
    });

    it('should persist metrics to localStorage', () => {
      personalizationEngine.trackImpression('rule_1', 'variant_1', 'new_visitor');

      const stored = localStorage.getItem('personalization_metrics');
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
    });

    it('should reset all data', () => {
      personalizationEngine.createRule({
        name: 'Test Rule',
        description: 'Test',
        segment: 'new_visitor',
        trigger: 'on_page_load',
        contentType: 'blog_post',
        variants: [],
        isActive: true,
        priority: 1,
        conditions: [],
      });

      personalizationEngine.reset();

      expect(localStorage.getItem('personalization_rules')).toBeNull();
      expect(localStorage.getItem('personalization_variants')).toBeNull();
      expect(localStorage.getItem('personalization_metrics')).toBeNull();
    });
  });
});
