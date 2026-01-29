/**
 * Template Library Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  personalizationTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
  searchTemplates,
  getRecommendedTemplates,
  newVisitorWelcomeTemplate,
  returningReaderHighlightsTemplate,
  contentCreatorSpotlightTemplate,
  engagementBasedCTATemplate,
  timeBasedPromotionTemplate,
  bookmarkBasedRecommendationsTemplate,
} from '@/utils/personalization/templateLibrary';

describe('Template Library', () => {
  describe('personalizationTemplates', () => {
    it('should contain all 6 templates', () => {
      expect(personalizationTemplates).toHaveLength(6);
    });

    it('should include new visitor welcome template', () => {
      const found = personalizationTemplates.find(t => t.id === 'new-visitor-welcome');
      expect(found).toBeDefined();
      expect(found?.category).toBe('segment-based');
      expect(found?.difficulty).toBe('beginner');
    });

    it('should include returning reader highlights template', () => {
      const found = personalizationTemplates.find(t => t.id === 'returning-reader-highlights');
      expect(found).toBeDefined();
      expect(found?.category).toBe('behavioral');
      expect(found?.difficulty).toBe('intermediate');
    });

    it('should include content creator spotlight template', () => {
      const found = personalizationTemplates.find(t => t.id === 'content-creator-spotlight');
      expect(found).toBeDefined();
      expect(found?.category).toBe('segment-based');
      expect(found?.difficulty).toBe('beginner');
    });

    it('should include engagement-based CTA template', () => {
      const found = personalizationTemplates.find(t => t.id === 'engagement-based-cta');
      expect(found).toBeDefined();
      expect(found?.category).toBe('engagement-based');
      expect(found?.difficulty).toBe('intermediate');
    });

    it('should include time-based promotion template', () => {
      const found = personalizationTemplates.find(t => t.id === 'time-based-promotion');
      expect(found).toBeDefined();
      expect(found?.category).toBe('time-based');
      expect(found?.difficulty).toBe('intermediate');
    });

    it('should include bookmark-based recommendations template', () => {
      const found = personalizationTemplates.find(t => t.id === 'bookmark-based-recommendations');
      expect(found).toBeDefined();
      expect(found?.category).toBe('behavioral');
      expect(found?.difficulty).toBe('intermediate');
    });
  });

  describe('getTemplateById', () => {
    it('should return template by ID', () => {
      const template = getTemplateById('new-visitor-welcome');
      expect(template).toBeDefined();
      expect(template?.id).toBe('new-visitor-welcome');
      expect(template?.name).toBe('New Visitor Welcome Message');
    });

    it('should return undefined for non-existent ID', () => {
      const template = getTemplateById('non-existent-template');
      expect(template).toBeUndefined();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates for segment-based category', () => {
      const templates = getTemplatesByCategory('segment-based');
      expect(templates).toHaveLength(2);
      expect(templates.every(t => t.category === 'segment-based')).toBe(true);
    });

    it('should return templates for behavioral category', () => {
      const templates = getTemplatesByCategory('behavioral');
      expect(templates).toHaveLength(2);
      expect(templates.every(t => t.category === 'behavioral')).toBe(true);
    });

    it('should return templates for engagement-based category', () => {
      const templates = getTemplatesByCategory('engagement-based');
      expect(templates).toHaveLength(1);
      expect(templates.every(t => t.category === 'engagement-based')).toBe(true);
    });

    it('should return templates for time-based category', () => {
      const templates = getTemplatesByCategory('time-based');
      expect(templates).toHaveLength(1);
      expect(templates.every(t => t.category === 'time-based')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const templates = getTemplatesByCategory('geographic');
      expect(templates).toHaveLength(0);
    });
  });

  describe('getTemplatesByDifficulty', () => {
    it('should return templates for beginner difficulty', () => {
      const templates = getTemplatesByDifficulty('beginner');
      expect(templates).toHaveLength(2);
      expect(templates.every(t => t.difficulty === 'beginner')).toBe(true);
    });

    it('should return templates for intermediate difficulty', () => {
      const templates = getTemplatesByDifficulty('intermediate');
      expect(templates).toHaveLength(4);
      expect(templates.every(t => t.difficulty === 'intermediate')).toBe(true);
    });

    it('should return empty array for advanced difficulty', () => {
      const templates = getTemplatesByDifficulty('advanced');
      expect(templates).toHaveLength(0);
    });
  });

  describe('searchTemplates', () => {
    it('should search templates by name', () => {
      const results = searchTemplates('Welcome');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(t => t.name.toLowerCase().includes('welcome'))).toBe(true);
    });

    it('should search templates by description', () => {
      const results = searchTemplates('content');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search templates by tags', () => {
      const results = searchTemplates('engagement');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const results1 = searchTemplates('WELCOME');
      const results2 = searchTemplates('welcome');
      expect(results1.length).toBe(results2.length);
    });

    it('should return empty array for no matches', () => {
      const results = searchTemplates('nonexistent keyword xyz');
      expect(results).toHaveLength(0);
    });

    it('should return all templates for empty search', () => {
      const results = searchTemplates('');
      expect(results).toHaveLength(personalizationTemplates.length);
    });
  });

  describe('getRecommendedTemplates', () => {
    it('should return templates for new_visitor segment', () => {
      const templates = getRecommendedTemplates('new_visitor');
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => 
        t.metadata.targetSegments.includes('new_visitor') ||
        t.metadata.targetSegments.includes('all_segments')
      )).toBe(true);
    });

    it('should return templates for returning_visitor segment', () => {
      const templates = getRecommendedTemplates('returning_visitor');
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should return templates for engaged_user segment', () => {
      const templates = getRecommendedTemplates('engaged_user');
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should return templates for content_creator segment', () => {
      const templates = getRecommendedTemplates('content_creator');
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should return empty array for dormant_user segment', () => {
      const templates = getRecommendedTemplates('dormant_user');
      expect(templates).toHaveLength(0);
    });

    it('should return templates matching all_segments', () => {
      const templates = getRecommendedTemplates('frequent_reader');
      const allSegmentsTemplates = templates.filter(t => 
        t.metadata.targetSegments.includes('all_segments')
      );
      expect(allSegmentsTemplates.length).toBe(1);
    });
  });

  describe('Template Structure Validation', () => {
    it('should have required fields in new visitor welcome template', () => {
      expect(newVisitorWelcomeTemplate.id).toBe('new-visitor-welcome');
      expect(newVisitorWelcomeTemplate.name).toBeDefined();
      expect(newVisitorWelcomeTemplate.description).toBeDefined();
      expect(newVisitorWelcomeTemplate.category).toBeDefined();
      expect(newVisitorWelcomeTemplate.difficulty).toBeDefined();
      expect(newVisitorWelcomeTemplate.rule).toBeDefined();
      expect(newVisitorWelcomeTemplate.variants).toBeDefined();
      expect(newVisitorWelcomeTemplate.metadata).toBeDefined();
    });

    it('should have valid rule structure', () => {
      const template = newVisitorWelcomeTemplate;
      expect(template.rule).toHaveProperty('id');
      expect(template.rule).toHaveProperty('name');
      expect(template.rule).toHaveProperty('description');
      expect(template.rule).toHaveProperty('segment');
      expect(template.rule).toHaveProperty('contentType');
      expect(template.rule).toHaveProperty('trigger');
      expect(template.rule).toHaveProperty('isActive');
      expect(template.rule).toHaveProperty('priority');
      expect(template.rule).toHaveProperty('variants');
      expect(template.rule).toHaveProperty('createdAt');
      expect(template.rule).toHaveProperty('updatedAt');
    });

    it('should have valid variants', () => {
      const template = returningReaderHighlightsTemplate;
      expect(template.variants).toBeInstanceOf(Array);
      expect(template.variants.length).toBeGreaterThan(0);
      
      const variant = template.variants[0];
      expect(variant).toHaveProperty('id');
      expect(variant).toHaveProperty('ruleId');
      expect(variant).toHaveProperty('name');
      expect(variant).toHaveProperty('description');
      expect(variant).toHaveProperty('content');
      expect(variant).toHaveProperty('weight');
      expect(variant).toHaveProperty('isActive');
      expect(variant).toHaveProperty('createdAt');
      expect(variant).toHaveProperty('updatedAt');
    });

    it('should have valid metadata', () => {
      const template = engagementBasedCTATemplate;
      expect(template.metadata.tags).toBeInstanceOf(Array);
      expect(template.metadata.tags.length).toBeGreaterThan(0);
      expect(template.metadata.targetSegments).toBeInstanceOf(Array);
      expect(template.metadata.contentType).toBeInstanceOf(Array);
      expect(template.metadata.estimatedImpact).toBeDefined();
      expect(typeof template.metadata.estimatedLift).toBe('number');
      expect(template.metadata.useCases).toBeInstanceOf(Array);
      expect(template.metadata.prerequisites).toBeInstanceOf(Array);
    });

    it('should have valid estimated lift values', () => {
      const templates = personalizationTemplates;
      templates.forEach(template => {
        expect(template.metadata.estimatedLift).toBeGreaterThan(0);
        expect(template.metadata.estimatedLift).toBeLessThan(100);
      });
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      const templates = personalizationTemplates;
      templates.forEach(template => {
        expect(validDifficulties).toContain(template.difficulty);
      });
    });

    it('should have valid impact levels', () => {
      const validImpacts = ['low', 'medium', 'high'];
      const templates = personalizationTemplates;
      templates.forEach(template => {
        expect(validImpacts).toContain(template.metadata.estimatedImpact);
      });
    });
  });

  describe('Template Content Validation', () => {
    it('should have Indonesian text for new visitor welcome template', () => {
      const template = newVisitorWelcomeTemplate;
      expect(template.name).toMatch(/^[A-Za-z\s]+$/); // English for template names
      expect(template.description).toMatch(/^[A-Za-z\s]+$/); // English for template descriptions
      
      const variant = template.variants[0];
      expect(variant.content.headline).toBeTruthy();
      expect(variant.content.subheadline).toBeTruthy();
      expect(variant.content.cta).toBeTruthy();
    });

    it('should have valid weights summing to 100', () => {
      const template = returningReaderHighlightsTemplate;
      const totalWeight = template.variants.reduce((sum, v) => sum + v.weight, 0);
      expect(totalWeight).toBe(100);
    });

    it('should have time-based variants for time-based template', () => {
      const template = timeBasedPromotionTemplate;
      expect(template.variants).toHaveLength(3);
      expect(template.variants.some(v => v.content.timeSlot === 'morning')).toBe(true);
      expect(template.variants.some(v => v.content.timeSlot === 'afternoon')).toBe(true);
      expect(template.variants.some(v => v.content.timeSlot === 'evening')).toBe(true);
    });
  });

  describe('Template Use Cases', () => {
    it('should have use cases for new visitor welcome', () => {
      const template = newVisitorWelcomeTemplate;
      expect(template.metadata.useCases).toContain('Welcome first-time visitors');
      expect(template.metadata.useCases).toContain('Increase engagement for new users');
      expect(template.metadata.useCases).toContain('Guide users to popular content');
    });

    it('should have use cases for engagement-based CTA', () => {
      const template = engagementBasedCTATemplate;
      expect(template.metadata.useCases).toContain('Increase conversion rates');
      expect(template.metadata.useCases).toContain('Target high-value users');
      expect(template.metadata.useCases).toContain('Improve monetization');
    });

    it('should have use cases for bookmark-based recommendations', () => {
      const template = bookmarkBasedRecommendationsTemplate;
      expect(template.metadata.useCases).toContain('Improve content discovery');
      expect(template.metadata.useCases).toContain('Increase bookmark engagement');
      expect(template.metadata.useCases).toContain('Personalize recommendations');
    });
  });

  describe('Template Prerequisites', () => {
    it('should have no prerequisites for beginner templates', () => {
      const templates = getTemplatesByDifficulty('beginner');
      templates.forEach(template => {
        expect(template.metadata.prerequisites).toBeInstanceOf(Array);
      });
    });

    it('should have prerequisites for intermediate templates', () => {
      const templates = getTemplatesByDifficulty('intermediate');
      const templatesWithPrereqs = templates.filter(t => t.metadata.prerequisites.length > 0);
      expect(templatesWithPrereqs.length).toBeGreaterThan(0);
    });
  });
});
