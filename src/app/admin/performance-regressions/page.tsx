import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Permission } from '@/types/permission'

const PerformanceRegressionDashboard = dynamic(
  () => import('@/components/admin/PerformanceRegressionDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export const runtime = 'nodejs'

export default function PerformanceRegressionsPage() {
   return (
      <ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
        <Suspense fallback={<LoadingSpinner />}>
          <PerformanceRegressionDashboard />
        </Suspense>
      </ProtectedRoute>
   )
}
