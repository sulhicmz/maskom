'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { DraftContent, CursorPosition, CollaborativeEvent } from '@/types/collaboration'
import { CollaborationClient, createCollaborationClient } from '@/utils/collaboration/collaborationClient'
import { OperationalTransformation } from '@/utils/collaboration/operationalTransformation'
import ActiveEditorsIndicator from './ActiveEditorsIndicator'
import RealTimeComments from './RealTimeComments'
import HistoryVisualization from './HistoryVisualization'
import { addToHistory } from '@/utils/collaboration/collaborativeHistory'

interface RealTimeEditorProps {
  postId: number
  initialContent: DraftContent
  userId: number
  username: string
  onSave: (content: DraftContent) => void
  hasEditorRole: boolean
}

interface ConflictInfo {
  message: string
  operation: CollaborativeEvent | null
  canResolve: boolean
}

export default function RealTimeEditor({
  postId,
  initialContent,
  userId,
  username,
  onSave,
  hasEditorRole
}: RealTimeEditorProps) {
  const [content, setContent] = useState<DraftContent>(initialContent)
  const [client, setClient] = useState<CollaborationClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [version, setVersion] = useState(0)
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [comments, setComments] = useState<any[]>([])

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const ot = new OperationalTransformation()

  const createSessionId = useCallback(() => {
    return `session_${postId}_${Date.now()}`
  }, [postId])

  const handleJoin = useCallback(async () => {
    if (!hasEditorRole) {
      alert('Anda tidak memiliki izin untuk bergabung ke sesi kolaborasi')
      return
    }

    setIsConnecting(true)

    try {
      const newSessionId = createSessionId()
      setSessionId(newSessionId)

      const newClient = createCollaborationClient({
        sessionId: newSessionId,
        userId,
        username,
        pollInterval: 1000,
        onEvent: handleEvent,
        onJoin: (editors) => {
          console.log('Users joined:', editors)
        },
        onLeave: (editors) => {
          console.log('Users left:', editors)
        },
        onDisconnect: handleDisconnect,
        onError: handleError
      })

      setClient(newClient)

      const joined = await newClient.join()

      if (joined) {
        setIsConnected(true)
        console.log('Joined collaboration session successfully')
      } else {
        console.error('Failed to join session')
      }
    } catch (error) {
      console.error('Error joining session:', error)
      handleError(error as Error)
    } finally {
      setIsConnecting(false)
    }
  }, [hasEditorRole, userId, username, createSessionId])

  const handleLeave = useCallback(async () => {
    if (client) {
      await client.leave()
    }

    setIsConnected(false)
    setClient(null)
    setSessionId('')
  }, [client])

  const handleEvent = useCallback((event: CollaborativeEvent) => {
    console.log('Received event:', event)

    switch (event.type) {
      case 'edit_applied':
        handleIncomingEdit(event)
        break

      case 'comment_added':
        handleIncomingComment(event)
        break

      case 'cursor_moved':
        break

      default:
        console.log('Unhandled event type:', event.type)
    }
  }, [])

  const handleIncomingEdit = useCallback((event: CollaborativeEvent) => {
    if (!event.data) return

    const operation = event.data as {
      type: 'insert' | 'delete' | 'replace'
      position: CursorPosition
      content?: string
      length?: number
      version: number
      authorId: number
    }

    if (operation.authorId === userId) {
      return
    }

    setConflictInfo(null)

    let newContent = { ...content }

    if (operation.position.line === 0) {
      if (operation.type === 'insert' && operation.content) {
        newContent.title = insertAtPosition(newContent.title, operation.position.column, operation.content)
      } else if (operation.type === 'delete' && operation.length) {
        newContent.title = deleteAtPosition(newContent.title, operation.position.column, operation.length)
      } else if (operation.type === 'replace' && operation.content) {
        newContent.title = replaceAtPosition(newContent.title, operation.position.column, operation.content)
      }
    } else if (operation.position.line === 1) {
      if (operation.type === 'insert' && operation.content) {
        newContent.description = insertAtPosition(newContent.description, operation.position.column, operation.content)
      } else if (operation.type === 'delete' && operation.length) {
        newContent.description = deleteAtPosition(newContent.description, operation.position.column, operation.length)
      } else if (operation.type === 'replace' && operation.content) {
        newContent.description = replaceAtPosition(newContent.description, operation.position.column, operation.content)
      }
    } else if (operation.position.line === 2) {
      if (operation.type === 'insert' && operation.content) {
        newContent.content = insertAtPosition(newContent.content, operation.position.column, operation.content)
      } else if (operation.type === 'delete' && operation.length) {
        newContent.content = deleteAtPosition(newContent.content, operation.position.column, operation.length)
      } else if (operation.type === 'replace' && operation.content) {
        newContent.content = replaceAtPosition(newContent.content, operation.position.column, operation.content)
      }
    }

    setVersion(operation.version)
    setContent(newContent)
  }, [content, userId])

  const handleIncomingComment = useCallback((event: CollaborativeEvent) => {
    if (!event.data) return

    setComments(prev => [...prev, event.data])
  }, [])

  const handleDisconnect = useCallback(() => {
    setIsConnected(false)
    console.log('Disconnected from session')
  }, [])

  const handleError = useCallback((error: Error) => {
    console.error('Collaboration error:', error)
    setConflictInfo({
      message: error.message || 'Terjadi kesalahan kolaborasi',
      operation: null,
      canResolve: false
    })
  }, [])

  const handleContentChange = useCallback((
    field: 'title' | 'description' | 'content',
    newValue: string
  ) => {
    const newContent = { ...content, [field]: newValue }
    setContent(newContent)
    onSave(newContent)
  }, [content, onSave])

  const handleAutoSave = useCallback(() => {
    addToHistory(postId, content, userId, username, 'Auto-saved draft')
  }, [postId, content, userId, username])

  const handleSendCursorUpdate = useCallback((
    line: number,
    column: number,
    selection?: { start: CursorPosition; end: CursorPosition }
  ) => {
    if (!client || !isConnected) return

    client.sendCursorUpdate({ line, column }, selection)
  }, [client, isConnected])

  const handleSendEdit = useCallback((
    field: 'title' | 'description' | 'content',
    oldValue: string,
    newValue: string
  ) => {
    if (!client || !isConnected) return

    const line = field === 'title' ? 0 : field === 'description' ? 1 : 2

    let operation: { type: 'insert' | 'delete' | 'replace'; position: CursorPosition; content?: string; length?: number; version: number }

    if (newValue.length > oldValue.length) {
      const insertedText = newValue.substring(oldValue.length)
      operation = {
        type: 'insert',
        position: { line, column: oldValue.length },
        content: insertedText,
        version: version + 1
      }
    } else if (newValue.length < oldValue.length) {
      const deletedLength = oldValue.length - newValue.length
      operation = {
        type: 'delete',
        position: { line, column: newValue.length },
        length: deletedLength,
        version: version + 1
      }
    } else {
      operation = {
        type: 'replace',
        position: { line, column: 0 },
        content: newValue,
        version: version + 1
      }
    }

    client.sendEdit(operation)
    setVersion(version + 1)
  }, [client, isConnected, version])

  const handleSendComment = useCallback((comment: string, position: CursorPosition) => {
    if (!client || !isConnected) return

    client.sendComment({ content: comment, position })
  }, [client, isConnected])

  const handleResolveComment = useCallback((commentId: string) => {
    console.log('Resolve comment:', commentId)
  }, [])

  const handlePositionClick = useCallback((position: CursorPosition) => {
    if (position.line === 0 && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.setSelectionRange(position.column, position.column)
    } else if (position.line === 1 && descriptionRef.current) {
      descriptionRef.current.focus()
      descriptionRef.current.setSelectionRange(position.column, position.column)
    } else if (position.line === 2 && contentRef.current) {
      contentRef.current.focus()
      contentRef.current.setSelectionRange(position.column, position.column)
    }
  }, [])

  const handleRollback = useCallback((rollbackContent: DraftContent, entry: any) => {
    setContent(rollbackContent)
    onSave(rollbackContent)
  }, [onSave])

  const insertAtPosition = (str: string, pos: number, insert: string): string => {
    return str.substring(0, pos) + insert + str.substring(pos)
  }

  const deleteAtPosition = (str: string, pos: number, length: number): string => {
    return str.substring(0, pos) + str.substring(pos + length)
  }

  const replaceAtPosition = (str: string, pos: number, replace: string): string => {
    return replace
  }

  useEffect(() => {
    if (isConnected) {
      const autoSaveTimer = setInterval(handleAutoSave, 30000)

      return () => clearInterval(autoSaveTimer)
    }
  }, [isConnected, handleAutoSave])

  return (
    <div className="real-time-editor">
      <div className="editor-toolbar">
        <div className="editor-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <i className={`bi ${isConnected ? 'bi-wifi' : 'bi-wifi-off'}`}></i>
          </span>
          <span className="status-text">
            {isConnecting ? 'Menghubungkan...' : isConnected ? 'Terhubung' : 'Terputus'}
          </span>
          {isConnected && <span className="version-badge">v{version}</span>}
        </div>

        <div className="editor-actions">
          {!isConnected ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleJoin}
              disabled={isConnecting || !hasEditorRole}
            >
              <i className="bi bi-people-fill"></i> Mulai Kolaborasi
            </button>
          ) : (
            <>
              <button
                type="button"
                className={`btn btn-sm ${showComments ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowComments(!showComments)}
              >
                <i className="bi bi-chat-dots"></i> Komentar
              </button>
              <button
                type="button"
                className={`btn btn-sm ${showHistory ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowHistory(!showHistory)}
              >
                <i className="bi bi-clock-history"></i> Riwayat
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={handleLeave}
              >
                <i className="bi bi-box-arrow-right"></i> Keluar
              </button>
            </>
          )}
        </div>
      </div>

      {isConnected && (
        <ActiveEditorsIndicator
          sessionId={sessionId}
          currentUserId={userId}
          onEditorClick={(editorId) => console.log('Editor clicked:', editorId)}
        />
      )}

      {conflictInfo && (
        <div className={`conflict-alert ${conflictInfo.canResolve ? 'resolvable' : 'error'}`}>
          <i className="bi bi-exclamation-triangle"></i>
          <span>{conflictInfo.message}</span>
          {conflictInfo.canResolve && (
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => setConflictInfo(null)}
            >
              Tutup
            </button>
          )}
        </div>
      )}

      <div className="editor-container">
        <div className="editor-form">
          <div className="form-group">
            <label>Judul</label>
            <textarea
              ref={titleRef}
              className="form-control"
              rows={2}
              value={content.title}
              onChange={(e) => {
                const newValue = e.target.value
                handleContentChange('title', newValue)
                handleSendEdit('title', content.title, newValue)
              }}
              onSelect={() => {
                if (titleRef.current) {
                  const { selectionStart, selectionEnd } = titleRef.current
                  handleSendCursorUpdate(0, selectionStart || 0)
                }
              }}
            />
          </div>

          <div className="form-group">
            <label>Deskripsi</label>
            <textarea
              ref={descriptionRef}
              className="form-control"
              rows={3}
              value={content.description}
              onChange={(e) => {
                const newValue = e.target.value
                handleContentChange('description', newValue)
                handleSendEdit('description', content.description, newValue)
              }}
              onSelect={() => {
                if (descriptionRef.current) {
                  const { selectionStart, selectionEnd } = descriptionRef.current
                  handleSendCursorUpdate(1, selectionStart || 0)
                }
              }}
            />
          </div>

          <div className="form-group">
            <label>Isi Konten</label>
            <textarea
              ref={contentRef}
              className="form-control"
              rows={20}
              value={content.content}
              onChange={(e) => {
                const newValue = e.target.value
                handleContentChange('content', newValue)
                handleSendEdit('content', content.content, newValue)
              }}
              onSelect={() => {
                if (contentRef.current) {
                  const { selectionStart, selectionEnd } = contentRef.current
                  handleSendCursorUpdate(2, selectionStart || 0)
                }
              }}
            />
          </div>
        </div>

        {showComments && (
          <div className="editor-sidebar">
            <RealTimeComments
              postId={postId}
              comments={comments}
              currentUserId={userId}
              onResolveComment={handleResolveComment}
              onPositionClick={handlePositionClick}
            />
          </div>
        )}

        {showHistory && (
          <div className="editor-sidebar">
            <HistoryVisualization
              postId={postId}
              currentContent={content}
              onRollback={handleRollback}
            />
          </div>
        )}
      </div>
    </div>
  )
}
