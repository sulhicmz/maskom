/**
 * Collaboration configuration constants
 * Centralized timeout and threshold values for collaboration features
 */

export const COLLABORATION_CONFIG = {
  // Presence timeouts (in milliseconds)
  presence: {
    timeout: 30000,           // 30 seconds - time before marking user as idle
    cleanupInterval: 60000,   // 60 seconds - interval for cleaning up inactive presences
  },
  
  // Typing indicators
  typing: {
    resetDelay: 3000,         // 3 seconds - time before resetting typing status
  },
  
  // Analytics retention
  analytics: {
    operationRetention: 3600000,  // 1 hour - how long to keep operation history
    activeSessionThreshold: 300000, // 5 minutes - threshold for considering a session active
    metricsAggregationInterval: 60000, // 1 minute - interval for aggregating metrics
  },
  
  // Offline sync
  sync: {
    retryDelay: 5000,         // 5 seconds - delay between sync retries
    maxRetries: 3,            // Maximum number of retry attempts
  },
  
  // Rate limiting
  rateLimit: {
    baseDelayMs: 1000,        // 1 second - base delay for rate limiting
    maxDelayMs: 5000,         // 5 seconds - maximum delay for rate limiting
  },
} as const;

// Type for the configuration
export type CollaborationConfig = typeof COLLABORATION_CONFIG;
