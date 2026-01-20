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

export interface CollaborativeEvent {
  type: 'user_joined' | 'user_left' | 'cursor_moved' | 'edit_applied' | 'comment_added' | 'comment_resolved'
  sessionId: string
  postId: number
  userId: number
  timestamp: number
  data?: unknown
}

export type CollaborationEventType = CollaborativeEvent['type']
