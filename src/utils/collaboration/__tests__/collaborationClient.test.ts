import { CollaborationClient, createCollaborationClient } from '../collaboration/collaborationClient'
import { CollaborativeEvent } from '@/types/collaboration'

describe('CollaborationClient', () => {
  let mockFetch: jest.Mock
  let mockConfig: any
  let client: CollaborationClient

  beforeEach(() => {
    mockFetch = jest.fn() as jest.Mock
    global.fetch = mockFetch

    mockConfig = {
      sessionId: 'session_test123',
      userId: 1,
      username: 'testuser',
      pollInterval: 100,
      onEvent: jest.fn(),
      onJoin: jest.fn(),
      onLeave: jest.fn(),
      onDisconnect: jest.fn(),
      onError: jest.fn()
    }

    client = createCollaborationClient(mockConfig)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('join', () => {
    it('should successfully join a session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      const result = await client.join()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          postId: 1,
          userId: 1,
          username: 'testuser'
        })
      })
    })

    it('should handle join failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Session not found' })
      })

      const result = await client.join()

      expect(result).toBe(false)
      expect(mockConfig.onError).toHaveBeenCalledWith(expect.any(Error))
    })

    it('should start polling after successful join', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      jest.advanceTimersByTime(100)
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('leave', () => {
    it('should successfully leave a session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const result = await client.leave()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          sessionId: 'session_test123',
          userId: 1
        })
      })
    })

    it('should stop polling when leaving', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()
      jest.advanceTimersByTime(100)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await client.leave()
      jest.advanceTimersByTime(100)

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle leave failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Failed to leave session' })
      })

      const result = await client.leave()

      expect(result).toBe(false)
    })
  })

  describe('sendCursorUpdate', () => {
    it('should send cursor update to server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const result = await client.sendCursorUpdate({ line: 5, column: 10 })

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cursor_update',
          sessionId: 'session_test123',
          userId: 1,
          cursorPosition: { line: 5, column: 10 }
        })
      })
    })

    it('should send cursor update with selection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const result = await client.sendCursorUpdate(
        { line: 5, column: 10 },
        { start: { line: 5, column: 10 }, end: { line: 5, column: 15 } }
      )

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/collaborate',
        expect.objectContaining({
          body: expect.stringContaining('"selection"')
        })
      )
    })

    it('should return false when not connected', async () => {
      const result = await client.sendCursorUpdate({ line: 5, column: 10 })

      expect(result).toBe(false)
    })

    it('should handle send cursor update failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await client.sendCursorUpdate({ line: 5, column: 10 })

      expect(result).toBe(false)
      expect(mockConfig.onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('sendEdit', () => {
    it('should send edit operation to server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, version: 2 })
      })

      const result = await client.sendEdit({
        type: 'insert',
        position: { line: 5, column: 10 },
        content: 'test',
        version: 1
      })

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          sessionId: 'session_test123',
          userId: 1,
          editOperation: {
            type: 'insert',
            position: { line: 5, column: 10 },
            content: 'test',
            version: 1
          }
        })
      })
    })

    it('should send delete edit operation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, version: 2 })
      })

      const result = await client.sendEdit({
        type: 'delete',
        position: { line: 5, column: 10 },
        length: 5,
        version: 1
      })

      expect(result).toBe(true)
    })

    it('should send replace edit operation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, version: 2 })
      })

      const result = await client.sendEdit({
        type: 'replace',
        position: { line: 5, column: 10 },
        content: 'new text',
        length: 5,
        version: 1
      })

      expect(result).toBe(true)
    })

    it('should return false when not connected', async () => {
      const result = await client.sendEdit({
        type: 'insert',
        position: { line: 5, column: 10 },
        content: 'test',
        version: 1
      })

      expect(result).toBe(false)
    })

    it('should handle send edit failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await client.sendEdit({
        type: 'insert',
        position: { line: 5, column: 10 },
        content: 'test',
        version: 1
      })

      expect(result).toBe(false)
    })
  })

  describe('sendComment', () => {
    it('should send comment to server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      const result = await client.sendComment({
        content: 'This is a comment',
        position: { line: 10, column: 5 }
      })

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          sessionId: 'session_test123',
          userId: 1,
          username: 'testuser',
          comment: {
            content: 'This is a comment',
            position: { line: 10, column: 5 }
          }
        })
      })
    })

    it('should return false when not connected', async () => {
      const result = await client.sendComment({
        content: 'This is a comment',
        position: { line: 10, column: 5 }
      })

      expect(result).toBe(false)
    })

    it('should handle send comment failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await client.sendComment({
        content: 'This is a comment',
        position: { line: 10, column: 5 }
      })

      expect(result).toBe(false)
    })
  })

  describe('polling', () => {
    it('should poll for events after joining', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          events: [
            {
              type: 'cursor_moved',
              sessionId: 'session_test123',
              postId: 1,
              userId: 2,
              timestamp: Date.now(),
              data: {
                eventId: 'session_test123_1',
                cursorPosition: { line: 5, column: 10 }
              }
            }
          ],
          sessionActive: true
        })
      })

      await client.join()
      jest.advanceTimersByTime(100)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/collaborate?'),
        expect.objectContaining({
          method: 'GET'
        })
      )
    })

    it('should call onEvent callback for received events', async () => {
      const mockEvent: CollaborativeEvent = {
        type: 'edit_applied',
        sessionId: 'session_test123',
        postId: 1,
        userId: 2,
        timestamp: Date.now(),
        data: {
          eventId: 'session_test123_1',
          type: 'insert',
          position: { line: 5, column: 10 },
          content: 'test',
          authorId: 2,
          version: 2
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          events: [mockEvent],
          sessionActive: true
        })
      })

      await client.join()
      jest.advanceTimersByTime(100)

      expect(mockConfig.onEvent).toHaveBeenCalledWith(mockEvent)
    })

    it('should handle session inactive', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          events: [],
          sessionActive: false
        })
      })

      await client.join()
      jest.advanceTimersByTime(100)

      expect(mockConfig.onDisconnect).toHaveBeenCalled()
    })

    it('should track lastEventId for incremental polling', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          events: [
            {
              type: 'cursor_moved',
              sessionId: 'session_test123',
              postId: 1,
              userId: 2,
              timestamp: Date.now(),
              data: { eventId: 'session_test123_1' }
            }
          ],
          sessionActive: true
        })
      })

      await client.join()
      jest.advanceTimersByTime(100)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          events: [
            {
              type: 'cursor_moved',
              sessionId: 'session_test123',
              postId: 1,
              userId: 2,
              timestamp: Date.now(),
              data: { eventId: 'session_test123_2' }
            }
          ],
          sessionActive: true
        })
      })

      jest.advanceTimersByTime(100)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('lastEventId=session_test123_1')
      )
    })

    it('should handle polling errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await client.join()
      jest.advanceTimersByTime(100)

      expect(mockConfig.onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('getConnectionStatus', () => {
    it('should return false before joining', () => {
      expect(client.getConnectionStatus()).toBe(false)
    })

    it('should return true after joining', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      expect(client.getConnectionStatus()).toBe(true)
    })

    it('should return false after leaving', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, sessionId: 'session_test123', postId: 1, userId: 1 })
      })

      await client.join()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await client.leave()

      expect(client.getConnectionStatus()).toBe(false)
    })
  })

  describe('getSessionId', () => {
    it('should return session ID', () => {
      expect(client.getSessionId()).toBe('session_test123')
    })
  })
})

describe('createCollaborationClient', () => {
  it('should create a new CollaborationClient instance', () => {
    const config: any = {
      sessionId: 'session_test123',
      userId: 1,
      username: 'testuser',
      pollInterval: 1000,
      onEvent: jest.fn(),
      onJoin: jest.fn(),
      onLeave: jest.fn(),
      onDisconnect: jest.fn(),
      onError: jest.fn()
    }

    const client = createCollaborationClient(config)

    expect(client).toBeInstanceOf(CollaborationClient)
  })

  it('should use default poll interval if not provided', () => {
    const config: any = {
      sessionId: 'session_test123',
      userId: 1,
      username: 'testuser',
      onEvent: jest.fn(),
      onJoin: jest.fn(),
      onLeave: jest.fn(),
      onDisconnect: jest.fn(),
      onError: jest.fn()
    }

    const client = createCollaborationClient(config)

    expect(client).toBeInstanceOf(CollaborationClient)
  })
})
