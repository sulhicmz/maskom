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
  }, [isActive, roomId, userId, userName]);

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
  }, []);

  const handleUserJoined = (message: any) => {
    const newPresence: UserPresence = {
      userId: message.data.userId.toString(),
      userName: message.data.userName,
      status: 'online',
      lastSeen: Date.now(),
      isTyping: false,
    };

    setActiveUsers((prev) => [...prev, newPresence]);
  };

  const handleUserLeft = (message: any) => {
    setActiveUsers((prev) => prev.filter((u) => u.userId !== message.userId.toString()));
    setCursorPositions((prev) => {
      const newMap = new Map(prev);
      newMap.delete(message.userId.toString());
      return newMap;
    });
  };

  const handleCursorMoved = (message: any) => {
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
  };

  const handleEditApplied = (message: any) => {
    window.dispatchEvent(
      new CustomEvent('collaboration-edit', {
        detail: message.data,
      })
    );
  };

  const handleCommentAdded = (message: any) => {
    window.dispatchEvent(
      new CustomEvent('collaboration-comment', {
        detail: message.data,
      })
    );
  };

  const handleCommentResolved = (message: any) => {
    window.dispatchEvent(
      new CustomEvent('collaboration-comment-resolved', {
        detail: message.data,
      })
    );
  };

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
          <Card className="mb-3">
            <Card.Body>
              <Card.Subtitle className="text-muted small mb-2">
                Ruang
              </Card.Subtitle>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <strong>ID Ruang:</strong> {roomId}
                </div>
                <div>
                  <strong>Konten:</strong> #{contentId}
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Subtitle className="text-muted small mb-2">
                Partisipan Aktif ({activeUsers.length})
              </Card.Subtitle>
              {activeUsers.length === 0 ? (
                <p className="text-muted mb-0">Tidak ada partisipan aktif</p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {activeUsers.map((user) => (
                    <Badge
                      key={user.userId}
                      bg={isDark ? 'dark' : 'light'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                      }}
                    >
                      <span>{user.userName}</span>
                      {user.isTyping && (
                        <span className="text-warning">
                          <span className="spinner-border spinner-border-sm" />
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {cursorPositions.size > 0 && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Subtitle className="text-muted small mb-2">
                  Posisi Kursor
                </Card.Subtitle>
                <div className="small text-muted">
                  {Array.from(cursorPositions.entries()).map(([userId, pos]) => (
                    <div key={userId} className="mb-1">
                      <strong>{userId}:</strong> Baris {pos.line}, Kolom {pos.column}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Body>
              <Card.Subtitle className="text-muted small mb-2">
                Status Koneksi
              </Card.Subtitle>
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? '#28a745' : '#dc3545',
                  }}
                />
                <span>
                  {isConnected
                    ? 'Terhubung ke server kolaborasi'
                    : 'Terputus dari server kolaborasi'}
                </span>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
