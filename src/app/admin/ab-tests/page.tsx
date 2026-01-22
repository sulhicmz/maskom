import ABTestDashboard from '@/components/admin/ABTestDashboard'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Permission } from '@/types/permission'

export const runtime = 'nodejs'

export default function AdminABTestPage() {
    return (
      <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
        <ABTestDashboard />
      </ProtectedRoute>
    )
}
