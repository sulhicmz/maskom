import { ActivityLog, ActivityAction, ActivityDetailValue } from '@/types/audit';
import { filterLogs } from '@/utils/activityLogger';
import { 
    PermissionAuditReport, 
    PermissionChange, 
    DateRange, 
    AuditFilters, 
    AuditSummary 
} from '@/types/audit';

const PERMISSION_ACTIONS = [
    ActivityAction.ROLE_CHANGE,
    ActivityAction.ROLE_ASSIGNED,
    ActivityAction.ROLE_REMOVED,
    ActivityAction.PERMISSION_GRANTED,
    ActivityAction.PERMISSION_REVOKED,
    ActivityAction.SETTINGS_CHANGE,
];

export const generateAuditReportId = (): string => {
    return `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const generatePermissionAuditReport = (
    dateRange: DateRange,
    filters: AuditFilters = {},
    generatedBy: string
): PermissionAuditReport => {
    const combinedFilters: AuditFilters = {
        action: PERMISSION_ACTIONS,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...filters,
    };

    const permissionLogs = filterLogs(combinedFilters);
    const permissionChanges = permissionLogs.map(log => 
        mapLogToPermissionChange(log)
    );

    const summary = calculateAuditSummary(permissionChanges, permissionLogs);

    return {
        id: generateAuditReportId(),
        dateRange,
        filters: combinedFilters,
        summary,
        changes: permissionChanges,
        generatedAt: new Date().toISOString(),
        generatedBy,
    };
};

export const mapLogToPermissionChange = (log: ActivityLog): PermissionChange => {
    const details = log.details || {};
    const beforeValues = details.beforeValues || {};
    const afterValues = details.afterValues || {};
    
    const diffFields = calculateDiffFields(beforeValues, afterValues);

    return {
        activityLogId: log.id,
        timestamp: log.timestamp,
        userId: log.userId,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId || '',
        beforeValues,
        afterValues,
        diffFields,
        changeReason: details.changeReason as string,
        approvedBy: details.approvedBy as string,
    };
};

export const calculateDiffFields = (
    beforeValues: Record<string, ActivityDetailValue>,
    afterValues: Record<string, ActivityDetailValue>
): string[] => {
    const diffFields: string[] = [];
    const allKeys = new Set([...Object.keys(beforeValues), ...Object.keys(afterValues)]);

    for (const key of allKeys) {
        const before = beforeValues[key];
        const after = afterValues[key];

        if (JSON.stringify(before) !== JSON.stringify(after)) {
            diffFields.push(key);
        }
    }

    return diffFields;
};

export const calculateAuditSummary = (
    changes: PermissionChange[]
): AuditSummary => {
    const changesByAction: Record<string, number> = {};
    const changesByUser: Record<string, number> = {};
    const changesByResource: Record<string, number> = {};

    let suspiciousChanges = 0;
    let approvedChanges = 0;
    let pendingApproval = 0;

    for (const change of changes) {
        changesByAction[change.action] = (changesByAction[change.action] || 0) + 1;
        changesByUser[change.userId] = (changesByUser[change.userId] || 0) + 1;
        changesByResource[change.resource] = (changesByResource[change.resource] || 0) + 1;

        if (change.approvedBy) {
            approvedChanges++;
        } else {
            pendingApproval++;
        }
    }

    suspiciousChanges = detectSuspiciousChanges(changes);

    return {
        totalChanges: changes.length,
        changesByAction,
        changesByUser,
        changesByResource,
        suspiciousChanges,
        approvedChanges,
        pendingApproval,
    };
};

export const detectSuspiciousChanges = (changes: PermissionChange[]): number => {
    const suspiciousCount = 0;
    const userChangeCount: Record<string, number> = {};

    for (const change of changes) {
        userChangeCount[change.userId] = (userChangeCount[change.userId] || 0) + 1;

        if (userChangeCount[change.userId] > 5) {
            suspiciousCount++;
        }

        if (change.action === ActivityAction.ROLE_CHANGE && 
            change.afterValues.role === 'admin' && 
            change.beforeValues.role !== 'admin') {
            suspiciousCount++;
        }

        if (change.action === ActivityAction.PERMISSION_GRANTED &&
            Object.keys(change.afterValues).length > 5) {
            suspiciousCount++;
        }
    }

    return suspiciousCount;
};

export const exportAuditReportToCSV = (report: PermissionAuditReport): string => {
    const headers = [
        'Timestamp',
        'User ID',
        'Action',
        'Resource',
        'Resource ID',
        'Changed Fields',
        'Change Reason',
        'Approved By',
    ];

    const rows = report.changes.map(change => {
        return [
            change.timestamp,
            change.userId,
            change.action,
            change.resource,
            change.resourceId,
            change.diffFields.join(', '),
            change.changeReason || '',
            change.approvedBy || '',
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
};

export const exportAuditReportToJSON = (report: PermissionAuditReport): string => {
    return JSON.stringify(report, null, 2);
};

export const downloadAuditReport = (report: PermissionAuditReport, format: 'csv' | 'json') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
        content = exportAuditReportToCSV(report);
        filename = `permission-audit-report-${report.id}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
    } else {
        content = exportAuditReportToJSON(report);
        filename = `permission-audit-report-${report.id}.json`;
        mimeType = 'application/json;charset=utf-8;';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const generatePermissionDiff = (
    beforeValues: Record<string, ActivityDetailValue>,
    afterValues: Record<string, ActivityDetailValue>
): Array<{ field: string; before: ActivityDetailValue; after: ActivityDetailValue; status: 'added' | 'removed' | 'changed' }> => {
    const diff: Array<{ field: string; before: ActivityDetailValue; after: ActivityDetailValue; status: 'added' | 'removed' | 'changed' }> = [];
    const allKeys = new Set([...Object.keys(beforeValues), ...Object.keys(afterValues)]);

    for (const key of allKeys) {
        const before = beforeValues[key];
        const after = afterValues[key];

        if (before === undefined && after !== undefined) {
            diff.push({ field: key, before: null, after, status: 'added' });
        } else if (before !== undefined && after === undefined) {
            diff.push({ field: key, before, after: null, status: 'removed' });
        } else if (JSON.stringify(before) !== JSON.stringify(after)) {
            diff.push({ field: key, before, after, status: 'changed' });
        }
    }

    return diff;
};
