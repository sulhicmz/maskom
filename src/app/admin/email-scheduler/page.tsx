import EmailSchedulerDashboard from '@/components/admin/EmailSchedulerDashboard';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';

export default function EmailSchedulerPage() {
    return (
        <ProtectedRoute permission={Permission.MANAGE_CAMPAIGNS}>
            <EmailSchedulerDashboard />
        </ProtectedRoute>
    );
}
