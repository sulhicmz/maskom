export interface CursorPosition {
  line: number
  column: number
}

export interface SelectionRange {
  start: CursorPosition
  end: CursorPosition
}

export interface ActiveEditor {
  userId: number
  username: string
  cursorPosition: CursorPosition
  selection?: SelectionRange
  lastSeen: number
}

export interface DraftContent {
  title: string
  description: string
  content: string
  tags: number[]
  categoryId?: number
  imageUrl?: string
}

export interface CollaborativeSession {
  postId: number
  sessionId: string
  editors: Map<number, ActiveEditor>
  content: DraftContent
  version: number
  createdAt: number
  lastModified: number
}

export interface EditOperation {
  type: 'insert' | 'delete' | 'replace'
  position: CursorPosition
  content?: string
  length?: number
  authorId: number
  timestamp: number
  version: number
}

export interface EditConflict {
  operation: EditOperation
  conflictingOperations: EditOperation[]
  resolved: boolean
  resolution?: EditOperation
}

export interface RealTimeComment {
  id: string
  postId: number
  authorId: number
  authorName: string
  content: string
  position: CursorPosition
  createdAt: number
  resolved: boolean
}

export interface EventDataBase {
  eventId?: string
}

export interface CollaborativeEvent {
  type: 'user_joined' | 'user_left' | 'cursor_moved' | 'edit_applied' | 'comment_added' | 'comment_resolved'
  sessionId: string
  postId: number
  userId: number
  timestamp: number
  data?: EventDataBase & Record<string, unknown>
}

export type CollaborationEventType = CollaborativeEvent['type']

export interface ISessionManager {
  createSession(postId: number, initialContent: DraftContent, creatorId: number, creatorName: string): string
  getSession(sessionId: string): CollaborativeSession | undefined
  getSessionByPostId(postId: number): CollaborativeSession | undefined
  updateSessionContent(sessionId: string, content: DraftContent): boolean
  addEditor(sessionId: string, userId: number, username: string): boolean
  removeEditor(sessionId: string, userId: number): boolean
  updateEditorCursor(
    sessionId: string,
    userId: number,
    cursorPosition: CursorPosition,
    selection?: { start: CursorPosition; end: CursorPosition }
  ): boolean
  getActiveEditors(sessionId: string): ActiveEditor[]
  getEditor(sessionId: string, userId: number): ActiveEditor | undefined
  closeSession(sessionId: string): boolean
  getActiveSessions(): CollaborativeSession[]
  getSessionCount(): number
  getTotalEditorCount(): number
}
