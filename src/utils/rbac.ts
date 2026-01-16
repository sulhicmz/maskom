import { UserRole } from '@/types/role'
import { Permission } from '@/types/permission'
import { getPermissionsByRole, hasPermission as checkPermission } from '@/data/rolesData'

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  if (!userRole) {
    return false
  }

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

  const userPermissions = getPermissionsByRole(userRole)
  return requiredPermissions.some(p => userPermissions.includes(p))
}

export function canPerformAction(userRole: UserRole, action: Permission): boolean {
  if (!userRole || !action) {
    return false
  }

  return checkPermission(userRole, action)
}

export function canPerformAnyAction(userRole: UserRole, actions: Permission[]): boolean {
  if (!userRole || !actions || actions.length === 0) {
    return false
  }

  return actions.some(action => canPerformAction(userRole, action))
}

export function canPerformAllActions(userRole: UserRole, actions: Permission[]): boolean {
  if (!userRole || !actions) {
    return false
  }

  if (actions.length === 0) {
    return true
  }

  return actions.every(action => canPerformAction(userRole, action))
}

export function requireRole(requiredRole: UserRole): (userRole: UserRole) => boolean {
  return (userRole: UserRole) => {
    if (!userRole) {
      return false
    }

    if (userRole === 'admin') {
      return true
    }

    return userRole === requiredRole
  }
}

export function requirePermission(requiredPermission: Permission): (userRole: UserRole) => boolean {
  return (userRole: UserRole) => {
    if (!userRole) {
      return false
    }

    return checkPermission(userRole, requiredPermission)
  }
}

export function requireAnyPermission(requiredPermissions: Permission[]): (userRole: UserRole) => boolean {
  return (userRole: UserRole) => {
    if (!userRole || !requiredPermissions || requiredPermissions.length === 0) {
      return false
    }

    return canPerformAnyAction(userRole, requiredPermissions)
  }
}

export function requireAllPermissions(requiredPermissions: Permission[]): (userRole: UserRole) => boolean {
  return (userRole: UserRole) => {
    if (!userRole || !requiredPermissions || requiredPermissions.length === 0) {
      return false
    }

    return canPerformAllActions(userRole, requiredPermissions)
  }
}

export function getUnauthorizedRedirectPath(userRole: UserRole | null): string {
  if (!userRole) {
    return '/login'
  }

  if (userRole === 'user' || userRole === 'editor') {
    return '/dashboard'
  }

  return '/dashboard'
}
