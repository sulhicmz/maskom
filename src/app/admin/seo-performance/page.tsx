import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SEOMonitoringDashboard = dynamic(
  () => import('@/components/admin/SEOMonitoringDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export default function SEOMonitoringPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SEOMonitoringDashboard />
    </Suspense>
  );
}
