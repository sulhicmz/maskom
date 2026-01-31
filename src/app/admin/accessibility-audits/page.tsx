import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const AccessibilityDashboard = dynamic(
  () => import('@/components/admin/AccessibilityDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export const metadata = {
  title: 'Audit Aksesibilitas - Maskom',
  description: 'Dashboard audit aksesibilitas dengan laporan kepatuhan WCAG 2.1 AA',
};

export default function AccessibilityAuditsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AccessibilityDashboard />
    </Suspense>
  );
}
