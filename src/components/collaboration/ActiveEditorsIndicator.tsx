'use client'

import React, { useEffect, useState } from 'react'
import { ActiveEditor } from '@/types/collaboration'
import { useTheme } from '@/contexts/ThemeContext'

interface ActiveEditorsIndicatorProps {
  editors: ActiveEditor[]
  currentUserId: number
  onEditorClick?: (editorId: number) => void
}

const ActiveEditorsIndicator: React.FC<ActiveEditorsIndicatorProps> = ({
  editors,
  currentUserId,
  onEditorClick
}) => {
  const { isDark } = useTheme()
  const [localEditors, setLocalEditors] = useState<ActiveEditor[]>([])

  useEffect(() => {
    setLocalEditors(editors)
  }, [editors])

  const otherEditors = localEditors.filter(editor => editor.userId !== currentUserId)

  if (otherEditors.length === 0) {
    return null
  }

  const getAvatarColor = (userId: number): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ]
    const index = userId % colors.length
    return colors[index]
  }

  const getInitials = (username: string): string => {
    const words = username.trim().split(' ')
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }

  const formatLastSeen = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) {
      return 'Aktif'
    } else if (diff < 300000) {
      return `${Math.floor(diff / 60000)}m yang lalu`
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 300000)}m yang lalu`
    } else {
      return `${Math.floor(diff / 3600000)}j yang lalu`
    }
  }

  return (
    <div
      className={`fixed top-20 right-4 z-50 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-3 border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Editor Aktif ({otherEditors.length})
      </div>
      <div className="space-y-2">
        {otherEditors.map(editor => (
          <div
            key={editor.userId}
            className={`flex items-center space-x-2 p-2 rounded ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            } cursor-pointer transition-colors`}
            onClick={() => onEditorClick?.(editor.userId)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(
                editor.userId
              )}`}
            >
              {getInitials(editor.username)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {editor.username}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatLastSeen(editor.lastSeen)}
              </div>
            </div>
            {editor.cursorPosition && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Baris {editor.cursorPosition.line + 1}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActiveEditorsIndicator
