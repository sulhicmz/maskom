import { NextRequest, NextResponse } from 'next/server'
import { sessionManager } from '@/utils/collaboration/sessionManager'
import { CollaborativeEvent } from '@/types/collaboration'
import { strictRateLimiter, getClientIdentifier } from '@/utils/rateLimit'
import { sanitizeString } from '@/utils/sanitize'
import {
  CollaborationRequestSchema,
  type JoinRequest,
  type LeaveRequest,
  type CursorUpdateRequest,
  type EditRequest,
  type CommentRequest
} from '@/utils/collaboration/validation'
import { z } from 'zod'
import { ERROR_CODES, createApiError, CIRCUIT_BREAKER_CONFIG, TIMEOUTS } from '@/constants'
import { executeApiRoute } from '@/utils/apiRouteHandler'
import { logServiceError } from '@/services/common/logger'

const MAX_EVENTS_PER_POLL = 50

const PollQuerySchema = z.object({
  sessionId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  userId: z.string().transform(val => parseInt(val, 10)).pipe(
    z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
  ),
  username: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  lastEventId: z.string().optional()
})

interface PollResponse {
  success: boolean
  events: CollaborativeEvent[]
  sessionActive: boolean
  error?: string
  errorCode?: string
  details?: unknown
}

const eventBuffer = new Map<string, CollaborativeEvent[]>()
const eventIdCounter = new Map<string, number>()

function getEventId(sessionId: string): string {
  const counter = eventIdCounter.get(sessionId) || 0
  eventIdCounter.set(sessionId, counter + 1)
  return `${sessionId}_${counter}`
}

function bufferEvent(event: CollaborativeEvent): void {
  const events = eventBuffer.get(event.sessionId) || []
  events.push(event)
  
  if (events.length > MAX_EVENTS_PER_POLL) {
    events.shift()
  }
  
  eventBuffer.set(event.sessionId, events)
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return executeApiRoute<PollResponse>({
    operationName: 'Collaboration.POLL',
    circuitBreakerConfig: CIRCUIT_BREAKER_CONFIG.COLLABORATION_API,
    timeoutMs: TIMEOUTS.COLLABORATION_API,
    retryOptions: {
      maxAttempts: 2,
      baseDelayMs: 1000,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
      retryableErrors: [/network/i, /timeout/i, /ECONN/i, /503/i]
    },
    handler: async () => {
      const clientIdentifier = getClientIdentifier(request)
      const rateLimitResult = strictRateLimiter(clientIdentifier)

      if (!rateLimitResult.success) {
        const apiError = createApiError(ERROR_CODES.RATE_LIMIT_EXCEEDED)
        return NextResponse.json<PollResponse>(
          { success: false, events: [], sessionActive: false, error: apiError.message, errorCode: apiError.code },
          { status: 429, headers: {
            'Retry-After': rateLimitResult.resetTime.toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }}
        )
      }

      const searchParams = request.nextUrl.searchParams
      const queryParams = {
        sessionId: searchParams.get('sessionId') || '',
        userId: searchParams.get('userId') || '0',
        username: searchParams.get('username') || '',
        lastEventId: searchParams.get('lastEventId')
      }

      const validationResult = PollQuerySchema.safeParse(queryParams)

      if (!validationResult.success) {
        const apiError = createApiError(ERROR_CODES.INVALID_QUERY_PARAMETERS, validationResult.error.issues)
        return NextResponse.json<PollResponse>(
          { success: false, events: [], sessionActive: false, error: apiError.message, errorCode: apiError.code, details: apiError.details },
          { status: 400 }
        )
      }

      const { sessionId, lastEventId } = validationResult.data

      const session = sessionManager.getSession(sessionId)

      if (!session) {
        const apiError = createApiError(ERROR_CODES.SESSION_NOT_FOUND)
        return NextResponse.json<PollResponse>(
          { success: false, events: [], sessionActive: false, error: apiError.message, errorCode: apiError.code },
          { status: 404 }
        )
      }

      const bufferedEvents = eventBuffer.get(sessionId) || []
      const newEvents = lastEventId
        ? bufferedEvents.filter(event => event.data?.eventId === undefined || event.data?.eventId > lastEventId)
        : bufferedEvents

      return NextResponse.json<PollResponse>({
        success: true,
        events: newEvents,
        sessionActive: true
      })
    }
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return executeApiRoute({
    operationName: 'Collaboration.POST',
    circuitBreakerConfig: CIRCUIT_BREAKER_CONFIG.COLLABORATION_API,
    timeoutMs: TIMEOUTS.COLLABORATION_API,
    retryOptions: {
      maxAttempts: 2,
      baseDelayMs: 1000,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
      retryableErrors: [/network/i, /timeout/i, /ECONN/i, /503/i]
    },
    handler: async () => {
      const clientIdentifier = getClientIdentifier(request)
      const rateLimitResult = strictRateLimiter(clientIdentifier)

      if (!rateLimitResult.success) {
        const apiError = createApiError(ERROR_CODES.RATE_LIMIT_EXCEEDED)
        return NextResponse.json(
          { success: false, error: apiError.message, errorCode: apiError.code },
          { status: 429, headers: {
            'Retry-After': rateLimitResult.resetTime.toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }}
        )
      }

      const body = await request.json()

      const validationResult = CollaborationRequestSchema.safeParse(body)

      if (!validationResult.success) {
        const apiError = createApiError(ERROR_CODES.INVALID_REQUEST_DATA, validationResult.error.issues)
        return NextResponse.json(
          { success: false, error: apiError.message, errorCode: apiError.code, details: apiError.details },
          { status: 400 }
        )
      }

      const validatedRequest = validationResult.data

      switch (validatedRequest.action) {
        case 'join':
          return handleJoin(validatedRequest)
        case 'leave':
          return handleLeave(validatedRequest)
        case 'cursor_update':
          return handleCursorUpdate(validatedRequest)
        case 'edit':
          return handleEdit(validatedRequest)
        case 'comment':
          return handleComment(validatedRequest)
      }
    }
  })
}

async function handleJoin(request: JoinRequest): Promise<NextResponse> {
  const { postId, userId, username } = request

  if (!postId || !userId || !username) {
    const apiError = createApiError(ERROR_CODES.MISSING_REQUIRED_FIELDS)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 400 }
    )
  }

  const session = sessionManager.getSessionByPostId(postId)

  if (!session) {
    logServiceError(new Error('No session exists for this post'), { service: 'Collaboration', operation: 'join' })
    const apiError = createApiError(ERROR_CODES.SESSION_NOT_FOUND, 'No session exists for this post. Start a new collaboration session.')
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code, details: apiError.details },
      { status: 404 }
    )
  }

  const added = sessionManager.addEditor(session.sessionId, userId, username)

  if (!added) {
    logServiceError(new Error('Failed to join session'), { service: 'Collaboration', operation: 'join' })
    const apiError = createApiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to join session')
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 500 }
    )
  }

  const event: CollaborativeEvent = {
    type: 'user_joined',
    sessionId: session.sessionId,
    postId,
    userId,
    timestamp: Date.now(),
    data: {
      eventId: getEventId(session.sessionId),
      username
    }
  }

  bufferEvent(event)

  return NextResponse.json({
    success: true,
    sessionId: session.sessionId,
    postId,
    userId
  })
}

