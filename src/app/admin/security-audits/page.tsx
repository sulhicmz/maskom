'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SecurityAuditDashboard from '@/components/admin/SecurityAuditDashboard';

const SecurityAuditsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  if (user.role !== 'admin' && !user.permissions?.includes('MANAGE_ANALYTICS')) {
    router.push('/');
    return null;
  }

  return <SecurityAuditDashboard />;
};

export default SecurityAuditsPage;
