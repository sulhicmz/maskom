import { BlogPostVersion, VersionDiff } from './blog';

export interface IVersionStorage {
  getPostVersions(postId: number): BlogPostVersion[];
  saveVersion(version: BlogPostVersion): void;
  deleteVersion(postId: number, versionId: string): void;
  clearPostVersions(postId: number): void;
  compareVersions(version1: BlogPostVersion, version2: BlogPostVersion): VersionDiff[];
  getVersionCount(postId: number): number;
}
