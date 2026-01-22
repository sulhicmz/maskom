import { z } from 'zod';
import { ABTest, ABTestVariant, ABTestResult, ABTestStatus, ABTestSuccessMetric, IAbTestEngine } from '@/types/abTest';
import { createValidator, StorageValidator } from './storageValidator';

const STORAGE_KEY = 'ab_tests';
const USER_ASSIGNMENT_KEY = 'ab_test_assignments';

const abTestArraySchema = z.array(
  z.object({
    id: z.string(),
    postId: z.number(),
    type: z.enum(['headline', 'content', 'layout', 'image']),
    status: z.enum(['draft', 'running', 'paused', 'completed']),
    trafficSplit: z.number(),
    duration: z.number(),
    successMetric: z.enum(['views', 'clicks', 'engagement', 'timeOnPage', 'conversions']),
    minSampleSize: z.number().default(1000),
    confidenceLevel: z.number().default(0.95),
    variants: z.array(
      z.object({
        id: z.string(),
        testId: z.string(),
        variantName: z.string(),
        content: z.record(z.string(), z.unknown()),
        assignmentRate: z.number(),
        metrics: z.object({
          views: z.number().default(0),
          clicks: z.number().default(0),
          engagement: z.number().default(0),
          timeOnPage: z.number().default(0),
          conversions: z.number().default(0),
        }).default({
          views: 0,
          clicks: 0,
          engagement: 0,
          timeOnPage: 0,
          conversions: 0,
        }),
        assignedUsers: z.array(z.string()).default([]),
      })
    ),
    createdAt: z.string(),
    startedAt: z.string().optional(),
    completedAt: z.string().optional(),
    winner: z.object({
      testId: z.string(),
      winnerId: z.string(),
      loserId: z.string(),
      statisticalSignificance: z.boolean(),
      pValue: z.number(),
      confidenceInterval: z.object({
        winner: z.object({ lower: z.number(), upper: z.number() }),
        loser: z.object({ lower: z.number(), upper: z.number() }),
      }),
      uplift: z.number(),
      declaredAt: z.string(),
    }).nullable(),
  })
);

const userAssignmentsSchema = z.record(z.string(), z.string());

export class ABTestEngine implements IAbTestEngine {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, string> = new Map();
  private testsValidator: StorageValidator<ABTest[]>;
  private assignmentsValidator: StorageValidator<Record<string, string>>;

  constructor() {
    this.testsValidator = new StorageValidator<ABTest[]>({
      schema: abTestArraySchema,
      defaultValue: [],
      storageKey: STORAGE_KEY,
      logErrors: true,
    });

    this.assignmentsValidator = new StorageValidator<Record<string, string>>({
      schema: userAssignmentsSchema,
      defaultValue: {},
      storageKey: USER_ASSIGNMENT_KEY,
      logErrors: true,
    });

    this.loadTests();
    this.loadUserAssignments();
  }

