import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ActivityLogViewer = dynamic(
  () => import('@/components/admin/ActivityLogViewer'),
  { loading: () => <LoadingSpinner /> }
);

export const runtime = 'nodejs'

export default function AdminAuditLogsPage() {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ActivityLogViewer />
      </Suspense>
    );
}
