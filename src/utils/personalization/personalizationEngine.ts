import {
  PersonalizationRule,
  ContentVariant,
  RuleCondition,
  PersonalizationMetrics,
  ContentType,
  UserSegment,
  PersonalizationRuleVersion,
} from '@/types/personalization';
import { ruleVersionStorage } from './ruleVersionStorage';

const RULES_STORAGE_KEY = 'personalization_rules';
const METRICS_STORAGE_KEY = 'personalization_metrics';
const VARIANT_STORAGE_KEY = 'personalization_variants';

class PersonalizationEngine {
  private rules: PersonalizationRule[] = [];
  private variants: ContentVariant[] = [];
  private metrics: Map<string, PersonalizationMetrics> = new Map();
  private enabled = true;

  constructor() {
    this.loadRules();
    this.loadVariants();
    this.loadMetrics();
  }

  private loadRules(): void {
    try {
      const stored = localStorage.getItem(RULES_STORAGE_KEY);
      if (stored) {
        this.rules = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  }

  private saveRules(): void {
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(this.rules));
    } catch (error) {
      console.error('Failed to save rules:', error);
    }
  }

  private loadVariants(): void {
    try {
      const stored = localStorage.getItem(VARIANT_STORAGE_KEY);
      if (stored) {
        this.variants = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load variants:', error);
    }
  }

  private saveVariants(): void {
    try {
      localStorage.setItem(VARIANT_STORAGE_KEY, JSON.stringify(this.variants));
    } catch (error) {
      console.error('Failed to save variants:', error);
    }
  }

  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem(METRICS_STORAGE_KEY);
      if (stored) {
        const metricsArray: PersonalizationMetrics[] = JSON.parse(stored);
        this.metrics = new Map(metricsArray.map((m) => [m.ruleId, m]));
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }

  private saveMetrics(): void {
    try {
      const metricsArray = Array.from(this.metrics.values());
      localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metricsArray));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  createRule(rule: Omit<PersonalizationRule, 'id' | 'createdAt' | 'updatedAt'>): PersonalizationRule {
    const newRule: PersonalizationRule = {
      ...rule,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.rules.push(newRule);
    this.saveRules();
    return newRule;
  }

  updateRule(id: string, updates: Partial<PersonalizationRule>): PersonalizationRule | null {
    const index = this.rules.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const oldRule = this.rules[index];

    this.createRuleVersion(oldRule, 'Update rule');

    this.rules[index] = {
      ...this.rules[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.saveRules();
    return this.rules[index];
  }

  deleteRule(id: string): boolean {
    const index = this.rules.findIndex((r) => r.id === id);
    if (index === -1) return false;

    this.rules.splice(index, 1);
    this.saveRules();
    return true;
  }

  getRule(id: string): PersonalizationRule | undefined {
    return this.rules.find((r) => r.id === id);
  }

  getAllRules(): PersonalizationRule[] {
    return this.rules;
  }

  getActiveRules(): PersonalizationRule[] {
    return this.rules.filter((r) => r.isActive);
  }

  createVariant(variant: Omit<ContentVariant, 'id' | 'createdAt' | 'updatedAt'>): ContentVariant {
    const newVariant: ContentVariant = {
      ...variant,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.variants.push(newVariant);
    this.saveVariants();
    return newVariant;
  }

  updateVariant(id: string, updates: Partial<ContentVariant>): ContentVariant | null {
    const index = this.variants.findIndex((v) => v.id === id);
    if (index === -1) return null;

    this.variants[index] = {
      ...this.variants[index],
      ...updates,
      updatedAt: Date.now(),
    };
    this.saveVariants();
    return this.variants[index];
  }

  deleteVariant(id: string): boolean {
    const index = this.variants.findIndex((v) => v.id === id);
    if (index === -1) return false;

    this.variants.splice(index, 1);
    this.saveVariants();
    return true;
  }

  getVariant(id: string): ContentVariant | undefined {
    return this.variants.find((v) => v.id === id);
  }

  getVariantsForContent(contentId: string): ContentVariant[] {
    return this.variants.filter((v) => v.contentId === contentId && v.isActive);
  }

  getVariantForUser(
    contentId: string,
    userSegment: UserSegment,
    userId?: string
  ): ContentVariant | null {
    const variants = this.getVariantsForContent(contentId);
    const matchingVariants = variants.filter((v) => v.segment === userSegment);

    if (matchingVariants.length === 0) return null;

    if (matchingVariants.length === 1) return matchingVariants[0];

    return this.selectVariantByWeight(matchingVariants, userId);
  }

  private selectVariantByWeight(variants: ContentVariant[], userId?: string): ContentVariant {
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    let random: number;

    if (userId) {
      const hash = this.hashString(userId + Date.now());
      random = (hash % 10000) / 10000;
    } else {
      random = Math.random();
    }

    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight / totalWeight;
      if (random <= cumulativeWeight) {
        return variant;
      }
    }

    return variants[0];
  }

  evaluateConditions(
    conditions: RuleCondition[],
    context: Record<string, unknown>
  ): boolean {
    if (conditions.length === 0) return true;

    return conditions.every((condition) => {
      const actualValue = context[condition.field];

      switch (condition.operator) {
        case 'equals':
          return actualValue === condition.value;
        case 'not_equals':
          return actualValue !== condition.value;
        case 'contains':
          return Array.isArray(actualValue)
            ? actualValue.includes(condition.value)
            : String(actualValue).includes(String(condition.value));
        case 'not_contains':
          return Array.isArray(actualValue)
            ? !actualValue.includes(condition.value)
            : !String(actualValue).includes(String(condition.value));
        case 'greater_than':
          return typeof actualValue === 'number' &&
            typeof condition.value === 'number' &&
            actualValue > condition.value;
        case 'less_than':
          return typeof actualValue === 'number' &&
            typeof condition.value === 'number' &&
            actualValue < condition.value;
        default:
          return false;
      }
    });
  }

  personalizeContent(
    contentId: string,
    userSegment: UserSegment,
    contentType: ContentType,
    context: Record<string, unknown>,
    userId?: string
  ): Record<string, unknown> | null {
    if (!this.enabled) return null;

    const activeRules = this.getActiveRules();
    const matchingRules = activeRules
      .filter((r) => r.segment === userSegment && r.contentType === contentType)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of matchingRules) {
      if (this.evaluateConditions(rule.conditions, context)) {
        const variant = this.getVariantForUser(contentId, userSegment, userId);
        if (variant) {
          this.trackImpression(rule.id, variant.id, userSegment);
          return variant.content;
        }
      }
    }

    return null;
  }

  trackImpression(ruleId: string, variantId: string, segment: UserSegment): void {
    let metrics = this.metrics.get(ruleId);
    if (!metrics) {
      metrics = {
        ruleId,
        segment,
        variantId,
        views: 0,
        clicks: 0,
        engagement: 0,
        conversions: 0,
        liftPercentage: 0,
        startDate: Date.now(),
        endDate: Date.now(),
      };
    }

    metrics.views++;
    metrics.endDate = Date.now();
    this.metrics.set(ruleId, metrics);
    this.saveMetrics();
  }

  trackClick(ruleId: string): void {
    const metrics = this.metrics.get(ruleId);
    if (metrics) {
      metrics.clicks++;
      metrics.endDate = Date.now();
      this.metrics.set(ruleId, metrics);
      this.saveMetrics();
    }
  }

  trackEngagement(ruleId: string, value: number): void {
    const metrics = this.metrics.get(ruleId);
    if (metrics) {
      metrics.engagement += value;
      metrics.endDate = Date.now();
      this.metrics.set(ruleId, metrics);
      this.saveMetrics();
    }
  }

  trackConversion(ruleId: string): void {
    const metrics = this.metrics.get(ruleId);
    if (metrics) {
      metrics.conversions++;
      metrics.endDate = Date.now();
      this.metrics.set(ruleId, metrics);
      this.saveMetrics();
    }
  }

  getMetrics(ruleId: string): PersonalizationMetrics | undefined {
    return this.metrics.get(ruleId);
  }

  getAllMetrics(): PersonalizationMetrics[] {
    return Array.from(this.metrics.values());
  }

  calculateLift(ruleId: string, baselineConversionRate: number): number {
    const metrics = this.metrics.get(ruleId);
    if (!metrics || metrics.views === 0) return 0;

    const testConversionRate = metrics.conversions / metrics.views;
    const lift = ((testConversionRate - baselineConversionRate) / baselineConversionRate) * 100;
    
    metrics.liftPercentage = lift;
    this.metrics.set(ruleId, metrics);
    this.saveMetrics();
    
    return lift;
  }

  getAnalytics(): {
    totalRules: number;
    activeRules: number;
    totalVariants: number;
    activeVariants: number;
    totalImpressions: number;
    totalEngagements: number;
    overallLift: number;
  } {
    const totalRules = this.rules.length;
    const activeRules = this.rules.filter((r) => r.isActive).length;
    const totalVariants = this.variants.length;
    const activeVariants = this.variants.filter((v) => v.isActive).length;

    const allMetrics = Array.from(this.metrics.values());
    const totalImpressions = allMetrics.reduce((sum, m) => sum + m.views, 0);
    const totalEngagements = allMetrics.reduce((sum, m) => sum + m.engagement, 0);
    const overallLift = allMetrics.length > 0
      ? allMetrics.reduce((sum, m) => sum + m.liftPercentage, 0) / allMetrics.length
      : 0;

    return {
      totalRules,
      activeRules,
      totalVariants,
      activeVariants,
      totalImpressions,
      totalEngagements,
      overallLift,
    };
  }

  reset(): void {
    this.rules = [];
    this.variants = [];
    this.metrics.clear();
    localStorage.removeItem(RULES_STORAGE_KEY);
    localStorage.removeItem(VARIANT_STORAGE_KEY);
    localStorage.removeItem(METRICS_STORAGE_KEY);
  }

  getRuleVersions(ruleId: string): PersonalizationRuleVersion[] {
    return ruleVersionStorage.getRuleVersions(ruleId);
  }

  createRuleVersion(rule: PersonalizationRule, notes: string = ''): PersonalizationRuleVersion | null {
    if (typeof window === 'undefined') return null;

    const version: PersonalizationRuleVersion = {
      id: `${rule.id}_${Date.now()}`,
      ruleId: rule.id,
      content: { ...rule },
      timestamp: new Date().toISOString(),
      notes,
      author: 'system',
      performanceMetrics: this.getMetrics(rule.id)
        ? {
            views: this.getMetrics(rule.id)?.views,
            clicks: this.getMetrics(rule.id)?.clicks,
            conversions: this.getMetrics(rule.id)?.conversions,
            liftPercentage: this.getMetrics(rule.id)?.liftPercentage,
          }
        : undefined,
    };

    ruleVersionStorage.saveVersion(version);
    return version;
  }

  restoreRuleVersion(ruleId: string, versionId: string): PersonalizationRule | null {
    const versions = this.getRuleVersions(ruleId);
    const versionToRestore = versions.find(v => v.id === versionId);

    if (!versionToRestore) return null;

    const restoredRule = {
      ...versionToRestore.content,
      updatedAt: Date.now(),
    };

    const index = this.rules.findIndex((r) => r.id === ruleId);
    if (index !== -1) {
      this.rules[index] = restoredRule;
    } else {
      this.rules.push(restoredRule);
    }

    this.saveRules();
    return restoredRule;
  }

  deleteRuleVersion(ruleId: string, versionId: string): boolean {
    ruleVersionStorage.deleteVersion(ruleId, versionId);
    return true;
  }

  compareRuleVersions(ruleId: string, version1Id: string, version2Id: string) {
    const versions = this.getRuleVersions(ruleId);
    const version1 = versions.find(v => v.id === version1Id);
    const version2 = versions.find(v => v.id === version2Id);

    if (!version1 || !version2) return null;

    return ruleVersionStorage.compareVersions(version1, version2);
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

export const personalizationEngine = new PersonalizationEngine();
export default personalizationEngine;
