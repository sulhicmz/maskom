import PersonalizationImpactAnalyticsDashboard from '@/components/admin/PersonalizationImpactAnalyticsDashboard'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Permission } from '@/types/permission'

export const runtime = 'nodejs'

export default function AdminPersonalizationAnalyticsPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_ANALYTICS}>
      <PersonalizationImpactAnalyticsDashboard />
    </ProtectedRoute>
  )
}
