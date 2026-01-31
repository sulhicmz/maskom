'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Permission } from '@/types/permission';

const PersonalizationPerformanceAlertsDashboard = dynamic(
  () => import('@/components/admin/PersonalizationPerformanceAlertsDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export const runtime = 'nodejs';

export default function Page() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_ANALYTICS}>
      <Suspense fallback={<LoadingSpinner />}>
        <PersonalizationPerformanceAlertsDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
