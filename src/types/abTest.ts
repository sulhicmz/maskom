import { InnerBlogPost } from './data';

export type ABTestType = 'headline' | 'content' | 'layout' | 'image';

export type ABTestStatus = 'draft' | 'running' | 'completed' | 'paused';

export type ABTestSuccessMetric = 'views' | 'clicks' | 'engagement' | 'timeOnPage' | 'conversions';

export interface ABTestVariant {
  id: string;
  testId: string;
  variantName: string;
  content: Partial<InnerBlogPost>;
  assignmentRate: number;
  metrics: {
    views: number;
    clicks: number;
    engagement: number;
    timeOnPage: number;
    conversions: number;
  };
  assignedUsers: string[];
}

export interface ABTest {
  id: string;
  postId: number;
  type: ABTestType;
  status: ABTestStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  duration: number;
  trafficSplit: number;
  successMetric: ABTestSuccessMetric;
  variants: ABTestVariant[];
  winner: ABTestResult | null;
  minSampleSize: number;
  confidenceLevel: number;
}

export interface ABTestResult {
  testId: string;
  winnerId: string;
  loserId: string;
  statisticalSignificance: boolean;
  pValue: number;
  confidenceInterval: {
    winner: { lower: number; upper: number };
    loser: { lower: number; upper: number };
  };
  uplift: number;
  declaredAt: string;
}

export interface ABTestStats {
  totalTests: number;
  runningTests: number;
  completedTests: number;
  averageDuration: number;
  totalVariants: number;
  winnersDeclared: number;
}

export interface IAbTestEngine {
  loadTests(): void;
  saveTests(): void;
  loadUserAssignments(): void;
  saveUserAssignments(): void;
  createTest(test: Omit<ABTest, 'id' | 'createdAt'>): ABTest;
  startTest(testId: string): boolean;
  pauseTest(testId: string): boolean;
  completeTest(testId: string): boolean;
  deleteTest(testId: string): boolean;
  getTest(testId: string): ABTest | undefined;
  getAllTests(): ABTest[];
  getTestsByPostId(postId: number): ABTest[];
  getTestsByStatus(status: ABTestStatus): ABTest[];
  assignVariant(testId: string): ABTestVariant | null;
  trackMetric(testId: string, variantId: string, metric: keyof ABTestVariant['metrics']): void;
  trackViews(testId: string, variantId: string, count?: number): void;
  trackClicks(testId: string, variantId: string, count?: number): void;
  trackEngagement(testId: string, variantId: string, score: number): void;
  calculateWinner(test: ABTest): ABTestResult | null;
  getStatistics(): {
    totalTests: number;
    runningTests: number;
    completedTests: number;
    averageDuration: number;
  };
  getTestsRequiringAttention(): ABTest[];
  clearUserAssignments(): void;
  resetAll(): void;
}
