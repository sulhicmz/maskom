import { NextRequest, NextResponse } from 'next/server'
import { sessionManager } from '@/utils/collaboration/sessionManager'
import { CollaborativeEvent } from '@/types/collaboration'

const MAX_EVENTS_PER_POLL = 50

interface PollResponse {
  success: boolean
  events: CollaborativeEvent[]
  sessionActive: boolean
  error?: string
}

interface JoinRequest {
  postId: number
  userId: number
  username: string
}

interface LeaveRequest {
  sessionId: string
  userId: number
}

interface CursorUpdateRequest {
  sessionId: string
  userId: number
  cursorPosition: { line: number; column: number }
  selection?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

interface EditRequest {
  sessionId: string
  userId: number
  editOperation: {
    type: 'insert' | 'delete' | 'replace'
    position: { line: number; column: number }
    content?: string
    length?: number
  }
}

interface CommentRequest {
  sessionId: string
  userId: number
  username: string
  comment: {
    content: string
    position: { line: number; column: number }
  }
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
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')
    const userId = parseInt(searchParams.get('userId') || '0')
    const username = searchParams.get('username') || ''
    const lastEventId = searchParams.get('lastEventId') || undefined

    if (!sessionId || !userId || !username) {
      return NextResponse.json<PollResponse>(
        { success: false, events: [], sessionActive: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

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
    const body = await request.json()
    const action = body.action as string

    switch (action) {
      case 'join':
        return handleJoin(body as JoinRequest)
      case 'leave':
        return handleLeave(body as LeaveRequest)
      case 'cursor_update':
        return handleCursorUpdate(body as CursorUpdateRequest)
      case 'edit':
        return handleEdit(body as EditRequest)
      case 'comment':
        return handleComment(body as CommentRequest)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
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

  const event: CollaborativeEvent = {
    type: 'comment_added',
    sessionId,
    postId: session.postId,
    userId,
    timestamp: Date.now(),
    data: {
      eventId: getEventId(sessionId),
      username,
      content: comment.content,
      position: comment.position,
      resolved: false
    }
  }

  bufferEvent(event)

  return NextResponse.json({
    success: true
  })
}
