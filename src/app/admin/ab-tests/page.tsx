import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Permission } from '@/types/permission'

const ABTestDashboard = dynamic(
  () => import('@/components/admin/ABTestDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export const runtime = 'nodejs'

export default function AdminABTestPage() {
    return (
      <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
        <Suspense fallback={<LoadingSpinner />}>
          <ABTestDashboard />
        </Suspense>
      </ProtectedRoute>
    )
}
