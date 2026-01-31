import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Permission } from '@/types/permission'

const AnalyticsDashboard = dynamic(
  () => import('@/components/admin/AnalyticsDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export const runtime = 'nodejs'

export default function AdminAnalyticsPage() {
   return (
      <ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
        <Suspense fallback={<LoadingSpinner />}>
          <AnalyticsDashboard />
        </Suspense>
      </ProtectedRoute>
   )
}
