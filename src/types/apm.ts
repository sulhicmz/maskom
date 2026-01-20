export type APMProviderType = 'console' | 'sentry' | 'none';

export interface APMConfig {
  provider: APMProviderType;
  enabled?: boolean;
  environment?: string;
  dsn?: string;
  release?: string;
  sampleRate?: number;
  [key: string]: unknown;
}

export interface APMUIConfig extends APMConfig {
  sampleRate?: number;
  sentry?: {
    dsn: string;
    tracesSampleRate?: number;
  };
}

export interface APMValidationResult {
  valid: boolean;
  errors: string[];
}

export const APM_STORAGE_KEY = 'apm_config';

export const DEFAULT_APM_CONFIG: APMUIConfig = {
  provider: 'console',
  enabled: true,
  environment: 'development',
  sampleRate: 1.0,
  sentry: {
    dsn: '',
    tracesSampleRate: 0.1
  }
};

export function validateAPMConfig(config: APMUIConfig): APMValidationResult {
  const errors: string[] = [];

  if (config.provider !== 'console' && config.provider !== 'sentry' && config.provider !== 'none') {
    errors.push('Provider must be one of: console, sentry, none');
  }

  if (typeof config.sampleRate !== 'number' || config.sampleRate < 0 || config.sampleRate > 1) {
    errors.push('Sample rate must be a number between 0.0 and 1.0');
  }

  if (!['development', 'staging', 'production'].includes(config.environment || '')) {
    errors.push('Environment must be one of: development, staging, production');
  }

  if (config.provider === 'sentry') {
    if (!config.sentry?.dsn) {
      errors.push('Sentry DSN is required when using Sentry provider');
    } else if (!isValidSentryDSN(config.sentry.dsn)) {
      errors.push('Invalid Sentry DSN format. Expected format: https://[key]@[host]/[project]');
    }

    if (config.sentry?.tracesSampleRate !== undefined) {
      if (typeof config.sentry.tracesSampleRate !== 'number' ||
          config.sentry.tracesSampleRate < 0 ||
          config.sentry.tracesSampleRate > 1) {
        errors.push('Traces sample rate must be a number between 0.0 and 1.0');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function isValidSentryDSN(dsn: string): boolean {
  const dsnPattern = /^https:\/\/[a-f0-9]{32}@[a-z0-9.-]+\/[0-9]+$/;
  return dsnPattern.test(dsn);
}

export function resetAPMConfig(): APMUIConfig {
  return { ...DEFAULT_APM_CONFIG };
}

export type { APMConfig, APMProviderType };
