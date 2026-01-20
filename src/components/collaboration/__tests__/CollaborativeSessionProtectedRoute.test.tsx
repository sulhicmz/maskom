import React from 'react'
import { render, screen } from '@testing-library/react'
import CollaborativeSessionProtectedRoute from '@/components/collaboration/CollaborativeSessionProtectedRoute'

describe('CollaborativeSessionProtectedRoute', () => {
  const mockChildren = <div>Protected Content</div>

  describe('Authorization', () => {
    it('should render children when user has EDIT_CONTENT permission', () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom Fallback</div>

      render(
        <CollaborativeSessionProtectedRoute fallback={customFallback}>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
    })
  })

  describe('Unauthorized Access', () => {
    it('should display unauthorized message when user lacks permission', () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      const unauthorizedMessage = screen.getByText('Akses Ditolak')
      expect(unauthorizedMessage).toBeInTheDocument()
    })

    it('should display explanation text for unauthorized access', () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      const explanationText = screen.getByText(/Anda tidak memiliki izin untuk bergabung ke sesi kolaborasi/)
      expect(explanationText).toBeInTheDocument()
    })

    it('should mention Editor and Administrator roles', () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      const roleText = screen.getByText(/Hanya Pengguna dengan peran Editor atau Administrator/)
      expect(roleText).toBeInTheDocument()
    })

    it('should display back button', () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      const backButton = screen.getByText(/Kembali/)
      expect(backButton).toBeInTheDocument()
    })

    it('should display lock icon', () => {
      const { container } = render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      const lockIcon = container.querySelector('.bi-shield-lock')
      expect(lockIcon).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Akses Ditolak')
    })

    it('should have descriptive paragraph text', () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      const paragraphs = screen.getAllByRole('paragraph')
      expect(paragraphs.length).toBeGreaterThan(0)
    })

    it('should have accessible button with clear label', () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      const backButton = screen.getByRole('button')
      expect(backButton).toBeInTheDocument()
      expect(backButton).toHaveAccessibleName(/Kembali/)
    })
  })

  describe('Fallback Rendering', () => {
    it('should not render fallback when authorized', () => {
      const customFallback = <div>Custom Fallback</div>

      render(
        <CollaborativeSessionProtectedRoute fallback={customFallback}>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByText('Custom Fallback')).not.toBeInTheDocument()
    })

    it('should render fallback when unauthorized', () => {
      const customFallback = <div>Custom Unauthorized Fallback</div>

      render(
        <CollaborativeSessionProtectedRoute fallback={customFallback}>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      expect(screen.getByText('Custom Unauthorized Fallback')).toBeInTheDocument()
    })

    it('should render default fallback when not provided and unauthorized', () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      expect(screen.getByText('Akses Ditolak')).toBeInTheDocument()
    })
  })
})
