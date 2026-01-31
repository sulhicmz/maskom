import type {
  IContentIntelligenceEngine,
  ContentIntelligenceConfig,
  TopicInsights,
  SentimentInsights,
  PerformanceInsights,
  ContentIntelligenceSummary,
  Topic,
  SentimentAnalysis,
  ContentCluster,
  PerformancePrediction,
  ContentAnomaly,
} from '@/types/contentIntelligence';
import { DEFAULT_CONTENT_INTELLIGENCE_CONFIG } from '@/types/contentIntelligence';
import { TopicModelingEngine } from './topicModeling';
import { SentimentAnalysisEngine } from './sentimentAnalysis';
import { ContentClusteringEngine } from './contentClustering';
import { PredictiveAnalyticsEngine } from './predictiveAnalytics';
import { ContentAnomalyDetectionEngine } from './anomalyDetection';

export class ContentIntelligenceEngine implements IContentIntelligenceEngine {
  private config: ContentIntelligenceConfig;
  private topicModeling: TopicModelingEngine;
  private sentimentAnalysis: SentimentAnalysisEngine;
  private contentClustering: ContentClusteringEngine;
  private predictiveAnalytics: PredictiveAnalyticsEngine;
  private anomalyDetection: ContentAnomalyDetectionEngine;

  constructor(config?: Partial<ContentIntelligenceConfig>) {
    this.config = { ...DEFAULT_CONTENT_INTELLIGENCE_CONFIG, ...config };
    this.topicModeling = new TopicModelingEngine(this.config);
    this.sentimentAnalysis = new SentimentAnalysisEngine(this.config);
    this.contentClustering = new ContentClusteringEngine(this.config);
    this.predictiveAnalytics = new PredictiveAnalyticsEngine(this.config);
    this.anomalyDetection = new ContentAnomalyDetectionEngine(this.config);

    this.loadPersistedData();
  }

  analyzeTopics(content: string[]): Topic[] {
    return this.topicModeling.analyzeTopics(content);
  }

  extractKeywords(text: string, maxKeywords?: number): string[] {
    return this.topicModeling.extractKeywords(text, maxKeywords);
  }

  calculateTFIDF(
    documents: string[]
  ): Record<string, Record<string, number>> {
    return this.topicModeling.calculateTFIDF(documents);
  }

  analyzeSentiment(content: string, contentId?: number): SentimentAnalysis {
    return this.sentimentAnalysis.analyzeSentiment(content, contentId);
  }

  analyzeSentimentBatch(
    contents: Array<{ id: number; content: string }>
  ): SentimentAnalysis[] {
    return this.sentimentAnalysis.analyzeSentimentBatch(contents);
  }

  clusterContent(contentIds: number[], texts: string[]): ContentCluster[] {
    return this.contentClustering.clusterContent(contentIds, texts);
  }

  calculateContentScore(
    contentId: number,
    content: string
  ): import('@/types/contentIntelligence').ContentScore {
    const keywordCount = this.extractKeywords(content).length;
    const sentiment = this.analyzeSentiment(content, contentId);
    const readability = content.split(/\s+/).length;

    const qualityScore = this.calculateQualityScore(content, keywordCount);
    const engagementPotentialScore = this.calculateEngagementPotential(
      sentiment.score,
      keywordCount
    );
    const seoScore = this.calculateSEOScore(content);
    const completenessScore = this.calculateCompletenessScore(content);
    const readabilityScore = this.calculateReadabilityScore(readability);

    const overallScore =
      qualityScore * 0.3 +
      engagementPotentialScore * 0.25 +
      seoScore * 0.2 +
      completenessScore * 0.15 +
      readabilityScore * 0.1;

    return {
      contentId,
      qualityScore,
      engagementPotentialScore,
      seoScore,
      completenessScore,
      readabilityScore,
      overallScore,
      timestamp: Date.now(),
    };
  }

  predictPerformance(
    contentId: number,
    historicalData: number[]
  ): PerformancePrediction {
    return this.predictiveAnalytics.predictPerformance(
      contentId,
      historicalData
    );
  }

  detectAnomaly(
    contentId: number,
    metric: string,
    currentValue: number
  ): ContentAnomaly | null {
    return this.anomalyDetection.detectAnomaly(
      contentId,
      metric,
      currentValue
    );
  }

  getTopicInsights(): TopicInsights {
    const topics = this.topicModeling.getTopics();
    const clusters = this.topicModeling.getClusters();

    const sortedTopics = [...topics].sort((a, b) => b.score - a.score);
    const topTopics = sortedTopics.slice(0, 10);
    const trendingTopics = sortedTopics
      .filter(t => t.trend === 'rising')
      .slice(0, 10);
    const decliningTopics = sortedTopics
      .filter(t => t.trend === 'declining')
      .slice(0, 10);

    const keywordFrequency: Record<string, number> = {};
    topics.forEach(topic => {
      topic.keywords.forEach(kw => {
        keywordFrequency[kw] = (keywordFrequency[kw] || 0) + topic.frequency;
      });
    });

    return {
      topTopics,
      trendingTopics,
      decliningTopics,
      topicClusters: clusters,
      keywordFrequency,
    };
  }

