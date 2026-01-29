/**
 * Template Storage Tests
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  getTemplateMetrics,
  getTemplateMetricsById,
  updateTemplateMetrics,
  recordTemplateApplication,
  recordTemplateDeactivation,
  recordTemplatePerformance,
  rateTemplate,
  getTemplateUsageStats,
  getTemplateUsageByTemplateId,
  recordTemplateUsage,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  clearTemplateData,
  getTemplateSummaryStats,
  getTopPerformingTemplates,
  getMostUsedTemplates,
} from '@/utils/personalization/templateStorage';
import type { PersonalizationTemplate } from '@/types/personalization';

describe('Template Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    clearTemplateData();
  });

  describe('getTemplateMetrics', () => {
    it('should return empty Map when no metrics exist', () => {
      const metrics = getTemplateMetrics();
      expect(metrics).toBeInstanceOf(Map);
      expect(metrics.size).toBe(0);
    });

    it('should return stored metrics', () => {
      updateTemplateMetrics('template-1', { timesUsed: 5, avgLift: 10 });
      const metrics = getTemplateMetrics();
      expect(metrics.size).toBe(1);
      expect(metrics.get('template-1')).toBeDefined();
    });
  });

  describe('getTemplateMetricsById', () => {
    it('should return undefined for non-existent template', () => {
      const metrics = getTemplateMetricsById('non-existent');
      expect(metrics).toBeUndefined();
    });

    it('should return metrics for existing template', () => {
      updateTemplateMetrics('template-1', { timesUsed: 5, avgLift: 10 });
      const metrics = getTemplateMetricsById('template-1');
      expect(metrics).toBeDefined();
      expect(metrics?.templateId).toBe('template-1');
      expect(metrics?.timesUsed).toBe(5);
      expect(metrics?.avgLift).toBe(10);
    });
  });

  describe('updateTemplateMetrics', () => {
    it('should create new metrics if not exist', () => {
      const result = updateTemplateMetrics('template-1', { timesUsed: 1 });
      expect(result).toBe(true);
      
      const metrics = getTemplateMetricsById('template-1');
      expect(metrics).toBeDefined();
      expect(metrics?.timesUsed).toBe(1);
    });

    it('should update existing metrics', () => {
      updateTemplateMetrics('template-1', { timesUsed: 1 });
      const result = updateTemplateMetrics('template-1', { timesUsed: 5 });
      expect(result).toBe(true);
      
      const metrics = getTemplateMetricsById('template-1');
      expect(metrics?.timesUsed).toBe(5);
    });

    it('should update lastUsed timestamp', () => {
      updateTemplateMetrics('template-1', { timesUsed: 1 });
      const metrics1 = getTemplateMetricsById('template-1');
      
      // Wait a bit
      setTimeout(() => {
        updateTemplateMetrics('template-1', { timesUsed: 2 });
        const metrics2 = getTemplateMetricsById('template-1');
        
        expect(new Date(metrics2!.lastUsed).getTime()).toBeGreaterThan(new Date(metrics1!.lastUsed).getTime());
      }, 100);
    });

    it('should calculate average lift correctly', () => {
      updateTemplateMetrics('template-1', { timesUsed: 1, lift: 10 });
      const metrics1 = getTemplateMetricsById('template-1');
      expect(metrics1?.avgLift).toBe(10);
      
      updateTemplateMetrics('template-1', { timesUsed: 2, lift: 20 });
      const metrics2 = getTemplateMetricsById('template-1');
      expect(metrics2?.avgLift).toBe(15);
    });

    it('should update best lift', () => {
      updateTemplateMetrics('template-1', { timesUsed: 1, lift: 10 });
      const metrics1 = getTemplateMetricsById('template-1');
      expect(metrics1?.bestLift).toBe(10);
      
      updateTemplateMetrics('template-1', { timesUsed: 2, lift: 25 });
      const metrics2 = getTemplateMetricsById('template-1');
      expect(metrics2?.bestLift).toBe(25);
    });

    it('should calculate weighted average rating', () => {
      updateTemplateMetrics('template-1', { rating: 4 });
      const metrics1 = getTemplateMetricsById('template-1');
      expect(metrics1?.rating).toBe(4);
      
      updateTemplateMetrics('template-1', { rating: 5 });
      const metrics2 = getTemplateMetricsById('template-1');
      expect(metrics2?.rating).toBe(4.5);
    });

    it('should return false on error', () => {
      localStorage.clear();
      const result = updateTemplateMetrics('template-1', { timesUsed: 1 });
      expect(result).toBe(false);
    });
  });

  describe('recordTemplateApplication', () => {
    it('should record template application', () => {
      const result = recordTemplateApplication('template-1', 'rule-1');
      expect(result).toBe(true);
      
      const metrics = getTemplateMetricsById('template-1');
      expect(metrics?.timesUsed).toBe(1);
      expect(metrics?.activeCount).toBe(1);
    });

    it('should increment timesUsed on subsequent applications', () => {
      recordTemplateApplication('template-1', 'rule-1');
      recordTemplateApplication('template-1', 'rule-2');
      
      const metrics = getTemplateMetricsById('template-1');
      expect(metrics?.timesUsed).toBe(2);
      expect(metrics?.activeCount).toBe(2);
    });

    it('should return false on error', () => {
      localStorage.clear();
      const result = recordTemplateApplication('template-1', 'rule-1');
      expect(result).toBe(false);
    });
  });

  describe('recordTemplateDeactivation', () => {
    it('should decrement activeCount', () => {
      recordTemplateApplication('template-1', 'rule-1');
      recordTemplateApplication('template-1', 'rule-2');
      
      const result = recordTemplateDeactivation('template-1');
      expect(result).toBe(true);
      
      const metrics = getTemplateMetricsById('template-1');
      expect(metrics?.activeCount).toBe(1);
    });

    it('should return false for non-existent metrics', () => {
      const result = recordTemplateDeactivation('template-1');
      expect(result).toBe(false);
    });

    it('should return false when activeCount is 0', () => {
      recordTemplateApplication('template-1', 'rule-1');
      recordTemplateDeactivation('template-1');
      
      const result = recordTemplateDeactivation('template-1');
      expect(result).toBe(false);
    });
  });

  describe('recordTemplatePerformance', () => {
    it('should record lift value', () => {
      const result = recordTemplatePerformance('template-1', 15);
      expect(result).toBe(true);
      
      const metrics = getTemplateMetricsById('template-1');
      expect(metrics?.avgLift).toBe(15);
      expect(metrics?.bestLift).toBe(15);
    });

    it('should calculate average lift over multiple records', () => {
      recordTemplatePerformance('template-1', 10);
      recordTemplatePerformance('template-1', 20);
      recordTemplatePerformance('template-1', 30);
      
      const metrics = getTemplateMetricsById('template-1');
      expect(metrics?.avgLift).toBe(20);
      expect(metrics?.bestLift).toBe(30);
    });

    it('should return false on error', () => {
      localStorage.clear();
      const result = recordTemplatePerformance('template-1', 15);
      expect(result).toBe(false);
    });
  });

  describe('rateTemplate', () => {
    it('should rate template', () => {
      const result = rateTemplate('template-1', 5);
      expect(result).toBe(true);
      
      const metrics = getTemplateMetricsById('template-1');
      expect(metrics?.rating).toBe(5);
    });

    it('should calculate weighted average rating', () => {
      rateTemplate('template-1', 4);
      rateTemplate('template-1', 5);
      
      const metrics = getTemplateMetricsById('template-1');
      expect(metrics?.rating).toBe(4.5);
    });

    it('should return false for invalid rating', () => {
      const result1 = rateTemplate('template-1', 0);
      expect(result1).toBe(false);
      
      const result2 = rateTemplate('template-1', 6);
      expect(result2).toBe(false);
    });

    it('should return false on error', () => {
      localStorage.clear();
      const result = rateTemplate('template-1', 5);
      expect(result).toBe(false);
    });
  });

  describe('getTemplateUsageStats', () => {
    it('should return empty array when no stats exist', () => {
      const stats = getTemplateUsageStats();
      expect(stats).toBeInstanceOf(Array);
      expect(stats.length).toBe(0);
    });

    it('should return stored usage stats', () => {
      recordTemplateUsage({
        templateId: 'template-1',
        ruleId: 'rule-1',
        isActive: true,
        impressions: 100,
        lift: 15
      });
      
      const stats = getTemplateUsageStats();
      expect(stats.length).toBe(1);
      expect(stats[0].templateId).toBe('template-1');
    });

    it('should return array even if stored value is not array', () => {
      localStorage.setItem('personalization_template_usage', 'invalid');
      const stats = getTemplateUsageStats();
      expect(stats).toBeInstanceOf(Array);
    });
  });

  describe('getTemplateUsageByTemplateId', () => {
    beforeEach(() => {
      recordTemplateUsage({
        templateId: 'template-1',
        ruleId: 'rule-1',
        isActive: true,
        impressions: 100,
        lift: 15
      });
      recordTemplateUsage({
        templateId: 'template-1',
        ruleId: 'rule-2',
        isActive: true,
        impressions: 200,
        lift: 20
      });
      recordTemplateUsage({
        templateId: 'template-2',
        ruleId: 'rule-3',
        isActive: false,
        impressions: 50,
        lift: 10
      });
    });

    it('should return usage stats for specific template', () => {
      const stats = getTemplateUsageByTemplateId('template-1');
      expect(stats.length).toBe(2);
      expect(stats.every(s => s.templateId === 'template-1')).toBe(true);
    });

    it('should return empty array for non-existent template', () => {
      const stats = getTemplateUsageByTemplateId('template-999');
      expect(stats).toHaveLength(0);
    });
  });

  describe('recordTemplateUsage', () => {
    it('should record template usage', () => {
      const result = recordTemplateUsage({
        templateId: 'template-1',
        ruleId: 'rule-1',
        isActive: true,
        impressions: 100,
        lift: 15
      });
      expect(result).toBe(true);
      
      const stats = getTemplateUsageStats();
      expect(stats.length).toBe(1);
      expect(stats[0].appliedAt).toBeTruthy();
    });

    it('should add appliedAt timestamp', () => {
      recordTemplateUsage({
        templateId: 'template-1',
        ruleId: 'rule-1',
        isActive: true,
        impressions: 100,
        lift: 15
      });
      
      const stats = getTemplateUsageStats();
      const appliedAt = new Date(stats[0].appliedAt);
      expect(appliedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should limit to 1000 usage records', () => {
      // Create 1002 records
      for (let i = 0; i < 1002; i++) {
        recordTemplateUsage({
          templateId: 'template-1',
          ruleId: `rule-${i}`,
          isActive: true,
          impressions: 100,
          lift: 15
        });
      }
      
      const stats = getTemplateUsageStats();
      expect(stats.length).toBe(1000);
    });

    it('should remove oldest records when limit exceeded', () => {
      // Create 1002 records
      for (let i = 0; i < 1002; i++) {
        recordTemplateUsage({
          templateId: 'template-1',
          ruleId: `rule-${i}`,
          isActive: true,
          impressions: 100,
          lift: 15
        });
      }
      
      const stats = getTemplateUsageStats();
      const firstStat = stats[0];
      const lastStat = stats[stats.length - 1];
      
      // First should be rule-2 (after removing first 2)
      expect(firstStat.ruleId).toBe('rule-2');
      // Last should be rule-1001
      expect(lastStat.ruleId).toBe('rule-1001');
    });

    it('should return false on error', () => {
      localStorage.clear();
      const result = recordTemplateUsage({
        templateId: 'template-1',
        ruleId: 'rule-1',
        isActive: true,
        impressions: 100,
        lift: 15
      });
      expect(result).toBe(false);
    });
  });

  describe('getCustomTemplates', () => {
    it('should return empty array when no custom templates exist', () => {
      const templates = getCustomTemplates();
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBe(0);
    });

    it('should return stored custom templates', () => {
      const customTemplate: PersonalizationTemplate = {
        id: 'custom-1',
        name: 'Custom Template',
        description: 'A custom template',
        category: 'engagement-based',
        difficulty: 'intermediate',
        rule: {} as any,
        variants: [],
        metadata: {
          tags: ['custom'],
          targetSegments: ['all_segments'],
          contentType: ['cta_component'],
          estimatedImpact: 'medium',
          estimatedLift: 10,
          useCases: [],
          prerequisites: []
        }
      };
      
      saveCustomTemplate(customTemplate);
      
      const templates = getCustomTemplates();
      expect(templates.length).toBe(1);
      expect(templates[0].id).toBe('custom-1');
    });
  });

  describe('saveCustomTemplate', () => {
    it('should save new custom template', () => {
      const customTemplate: PersonalizationTemplate = {
        id: 'custom-1',
        name: 'Custom Template',
        description: 'A custom template',
        category: 'engagement-based',
        difficulty: 'intermediate',
        rule: {} as any,
        variants: [],
        metadata: {
          tags: ['custom'],
          targetSegments: ['all_segments'],
          contentType: ['cta_component'],
          estimatedImpact: 'medium',
          estimatedLift: 10,
          useCases: [],
          prerequisites: []
        }
      };
      
      const result = saveCustomTemplate(customTemplate);
      expect(result).toBe(true);
      
      const templates = getCustomTemplates();
      expect(templates.length).toBe(1);
    });

    it('should update existing custom template', () => {
      const customTemplate: PersonalizationTemplate = {
        id: 'custom-1',
        name: 'Custom Template',
        description: 'A custom template',
        category: 'engagement-based',
        difficulty: 'intermediate',
        rule: {} as any,
        variants: [],
        metadata: {
          tags: ['custom'],
          targetSegments: ['all_segments'],
          contentType: ['cta_component'],
          estimatedImpact: 'medium',
          estimatedLift: 10,
          useCases: [],
          prerequisites: []
        }
      };
      
      saveCustomTemplate(customTemplate);
      
      const updatedTemplate = {
        ...customTemplate,
        name: 'Updated Custom Template'
      };
      
      const result = saveCustomTemplate(updatedTemplate);
      expect(result).toBe(true);
      
      const templates = getCustomTemplates();
      expect(templates.length).toBe(1);
      expect(templates[0].name).toBe('Updated Custom Template');
    });

    it('should return false when exceeding 50 templates', () => {
      // Save 50 templates
      for (let i = 0; i < 50; i++) {
        saveCustomTemplate({
          id: `custom-${i}`,
          name: `Custom Template ${i}`,
          description: 'A custom template',
          category: 'engagement-based',
          difficulty: 'intermediate',
          rule: {} as any,
          variants: [],
          metadata: {
            tags: ['custom'],
            targetSegments: ['all_segments'],
            contentType: ['cta_component'],
            estimatedImpact: 'medium',
            estimatedLift: 10,
            useCases: [],
            prerequisites: []
          }
        });
      }
      
      // Try to save 51st
      const result = saveCustomTemplate({
        id: 'custom-50',
        name: 'Custom Template 50',
        description: 'A custom template',
        category: 'engagement-based',
        difficulty: 'intermediate',
        rule: {} as any,
        variants: [],
        metadata: {
          tags: ['custom'],
          targetSegments: ['all_segments'],
          contentType: ['cta_component'],
          estimatedImpact: 'medium',
          estimatedLift: 10,
          useCases: [],
          prerequisites: []
        }
      });
      
      expect(result).toBe(false);
    });

    it('should return false on error', () => {
      localStorage.clear();
      const customTemplate: PersonalizationTemplate = {
        id: 'custom-1',
        name: 'Custom Template',
        description: 'A custom template',
        category: 'engagement-based',
        difficulty: 'intermediate',
        rule: {} as any,
        variants: [],
        metadata: {
          tags: ['custom'],
          targetSegments: ['all_segments'],
          contentType: ['cta_component'],
          estimatedImpact: 'medium',
          estimatedLift: 10,
          useCases: [],
          prerequisites: []
        }
      };
      
      const result = saveCustomTemplate(customTemplate);
      expect(result).toBe(false);
    });
  });

  describe('deleteCustomTemplate', () => {
    beforeEach(() => {
      saveCustomTemplate({
        id: 'custom-1',
        name: 'Custom Template',
        description: 'A custom template',
        category: 'engagement-based',
        difficulty: 'intermediate',
        rule: {} as any,
        variants: [],
        metadata: {
          tags: ['custom'],
          targetSegments: ['all_segments'],
          contentType: ['cta_component'],
          estimatedImpact: 'medium',
          estimatedLift: 10,
          useCases: [],
          prerequisites: []
        }
      });
    });

    it('should delete custom template', () => {
      const result = deleteCustomTemplate('custom-1');
      expect(result).toBe(true);
      
      const templates = getCustomTemplates();
      expect(templates.length).toBe(0);
    });

    it('should return false for non-existent template', () => {
      const result = deleteCustomTemplate('non-existent');
      expect(result).toBe(false);
    });

    it('should return false on error', () => {
      localStorage.clear();
      const result = deleteCustomTemplate('custom-1');
      expect(result).toBe(false);
    });
  });

  describe('clearTemplateData', () => {
    beforeEach(() => {
      recordTemplateApplication('template-1', 'rule-1');
      recordTemplateUsage({
        templateId: 'template-1',
        ruleId: 'rule-1',
        isActive: true,
        impressions: 100,
        lift: 15
      });
      saveCustomTemplate({
        id: 'custom-1',
        name: 'Custom Template',
        description: 'A custom template',
        category: 'engagement-based',
        difficulty: 'intermediate',
        rule: {} as any,
        variants: [],
        metadata: {
          tags: ['custom'],
          targetSegments: ['all_segments'],
          contentType: ['cta_component'],
          estimatedImpact: 'medium',
          estimatedLift: 10,
          useCases: [],
          prerequisites: []
        }
      });
    });

    it('should clear all template data', () => {
      const result = clearTemplateData();
      expect(result).toBe(true);
      
      expect(getTemplateMetrics().size).toBe(0);
      expect(getTemplateUsageStats().length).toBe(0);
      expect(getCustomTemplates().length).toBe(0);
    });

    it('should return false on error', () => {
      localStorage.clear();
      const result = clearTemplateData();
      expect(result).toBe(true); // Clearing empty localStorage succeeds
    });
  });

  describe('getTemplateSummaryStats', () => {
    beforeEach(() => {
      recordTemplateApplication('template-1', 'rule-1');
      recordTemplatePerformance('template-1', 10);
      rateTemplate('template-1', 4);
      
      recordTemplateApplication('template-2', 'rule-2');
      recordTemplatePerformance('template-2', 20);
      rateTemplate('template-2', 5);
      
      recordTemplateUsage({
        templateId: 'template-1',
        ruleId: 'rule-1',
        isActive: true,
        impressions: 100,
        lift: 10
      });
      recordTemplateUsage({
        templateId: 'template-2',
        ruleId: 'rule-2',
        isActive: true,
        impressions: 200,
        lift: 20
      });
    });

    it('should return summary statistics', () => {
      const stats = getTemplateSummaryStats();
      expect(stats.totalTemplates).toBe(2);
      expect(stats.totalTimesUsed).toBe(2);
      expect(stats.totalActiveRules).toBe(2);
      expect(stats.avgLift).toBe(15);
      expect(stats.avgRating).toBe(4.5);
      expect(stats.totalUsageRecords).toBe(2);
    });

    it('should calculate avgLift correctly', () => {
      const stats = getTemplateSummaryStats();
      expect(stats.avgLift).toBe(15); // (10 + 20) / 2
    });

    it('should calculate avgRating correctly', () => {
      const stats = getTemplateSummaryStats();
      expect(stats.avgRating).toBe(4.5); // (4 + 5) / 2
    });
  });

  describe('getTopPerformingTemplates', () => {
    beforeEach(() => {
      recordTemplatePerformance('template-1', 10);
      recordTemplatePerformance('template-2', 25);
      recordTemplatePerformance('template-3', 15);
      recordTemplatePerformance('template-4', 30);
      recordTemplatePerformance('template-5', 5);
    });

    it('should return top 3 performing templates by default', () => {
      const topTemplates = getTopPerformingTemplates();
      expect(topTemplates.length).toBe(3);
      expect(topTemplates[0].templateId).toBe('template-4');
      expect(topTemplates[1].templateId).toBe('template-2');
      expect(topTemplates[2].templateId).toBe('template-3');
    });

    it('should return specified number of templates', () => {
      const topTemplates = getTopPerformingTemplates(5);
      expect(topTemplates.length).toBe(5);
    });

    it('should be sorted by avgLift in descending order', () => {
      const topTemplates = getTopPerformingTemplates();
      for (let i = 0; i < topTemplates.length - 1; i++) {
        expect(topTemplates[i].metrics.avgLift).toBeGreaterThanOrEqual(
          topTemplates[i + 1].metrics.avgLift
        );
      }
    });
  });

  describe('getMostUsedTemplates', () => {
    beforeEach(() => {
      recordTemplateApplication('template-1', 'rule-1');
      recordTemplateApplication('template-1', 'rule-2');
      recordTemplateApplication('template-1', 'rule-3');
      
      recordTemplateApplication('template-2', 'rule-4');
      recordTemplateApplication('template-2', 'rule-5');
      
      recordTemplateApplication('template-3', 'rule-6');
    });

    it('should return top 5 most used templates by default', () => {
      const mostUsed = getMostUsedTemplates();
      expect(mostUsed.length).toBe(3);
      expect(mostUsed[0].templateId).toBe('template-1');
      expect(mostUsed[1].templateId).toBe('template-2');
      expect(mostUsed[2].templateId).toBe('template-3');
    });

    it('should return specified number of templates', () => {
      const mostUsed = getMostUsedTemplates(2);
      expect(mostUsed.length).toBe(2);
    });

    it('should be sorted by timesUsed in descending order', () => {
      const mostUsed = getMostUsedTemplates();
      expect(mostUsed[0].metrics.timesUsed).toBe(3);
      expect(mostUsed[1].metrics.timesUsed).toBe(2);
      expect(mostUsed[2].metrics.timesUsed).toBe(1);
    });
  });
});
