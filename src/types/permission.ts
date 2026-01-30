export enum Permission {
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_ANALYTICS = 'manage_analytics',
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_CONTENT = 'manage_content',
  PUBLISH_CONTENT = 'publish_content',
  EDIT_CONTENT = 'edit_content',
  DELETE_CONTENT = 'delete_content',
  VIEW_ADMIN_DASHBOARD = 'view_admin_dashboard',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_QA = 'view_qa'
}

export interface PermissionConfig {
  id: Permission
  name: string
  description: string
  category: 'analytics' | 'users' | 'content' | 'admin'
}

export const PERMISSION_CONFIGS: Record<Permission, PermissionConfig> = {
  [Permission.VIEW_ANALYTICS]: {
    id: Permission.VIEW_ANALYTICS,
    name: 'View Analytics',
    description: 'Access analytics dashboard and reports',
    category: 'analytics'
  },
  [Permission.MANAGE_ANALYTICS]: {
    id: Permission.MANAGE_ANALYTICS,
    name: 'Manage Analytics',
    description: 'Full access to manage analytics and reports',
    category: 'analytics'
  },
  [Permission.MANAGE_USERS]: {
    id: Permission.MANAGE_USERS,
    name: 'Manage Users',
    description: 'Create, edit, and delete users',
    category: 'users'
  },
  [Permission.MANAGE_ROLES]: {
    id: Permission.MANAGE_ROLES,
    name: 'Manage Roles',
    description: 'Assign and modify user roles',
    category: 'users'
  },
  [Permission.MANAGE_CONTENT]: {
    id: Permission.MANAGE_CONTENT,
    name: 'Manage Content',
    description: 'Full access to all content management',
    category: 'content'
  },
  [Permission.PUBLISH_CONTENT]: {
    id: Permission.PUBLISH_CONTENT,
    name: 'Publish Content',
    description: 'Publish and schedule content',
    category: 'content'
  },
  [Permission.EDIT_CONTENT]: {
    id: Permission.EDIT_CONTENT,
    name: 'Edit Content',
    description: 'Edit existing content',
    category: 'content'
  },
  [Permission.DELETE_CONTENT]: {
    id: Permission.DELETE_CONTENT,
    name: 'Delete Content',
    description: 'Delete content',
    category: 'content'
  },
  [Permission.VIEW_ADMIN_DASHBOARD]: {
    id: Permission.VIEW_ADMIN_DASHBOARD,
    name: 'View Admin Dashboard',
    description: 'Access admin dashboard',
    category: 'admin'
  },
  [Permission.MANAGE_SETTINGS]: {
    id: Permission.MANAGE_SETTINGS,
    name: 'Manage Settings',
    description: 'Modify system settings',
    category: 'admin'
  },
  [Permission.VIEW_QA]: {
    id: Permission.VIEW_QA,
    name: 'View QA Diagnostics',
    description: 'Access QA diagnostic dashboards',
    category: 'admin'
  }
}

export function getPermissionConfig(permission: Permission): PermissionConfig {
  return PERMISSION_CONFIGS[permission]
}

export function isValidPermission(permission: string): permission is Permission {
  return Object.values(Permission).includes(permission as Permission)
}
