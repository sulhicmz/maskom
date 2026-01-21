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
  try {
    const clientIdentifier = getClientIdentifier(request)
    const rateLimitResult = strictRateLimiter(clientIdentifier)

    if (!rateLimitResult.success) {
      return NextResponse.json<PollResponse>(
        { success: false, events: [], sessionActive: false, error: 'Rate limit exceeded' },
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
      return NextResponse.json<PollResponse>(
        { success: false, events: [], sessionActive: false, error: 'Invalid query parameters', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { sessionId, lastEventId } = validationResult.data

    const session = sessionManager.getSession(sessionId)

    if (!session) {
      return NextResponse.json<PollResponse>(
        { success: false, events: [], sessionActive: false, error: 'Session not found' },
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
  } catch (error) {
    console.error('Error in collaboration poll:', error)
    return NextResponse.json<PollResponse>(
      { success: false, events: [], sessionActive: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIdentifier = getClientIdentifier(request)
    const rateLimitResult = strictRateLimiter(clientIdentifier)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
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
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: validationResult.error.issues },
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
  } catch (error) {
    console.error('Error in collaboration API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleJoin(request: JoinRequest): Promise<NextResponse> {
  const { postId, userId, username } = request

  if (!postId || !userId || !username) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const session = sessionManager.getSessionByPostId(postId)

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'No session exists for this post. Start a new collaboration session.' },
      { status: 404 }
    )
  }

  const added = sessionManager.addEditor(session.sessionId, userId, username)

  if (!added) {
    return NextResponse.json(
      { success: false, error: 'Failed to join session' },
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
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session not found' },
      { status: 404 }
    )
  }

  const removed = sessionManager.removeEditor(sessionId, userId)

  if (!removed) {
    return NextResponse.json(
      { success: false, error: 'User not found in session' },
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
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session not found' },
      { status: 404 }
    )
  }

  const updated = sessionManager.updateEditorCursor(sessionId, userId, cursorPosition, selection)

  if (!updated) {
    return NextResponse.json(
      { success: false, error: 'User not found in session' },
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
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session not found' },
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
      eventId: getEventId(sessionId),
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
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const session = sessionManager.getSession(sessionId)

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session not found' },
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
