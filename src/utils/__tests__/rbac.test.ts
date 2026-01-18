import {
  canAccessRoute,
  canPerformAction,
  canPerformAnyAction,
  canPerformAllActions,
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  getUnauthorizedRedirectPath
} from '@/utils/rbac'
import { Permission } from '@/types/permission'

describe('RBAC Utilities', () => {
  describe('canAccessRoute', () => {
    it('should allow admin to access all admin routes', () => {
      expect(canAccessRoute('admin', '/admin/analytics')).toBe(true)
      expect(canAccessRoute('admin', '/admin/users')).toBe(true)
      expect(canAccessRoute('admin', '/admin/roles')).toBe(true)
      expect(canAccessRoute('admin', '/admin/settings')).toBe(true)
      expect(canAccessRoute('admin', '/admin')).toBe(true)
      expect(canAccessRoute('admin', '/dashboard')).toBe(true)
    })

    it('should not allow editor to access admin analytics', () => {
      expect(canAccessRoute('editor', '/admin/analytics')).toBe(false)
    })

    it('should not allow user to access admin routes', () => {
      expect(canAccessRoute('user', '/admin/analytics')).toBe(false)
      expect(canAccessRoute('user', '/admin/users')).toBe(false)
      expect(canAccessRoute('user', '/admin/settings')).toBe(false)
    })

    it('should allow access to unprotected routes for all roles', () => {
      expect(canAccessRoute('admin', '/')).toBe(true)
      expect(canAccessRoute('editor', '/')).toBe(true)
      expect(canAccessRoute('user', '/')).toBe(true)
    })

    it('should return false for null role', () => {
       
      expect(canAccessRoute(null as any, '/admin/analytics')).toBe(false)
    })
  })

  describe('canPerformAction', () => {
    it('should allow admin to perform any action', () => {
      Object.values(Permission).forEach(permission => {
        expect(canPerformAction('admin', permission)).toBe(true)
      })
    })

    it('should allow editor to perform content actions', () => {
      expect(canPerformAction('editor', Permission.MANAGE_CONTENT)).toBe(true)
      expect(canPerformAction('editor', Permission.EDIT_CONTENT)).toBe(true)
      expect(canPerformAction('editor', Permission.DELETE_CONTENT)).toBe(true)
    })

    it('should not allow editor to perform admin actions', () => {
      expect(canPerformAction('editor', Permission.VIEW_ANALYTICS)).toBe(false)
      expect(canPerformAction('editor', Permission.MANAGE_USERS)).toBe(false)
      expect(canPerformAction('editor', Permission.MANAGE_SETTINGS)).toBe(false)
    })

    it('should allow user to perform basic actions', () => {
      expect(canPerformAction('user', Permission.EDIT_CONTENT)).toBe(true)
    })

    it('should not allow user to perform other actions', () => {
      expect(canPerformAction('user', Permission.VIEW_ANALYTICS)).toBe(false)
      expect(canPerformAction('user', Permission.MANAGE_CONTENT)).toBe(false)
    })

    it('should return false for null role', () => {
       
      expect(canPerformAction(null as any, Permission.EDIT_CONTENT)).toBe(false)
    })

    it('should return false for null action', () => {
       
      expect(canPerformAction('admin', null as any)).toBe(false)
    })
  })

  describe('canPerformAnyAction', () => {
    it('should return true for admin with any actions', () => {
      const result = canPerformAnyAction('admin', [
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_USERS
      ])
      expect(result).toBe(true)
    })

    it('should return true for editor with matching content actions', () => {
      const result = canPerformAnyAction('editor', [
        Permission.VIEW_ANALYTICS,
        Permission.EDIT_CONTENT
      ])
      expect(result).toBe(true)
    })

    it('should return false for editor with only admin actions', () => {
      const result = canPerformAnyAction('editor', [
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_USERS
      ])
      expect(result).toBe(false)
    })

    it('should return false for empty actions array', () => {
      const result = canPerformAnyAction('admin', [])
      expect(result).toBe(false)
    })

    it('should return false for null role', () => {
       
      const result = canPerformAnyAction(null as any, [Permission.EDIT_CONTENT])
      expect(result).toBe(false)
    })

    it('should return false for null actions', () => {
       
      const result = canPerformAnyAction('admin', null as any)
      expect(result).toBe(false)
    })
  })

  describe('canPerformAllActions', () => {
    it('should return true for admin with all requested actions', () => {
      const result = canPerformAllActions('admin', [
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_USERS,
        Permission.MANAGE_SETTINGS
      ])
      expect(result).toBe(true)
    })

    it('should return true for editor with content actions', () => {
      const result = canPerformAllActions('editor', [
        Permission.MANAGE_CONTENT,
        Permission.EDIT_CONTENT
      ])
      expect(result).toBe(true)
    })

    it('should return false for editor with admin actions included', () => {
      const result = canPerformAllActions('editor', [
        Permission.MANAGE_CONTENT,
        Permission.VIEW_ANALYTICS
      ])
      expect(result).toBe(false)
    })

    it('should return true for empty actions array', () => {
      const result = canPerformAllActions('user', [])
      expect(result).toBe(true)
    })

    it('should return false for null role', () => {
       
      const result = canPerformAllActions(null as any, [Permission.EDIT_CONTENT])
      expect(result).toBe(false)
    })
  })

  describe('requireRole', () => {
    it('should return function that checks admin role', () => {
      const checkAdmin = requireRole('admin')
      expect(typeof checkAdmin).toBe('function')
      expect(checkAdmin('admin')).toBe(true)
      expect(checkAdmin('editor')).toBe(false)
    })

    it('should return function that checks editor role', () => {
      const checkEditor = requireRole('editor')
      expect(checkEditor('editor')).toBe(true)
      expect(checkEditor('user')).toBe(false)
    })

    it('should allow admin to access any role requirement', () => {
      const checkUser = requireRole('user')
      const checkEditor = requireRole('editor')

      expect(checkUser('admin')).toBe(true)
      expect(checkEditor('admin')).toBe(true)
    })

    it('should return false for null role', () => {
      const checkAdmin = requireRole('admin')
       
      expect(checkAdmin(null as any)).toBe(false)
    })
  })

  describe('requirePermission', () => {
    it('should return function that checks VIEW_ANALYTICS permission', () => {
      const checkViewAnalytics = requirePermission(Permission.VIEW_ANALYTICS)
      expect(typeof checkViewAnalytics).toBe('function')
      expect(checkViewAnalytics('admin')).toBe(true)
      expect(checkViewAnalytics('user')).toBe(false)
    })

    it('should return function that checks MANAGE_CONTENT permission', () => {
      const checkManageContent = requirePermission(Permission.MANAGE_CONTENT)
      expect(checkManageContent('admin')).toBe(true)
      expect(checkManageContent('editor')).toBe(true)
      expect(checkManageContent('user')).toBe(false)
    })

    it('should return false for null role', () => {
      const checkPermission = requirePermission(Permission.EDIT_CONTENT)
       
      expect(checkPermission(null as any)).toBe(false)
    })
  })

  describe('requireAnyPermission', () => {
    it('should return function that checks any of multiple permissions', () => {
      const checkAny = requireAnyPermission([
        Permission.VIEW_ANALYTICS,
        Permission.EDIT_CONTENT
      ])
      expect(checkAny('admin')).toBe(true)
      expect(checkAny('editor')).toBe(true)
      expect(checkAny('user')).toBe(true)
    })

    it('should return false for roles with none of the permissions', () => {
      const checkAny = requireAnyPermission([
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_USERS
      ])
      expect(checkAny('user')).toBe(false)
    })

    it('should return false for null role', () => {
      const checkAny = requireAnyPermission([Permission.EDIT_CONTENT])
       
      expect(checkAny(null as any)).toBe(false)
    })

    it('should return false for empty permissions array', () => {
      const checkAny = requireAnyPermission([])
      expect(checkAny('admin')).toBe(false)
    })
  })

  describe('requireAllPermissions', () => {
    it('should return function that checks all of multiple permissions', () => {
      const checkAll = requireAllPermissions([
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_USERS
      ])
      expect(checkAll('admin')).toBe(true)
      expect(checkAll('editor')).toBe(false)
      expect(checkAll('user')).toBe(false)
    })

    it('should return false for null role', () => {
      const checkAll = requireAllPermissions([Permission.EDIT_CONTENT])
       
      expect(checkAll(null as any)).toBe(false)
    })

    it('should return false for empty permissions array', () => {
      const checkAll = requireAllPermissions([])
      expect(checkAll('admin')).toBe(false)
    })
  })

  describe('getUnauthorizedRedirectPath', () => {
    it('should return /login for null role', () => {
      expect(getUnauthorizedRedirectPath(null)).toBe('/login')
    })

    it('should return /dashboard for user role', () => {
      expect(getUnauthorizedRedirectPath('user')).toBe('/dashboard')
    })

    it('should return /dashboard for editor role', () => {
      expect(getUnauthorizedRedirectPath('editor')).toBe('/dashboard')
    })

    it('should return /dashboard for admin role (when unauthorized)', () => {
      expect(getUnauthorizedRedirectPath('admin')).toBe('/dashboard')
    })
  })
})
