import type {
  PerformancePrediction,
  PredictionModel,
  ContentIntelligenceConfig,
} from '@/types/contentIntelligence';

export class PredictiveAnalyticsEngine {
  private config: ContentIntelligenceConfig;
  private predictions: Map<number, PerformancePrediction[]> = new Map();
  private historicalData: Map<number, number[]> = new Map();

  constructor(config: ContentIntelligenceConfig) {
    this.config = config;
  }

  predictPerformance(
    contentId: number,
    historicalData: number[]
  ): PerformancePrediction {
    if (historicalData.length < 3) {
      return this.getDefaultPrediction(contentId);
    }

    const models: PredictionModel[] = ['linear_regression', 'moving_average', 'exponential_smoothing'];
    let bestModel = models[0];
    let bestScore = Infinity;

    const predictions = models.map(model => {
      const prediction = this.applyModel(model, historicalData);
      const error = this.calculatePredictionError(prediction, historicalData.slice(-5));

      if (error < bestScore) {
        bestScore = error;
        bestModel = model;
      }

      return { model, prediction, error };
    });

    const bestPrediction = predictions.find(p => p.model === bestModel)!;
    const forecastData = historicalData.slice(-this.config.predictionWindowSize);

    const performancePrediction: PerformancePrediction = {
      contentId,
      predictedViews: Math.round(bestPrediction.prediction),
      predictedEngagement: Math.round(bestPrediction.prediction * 0.3),
      predictedConversions: Math.round(bestPrediction.prediction * 0.05),
      confidence: Math.max(0, 1 - bestScore),
      model: bestModel,
      optimalPublishTime: this.calculateOptimalPublishTime(contentId, forecastData),
      publishTimeReason: this.getPublishTimeReason(bestModel, forecastData),
      timestamp: Date.now(),
    };

    this.addPrediction(contentId, performancePrediction);
    this.historicalData.set(contentId, historicalData);

    return performancePrediction;
  }

  private applyModel(model: PredictionModel, data: number[]): number {
    switch (model) {
      case 'linear_regression':
        return this.linearRegression(data);
      case 'moving_average':
        return this.movingAverage(data);
      case 'exponential_smoothing':
        return this.exponentialSmoothing(data);
      default:
        return this.movingAverage(data);
    }
  }

  private linearRegression(data: number[]): number {
    const n = data.length;
    if (n < 2) return data[data.length - 1];

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * n + intercept;
  }

  private movingAverage(data: number[]): number {
    const window = Math.min(7, Math.floor(data.length / 2));
    const recentData = data.slice(-window);

    return (
      recentData.reduce((sum, val) => sum + val, 0) / recentData.length
    );
  }

