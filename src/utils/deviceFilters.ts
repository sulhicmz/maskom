import { WiFiDevice } from "@/types/data";

export interface DeviceFilterOptions {
  status?: 'Online' | 'Offline' | 'Both';
}

export interface DeviceFilterResult {
  devices: WiFiDevice[];
  onlineCount: number;
  offlineCount: number;
  totalCount: number;
}

export function filterDevicesByStatus(
  devices: WiFiDevice[],
  options: DeviceFilterOptions = {}
): DeviceFilterResult {
  const { status = 'Both' } = options;

  const onlineDevices = devices.filter(d => d.status === 'Online');
  const offlineDevices = devices.filter(d => d.status === 'Offline');

  let filteredDevices: WiFiDevice[] = devices;

  switch (status) {
    case 'Online':
      filteredDevices = onlineDevices;
      break;
    case 'Offline':
      filteredDevices = offlineDevices;
      break;
    case 'Both':
    default:
      filteredDevices = devices;
      break;
  }

  return {
    devices: filteredDevices,
    onlineCount: onlineDevices.length,
    offlineCount: offlineDevices.length,
    totalCount: devices.length
  };
}

export function getOnlineDevices(devices: WiFiDevice[]): WiFiDevice[] {
  return devices.filter(d => d.status === 'Online');
}

export function getOfflineDevices(devices: WiFiDevice[]): WiFiDevice[] {
  return devices.filter(d => d.status === 'Offline');
}

export function getDeviceStats(devices: WiFiDevice[]): {
  onlineCount: number;
  offlineCount: number;
  totalCount: number;
  onlinePercentage: number;
  offlinePercentage: number;
} {
  const onlineDevices = devices.filter(d => d.status === 'Online');
  const offlineDevices = devices.filter(d => d.status === 'Offline');

  const onlineCount = onlineDevices.length;
  const offlineCount = offlineDevices.length;
  const totalCount = devices.length;

  return {
    onlineCount,
    offlineCount,
    totalCount,
    onlinePercentage: totalCount > 0 ? (onlineCount / totalCount) * 100 : 0,
    offlinePercentage: totalCount > 0 ? (offlineCount / totalCount) * 100 : 0
  };
}
