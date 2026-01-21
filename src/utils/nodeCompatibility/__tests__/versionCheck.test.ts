import { describe, it, expect } from '@jest/globals';
import {
  parseSemver,
  compareVersions,
  parseEnginesField,
  checkNodeVersion,
  scanDependencyVersions,
  generateVersionManagerConfigs,
  generateRemediationActions,
  getCurrentNodeVersion,
} from '../versionCheck';
import type { NodeVersionRequirement, VersionStatus } from '@/types/nodeCompatibility';

describe('parseSemver', () => {
  it('should parse valid semver version with v prefix', () => {
    const result = parseSemver('v20.19.6');
    expect(result).toEqual({ major: 20, minor: 19, patch: 6 });
  });

  it('should parse valid semver version without v prefix', () => {
    const result = parseSemver('22.0.0');
    expect(result).toEqual({ major: 22, minor: 0, patch: 0 });
  });

  it('should throw error for invalid version format', () => {
    expect(() => parseSemver('invalid')).toThrow('Invalid semver version: invalid');
  });

  it('should throw error for version with only two parts', () => {
    expect(() => parseSemver('20.19')).toThrow('Invalid semver version');
  });
});

describe('compareVersions', () => {
  it('should return negative when first version is lower', () => {
    expect(compareVersions('20.19.6', '22.0.0')).toBeLessThan(0);
  });

  it('should return positive when first version is higher', () => {
    expect(compareVersions('22.0.0', '20.19.6')).toBeGreaterThan(0);
  });

  it('should return zero when versions are equal', () => {
    expect(compareVersions('20.19.6', '20.19.6')).toBe(0);
  });

  it('should handle v prefix correctly', () => {
    expect(compareVersions('v20.19.6', '20.19.6')).toBe(0);
    expect(compareVersions('20.19.6', 'v22.0.0')).toBeLessThan(0);
  });

  it('should compare major versions correctly', () => {
    expect(compareVersions('21.0.0', '22.0.0')).toBeLessThan(0);
    expect(compareVersions('22.0.0', '21.0.0')).toBeGreaterThan(0);
  });

  it('should compare minor versions correctly when major versions are same', () => {
    expect(compareVersions('22.0.0', '22.1.0')).toBeLessThan(0);
    expect(compareVersions('22.1.0', '22.0.0')).toBeGreaterThan(0);
  });

  it('should compare patch versions correctly when major and minor versions are same', () => {
    expect(compareVersions('22.0.0', '22.0.1')).toBeLessThan(0);
    expect(compareVersions('22.0.1', '22.0.0')).toBeGreaterThan(0);
  });
});

describe('parseEnginesField', () => {
  it('should parse minimum version with >= operator', () => {
    const result = parseEnginesField('>=22.0.0');
    expect(result.minVersion).toBe('22.0.0');
    expect(result.maxVersion).toBeUndefined();
    expect(result.requiredVersion).toBeUndefined();
  });

  it('should parse minimum version with > operator', () => {
    const result = parseEnginesField('>20.19.6');
    expect(result.minVersion).toBe('20.19.6');
    expect(result.maxVersion).toBeUndefined();
    expect(result.requiredVersion).toBeUndefined();
  });

  it('should parse exact version without operator', () => {
    const result = parseEnginesField('22.0.0');
    expect(result.requiredVersion).toBe('22.0.0');
    expect(result.minVersion).toBeUndefined();
    expect(result.maxVersion).toBeUndefined();
  });

  it('should parse minimum and maximum version', () => {
    const result = parseEnginesField('>=20.0.0 <=22.0.0');
    expect(result.minVersion).toBe('20.0.0');
    expect(result.maxVersion).toBe('22.0.0');
  });

  it('should handle default minimum when no version specified', () => {
    const result = parseEnginesField('');
    expect(result.minVersion).toBe('0.0.0');
  });
});

describe('checkNodeVersion', () => {
  it('should return pass when current version meets minimum requirement', () => {
    const requirement: NodeVersionRequirement = { minVersion: '22.0.0' };
    const result = checkNodeVersion('v22.1.0', requirement);
    expect(result.status).toBe('pass');
    expect(result.message).toContain('meets all version requirements');
  });

  it('should return fail when current version is below minimum', () => {
    const requirement: NodeVersionRequirement = { minVersion: '22.0.0' };
    const result = checkNodeVersion('v20.19.6', requirement);
    expect(result.status).toBe('fail');
    expect(result.message).toContain('below minimum required version');
    expect(result.remediation).toBeDefined();
  });

  it('should return pass when version exactly matches required version', () => {
    const requirement: NodeVersionRequirement = { requiredVersion: '22.0.0' };
    const result = checkNodeVersion('v22.0.0', requirement);
    expect(result.status).toBe('pass');
  });

  it('should return fail when version does not match required version', () => {
    const requirement: NodeVersionRequirement = { requiredVersion: '22.0.0' };
    const result = checkNodeVersion('v22.1.0', requirement);
    expect(result.status).toBe('fail');
    expect(result.message).toContain('does not match required version');
  });

  it('should return warning when current version exceeds maximum', () => {
    const requirement: NodeVersionRequirement = { minVersion: '20.0.0', maxVersion: '22.0.0' };
    const result = checkNodeVersion('v23.0.0', requirement);
    expect(result.status).toBe('warning');
    expect(result.message).toContain('above maximum supported version');
  });

  it('should handle version without v prefix', () => {
    const requirement: NodeVersionRequirement = { minVersion: '22.0.0' };
    const result = checkNodeVersion('22.1.0', requirement);
    expect(result.status).toBe('pass');
  });

  it('should include remediation for fail status', () => {
    const requirement: NodeVersionRequirement = { minVersion: '22.0.0' };
    const result = checkNodeVersion('v20.19.6', requirement);
    if (result.status === 'fail') {
      expect(result.remediation).toContain('Upgrade to Node.js');
    }
  });
});

