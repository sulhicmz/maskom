import { WiFiDevice } from "@/types/data";
import {
  filterDevicesByStatus,
  getOnlineDevices,
  getOfflineDevices,
  getDeviceStats
} from '../deviceFilters';

describe('deviceFilters', () => {
  const mockDevices: WiFiDevice[] = [
    { id: 1, name: 'Device 1', ip: '192.168.1.1', status: 'Online' },
    { id: 2, name: 'Device 2', ip: '192.168.1.2', status: 'Offline' },
    { id: 3, name: 'Device 3', ip: '192.168.1.3', status: 'Online' },
    { id: 4, name: 'Device 4', ip: '192.168.1.4', status: 'Offline' },
    { id: 5, name: 'Device 5', ip: '192.168.1.5', status: 'Online' },
  ];

  describe('filterDevicesByStatus', () => {
    it('returns all devices when status is Both (default)', () => {
      const result = filterDevicesByStatus(mockDevices);
      expect(result.devices).toHaveLength(5);
      expect(result.totalCount).toBe(5);
      expect(result.onlineCount).toBe(3);
      expect(result.offlineCount).toBe(2);
    });

    it('returns all devices when status is Both (explicit)', () => {
      const result = filterDevicesByStatus(mockDevices, { status: 'Both' });
      expect(result.devices).toHaveLength(5);
      expect(result.devices).toEqual(mockDevices);
    });

    it('filters only online devices when status is Online', () => {
      const result = filterDevicesByStatus(mockDevices, { status: 'Online' });
      expect(result.devices).toHaveLength(3);
      expect(result.devices.every(d => d.status === 'Online')).toBe(true);
      expect(result.devices).toEqual([
        mockDevices[0],
        mockDevices[2],
        mockDevices[4]
      ]);
    });

    it('filters only offline devices when status is Offline', () => {
      const result = filterDevicesByStatus(mockDevices, { status: 'Offline' });
      expect(result.devices).toHaveLength(2);
      expect(result.devices.every(d => d.status === 'Offline')).toBe(true);
      expect(result.devices).toEqual([
        mockDevices[1],
        mockDevices[3]
      ]);
    });

    it('returns empty array with empty device list', () => {
      const result = filterDevicesByStatus([]);
      expect(result.devices).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.onlineCount).toBe(0);
      expect(result.offlineCount).toBe(0);
    });

    it('handles all online devices', () => {
      const allOnline = mockDevices.filter(d => d.status === 'Online');
      const result = filterDevicesByStatus(allOnline, { status: 'Online' });
      expect(result.devices).toHaveLength(3);
      expect(result.onlineCount).toBe(3);
      expect(result.offlineCount).toBe(0);
    });

    it('handles all offline devices', () => {
      const allOffline = mockDevices.filter(d => d.status === 'Offline');
      const result = filterDevicesByStatus(allOffline, { status: 'Offline' });
      expect(result.devices).toHaveLength(2);
      expect(result.onlineCount).toBe(0);
      expect(result.offlineCount).toBe(2);
    });

    it('handles mixed status with empty options', () => {
      const result = filterDevicesByStatus(mockDevices, {});
      expect(result.devices).toHaveLength(5);
      expect(result.totalCount).toBe(5);
    });
  });

  describe('getOnlineDevices', () => {
    it('returns only online devices', () => {
      const onlineDevices = getOnlineDevices(mockDevices);
      expect(onlineDevices).toHaveLength(3);
      expect(onlineDevices.every(d => d.status === 'Online')).toBe(true);
      expect(onlineDevices).toEqual([
        mockDevices[0],
        mockDevices[2],
        mockDevices[4]
      ]);
    });

    it('returns empty array when no online devices', () => {
      const allOffline = mockDevices.filter(d => d.status === 'Offline');
      const onlineDevices = getOnlineDevices(allOffline);
      expect(onlineDevices).toHaveLength(0);
    });

    it('returns empty array with empty device list', () => {
      const onlineDevices = getOnlineDevices([]);
      expect(onlineDevices).toHaveLength(0);
    });

    it('does not modify original array', () => {
      const devicesCopy = [...mockDevices];
      getOnlineDevices(devicesCopy);
      expect(devicesCopy).toEqual(mockDevices);
    });
  });

  describe('getOfflineDevices', () => {
    it('returns only offline devices', () => {
      const offlineDevices = getOfflineDevices(mockDevices);
      expect(offlineDevices).toHaveLength(2);
      expect(offlineDevices.every(d => d.status === 'Offline')).toBe(true);
      expect(offlineDevices).toEqual([
        mockDevices[1],
        mockDevices[3]
      ]);
    });

    it('returns empty array when no offline devices', () => {
      const allOnline = mockDevices.filter(d => d.status === 'Online');
      const offlineDevices = getOfflineDevices(allOnline);
      expect(offlineDevices).toHaveLength(0);
    });

    it('returns empty array with empty device list', () => {
      const offlineDevices = getOfflineDevices([]);
      expect(offlineDevices).toHaveLength(0);
    });

    it('does not modify original array', () => {
      const devicesCopy = [...mockDevices];
      getOfflineDevices(devicesCopy);
      expect(devicesCopy).toEqual(mockDevices);
    });
  });

  describe('getDeviceStats', () => {
    it('returns correct statistics for mixed devices', () => {
      const stats = getDeviceStats(mockDevices);
      expect(stats.onlineCount).toBe(3);
      expect(stats.offlineCount).toBe(2);
      expect(stats.totalCount).toBe(5);
      expect(stats.onlinePercentage).toBe(60);
      expect(stats.offlinePercentage).toBe(40);
    });

    it('returns correct statistics for all online devices', () => {
      const allOnline = mockDevices.filter(d => d.status === 'Online');
      const stats = getDeviceStats(allOnline);
      expect(stats.onlineCount).toBe(3);
      expect(stats.offlineCount).toBe(0);
      expect(stats.totalCount).toBe(3);
      expect(stats.onlinePercentage).toBe(100);
      expect(stats.offlinePercentage).toBe(0);
    });

    it('returns correct statistics for all offline devices', () => {
      const allOffline = mockDevices.filter(d => d.status === 'Offline');
      const stats = getDeviceStats(allOffline);
      expect(stats.onlineCount).toBe(0);
      expect(stats.offlineCount).toBe(2);
      expect(stats.totalCount).toBe(2);
      expect(stats.onlinePercentage).toBe(0);
      expect(stats.offlinePercentage).toBe(100);
    });

    it('returns zeros for empty device list', () => {
      const stats = getDeviceStats([]);
      expect(stats.onlineCount).toBe(0);
      expect(stats.offlineCount).toBe(0);
      expect(stats.totalCount).toBe(0);
      expect(stats.onlinePercentage).toBe(0);
      expect(stats.offlinePercentage).toBe(0);
    });

    it('handles partial percentages correctly', () => {
      const partialDevices = [
        { id: 1, name: 'Device 1', ip: '192.168.1.1', status: 'Online' },
        { id: 2, name: 'Device 2', ip: '192.168.1.2', status: 'Offline' },
        { id: 3, name: 'Device 3', ip: '192.168.1.3', status: 'Offline' },
      ];
      const stats = getDeviceStats(partialDevices);
      expect(stats.onlineCount).toBe(1);
      expect(stats.offlineCount).toBe(2);
      expect(stats.totalCount).toBe(3);
      expect(stats.onlinePercentage).toBeCloseTo(33.333333333333336);
      expect(stats.offlinePercentage).toBeCloseTo(66.66666666666666);
    });

    it('does not modify original array', () => {
      const devicesCopy = [...mockDevices];
      getDeviceStats(devicesCopy);
      expect(devicesCopy).toEqual(mockDevices);
    });
  });
});
