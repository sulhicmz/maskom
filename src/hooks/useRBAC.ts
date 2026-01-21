import { useEffect, useState } from 'react';
import { authService } from '@/services/auth/AuthService';
import { User, UserRole } from '@/types';
import { Permission } from '@/types/permission';

export interface RBACContextType {
  currentUser: User | null;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  loading: boolean;
}

export const useRBAC = (): RBACContextType => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load current user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) {
      return false;
    }

    // Simple permission check based on roles
    const rolePermissions: Record<UserRole, Permission[]> = {
      admin: [
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_USERS,
        Permission.MANAGE_ROLES,
        Permission.MANAGE_CONTENT,
        Permission.PUBLISH_CONTENT,
        Permission.EDIT_CONTENT,
        Permission.DELETE_CONTENT,
        Permission.VIEW_ADMIN_DASHBOARD,
        Permission.MANAGE_SETTINGS,
        Permission.VIEW_QA,
      ],
      editor: [
        Permission.MANAGE_CONTENT,
        Permission.PUBLISH_CONTENT,
        Permission.EDIT_CONTENT,
        Permission.DELETE_CONTENT,
        Permission.VIEW_QA,
      ],
      user: [
        Permission.EDIT_CONTENT,
      ],
    };

    const userPermissions = rolePermissions[currentUser.role] || [];
    return userPermissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return currentUser?.role === role;
  };

  const isAdmin = (): boolean => {
    return currentUser?.role === 'admin';
  };

  const isEditor = (): boolean => {
    return currentUser?.role === 'editor';
  };

  return {
    currentUser,
    hasPermission,
    hasRole,
    isAdmin,
    isEditor,
    loading,
  };
};
