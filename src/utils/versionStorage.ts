import { BlogPostVersion, VersionDiff } from '@/types/blog';

const STORAGE_KEY_PREFIX = 'blog_version_';
const VERSION_LIST_KEY = 'blog_version_list';
const MAX_VERSIONS_PER_POST = 20;

export interface VersionStorageConfig {
   maxVersions?: number;
}

export class VersionStorage {
   private maxVersions: number;

   constructor(config: VersionStorageConfig = {}) {
      this.maxVersions = config.maxVersions || MAX_VERSIONS_PER_POST;
   }

   getPostVersions(postId: number): BlogPostVersion[] {
      if (typeof window === 'undefined') return [];

      try {
         const listKey = `${VERSION_LIST_KEY}_${postId}`;
         const stored = localStorage.getItem(listKey);
         if (!stored) return [];

         const versionIds: string[] = JSON.parse(stored);
         const versions: BlogPostVersion[] = [];

         for (const id of versionIds) {
            const version = this.getSingleVersion(id);
            if (version) {
               versions.push(version);
            }
         }

         return versions.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
         );
      } catch (error) {
         console.error(`Failed to load versions for post ${postId}:`, error);
         return [];
      }
   }

   saveVersion(version: BlogPostVersion): void {
      if (typeof window === 'undefined') return;

      try {
         const listKey = `${VERSION_LIST_KEY}_${version.postId}`;
         let versionIds: string[] = [];

         const stored = localStorage.getItem(listKey);
         if (stored) {
            versionIds = JSON.parse(stored);
         }

         const existingIndex = versionIds.findIndex(id => id === version.id);
         if (existingIndex === -1) {
            versionIds.unshift(version.id);
         }

         localStorage.setItem(this.getVersionKey(version.id), JSON.stringify(version));

         if (versionIds.length > this.maxVersions) {
            const removedIds = versionIds.splice(this.maxVersions);
            for (const id of removedIds) {
               localStorage.removeItem(this.getVersionKey(id));
            }
         }

         localStorage.setItem(listKey, JSON.stringify(versionIds));
      } catch (error) {
         console.error(`Failed to save version ${version.id}:`, error);
      }
   }

   deleteVersion(postId: number, versionId: string): void {
      if (typeof window === 'undefined') return;

      try {
         const listKey = `${VERSION_LIST_KEY}_${postId}`;
         const stored = localStorage.getItem(listKey);
         if (!stored) return;

         const versionIds: string[] = JSON.parse(stored);
         const filteredIds = versionIds.filter(id => id !== versionId);

         if (filteredIds.length === 0) {
            localStorage.removeItem(listKey);
         } else {
            localStorage.setItem(listKey, JSON.stringify(filteredIds));
         }

         localStorage.removeItem(this.getVersionKey(versionId));
      } catch (error) {
         console.error(`Failed to delete version ${versionId}:`, error);
      }
   }

   clearPostVersions(postId: number): void {
      if (typeof window === 'undefined') return;

      try {
         const versions = this.getPostVersions(postId);
         for (const version of versions) {
            localStorage.removeItem(this.getVersionKey(version.id));
         }
         localStorage.removeItem(`${VERSION_LIST_KEY}_${postId}`);
      } catch (error) {
         console.error(`Failed to clear versions for post ${postId}:`, error);
      }
   }

   compareVersions(version1: BlogPostVersion, version2: BlogPostVersion): VersionDiff[] {
      const diffs: VersionDiff[] = [];
      const fields1 = Object.keys(version1.content);
      const fields2 = Object.keys(version2.content);
      const allFields = new Set([...fields1, ...fields2]);

      for (const field of allFields) {
         const val1 = version1.content[field as keyof typeof version1.content];
         const val2 = version2.content[field as keyof typeof version2.content];

         if (val1 === undefined && val2 !== undefined) {
            diffs.push({
               field,
               oldValue: val1,
               newValue: val2,
               type: 'added'
            });
         } else if (val1 !== undefined && val2 === undefined) {
            diffs.push({
               field,
               oldValue: val1,
               newValue: val2,
               type: 'removed'
            });
         } else if (val1 !== val2) {
            diffs.push({
               field,
               oldValue: val1,
               newValue: val2,
               type: 'changed'
            });
         }
      }

      return diffs;
   }

   getVersionCount(postId: number): number {
      return this.getPostVersions(postId).length;
   }

   private getVersionKey(id: string): string {
      return `${STORAGE_KEY_PREFIX}${id}`;
   }

   private getSingleVersion(id: string): BlogPostVersion | null {
      try {
         const stored = localStorage.getItem(this.getVersionKey(id));
         if (!stored) return null;
         return JSON.parse(stored);
      } catch (error) {
         console.error(`Failed to load version ${id}:`, error);
         return null;
      }
   }
}

export const versionStorage = new VersionStorage();
