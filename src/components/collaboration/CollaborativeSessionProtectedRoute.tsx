'use client'

import React from 'react'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Permission } from '@/types/permission'

interface CollaborativeSessionProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function CollaborativeSessionProtectedRoute({
  children,
  fallback
}: CollaborativeSessionProtectedRouteProps) {
  return (
    <ProtectedRoute
      requiredPermissions={[Permission.EDIT_CONTENT]}
      fallback={fallback || (
        <div className="collaboration-unauthorized">
          <div className="unauthorized-content">
            <i className="bi bi-shield-lock" style={{ fontSize: '4rem', color: '#dc3545' }}></i>
            <h3>Akses Ditolak</h3>
            <p>
              Anda tidak memiliki izin untuk bergabung ke sesi kolaborasi.
              <br />
              Hanya Pengguna dengan peran Editor atau Administrator yang dapat mengakses fitur kolaborasi.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              <i className="bi bi-arrow-left"></i> Kembali
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ProtectedRoute>
  )
}
