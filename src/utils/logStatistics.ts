import { ActivityLog, ActivityAction, ActivityStatistics } from '@/types/audit';
import { getLogs } from './logStorage';

export const calculateActivityStatistics = (): ActivityStatistics => {
    const logs = getLogs();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const last7Days = new Date(now.getTime() - 604800000);
    const last30Days = new Date(now.getTime() - 2592000000);

    const todayActivity = logs.filter(log => new Date(log.timestamp) >= today).length;
    const last24hActivity = logs.filter(log => new Date(log.timestamp) >= yesterday).length;
    const last7DaysActivity = logs.filter(log => new Date(log.timestamp) >= last7Days).length;
    const last30DaysActivity = logs.filter(log => new Date(log.timestamp) >= last30Days).length;

    const successfulLogs = logs.filter(log => log.success).length;
    const failedLogs = logs.filter(log => !log.success).length;

    const logsByAction = Object.values(ActivityAction).reduce<Record<ActivityAction, number>>((acc, action) => {
        acc[action] = logs.filter(log => log.action === action).length;
        return acc;
    }, {} as Record<ActivityAction, number>);

    const logsByUser: Record<string, number> = {};
    logs.forEach(log => {
        logsByUser[log.userId] = (logsByUser[log.userId] || 0) + 1;
    });

    const logsByResource: Record<string, number> = {};
    logs.forEach(log => {
        logsByResource[log.resource] = (logsByResource[log.resource] || 0) + 1;
    });

    const recentActivity = logs.slice(0, 10);

    return {
        totalLogs: logs.length,
        successfulLogs,
        failedLogs,
        logsByAction,
        logsByUser,
        logsByResource,
        recentActivity,
        todayActivity,
        last24hActivity,
        last7DaysActivity,
        last30DaysActivity,
    };
};
