'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useTheme } from '@/contexts/ThemeContext';
import {
  UserPresence,
  CursorPosition,
  CollaborationRoom,
  ActiveEditor,
} from '@/types/collaboration';

interface CollaborationPanelProps {
  roomId: string;
  userId: string;
  userName: string;
  contentId: number;
  isActive: boolean;
  onToggleCollaboration: () => void;
}

export default function CollaborationPanel({
  roomId,
  userId,
  userName,
  contentId,
  isActive,
  onToggleCollaboration,
}: CollaborationPanelProps) {
  const { isDark } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [sessionData, setSessionData] = useState<CollaborationRoom | null>(null);
  const [cursorPositions, setCursorPositions] = useState<Map<string, CursorPosition>>(new Map());
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Handler functions defined first to avoid hoisting issues
  const handleUserJoined = useCallback((message: any) => {
    const newPresence: UserPresence = {
      userId: message.data.userId.toString(),
      userName: message.data.userName,
      status: 'online',
      lastSeen: currentTime,
      isTyping: false,
    };

    setActiveUsers((prev) => [...prev, newPresence]);
  }, [currentTime]);

  const handleUserLeft = useCallback((message: any) => {
    setActiveUsers((prev) => prev.filter((u) => u.userId !== message.userId.toString()));
    setCursorPositions((prev) => {
      const newMap = new Map(prev);
      newMap.delete(message.userId.toString());
      return newMap;
    });
  }, []);

  const handleCursorMoved = useCallback((message: any) => {
    setCursorPositions((prev) => {
      const newMap = new Map(prev);
      newMap.set(message.userId.toString(), message.data.cursorPosition);
      return newMap;
    });

    if (message.data.activeEditors) {
      setActiveUsers((prev) =>
        message.data.activeEditors.map((editor: ActiveEditor) => ({
          userId: editor.userId.toString(),
          userName: editor.username,
          status: 'online',
          cursorPosition: editor.cursorPosition,
          lastSeen: editor.lastSeen,
          isTyping: false,
        }))
      );
    }
  }, []);

  const handleEditApplied = useCallback((message: any) => {
    window.dispatchEvent(
      new CustomEvent('collaboration-edit', {
        detail: message.data,
      })
    );
  }, []);

  const handleCommentAdded = useCallback((message: any) => {
    window.dispatchEvent(
      new CustomEvent('collaboration-comment', {
        detail: message.data,
      })
    );
  }, []);

  const handleCommentResolved = useCallback((message: any) => {
    window.dispatchEvent(
      new CustomEvent('collaboration-comment-resolved', {
        detail: message.data,
      })
    );
  }, []);

  // Update currentTime periodically to avoid calling Date.now() during render
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCollaborationEvent = useCallback((message: any) => {
    switch (message.type) {
      case 'user_joined':
        handleUserJoined(message);
        break;
      case 'user_left':
        handleUserLeft(message);
        break;
      case 'cursor_moved':
        handleCursorMoved(message);
        break;
      case 'edit_applied':
        handleEditApplied(message);
        break;
      case 'comment_added':
        handleCommentAdded(message);
        break;
      case 'comment_resolved':
        handleCommentResolved(message);
        break;
    }
  }, [handleUserJoined, handleUserLeft, handleCursorMoved, handleEditApplied, handleCommentAdded, handleCommentResolved]);

  useEffect(() => {
    if (!isActive) return;

    const connectToRoom = async () => {
      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/api/collaboration?roomId=${roomId}&userId=${userId}&userName=${encodeURIComponent(userName)}`;
        
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          handleCollaborationEvent(message);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
        };

        return ws;
      } catch (error) {
        console.error('Failed to connect to collaboration room:', error);
      }
    };

    const cleanup = connectToRoom();

    return () => {
      if (cleanup instanceof WebSocket) {
        cleanup.close();
      }
    };
  }, [isActive, roomId, userId, userName, handleCollaborationEvent]);

  const getStatusBadge = () => {
    if (!isActive) {
      return <Badge bg="secondary">Dimatikan</Badge>;
    }
    if (isConnected) {
      return <Badge bg="success">Terhubung</Badge>;
    }
    return <Badge bg="danger">Terputus</Badge>;
  };

  return (
    <div
      className={`collaboration-panel ${isDark ? 'dark' : 'light'}`}
      style={{
        border: `1px solid ${isDark ? '#444' : '#ddd'}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Kolaborasi Langsung</h5>
        <div className="d-flex align-items-center gap-2">
          {getStatusBadge()}
          <Button
            variant={isActive ? 'outline-danger' : 'outline-success'}
            size="sm"
            onClick={onToggleCollaboration}
          >
            {isActive ? 'Matikan' : 'Aktifkan'}
          </Button>
        </div>
      </div>

      {isActive && (
        <>
          <div className="mb-3">
            <h6>Pengguna Aktif ({activeUsers.length})</h6>
            {activeUsers.length === 0 ? (
              <p className="text-muted">Tidak ada pengguna aktif</p>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {activeUsers.map((user) => (
                  <Badge
                    key={user.userId}
                    bg={user.status === 'online' ? 'success' : 'warning'}
                    className="d-flex align-items-center gap-1"
                  >
                    <span
                      className="rounded-circle"
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: user.status === 'online' ? '#28a745' : '#ffc107',
                      }}
                    />
                    {user.userName}
                    {user.isTyping && <span className="ms-1">(mengetik...)</span>}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {cursorPositions.size > 0 && (
            <div className="mb-3">
              <h6>Posisi Kursor</h6>
              <div className="d-flex flex-wrap gap-2">
                {Array.from(cursorPositions.entries()).map(([userId, position]) => (
                  <Badge key={userId} bg="info" className="cursor-position">
                    {userId}: Baris {position.line}, Kolom {position.column}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="text-muted small">
            <p className="mb-1">
              Ruang: <strong>{roomId}</strong>
            </p>
            <p className="mb-0">
              Pengguna: <strong>{userName}</strong> (ID: {userId})
            </p>
          </div>
        </>
      )}
    </div>
  );
}
