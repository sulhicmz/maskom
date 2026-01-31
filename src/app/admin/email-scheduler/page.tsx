import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Permission } from '@/types/permission';

const EmailSchedulerDashboard = dynamic(
  () => import('@/components/admin/EmailSchedulerDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export default function EmailSchedulerPage() {
    return (
        <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
            <Suspense fallback={<LoadingSpinner />}>
              <EmailSchedulerDashboard />
            </Suspense>
        </ProtectedRoute>
    );
}
