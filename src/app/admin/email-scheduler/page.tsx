import EmailSchedulerDashboard from '@/components/admin/EmailSchedulerDashboard';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';

export default function EmailSchedulerPage() {
    return (
        <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
            <EmailSchedulerDashboard />
        </ProtectedRoute>
    );
}
