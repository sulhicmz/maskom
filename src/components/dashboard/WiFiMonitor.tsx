import React, { useMemo } from "react";
import { WiFiDevice } from "@/types/data";
import { getOfflineDevices, getDeviceStats } from "@/utils/deviceFilters";

interface WiFiMonitorProps {
  devices: WiFiDevice[];
  ssid?: string;
}

const WiFiMonitor = ({ devices, ssid = "Maskom WiFi" }: WiFiMonitorProps) => {
  const offlineDevices = useMemo(() => getOfflineDevices(devices), [devices]);
  const { onlineCount } = useMemo(() => getDeviceStats(devices), [devices]);

   return (
      <section className="wifi-monitor" aria-label="WiFi Network Monitor">
         <h2>WiFi Monitor</h2>
         <div className="row">
            <div className="col-md-6">
               <h3>Network Status</h3>
               <p>SSID: {ssid}</p>
               <p aria-live="polite">Connected Devices: {onlineCount}</p>
            </div>
            <div className="col-md-6">
               <h3>Alerts</h3>
               <ul aria-live="polite" aria-atomic="true">
                  {offlineDevices.length > 0 ? (
                     offlineDevices.map(device => (
                        <li key={device.id} className="alert-item">{device.name} offline</li>
                     ))
                  ) : (
                     <li>No alerts</li>
                  )}
               </ul>
            </div>
         </div>
         <h3>Connected Devices</h3>
         <table className="table" aria-label="Connected Devices Table">
            <thead>
               <tr>
                  <th scope="col">Name</th>
                  <th scope="col">IP Address</th>
                  <th scope="col">Status</th>
               </tr>
            </thead>
            <tbody>
               {devices.map(device => (
                  <tr key={device.id}>
                     <td>{device.name}</td>
                     <td>{device.ip}</td>
                     <td aria-label={`Device status: ${device.status}`}>{device.status}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </section>
   );
};

export default React.memo(WiFiMonitor);