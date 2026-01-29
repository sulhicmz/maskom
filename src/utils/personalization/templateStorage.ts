/**
 * Personalization Template Storage
 * 
 * Manages template performance metrics and usage statistics in localStorage.
 */

import type {
  PersonalizationTemplate,
  TemplatePerformanceMetrics,
  TemplateUsageStats
} from '@/types/personalization';

const STORAGE_KEY_TEMPLATE_METRICS = 'personalization_template_metrics';
const STORAGE_KEY_TEMPLATE_USAGE = 'personalization_template_usage';
const STORAGE_KEY_CUSTOM_TEMPLATES = 'personalization_custom_templates';

/**
 * Get all template performance metrics
 */
export function getTemplateMetrics(): Map<string, TemplatePerformanceMetrics> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TEMPLATE_METRICS);
    if (!stored) return new Map();
    
    const data = JSON.parse(stored);
    return new Map(Object.entries(data));
  } catch (error) {
    console.error('Error loading template metrics:', error);
    return new Map();
  }
}

/**
 * Get performance metrics for a specific template
 */
export function getTemplateMetricsById(templateId: string): TemplatePerformanceMetrics | undefined {
  const metrics = getTemplateMetrics();
  return metrics.get(templateId);
}

/**
 * Update template performance metrics
 */
export function updateTemplateMetrics(templateId: string, update: Partial<TemplatePerformanceMetrics>): boolean {
  try {
    const metrics = getTemplateMetrics();
    const existing = metrics.get(templateId) || {
      templateId,
      timesUsed: 0,
      activeCount: 0,
      avgLift: 0,
      bestLift: 0,
      lastUsed: new Date().toISOString(),
      rating: 0
    };

    const updated = {
      ...existing,
      ...update,
      lastUsed: new Date().toISOString()
    };

    // Recalculate average lift
    if (update.lift !== undefined) {
      const totalLift = existing.avgLift * existing.timesUsed + update.lift;
      const totalUses = existing.timesUsed + 1;
      updated.avgLift = Math.round((totalLift / totalUses) * 100) / 100;
      
      // Update best lift
      if (update.lift > existing.bestLift) {
        updated.bestLift = update.lift;
      }
    }

    // Update times used
    if (update.timesUsed !== undefined && update.timesUsed > existing.timesUsed) {
      updated.timesUsed = update.timesUsed;
    }

    // Update rating
    if (update.rating !== undefined) {
      // Weighted average rating
      if (existing.rating > 0) {
        updated.rating = Math.round(((existing.rating + update.rating) / 2) * 10) / 10;
      } else {
        updated.rating = update.rating;
      }
    }

    metrics.set(templateId, updated);
    localStorage.setItem(STORAGE_KEY_TEMPLATE_METRICS, JSON.stringify(Object.fromEntries(metrics)));
    
    return true;
  } catch (error) {
    console.error('Error updating template metrics:', error);
    return false;
  }
}

/**
 * Record template application
 */
export function recordTemplateApplication(templateId: string, ruleId: string): boolean {
  try {
    const metrics = getTemplateMetrics();
    const existing = metrics.get(templateId) || {
      templateId,
      timesUsed: 0,
      activeCount: 0,
      avgLift: 0,
      bestLift: 0,
      lastUsed: new Date().toISOString(),
      rating: 0
    };

    return updateTemplateMetrics(templateId, {
      timesUsed: existing.timesUsed + 1,
      activeCount: existing.activeCount + 1
    });
  } catch (error) {
    console.error('Error recording template application:', error);
    return false;
  }
}

/**
 * Record template deactivation
 */
export function recordTemplateDeactivation(templateId: string): boolean {
  try {
    const metrics = getTemplateMetrics();
    const existing = metrics.get(templateId);
    
    if (!existing || existing.activeCount === 0) {
      return false;
    }

    return updateTemplateMetrics(templateId, {
      activeCount: existing.activeCount - 1
    });
  } catch (error) {
    console.error('Error recording template deactivation:', error);
    return false;
  }
}

/**
 * Record template performance (lift)
 */
export function recordTemplatePerformance(templateId: string, lift: number): boolean {
  try {
    return updateTemplateMetrics(templateId, { lift });
  } catch (error) {
    console.error('Error recording template performance:', error);
    return false;
  }
}

/**
 * Rate template
 */
export function rateTemplate(templateId: string, rating: number): boolean {
  try {
    if (rating < 1 || rating > 5) {
      console.error('Rating must be between 1 and 5');
      return false;
    }

    return updateTemplateMetrics(templateId, { rating });
  } catch (error) {
    console.error('Error rating template:', error);
    return false;
  }
}

/**
 * Get all template usage statistics
 */
export function getTemplateUsageStats(): TemplateUsageStats[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TEMPLATE_USAGE);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading template usage stats:', error);
    return [];
  }
}

