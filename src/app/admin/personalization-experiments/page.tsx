"use client";

import * as React from 'react';
import { Suspense } from 'react';
import { useAuthService } from '@/hooks/useAuthService';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ExperimentsPage: React.FC = () => {
  const { user } = useAuthService();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  if (user.role !== 'admin' && user.role !== 'data_analyst' && user.role !== 'marketer') {
    router.push('/login');
    return null;
  }

  const ExperimentsDashboard = React.lazy(() => import('@/components/admin/PersonalizationExperimentDashboard'));

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ExperimentsDashboard />
    </Suspense>
  );
};

export default ExperimentsPage;
