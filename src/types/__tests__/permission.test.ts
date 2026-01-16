import {
  Permission,
  PERMISSION_CONFIGS,
  getPermissionConfig,
  isValidPermission
} from '@/types/permission'

describe('Permission Types', () => {
  describe('Permission enum', () => {
    it('should have all required permissions', () => {
      expect(Permission.VIEW_ANALYTICS).toBe('view_analytics')
      expect(Permission.MANAGE_USERS).toBe('manage_users')
      expect(Permission.MANAGE_ROLES).toBe('manage_roles')
      expect(Permission.MANAGE_CONTENT).toBe('manage_content')
      expect(Permission.PUBLISH_CONTENT).toBe('publish_content')
      expect(Permission.EDIT_CONTENT).toBe('edit_content')
      expect(Permission.DELETE_CONTENT).toBe('delete_content')
      expect(Permission.VIEW_ADMIN_DASHBOARD).toBe('view_admin_dashboard')
      expect(Permission.MANAGE_SETTINGS).toBe('manage_settings')
    })

    it('should have 9 permissions total', () => {
      const permissions = Object.values(Permission)
      expect(permissions).toHaveLength(9)
    })
  })

  describe('PERMISSION_CONFIGS', () => {
    it('should have config for VIEW_ANALYTICS', () => {
      const config = PERMISSION_CONFIGS[Permission.VIEW_ANALYTICS]

      expect(config).toBeDefined()
      expect(config.id).toBe(Permission.VIEW_ANALYTICS)
      expect(config.name).toBe('View Analytics')
      expect(config.description).toBe('Access analytics dashboard and reports')
      expect(config.category).toBe('analytics')
    })

    it('should have config for MANAGE_USERS', () => {
      const config = PERMISSION_CONFIGS[Permission.MANAGE_USERS]

      expect(config).toBeDefined()
      expect(config.id).toBe(Permission.MANAGE_USERS)
      expect(config.category).toBe('users')
    })

    it('should have config for MANAGE_ROLES', () => {
      const config = PERMISSION_CONFIGS[Permission.MANAGE_ROLES]

      expect(config).toBeDefined()
      expect(config.id).toBe(Permission.MANAGE_ROLES)
      expect(config.category).toBe('users')
    })

    it('should have config for content management permissions', () => {
      const contentPermissions = [
        Permission.MANAGE_CONTENT,
        Permission.PUBLISH_CONTENT,
        Permission.EDIT_CONTENT,
        Permission.DELETE_CONTENT
      ]

      contentPermissions.forEach(permission => {
        const config = PERMISSION_CONFIGS[permission]
        expect(config).toBeDefined()
        expect(config.category).toBe('content')
      })
    })

    it('should have config for admin permissions', () => {
      const adminPermissions = [
        Permission.VIEW_ADMIN_DASHBOARD,
        Permission.MANAGE_SETTINGS
      ]

      adminPermissions.forEach(permission => {
        const config = PERMISSION_CONFIGS[permission]
        expect(config).toBeDefined()
        expect(config.category).toBe('admin')
      })
    })
  })

  describe('getPermissionConfig', () => {
    it('should return config for VIEW_ANALYTICS', () => {
      const config = getPermissionConfig(Permission.VIEW_ANALYTICS)

      expect(config).toEqual(PERMISSION_CONFIGS[Permission.VIEW_ANALYTICS])
    })

    it('should return config for MANAGE_CONTENT', () => {
      const config = getPermissionConfig(Permission.MANAGE_CONTENT)

      expect(config).toEqual(PERMISSION_CONFIGS[Permission.MANAGE_CONTENT])
    })

    it('should return config for VIEW_ADMIN_DASHBOARD', () => {
      const config = getPermissionConfig(Permission.VIEW_ADMIN_DASHBOARD)

      expect(config).toEqual(PERMISSION_CONFIGS[Permission.VIEW_ADMIN_DASHBOARD])
    })
  })

  describe('isValidPermission', () => {
    it('should return true for all valid permissions', () => {
      Object.values(Permission).forEach(permission => {
        expect(isValidPermission(permission)).toBe(true)
      })
    })

    it('should return false for invalid permissions', () => {
      expect(isValidPermission('invalid_permission')).toBe(false)
      expect(isValidPermission('')).toBe(false)
      expect(isValidPermission('view_analytics ')).toBe(false)
    })

    it('should narrow type when true', () => {
      const permission = 'view_analytics' as string

      if (isValidPermission(permission)) {
        const validPermission: Permission = permission
        expect(validPermission).toBe('view_analytics')
      }
    })
  })
})
