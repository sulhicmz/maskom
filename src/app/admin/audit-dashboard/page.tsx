import ActivityStatisticsPanel from '@/components/admin/ActivityStatistics'
import SuspiciousActivityAlertsPanel from '@/components/admin/SuspiciousActivityAlerts'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Permission } from '@/types/permission'

export const runtime = 'nodejs'

export default function AdminAuditDashboardPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_SETTINGS}>
      <section className="audit-dashboard-section py-4">
        <div className="container">
          <div className="row">
            <div className="col-12 mb-4">
              <ActivityStatisticsPanel />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <SuspiciousActivityAlertsPanel />
            </div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  )
}
