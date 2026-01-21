import PerformanceRegressionDashboard from '@/components/admin/PerformanceRegressionDashboard'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Permission } from '@/types/permission'

export const runtime = 'nodejs'

export default function PerformanceRegressionsPage() {
   return (
      <ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
        <PerformanceRegressionDashboard />
      </ProtectedRoute>
   )
}
