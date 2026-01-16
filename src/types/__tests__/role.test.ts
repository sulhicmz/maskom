import { UserRole, ROLE_CONFIGS, getRoleConfig, isValidRole } from '@/types/role'

describe('Role Types', () => {
  describe('UserRole type', () => {
    it('should accept valid role values', () => {
      const admin: UserRole = 'admin'
      const editor: UserRole = 'editor'
      const user: UserRole = 'user'

      expect(admin).toBe('admin')
      expect(editor).toBe('editor')
      expect(user).toBe('user')
    })
  })

  describe('ROLE_CONFIGS', () => {
    it('should have config for admin role', () => {
      const adminConfig = ROLE_CONFIGS['admin']

      expect(adminConfig).toBeDefined()
      expect(adminConfig.id).toBe('admin')
      expect(adminConfig.name).toBe('Administrator')
      expect(adminConfig.description).toBe('Full system access with all permissions')
      expect(adminConfig.level).toBe(3)
    })

    it('should have config for editor role', () => {
      const editorConfig = ROLE_CONFIGS['editor']

      expect(editorConfig).toBeDefined()
      expect(editorConfig.id).toBe('editor')
      expect(editorConfig.name).toBe('Editor')
      expect(editorConfig.description).toBe('Content management permissions')
      expect(editorConfig.level).toBe(2)
    })

    it('should have config for user role', () => {
      const userConfig = ROLE_CONFIGS['user']

      expect(userConfig).toBeDefined()
      expect(userConfig.id).toBe('user')
      expect(userConfig.name).toBe('User')
      expect(userConfig.description).toBe('Basic user permissions')
      expect(userConfig.level).toBe(1)
    })

    it('should have correct role hierarchy (admin > editor > user)', () => {
      const adminLevel = ROLE_CONFIGS['admin'].level
      const editorLevel = ROLE_CONFIGS['editor'].level
      const userLevel = ROLE_CONFIGS['user'].level

      expect(adminLevel).toBeGreaterThan(editorLevel)
      expect(editorLevel).toBeGreaterThan(userLevel)
    })
  })

  describe('getRoleConfig', () => {
    it('should return config for admin role', () => {
      const config = getRoleConfig('admin')

      expect(config).toEqual(ROLE_CONFIGS['admin'])
    })

    it('should return config for editor role', () => {
      const config = getRoleConfig('editor')

      expect(config).toEqual(ROLE_CONFIGS['editor'])
    })

    it('should return config for user role', () => {
      const config = getRoleConfig('user')

      expect(config).toEqual(ROLE_CONFIGS['user'])
    })
  })

  describe('isValidRole', () => {
    it('should return true for valid roles', () => {
      expect(isValidRole('admin')).toBe(true)
      expect(isValidRole('editor')).toBe(true)
      expect(isValidRole('user')).toBe(true)
    })

    it('should return false for invalid roles', () => {
      expect(isValidRole('superadmin')).toBe(false)
      expect(isValidRole('guest')).toBe(false)
      expect(isValidRole('moderator')).toBe(false)
      expect(isValidRole('')).toBe(false)
      expect(isValidRole('admin ')).toBe(false)
    })

    it('should narrow type when true', () => {
      const role = 'admin' as string

      if (isValidRole(role)) {
        const validRole: UserRole = role
        expect(validRole).toBe('admin')
      }
    })
  })
})