/**
 * Get usage statistics for a specific template
 */
export function getTemplateUsageByTemplateId(templateId: string): TemplateUsageStats[] {
  const allStats = getTemplateUsageStats();
  return allStats.filter(s => s.templateId === templateId);
}

/**
 * Record template usage
 */
export function recordTemplateUsage(usage: Omit<TemplateUsageStats, 'appliedAt'>): boolean {
  try {
    const allStats = getTemplateUsageStats();
    
    const newUsage: TemplateUsageStats = {
      ...usage,
      appliedAt: new Date().toISOString()
    };

    // Max 1000 usage records, remove oldest if exceeded
    if (allStats.length >= 1000) {
      allStats.shift();
    }

    allStats.push(newUsage);
    localStorage.setItem(STORAGE_KEY_TEMPLATE_USAGE, JSON.stringify(allStats));
    
    return true;
  } catch (error) {
    console.error('Error recording template usage:', error);
    return false;
  }
}

/**
 * Get custom templates
 */
export function getCustomTemplates(): PersonalizationTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_TEMPLATES);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading custom templates:', error);
    return [];
  }
}

/**
 * Save custom template
 */
export function saveCustomTemplate(template: PersonalizationTemplate): boolean {
  try {
    const customTemplates = getCustomTemplates();
    
    // Check if template already exists
    const existingIndex = customTemplates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      // Update existing
      customTemplates[existingIndex] = template;
    } else {
      // Add new
      customTemplates.push(template);
    }

    // Max 50 custom templates
    if (customTemplates.length > 50) {
      console.warn('Maximum 50 custom templates reached');
      return false;
    }

    localStorage.setItem(STORAGE_KEY_CUSTOM_TEMPLATES, JSON.stringify(customTemplates));
    
    return true;
  } catch (error) {
    console.error('Error saving custom template:', error);
    return false;
  }
}

/**
 * Delete custom template
 */
export function deleteCustomTemplate(templateId: string): boolean {
  try {
    const customTemplates = getCustomTemplates();
    const filtered = customTemplates.filter(t => t.id !== templateId);
    
    if (filtered.length === customTemplates.length) {
      console.warn('Template not found:', templateId);
      return false;
    }

    localStorage.setItem(STORAGE_KEY_CUSTOM_TEMPLATES, JSON.stringify(filtered));
    
    return true;
  } catch (error) {
    console.error('Error deleting custom template:', error);
    return false;
  }
}

/**
 * Clear all template data
 */
export function clearTemplateData(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY_TEMPLATE_METRICS);
    localStorage.removeItem(STORAGE_KEY_TEMPLATE_USAGE);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_TEMPLATES);
    
    return true;
  } catch (error) {
    console.error('Error clearing template data:', error);
    return false;
  }
}

/**
 * Get template summary statistics
 */
export function getTemplateSummaryStats() {
  const metrics = getTemplateMetrics();
  const usageStats = getTemplateUsageStats();
  const customTemplates = getCustomTemplates();

  const totalTimesUsed = Array.from(metrics.values()).reduce((sum, m) => sum + m.timesUsed, 0);
  const totalActiveRules = Array.from(metrics.values()).reduce((sum, m) => sum + m.activeCount, 0);
  const avgLift = Array.from(metrics.values())
    .filter(m => m.avgLift > 0)
    .reduce((sum, m, _, arr) => sum + m.avgLift / arr.length, 0);
  const avgRating = Array.from(metrics.values())
    .filter(m => m.rating > 0)
    .reduce((sum, m, _, arr) => sum + m.rating / arr.length, 0);

  return {
    totalTemplates: metrics.size,
    totalCustomTemplates: customTemplates.length,
    totalTimesUsed,
    totalActiveRules,
    avgLift: Math.round(avgLift * 100) / 100,
    avgRating: Math.round(avgRating * 10) / 10,
    totalUsageRecords: usageStats.length
  };
}

/**
 * Get top performing templates
 */
export function getTopPerformingTemplates(limit: number = 5): Array<{
  templateId: string;
  metrics: TemplatePerformanceMetrics;
}> {
  const metrics = getTemplateMetrics();
  
  return Array.from(metrics.entries())
    .map(([templateId, metrics]) => ({ templateId, metrics }))
    .sort((a, b) => b.metrics.avgLift - a.metrics.avgLift)
    .slice(0, limit);
}

/**
 * Get most used templates
 */
export function getMostUsedTemplates(limit: number = 5): Array<{
  templateId: string;
  metrics: TemplatePerformanceMetrics;
}> {
  const metrics = getTemplateMetrics();
  
  return Array.from(metrics.entries())
    .map(([templateId, metrics]) => ({ templateId, metrics }))
    .sort((a, b) => b.metrics.timesUsed - a.metrics.timesUsed)
    .slice(0, limit);
}
