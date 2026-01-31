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

export interface ICollaborationClient {
  join(): Promise<boolean>
  leave(): Promise<boolean>
  sendCursorUpdate(
    cursorPosition: CursorPosition,
    selection?: { start: CursorPosition; end: CursorPosition }
  ): Promise<boolean>
  sendEdit(editOperation: {
    type: 'insert' | 'delete' | 'replace'
    position: CursorPosition
    content?: string
    length?: number
    version: number
  }): Promise<boolean>
  sendComment(comment: {
    content: string
    position: CursorPosition
  }): Promise<boolean>
  getConnectionStatus(): boolean
  getSessionId(): string
  getCircuitBreakerState(): unknown
  resetCircuitBreaker(): void
}

export type PresenceStatus = 'online' | 'idle' | 'offline';

export type UserPresence = {
  userId: string;
  userName: string;
  userAvatar?: string;
  status: PresenceStatus;
  cursorPosition?: CursorPosition;
  selection?: SelectionRange;
  lastSeen: number;
  isTyping: boolean;
};

export type CollaborationRoom = {
  roomId: string;
  contentId: number;
  contentType: 'blog-post' | 'page' | 'draft';
  participants: UserPresence[];
  createdAt: number;
  isActive: boolean;
};

export type DocumentOperation = {
  type: 'insert' | 'delete' | 'retain' | 'format';
  position: CursorPosition;
  content?: string;
  length?: number;
  attributes?: Record<string, unknown>;
  userId: string;
  timestamp: number;
  version: number;
};

export type DocumentState = {
  content: DraftContent;
  version: number;
  operations: DocumentOperation[];
  lastModified: number;
  modifiedBy: string;
};

export type OfflineOperation = {
  operation: DocumentOperation;
  roomId: string;
  queuedAt: number;
  synced: boolean;
  retryCount: number;
};

export type CollaborationEvent =
  | { type: 'user-joined'; payload: UserPresence }
  | { type: 'user-left'; payload: { userId: string } }
  | { type: 'cursor-moved'; payload: UserPresence }
  | { type: 'text-changed'; payload: DocumentOperation }
  | { type: 'presence-updated'; payload: UserPresence }
  | { type: 'room-updated'; payload: CollaborationRoom };

export type CollaborationConfig = {
  syncInterval: number;
  presenceTimeout: number;
  cursorBroadcastInterval: number;
  maxOfflineOperations: number;
  autoRetry: boolean;
  retryDelay: number;
};

export type CollaborationMetrics = {
  totalRooms: number;
  activeParticipants: number;
  totalOperations: number;
  operationsPerMinute: number;
  conflictRate: number;
  averageSessionDuration: number;
  offlineOperations: number;
  syncErrors: number;
};

export interface IDocumentEngine {
  applyOperation(state: DocumentState, operation: DocumentOperation): DocumentState;
  transformOperation(operation1: DocumentOperation, operation2: DocumentOperation): DocumentOperation;
  mergeStates(state1: DocumentState, state2: DocumentState): DocumentState;
  createDocument(content: DraftContent): DocumentState;
  compressOperations(operations: DocumentOperation[]): DocumentOperation[];
  calculateChecksum(state: DocumentState): string;
}

export interface IPresenceManager {
  updatePresence(userId: string, presence: Partial<UserPresence>): void;
  getPresence(userId: string): UserPresence | undefined;
  getAllPresences(roomId: string): UserPresence[];
  removePresence(userId: string): void;
  setTypingStatus(userId: string, isTyping: boolean): void;
  updateCursorPosition(userId: string, position: CursorPosition): void;
  broadcastPresence(roomId: string): Promise<void>;
  cleanupInactivePresences(): void;
}

export interface IOfflineSync {
  queueOperation(operation: OfflineOperation): void;
  processQueue(): Promise<void>;
  getQueueSize(): number;
  clearQueue(): void;
  retryFailedOperations(): Promise<void>;
  isOnline(): boolean;
  setOnlineStatus(isOnline: boolean): void;
}

export interface ICollaborationAnalytics {
  trackOperation(operation: DocumentOperation): void;
  trackSession(roomId: string, userId: string, duration: number): void;
  trackConflict(conflict: DocumentOperation[]): void;
  getMetrics(): CollaborationMetrics;
  getMetricsByRoom(roomId: string): CollaborationMetrics;
  getMetricsByUser(userId: string): CollaborationMetrics;
  resetMetrics(): void;
}
