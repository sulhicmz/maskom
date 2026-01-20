import ProtectedRoute from '@/components/common/ProtectedRoute';
import CommentModerationDashboard from '@/components/admin/CommentModerationDashboard';
import { Permission } from '@/types/permission';

export default function CommentsPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
      <CommentModerationDashboard />
    </ProtectedRoute>
  );
}

export const metadata = {
  title: 'Moderasi Komentar - Maskom',
  description: 'Dashboard moderasi komentar untuk mengelola dan mengelola ulasan pengguna',
};
