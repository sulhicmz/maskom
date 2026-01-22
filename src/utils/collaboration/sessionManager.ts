import { CollaborativeSession, ActiveEditor, CursorPosition, DraftContent, ISessionManager } from '@/types/collaboration'

interface SessionStorage {
  [sessionId: string]: CollaborativeSession
}

export class SessionManager implements ISessionManager {
  private sessions: SessionStorage = {}
  private heartbeatInterval = 30000 // 30 seconds

  constructor() {
    this.startHeartbeatCheck()
  }

  createSession(postId: number, initialContent: DraftContent, creatorId: number, creatorName: string): string {
    const sessionId = this.generateSessionId()
 
    const editor: ActiveEditor = {
      userId: creatorId,
      username: creatorName,
      cursorPosition: { line: 0, column: 0 },
      lastSeen: Date.now()
    }

    const session: CollaborativeSession = {
      postId,
      sessionId,
      editors: new Map([[creatorId, editor]]),
      content: initialContent,
      version: 1,
      createdAt: Date.now(),
      lastModified: Date.now()
    }
 
    this.sessions[sessionId] = session
 
    return sessionId
  }

  getSession(sessionId: string): CollaborativeSession | undefined {
    return this.sessions[sessionId]
  }

  getSessionByPostId(postId: number): CollaborativeSession | undefined {
    return Object.values(this.sessions).find(session => session.postId === postId)
  }

  updateSessionContent(sessionId: string, content: DraftContent): boolean {
    const session = this.getSession(sessionId)

    if (!session) {
      return false
    }

    session.content = content
    session.version += 1
    session.lastModified = Date.now()

    return true
  }

  addEditor(sessionId: string, userId: number, username: string): boolean {
    const session = this.getSession(sessionId)

    if (!session) {
      return false
    }

    const editor: ActiveEditor = {
      userId,
      username,
      cursorPosition: { line: 0, column: 0 },
      lastSeen: Date.now()
    }

    session.editors.set(userId, editor)
    session.lastModified = Date.now()

    return true
  }

  removeEditor(sessionId: string, userId: number): boolean {
    const session = this.getSession(sessionId)

    if (!session) {
      return false
    }

    const removed = session.editors.delete(userId)
    session.lastModified = Date.now()

    if (removed && session.editors.size === 0) {
      this.closeSession(sessionId)
    }

    return removed
  }

  updateEditorCursor(
    sessionId: string,
    userId: number,
    cursorPosition: CursorPosition,
    selection?: { start: CursorPosition; end: CursorPosition }
  ): boolean {
    const session = this.getSession(sessionId)

    if (!session) {
      return false
    }

    const editor = session.editors.get(userId)

    if (!editor) {
      return false
    }

    editor.cursorPosition = cursorPosition
    editor.lastSeen = Date.now()

    if (selection) {
      editor.selection = selection
    }

    session.lastModified = Date.now()

    return true
  }

  getActiveEditors(sessionId: string): ActiveEditor[] {
    const session = this.getSession(sessionId)

    if (!session) {
      return []
    }

    return Array.from(session.editors.values())
  }

  getEditor(sessionId: string, userId: number): ActiveEditor | undefined {
    const session = this.getSession(sessionId)

    if (!session) {
      return undefined
    }

    return session.editors.get(userId)
  }

  closeSession(sessionId: string): boolean {
    if (!this.sessions[sessionId]) {
      return false
    }

    delete this.sessions[sessionId]
    return true
  }

  getActiveSessions(): CollaborativeSession[] {
    return Object.values(this.sessions)
  }

  getSessionCount(): number {
    return Object.keys(this.sessions).length
  }

  getTotalEditorCount(): number {
    return this.getActiveSessions().reduce(
      (total, session) => total + session.editors.size,
      0
    )
  }

  private startHeartbeatCheck(): void {
    setInterval(() => {
      this.cleanupStaleEditors()
    }, this.heartbeatInterval)
  }

  private cleanupStaleEditors(): void {
    const now = Date.now()
    const staleThreshold = 60000 // 60 seconds

    for (const sessionId in this.sessions) {
      const session = this.sessions[sessionId]
      const staleEditors: number[] = []

      session.editors.forEach((editor, userId) => {
        if (now - editor.lastSeen > staleThreshold) {
          staleEditors.push(userId)
        }
      })

      staleEditors.forEach(userId => {
        this.removeEditor(sessionId, userId)
      })
    }
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 15)
    return `session_${timestamp}_${random}`
  }
}

export const sessionManager = new SessionManager()

export type { ISessionManager } from '@/types/collaboration'
