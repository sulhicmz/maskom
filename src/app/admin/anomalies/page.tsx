"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const AnomalyDashboard = dynamic(
  () => import('@/components/admin/AnomalyDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export default function AnomaliesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnomalyDashboard />
    </Suspense>
  );
}
