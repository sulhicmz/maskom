import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import NodeCompatibilityDashboard from '@/components/admin/NodeCompatibilityDashboard';

export const metadata: Metadata = {
  title: 'Kompatibilitas Node.js - Admin',
  description: 'Cek dan kelola kompatibilitas Node.js dan dependensi'
};

export default function NodeCompatibilityPage() {
  const isAuthenticated = false;

  if (!isAuthenticated) {
    redirect('/login');
  }

  return <NodeCompatibilityDashboard />;
}
