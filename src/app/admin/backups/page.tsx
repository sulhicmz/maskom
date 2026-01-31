import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Permission } from '@/types/permission'

const BackupManagementPanel = dynamic(
  () => import('@/components/admin/BackupManagementPanel'),
  { loading: () => <LoadingSpinner /> }
);

export const runtime = 'nodejs'

export default function AdminBackupsPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_SETTINGS}>
      <Suspense fallback={<LoadingSpinner />}>
        <BackupManagementPanel />
      </Suspense>
    </ProtectedRoute>
  )
}
