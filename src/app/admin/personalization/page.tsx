'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PersonalizationDashboard = dynamic(
  () => import('@/components/admin/PersonalizationDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export default function PersonalizationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PersonalizationDashboard />
    </Suspense>
  );
}
