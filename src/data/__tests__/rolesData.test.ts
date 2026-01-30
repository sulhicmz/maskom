import {
  ROLE_PERMISSIONS,
  getPermissionsByRole,
  hasPermission as checkPermission,
  hasAnyPermission,
  hasAllPermissions,
  canRoleAccessRoute
} from '@/data/rolesData'
import { UserRole } from '@/types/role'
import { Permission } from '@/types/permission'

describe('Roles Data', () => {
  describe('ROLE_PERMISSIONS', () => {
    it('should have permissions for admin role', () => {
      const adminPermissions = ROLE_PERMISSIONS.find(r => r.role === 'admin')

      expect(adminPermissions).toBeDefined()
      expect(adminPermissions?.permissions).toHaveLength(11)
      expect(adminPermissions?.permissions).toContain(Permission.VIEW_ANALYTICS)
      expect(adminPermissions?.permissions).toContain(Permission.MANAGE_ANALYTICS)
      expect(adminPermissions?.permissions).toContain(Permission.MANAGE_USERS)
      expect(adminPermissions?.permissions).toContain(Permission.MANAGE_ROLES)
      expect(adminPermissions?.permissions).toContain(Permission.MANAGE_SETTINGS)
      expect(adminPermissions?.permissions).toContain(Permission.VIEW_QA)
    })

    it('should have permissions for editor role', () => {
      const editorPermissions = ROLE_PERMISSIONS.find(r => r.role === 'editor')
      
      expect(editorPermissions).toBeDefined()
      expect(editorPermissions?.permissions).toHaveLength(5)
      expect(editorPermissions?.permissions).toContain(Permission.MANAGE_CONTENT)
      expect(editorPermissions?.permissions).toContain(Permission.PUBLISH_CONTENT)
      expect(editorPermissions?.permissions).toContain(Permission.EDIT_CONTENT)
      expect(editorPermissions?.permissions).toContain(Permission.DELETE_CONTENT)
      expect(editorPermissions?.permissions).toContain(Permission.VIEW_QA)
    })

    it('should have permissions for user role', () => {
      const userPermissions = ROLE_PERMISSIONS.find(r => r.role === 'user')

      expect(userPermissions).toBeDefined()
      expect(userPermissions?.permissions).toHaveLength(1)
      expect(userPermissions?.permissions).toContain(Permission.EDIT_CONTENT)
    })
  })

  describe('getPermissionsByRole', () => {
    it('should return all permissions for admin', () => {
      const permissions = getPermissionsByRole('admin')

      expect(permissions).toHaveLength(11)
      expect(permissions).toContain(Permission.VIEW_ANALYTICS)
      expect(permissions).toContain(Permission.MANAGE_ANALYTICS)
      expect(permissions).toContain(Permission.MANAGE_USERS)
      expect(permissions).toContain(Permission.VIEW_ADMIN_DASHBOARD)
    })

    it('should return content permissions for editor', () => {
      const permissions = getPermissionsByRole('editor')
      
      expect(permissions).toHaveLength(5)
      expect(permissions).toContain(Permission.MANAGE_CONTENT)
      expect(permissions).not.toContain(Permission.VIEW_ANALYTICS)
      expect(permissions).not.toContain(Permission.MANAGE_USERS)
    })

    it('should return basic permissions for user', () => {
      const permissions = getPermissionsByRole('user')

      expect(permissions).toHaveLength(1)
      expect(permissions).toContain(Permission.EDIT_CONTENT)
      expect(permissions).not.toContain(Permission.VIEW_ANALYTICS)
    })

    it('should return empty array for unknown role', () => {
      const permissions = getPermissionsByRole('unknown' as UserRole)

      expect(permissions).toHaveLength(0)
    })
  })

  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      expect(checkPermission('admin', Permission.VIEW_ANALYTICS)).toBe(true)
      expect(checkPermission('admin', Permission.MANAGE_USERS)).toBe(true)
      expect(checkPermission('admin', Permission.MANAGE_SETTINGS)).toBe(true)
    })

    it('should return true for editor with content permissions', () => {
      expect(checkPermission('editor', Permission.MANAGE_CONTENT)).toBe(true)
      expect(checkPermission('editor', Permission.EDIT_CONTENT)).toBe(true)
      expect(checkPermission('editor', Permission.DELETE_CONTENT)).toBe(true)
    })

    it('should return false for editor with admin permissions', () => {
      expect(checkPermission('editor', Permission.VIEW_ANALYTICS)).toBe(false)
      expect(checkPermission('editor', Permission.MANAGE_USERS)).toBe(false)
      expect(checkPermission('editor', Permission.MANAGE_SETTINGS)).toBe(false)
    })

    it('should return true for user with EDIT_CONTENT', () => {
      expect(checkPermission('user', Permission.EDIT_CONTENT)).toBe(true)
    })

    it('should return false for user with other permissions', () => {
      expect(checkPermission('user', Permission.VIEW_ANALYTICS)).toBe(false)
      expect(checkPermission('user', Permission.MANAGE_CONTENT)).toBe(false)
      expect(checkPermission('user', Permission.PUBLISH_CONTENT)).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('should return true for admin with any permissions', () => {
      const result = hasAnyPermission('admin', [
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_USERS
      ])
      expect(result).toBe(true)
    })

    it('should return true for editor with matching content permissions', () => {
      const result = hasAnyPermission('editor', [
        Permission.VIEW_ANALYTICS,
        Permission.EDIT_CONTENT
      ])
      expect(result).toBe(true)
    })

    it('should return false for editor with only admin permissions', () => {
      const result = hasAnyPermission('editor', [
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_USERS
      ])
      expect(result).toBe(false)
    })

    it('should return false for user with no matching permissions', () => {
      const result = hasAnyPermission('user', [
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_CONTENT
      ])
      expect(result).toBe(false)
    })

    it('should return false for empty permissions array', () => {
      const result = hasAnyPermission('admin', [])
      expect(result).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('should return true for admin with all requested permissions', () => {
      const result = hasAllPermissions('admin', [
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_USERS,
        Permission.MANAGE_SETTINGS
      ])
      expect(result).toBe(true)
    })

    it('should return true for editor with content permissions', () => {
      const result = hasAllPermissions('editor', [
        Permission.MANAGE_CONTENT,
        Permission.EDIT_CONTENT
      ])
      expect(result).toBe(true)
    })

    it('should return false for editor with admin permissions included', () => {
      const result = hasAllPermissions('editor', [
        Permission.MANAGE_CONTENT,
        Permission.VIEW_ANALYTICS
      ])
      expect(result).toBe(false)
    })

    it('should return true for empty permissions array', () => {
      const result = hasAllPermissions('user', [])
      expect(result).toBe(true)
    })
  })

  describe('canRoleAccessRoute', () => {
    it('should allow admin to access /admin/analytics', () => {
      expect(canRoleAccessRoute('admin', '/admin/analytics')).toBe(true)
    })

    it('should allow editor to access /admin/analytics', () => {
      expect(canRoleAccessRoute('editor', '/admin/analytics')).toBe(false)
    })

    it('should allow user to access /admin/analytics', () => {
      expect(canRoleAccessRoute('user', '/admin/analytics')).toBe(false)
    })

    it('should allow admin to access /admin/users', () => {
      expect(canRoleAccessRoute('admin', '/admin/users')).toBe(true)
    })

    it('should not allow editor to access /admin/users', () => {
      expect(canRoleAccessRoute('editor', '/admin/users')).toBe(false)
    })

    it('should allow admin to access /admin/settings', () => {
      expect(canRoleAccessRoute('admin', '/admin/settings')).toBe(true)
    })

    it('should not allow user to access /admin/settings', () => {
      expect(canRoleAccessRoute('user', '/admin/settings')).toBe(false)
    })

    it('should allow admin to access /admin', () => {
      expect(canRoleAccessRoute('admin', '/admin')).toBe(true)
    })

    it('should not allow editor to access /admin', () => {
      expect(canRoleAccessRoute('editor', '/admin')).toBe(false)
    })

    it('should allow admin to access /dashboard', () => {
      expect(canRoleAccessRoute('admin', '/dashboard')).toBe(true)
    })

    it('should not allow editor to access /dashboard', () => {
      expect(canRoleAccessRoute('editor', '/dashboard')).toBe(false)
    })

    it('should not allow user to access /dashboard', () => {
      expect(canRoleAccessRoute('user', '/dashboard')).toBe(false)
    })

    it('should allow access to unprotected routes for all roles', () => {
      expect(canRoleAccessRoute('admin', '/')).toBe(true)
      expect(canRoleAccessRoute('editor', '/')).toBe(true)
      expect(canRoleAccessRoute('user', '/')).toBe(true)

      expect(canRoleAccessRoute('admin', '/about')).toBe(true)
      expect(canRoleAccessRoute('editor', '/about')).toBe(true)
      expect(canRoleAccessRoute('user', '/about')).toBe(true)
    })

    it('should return false for undefined route with permissions', () => {
      expect(canRoleAccessRoute('admin', '/unknown-route')).toBe(true)
      expect(canRoleAccessRoute('user', '/unknown-route')).toBe(true)
    })
  })
})
