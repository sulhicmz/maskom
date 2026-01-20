import { OperationalTransformation, createClientState, addPendingOperation, clearPendingOperations, incrementRevision } from '../operationalTransformation'
import { EditOperation, CursorPosition, DraftContent } from '@/types/collaboration'

describe('OperationalTransformation', () => {
  describe('transform', () => {
    it('should transform operations without conflict when positions differ', () => {
      const op1: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'test',
        authorId: 1,
        timestamp: Date.now(),
        version: 1
      }

      const op2: EditOperation = {
        type: 'insert',
        position: { line: 1, column: 0 },
        content: 'hello',
        authorId: 2,
        timestamp: Date.now(),
        version: 1
      }

      const result = OperationalTransformation.transform(op1, op2)

      expect(result.conflictDetected).toBe(false)
      expect(result.transformedOperation).toEqual(op1)
    })

    it('should detect conflict when operations at same position from different authors', () => {
      const timestamp = Date.now()
      const op1: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'test',
        authorId: 1,
        timestamp,
        version: 1
      }

      const op2: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'hello',
        authorId: 2,
        timestamp,
        version: 1
      }

      const result = OperationalTransformation.transform(op1, op2)

      expect(result.conflictDetected).toBe(true)
      expect(result.transformedOperation).toEqual(op1)
    })

    it('should not detect conflict when operations at same position from same author', () => {
      const timestamp = Date.now()
      const op1: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'test',
        authorId: 1,
        timestamp,
        version: 1
      }

      const op2: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'hello',
        authorId: 1,
        timestamp,
        version: 1
      }

      const result = OperationalTransformation.transform(op1, op2)

      expect(result.conflictDetected).toBe(false)
    })

    it('should resolve conflict using earlier timestamp', () => {
      const earlierTime = 1000
      const laterTime = 2000

      const op1: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'test',
        authorId: 1,
        timestamp: earlierTime,
        version: 1
      }

      const op2: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'hello',
        authorId: 2,
        timestamp: laterTime,
        version: 1
      }

      const result = OperationalTransformation.transform(op2, op1)

      expect(result.conflictDetected).toBe(true)
      expect(result.transformedOperation).toEqual(op1)
    })
  })

  describe('transformOpAgainstOps', () => {
    it('should transform against multiple operations without conflicts', () => {
      const clientOp: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'client',
        authorId: 1,
        timestamp: 3000,
        version: 1
      }

      const serverOps: EditOperation[] = [
        {
          type: 'insert',
          position: { line: 1, column: 0 },
          content: 'server1',
          authorId: 2,
          timestamp: 1000,
          version: 1
        },
        {
          type: 'insert',
          position: { line: 2, column: 0 },
          content: 'server2',
          authorId: 3,
          timestamp: 2000,
          version: 1
        }
      ]

      const result = OperationalTransformation.transformOpAgainstOps(clientOp, serverOps)

      expect(result.conflictDetected).toBe(false)
      expect(result.transformedOperation).toEqual(clientOp)
    })

    it('should detect conflict when any server operation conflicts', () => {
      const clientOp: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'client',
        authorId: 1,
        timestamp: 3000,
        version: 1
      }

      const serverOps: EditOperation[] = [
        {
          type: 'insert',
          position: { line: 1, column: 0 },
          content: 'server1',
          authorId: 2,
          timestamp: 1000,
          version: 1
        },
        {
          type: 'insert',
          position: { line: 0, column: 0 },
          content: 'server2',
          authorId: 3,
          timestamp: 2000,
          version: 1
        }
      ]

      const result = OperationalTransformation.transformOpAgainstOps(clientOp, serverOps)

      expect(result.conflictDetected).toBe(true)
    })
  })

  describe('applyOperation', () => {
    it('should apply insert operation to content', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test description',
        content: 'Hello World',
        tags: [],
        categoryId: undefined,
        imageUrl: undefined
      }

      const operation: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 5 },
        content: ' Beautiful',
        authorId: 1,
        timestamp: Date.now(),
        version: 1
      }

      const result = OperationalTransformation.applyOperation(content, operation)

      expect(result.content).toContain('Beautiful')
    })

    it('should apply delete operation to content', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test description',
        content: 'Hello Beautiful World',
        tags: [],
        categoryId: undefined,
        imageUrl: undefined
      }

      const operation: EditOperation = {
        type: 'delete',
        position: { line: 0, column: 6 },
        length: 10,
        authorId: 1,
        timestamp: Date.now(),
        version: 1
      }

      const result = OperationalTransformation.applyOperation(content, operation)

      expect(result.content).toBe('Hello World')
    })

    it('should apply replace operation to content', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test description',
        content: 'Hello Beautiful World',
        tags: [],
        categoryId: undefined,
        imageUrl: undefined
      }

      const operation: EditOperation = {
        type: 'replace',
        position: { line: 0, column: 6 },
        content: 'Amazing',
        length: 9,
        authorId: 1,
        timestamp: Date.now(),
        version: 1
      }

      const result = OperationalTransformation.applyOperation(content, operation)

      expect(result.content).toBe('Hello Amazing World')
    })

    it('should handle multi-line content correctly', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test description',
        content: 'Line 1\nLine 2\nLine 3',
        tags: [],
        categoryId: undefined,
        imageUrl: undefined
      }

      const operation: EditOperation = {
        type: 'insert',
        position: { line: 1, column: 0 },
        content: 'New ',
        authorId: 1,
        timestamp: Date.now(),
        version: 1
      }

      const result = OperationalTransformation.applyOperation(content, operation)

      expect(result.content).toBe('Line 1\nNew Line 2\nLine 3')
    })
  })
})

