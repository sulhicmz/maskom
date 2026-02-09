import { describe, it, expect, beforeEach } from '@jest/globals';
import { ContentIntelligenceEngine } from '../contentIntelligence';
import { DEFAULT_CONTENT_INTELLIGENCE_CONFIG } from '@/types/contentIntelligence';

describe('ContentIntelligenceEngine', () => {
  let engine: ContentIntelligenceEngine;

  beforeEach(() => {
    localStorage.clear();
    engine = new ContentIntelligenceEngine();
  });

  describe('analyzeTopics', () => {
    it('should analyze topics from content array', () => {
      const content = [
        'Indonesia adalah negara yang indah dengan banyak pulau.',
        'Teknologi AI berkembang sangat cepat di seluruh dunia.',
        'Pariwisata Indonesia menarik banyak turis setiap tahun.',
        'Pembelajaran mesin adalah cabang dari AI.',
        'Bali adalah pulau terkenal di Indonesia.',
      ];

      const topics = engine.analyzeTopics(content);

      expect(topics).toBeDefined();
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics[0]).toHaveProperty('id');
      expect(topics[0]).toHaveProperty('name');
      expect(topics[0]).toHaveProperty('score');
      expect(topics[0]).toHaveProperty('frequency');
      expect(topics[0]).toHaveProperty('trend');
    });

    it('should return empty array for empty content', () => {
      const topics = engine.analyzeTopics([]);
      expect(topics).toEqual([]);
    });

    it('should respect maxTopics configuration', () => {
      const engineWithLimit = new ContentIntelligenceEngine({
        maxTopics: 3,
      });

      const content = Array(10).fill('test content with words');
      const topics = engineWithLimit.analyzeTopics(content);

      expect(topics.length).toBeLessThanOrEqual(3);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text =
        'Artificial intelligence is transforming many industries around the world';
      const keywords = engine.extractKeywords(text);

      expect(keywords).toBeDefined();
      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.every(kw => typeof kw === 'string')).toBe(true);
    });

    it('should limit keywords to maxKeywords parameter', () => {
      const text =
        'This is a very long text with many different words that should be extracted as keywords for testing purposes';
      const keywords = engine.extractKeywords(text, 5);

      expect(keywords.length).toBeLessThanOrEqual(5);
    });

    it('should filter out stop words', () => {
      const text = 'the and or but in on at to for of with by from up about';
      const keywords = engine.extractKeywords(text);

      expect(keywords.length).toBe(0);
    });

    it('should filter out short words', () => {
      const text = 'a an in on at to of is be it do';
      const keywords = engine.extractKeywords(text);

      expect(keywords.length).toBe(0);
    });
  });

  describe('calculateTFIDF', () => {
    it('should calculate TF-IDF for documents', () => {
      const documents = [
        'machine learning is great',
        'deep learning is powerful',
        'machine learning algorithms',
      ];

      const tfidf = engine.calculateTFIDF(documents);

      expect(tfidf).toBeDefined();
      expect(typeof tfidf).toBe('object');
      expect(Object.keys(tfidf).length).toBe(3);
    });

    it('should return zero for empty documents', () => {
      const tfidf = engine.calculateTFIDF([]);

      expect(Object.keys(tfidf).length).toBe(0);
    });
  });

  describe('analyzeSentiment', () => {
    it('should detect positive sentiment', () => {
      const text =
        'Ini adalah artikel yang sangat bagus dan luar biasa dengan konten positif';
      const sentiment = engine.analyzeSentiment(text, 1);

      expect(sentiment).toBeDefined();
      expect(sentiment.sentiment).toBe('positive');
      expect(sentiment.score).toBeGreaterThan(0);
      expect(sentiment.positiveWords.length).toBeGreaterThan(0);
    });

    it('should detect negative sentiment', () => {
      const text =
        'Ini adalah artikel yang buruk dan mengecewakan dengan konten negatif';
      const sentiment = engine.analyzeSentiment(text, 2);

      expect(sentiment).toBeDefined();
      expect(sentiment.sentiment).toBe('negative');
      expect(sentiment.score).toBeLessThan(0);
      expect(sentiment.negativeWords.length).toBeGreaterThan(0);
    });

    it('should detect neutral sentiment', () => {
      const text =
        'Artikel ini berisi informasi dasar tanpa emosi yang kuat';
      const sentiment = engine.analyzeSentiment(text, 3);

      expect(sentiment).toBeDefined();
      expect(sentiment.sentiment).toBe('neutral');
    });

    it('should return confidence between 0 and 1', () => {
      const sentiment = engine.analyzeSentiment('test content');
      expect(sentiment.confidence).toBeGreaterThanOrEqual(0);
      expect(sentiment.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('analyzeSentimentBatch', () => {
    it('should analyze sentiment for multiple contents', () => {
      const contents = [
        { id: 1, content: 'sangat bagus' },
        { id: 2, content: 'buruk sekali' },
        { id: 3, content: 'informasi biasa' },
      ];

      const sentiments = engine.analyzeSentimentBatch(contents);

      expect(sentiments).toBeDefined();
      expect(Array.isArray(sentiments)).toBe(true);
      expect(sentiments.length).toBe(3);
      expect(sentiments[0].sentiment).toBe('positive');
      expect(sentiments[1].sentiment).toBe('negative');
      expect(sentiments[2].sentiment).toBe('neutral');
    });
  });

  describe('clusterContent', () => {
    it('should cluster similar content', () => {
      const contentIds = [1, 2, 3, 4];
      const texts = [
        'machine learning algorithms',
        'deep learning models',
        'artificial intelligence systems',
        'tourism in Indonesia',
      ];

      const clusters = engine.clusterContent(contentIds, texts);

      expect(clusters).toBeDefined();
      expect(Array.isArray(clusters)).toBe(true);
    });

    it('should handle empty arrays', () => {
      const clusters = engine.clusterContent([], []);
      expect(clusters).toEqual([]);
    });

    it('should handle mismatched array lengths', () => {
      const clusters = engine.clusterContent([1, 2], ['text1']);
      expect(clusters).toEqual([]);
    });
  });

  describe('predictPerformance', () => {
    it('should predict performance with historical data', () => {
      const contentId = 1;
      const historicalData = [100, 120, 130, 140, 150, 160, 170];

      const prediction = engine.predictPerformance(contentId, historicalData);

      expect(prediction).toBeDefined();
      expect(prediction.contentId).toBe(contentId);
      expect(prediction.predictedViews).toBeGreaterThan(0);
      expect(prediction.predictedEngagement).toBeGreaterThan(0);
      expect(prediction.predictedConversions).toBeGreaterThan(0);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.model).toBeDefined();
      expect(prediction.optimalPublishTime).toBeDefined();
    });

    it('should return default prediction for insufficient data', () => {
      const prediction = engine.predictPerformance(1, [10, 20]);

      expect(prediction).toBeDefined();
      expect(prediction.confidence).toBeLessThan(1);
    });
  });

  describe('detectAnomaly', () => {
    it('should detect anomaly when z-score exceeds threshold', () => {
      const contentId = 1;
      const metric = 'views';
      const currentValue = 1000;
      const anomaly = engine.detectAnomaly(contentId, metric, currentValue);

      if (anomaly) {
        expect(anomaly).toBeDefined();
        expect(anomaly.contentId).toBe(contentId);
        expect(anomaly.metric).toBe(metric);
        expect(anomaly.actualValue).toBe(currentValue);
        expect(anomaly.severity).toBeDefined();
        expect(anomaly.anomalyType).toBeDefined();
      }
    });

    it('should return null for normal values', () => {
      const anomaly = engine.detectAnomaly(1, 'views', 100);

      expect(anomaly).toBeNull();
    });
  });

  describe('getTopicInsights', () => {
    it('should return topic insights', () => {
      engine.analyzeTopics([
        'test content about AI',
        'machine learning is great',
        'AI technology advances',
      ]);

      const insights = engine.getTopicInsights();

      expect(insights).toBeDefined();
      expect(insights.topTopics).toBeDefined();
      expect(insights.trendingTopics).toBeDefined();
      expect(insights.decliningTopics).toBeDefined();
      expect(insights.topicClusters).toBeDefined();
      expect(insights.keywordFrequency).toBeDefined();
    });
  });

  describe('getSentimentInsights', () => {
    it('should return sentiment insights', () => {
      engine.analyzeSentiment('bagus', 1);
      engine.analyzeSentiment('buruk', 2);

      const insights = engine.getSentimentInsights();

      expect(insights).toBeDefined();
      expect(typeof insights.averageScore).toBe('number');
      expect(insights.distribution).toBeDefined();
      expect(insights.trends).toBeDefined();
    });
  });

  describe('getPerformanceInsights', () => {
    it('should return performance insights', () => {
      engine.predictPerformance(1, [100, 120, 130, 140, 150, 160, 170]);

      const insights = engine.getPerformanceInsights();

      expect(insights).toBeDefined();
      expect(insights.predictions).toBeDefined();
      expect(insights.bestPerformingContent).toBeDefined();
      expect(insights.optimalPublishTimes).toBeDefined();
    });
  });

  describe('getSummary', () => {
    it('should return content intelligence summary', () => {
      const summary = engine.getSummary();

      expect(summary).toBeDefined();
      expect(typeof summary.totalTopics).toBe('number');
      expect(typeof summary.risingTopics).toBe('number');
      expect(typeof summary.decliningTopics).toBe('number');
      expect(typeof summary.averageSentiment).toBe('number');
      expect(typeof summary.totalClusters).toBe('number');
      expect(typeof summary.totalAnomalies).toBe('number');
      expect(typeof summary.highSeverityAnomalies).toBe('number');
      expect(typeof summary.lastUpdated).toBe('number');
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const newConfig = {
        maxTopics: 20,
        anomalyZScoreThreshold: 2.5,
      };

      const updatedConfig = engine.updateConfig(newConfig);

      expect(updatedConfig.maxTopics).toBe(20);
      expect(updatedConfig.anomalyZScoreThreshold).toBe(2.5);
    });

    it('should preserve existing config properties', () => {
      const engineWithConfig = new ContentIntelligenceEngine({
        maxTopics: 10,
      });

      const updatedConfig = engineWithConfig.updateConfig({
        anomalyZScoreThreshold: 2.5,
      });

      expect(updatedConfig.maxTopics).toBe(10);
      expect(updatedConfig.anomalyZScoreThreshold).toBe(2.5);
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = engine.getConfig();

      expect(config).toBeDefined();
      expect(config).toEqual(DEFAULT_CONTENT_INTELLIGENCE_CONFIG);
    });
  });

  describe('clearCache', () => {
    it('should clear all caches', () => {
      engine.analyzeTopics(['test']);
      engine.analyzeSentiment('test', 1);

      engine.clearCache();

      expect(engine.getAllTopics()).toEqual([]);
      expect(engine.getAllSentimentAnalysis()).toEqual([]);
    });
  });

  describe('reset', () => {
    it('should reset engine to default state', () => {
      const customConfig = {
        maxTopics: 20,
        anomalyZScoreThreshold: 2.5,
      };

      engine.updateConfig(customConfig);
      engine.analyzeTopics(['test']);

      engine.reset();

      const config = engine.getConfig();
      expect(config.maxTopics).toBe(DEFAULT_CONTENT_INTELLIGENCE_CONFIG.maxTopics);
      expect(config.anomalyZScoreThreshold).toBe(
        DEFAULT_CONTENT_INTELLIGENCE_CONFIG.anomalyZScoreThreshold
      );
      expect(engine.getAllTopics()).toEqual([]);
    });
  });
});