  loadTests(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const tests = this.testsValidator.safeParseFromStorage(stored);
      tests.forEach(test => this.tests.set(test.id, test));
    }
  }

  saveTests(): void {
    const testsArray = Array.from(this.tests.values());
    const result = this.testsValidator.parse(testsArray);
    
    if (result.success) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    } else {
      console.error('[ABTestEngine] Failed to save tests:', result.error);
    }
  }

  loadUserAssignments(): void {
    const stored = localStorage.getItem(USER_ASSIGNMENT_KEY);
    if (stored) {
      const assignments = this.assignmentsValidator.safeParseFromStorage(stored);
      Object.entries(assignments).forEach(([testId, variantId]) => {
        this.userAssignments.set(testId, variantId);
      });
    }
  }

  saveUserAssignments(): void {
    const assignmentsObj = Object.fromEntries(this.userAssignments);
    const result = this.assignmentsValidator.parse(assignmentsObj);
    
    if (result.success) {
      localStorage.setItem(USER_ASSIGNMENT_KEY, JSON.stringify(result.data));
    } else {
      console.error('[ABTestEngine] Failed to save assignments:', result.error);
    }
  }

  createTest(test: Omit<ABTest, 'id' | 'createdAt'>): ABTest {
    const id = this.generateTestId(test.postId);
    const newTest: ABTest = {
      ...test,
      id,
      createdAt: new Date().toISOString(),
      status: 'draft',
      minSampleSize: test.minSampleSize || 1000,
      confidenceLevel: test.confidenceLevel || 0.95
    };
    this.tests.set(id, newTest);
    this.saveTests();
    return newTest;
  }

  startTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'draft') {
      return false;
    }
    test.status = 'running';
    test.startedAt = new Date().toISOString();
    this.saveTests();
    return true;
  }

  pauseTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return false;
    }
    test.status = 'paused';
    this.saveTests();
    return true;
  }

  completeTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test) {
      return false;
    }
    test.status = 'completed';
    test.completedAt = new Date().toISOString();

    const result = this.calculateWinner(test);
    test.winner = result || null;

    this.saveTests();
    return true;
  }

  deleteTest(testId: string): boolean {
    if (!this.tests.has(testId)) {
      return false;
    }
    this.tests.delete(testId);
    this.saveTests();
    return true;
  }

  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId);
  }

  getAllTests(): ABTest[] {
    return Array.from(this.tests.values()).sort((a, b) => {
      const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      return b.id.localeCompare(a.id);
    });
  }

  getTestsByPostId(postId: number): ABTest[] {
    return this.getAllTests().filter(test => test.postId === postId);
  }

  getTestsByStatus(status: ABTestStatus): ABTest[] {
    return this.getAllTests().filter(test => test.status === status);
  }

  assignVariant(testId: string): ABTestVariant | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    const existingAssignment = this.userAssignments.get(testId);
    if (existingAssignment) {
      return test.variants.find(v => v.id === existingAssignment) || null;
    }

    const variant = this.selectVariant(test.variants);
    if (variant) {
      this.userAssignments.set(testId, variant.id);
      this.saveUserAssignments();
      
      if (!variant.assignedUsers.includes(variant.id)) {
        variant.assignedUsers = [...variant.assignedUsers, variant.id];
      }
    }
    
    return variant;
  }

  private selectVariant(variants: ABTestVariant[]): ABTestVariant | null {
    if (variants.length === 0) {
      return null;
    }

    const totalRate = variants.reduce((sum, v) => sum + v.assignmentRate, 0);
    const random = Math.random() * totalRate;
    let cumulative = 0;
    
    for (const variant of variants) {
      cumulative += variant.assignmentRate;
      if (random <= cumulative) {
        return variant;
      }
    }
    
    return variants[0];
  }

  trackMetric(testId: string, variantId: string, metric: keyof ABTestVariant['metrics']): void {
    const test = this.tests.get(testId);
    if (!test) {
      return;
    }

    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) {
      return;
    }

    variant.metrics[metric] = (variant.metrics[metric] || 0) + 1;
    this.saveTests();
  }

  trackViews(testId: string, variantId: string): void {
    this.trackMetric(testId, variantId, 'views');
  }

  trackClicks(testId: string, variantId: string): void {
    this.trackMetric(testId, variantId, 'clicks');
  }

  trackEngagement(testId: string, variantId: string, score: number): void {
    const test = this.tests.get(testId);
    if (!test) {
      return;
    }

    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) {
      return;
    }

    variant.metrics.engagement = score;
    this.saveTests();
  }

  calculateWinner(test: ABTest): ABTestResult | null {
    if (test.variants.length < 2) {
      return null;
    }

    const sortedVariants = [...test.variants].sort((a, b) => {
      const aScore = this.calculateVariantScore(a, test.successMetric);
      const bScore = this.calculateVariantScore(b, test.successMetric);
      return bScore - aScore;
    });

    const winner = sortedVariants[0];
    const loser = sortedVariants[1];

    const result = this.chiSquareTest(
      winner.metrics[test.successMetric],
      loser.metrics[test.successMetric],
      winner.assignedUsers.length,
      loser.assignedUsers.length
    );

    const abResult: ABTestResult = {
      testId: test.id,
      winnerId: winner.id,
      loserId: loser.id,
      statisticalSignificance: result.isSignificant,
      pValue: result.pValue,
      confidenceInterval: {
        winner: this.calculateConfidenceInterval(winner.metrics[test.successMetric], winner.assignedUsers.length, test.confidenceLevel),
        loser: this.calculateConfidenceInterval(loser.metrics[test.successMetric], loser.assignedUsers.length, test.confidenceLevel)
      },
      uplift: this.calculateUplift(loser.metrics[test.successMetric], winner.metrics[test.successMetric]),
      declaredAt: new Date().toISOString()
    };

    return abResult;
  }

  private calculateVariantScore(variant: ABTestVariant, metric: ABTestSuccessMetric): number {
    const views = variant.metrics.views || 1;
    switch (metric) {
      case 'views':
        return variant.metrics.views || 0;
      case 'clicks':
        return (variant.metrics.clicks || 0) / views;
      case 'engagement':
        return variant.metrics.engagement || 0;
      case 'timeOnPage':
        return variant.metrics.timeOnPage || 0;
      case 'conversions':
        return (variant.metrics.conversions || 0) / views;
      default:
        return variant.metrics.views || 0;
    }
  }

  private chiSquareTest(winnerValue: number, loserValue: number, winnerN: number, loserN: number): {
    isSignificant: boolean;
    pValue: number;
  } {
    const totalN = winnerN + loserN;
    const expectedWinner = totalN * (winnerValue / (winnerValue + loserValue));
    const expectedLoser = totalN * (loserValue / (winnerValue + loserValue));

    const chiSquareWinner = Math.pow(winnerValue - expectedWinner, 2) / expectedWinner;
    const chiSquareLoser = Math.pow(loserValue - expectedLoser, 2) / expectedLoser;
    const chiSquare = chiSquareWinner + chiSquareLoser;

    const degreesOfFreedom = 1;
    const criticalValue = 3.841;
    const isSignificant = chiSquare >= criticalValue;

    const pValue = this.calculatePValue(chiSquare, degreesOfFreedom);

    return {
      isSignificant,
      pValue
    };
  }

  private calculatePValue(chiSquare: number, degreesOfFreedom: number): number {
    const x = chiSquare / 2;
    const k = degreesOfFreedom / 2;

    if (x < 0 || k <= 0) {
      return 1;
    }

    let seriesResult = 1;
    let term = 1;
    
    for (let i = 1; i < 100; i++) {
      term *= x / (k + i);
      seriesResult += term;
      
      if (term < 1e-10) {
        break;
      }
    }

    const gammaResult = seriesResult * Math.exp(-x);
    return gammaResult;
  }

  private calculateConfidenceInterval(value: number, n: number, confidenceLevel: number): {
    lower: number;
    upper: number;
  } {
    if (n < 2) {
      return { lower: value, upper: value };
    }

    const zScores: { [key: number]: number } = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };
    const z = zScores[confidenceLevel] || 1.96;
    const standardError = Math.sqrt((value * (1 - (value / n))) / n);
    const margin = z * standardError;

    return {
      lower: Math.max(0, value - margin),
      upper: value + margin
    };
  }

  private calculateUplift(baseline: number, variant: number): number {
    if (baseline === 0) {
      return variant > 0 ? 100 : 0;
    }
    return ((variant - baseline) / baseline) * 100;
  }

  getStatistics(): {
    totalTests: number;
    runningTests: number;
    completedTests: number;
    averageDuration: number;
  } {
    const tests = this.getAllTests();
    const completed = tests.filter(t => t.status === 'completed' && t.completedAt && t.startedAt);
    
    const totalDuration = completed.reduce((sum, t) => {
      if (!t.startedAt || !t.completedAt) return sum;
      let duration = new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime();
      if (duration === 0 && t.duration) {
        duration = t.duration * 24 * 60 * 60 * 1000;
      }
      return sum + duration;
    }, 0);

    const averageDuration = completed.length > 0 ? totalDuration / completed.length : 0;

    return {
      totalTests: tests.length,
      runningTests: tests.filter(t => t.status === 'running').length,
      completedTests: completed.length,
      averageDuration
    };
  }

  getTestsRequiringAttention(): ABTest[] {
    const tests = this.getAllTests();
    const needsAttention: ABTest[] = [];

    tests.forEach(test => {
      if (test.status === 'running' && test.startedAt) {
        const elapsed = Date.now() - new Date(test.startedAt).getTime();
        const durationMs = test.duration * 24 * 60 * 60 * 1000;

        if (elapsed >= durationMs) {
          needsAttention.push(test);
        }
      }

      if (test.status === 'running') {
        const totalAssignments = test.variants.reduce((sum, v) => sum + v.assignedUsers.length, 0);
        if (totalAssignments >= test.minSampleSize) {
          const result = this.calculateWinner(test);
          if (result && result.statisticalSignificance) {
            needsAttention.push(test);
          }
        }
      }
    });

    return needsAttention;
  }

  clearUserAssignments(): void {
    this.userAssignments.clear();
    this.saveUserAssignments();
  }

  resetAll(): void {
    this.tests.clear();
    this.userAssignments.clear();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_ASSIGNMENT_KEY);
  }

  private generateTestId(postId: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ab-test-${postId}-${timestamp}-${random}`;
  }
}

export const abTestEngine = new ABTestEngine();
export type { IAbTestEngine } from '@/types/abTest';
