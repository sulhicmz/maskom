import type {
  SentimentAnalysis,
  SentimentType,
  ContentIntelligenceConfig,
} from '@/types/contentIntelligence';
import { POSITIVE_SENTIMENT_WORDS, NEGATIVE_SENTIMENT_WORDS } from '@/types/contentIntelligence';

export class SentimentAnalysisEngine {
  private config: ContentIntelligenceConfig;
  private sentimentHistory: Map<number, SentimentAnalysis[]> = new Map();

  constructor(config: ContentIntelligenceConfig) {
    this.config = config;
  }

  analyzeSentiment(content: string, contentId?: number): SentimentAnalysis {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);

    const positiveWords = words.filter(w => POSITIVE_SENTIMENT_WORDS.includes(w));
    const negativeWords = words.filter(w => NEGATIVE_SENTIMENT_WORDS.includes(w));
    const neutralWords = words.filter(
      w =>
        !POSITIVE_SENTIMENT_WORDS.includes(w) &&
        !NEGATIVE_SENTIMENT_WORDS.includes(w)
    );

    const positiveScore = positiveWords.length / words.length;
    const negativeScore = negativeWords.length / words.length;
    const sentimentScore = positiveScore - negativeScore;

    let sentiment: SentimentType;
    if (sentimentScore > 0.1) {
      sentiment = 'positive';
    } else if (sentimentScore < -0.1) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    const confidence = this.calculateConfidence(
      positiveWords.length,
      negativeWords.length,
      words.length
    );

    const analysis: SentimentAnalysis = {
      contentId: contentId || 0,
      sentiment,
      score: sentimentScore,
      confidence,
      positiveWords,
      negativeWords,
      neutralWords: neutralWords.slice(0, 10),
      timestamp: Date.now(),
    };

    if (contentId) {
      const history = this.sentimentHistory.get(contentId) || [];
      history.push(analysis);
      if (history.length > 100) history.shift();
      this.sentimentHistory.set(contentId, history);
    }

    return analysis;
  }

  analyzeSentimentBatch(
    contents: Array<{ id: number; content: string }>
  ): SentimentAnalysis[] {
    return contents.map(({ id, content }) =>
      this.analyzeSentiment(content, id)
    );
  }

  getAverageSentiment(): number {
    const allAnalyses = Array.from(this.sentimentHistory.values()).flat();
    if (allAnalyses.length === 0) return 0;

    const totalScore = allAnalyses.reduce((sum, a) => sum + a.score, 0);
    return totalScore / allAnalyses.length;
  }

  getSentimentDistribution(): Record<SentimentType, number> {
    const allAnalyses = Array.from(this.sentimentHistory.values()).flat();
    const distribution: Record<SentimentType, number> = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    allAnalyses.forEach(analysis => {
      distribution[analysis.sentiment]++;
    });

    return distribution;
  }

  getSentimentTrend(
    contentId: number,
    days: number = 30
  ): Array<{ date: number; score: number; sentiment: SentimentType }> {
    const history = this.sentimentHistory.get(contentId) || [];
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    return history
      .filter(a => a.timestamp >= cutoffTime)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(a => ({
        date: a.timestamp,
        score: a.score,
        sentiment: a.sentiment,
      }));
  }

  getTopPositiveContent(limit: number = 10): Array<{
    contentId: number;
    score: number;
    timestamp: number;
  }> {
    const allAnalyses = Array.from(this.sentimentHistory.values()).flat();

    return allAnalyses
      .filter(a => a.sentiment === 'positive')
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(a => ({
        contentId: a.contentId,
        score: a.score,
        timestamp: a.timestamp,
      }));
  }

  getTopNegativeContent(limit: number = 10): Array<{
    contentId: number;
    score: number;
    timestamp: number;
  }> {
    const allAnalyses = Array.from(this.sentimentHistory.values()).flat();

    return allAnalyses
      .filter(a => a.sentiment === 'negative')
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map(a => ({
        contentId: a.contentId,
        score: a.score,
        timestamp: a.timestamp,
      }));
  }

  private calculateConfidence(
    positiveCount: number,
    negativeCount: number,
    totalWords: number
  ): number {
    if (totalWords === 0) return 0;

    const totalSentimentWords = positiveCount + negativeCount;
    const baseConfidence = totalSentimentWords / totalWords;

    const sentimentBalance =
      Math.abs(positiveCount - negativeCount) /
      (positiveCount + negativeCount + 1);

    return Math.min(baseConfidence * 0.7 + sentimentBalance * 0.3, 1);
  }

  clearCache(): void {
    this.sentimentHistory.clear();
  }

  updateConfig(config: Partial<ContentIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getAllSentimentAnalysis(): SentimentAnalysis[] {
    return Array.from(this.sentimentHistory.values()).flat();
  }
}
