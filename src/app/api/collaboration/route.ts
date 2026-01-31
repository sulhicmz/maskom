import { NextRequest, NextResponse } from 'next/server';
import { ISessionManager } from '@/types/collaboration';

const sessions: Map<string, Set<WebSocket>> = new Map();

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');

  if (!roomId || !userId || !userName) {
    return NextResponse.json(
      { error: 'Missing required parameters: roomId, userId, userName' },
      { status: 400 }
    );
  }

  const sessionManager = getSessionManager();
  const sessionId = sessionManager.createSession(
    parseInt(roomId),
    { title: '', description: '', content: '', tags: [], categoryId: undefined, imageUrl: undefined },
    parseInt(userId),
    userName
  );

  return new Response(null, {
    status: 101,
    webSocket: {
      onOpen(ws: WebSocket) {
        const sessionSet = sessions.get(roomId) || new Set();
        sessionSet.add(ws);
        sessions.set(roomId, sessionSet);

        sessionManager.addEditor(sessionId, parseInt(userId), userName);

        broadcastToRoom(roomId, {
          type: 'user_joined',
          sessionId,
          postId: parseInt(roomId),
          userId: parseInt(userId),
          timestamp: Date.now(),
          data: { userId: parseInt(userId), userName },
        }, ws);
      },

      onMessage(ws: WebSocket, message: string | ArrayBuffer) {
        try {
          const data = typeof message === 'string' ? JSON.parse(message) : null;
          
          if (!data) return;

          const session = sessionManager.getSession(sessionId);
          if (!session) return;

          switch (data.type) {
            case 'cursor_moved':
              handleCursorMove(sessionId, data, sessionManager);
              break;
              
            case 'edit_applied':
              handleEditApplied(sessionId, data, sessionManager);
              break;
              
            case 'comment_added':
              handleCommentAdded(sessionId, data, sessionManager);
              break;
              
            case 'comment_resolved':
              handleCommentResolved(sessionId, data, sessionManager);
              break;
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      },

      onClose(ws: WebSocket) {
        const sessionSet = sessions.get(roomId);
        if (sessionSet) {
          sessionSet.delete(ws);
          if (sessionSet.size === 0) {
            sessions.delete(roomId);
          }
        }

        sessionManager.removeEditor(sessionId, parseInt(userId));

        broadcastToRoom(roomId, {
          type: 'user_left',
          sessionId,
          postId: parseInt(roomId),
          userId: parseInt(userId),
          timestamp: Date.now(),
        }, ws);
      },

      onError(ws: WebSocket, error: Error) {
        console.error('WebSocket error:', error);
      },
    },
  });
}

function getSessionManager(): ISessionManager {
  try {
    const { sessionManager } = require('@/lib/sessionManager');
    return sessionManager;
  } catch (error) {
    console.error('Failed to get session manager:', error);
    throw new Error('Session manager not available');
  }
}

function broadcastToRoom(roomId: string, message: any, excludeWs?: WebSocket): void {
  const sessionSet = sessions.get(roomId);
  if (!sessionSet) return;

  const messageStr = JSON.stringify(message);

  for (const ws of sessionSet) {
    if (ws.readyState === WebSocket.OPEN && ws !== excludeWs) {
      try {
        ws.send(messageStr);
      } catch (error) {
        console.error('Error broadcasting message to WebSocket:', error);
      }
    }
  }
}

function handleCursorMove(sessionId: string, data: any, sessionManager: ISessionManager): void {
  const { cursorPosition, selection, userId } = data;

  sessionManager.updateEditorCursor(
    sessionId,
    userId,
    cursorPosition,
    selection
  );

  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  const activeEditors = sessionManager.getActiveEditors(sessionId);
  
  broadcastToRoom(session.postId.toString(), {
    type: 'cursor_moved',
    sessionId,
    postId: session.postId,
    userId,
    timestamp: Date.now(),
    data: { activeEditors },
  });
}

function handleEditApplied(sessionId: string, data: any, sessionManager: ISessionManager): void {
  const { operation, userId } = data;
  
  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  sessionManager.updateSessionContent(sessionId, operation.content || session.content);

  broadcastToRoom(session.postId.toString(), {
    type: 'edit_applied',
    sessionId,
    postId: session.postId,
    userId,
    timestamp: Date.now(),
    data: { operation, content: session.content },
  });
}

function handleCommentAdded(sessionId: string, data: any, sessionManager: ISessionManager): void {
  const { comment } = data;
  
  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  broadcastToRoom(session.postId.toString(), {
    type: 'comment_added',
    sessionId,
    postId: session.postId,
    userId: comment.authorId,
    timestamp: Date.now(),
    data: { comment },
  });
}

function handleCommentResolved(sessionId: string, data: any, sessionManager: ISessionManager): void {
  const { commentId } = data;
  
  const session = sessionManager.getSession(sessionId);
  if (!session) return;

  broadcastToRoom(session.postId.toString(), {
    type: 'comment_resolved',
    sessionId,
    postId: session.postId,
    userId: data.userId,
    timestamp: Date.now(),
    data: { commentId },
  });
}
