'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { contentIntelligenceEngine } from '@/utils/ai';
import type {
  Topic,
  SentimentAnalysis,
  ContentCluster,
  PerformancePrediction,
  ContentAnomaly,
  ContentIntelligenceSummary,
  TopicTrend,
  SentimentType,
} from '@/types/contentIntelligence';

const ContentIntelligenceDashboard = () => {
  const { theme: _theme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'topics' | 'sentiment' | 'performance' | 'anomalies'
  >('overview');

  const [summary, setSummary] = useState<ContentIntelligenceSummary | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [clusters, setClusters] = useState<ContentCluster[]>([]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis[]>([]);
  const [predictions, setPredictions] = useState<PerformancePrediction[]>([]);
  const [anomalies, setAnomalies] = useState<ContentAnomaly[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<ContentAnomaly | null>(null);
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentType | 'all'>('all');

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setSummary(contentIntelligenceEngine.getSummary());
    setTopics(contentIntelligenceEngine.getAllTopics());
    setClusters(contentIntelligenceEngine.getAllClusters());
    setSentimentAnalysis(contentIntelligenceEngine.getAllSentimentAnalysis());
    setPredictions(contentIntelligenceEngine.getAllPredictions());
    setAnomalies(contentIntelligenceEngine.getAllAnomalies());
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      loadData();
    } catch (error) {
      console.error('Gagal memuat data Content Intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendColor = (trend: TopicTrend) => {
    switch (trend) {
      case 'rising':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'declining':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getSentimentColor = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'negative':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getAnomalySeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const filteredAnomalies = anomalies.filter(a =>
    anomalyFilter === 'all' ? true : a.severity === anomalyFilter
  );

  const filteredSentiment = sentimentAnalysis.filter(s =>
    sentimentFilter === 'all' ? true : s.sentiment === sentimentFilter
  );

  if (!summary) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="text-lg mb-2">Memuat Content Intelligence...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Content Intelligence</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analisis berbasis AI untuk topik, sentimen, prediksi kinerja, dan anomali konten
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('topics')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'topics'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Topik
        </button>
        <button
          onClick={() => setActiveTab('sentiment')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'sentiment'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Sentimen
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'performance'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Prediksi
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'anomalies'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Anomali
        </button>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg ml-auto ${
            isLoading
              ? 'bg-gray-300 text-gray-500'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isLoading ? 'Memuat...' : 'Segarkan'}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold mb-2">{summary.totalTopics}</div>
            <div className="text-gray-600 dark:text-gray-400">Total Topik</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold mb-2 text-green-600">
              {summary.risingTopics}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Topik Naik</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold mb-2 text-red-600">
              {summary.decliningTopics}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Topik Turun</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold mb-2">
              {summary.averageSentiment.toFixed(2)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Rata-rata Sentimen</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold mb-2">{summary.totalClusters}</div>
            <div className="text-gray-600 dark:text-gray-400">Total Klaster</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold mb-2">{summary.totalAnomalies}</div>
            <div className="text-gray-600 dark:text-gray-400">Total Anomali</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold mb-2 text-red-600">
              {summary.highSeverityAnomalies}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Anomali Prioritas Tinggi
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold mb-2">
              {(summary.averagePredictionAccuracy * 100).toFixed(0)}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Akurasi Prediksi
            </div>
          </div>
        </div>
      )}

      {activeTab === 'topics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Topik Teratas</h2>
            <div className="space-y-3">
              {topics.slice(0, 10).map(topic => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div>
                    <div className="font-semibold">{topic.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Frekuensi: {topic.frequency} | Skor: {topic.score.toFixed(2)}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(
                      topic.trend
                    )}`}
                  >
                    {topic.trend === 'rising' ? 'Naik' : topic.trend === 'declining' ? 'Turun' : 'Stabil'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Klaster Konten</h2>
            <div className="space-y-3">
              {clusters.map(cluster => (
                <div
                  key={cluster.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="font-semibold">{cluster.clusterLabel}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {cluster.contentIds.length} konten | Similaritas:{' '}
                    {cluster.similarity.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sentiment' && (
        <div>
          <div className="mb-4 flex gap-2">
            <select
              value={sentimentFilter}
              onChange={(e) =>
                setSentimentFilter(e.target.value as SentimentType | 'all')
              }
              className="px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">Semua Sentimen</option>
              <option value="positive">Positif</option>
              <option value="negative">Negatif</option>
              <option value="neutral">Netral</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Analisis Sentimen</h2>
              <div className="space-y-3">
                {filteredSentiment.slice(0, 20).map(s => (
                  <div
                    key={s.timestamp}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">
                        Konten #{s.contentId}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(
                          s.sentiment
                        )}`}
                      >
                        {s.sentiment === 'positive' ? 'Positif' : s.sentiment === 'negative' ? 'Negatif' : 'Netral'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Skor: {s.score.toFixed(2)} | Kepercayaan:{' '}
                      {(s.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Prediksi Kinerja</h2>
          <div className="space-y-3">
            {predictions.map(p => (
              <div
                key={p.timestamp}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Konten #{p.contentId}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Model: {p.model}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Prediksi Tampilan
                    </div>
                    <div className="font-semibold">{p.predictedViews}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Prediksi Keterlibatan
                    </div>
                    <div className="font-semibold">{p.predictedEngagement}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Kepercayaan
                    </div>
                    <div className="font-semibold">
                      {(p.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Waktu Publikasi Optimal: {p.optimalPublishTime}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {p.publishTimeReason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'anomalies' && (
        <div>
          <div className="mb-4 flex gap-2">
            <select
              value={anomalyFilter}
              onChange={(e) =>
                setAnomalyFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')
              }
              className="px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">Semua Anomali</option>
              <option value="high">Prioritas Tinggi</option>
              <option value="medium">Prioritas Sedang</option>
              <option value="low">Prioritas Rendah</option>
            </select>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Anomali Konten</h2>
            <div className="space-y-3">
              {filteredAnomalies.map(anomaly => (
                <div
                  key={anomaly.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">
                      Konten #{anomaly.contentId}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getAnomalySeverityColor(
                        anomaly.severity
                      )}`}
                    >
                      {anomaly.severity === 'high' ? 'Tinggi' : anomaly.severity === 'medium' ? 'Sedang' : 'Rendah'}
                    </span>
                  </div>
                  <div className="text-sm mb-2">
                    <div className="text-gray-600 dark:text-gray-400">
                      Metrik: {anomaly.metric}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Tipe: {anomaly.anomalyType === 'spike' ? 'Lonjakan' : anomaly.anomalyType === 'drop' ? 'Penurunan' : 'Outlier'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Nilai: {anomaly.actualValue} (diharapkan:{' '}
                      {anomaly.expectedValue.toFixed(2)})
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Deviasi: {anomaly.deviation.toFixed(2)} | Z-Score:{' '}
                      {anomaly.zScore.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                    <div className="font-semibold mb-1">Rekomendasi:</div>
                    <div>{anomaly.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentIntelligenceDashboard;
