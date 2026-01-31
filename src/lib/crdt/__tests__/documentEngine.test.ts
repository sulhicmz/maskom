import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import DocumentEngine, { documentEngine } from '../documentEngine';
import { DocumentState, DocumentOperation, CursorPosition, DraftContent } from '@/types/collaboration';

describe('DocumentEngine', () => {
  let engine: DocumentEngine;

  beforeEach(() => {
    engine = new DocumentEngine();
  });

  afterEach(() => {
  });

  describe('createDocument', () => {
    it('should create a new document state', () => {
      const content: DraftContent = {
        title: 'Test Title',
        description: 'Test Description',
        content: 'Test Content',
        tags: [],
      };

      const state = engine.createDocument(content);

      expect(state.content).toEqual(content);
      expect(state.version).toBe(0);
      expect(state.operations).toEqual([]);
      expect(state.lastModified).toBeGreaterThan(0);
      expect(state.modifiedBy).toBe('');
    });

    it('should create document with empty content', () => {
      const content: DraftContent = {
        title: '',
        description: '',
        content: '',
        tags: [],
      };

      const state = engine.createDocument(content);

      expect(state.content).toEqual(content);
      expect(state.version).toBe(0);
    });
  });

  describe('applyOperation', () => {
    it('should apply insert operation', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test',
        content: 'Hello',
        tags: [],
      };
      const state = engine.createDocument(content);

      const operation: DocumentOperation = {
        type: 'insert',
        position: { line: 1, column: 5 },
        content: ' World',
        userId: 'user1',
        timestamp: Date.now(),
        version: 0,
      };

      const newState = engine.applyOperation(state, operation);

      expect(newState.content.content).toBe('Hello World');
      expect(newState.version).toBe(1);
      expect(newState.operations).toHaveLength(1);
    });

    it('should apply delete operation', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test',
        content: 'Hello World',
        tags: [],
      };
      const state = engine.createDocument(content);

      const operation: DocumentOperation = {
        type: 'delete',
        position: { line: 1, column: 5 },
        length: 6,
        userId: 'user1',
        timestamp: Date.now(),
        version: 0,
      };

      const newState = engine.applyOperation(state, operation);

      expect(newState.content.content).toBe('Hello');
      expect(newState.version).toBe(1);
    });

    it('should apply replace operation', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test',
        content: 'Hello World',
        tags: [],
      };
      const state = engine.createDocument(content);

      const operation: DocumentOperation = {
        type: 'replace',
        position: { line: 1, column: 6 },
        content: 'There',
        length: 5,
        userId: 'user1',
        timestamp: Date.now(),
        version: 0,
      };

      const newState = engine.applyOperation(state, operation);

      expect(newState.content.content).toBe('Hello There');
      expect(newState.version).toBe(1);
    });

    it('should apply format operation', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test',
        content: 'Hello',
        tags: [],
      };
      const state = engine.createDocument(content);

      const operation: DocumentOperation = {
        type: 'format',
        position: { line: 1, column: 0 },
        attributes: { bold: true },
        userId: 'user1',
        timestamp: Date.now(),
        version: 0,
      };

      const newState = engine.applyOperation(state, operation);

      expect(newState.content).toEqual({
        ...content,
        bold: true,
      });
      expect(newState.version).toBe(1);
    });
  });

  describe('transformOperation', () => {
    it('should transform concurrent insert operations', () => {
      const op1: DocumentOperation = {
        type: 'insert',
        position: { line: 1, column: 5 },
        content: 'A',
        userId: 'user1',
        timestamp: Date.now(),
        version: 0,
      };

      const op2: DocumentOperation = {
        type: 'insert',
        position: { line: 1, column: 7 },
        content: 'B',
        userId: 'user2',
        timestamp: Date.now(),
        version: 0,
      };

      const transformed = engine.transformOperation(op2, op1);

      expect(transformed.position.column).toBe(8); // Shifted by op1
    });

    it('should not transform operations from same user', () => {
      const op1: DocumentOperation = {
        type: 'insert',
        position: { line: 1, column: 5 },
        content: 'A',
        userId: 'user1',
        timestamp: Date.now(),
        version: 0,
      };

      const op2: DocumentOperation = {
        type: 'insert',
        position: { line: 1, column: 7 },
        content: 'B',
        userId: 'user1',
        timestamp: Date.now(),
        version: 0,
      };

      const transformed = engine.transformOperation(op2, op1);

      expect(transformed.position.column).toBe(7); // No shift
    });

    it('should transform delete after insert', () => {
      const insertOp: DocumentOperation = {
        type: 'insert',
        position: { line: 1, column: 5 },
        content: 'World',
        userId: 'user1',
        timestamp: Date.now(),
        version: 0,
      };

      const deleteOp: DocumentOperation = {
        type: 'delete',
        position: { line: 1, column: 10 },
        length: 5,
        userId: 'user2',
        timestamp: Date.now(),
        version: 0,
      };

      const transformed = engine.transformOperation(deleteOp, insertOp);

      expect(transformed.position.column).toBe(15); // Shifted by insert length
      expect(transformed.length).toBe(5);
    });

    it('should transform insert after delete', () => {
      const deleteOp: DocumentOperation = {
        type: 'delete',
        position: { line: 1, column: 5 },
        length: 5,
        userId: 'user1',
        timestamp: Date.now(),
        version: 0,
      };

      const insertOp: DocumentOperation = {
        type: 'insert',
        position: { line: 1, column: 10 },
        content: 'A',
        userId: 'user2',
        timestamp: Date.now(),
        version: 0,
      };

      const transformed = engine.transformOperation(insertOp, deleteOp);

      expect(transformed.position.column).toBe(5); // Shifted back by delete length
    });
  });

  describe('mergeStates', () => {
    it('should return state1 if versions are equal', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test',
        content: 'Hello',
        tags: [],
      };
      const state1 = engine.createDocument(content);
      const state2 = engine.createDocument(content);

      const merged = engine.mergeStates(state1, state2);

      expect(merged).toBe(state1);
    });

    it('should merge operations from different versions', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test',
        content: 'Hello',
        tags: [],
      };
      const state1 = engine.createDocument(content);
      const state2 = engine.createDocument(content);

      const op1: DocumentOperation = {
        type: 'insert',
        position: { line: 1, column: 5 },
        content: 'A',
        userId: 'user1',
        timestamp: Date.now(),
        version: 0,
      };

      state1 = engine.applyOperation(state1, op1);

      const merged = engine.mergeStates(state2, state1);

      expect(merged.version).toBeGreaterThan(state2.version);
      expect(merged.operations.length).toBeGreaterThan(0);
    });
  });

  describe('compressOperations', () => {
    it('should combine consecutive insert operations from same user', () => {
      const operations: DocumentOperation[] = [
        {
          type: 'insert',
          position: { line: 1, column: 5 },
          content: 'A',
          userId: 'user1',
          timestamp: Date.now(),
          version: 0,
        },
        {
          type: 'insert',
          position: { line: 1, column: 6 },
          content: 'B',
          userId: 'user1',
          timestamp: Date.now(),
          version: 0,
        },
        {
          type: 'insert',
          position: { line: 1, column: 7 },
          content: 'C',
          userId: 'user1',
          timestamp: Date.now(),
          version: 0,
        },
      ];

      const compressed = engine.compressOperations(operations);

      expect(compressed.length).toBeLessThan(operations.length);
    });

    it('should not compress operations from different users', () => {
      const operations: DocumentOperation[] = [
        {
          type: 'insert',
          position: { line: 1, column: 5 },
          content: 'A',
          userId: 'user1',
          timestamp: Date.now(),
          version: 0,
        },
        {
          type: 'insert',
          position: { line: 1, column: 6 },
          content: 'B',
          userId: 'user2',
          timestamp: Date.now(),
          version: 0,
        },
      ];

      const compressed = engine.compressOperations(operations);

      expect(compressed.length).toBe(operations.length); // No compression
    });

    it('should return empty array for empty operations', () => {
      const compressed = engine.compressOperations([]);
      expect(compressed).toEqual([]);
    });
  });

  describe('calculateChecksum', () => {
    it('should generate consistent checksum for same content', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test',
        content: 'Hello World',
        tags: [],
      };
      const state = engine.createDocument(content);

      const checksum1 = engine.calculateChecksum(state);
      const checksum2 = engine.calculateChecksum(state);

      expect(checksum1).toBe(checksum2);
    });

    it('should generate different checksums for different content', () => {
      const content1: DraftContent = {
        title: 'Test1',
        description: 'Test1',
        content: 'Hello',
        tags: [],
      };
      const content2: DraftContent = {
        title: 'Test2',
        description: 'Test2',
        content: 'World',
        tags: [],
      };

      const state1 = engine.createDocument(content1);
      const state2 = engine.createDocument(content2);

      const checksum1 = engine.calculateChecksum(state1);
      const checksum2 = engine.calculateChecksum(state2);

      expect(checksum1).not.toBe(checksum2);
    });

    it('should generate hex string checksum', () => {
      const content: DraftContent = {
        title: 'Test',
        description: 'Test',
        content: 'Hello',
        tags: [],
      };
      const state = engine.createDocument(content);

      const checksum = engine.calculateChecksum(state);

      expect(checksum).toMatch(/^[a-f0-9]+$/);
    });
  });
});
