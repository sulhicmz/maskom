import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HistoryVisualization from '@/components/collaboration/HistoryVisualization'
import { DraftContent } from '@/types/collaboration'
import {
  addToHistory,
  clearHistory
} from '@/utils/collaboration/collaborativeHistory'

const mockOnRollback = jest.fn()

const mockContent: DraftContent = {
  title: 'Test Post',
  description: 'Test Description',
  content: 'Test content',
  tags: [1, 2],
  categoryId: 1,
  imageUrl: 'https://example.com/image.jpg'
}

describe('HistoryVisualization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-20T12:00:00Z').getTime())
    clearHistory(123)
  })

  afterEach(() => {
    jest.useRealTimers()
    clearHistory(123)
  })

  describe('Rendering', () => {
    it('should render component correctly', () => {
      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      expect(screen.getByText('Riwayat Kolaborasi')).toBeInTheDocument()
    })

    it('should display "No history" message when history is empty', () => {
      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      expect(screen.getByText('Belum ada riwayat')).toBeInTheDocument()
    })

    it('should display history stats', () => {
      addToHistory(123, mockContent, 1, 'User1')
      addToHistory(123, mockContent, 2, 'User2')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      expect(screen.getByText('Total Entri')).toBeInTheDocument()
      expect(screen.getByText('24 Jam Terakhir')).toBeInTheDocument()
      expect(screen.getByText('7 Hari Terakhir')).toBeInTheDocument()
    })

    it('should display author breakdown', () => {
      addToHistory(123, mockContent, 1, 'User1')
      addToHistory(123, mockContent, 2, 'User2')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      expect(screen.getByText('Per Author')).toBeInTheDocument()
      expect(screen.getAllByText('User1')).toHaveLength(2)
      expect(screen.getAllByText('User2')).toHaveLength(2)
    })

    it('should display history entries', () => {
      addToHistory(123, mockContent, 1, 'User1')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const authorBreakdownEntries = screen.getAllByText('User1')
      const historyEntries = authorBreakdownEntries.filter(el => el.classList.contains('history-entry-item'))
      expect(historyEntries.length).toBeGreaterThan(0)
    })
  })

  describe('History Entry Selection', () => {
    it('should select history entry when clicked', async () => {
      addToHistory(123, mockContent, 1, 'User1')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const historyEntries = screen.getAllByText('User1').filter(el => el.classList.contains('history-entry-item'))
      fireEvent.click(historyEntries[0]!)

      await waitFor(() => {
        expect(screen.getByText('Pratinjau Versi')).toBeInTheDocument()
      })
    })

    it('should display preview when entry selected', async () => {
      addToHistory(123, mockContent, 1, 'User1', 'Test description')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const historyEntries = screen.getAllByText('User1').filter(el => el.classList.contains('history-entry-item'))
      fireEvent.click(historyEntries[0]!)

      await waitFor(() => {
        expect(screen.getByText('Pratinjau Versi')).toBeInTheDocument()
        expect(screen.getByText('Penulis:')).toBeInTheDocument()
        expect(screen.getByText('Deskripsi:')).toBeInTheDocument()
        expect(screen.getByText('Test description')).toBeInTheDocument()
      })
    })

    it('should show "Version Saat Ini" badge for current version', async () => {
      addToHistory(123, mockContent, 1, 'User1')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const historyEntries = screen.getAllByText('User1').filter(el => el.classList.contains('history-entry-item'))
      fireEvent.click(historyEntries[0]!)

      await waitFor(() => {
        expect(screen.getByText('Versi Saat Ini')).toBeInTheDocument()
      })
    })
  })

  describe('Rollback Functionality', () => {
    it('should show rollback confirmation when button clicked', async () => {
      addToHistory(123, mockContent, 1, 'User1')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const historyEntries = screen.getAllByText('User1').filter(el => el.classList.contains('history-entry-item'))
      fireEvent.click(historyEntries[0]!)

      const rollbackButton = screen.getByText('Kembalikan ke Versi Ini')
      fireEvent.click(rollbackButton)

      await waitFor(() => {
        expect(screen.getByText('Konfirmasi Kembalikan')).toBeInTheDocument()
      })
    })

      expect(screen.getByText('Konfirmasi Kembalikan')).toBeInTheDocument()
    })

    it('should confirm rollback and call onRollback', async () => {
      addToHistory(123, mockContent, 1, 'User1')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const historyEntries = screen.getAllByText('User1').filter(el => el.classList.contains('history-entry-item'))
      fireEvent.click(historyEntries[0]!)

      const confirmButton = screen.getByText('Ya, Kembalikan')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockOnRollback).toHaveBeenCalled()
      })
    })

      const confirmButton = screen.getByText('Ya, Kembalikan')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockOnRollback).toHaveBeenCalledTimes(1)
      })
    })

    it('should close preview when rollback confirmed', async () => {
      addToHistory(123, mockContent, 1, 'User1')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const historyEntries = screen.getAllByText('User1').filter(el => el.classList.contains('history-entry-item'))
      fireEvent.click(historyEntries[0]!)

      const confirmButton = screen.getByText('Ya, Kembalikan')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.queryByText('Pratinjau Versi')).not.toBeInTheDocument()
      })
    })

      const confirmButton = screen.getByText('Ya, Kembalikan')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.queryByText('Pratinjau Versi')).not.toBeInTheDocument()
      })
    })

    it('should disable rollback button for current version', async () => {
      addToHistory(123, mockContent, 1, 'User1')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const historyEntries = screen.getAllByText('User1').filter(el => el.classList.contains('history-entry-item'))
      fireEvent.click(historyEntries[0]!)

      const rollbackButton = screen.getByText('Kembalikan ke Versi Ini')
      expect(rollbackButton).toBeDisabled()
    })
    })
  })

  describe('Clear History Functionality', () => {
    it('should show clear history confirmation when button clicked', () => {
      addToHistory(123, mockContent, 1, 'User1')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const clearButton = screen.getByText('Hapus Riwayat')
      fireEvent.click(clearButton)

      expect(screen.getByText('Konfirmasi Hapus Riwayat')).toBeInTheDocument()
    })

    it('should clear history when confirmed', () => {
      addToHistory(123, mockContent, 1, 'User1')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const clearButton = screen.getByText('Hapus Riwayat')
      fireEvent.click(clearButton)

      const confirmButton = screen.getByText('Ya, Hapus')
      fireEvent.click(confirmButton)

      expect(screen.getByText('Belum ada riwayat')).toBeInTheDocument()
    })

    it('should disable clear history button when no history', () => {
      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const clearButton = screen.getByText('Hapus Riwayat')
      expect(clearButton).toBeDisabled()
    })
  })

  describe('Preview Close', () => {
    it('should close preview when close button clicked', async () => {
      addToHistory(123, mockContent, 1, 'User1')

      render(
        <HistoryVisualization
          postId={123}
          currentContent={mockContent}
          onRollback={mockOnRollback}
        />
      )

      const historyEntries = screen.getAllByText('User1').filter(el => el.classList.contains('history-entry-item'))
      fireEvent.click(historyEntries[0]!)

      await waitFor(() => {
        expect(screen.getByText('Pratinjau Versi')).toBeInTheDocument()
      })

      const closeButton = screen.getByText('X')
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByText('Pratinjau Versi')).not.toBeInTheDocument()
      })
    })

      expect(screen.queryByText('Pratinjau Versi')).not.toBeInTheDocument()
    })
  })
})
