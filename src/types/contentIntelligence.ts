export type SentimentType = 'positive' | 'negative' | 'neutral';

export type TopicTrend = 'rising' | 'declining' | 'stable';

export type AnomalyType = 'spike' | 'drop' | 'outlier';

export type PredictionModel = 'linear_regression' | 'moving_average' | 'exponential_smoothing';

export interface Topic {
  id: string;
  name: string;
  keywords: string[];
  score: number;
  frequency: number;
  trend: TopicTrend;
  confidence: number;
}

export interface TopicCluster {
  id: string;
  topics: Topic[];
  centroid: string;
  similarity: number;
}

export interface SentimentAnalysis {
  contentId: number;
  sentiment: SentimentType;
  score: number;
  confidence: number;
  positiveWords: string[];
  negativeWords: string[];
  neutralWords: string[];
  timestamp: number;
}

export interface ContentCluster {
  id: string;
  contentIds: number[];
  centroid: string;
  similarity: number;
  clusterLabel: string;
}

export interface ContentScore {
  contentId: number;
  qualityScore: number;
  engagementPotentialScore: number;
  seoScore: number;
  completenessScore: number;
  readabilityScore: number;
  overallScore: number;
  timestamp: number;
}

export interface PerformancePrediction {
  contentId: number;
  predictedViews: number;
  predictedEngagement: number;
  predictedConversions: number;
  confidence: number;
  model: PredictionModel;
  optimalPublishTime: string;
  publishTimeReason: string;
  timestamp: number;
}

export interface ContentAnomaly {
  id: string;
  contentId: number;
  anomalyType: AnomalyType;
  metric: string;
  actualValue: number;
  expectedValue: number;
  deviation: number;
  zScore: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  detectedAt: number;
}

export interface TopicTrendData {
  topic: string;
  trend: TopicTrend;
  values: Array<{
    date: string;
    frequency: number;
  }>;
  changeRate: number;
  forecast?: Array<{
    date: string;
    predictedFrequency: number;
  }>;
}

export interface SentimentTrendData {
  sentiment: SentimentType;
  trend: TopicTrend;
  values: Array<{
    date: string;
    averageScore: number;
    count: number;
  }>;
}

export interface ContentIntelligenceSummary {
  totalTopics: number;
  risingTopics: number;
  decliningTopics: number;
  averageSentiment: number;
  totalClusters: number;
  totalAnomalies: number;
  highSeverityAnomalies: number;
  averagePredictionAccuracy: number;
  lastUpdated: number;
}

export interface TopicInsights {
  topTopics: Topic[];
  trendingTopics: Topic[];
  decliningTopics: Topic[];
  topicClusters: TopicCluster[];
  keywordFrequency: Record<string, number>;
}

export interface SentimentInsights {
  averageScore: number;
  distribution: Record<SentimentType, number>;
  trends: SentimentTrendData[];
  topPositiveContent: Array<{
    contentId: number;
    score: number;
    timestamp: number;
  }>;
  topNegativeContent: Array<{
    contentId: number;
    score: number;
    timestamp: number;
  }>;
}

export interface PerformanceInsights {
  predictions: PerformancePrediction[];
  bestPerformingContent: Array<{
    contentId: number;
    predictedViews: number;
    predictedEngagement: number;
  }>;
  optimalPublishTimes: Array<{
    dayOfWeek: string;
    hour: number;
    averageEngagement: number;
  }>;
  forecast?: Array<{
    date: string;
    predictedViews: number;
    predictedEngagement: number;
  }>;
}

export interface ContentIntelligenceConfig {
  enabled: boolean;
  updateInterval: number;
  minTopicFrequency: number;
  maxTopics: number;
  sentimentConfidenceThreshold: number;
  anomalyZScoreThreshold: number;
  predictionWindowSize: number;
  clusterSimilarityThreshold: number;
  maxCacheSize: number;
}

export interface IContentIntelligenceEngine {
  analyzeTopics(content: string[]): Topic[];
  extractKeywords(text: string, maxKeywords?: number): string[];
  calculateTFIDF(documents: string[]): Record<string, Record<string, number>>;
  analyzeSentiment(content: string, contentId?: number): SentimentAnalysis;
  analyzeSentimentBatch(contents: Array<{ id: number; content: string }>): SentimentAnalysis[];
  clusterContent(contentIds: number[], texts: string[]): ContentCluster[];
  calculateContentScore(contentId: number, content: string): ContentScore;
  predictPerformance(contentId: number, historicalData: number[]): PerformancePrediction;
  detectAnomaly(contentId: number, metric: string, currentValue: number): ContentAnomaly | null;
  getTopicInsights(): TopicInsights;
  getSentimentInsights(): SentimentInsights;
  getPerformanceInsights(): PerformanceInsights;
  getSummary(): ContentIntelligenceSummary;
  getAllTopics(): Topic[];
  getAllSentimentAnalysis(): SentimentAnalysis[];
  getAllClusters(): ContentCluster[];
  getAllPredictions(): PerformancePrediction[];
  getAllAnomalies(): ContentAnomaly[];
  updateConfig(config: Partial<ContentIntelligenceConfig>): ContentIntelligenceConfig;
  getConfig(): ContentIntelligenceConfig;
  clearCache(): void;
  reset(): void;
}

export const DEFAULT_CONTENT_INTELLIGENCE_CONFIG: ContentIntelligenceConfig = {
  enabled: true,
  updateInterval: 3600000,
  minTopicFrequency: 2,
  maxTopics: 50,
  sentimentConfidenceThreshold: 0.6,
  anomalyZScoreThreshold: 3,
  predictionWindowSize: 30,
  clusterSimilarityThreshold: 0.5,
  maxCacheSize: 1000,
};

export const POSITIVE_SENTIMENT_WORDS = [
  'bagus', 'hebat', 'luar biasa', 'terbaik', 'sangat baik', 'cemerlang',
  'positif', 'menguntungkan', 'berhasil', 'sukses', 'menyenangkan',
  'memuaskan', 'inspiratif', 'informatif', 'praktis', 'efektif',
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'positive',
  'beneficial', 'successful', 'enjoyable', 'satisfying', 'inspiring',
  'informative', 'practical', 'effective',
];

export const NEGATIVE_SENTIMENT_WORDS = [
  'buruk', 'jelek', 'sangat buruk', 'mengecewakan', 'gagal',
  'negatif', 'merugikan', 'tidak berguna', 'sia-sia', 'membosankan',
  'frustasi', 'marah', 'kecewa', 'tidak nyaman', 'berbahaya',
  'bad', 'terrible', 'awful', 'disappointing', 'failed', 'negative',
  'harmful', 'useless', 'wasteful', 'boring', 'frustrating',
  'angry', 'disappointed', 'uncomfortable', 'dangerous',
];