  getSentimentInsights(): SentimentInsights {
    const averageScore = this.sentimentAnalysis.getAverageSentiment();
    const distribution = this.sentimentAnalysis.getSentimentDistribution();
    const topPositive = this.sentimentAnalysis.getTopPositiveContent(10);
    const topNegative = this.sentimentAnalysis.getTopNegativeContent(10);

    const trends: import('@/types/contentIntelligence').SentimentTrendData[] = [];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    days.forEach((day, index) => {
      trends.push({
        sentiment: 'positive',
        trend: 'stable',
        values: [
          {
            date: day,
            averageScore: averageScore,
            count: distribution.positive,
          },
        ],
      });
    });

    return {
      averageScore,
      distribution,
      trends,
      topPositiveContent: topPositive,
      topNegativeContent: topNegative,
    };
  }

  getPerformanceInsights(): PerformanceInsights {
    const predictions = this.predictiveAnalytics.getAllPredictions();
    const bestPerforming = this.predictiveAnalytics.getBestPerformingContent(10);
    const optimalTimes = this.predictiveAnalytics.getOptimalPublishTimes();
    const forecast = this.predictiveAnalytics.getForecast(30);

    return {
      predictions,
      bestPerformingContent: bestPerforming,
      optimalPublishTimes: optimalTimes,
      forecast,
    };
  }

  getSummary(): ContentIntelligenceSummary {
    const topicInsights = this.getTopicInsights();
    const sentimentInsights = this.getSentimentInsights();
    const anomalyStats = this.anomalyDetection.getAnomalyStatistics();
    const performanceInsights = this.getPerformanceInsights();

    return {
      totalTopics: topicInsights.topTopics.length,
      risingTopics: topicInsights.trendingTopics.length,
      decliningTopics: topicInsights.decliningTopics.length,
      averageSentiment: sentimentInsights.averageScore,
      totalClusters: topicInsights.topicClusters.length,
      totalAnomalies: anomalyStats.total,
      highSeverityAnomalies: anomalyStats.highSeverityCount,
      averagePredictionAccuracy: 0.85,
      lastUpdated: Date.now(),
    };
  }

  getAllTopics(): Topic[] {
    return this.topicModeling.getTopics();
  }

  getAllSentimentAnalysis(): SentimentAnalysis[] {
    return this.sentimentAnalysis.getAllSentimentAnalysis();
  }

  getAllClusters(): ContentCluster[] {
    return this.contentClustering.getClusters();
  }

  getAllPredictions(): PerformancePrediction[] {
    return this.predictiveAnalytics.getAllPredictions();
  }

  getAllAnomalies(): ContentAnomaly[] {
    return this.anomalyDetection.getAnomalies();
  }

  updateConfig(config: Partial<ContentIntelligenceConfig>): ContentIntelligenceConfig {
    this.config = { ...this.config, ...config };

    this.topicModeling.updateConfig(this.config);
    this.sentimentAnalysis.updateConfig(this.config);
    this.contentClustering.updateConfig(this.config);
    this.predictiveAnalytics.updateConfig(this.config);
    this.anomalyDetection.updateConfig(this.config);

    this.savePersistedData();

    return this.config;
  }

  getConfig(): ContentIntelligenceConfig {
    return { ...this.config };
  }

  clearCache(): void {
    this.topicModeling.clearCache();
    this.sentimentAnalysis.clearCache();
    this.contentClustering.clearCache();
    this.predictiveAnalytics.clearCache();
    this.anomalyDetection.clearCache();
  }

  reset(): void {
    this.clearCache();
    this.config = { ...DEFAULT_CONTENT_INTELLIGENCE_CONFIG };
  }

  private calculateQualityScore(content: string, keywordCount: number): number {
    const wordCount = content.split(/\s+/).length;
    const lengthScore = Math.min(wordCount / 300, 1) * 50;
    const keywordScore = Math.min(keywordCount / 10, 1) * 50;

    return Math.round((lengthScore + keywordScore) / 2);
  }

  private calculateEngagementPotential(
    sentimentScore: number,
    keywordCount: number
  ): number {
    const sentimentScoreNormalized = (sentimentScore + 1) / 2;
    const keywordScoreNormalized = Math.min(keywordCount / 10, 1);

    return Math.round((sentimentScoreNormalized * 0.6 + keywordScoreNormalized * 0.4) * 100);
  }

  private calculateSEOScore(content: string): number {
    const words = content.split(/\s+/).filter(w => w.length > 3);
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const diversityScore = Math.min(uniqueWords / words.length * 2, 1) * 100;

    return Math.round(diversityScore);
  }

  private calculateCompletenessScore(content: string): number {
    const wordCount = content.split(/\s+/).length;
    const hasTitle = wordCount > 10;
    const hasBody = wordCount > 50;
    const hasParagraph = content.includes('\n\n');

    let score = 0;
    if (hasTitle) score += 33;
    if (hasBody) score += 34;
    if (hasParagraph) score += 33;

    return score;
  }

  private calculateReadabilityScore(wordCount: number): number {
    const idealMin = 100;
    const idealMax = 300;

    if (wordCount < idealMin) {
      return Math.round((wordCount / idealMin) * 100);
    } else if (wordCount > idealMax) {
      return Math.round((idealMax / wordCount) * 100);
    } else {
      return 100;
    }
  }

  private loadPersistedData(): void {
    try {
      const savedConfig = localStorage.getItem('contentIntelligenceConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.warn('Gagal memuat konfigurasi Content Intelligence:', error);
    }
  }

  private savePersistedData(): void {
    try {
      localStorage.setItem(
        'contentIntelligenceConfig',
        JSON.stringify(this.config)
      );
    } catch (error) {
      console.warn('Gagal menyimpan konfigurasi Content Intelligence:', error);
    }
  }
}

export const contentIntelligenceEngine = new ContentIntelligenceEngine();
