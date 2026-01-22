import { Metadata } from 'next';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';
import NodeCompatibilityDashboard from '@/components/admin/NodeCompatibilityDashboard';

export const metadata: Metadata = {
  title: 'Kompatibilitas Node.js - Admin',
  description: 'Cek dan kelola kompatibilitas Node.js dan dependensi'
};

export default function NodeCompatibilityPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_SETTINGS}>
      <NodeCompatibilityDashboard />
    </ProtectedRoute>
  );
}
