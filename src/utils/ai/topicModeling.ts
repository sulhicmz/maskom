import type {
  Topic,
  TopicCluster,
  IContentIntelligenceEngine,
  ContentIntelligenceConfig,
} from '@/types/contentIntelligence';

export class TopicModelingEngine {
  private config: ContentIntelligenceConfig;
  private topics: Map<string, Topic> = new Map();
  private clusters: Map<string, TopicCluster> = new Map();

  constructor(config: ContentIntelligenceConfig) {
    this.config = config;
  }

  analyzeTopics(content: string[]): Topic[] {
    const topicScores = new Map<string, number>();

    content.forEach(text => {
      const keywords = this.extractKeywords(text, this.config.maxTopics);
      keywords.forEach(keyword => {
        topicScores.set(keyword, (topicScores.get(keyword) || 0) + 1);
      });
    });

    const sortedTopics = Array.from(topicScores.entries())
      .filter(([_, freq]) => freq >= this.config.minTopicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.config.maxTopics);

    const topics: Topic[] = sortedTopics.map(([keyword, freq], index) => ({
      id: `topic-${index}`,
      name: keyword,
      keywords: [keyword],
      score: freq / content.length,
      frequency: freq,
      trend: this.calculateTrend(keyword, content),
      confidence: Math.min(freq / content.length * 2, 1),
    }));

    topics.forEach(topic => this.topics.set(topic.id, topic));

    return topics;
  }

  extractKeywords(text: string, maxKeywords = 10): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.isStopWord(word));

    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    const sorted = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords);

    return sorted.map(([word]) => word);
  }

  calculateTFIDF(documents: string[]): Record<string, Record<string, number>> {
    const termFreq: Record<string, Record<string, number>> = {};
    const docFreq: Record<string, number> = {};
    const totalDocs = documents.length;

    documents.forEach((doc, docId) => {
      const words = this.extractKeywords(doc, 50);
      const wordSet = new Set(words);

      termFreq[docId] = {};

      words.forEach(word => {
        termFreq[docId][word] = (termFreq[docId][word] || 0) + 1;
      });

      wordSet.forEach(word => {
        docFreq[word] = (docFreq[word] || 0) + 1;
      });
    });

    const tfidf: Record<string, Record<string, number>> = {};

    Object.keys(termFreq).forEach(docId => {
      tfidf[docId] = {};
      const totalWords = Object.values(termFreq[docId]).reduce((a, b) => a + b, 0);

      Object.keys(termFreq[docId]).forEach(term => {
        const tf = termFreq[docId][term] / totalWords;
        const idf = Math.log(totalDocs / (docFreq[term] || 1));
        tfidf[docId][term] = tf * idf;
      });
    });

    return tfidf;
  }

  clusterTopics(topics: Topic[]): TopicCluster[] {
    if (topics.length < 2) return [];

    const clusters: TopicCluster[] = [];
    const used = new Set<string>();

    topics.forEach(topic => {
      if (used.has(topic.id)) return;

      const similarTopics = topics.filter(
        t =>
          !used.has(t.id) &&
          this.calculateSimilarity(topic.name, t.name) >= this.config.clusterSimilarityThreshold
      );

      if (similarTopics.length > 0) {
        similarTopics.forEach(t => used.add(t.id));

        const cluster: TopicCluster = {
          id: `cluster-${clusters.length}`,
          topics: similarTopics,
          centroid: this.calculateCentroid(similarTopics),
          similarity: this.calculateClusterSimilarity(similarTopics),
        };

        clusters.push(cluster);
        this.clusters.set(cluster.id, cluster);
      }
    });

    return clusters;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.extractKeywords(text1, 50));
    const words2 = new Set(this.extractKeywords(text2, 50));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private calculateCentroid(topics: Topic[]): string {
    const allKeywords = topics.flatMap(t => t.keywords);
    const freq = new Map<string, number>();

    allKeywords.forEach(kw => {
      freq.set(kw, (freq.get(kw) || 0) + 1);
    });

    const sorted = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || topics[0].name;
  }

  private calculateClusterSimilarity(topics: Topic[]): number {
    if (topics.length < 2) return 1;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < topics.length; i++) {
      for (let j = i + 1; j < topics.length; j++) {
        totalSimilarity += this.calculateSimilarity(topics[i].name, topics[j].name);
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 1;
  }

  private calculateTrend(keyword: string, content: string[]): 'rising' | 'declining' | 'stable' {
    const frequency = content.filter(c => c.toLowerCase().includes(keyword)).length;
    const avgFrequency = content.length / 10;

    if (frequency > avgFrequency * 1.5) return 'rising';
    if (frequency < avgFrequency * 0.5) return 'declining';
    return 'stable';
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'dan', 'atau', 'yang', 'dengan', 'untuk', 'dari', 'ke', 'di',
      'adalah', 'ini', 'itu', 'pada', 'oleh', 'sebagai', 'karena',
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over',
      'after', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'a', 'an',
    ]);

    return stopWords.has(word.toLowerCase());
  }

  getTopics(): Topic[] {
    return Array.from(this.topics.values());
  }

  getClusters(): TopicCluster[] {
    return Array.from(this.clusters.values());
  }

  clearCache(): void {
    this.topics.clear();
    this.clusters.clear();
  }

  updateConfig(config: Partial<ContentIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
