import { APMUIConfig, APMValidationResult, APM_STORAGE_KEY, DEFAULT_APM_CONFIG, validateAPMConfig, resetAPMConfig } from '@/types/apm';
import apmManager from '@/utils/apm';

export function loadAPMConfig(): APMUIConfig {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_APM_CONFIG };
  }

  try {
    const stored = localStorage.getItem(APM_STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored) as APMUIConfig;
      return { ...DEFAULT_APM_CONFIG, ...config };
    }
  } catch (error) {
    console.error('[APM Config] Failed to load config:', error);
  }

  return { ...DEFAULT_APM_CONFIG };
}

export function saveAPMConfig(config: APMUIConfig): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(APM_STORAGE_KEY, JSON.stringify(config));
    
    apmManager.configure({
      provider: config.provider,
      enabled: config.enabled,
      environment: config.environment,
      dsn: config.sentry?.dsn,
      sampleRate: config.sampleRate
    });
  } catch (error) {
    console.error('[APM Config] Failed to save config:', error);
    throw error;
  }
}

export async function testAPMConnection(config: APMUIConfig): Promise<{ success: boolean; message: string; error?: string }> {
  const validation = validateAPMConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      message: 'Configuration validation failed',
      error: validation.errors.join(', ')
    };
  }

  try {
    const testProvider = config.provider === 'sentry' ? 'sentry' : 'console';
    
    apmManager.captureError({
      message: 'APM Configuration Test Error',
      level: 'info',
      tags: {
        test: 'apm_connection',
        provider: testProvider
      }
    });

    if (config.provider === 'sentry' && config.sentry?.dsn) {
      await apmManager.flush();
    }

    return {
      success: true,
      message: `Successfully connected to ${config.provider.toUpperCase()} provider`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to connect to APM provider',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function validateAPMConfigUI(config: APMUIConfig): APMValidationResult {
  return validateAPMConfig(config);
}

export { resetAPMConfig };
