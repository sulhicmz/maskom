import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Permission } from '@/types/permission'

const ActivityStatisticsPanel = dynamic(
  () => import('@/components/admin/ActivityStatistics'),
  { loading: () => <LoadingSpinner /> }
);
const SuspiciousActivityAlertsPanel = dynamic(
  () => import('@/components/admin/SuspiciousActivityAlerts'),
  { loading: () => <LoadingSpinner /> }
);

export const runtime = 'nodejs'

export default function AdminAuditDashboardPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_SETTINGS}>
      <section className="audit-dashboard-section py-4">
        <div className="container">
          <div className="row">
            <div className="col-12 mb-4">
              <Suspense fallback={<LoadingSpinner />}>
                <ActivityStatisticsPanel />
              </Suspense>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <Suspense fallback={<LoadingSpinner />}>
                <SuspiciousActivityAlertsPanel />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  )
}
