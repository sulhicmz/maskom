import { renderHook, waitFor } from '@testing-library/react'
import { useAuthService } from '../useAuthService'
import { authService } from '@/services/auth'

jest.mock('@/services/auth', () => ({
  authService: {
    getCurrentUser: jest.fn()
  }
}))

describe('useAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Happy Path', () => {
    it('should set user and loading state after successful authentication', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuthService())

      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBe(null)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1)
    })

    it('should handle authenticated user with admin role', async () => {
      const mockAdminUser = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockAdminUser)

      const { result } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockAdminUser)
      expect(result.current.user?.role).toBe('admin')
    })

    it('should handle authenticated user with editor role', async () => {
      const mockEditorUser = {
        id: '2',
        name: 'Editor User',
        email: 'editor@example.com',
        role: 'editor' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockEditorUser)

      const { result } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockEditorUser)
      expect(result.current.user?.role).toBe('editor')
    })

    it('should handle authenticated user with user role', async () => {
      const mockUser = {
        id: '3',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.user?.role).toBe('user')
    })
  })

  describe('Error Path', () => {
    it('should set user to null when authentication fails', async () => {
      jest.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce(new Error('Authentication failed'))

      const { result } = renderHook(() => useAuthService())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
    })

    it('should handle null user from authService', async () => {
      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(null)

      const { result } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
    })

    it('should handle network errors', async () => {
      jest.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
    })

    it('should handle timeout errors', async () => {
      jest.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce(new Error('Request timeout'))

      const { result } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
    })

    it('should handle unknown errors', async () => {
      jest.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce(new Error('Unknown error'))

      const { result } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
    })
  })

  describe('Loading State', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => useAuthService())

      expect(result.current.loading).toBe(true)
    })

    it('should set loading to false after authentication succeeds', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuthService())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.loading).toBe(false)
    })

    it('should set loading to false after authentication fails', async () => {
      jest.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce(new Error('Authentication failed'))

      const { result } = renderHook(() => useAuthService())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.loading).toBe(false)
    })

    it('should set loading to false in finally block regardless of outcome', async () => {
      jest.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce(new Error('Error'))

      const { result } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.user).toBe(null)
    })
  })

  describe('Effect Behavior', () => {
    it('should call getCurrentUser only once on mount', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockUser)

      renderHook(() => useAuthService())

      await waitFor(() => {
        expect(authService.getCurrentUser).toHaveBeenCalledTimes(1)
      })

      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1)
    })

    it('should not call getCurrentUser on re-renders', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockUser)

      const { result, rerender } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      rerender()
      rerender()

      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1)
    })

    it('should handle empty dependency array correctly', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const
      }

      const getCurrentUserSpy = jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockUser)

      const { result, rerender } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      rerender()

      expect(getCurrentUserSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle user with missing fields gracefully', async () => {
      const incompleteUser = {
        id: '1',
        name: '',
        email: '',
        role: 'user' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(incompleteUser)

      const { result } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(incompleteUser)
    })

    it('should handle slow authentication response', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
      )

      const { result } = renderHook(() => useAuthService())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 200 })

      expect(result.current.user).toEqual(mockUser)
    })

    it('should handle multiple rapid hook calls', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser)

      const { result: result1 } = renderHook(() => useAuthService())
      const { result: result2 } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result1.current.loading).toBe(false)
      })

      await waitFor(() => {
        expect(result2.current.loading).toBe(false)
      })

      expect(result1.current.user).toEqual(mockUser)
      expect(result2.current.user).toEqual(mockUser)
    })
  })

  describe('Return Value Structure', () => {
    it('should return object with user and loading properties', () => {
      const { result } = renderHook(() => useAuthService())

      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('loading')
    })

    it('should have user property of type User | null', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuthService())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
    })

    it('should have loading property of type boolean', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const
      }

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuthService())

      expect(typeof result.current.loading).toBe('boolean')

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(typeof result.current.loading).toBe('boolean')
    })
  })
})
