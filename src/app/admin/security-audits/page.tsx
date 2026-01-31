'use client';

import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthService } from '@/hooks/useAuthService';

const SecurityAuditDashboard = dynamic(
  () => import('@/components/admin/SecurityAuditDashboard'),
  { loading: () => <LoadingSpinner /> }
);

const SecurityAuditsPage = () => {
  const router = useRouter();
  const { user, loading } = useAuthService();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  if (user.role !== 'admin') {
    router.push('/');
    return null;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SecurityAuditDashboard />
    </Suspense>
  );
};

export default SecurityAuditsPage;
