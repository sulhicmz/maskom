import { EditOperation, CursorPosition, DraftContent } from '@/types/collaboration'

export interface OTTransformResult {
  transformedOperation: EditOperation
  conflictDetected: boolean
}

export interface OTClientState {
  revision: number
  pendingOperations: EditOperation[]
}

export class OperationalTransformation {
  static transform(op1: EditOperation, op2: EditOperation): OTTransformResult {
    const conflictDetected = this.detectConflict(op1, op2)

    if (conflictDetected) {
      return {
        transformedOperation: this.resolveConflict(op1, op2),
        conflictDetected: true
      }
    }

    return {
      transformedOperation: op1,
      conflictDetected: false
    }
  }

  static transformOpAgainstOps(
    clientOp: EditOperation,
    serverOps: EditOperation[]
  ): OTTransformResult {
    let transformedOp = { ...clientOp }
    let conflictDetected = false

    for (const serverOp of serverOps) {
      const result = this.transform(transformedOp, serverOp)
      transformedOp = result.transformedOperation
      if (result.conflictDetected) {
        conflictDetected = true
      }
    }

    return {
      transformedOperation: transformedOp,
      conflictDetected
    }
  }

  static applyOperation(content: DraftContent, operation: EditOperation): DraftContent {
    const result = { ...content }

    switch (operation.type) {
      case 'insert':
        return this.applyInsert(result, operation)
      case 'delete':
        return this.applyDelete(result, operation)
      case 'replace':
        return this.applyReplace(result, operation)
      default:
        return result
    }
  }

  private static detectConflict(op1: EditOperation, op2: EditOperation): boolean {
    const samePosition =
      op1.position.line === op2.position.line &&
      op1.position.column === op2.position.column

    if (!samePosition) {
      return false
    }

    const differentAuthors = op1.authorId !== op2.authorId
    return differentAuthors
  }

  private static resolveConflict(op1: EditOperation, op2: EditOperation): EditOperation {
    const earlierTimestamp = Math.min(op1.timestamp, op2.timestamp)

    if (earlierTimestamp === op1.timestamp) {
      return op1
    } else {
      return op2
    }
  }

  private static applyInsert(content: DraftContent, operation: EditOperation): DraftContent {
    if (operation.type !== 'insert' || !operation.content) {
      return content
    }

    const contentArray = this.contentToArray(content)
    const insertIndex = this.positionToIndex(contentArray, operation.position)

    contentArray.splice(insertIndex, 0, ...operation.content.split(''))

    return this.arrayToContent(contentArray)
  }

  private static applyDelete(content: DraftContent, operation: EditOperation): DraftContent {
    if (operation.type !== 'delete' || operation.length === undefined) {
      return content
    }

    const contentArray = this.contentToArray(content)
    const startIndex = this.positionToIndex(contentArray, operation.position)

    contentArray.splice(startIndex, operation.length)

    return this.arrayToContent(contentArray)
  }

  private static applyReplace(content: DraftContent, operation: EditOperation): DraftContent {
    if (operation.type !== 'replace' || !operation.content || operation.length === undefined) {
      return content
    }

    const contentArray = this.contentToArray(content)
    const startIndex = this.positionToIndex(contentArray, operation.position)

    contentArray.splice(startIndex, operation.length, ...operation.content.split(''))

    return this.arrayToContent(contentArray)
  }

  private static contentToArray(content: DraftContent): string[] {
    return content.content.split('')
  }

  private static arrayToContent(array: string[]): DraftContent {
    return {
      title: '',
      description: '',
      content: array.join(''),
      tags: [],
      categoryId: undefined,
      imageUrl: undefined
    }
  }

  private static positionToIndex(array: string[], position: CursorPosition): number {
    const lines = array.join('').split('\n')
    let index = 0

    for (let i = 0; i < position.line; i++) {
      index += (lines[i]?.length || 0) + 1
    }

    return index + position.column
  }
}

export function createClientState(initialRevision: number = 0): OTClientState {
  return {
    revision: initialRevision,
    pendingOperations: []
  }
}

export function addPendingOperation(
  state: OTClientState,
  operation: EditOperation
): OTClientState {
  return {
    ...state,
    pendingOperations: [...state.pendingOperations, operation]
  }
}

export function clearPendingOperations(state: OTClientState): OTClientState {
  return {
    ...state,
    pendingOperations: []
  }
}

export function incrementRevision(state: OTClientState): OTClientState {
  return {
    ...state,
    revision: state.revision + 1
  }
}
