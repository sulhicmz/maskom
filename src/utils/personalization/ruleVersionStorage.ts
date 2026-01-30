import { PersonalizationRuleVersion, RuleVersionDiff } from '@/types/personalization';

const STORAGE_KEY_PREFIX = 'personalization_rule_version_';
const VERSION_LIST_KEY = 'personalization_rule_version_list';
const MAX_VERSIONS_PER_RULE = 20;

export interface RuleVersionStorageConfig {
  maxVersions?: number;
}

export class RuleVersionStorage {
  private maxVersions: number;

  constructor(config: RuleVersionStorageConfig = {}) {
    this.maxVersions = config.maxVersions || MAX_VERSIONS_PER_RULE;
  }

  getRuleVersions(ruleId: string): PersonalizationRuleVersion[] {
    if (typeof window === 'undefined') return [];

    try {
      const listKey = `${VERSION_LIST_KEY}_${ruleId}`;
      const stored = localStorage.getItem(listKey);
      if (!stored) return [];

      const versionIds: string[] = JSON.parse(stored);
      const versions: PersonalizationRuleVersion[] = [];

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
      console.error(`Failed to load versions for rule ${ruleId}:`, error);
      return [];
    }
  }

  saveVersion(version: PersonalizationRuleVersion): void {
    if (typeof window === 'undefined') return;

    try {
      const listKey = `${VERSION_LIST_KEY}_${version.ruleId}`;
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

  deleteVersion(ruleId: string, versionId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const listKey = `${VERSION_LIST_KEY}_${ruleId}`;
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

  clearRuleVersions(ruleId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const versions = this.getRuleVersions(ruleId);
      for (const version of versions) {
        localStorage.removeItem(this.getVersionKey(version.id));
      }
      localStorage.removeItem(`${VERSION_LIST_KEY}_${ruleId}`);
    } catch (error) {
      console.error(`Failed to clear versions for rule ${ruleId}:`, error);
    }
  }

  compareVersions(version1: PersonalizationRuleVersion, version2: PersonalizationRuleVersion): RuleVersionDiff[] {
    const diffs: RuleVersionDiff[] = [];
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

  getVersionCount(ruleId: string): number {
    return this.getRuleVersions(ruleId).length;
  }

  private getVersionKey(id: string): string {
    return `${STORAGE_KEY_PREFIX}${id}`;
  }

  private getSingleVersion(id: string): PersonalizationRuleVersion | null {
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

export const ruleVersionStorage = new RuleVersionStorage();
