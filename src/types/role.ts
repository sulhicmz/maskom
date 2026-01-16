export type UserRole = 'admin' | 'editor' | 'user'

export interface RoleConfig {
  id: UserRole
  name: string
  description: string
  level: number
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    level: 3
  },
  editor: {
    id: 'editor',
    name: 'Editor',
    description: 'Content management permissions',
    level: 2
  },
  user: {
    id: 'user',
    name: 'User',
    description: 'Basic user permissions',
    level: 1
  }
}

export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIGS[role]
}

export function isValidRole(role: string): role is UserRole {
  return ['admin', 'editor', 'user'].includes(role)
}
