import { CollaborativeEvent, ActiveEditor, CursorPosition, ICollaborationClient } from '@/types/collaboration'
import { withTimeout, CircuitBreaker } from '@/utils/resilience'
import { withRetry } from '@/utils/resilience/retry'
import { TIMEOUTS, SERVICE_RETRY_CONFIG } from '@/constants/timeouts'
import { CIRCUIT_BREAKER_CONFIG } from '@/constants/circuitBreaker'

interface CollaborationClientConfig {
  sessionId: string
  userId: number
  username: string
  pollInterval?: number
  onEvent: (event: CollaborativeEvent) => void
  onJoin: (editors: ActiveEditor[]) => void
  onLeave: (editors: ActiveEditor[]) => void
  onDisconnect: () => void
  onError: (error: Error) => void
}

interface PollResponse {
  success: boolean
  events: CollaborativeEvent[]
  sessionActive: boolean
  error?: string
}

export class CollaborationClient implements ICollaborationClient {
  private config: CollaborationClientConfig
  private pollTimer: NodeJS.Timeout | null = null
  private lastEventId: string | undefined = undefined
  private isConnected = false
  private circuitBreaker: CircuitBreaker

  constructor(config: CollaborationClientConfig) {
    this.config = {
      pollInterval: 1000,
      ...config
    }
    this.circuitBreaker = new CircuitBreaker(CIRCUIT_BREAKER_CONFIG.COLLABORATION_API)
  }

