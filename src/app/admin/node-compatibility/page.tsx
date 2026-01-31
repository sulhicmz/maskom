import React, { Suspense } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Permission } from '@/types/permission';

const NodeCompatibilityDashboard = dynamic(
  () => import('@/components/admin/NodeCompatibilityDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export const metadata: Metadata = {
  title: 'Kompatibilitas Node.js - Admin',
  description: 'Cek dan kelola kompatibilitas Node.js dan dependensi'
};

export default function NodeCompatibilityPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_SETTINGS}>
      <Suspense fallback={<LoadingSpinner />}>
        <NodeCompatibilityDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
