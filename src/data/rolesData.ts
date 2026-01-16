import { UserRole } from '@/types/role'
import { Permission } from '@/types/permission'

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
}

export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'admin',
    permissions: [
      Permission.VIEW_ANALYTICS,
      Permission.MANAGE_USERS,
      Permission.MANAGE_ROLES,
      Permission.MANAGE_CONTENT,
      Permission.PUBLISH_CONTENT,
      Permission.EDIT_CONTENT,
      Permission.DELETE_CONTENT,
      Permission.VIEW_ADMIN_DASHBOARD,
      Permission.MANAGE_SETTINGS
    ]
  },
  {
    role: 'editor',
    permissions: [
      Permission.MANAGE_CONTENT,
      Permission.PUBLISH_CONTENT,
      Permission.EDIT_CONTENT,
      Permission.DELETE_CONTENT
    ]
  },
  {
    role: 'user',
    permissions: [
      Permission.EDIT_CONTENT
    ]
  }
]

export function getPermissionsByRole(role: UserRole): Permission[] {
  const roleConfig = ROLE_PERMISSIONS.find(r => r.role === role)
  return roleConfig?.permissions || []
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = getPermissionsByRole(role)
  return permissions.includes(permission)
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

export function canRoleAccessRoute(role: UserRole, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    '/admin/analytics': [Permission.VIEW_ANALYTICS, Permission.VIEW_ADMIN_DASHBOARD],
    '/admin/users': [Permission.MANAGE_USERS, Permission.VIEW_ADMIN_DASHBOARD],
    '/admin/roles': [Permission.MANAGE_ROLES, Permission.VIEW_ADMIN_DASHBOARD],
    '/admin/settings': [Permission.MANAGE_SETTINGS, Permission.VIEW_ADMIN_DASHBOARD],
    '/admin': [Permission.VIEW_ADMIN_DASHBOARD],
    '/dashboard': [Permission.VIEW_ANALYTICS]
  }

  const requiredPermissions = routePermissions[route]
  if (!requiredPermissions) {
    return true
  }

  return hasAnyPermission(role, requiredPermissions)
}
