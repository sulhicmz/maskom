import {
  NodeVersionCheckResult,
  NodeVersionRequirement,
  DependencyVersionRequirement,
  VersionManagerConfig,
  RemediationAction,
} from '@/types/nodeCompatibility';

export function parseSemver(version: string): { major: number; minor: number; patch: number } {
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) throw new Error(`Invalid semver version: ${version}`);
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

export function compareVersions(a: string, b: string): number {
  const vA = parseSemver(a);
  const vB = parseSemver(b);
  if (vA.major !== vB.major) return vA.major - vB.major;
  if (vA.minor !== vB.minor) return vA.minor - vB.minor;
  return vA.patch - vB.patch;
}

export function parseEnginesField(enginesField: string): NodeVersionRequirement {
  const minMatch = enginesField.match(/>=?(\d+\.\d+\.\d+)/);
  const exactMatch = enginesField.match(/^(\d+\.\d+\.\d+)$/);
  const maxMatch = enginesField.match(/<=?(\d+\.\d+\.\d+)/);

  if (exactMatch) {
    return { requiredVersion: exactMatch[1] };
  }

  return {
    minVersion: minMatch ? minMatch[1] : '0.0.0',
    maxVersion: maxMatch ? maxMatch[1] : undefined,
  };
}

export function checkNodeVersion(currentVersion: string, requirement: NodeVersionRequirement): NodeVersionCheckResult {
  const current = currentVersion.startsWith('v') ? currentVersion : `v${currentVersion}`;

  if (requirement.requiredVersion) {
    const comparison = compareVersions(current, requirement.requiredVersion);
    if (comparison !== 0) {
      return {
        status: 'fail',
        currentVersion: current,
        required: requirement,
        message: `Node.js version ${current} does not match required version ${requirement.requiredVersion}`,
        remediation: `Install Node.js ${requirement.requiredVersion}`,
      };
    }
    return {
      status: 'pass',
      currentVersion: current,
      required: requirement,
      message: `Node.js version ${current} matches required version ${requirement.requiredVersion}`,
    };
  }

  if (requirement.minVersion) {
    const min = requirement.minVersion.startsWith('v') ? requirement.minVersion : `v${requirement.minVersion}`;
    if (compareVersions(current, min) < 0) {
      return {
        status: 'fail',
        currentVersion: current,
        required: requirement,
        message: `Node.js version ${current} is below minimum required version ${min}`,
        remediation: `Upgrade to Node.js ${min} or higher`,
      };
    }
  }

  if (requirement.maxVersion) {
    const max = requirement.maxVersion.startsWith('v') ? requirement.maxVersion : `v${requirement.maxVersion}`;
    if (compareVersions(current, max) > 0) {
      return {
        status: 'warning',
        currentVersion: current,
        required: requirement,
        message: `Node.js version ${current} is above maximum supported version ${max}`,
        remediation: `Downgrade to Node.js ${max} or lower`,
      };
    }
  }

  return {
    status: 'pass',
    currentVersion: current,
    required: requirement,
    message: `Node.js version ${current} meets all version requirements`,
  };
}

export async function scanDependencyVersions(): Promise<DependencyVersionRequirement[]> {
  const dependencies: DependencyVersionRequirement[] = [];

  try {
    const pkg = await import('../../../package.json');
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    for (const [name, version] of Object.entries(allDeps)) {
      const nodeVersionRequirement = extractNodeRequirement(version as string);
      dependencies.push({
        name,
        version: version as string,
        nodeVersionRequirement,
        compatible: !nodeVersionRequirement || checkDependencyCompatibility(nodeVersionRequirement),
      });
    }
  } catch (error) {
    console.error('Error scanning dependencies:', error);
  }

  return dependencies;
}

function extractNodeRequirement(version: string): string | undefined {
  const match = version.match(/node\s*(>=?|<=?|=)\s*(\d+\.\d+\.\d+)/i);
  return match ? `${match[1]}${match[2]}` : undefined;
}

function checkDependencyCompatibility(requirement: string): boolean {
  try {
    const parsed = parseEnginesField(requirement);
    const currentVersion = process.version;
    const check = checkNodeVersion(currentVersion, parsed);
    return check.status === 'pass';
  } catch {
    return true;
  }
}

export function generateVersionManagerConfigs(
  requiredVersion: string
): VersionManagerConfig[] {
  const configs: VersionManagerConfig[] = [];

  configs.push({
    type: 'nvm',
    configPath: '.nvmrc',
    content: requiredVersion,
  });

  configs.push({
    type: 'volta',
    configPath: 'package.json',
    content: JSON.stringify({ volta: { node: requiredVersion } }, null, 2),
  });

  configs.push({
    type: 'fnm',
    configPath: '.node-version',
    content: requiredVersion,
  });

  return configs;
}

export function generateRemediationActions(
  checkResult: NodeVersionCheckResult
): RemediationAction[] {
  const actions: RemediationAction[] = [];
  const targetVersion = checkResult.required.requiredVersion || checkResult.required.minVersion || '22.0.0';

  actions.push({
    action: 'nvm (Node Version Manager)',
    command: `nvm install ${targetVersion} && nvm use ${targetVersion}`,
    description: 'Install and switch to required Node.js version using nvm',
  });

  actions.push({
    action: 'volta',
    command: `volta install node@${targetVersion}`,
    description: 'Pin Node.js version using volta',
  });

  actions.push({
    action: 'fnm (Fast Node Manager)',
    command: `fnm install ${targetVersion} && fnm use ${targetVersion}`,
    description: 'Install and switch to required Node.js version using fnm',
  });

  actions.push({
    action: 'Direct download',
    command: `Visit https://nodejs.org/ and download Node.js ${targetVersion}`,
    description: 'Download and install Node.js manually from official website',
  });

  return actions;
}

export function getCurrentNodeVersion(): string {
  return process.version;
}