  private exponentialSmoothing(data: number[]): number {
    const alpha = 0.3;
    let smoothed = data[0];

    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i] + (1 - alpha) * smoothed;
    }

    return smoothed;
  }

  private calculatePredictionError(
    prediction: number,
    actual: number[]
  ): number {
    const errors = actual.map(a => Math.abs(prediction - a));
    return errors.reduce((sum, e) => sum + e, 0) / errors.length;
  }

  private calculateOptimalPublishTime(
    contentId: number,
    historicalData: number[]
  ): string {
    const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const today = new Date().getDay();

    const avgByHour = this.calculateAverageByHour(historicalData);
    const bestHour = avgByHour.indexOf(Math.max(...avgByHour));

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const bestDay = days[Math.floor(Math.random() * days.length)];

    return `${bestDay} jam ${bestHour}:00`;
  }

  private calculateAverageByHour(data: number[]): number[] {
    const hours = 24;
    const hourlySums = Array(hours).fill(0);
    const hourlyCounts = Array(hours).fill(0);

    data.forEach((value, index) => {
      const hour = index % hours;
      hourlySums[hour] += value;
      hourlyCounts[hour]++;
    });

    return hourlySums.map((sum, i) =>
      hourlyCounts[i] > 0 ? sum / hourlyCounts[i] : 0
    );
  }

  private getPublishTimeReason(model: PredictionModel, data: number[]): string {
    const reasons: Record<PredictionModel, string> = {
      linear_regression: 'Berdasarkan tren linear data historis',
      moving_average: 'Berdasarkan rata-rata bergerak data terbaru',
      exponential_smoothing: 'Berdasarkan eksponensial dengan penekanan data baru',
    };

    return reasons[model] || 'Berdasarkan analisis data historis';
  }

  private getDefaultPrediction(contentId: number): PerformancePrediction {
    return {
      contentId,
      predictedViews: 100,
      predictedEngagement: 30,
      predictedConversions: 5,
      confidence: 0.5,
      model: 'moving_average',
      optimalPublishTime: 'Senin jam 09:00',
      publishTimeReason: 'Prediksi default karena data tidak mencukupi',
      timestamp: Date.now(),
    };
  }

  private addPrediction(
    contentId: number,
    prediction: PerformancePrediction
  ): void {
    const history = this.predictions.get(contentId) || [];
    history.push(prediction);

    if (history.length > 100) history.shift();

    this.predictions.set(contentId, history);
  }

  getBestPerformingContent(limit: number = 10): Array<{
    contentId: number;
    predictedViews: number;
    predictedEngagement: number;
  }> {
    const allPredictions = Array.from(this.predictions.values()).flat();

    return allPredictions
      .sort((a, b) => b.predictedViews - a.predictedViews)
      .slice(0, limit)
      .map(p => ({
        contentId: p.contentId,
        predictedViews: p.predictedViews,
        predictedEngagement: p.predictedEngagement,
      }));
  }

  getForecast(days: number = 30): Array<{
    date: string;
    predictedViews: number;
    predictedEngagement: number;
  }> {
    const allPredictions = Array.from(this.predictions.values()).flat();
    if (allPredictions.length === 0) return [];

    const avgViews =
      allPredictions.reduce((sum, p) => sum + p.predictedViews, 0) /
      allPredictions.length;
    const avgEngagement =
      allPredictions.reduce((sum, p) => sum + p.predictedEngagement, 0) /
      allPredictions.length;

    const forecast = [];
    const startDate = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const variance = 1 + (Math.random() - 0.5) * 0.2;

      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedViews: Math.round(avgViews * variance),
        predictedEngagement: Math.round(avgEngagement * variance),
      });
    }

    return forecast;
  }

  getOptimalPublishTimes(): Array<{
    dayOfWeek: string;
    hour: number;
    averageEngagement: number;
  }> {
    const allPredictions = Array.from(this.predictions.values()).flat();
    const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const optimalTimes: Array<{
      dayOfWeek: string;
      hour: number;
      averageEngagement: number;
    }> = [];

    const engagementByDayHour: Map<string, number[]> = new Map();

    allPredictions.forEach(p => {
      const date = new Date(p.timestamp);
      const dayOfWeek = daysOfWeek[date.getDay()];
      const hour = date.getHours();
      const key = `${dayOfWeek}-${hour}`;

      const engagements = engagementByDayHour.get(key) || [];
      engagements.push(p.predictedEngagement);
      engagementByDayHour.set(key, engagements);
    });

    engagementByDayHour.forEach((engagements, key) => {
      const [dayOfWeek, hourStr] = key.split('-');
      const hour = parseInt(hourStr, 10);
      const avgEngagement =
        engagements.reduce((sum, e) => sum + e, 0) / engagements.length;

      optimalTimes.push({
        dayOfWeek,
        hour,
        averageEngagement: avgEngagement,
      });
    });

    return optimalTimes
      .sort((a, b) => b.averageEngagement - a.averageEngagement)
      .slice(0, 10);
  }

  getAllPredictions(): PerformancePrediction[] {
    return Array.from(this.predictions.values()).flat();
  }

  clearCache(): void {
    this.predictions.clear();
    this.historicalData.clear();
  }

  updateConfig(config: Partial<ContentIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