describe('Client State Management', () => {
  describe('createClientState', () => {
    it('should create client state with initial revision', () => {
      const state = createClientState()

      expect(state.revision).toBe(0)
      expect(state.pendingOperations).toEqual([])
    })

    it('should create client state with custom initial revision', () => {
      const state = createClientState(5)

      expect(state.revision).toBe(5)
      expect(state.pendingOperations).toEqual([])
    })
  })

  describe('addPendingOperation', () => {
    it('should add operation to pending operations', () => {
      const state = createClientState()
      const operation: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'test',
        authorId: 1,
        timestamp: Date.now(),
        version: 1
      }

      const result = addPendingOperation(state, operation)

      expect(result.pendingOperations).toHaveLength(1)
      expect(result.pendingOperations[0]).toEqual(operation)
      expect(result.revision).toBe(state.revision)
    })

    it('should append operations in order', () => {
      const state = createClientState()
      const op1: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'test1',
        authorId: 1,
        timestamp: 1000,
        version: 1
      }
      const op2: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'test2',
        authorId: 1,
        timestamp: 2000,
        version: 1
      }

      let result = addPendingOperation(state, op1)
      result = addPendingOperation(result, op2)

      expect(result.pendingOperations).toHaveLength(2)
      expect(result.pendingOperations[0]).toEqual(op1)
      expect(result.pendingOperations[1]).toEqual(op2)
    })
  })

  describe('clearPendingOperations', () => {
    it('should clear all pending operations', () => {
      const state = createClientState()
      const operation: EditOperation = {
        type: 'insert',
        position: { line: 0, column: 0 },
        content: 'test',
        authorId: 1,
        timestamp: Date.now(),
        version: 1
      }

      const stateWithOp = addPendingOperation(state, operation)
      const result = clearPendingOperations(stateWithOp)

      expect(result.pendingOperations).toEqual([])
      expect(result.revision).toBe(stateWithOp.revision)
    })
  })

  describe('incrementRevision', () => {
    it('should increment revision by 1', () => {
      const state = createClientState()

      const result = incrementRevision(state)

      expect(result.revision).toBe(1)
      expect(result.pendingOperations).toEqual([])
    })

    it('should increment revision multiple times', () => {
      const state = createClientState(5)

      let result = incrementRevision(state)
      result = incrementRevision(result)
      result = incrementRevision(result)

      expect(result.revision).toBe(8)
    })
  })
})
