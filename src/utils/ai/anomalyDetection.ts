import type {
  ContentAnomaly,
  AnomalyType,
  ContentIntelligenceConfig,
} from '@/types/contentIntelligence';

export class ContentAnomalyDetectionEngine {
  private config: ContentIntelligenceConfig;
  private anomalies: Map<string, ContentAnomaly> = new Map();
  private metricHistory: Map<string, number[]> = new Map();

  constructor(config: ContentIntelligenceConfig) {
    this.config = config;
  }

  detectAnomaly(
    contentId: number,
    metric: string,
    currentValue: number
  ): ContentAnomaly | null {
    const history = this.metricHistory.get(metric) || [];
    history.push(currentValue);

    if (history.length < 10) {
      this.metricHistory.set(metric, history);
      return null;
    }

    const { mean, stdDev } = this.calculateStatistics(history);
    const zScore = stdDev > 0 ? (currentValue - mean) / stdDev : 0;

    if (Math.abs(zScore) < this.config.anomalyZScoreThreshold) {
      return null;
    }

    const anomaly = this.createAnomaly(
      contentId,
      metric,
      currentValue,
      mean,
      stdDev,
      zScore
    );

    this.anomalies.set(anomaly.id, anomaly);

    return anomaly;
  }

  private createAnomaly(
    contentId: number,
    metric: string,
    currentValue: number,
    expectedValue: number,
    stdDev: number,
    zScore: number
  ): ContentAnomaly {
    const deviation = Math.abs(currentValue - expectedValue);
    const anomalyType = this.determineAnomalyType(currentValue, expectedValue);
    const severity = this.determineSeverity(Math.abs(zScore));
    const { description, recommendation } = this.generateAnomalyDetails(
      anomalyType,
      metric,
      deviation,
      expectedValue
    );

    return {
      id: `anomaly-${Date.now()}-${contentId}`,
      contentId,
      anomalyType,
      metric,
      actualValue: currentValue,
      expectedValue,
      deviation,
      zScore,
      severity,
      description,
      recommendation,
      detectedAt: Date.now(),
    };
  }

  private determineAnomalyType(
    actualValue: number,
    expectedValue: number
  ): AnomalyType {
    if (actualValue > expectedValue * 1.5) return 'spike';
    if (actualValue < expectedValue * 0.5) return 'drop';
    return 'outlier';
  }

  private determineSeverity(zScore: number): 'low' | 'medium' | 'high' {
    if (Math.abs(zScore) < 3.5) return 'low';
    if (Math.abs(zScore) < 4.5) return 'medium';
    return 'high';
  }

  private calculateStatistics(values: number[]): {
    mean: number;
    stdDev: number;
  } {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }

  private generateAnomalyDetails(
    anomalyType: AnomalyType,
    metric: string,
    deviation: number,
    expectedValue: number
  ): { description: string; recommendation: string } {
    const details: Record<
      AnomalyType,
      { description: string; recommendation: string }
    > = {
      spike: {
        description: `Peningkatan tajam dalam ${metric}: +${deviation.toFixed(2)} di atas rata-rata ${expectedValue.toFixed(2)}`,
        recommendation:
          'Investigasi sumber lalu lintas tak terduga dan pertimbangkan meningkatkan kapasitas server',
      },
      drop: {
        description: `Penurunan tajam dalam ${metric}: -${deviation.toFixed(2)} di bawah rata-rata ${expectedValue.toFixed(2)}`,
        recommendation:
          'Periksa masalah teknis, verifikasi integrasi, dan review perubahan konten terbaru',
      },
      outlier: {
        description: `Nilai luar biasa terdeteksi dalam ${metric}: ${deviation.toFixed(2)} deviasi dari rata-rata`,
        recommendation:
          'Validasi data sumber, konfirmasi keakuratan pelaporan, dan investigasi penyebab potensial',
      },
    };

    return details[anomalyType];
  }

  getAnomalies(filter?: {
    contentId?: number;
    anomalyType?: AnomalyType;
    severity?: 'low' | 'medium' | 'high';
    startDate?: number;
    endDate?: number;
  }): ContentAnomaly[] {
    let anomalies = Array.from(this.anomalies.values());

    if (filter) {
      if (filter.contentId) {
        anomalies = anomalies.filter(a => a.contentId === filter.contentId);
      }
      if (filter.anomalyType) {
        anomalies = anomalies.filter(a => a.anomalyType === filter.anomalyType);
      }
      if (filter.severity) {
        anomalies = anomalies.filter(a => a.severity === filter.severity);
      }
      if (filter.startDate) {
        anomalies = anomalies.filter(a => a.detectedAt >= filter.startDate!);
      }
      if (filter.endDate) {
        anomalies = anomalies.filter(a => a.detectedAt <= filter.endDate!);
      }
    }

    return anomalies.sort((a, b) => b.detectedAt - a.detectedAt);
  }

  getAnomaly(id: string): ContentAnomaly | undefined {
    return this.anomalies.get(id);
  }

  getHighSeverityAnomalies(): ContentAnomaly[] {
    return this.getAnomalies({ severity: 'high' });
  }

  getAnomaliesByContentId(contentId: number): ContentAnomaly[] {
    return this.getAnomalies({ contentId });
  }

  getAnomaliesByType(anomalyType: AnomalyType): ContentAnomaly[] {
    return this.getAnomalies({ anomalyType });
  }

  getAnomalyStatistics(): {
    total: number;
    byType: Record<AnomalyType, number>;
    bySeverity: Record<'low' | 'medium' | 'high', number>;
    highSeverityCount: number;
  } {
    const anomalies = Array.from(this.anomalies.values());

    const byType: Record<AnomalyType, number> = {
      spike: 0,
      drop: 0,
      outlier: 0,
    };

    const bySeverity: Record<'low' | 'medium' | 'high', number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    anomalies.forEach(a => {
      byType[a.anomalyType]++;
      bySeverity[a.severity]++;
    });

    return {
      total: anomalies.length,
      byType,
      bySeverity,
      highSeverityCount: bySeverity.high,
    };
  }

  clearAnomalies(olderThan?: number): void {
    if (olderThan) {
      const cutoff = Date.now() - olderThan;
      this.anomalies.forEach((anomaly, id) => {
        if (anomaly.detectedAt < cutoff) {
          this.anomalies.delete(id);
        }
      });
    } else {
      this.anomalies.clear();
    }
  }

  clearMetricHistory(olderThan?: number): void {
    if (olderThan) {
      this.metricHistory.clear();
    }
  }

  clearCache(): void {
    this.anomalies.clear();
    this.metricHistory.clear();
  }

  updateConfig(config: Partial<ContentIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
