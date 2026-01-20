import { ActivityLog } from '@/types/audit';

export const exportLogsToCSV = (logs: ActivityLog[]): string => {
    if (logs.length === 0) return '';

    const headers = ['ID', 'User ID', 'Action', 'Resource', 'Resource ID', 'Details', 'Timestamp', 'IP Address', 'User Agent', 'Success', 'Error Message'];
    const rows = logs.map(log => [
        log.id,
        log.userId,
        log.action,
        log.resource,
        log.resourceId || '',
        JSON.stringify(log.details),
        log.timestamp,
        log.ipAddress,
        log.userAgent,
        log.success,
        log.errorMessage || '',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csvContent;
};

export const exportLogsToJSON = (logs: ActivityLog[]): string => {
    return JSON.stringify(logs, null, 2);
};

export const downloadLogs = (logs: ActivityLog[], format: 'csv' | 'json', filename: string = 'activity_logs') => {
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'csv') {
        content = exportLogsToCSV(logs);
        mimeType = 'text/csv';
        extension = 'csv';
    } else {
        content = exportLogsToJSON(logs);
        mimeType = 'application/json';
        extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