async function handleLeave(request: LeaveRequest): Promise<NextResponse> {
  const { sessionId, userId } = request

  if (!sessionId || !userId) {
    const apiError = createApiError(ERROR_CODES.MISSING_REQUIRED_FIELDS)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    logServiceError(new Error('Session not found'), { service: 'Collaboration', operation: 'leave' })
    const apiError = createApiError(ERROR_CODES.SESSION_NOT_FOUND)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 404 }
    )
  }

  const removed = sessionManager.removeEditor(sessionId, userId)

  if (!removed) {
    logServiceError(new Error('User not found in session'), { service: 'Collaboration', operation: 'leave' })
    const apiError = createApiError(ERROR_CODES.USER_NOT_FOUND_IN_SESSION)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 404 }
    )
  }

  const event: CollaborativeEvent = {
    type: 'user_left',
    sessionId,
    postId: session.postId,
    userId,
    timestamp: Date.now(),
    data: {
      eventId: getEventId(sessionId)
    }
  }

  bufferEvent(event)

  return NextResponse.json({
    success: true
  })
}

async function handleCursorUpdate(request: CursorUpdateRequest): Promise<NextResponse> {
  const { sessionId, userId, cursorPosition, selection } = request

  if (!sessionId || !userId || !cursorPosition) {
    const apiError = createApiError(ERROR_CODES.MISSING_REQUIRED_FIELDS)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    logServiceError(new Error('Session not found'), { service: 'Collaboration', operation: 'cursor_update' })
    const apiError = createApiError(ERROR_CODES.SESSION_NOT_FOUND)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 404 }
    )
  }

  const updated = sessionManager.updateEditorCursor(sessionId, userId, cursorPosition, selection)

  if (!updated) {
    logServiceError(new Error('User not found in session'), { service: 'Collaboration', operation: 'cursor_update' })
    const apiError = createApiError(ERROR_CODES.USER_NOT_FOUND_IN_SESSION)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 404 }
    )
  }

  const event: CollaborativeEvent = {
    type: 'cursor_moved',
    sessionId,
    postId: session.postId,
    userId,
    timestamp: Date.now(),
    data: {
      eventId: getEventId(sessionId),
      cursorPosition,
      selection
    }
  }

  bufferEvent(event)

  return NextResponse.json({
    success: true
  })
}

async function handleEdit(request: EditRequest): Promise<NextResponse> {
  const { sessionId, userId, editOperation } = request

  if (!sessionId || !userId || !editOperation) {
    const apiError = createApiError(ERROR_CODES.MISSING_REQUIRED_FIELDS)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    logServiceError(new Error('Session not found'), { service: 'Collaboration', operation: 'edit' })
    const apiError = createApiError(ERROR_CODES.SESSION_NOT_FOUND)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 404 }
    )
  }

  const event: CollaborativeEvent = {
    type: 'edit_applied',
    sessionId,
    postId: session.postId,
    userId,
    timestamp: Date.now(),
    data: {
      eventId: getEventId(session.sessionId),
      ...editOperation,
      authorId: userId
    }
  }

  bufferEvent(event)

  return NextResponse.json({
    success: true,
    version: session.version
  })
}

async function handleComment(request: CommentRequest): Promise<NextResponse> {
  const { sessionId, userId, username, comment } = request

  if (!sessionId || !userId || !username || !comment) {
    const apiError = createApiError(ERROR_CODES.MISSING_REQUIRED_FIELDS)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    logServiceError(new Error('Session not found'), { service: 'Collaboration', operation: 'comment' })
    const apiError = createApiError(ERROR_CODES.SESSION_NOT_FOUND)
    return NextResponse.json(
      { success: false, error: apiError.message, errorCode: apiError.code },
      { status: 404 }
    )
  }

  const sanitizedContent = sanitizeString(comment.content || '')

  const event: CollaborativeEvent = {
    type: 'comment_added',
    sessionId,
    postId: session.postId,
    userId,
    timestamp: Date.now(),
    data: {
      eventId: getEventId(session.sessionId),
      username,
      content: sanitizedContent,
      position: comment.position,
      resolved: false
    }
  }

  bufferEvent(event)

  return NextResponse.json({
    success: true
  })
}
