'use client';

import React from 'react';
import PersonalizationPerformanceAlertsDashboard from '@/components/admin/PersonalizationPerformanceAlertsDashboard';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';

export const runtime = 'nodejs';

export default function Page() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_ANALYTICS}>
      <PersonalizationPerformanceAlertsDashboard />
    </ProtectedRoute>
  );
}
