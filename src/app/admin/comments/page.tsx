import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Permission } from '@/types/permission';

const CommentModerationDashboard = dynamic(
  () => import('@/components/admin/CommentModerationDashboard'),
  { loading: () => <LoadingSpinner /> }
);

export default function CommentsPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
      <Suspense fallback={<LoadingSpinner />}>
        <CommentModerationDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}

export const metadata = {
  title: 'Moderasi Komentar - Maskom',
  description: 'Dashboard moderasi komentar untuk mengelola dan mengelola ulasan pengguna',
};
