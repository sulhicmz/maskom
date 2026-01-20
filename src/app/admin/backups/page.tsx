import BackupManagementPanel from '@/components/admin/BackupManagementPanel'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Permission } from '@/types/permission'

export const runtime = 'nodejs'

export default function AdminBackupsPage() {
  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_SETTINGS}>
      <BackupManagementPanel />
    </ProtectedRoute>
  )
}