describe('getCurrentNodeVersion', () => {
  it('should return current Node.js version', () => {
    const version = getCurrentNodeVersion();
    expect(version).toMatch(/^v\d+\.\d+\.\d+$/);
  });
});

describe('generateVersionManagerConfigs', () => {
  it('should generate nvm config', () => {
    const configs = generateVersionManagerConfigs('22.0.0');
    const nvmConfig = configs.find((c) => c.type === 'nvm');
    expect(nvmConfig).toBeDefined();
    expect(nvmConfig?.configPath).toBe('.nvmrc');
    expect(nvmConfig?.content).toBe('22.0.0');
  });

  it('should generate volta config', () => {
    const configs = generateVersionManagerConfigs('22.0.0');
    const voltaConfig = configs.find((c) => c.type === 'volta');
    expect(voltaConfig).toBeDefined();
    expect(voltaConfig?.configPath).toBe('package.json');
    expect(voltaConfig?.content).toContain('"volta"');
    expect(voltaConfig?.content).toContain('"node": "22.0.0"');
  });

  it('should generate fnm config', () => {
    const configs = generateVersionManagerConfigs('22.0.0');
    const fnmConfig = configs.find((c) => c.type === 'fnm');
    expect(fnmConfig).toBeDefined();
    expect(fnmConfig?.configPath).toBe('.node-version');
    expect(fnmConfig?.content).toBe('22.0.0');
  });

  it('should generate all three version manager configs', () => {
    const configs = generateVersionManagerConfigs('22.0.0');
    expect(configs).toHaveLength(3);
  });
});

describe('generateRemediationActions', () => {
  it('should generate nvm action', () => {
    const checkResult = {
      status: 'fail' as VersionStatus,
      currentVersion: 'v20.19.6',
      required: { minVersion: '22.0.0' },
      message: 'Below minimum',
    };
    const actions = generateRemediationActions(checkResult);
    const nvmAction = actions.find((a) => a.action === 'nvm (Node Version Manager)');
    expect(nvmAction).toBeDefined();
    expect(nvmAction?.command).toContain('nvm install');
  });

  it('should generate volta action', () => {
    const checkResult = {
      status: 'fail' as VersionStatus,
      currentVersion: 'v20.19.6',
      required: { minVersion: '22.0.0' },
      message: 'Below minimum',
    };
    const actions = generateRemediationActions(checkResult);
    const voltaAction = actions.find((a) => a.action === 'volta');
    expect(voltaAction).toBeDefined();
    expect(voltaAction?.command).toContain('volta install');
  });

  it('should generate fnm action', () => {
    const checkResult = {
      status: 'fail' as VersionStatus,
      currentVersion: 'v20.19.6',
      required: { minVersion: '22.0.0' },
      message: 'Below minimum',
    };
    const actions = generateRemediationActions(checkResult);
    const fnmAction = actions.find((a) => a.action === 'fnm (Fast Node Manager)');
    expect(fnmAction).toBeDefined();
    expect(fnmAction?.command).toContain('fnm install');
  });

  it('should generate direct download action', () => {
    const checkResult = {
      status: 'fail' as VersionStatus,
      currentVersion: 'v20.19.6',
      required: { minVersion: '22.0.0' },
      message: 'Below minimum',
    };
    const actions = generateRemediationActions(checkResult);
    const downloadAction = actions.find((a) => a.action === 'Direct download');
    expect(downloadAction).toBeDefined();
    expect(downloadAction?.description).toContain('Download and install');
  });

  it('should use requiredVersion if available', () => {
    const checkResult = {
      status: 'fail' as VersionStatus,
      currentVersion: 'v20.19.6',
      required: { requiredVersion: '22.1.0' },
      message: 'Version mismatch',
    };
    const actions = generateRemediationActions(checkResult);
    actions.forEach((action) => {
      expect(action.command).toContain('22.1.0');
    });
  });
});

describe('scanDependencyVersions', () => {
  it('should return array of dependencies', async () => {
    const deps = await scanDependencyVersions();
    expect(Array.isArray(deps)).toBe(true);
  });

  it('should include common dependencies', async () => {
    const deps = await scanDependencyVersions();
    const nextDep = deps.find((d) => d.name === 'next');
    expect(nextDep).toBeDefined();
  });

  it('should handle package.json read errors gracefully', async () => {
    jest.mock('fs', () => ({
      readFileSync: jest.fn(() => {
        throw new Error('Mock error');
      }),
    }));

    const deps = await scanDependencyVersions();
    expect(Array.isArray(deps)).toBe(true);
  });
});
