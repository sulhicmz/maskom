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
import { CIRCUIT_BREAKER_CONFIG, TIMEOUTS } from '@/constants'
import { executeApiRoute } from '@/utils/apiRouteHandler'
import { logServiceError, ServiceErrorCode, type ServiceResult } from '@/services/common'

const MAX_EVENTS_PER_POLL = 50

const PollQuerySchema = z.object({
  sessionId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  userId: z.string().transform(val => parseInt(val, 10)).pipe(
    z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
  ),
  username: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  lastEventId: z.string().optional()
})

interface PollData {
  events: CollaborativeEvent[]
  sessionActive: boolean
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
  return executeApiRoute<PollData>({
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
        return NextResponse.json<ServiceResult<PollData>>(
          { success: false, error: 'Rate limit exceeded', errorCode: ServiceErrorCode.RATE_LIMIT },
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
        lastEventId: searchParams.get('lastEventId') || undefined
      }

      const validationResult = PollQuerySchema.safeParse(queryParams)

      if (!validationResult.success) {
        return NextResponse.json<ServiceResult<PollData>>(
          { success: false, error: 'Invalid query parameters', errorCode: ServiceErrorCode.INVALID_QUERY_PARAMETERS, metadata: { details: validationResult.error.issues } },
          { status: 400 }
        )
      }

      const { sessionId, lastEventId } = validationResult.data

      const session = sessionManager.getSession(sessionId)

      if (!session) {
        return NextResponse.json<ServiceResult<PollData>>(
          { success: false, error: 'Session not found', errorCode: ServiceErrorCode.SESSION_NOT_FOUND },
          { status: 404 }
        )
      }

      const bufferedEvents = eventBuffer.get(sessionId) || []
      const newEvents = lastEventId
        ? bufferedEvents.filter(event => event.data?.eventId === undefined || event.data?.eventId > lastEventId)
        : bufferedEvents

      return NextResponse.json<ServiceResult<PollData>>({
        success: true,
        data: {
          events: newEvents,
          sessionActive: true
        }
      })
    }
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return executeApiRoute<unknown>({
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
        return NextResponse.json<ServiceResult<unknown>>(
          { success: false, error: 'Rate limit exceeded', errorCode: ServiceErrorCode.RATE_LIMIT },
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
        return NextResponse.json<ServiceResult<unknown>>(
          { success: false, error: 'Invalid request data', errorCode: ServiceErrorCode.INVALID_REQUEST_DATA, metadata: { details: validationResult.error.issues } },
          { status: 400 }
        )
      }

      const validatedRequest = validationResult.data

      switch (validatedRequest.action) {
        case 'join':
          return await handleJoin(validatedRequest)
        case 'leave':
          return await handleLeave(validatedRequest)
        case 'cursor_update':
          return await handleCursorUpdate(validatedRequest)
        case 'edit':
          return await handleEdit(validatedRequest)
        case 'comment':
          return await handleComment(validatedRequest)
      }

      return NextResponse.json<ServiceResult<unknown>>(
        { success: false, error: 'Unknown action', errorCode: ServiceErrorCode.INVALID_REQUEST_DATA },
        { status: 400 }
      )
    }
  })
}

async function handleJoin(request: JoinRequest): Promise<NextResponse<ServiceResult<unknown>>> {
  const { postId, userId, username } = request

      if (!postId || !userId || !username) {
        return NextResponse.json<ServiceResult<unknown>>(
          { success: false, error: 'Missing required fields', errorCode: ServiceErrorCode.MISSING_REQUIRED_FIELDS },
          { status: 400 }
        )
      }

  const session = sessionManager.getSessionByPostId(postId)

  if (!session) {
    logServiceError(new Error('No session exists for this post'), { service: 'Collaboration', operation: 'join' })
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'No session exists for this post. Start a new collaboration session.', errorCode: ServiceErrorCode.SESSION_NOT_FOUND },
      { status: 404 }
    )
  }

  const added = sessionManager.addEditor(session.sessionId, userId, username)

  if (!added) {
    logServiceError(new Error('Failed to join session'), { service: 'Collaboration', operation: 'join' })
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'Failed to join session', errorCode: ServiceErrorCode.UNKNOWN },
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

  return NextResponse.json<ServiceResult<unknown>>({
    success: true,
    data: {
      sessionId: session.sessionId,
      postId,
      userId
    }
  })
}

async function handleLeave(request: LeaveRequest): Promise<NextResponse<ServiceResult<unknown>>> {
  const { sessionId, userId } = request

  if (!sessionId || !userId) {
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'Missing required fields', errorCode: ServiceErrorCode.MISSING_REQUIRED_FIELDS },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    logServiceError(new Error('Session not found'), { service: 'Collaboration', operation: 'leave' })
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'Session not found', errorCode: ServiceErrorCode.SESSION_NOT_FOUND },
      { status: 404 }
    )
  }

  const removed = sessionManager.removeEditor(sessionId, userId)

  if (!removed) {
    logServiceError(new Error('User not found in session'), { service: 'Collaboration', operation: 'leave' })
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'User not found in session', errorCode: ServiceErrorCode.USER_NOT_FOUND_IN_SESSION },
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

  return NextResponse.json<ServiceResult<unknown>>({
    success: true
  })
}

async function handleCursorUpdate(request: CursorUpdateRequest): Promise<NextResponse<ServiceResult<unknown>>> {
  const { sessionId, userId, cursorPosition, selection } = request

  if (!sessionId || !userId || !cursorPosition) {
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'Missing required fields', errorCode: ServiceErrorCode.MISSING_REQUIRED_FIELDS },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    logServiceError(new Error('Session not found'), { service: 'Collaboration', operation: 'cursor_update' })
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'Session not found', errorCode: ServiceErrorCode.SESSION_NOT_FOUND },
      { status: 404 }
    )
  }

  const updated = sessionManager.updateEditorCursor(sessionId, userId, cursorPosition, selection)

  if (!updated) {
    logServiceError(new Error('User not found in session'), { service: 'Collaboration', operation: 'cursor_update' })
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'User not found in session', errorCode: ServiceErrorCode.USER_NOT_FOUND_IN_SESSION },
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

  return NextResponse.json<ServiceResult<unknown>>({
    success: true
  })
}

async function handleEdit(request: EditRequest): Promise<NextResponse<ServiceResult<unknown>>> {
  const { sessionId, userId, editOperation } = request

  if (!sessionId || !userId || !editOperation) {
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'Missing required fields', errorCode: ServiceErrorCode.MISSING_REQUIRED_FIELDS },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    logServiceError(new Error('Session not found'), { service: 'Collaboration', operation: 'edit' })
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'Session not found', errorCode: ServiceErrorCode.SESSION_NOT_FOUND },
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

  return NextResponse.json<ServiceResult<unknown>>({
    success: true,
    data: {
      version: session.version
    }
  })
}

async function handleComment(request: CommentRequest): Promise<NextResponse<ServiceResult<unknown>>> {
  const { sessionId, userId, username, comment } = request

  if (!sessionId || !userId || !username || !comment) {
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'Missing required fields', errorCode: ServiceErrorCode.MISSING_REQUIRED_FIELDS },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    logServiceError(new Error('Session not found'), { service: 'Collaboration', operation: 'comment' })
    return NextResponse.json<ServiceResult<unknown>>(
      { success: false, error: 'Session not found', errorCode: ServiceErrorCode.SESSION_NOT_FOUND },
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
