'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { UserRole } from '@/types/role'
import { Permission } from '@/types/permission'
import authService from '@/services/auth/AuthService'
import { canAccessRoute, getUnauthorizedRedirectPath } from '@/utils/rbac'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  fallback?: React.ReactNode
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  requiredPermissions,
  fallback
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      try {
        const user = await authService.getCurrentUser()

        if (!user) {
          setIsAuthenticated(false)
          router.push('/login')
          return
        }

        setIsAuthenticated(true)

        let hasAccess = true

        if (requiredRole) {
          const hasRequiredRole = await authService.hasRole(requiredRole)
          if (!hasRequiredRole) {
            hasAccess = false
          }
        }

        if (requiredPermission) {
          const hasPermission = await authService.hasPermission(requiredPermission)
          if (!hasPermission) {
            hasAccess = false
          }
        }

        if (requiredPermissions && requiredPermissions.length > 0) {
          const hasAllPermissions = await Promise.all(
            requiredPermissions.map(p => authService.hasPermission(p))
          )
          if (!hasAllPermissions.every(p => p)) {
            hasAccess = false
          }
        }

        if (!hasAccess && !requiredRole && !requiredPermission && !requiredPermissions) {
          const canAccess = canAccessRoute(user.role, pathname)
          if (!canAccess) {
            hasAccess = false
          }
        }

        if (!hasAccess) {
          const redirectPath = getUnauthorizedRedirectPath(user.role)
          router.push(redirectPath)
        }
      } catch (error) {
        console.error('Error checking access:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [router, pathname, requiredRole, requiredPermission, requiredPermissions])

  if (isLoading) {
    return <LoadingSpinner minHeight={200} />
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  return <>{children}</>
}
