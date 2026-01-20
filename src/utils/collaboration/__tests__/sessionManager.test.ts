import { SessionManager } from '../sessionManager'
import { DraftContent } from '@/types/collaboration'

describe('SessionManager', () => {
  let manager: SessionManager

  beforeEach(() => {
    manager = new SessionManager()
  })

  describe('createSession', () => {
    it('should create a new session and return session ID', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')

      expect(sessionId).toBeDefined()
      expect(typeof sessionId).toBe('string')
      expect(sessionId).toMatch(/^session_/)
    })

    it('should add creator as first editor', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const session = manager.getSession(sessionId)

      expect(session).toBeDefined()
      expect(session?.editors.size).toBe(1)
      expect(session?.editors.has(101)).toBe(true)
    })

    it('should initialize session with version 1', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const session = manager.getSession(sessionId)

      expect(session?.version).toBe(1)
    })
  })

  describe('getSession', () => {
    it('should retrieve existing session by ID', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const session = manager.getSession(sessionId)

      expect(session).toBeDefined()
      expect(session?.postId).toBe(1)
      expect(session?.sessionId).toBe(sessionId)
    })

    it('should return undefined for non-existent session', () => {
      const session = manager.getSession('non_existent_session')

      expect(session).toBeUndefined()
    })
  })

  describe('getSessionByPostId', () => {
    it('should retrieve session by post ID', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      manager.createSession(5, initialContent, 101, 'User1')
      const session = manager.getSessionByPostId(5)

      expect(session).toBeDefined()
      expect(session?.postId).toBe(5)
    })

    it('should return undefined for post without session', () => {
      const session = manager.getSessionByPostId(999)

      expect(session).toBeUndefined()
    })
  })

  describe('updateSessionContent', () => {
    it('should update session content and increment version', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const updatedContent: DraftContent = {
        ...initialContent,
        content: 'Updated content'
      }

      const success = manager.updateSessionContent(sessionId, updatedContent)
      const session = manager.getSession(sessionId)

      expect(success).toBe(true)
      expect(session?.content).toEqual(updatedContent)
      expect(session?.version).toBe(2)
    })

    it('should return false for non-existent session', () => {
      const updatedContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Updated content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const success = manager.updateSessionContent('non_existent', updatedContent)

      expect(success).toBe(false)
    })
  })

  describe('addEditor', () => {
    it('should add editor to existing session', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const success = manager.addEditor(sessionId, 102, 'User2')
      const session = manager.getSession(sessionId)

      expect(success).toBe(true)
      expect(session?.editors.size).toBe(2)
      expect(session?.editors.has(102)).toBe(true)
    })

    it('should return false for non-existent session', () => {
      const success = manager.addEditor('non_existent', 102, 'User2')

      expect(success).toBe(false)
    })
  })

  describe('removeEditor', () => {
    it('should remove editor from session', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      manager.addEditor(sessionId, 102, 'User2')

      const success = manager.removeEditor(sessionId, 102)
      const session = manager.getSession(sessionId)

      expect(success).toBe(true)
      expect(session?.editors.size).toBe(1)
      expect(session?.editors.has(102)).toBe(false)
    })

    it('should close session when last editor removed', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const success = manager.removeEditor(sessionId, 101)

      expect(success).toBe(true)
      expect(manager.getSession(sessionId)).toBeUndefined()
    })

    it('should return false for non-existent session', () => {
      const success = manager.removeEditor('non_existent', 101)

      expect(success).toBe(false)
    })

    it('should return false for non-existent editor', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const success = manager.removeEditor(sessionId, 999)

      expect(success).toBe(false)
    })
  })

  describe('updateEditorCursor', () => {
    it('should update editor cursor position', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const newPosition = { line: 5, column: 10 }

      const success = manager.updateEditorCursor(sessionId, 101, newPosition)
      const session = manager.getSession(sessionId)
      const editor = session?.editors.get(101)

      expect(success).toBe(true)
      expect(editor?.cursorPosition).toEqual(newPosition)
    })

    it('should update editor selection when provided', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const newPosition = { line: 5, column: 10 }
      const selection = {
        start: { line: 5, column: 5 },
        end: { line: 5, column: 10 }
      }

      const success = manager.updateEditorCursor(sessionId, 101, newPosition, selection)
      const session = manager.getSession(sessionId)
      const editor = session?.editors.get(101)

      expect(success).toBe(true)
      expect(editor?.selection).toEqual(selection)
    })

    it('should return false for non-existent session', () => {
      const newPosition = { line: 5, column: 10 }

      const success = manager.updateEditorCursor('non_existent', 101, newPosition)

      expect(success).toBe(false)
    })

    it('should return false for non-existent editor', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const newPosition = { line: 5, column: 10 }

      const success = manager.updateEditorCursor(sessionId, 999, newPosition)

      expect(success).toBe(false)
    })
  })

  describe('getActiveEditors', () => {
    it('should return all editors in session', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      manager.addEditor(sessionId, 102, 'User2')
      manager.addEditor(sessionId, 103, 'User3')

      const editors = manager.getActiveEditors(sessionId)

      expect(editors).toHaveLength(3)
      expect(editors.map(e => e.userId)).toEqual([101, 102, 103])
    })

    it('should return empty array for non-existent session', () => {
      const editors = manager.getActiveEditors('non_existent')

      expect(editors).toEqual([])
    })
  })

  describe('getEditor', () => {
    it('should return specific editor from session', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      manager.addEditor(sessionId, 102, 'User2')

      const editor = manager.getEditor(sessionId, 102)

      expect(editor).toBeDefined()
      expect(editor?.userId).toBe(102)
      expect(editor?.username).toBe('User2')
    })

    it('should return undefined for non-existent editor', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const editor = manager.getEditor(sessionId, 999)

      expect(editor).toBeUndefined()
    })

    it('should return undefined for non-existent session', () => {
      const editor = manager.getEditor('non_existent', 101)

      expect(editor).toBeUndefined()
    })
  })

  describe('closeSession', () => {
    it('should close existing session', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      const sessionId = manager.createSession(1, initialContent, 101, 'User1')
      const success = manager.closeSession(sessionId)

      expect(success).toBe(true)
      expect(manager.getSession(sessionId)).toBeUndefined()
    })

    it('should return false for non-existent session', () => {
      const success = manager.closeSession('non_existent')

      expect(success).toBe(false)
    })
  })

  describe('getActiveSessions', () => {
    it('should return all active sessions', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      manager.createSession(1, initialContent, 101, 'User1')
      manager.createSession(2, initialContent, 102, 'User2')
      manager.createSession(3, initialContent, 103, 'User3')

      const sessions = manager.getActiveSessions()

      expect(sessions).toHaveLength(3)
      expect(sessions.map(s => s.postId)).toEqual([1, 2, 3])
    })

    it('should return empty array when no sessions exist', () => {
      const sessions = manager.getActiveSessions()

      expect(sessions).toEqual([])
    })
  })

  describe('getSessionCount', () => {
    it('should return correct session count', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      expect(manager.getSessionCount()).toBe(0)

      manager.createSession(1, initialContent, 101, 'User1')
      expect(manager.getSessionCount()).toBe(1)

      manager.createSession(2, initialContent, 102, 'User2')
      expect(manager.getSessionCount()).toBe(2)
    })
  })

  describe('getTotalEditorCount', () => {
    it('should return total editor count across all sessions', () => {
      const initialContent: DraftContent = {
        title: 'Test Post',
        description: 'Test Description',
        content: 'Initial content',
        tags: [],
        categoryId: 1,
        imageUrl: undefined
      }

      expect(manager.getTotalEditorCount()).toBe(0)

      manager.createSession(1, initialContent, 101, 'User1')
      expect(manager.getTotalEditorCount()).toBe(1)

      const sessionId2 = manager.createSession(2, initialContent, 102, 'User2')
      manager.addEditor(sessionId2, 103, 'User3')
      expect(manager.getTotalEditorCount()).toBe(3)
    })
  })
})
