import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import ProtectedRoute from '../ProtectedRoute'
import { Permission } from '@/types/permission'
import authService from '@/services/auth/AuthService'
import { getUnauthorizedRedirectPath } from '@/utils/rbac'

type UserRole = 'admin' | 'editor' | 'user'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('@/services/auth/AuthService', () => ({
  __esModule: true,
  default: {
    getCurrentUser: jest.fn(),
    hasRole: jest.fn(),
    hasPermission: jest.fn(),
    getMFAStatus: jest.fn(),
  },
}))

jest.mock('@/utils/rbac', () => ({
  canAccessRoute: jest.fn(),
  canPerformAction: jest.fn(),
  getUnauthorizedRedirectPath: jest.fn(),
}))

jest.mock('@/components/ui/LoadingSpinner', () => {
  return function MockLoadingSpinner({ minHeight }: { minHeight: number }) {
    return <div data-testid="loading-spinner" data-min-height={minHeight}>Loading...</div>
  }
})

describe('ProtectedRoute', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as UserRole,
    mfaEnabled: false,
  }

  const mockAdminUser = {
    id: 'admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as UserRole,
    mfaEnabled: false,
  }

  const mockEditorUser = {
    id: 'editor-123',
    email: 'editor@example.com',
    name: 'Editor User',
    role: 'editor' as UserRole,
    mfaEnabled: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePathname as jest.Mock).mockReturnValue('/protected-page')
    ;(authService.getMFAStatus as jest.Mock).mockResolvedValue('disabled')
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Authentication Flow', () => {
    it('should show loading spinner initially', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should redirect to /login when user is not authenticated', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(null)

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })

    it('should render children when user is authenticated', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('should render fallback when user is not authenticated and fallback is provided', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(null)
      const fallback = <div data-testid="access-denied">Access Denied</div>

      render(
        <ProtectedRoute fallback={fallback}>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByTestId('access-denied')).toBeInTheDocument()
      })
    })

    it('should handle authentication errors gracefully', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Auth failed'))

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Role-Based Access Control', () => {
    it('should allow access when user has required role', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(authService.hasRole as jest.Mock).mockResolvedValue(true)

      render(
        <ProtectedRoute requiredRole={'admin'}>
          <div>Admin Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Content')).toBeInTheDocument()
      })
    })

    it('should deny access when user does not have required role', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(authService.hasRole as jest.Mock).mockResolvedValue(false)

      render(
        <ProtectedRoute requiredRole={'admin'}>
          <div>Admin Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
      })
    })

    it('should redirect to dashboard when user lacks required role', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(authService.hasRole as jest.Mock).mockResolvedValue(false)
      ;(getUnauthorizedRedirectPath as jest.Mock).mockReturnValue('/dashboard')

      render(
        <ProtectedRoute requiredRole={'admin'}>
          <div>Admin Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should allow admin user to access admin-protected route', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(authService.hasRole as jest.Mock).mockResolvedValue(true)

      render(
        <ProtectedRoute requiredRole={'admin'}>
          <div>Admin Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Content')).toBeInTheDocument()
      })
    })

    it('should allow editor user to access editor-protected route', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockEditorUser)
      ;(authService.hasRole as jest.Mock).mockResolvedValue(true)

      render(
        <ProtectedRoute requiredRole={'editor'}>
          <div>Editor Dashboard</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Editor Dashboard')).toBeInTheDocument()
      })
    })

    it('should deny admin user access to user-only route if configured', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(authService.hasRole as jest.Mock).mockResolvedValue(false)

      render(
        <ProtectedRoute requiredRole={'user'}>
          <div>User Dashboard</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByText('User Dashboard')).not.toBeInTheDocument()
      })
    })
  })

  describe('Permission-Based Access Control', () => {
    it('should allow access when user has required permission', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(true)

      render(
        <ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
          <div>Analytics Dashboard</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      })
    })

    it('should deny access when user lacks required permission', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(false)

      render(
        <ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
          <div>Analytics Dashboard</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByText('Analytics Dashboard')).not.toBeInTheDocument()
      })
    })

    it('should redirect to dashboard when user lacks required permission', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(false)
      ;(getUnauthorizedRedirectPath as jest.Mock).mockReturnValue('/dashboard')

      render(
        <ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
          <div>Analytics Dashboard</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should allow editor to access content management with correct permission', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockEditorUser)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(true)

      render(
        <ProtectedRoute requiredPermission={Permission.EDIT_CONTENT}>
          <div>Content Editor</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Content Editor')).toBeInTheDocument()
      })
    })

    it('should deny user access to admin-specific permissions', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(false)

      render(
        <ProtectedRoute requiredPermission={Permission.MANAGE_USERS}>
          <div>User Management</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByText('User Management')).not.toBeInTheDocument()
      })
    })
  })

  describe('Multiple Permissions', () => {
    it('should allow access when user has all required permissions', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(true)

      render(
        <ProtectedRoute requiredPermissions={[Permission.MANAGE_CONTENT, Permission.PUBLISH_CONTENT]}>
          <div>Content Manager</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Content Manager')).toBeInTheDocument()
      })
    })

    it('should deny access when user lacks one of required permissions', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockEditorUser)
      ;(authService.hasPermission as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)

      render(
        <ProtectedRoute requiredPermissions={[Permission.MANAGE_CONTENT, Permission.MANAGE_USERS]}>
          <div>Advanced Manager</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByText('Advanced Manager')).not.toBeInTheDocument()
      })
    })

    it('should deny access when user lacks all required permissions', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(false)

      render(
        <ProtectedRoute requiredPermissions={[Permission.MANAGE_USERS, Permission.MANAGE_ROLES]}>
          <div>User Management</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByText('User Management')).not.toBeInTheDocument()
      })
    })

    it('should check all required permissions', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(true)

      render(
        <ProtectedRoute requiredPermissions={[Permission.EDIT_CONTENT, Permission.DELETE_CONTENT, Permission.PUBLISH_CONTENT]}>
          <div>Full Content Access</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(authService.hasPermission).toHaveBeenCalledTimes(3)
        expect(screen.getByText('Full Content Access')).toBeInTheDocument()
      })
    })

    it('should handle empty requiredPermissions array as no requirement', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      render(
        <ProtectedRoute requiredPermissions={[]}>
          <div>Public Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Public Content')).toBeInTheDocument()
      })
    })
  })

  describe('Route-Based Access Control', () => {
    it('should allow access when route is unprotected', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(usePathname as jest.Mock).mockReturnValue('/public-page')

      render(
        <ProtectedRoute>
          <div>Public Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Public Content')).toBeInTheDocument()
      })
    })

    it('should allow admin to access admin route', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(usePathname as jest.Mock).mockReturnValue('/admin/analytics')

      render(
        <ProtectedRoute>
          <div>Admin Analytics</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Analytics')).toBeInTheDocument()
      })
    })

    it('should deny user access to admin route', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(usePathname as jest.Mock).mockReturnValue('/admin/analytics')

      render(
        <ProtectedRoute>
          <div>Admin Analytics</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByText('Admin Analytics')).not.toBeInTheDocument()
      })
    })
  })

  describe('Combined Access Control', () => {
    it('should check both role and permission when both are specified', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(authService.hasRole as jest.Mock).mockResolvedValue(true)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(true)

      render(
        <ProtectedRoute requiredRole={'admin'} requiredPermission={Permission.VIEW_ANALYTICS}>
          <div>Admin Analytics</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(authService.hasRole).toHaveBeenCalledWith('admin')
        expect(authService.hasPermission).toHaveBeenCalledWith(Permission.VIEW_ANALYTICS)
        expect(screen.getByText('Admin Analytics')).toBeInTheDocument()
      })
    })

    it('should deny access when role check fails but permission check passes', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)
      ;(authService.hasRole as jest.Mock).mockResolvedValue(false)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(true)

      render(
        <ProtectedRoute requiredRole={'admin'} requiredPermission={Permission.EDIT_CONTENT}>
          <div>Restricted Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByText('Restricted Content')).not.toBeInTheDocument()
      })
    })

    it('should deny access when permission check fails but role check passes', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockEditorUser)
      ;(authService.hasRole as jest.Mock).mockResolvedValue(true)
      ;(authService.hasPermission as jest.Mock).mockResolvedValue(false)

      render(
        <ProtectedRoute requiredRole={'editor'} requiredPermission={Permission.MANAGE_USERS}>
          <div>Restricted Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByText('Restricted Content')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle slow authentication response', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve(mockUser), 1000)
          })
      )

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should render children with multiple components', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      render(
        <ProtectedRoute>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.getByTestId('child-1')).toBeInTheDocument()
        expect(screen.getByTestId('child-2')).toBeInTheDocument()
        expect(screen.getByTestId('child-3')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should redirect to login on authentication error', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })

    it('should not render children on authentication error', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Auth error'))

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      })
    })

    it('should handle role check errors', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(authService.hasRole as jest.Mock).mockRejectedValue(new Error('Role check failed'))

      render(
        <ProtectedRoute requiredRole={'admin'}>
          <div>Admin Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })

    it('should handle permission check errors', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockAdminUser)
      ;(authService.hasPermission as jest.Mock).mockRejectedValue(new Error('Permission check failed'))

      render(
        <ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
          <div>Analytics Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Loading State', () => {
    it('should show LoadingSpinner with correct minHeight', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveAttribute('data-min-height', '200')
    })

    it('should hide loading spinner after authentication completes', async () => {
      ;(authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })
  })
})
