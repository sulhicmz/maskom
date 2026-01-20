import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import CollaborativeSessionProtectedRoute from '@/components/collaboration/CollaborativeSessionProtectedRoute'
import authService from '@/services/auth/AuthService'
import { getUnauthorizedRedirectPath } from '@/utils/rbac'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('@/services/auth/AuthService', () => ({
  __esModule: true,
  default: {
    getCurrentUser: jest.fn(),
    hasRole: jest.fn(),
    hasPermission: jest.fn(() => Promise.resolve(true)),
    getMFAStatus: jest.fn(() => Promise.resolve('disabled')),
  },
}))

jest.mock('@/utils/rbac', () => ({
  canAccessRoute: jest.fn(),
  canPerformAction: jest.fn(),
  getUnauthorizedRedirectPath: jest.fn(() => '/unauthorized'),
}))

describe.skip('CollaborativeSessionProtectedRoute', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  const mockChildren = <div>Protected Content</div>

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePathname as jest.Mock).mockReturnValue('/test')
    ;(authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'editor' as const,
      mfaEnabled: false,
    })
    ;(authService.hasPermission as jest.Mock).mockResolvedValue(true)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Authorization', () => {
    it('should render children when user has EDIT_CONTENT permission', async () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('should render custom fallback when provided', async () => {
      const customFallback = <div>Custom Fallback</div>

      render(
        <CollaborativeSessionProtectedRoute fallback={customFallback}>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
      })
    })
  })

  describe('Unauthorized Access', () => {
    beforeEach(() => {
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(false)
    })

    it('should display unauthorized message when user lacks permission', async () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        const unauthorizedMessage = screen.getByText('Akses Ditolak')
        expect(unauthorizedMessage).toBeInTheDocument()
      })
    })

    it('should display explanation text for unauthorized access', async () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        const explanationText = screen.getByText(/Anda tidak memiliki izin untuk bergabung ke sesi kolaborasi/)
        expect(explanationText).toBeInTheDocument()
      })
    })

    it('should mention Editor and Administrator roles', async () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        const roleText = screen.getByText(/Hanya Pengguna dengan peran Editor atau Administrator/)
        expect(roleText).toBeInTheDocument()
      })
    })

    it('should display back button', async () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        const backButton = screen.getByText(/Kembali/)
        expect(backButton).toBeInTheDocument()
      })
    })

    it('should display lock icon', async () => {
      const { container } = render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        const lockIcon = container.querySelector('.bi-shield-lock')
        expect(lockIcon).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(false)
    })

    it('should have proper heading hierarchy', async () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 3 })
        expect(heading).toHaveTextContent('Akses Ditolak')
      })
    })

    it('should have descriptive paragraph text', async () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        const paragraphs = screen.getAllByRole('paragraph')
        expect(paragraphs.length).toBeGreaterThan(0)
      })
    })

    it('should have accessible button with clear label', async () => {
      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        const backButton = screen.getByRole('button')
        expect(backButton).toBeInTheDocument()
        expect(backButton).toHaveAccessibleName(/Kembali/)
      })
    })
  })

  describe('Fallback Rendering', () => {
    it('should not render fallback when authorized', async () => {
      const customFallback = <div>Custom Fallback</div>

      render(
        <CollaborativeSessionProtectedRoute fallback={customFallback}>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
        expect(screen.queryByText('Custom Fallback')).not.toBeInTheDocument()
      })
    })

    it('should render fallback when unauthorized', async () => {
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(false)
      const customFallback = <div>Custom Unauthorized Fallback</div>

      render(
        <CollaborativeSessionProtectedRoute fallback={customFallback}>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Custom Unauthorized Fallback')).toBeInTheDocument()
      })
    })

    it('should render default fallback when not provided and unauthorized', async () => {
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(false)

      render(
        <CollaborativeSessionProtectedRoute>
          {mockChildren}
        </CollaborativeSessionProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Akses Ditolak')).toBeInTheDocument()
      })
    })
  })
})