  async join(): Promise<boolean> {
    try {
      const retryResult = await withRetry(
        () => this.circuitBreaker.execute(async () => {
          return await withTimeout(
            fetch('/api/collaborate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'join',
                postId: this.extractPostId(this.config.sessionId),
                userId: this.config.userId,
                username: this.config.username
              })
            }),
            { timeoutMs: TIMEOUTS.COLLABORATION_API, timeoutError: 'Collaboration API join request timed out' }
          )
        }),
        {
          maxAttempts: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxAttempts,
          baseDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.baseDelayMs,
          maxDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxDelayMs,
          backoffMultiplier: SERVICE_RETRY_CONFIG.COLLABORATION_API.backoffMultiplier,
          retryableErrors: [...SERVICE_RETRY_CONFIG.COLLABORATION_API.retryableErrors]
        }
      )

      if (!retryResult.success) {
        throw retryResult.error
      }

      const response = retryResult.data!
      const result = await response.json()

      if (result.success) {
        this.isConnected = true
        this.startPolling()
        return true
      }

      this.config.onError(new Error(result.error || 'Failed to join session'))
      return false
    } catch (error) {
      this.config.onError(error as Error)
      return false
    }
  }

  async leave(): Promise<boolean> {
    this.stopPolling()
    this.isConnected = false

    try {
      const retryResult = await withRetry(
        () => this.circuitBreaker.execute(async () => {
          return await withTimeout(
            fetch('/api/collaborate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'leave',
                sessionId: this.config.sessionId,
                userId: this.config.userId
              })
            }),
            { timeoutMs: TIMEOUTS.COLLABORATION_API, timeoutError: 'Collaboration API leave request timed out' }
          )
        }),
        {
          maxAttempts: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxAttempts,
          baseDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.baseDelayMs,
          maxDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxDelayMs,
          backoffMultiplier: SERVICE_RETRY_CONFIG.COLLABORATION_API.backoffMultiplier,
          retryableErrors: [...SERVICE_RETRY_CONFIG.COLLABORATION_API.retryableErrors]
        }
      )

      if (!retryResult.success) {
        throw retryResult.error
      }

      const response = retryResult.data!
      const result = await response.json()
      return result.success
    } catch (error) {
      this.config.onError(error as Error)
      return false
    }
  }

  async sendCursorUpdate(
    cursorPosition: CursorPosition,
    selection?: { start: CursorPosition; end: CursorPosition }
  ): Promise<boolean> {
    if (!this.isConnected) {
      return false
    }

    try {
      const retryResult = await withRetry(
        () => this.circuitBreaker.execute(async () => {
          return await withTimeout(
            fetch('/api/collaborate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'cursor_update',
                sessionId: this.config.sessionId,
                userId: this.config.userId,
                cursorPosition,
                selection
              })
            }),
            { timeoutMs: TIMEOUTS.COLLABORATION_API, timeoutError: 'Collaboration API cursor update timed out' }
          )
        }),
        {
          maxAttempts: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxAttempts,
          baseDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.baseDelayMs,
          maxDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxDelayMs,
          backoffMultiplier: SERVICE_RETRY_CONFIG.COLLABORATION_API.backoffMultiplier,
          retryableErrors: [...SERVICE_RETRY_CONFIG.COLLABORATION_API.retryableErrors]
        }
      )

      if (!retryResult.success) {
        throw retryResult.error
      }

      const response = retryResult.data!
      const result = await response.json()
      return result.success
    } catch (error) {
      this.config.onError(error as Error)
      return false
    }
  }

  async sendEdit(editOperation: {
    type: 'insert' | 'delete' | 'replace'
    position: CursorPosition
    content?: string
    length?: number
    version: number
  }): Promise<boolean> {
    if (!this.isConnected) {
      return false
    }

    try {
      const retryResult = await withRetry(
        () => this.circuitBreaker.execute(async () => {
          return await withTimeout(
            fetch('/api/collaborate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'edit',
                sessionId: this.config.sessionId,
                userId: this.config.userId,
                editOperation
              })
            }),
            { timeoutMs: TIMEOUTS.COLLABORATION_API, timeoutError: 'Collaboration API edit timed out' }
          )
        }),
        {
          maxAttempts: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxAttempts,
          baseDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.baseDelayMs,
          maxDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxDelayMs,
          backoffMultiplier: SERVICE_RETRY_CONFIG.COLLABORATION_API.backoffMultiplier,
          retryableErrors: [...SERVICE_RETRY_CONFIG.COLLABORATION_API.retryableErrors]
        }
      )

      if (!retryResult.success) {
        throw retryResult.error
      }

      const response = retryResult.data!
      const result = await response.json()
      return result.success
    } catch (error) {
      this.config.onError(error as Error)
      return false
    }
  }

  async sendComment(comment: {
    content: string
    position: CursorPosition
  }): Promise<boolean> {
    if (!this.isConnected) {
      return false
    }

    try {
      const retryResult = await withRetry(
        () => this.circuitBreaker.execute(async () => {
          return await withTimeout(
            fetch('/api/collaborate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'comment',
                sessionId: this.config.sessionId,
                userId: this.config.userId,
                username: this.config.username,
                comment
              })
            }),
            { timeoutMs: TIMEOUTS.COLLABORATION_API, timeoutError: 'Collaboration API comment timed out' }
          )
        }),
        {
          maxAttempts: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxAttempts,
          baseDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.baseDelayMs,
          maxDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxDelayMs,
          backoffMultiplier: SERVICE_RETRY_CONFIG.COLLABORATION_API.backoffMultiplier,
          retryableErrors: [...SERVICE_RETRY_CONFIG.COLLABORATION_API.retryableErrors]
        }
      )

      if (!retryResult.success) {
        throw retryResult.error
      }

      const response = retryResult.data!
      const result = await response.json()
      return result.success
    } catch (error) {
      this.config.onError(error as Error)
      return false
    }
  }

  private startPolling(): void {
    const scheduleNextPoll = () => {
      if (!this.isConnected) return
      this.pollTimer = setTimeout(() => {
        this.poll().then(() => {
          if (this.isConnected) {
            scheduleNextPoll()
          }
        })
      }, this.config.pollInterval!)
    }
    scheduleNextPoll()
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer)
      this.pollTimer = null
    }
  }

  private async poll(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    try {
      const params = new URLSearchParams({
        sessionId: this.config.sessionId,
        userId: this.config.userId.toString(),
        username: this.config.username
      })

      if (this.lastEventId) {
        params.append('lastEventId', this.lastEventId)
      }

      const retryResult = await withRetry(
        () => this.circuitBreaker.execute(async () => {
          return await withTimeout(
            fetch(`/api/collaborate?${params.toString()}`),
            { timeoutMs: TIMEOUTS.COLLABORATION_API, timeoutError: 'Collaboration API poll timed out' }
          )
        }),
        {
          maxAttempts: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxAttempts,
          baseDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.baseDelayMs,
          maxDelayMs: SERVICE_RETRY_CONFIG.COLLABORATION_API.maxDelayMs,
          backoffMultiplier: SERVICE_RETRY_CONFIG.COLLABORATION_API.backoffMultiplier,
          retryableErrors: [...SERVICE_RETRY_CONFIG.COLLABORATION_API.retryableErrors]
        }
      )

      if (!retryResult.success) {
        throw retryResult.error
      }

      const response = retryResult.data!
      const result = await response.json() as PollResponse

      if (!result.sessionActive) {
        this.onSessionInactive()
        return
      }

      if (result.success && result.events.length > 0) {
        for (const event of result.events) {
          this.lastEventId = event.data?.eventId as string
          this.handleEvent(event)
        }
      }
    } catch (error) {
      this.config.onError(error as Error)
    }
  }

  private handleEvent(event: CollaborativeEvent): void {
    this.config.onEvent(event)
  }

  private onSessionInactive(): void {
    this.isConnected = false
    this.stopPolling()
    this.config.onDisconnect()
  }

  private extractPostId(sessionId: string): number {
    const match = sessionId.match(/session_(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  getSessionId(): string {
    return this.config.sessionId
  }

  getCircuitBreakerState() {
    return this.circuitBreaker.getState()
  }

  resetCircuitBreaker() {
    this.circuitBreaker.reset()
  }
}

export function createCollaborationClient(config: CollaborationClientConfig): CollaborationClient {
  return new CollaborationClient(config)
}
