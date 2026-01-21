import { ActivityLog } from '@/types/audit';
import { ActivityAction } from '@/types/audit';
import { exportLogsToCSV, exportLogsToJSON, downloadLogs } from '../logExporter';

describe('logExporter', () => {
    const createMockLog = (overrides: Partial<ActivityLog> = {}): ActivityLog => ({
        id: '1',
        userId: 'user1',
        action: ActivityAction.LOGIN,
        resource: 'auth',
        details: {},
        timestamp: '2024-01-21T10:00:00Z',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        success: true,
        ...overrides,
    });

    describe('exportLogsToCSV', () => {
        it('should return empty string when logs array is empty', () => {
            const csv = exportLogsToCSV([]);

            expect(csv).toBe('');
        });

        it('should export logs to CSV format', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                }),
            ];

            const csv = exportLogsToCSV(logs);

            expect(csv).toContain('ID,User ID,Action,Resource,Resource ID,Details,Timestamp,IP Address,User Agent,Success,Error Message');
            expect(csv).toContain('"1","user1","login","auth","","{}","2024-01-21T10:00:00Z","127.0.0.1","test","true",""');
        });

        it('should escape commas in field values', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    userId: 'user,with,commas',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                }),
            ];

            const csv = exportLogsToCSV(logs);

            expect(csv).toContain('"user,with,commas"');
        });

        it('should escape quotes in field values', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    userId: 'user"with"quotes',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                }),
            ];

            const csv = exportLogsToCSV(logs);

            expect(csv).toContain('"user""with""quotes"');
        });

        it('should handle logs with resource ID', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    resourceId: 'resource-123',
                    action: ActivityAction.LOGIN,
                }),
            ];

            const csv = exportLogsToCSV(logs);

            expect(csv).toContain('"resource-123"');
        });

        it('should handle logs with empty resource ID', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    action: ActivityAction.LOGIN,
                }),
            ];

            const csv = exportLogsToCSV(logs);

            expect(csv).toContain('"1","user1","login","auth","","{}"');
        });

        it('should handle logs with details object', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    details: { key1: 'value1', key2: 'value2' },
                }),
            ];

            const csv = exportLogsToCSV(logs);

            expect(csv).toContain('"{""key1"":""value1"",""key2"":""value2""}"');
        });

        it('should handle logs with error message', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    success: false,
                    errorMessage: 'Invalid password',
                }),
            ];

            const csv = exportLogsToCSV(logs);

            expect(csv).toContain('"Invalid password"');
            expect(csv).toContain('"false","Invalid password"');
        });

        it('should handle empty error message', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    success: true,
                }),
            ];

            const csv = exportLogsToCSV(logs);

            expect(csv).toContain('"true",""');
        });

        it('should export multiple logs', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                }),
                createMockLog({
                    id: '2',
                    userId: 'user2',
                    action: ActivityAction.LOGOUT,
                }),
            ];

            const csv = exportLogsToCSV(logs);
            const lines = csv.split('\n');

            expect(lines).toHaveLength(3);
            expect(lines[0]).toContain('ID,User ID');
            expect(lines[1]).toContain('"1","user1"');
            expect(lines[2]).toContain('"2","user2"');
        });

        it('should preserve log order in CSV', () => {
            const logs = [
                createMockLog({ id: '3' }),
                createMockLog({ id: '1' }),
                createMockLog({ id: '2' }),
            ];

            const csv = exportLogsToCSV(logs);
            const lines = csv.split('\n').slice(1);

            expect(lines[0]).toContain('"3",');
            expect(lines[1]).toContain('"1",');
            expect(lines[2]).toContain('"2",');
        });
    });

    describe('exportLogsToJSON', () => {
        it('should export logs to JSON format', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                }),
            ];

            const json = exportLogsToJSON(logs);
            const parsed = JSON.parse(json);

            expect(parsed).toEqual(logs);
        });

        it('should format JSON with indentation', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];

            const json = exportLogsToJSON(logs);

            expect(json).toContain('  ');
            expect(json).toContain('\n');
        });

        it('should handle empty logs array', () => {
            const json = exportLogsToJSON([]);
            const parsed = JSON.parse(json);

            expect(parsed).toEqual([]);
        });

        it('should handle complex nested structures in details', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    details: {
                        nested: {
                            deeply: {
                                value: 'test',
                            },
                        },
                    },
                }),
            ];

            const json = exportLogsToJSON(logs);
            const parsed = JSON.parse(json);

            expect(parsed[0].details.nested.deeply.value).toBe('test');
        });

        it('should handle logs with all fields populated', () => {
            const logs = [
                createMockLog({
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    resourceId: 'resource-123',
                    details: { key: 'value' },
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                    errorMessage: 'none',
                }),
            ];

            const json = exportLogsToJSON(logs);
            const parsed = JSON.parse(json);

            expect(parsed[0]).toEqual(logs[0]);
        });
    });

    describe('downloadLogs', () => {
        beforeEach(() => {
            const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
            const mockRevokeObjectURL = jest.fn();
            const mockCreateElement = jest.fn(() => ({
                href: '',
                download: '',
                click: jest.fn(),
            }));
            const mockAppendChild = jest.fn();
            const mockRemoveChild = jest.fn();

            global.URL.createObjectURL = mockCreateObjectURL;
            global.URL.revokeObjectURL = mockRevokeObjectURL;
            global.document.createElement = mockCreateElement;
            global.document.body.appendChild = mockAppendChild;
            global.document.body.removeChild = mockRemoveChild;
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should download logs as CSV format', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];

            downloadLogs(logs, 'csv', 'test_logs');

            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(global.document.createElement).toHaveBeenCalledWith('a');
        });

        it('should download logs as JSON format', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];

            downloadLogs(logs, 'json', 'test_logs');

            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(global.document.createElement).toHaveBeenCalledWith('a');
        });

        it('should use default filename when not provided', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];
            const mockElement = {
                href: '',
                download: '',
                click: jest.fn(),
            } as any;
            global.document.createElement = jest.fn(() => mockElement);

            downloadLogs(logs, 'csv');

            expect(mockElement.download).toBe('activity_logs.csv');
        });

        it('should use custom filename when provided', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];
            const mockElement = {
                href: '',
                download: '',
                click: jest.fn(),
            } as any;
            global.document.createElement = jest.fn(() => mockElement);

            downloadLogs(logs, 'csv', 'custom_logs');

            expect(mockElement.download).toBe('custom_logs.csv');
        });

        it('should set correct mime type for CSV', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];

            downloadLogs(logs, 'csv');

            expect(global.URL.createObjectURL).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'text/csv',
                })
            );
        });

        it('should set correct mime type for JSON', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];

            downloadLogs(logs, 'json');

            expect(global.URL.createObjectURL).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'application/json',
                })
            );
        });

        it('should append and remove link element to body', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];

            downloadLogs(logs, 'csv');

            expect(global.document.body.appendChild).toHaveBeenCalled();
            expect(global.document.body.removeChild).toHaveBeenCalled();
        });

        it('should call click on link element', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];
            const mockElement = {
                href: '',
                download: '',
                click: jest.fn(),
            } as any;
            global.document.createElement = jest.fn(() => mockElement);

            downloadLogs(logs, 'csv');

            expect(mockElement.click).toHaveBeenCalled();
        });

        it('should revoke object URL after download', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];

            downloadLogs(logs, 'csv');

            expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
        });

        it('should set href to blob URL', () => {
            const logs = [
                createMockLog({ id: '1' }),
            ];
            const mockElement = {
                href: '',
                download: '',
                click: jest.fn(),
            } as any;
            global.document.createElement = jest.fn(() => mockElement);

            downloadLogs(logs, 'csv');

            expect(mockElement.href).toBe('blob:mock-url');
        });

        it('should handle empty logs array', () => {
            const logs: ActivityLog[] = [];

            downloadLogs(logs, 'csv');

            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
    });
});
