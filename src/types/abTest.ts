import { InnerBlogPost } from './data';

export type ABTestType = 'headline' | 'content' | 'layout' | 'image';

export type ABTestStatus = 'draft' | 'running' | 'completed' | 'paused';

export type ABTestSuccessMetric = 'views' | 'clicks' | 'engagement' | 'timeOnPage';

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
  winner?: ABTestResult;
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
