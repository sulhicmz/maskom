import type {
  ContentCluster,
  ContentIntelligenceConfig,
} from '@/types/contentIntelligence';

export class ContentClusteringEngine {
  private config: ContentIntelligenceConfig;
  private clusters: Map<string, ContentCluster> = new Map();

  constructor(config: ContentIntelligenceConfig) {
    this.config = config;
  }

  clusterContent(contentIds: number[], texts: string[]): ContentCluster[] {
    if (contentIds.length !== texts.length || contentIds.length < 2) {
      return [];
    }

    const similarityMatrix = this.buildSimilarityMatrix(texts);
    const clusters = this.performHierarchicalClustering(
      contentIds,
      similarityMatrix
    );

    clusters.forEach(cluster => {
      this.clusters.set(cluster.id, cluster);
    });

    return clusters;
  }

  private buildSimilarityMatrix(texts: string[]): number[][] {
    const size = texts.length;
    const matrix: number[][] = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));

    for (let i = 0; i < size; i++) {
      for (let j = i; j < size; j++) {
        const similarity = this.calculateJaccardSimilarity(texts[i], texts[j]);
        matrix[i][j] = similarity;
        matrix[j][i] = similarity;
      }
    }

    return matrix;
  }

  private calculateJaccardSimilarity(text1: string, text2: string): number {
    const set1 = new Set(this.extractTokens(text1));
    const set2 = new Set(this.extractTokens(text2));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private extractTokens(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 3);
  }

  private performHierarchicalClustering(
    contentIds: number[],
    similarityMatrix: number[][]
  ): ContentCluster[] {
    const clusters: Map<number, number[]> = new Map();
    const clusterLabels: Map<number, string> = new Map();

    contentIds.forEach((id, index) => {
      clusters.set(id, [id]);
      clusterLabels.set(id, `cluster-${id}`);
    });

    while (clusters.size > 1) {
      let maxSimilarity = -1;
      let mergeI = -1;
      let mergeJ = -1;

      const clusterIds = Array.from(clusters.keys());

      for (let i = 0; i < clusterIds.length; i++) {
        for (let j = i + 1; j < clusterIds.length; j++) {
          const id1 = clusterIds[i];
          const id2 = clusterIds[j];
          const similarity = this.calculateClusterSimilarity(
            clusters.get(id1)!,
            clusters.get(id2)!,
            contentIds,
            similarityMatrix
          );

          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mergeI = id1;
            mergeJ = id2;
          }
        }
      }

      if (maxSimilarity < this.config.clusterSimilarityThreshold) {
        break;
      }

      const mergedCluster = [
        ...(clusters.get(mergeI) || []),
        ...(clusters.get(mergeJ) || []),
      ];
      const newId = Math.max(...Array.from(clusters.keys())) + 1;
      const newLabel = `cluster-${newId}`;

      clusters.delete(mergeI);
      clusters.delete(mergeJ);
      clusters.set(newId, mergedCluster);
      clusterLabels.delete(mergeI);
      clusterLabels.delete(mergeJ);
      clusterLabels.set(newId, newLabel);
    }

    const resultClusters: ContentCluster[] = [];
    const allContentIds = new Set(contentIds);
    const assignedIds = new Set<number>();

    clusters.forEach((members, clusterId) => {
      const cluster: ContentCluster = {
        id: clusterLabels.get(clusterId) || `cluster-${clusterId}`,
        contentIds: members,
        centroid: this.calculateClusterCentroid(members),
        similarity: this.calculateClusterCohesion(
          members,
          contentIds,
          similarityMatrix
        ),
        clusterLabel: this.generateClusterLabel(members),
      };

      resultClusters.push(cluster);
      members.forEach(id => assignedIds.add(id));
    });

    allContentIds.forEach(id => {
      if (!assignedIds.has(id)) {
        resultClusters.push({
          id: `cluster-${id}`,
          contentIds: [id],
          centroid: 'singleton',
          similarity: 1,
          clusterLabel: 'unique',
        });
      }
    });

    return resultClusters;
  }

  private calculateClusterSimilarity(
    cluster1: number[],
    cluster2: number[],
    contentIds: number[],
    similarityMatrix: number[][]
  ): number {
    let totalSimilarity = 0;
    let count = 0;

    cluster1.forEach(id1 => {
      cluster2.forEach(id2 => {
        const idx1 = contentIds.indexOf(id1);
        const idx2 = contentIds.indexOf(id2);
        if (idx1 >= 0 && idx2 >= 0) {
          totalSimilarity += similarityMatrix[idx1][idx2];
          count++;
        }
      });
    });

    return count > 0 ? totalSimilarity / count : 0;
  }

  private calculateClusterCentroid(contentIds: number[]): string {
    return contentIds.length > 1 ? `group-${contentIds[0]}` : `singleton`;
  }

  private calculateClusterCohesion(
    cluster: number[],
    allContentIds: number[],
    similarityMatrix: number[][]
  ): number {
    if (cluster.length < 2) return 1;

    let totalSimilarity = 0;
    let count = 0;

    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        const idx1 = allContentIds.indexOf(cluster[i]);
        const idx2 = allContentIds.indexOf(cluster[j]);
        if (idx1 >= 0 && idx2 >= 0) {
          totalSimilarity += similarityMatrix[idx1][idx2];
          count++;
        }
      }
    }

    return count > 0 ? totalSimilarity / count : 0;
  }

  private generateClusterLabel(contentIds: number[]): string {
    const commonWords = this.findCommonKeywords(contentIds);
    return commonWords.slice(0, 2).join('-') || `cluster-${contentIds[0]}`;
  }

  private findCommonKeywords(contentIds: number[]): string[] {
    return [];
  }

  getClusters(): ContentCluster[] {
    return Array.from(this.clusters.values());
  }

  clearCache(): void {
    this.clusters.clear();
  }

  updateConfig(config: Partial<ContentIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
