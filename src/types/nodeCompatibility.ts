export type VersionStatus = 'pass' | 'warning' | 'fail';

export interface NodeVersionRequirement {
  minVersion: string;
  maxVersion?: string;
  requiredVersion?: string;
}

export interface NodeVersionCheckResult {
  status: VersionStatus;
  currentVersion: string;
  required: NodeVersionRequirement;
  message: string;
  remediation?: string;
}

export interface DependencyVersionRequirement {
  name: string;
  version: string;
  nodeVersionRequirement?: string;
  compatible: boolean;
}

export interface VersionManagerConfig {
  type: 'nvm' | 'volta' | 'fnm';
  configPath: string;
  content: string;
}

export interface CompatibilityReport {
  nodeCheck: NodeVersionCheckResult;
  dependencies: DependencyVersionRequirement[];
  versionManagers: VersionManagerConfig[];
  scanDate: string;
}

export interface RemediationAction {
  action: string;
  command: string;
  description: string;
}
