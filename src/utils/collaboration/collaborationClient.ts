import { CollaborativeEvent, ActiveEditor, CursorPosition } from '@/types/collaboration'

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

export class CollaborationClient {
  private config: CollaborationClientConfig
  private pollTimer: NodeJS.Timeout | null = null
  private lastEventId: string | undefined = undefined
  private isConnected = false

  constructor(config: CollaborationClientConfig) {
    this.config = {
      pollInterval: 1000,
      ...config
    }
  }

  async join(): Promise<boolean> {
    try {
      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          postId: this.extractPostId(this.config.sessionId),
          userId: this.config.userId,
          username: this.config.username
        })
      })

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
      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          sessionId: this.config.sessionId,
          userId: this.config.userId
        })
      })

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
      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cursor_update',
          sessionId: this.config.sessionId,
          userId: this.config.userId,
          cursorPosition,
          selection
        })
      })

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
      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          sessionId: this.config.sessionId,
          userId: this.config.userId,
          editOperation
        })
      })

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
      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          sessionId: this.config.sessionId,
          userId: this.config.userId,
          username: this.config.username,
          comment
        })
      })

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

      const response = await fetch(`/api/collaborate?${params.toString()}`)
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
}

export function createCollaborationClient(config: CollaborationClientConfig): CollaborationClient {
  return new CollaborationClient(config)
}
