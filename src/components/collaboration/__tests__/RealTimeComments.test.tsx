import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RealTimeComments from '@/components/collaboration/RealTimeComments'
import { RealTimeComment } from '@/types/collaboration'

const mockOnResolveComment = jest.fn()
const mockOnPositionClick = jest.fn()

const mockComments: RealTimeComment[] = [
  {
    id: 'comment_1',
    postId: 123,
    authorId: 1,
    authorName: 'User1',
    content: 'Test comment 1',
    position: { line: 0, column: 5 },
    createdAt: Date.now() - 60000,
    resolved: false
  },
  {
    id: 'comment_2',
    postId: 123,
    authorId: 2,
    authorName: 'User2',
    content: 'Test comment 2',
    position: { line: 1, column: 10 },
    createdAt: Date.now() - 3600000,
    resolved: false
  },
  {
    id: 'comment_3',
    postId: 123,
    authorId: 3,
    authorName: 'User3',
    content: 'Test comment 3 (resolved)',
    position: { line: 2, column: 0 },
    createdAt: Date.now() - 86400000,
    resolved: true
  }
]

describe('RealTimeComments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render component correctly', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      expect(screen.getByText('Komentar Aktif (2)')).toBeInTheDocument()
    })

    it('should render "No comments" message when no comments', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={[]}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      expect(screen.getByText('Belum ada komentar')).toBeInTheDocument()
    })

    it('should display all active comments', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      expect(screen.getByText('Test comment 1')).toBeInTheDocument()
      expect(screen.getByText('Test comment 2')).toBeInTheDocument()
    })

    it('should show resolved comments toggle when there are resolved comments', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      expect(screen.getByText(/Tampilkan Terselesaikan/)).toBeInTheDocument()
    })

    it('should display resolved comments when expanded', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      const toggleButton = screen.getByText(/Tampilkan Terselesaikan/)
      fireEvent.click(toggleButton)

      expect(screen.getByText('Test comment 3 (resolved)')).toBeInTheDocument()
      expect(screen.getByText('Terselesaikan')).toBeInTheDocument()
    })
  })

  describe('Comment Actions', () => {
    it('should call onPositionClick when position button clicked', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      const positionButtons = screen.getAllByTitle(/Baris.*Kolom/)
      fireEvent.click(positionButtons[0])

      expect(mockOnPositionClick).toHaveBeenCalledTimes(1)
      expect(mockOnPositionClick).toHaveBeenCalledWith({ line: 0, column: 5 })
    })

    it('should show resolve button only for active comments by current user', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      const resolveButtons = screen.getAllByTitle(/Selesaikan komentar/)
      expect(resolveButtons.length).toBe(1)
    })

    it('should call onResolveComment when resolve button clicked', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      const resolveButton = screen.getByTitle(/Selesaikan komentar/)
      fireEvent.click(resolveButton)

      expect(mockOnResolveComment).toHaveBeenCalledTimes(1)
      expect(mockOnResolveComment).toHaveBeenCalledWith('comment_1')
    })

    it('should toggle comment expansion when expand button clicked', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      const expandButton = screen.getAllByRole('button').find(btn => btn.querySelector('.bi-chevron-down'))
      expect(expandButton).toBeInTheDocument()
      fireEvent.click(expandButton!)

      expect(screen.getByText(/Baris 0, Kolom 5/)).toBeInTheDocument()
    })
  })

  describe('Comment Display', () => {
    it('should display comment author name', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      expect(screen.getByText('User1')).toBeInTheDocument()
      expect(screen.getByText('User2')).toBeInTheDocument()
    })

    it('should display comment content', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      expect(screen.getByText('Test comment 1')).toBeInTheDocument()
      expect(screen.getByText('Test comment 2')).toBeInTheDocument()
    })

    it('should not show resolved comments initially', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      expect(screen.queryByText('Test comment 3 (resolved)')).not.toBeInTheDocument()
    })

    it('should display resolved badge for resolved comments', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      fireEvent.click(screen.getByText(/Tampilkan Terselesaikan/))

      expect(screen.getByText('Terselesaikan')).toBeInTheDocument()
    })

    it('should show resolved toggle button changes text when expanded', () => {
      render(
        <RealTimeComments
          postId={123}
          comments={mockComments}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      const toggleButton = screen.getByText(/Tampilkan Terselesaikan/)
      expect(toggleButton).toHaveTextContent(/Tampilkan Terselesaikan/)

      fireEvent.click(toggleButton)

      expect(toggleButton).toHaveTextContent(/Sembunyikan/)
    })
  })
})

describe('CommentItem', () => {
  const comment = mockComments[0]

    it('should expand comment details when expand button clicked', () => {
      const comment = mockComments[0]

      render(
        <RealTimeComments
          postId={123}
          comments={[comment]}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      const expandButton = screen.getAllByRole('button').find(btn => btn.querySelector('.bi-chevron-down'))
      expect(expandButton).toBeInTheDocument()
      fireEvent.click(expandButton!)

      expect(screen.getByText('Baris 0, Kolom 5')).toBeInTheDocument()
    })

    it('should show position information when expanded', () => {
      const comment = mockComments[0]

      render(
        <RealTimeComments
          postId={123}
          comments={[comment]}
          currentUserId={1}
          onResolveComment={mockOnResolveComment}
          onPositionClick={mockOnPositionClick}
        />
      )

      const expandButton = screen.getAllByRole('button').find(btn => btn.querySelector('.bi-chevron-down'))
      expect(expandButton).toBeInTheDocument()
      fireEvent.click(expandButton!)

      expect(screen.getByText(/Baris 0, Kolom 5/)).toBeInTheDocument()
    })

  it('should not show resolve button for resolved comments', () => {
    const resolvedComment: RealTimeComment = {
      ...comment,
      resolved: true
    }

    render(
      <RealTimeComments
        postId={123}
        comments={[resolvedComment]}
        currentUserId={1}
        onResolveComment={mockOnResolveComment}
        onPositionClick={mockOnPositionClick}
      />
    )

    expect(screen.queryByTitle(/Selesaikan komentar/)).not.toBeInTheDocument()
  })

  it('should not show resolve button for comments by other users', () => {
    render(
      <RealTimeComments
        postId={123}
        comments={[comment]}
        currentUserId={999}
        onResolveComment={mockOnResolveComment}
        onPositionClick={mockOnPositionClick}
      />
    )

    expect(screen.queryByTitle(/Selesaikan komentar/)).not.toBeInTheDocument()
  })
})
