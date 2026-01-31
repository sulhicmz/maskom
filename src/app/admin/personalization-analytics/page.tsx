import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Permission } from '@/types/permission'

const PersonalizationImpactAnalyticsDashboard = dynamic(
  () => import('@/components/admin/PersonalizationImpactAnalyticsDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export const runtime = 'nodejs'

export default function AdminPersonalizationAnalyticsPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_ANALYTICS}>
      <Suspense fallback={<LoadingSpinner />}>
        <PersonalizationImpactAnalyticsDashboard />
      </Suspense>
    </ProtectedRoute>
  )
}
