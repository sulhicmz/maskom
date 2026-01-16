import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Permission } from '@/types/permission'

export const runtime = 'nodejs'

export default function AdminAnalyticsPage() {
   return (
     <ProtectedRoute requiredPermission={Permission.VIEW_ANALYTICS}>
       <AnalyticsDashboard />
     </ProtectedRoute>
   )
}
