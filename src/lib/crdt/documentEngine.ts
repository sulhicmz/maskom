import {
  IDocumentEngine,
  DocumentState,
  DocumentOperation,
  DraftContent,
  CursorPosition,
} from '@/types/collaboration';

class DocumentEngine implements IDocumentEngine {
  applyOperation(state: DocumentState, operation: DocumentOperation): DocumentState {
    const newContent = { ...state.content };
    const newOperations = [...state.operations, operation];

    switch (operation.type) {
      case 'insert':
        this.applyInsert(newContent, operation);
        break;
      case 'delete':
        this.applyDelete(newContent, operation);
        break;
      case 'replace':
        this.applyReplace(newContent, operation);
        break;
      case 'format':
        this.applyFormat(newContent, operation);
        break;
    }

    return {
      ...state,
      content: newContent,
      version: state.version + 1,
      operations: newOperations,
      lastModified: operation.timestamp,
      modifiedBy: operation.userId,
    };
  }

  private applyInsert(content: DraftContent, operation: DocumentOperation): void {
    const { position, content } = operation;
    if (!content) return;

    if (position.column === 0 && position.line === 1) {
      content.content = content + content.content;
    } else if (position.line === 1) {
      content.content =
        content.content.slice(0, position.column) +
        content +
        content.content.slice(position.column);
    }
  }

  private applyDelete(content: DraftContent, operation: DocumentOperation): void {
    const { position, length } = operation;
    if (!length || length <= 0) return;

    if (position.line === 1) {
      content.content =
        content.content.slice(0, position.column) +
        content.content.slice(position.column + length);
    }
  }

  private applyReplace(content: DraftContent, operation: DocumentOperation): void {
    const { position, content, length } = operation;
    if (!content) return;

    const deleteLength = length || 0;
    if (position.line === 1) {
      content.content =
        content.content.slice(0, position.column) +
        content +
        content.content.slice(position.column + deleteLength);
    }
  }

  private applyFormat(content: DraftContent, operation: DocumentOperation): void {
    const { attributes } = operation;
    if (attributes) {
      Object.assign(content, attributes);
    }
  }

  transformOperation(
    operation1: DocumentOperation,
    operation2: DocumentOperation
  ): DocumentOperation {
    if (operation1.userId === operation2.userId) {
      return operation1;
    }

    if (
      operation1.type === 'insert' &&
      operation2.type === 'insert' &&
      operation1.position.line === operation2.position.line
    ) {
      if (operation1.position.column <= operation2.position.column) {
        return {
          ...operation1,
          position: {
            ...operation1.position,
            column: operation1.position.column,
          },
        };
      } else {
        const shift = operation2.content ? operation2.content.length : 0;
        return {
          ...operation1,
          position: {
            ...operation1.position,
            column: operation1.position.column + shift,
          },
        };
      }
    }

    if (
      operation1.type === 'delete' &&
      operation2.type === 'insert' &&
      operation1.position.line === operation2.position.line
    ) {
      if (operation1.position.column <= operation2.position.column) {
        return operation1;
      } else {
        const shift = operation2.content ? operation2.content.length : 0;
        const length = operation1.length || 0;
        return {
          ...operation1,
          position: {
            ...operation1.position,
            column: operation1.position.column + shift,
          },
          length: length - shift,
        };
      }
    }

    if (
      operation1.type === 'insert' &&
      operation2.type === 'delete' &&
      operation1.position.line === operation2.position.line
    ) {
      if (operation1.position.column < operation2.position.column) {
        return operation1;
      } else if (operation1.position.column >= operation2.position.column + (operation2.length || 0)) {
        const shift = operation2.length || 0;
        return {
          ...operation1,
          position: {
            ...operation1.position,
            column: operation1.position.column - shift,
          },
        };
      } else {
        return operation1;
      }
    }

    return operation1;
  }

  mergeStates(state1: DocumentState, state2: DocumentState): DocumentState {
    if (state1.version === state2.version) {
      return state1;
    }

    const mergedOperations: DocumentOperation[] = [];
    const ops1 = [...state1.operations];
    const ops2 = [...state2.operations];

    let mergedState = state1.version > state2.version ? state1 : state2;
    let otherState = state1.version > state2.version ? state2 : state1;

    for (const op2 of otherState.operations) {
      const op1 = ops1.find(
        (o) => o.userId === op2.userId && o.timestamp === op2.timestamp
      );

      if (!op1) {
        const transformed = this.transformOperation(op2, mergedState.operations[mergedState.operations.length - 1]);
        mergedState = this.applyOperation(mergedState, transformed);
        mergedOperations.push(transformed);
      }
    }

    return {
      ...mergedState,
      operations: [...mergedState.operations, ...mergedOperations],
    };
  }

  createDocument(content: DraftContent): DocumentState {
    return {
      content: { ...content },
      version: 0,
      operations: [],
      lastModified: Date.now(),
      modifiedBy: '',
    };
  }

  compressOperations(operations: DocumentOperation[]): DocumentOperation[] {
    if (operations.length <= 1) return operations;

    const compressed: DocumentOperation[] = [];
    const ops = [...operations];

    while (ops.length > 0) {
      const current = ops.shift()!;
      
      if (compressed.length > 0) {
        const last = compressed[compressed.length - 1];
        
        if (
          last.type === current.type &&
          last.userId === current.userId &&
          last.position.line === current.position.line
        ) {
          const combined = { ...last };
          
          if (last.type === 'insert' && current.type === 'insert') {
            combined.content = last.content + current.content;
            compressed[compressed.length - 1] = combined;
            continue;
          }
          
          if (last.type === 'delete' && current.type === 'delete') {
            combined.length = (last.length || 0) + (current.length || 0);
            compressed[compressed.length - 1] = combined;
            continue;
          }
        }
      }

      compressed.push(current);
    }

    return compressed;
  }

  calculateChecksum(state: DocumentState): string {
    const content = JSON.stringify(state.content);
    let hash = 0;
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  }
}

export const documentEngine = new DocumentEngine();
export default DocumentEngine;
