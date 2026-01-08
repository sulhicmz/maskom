import { WiFiDevice } from "@/types/data";

interface WiFiMonitorProps {
  devices: WiFiDevice[];
  ssid?: string;
}

const WiFiMonitor = ({ devices, ssid = "Maskom WiFi" }: WiFiMonitorProps) => {
  const offlineDevices = devices.filter(d => d.status === "Offline");
  const onlineCount = devices.filter(d => d.status === "Online").length;

  return (
    <div className="wifi-monitor">
      <h2>WiFi Monitor</h2>
      <div className="row">
        <div className="col-md-6">
          <h4>Network Status</h4>
          <p>SSID: {ssid}</p>
          <p>Connected Devices: {onlineCount}</p>
        </div>
        <div className="col-md-6">
          <h4>Alerts</h4>
          <ul>
            {offlineDevices.map(device => (
              <li key={device.id}>{device.name} offline</li>
            ))}
            {offlineDevices.length === 0 && <li>No alerts</li>}
          </ul>
        </div>
      </div>
      <h4>Connected Devices</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>IP</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {devices.map(device => (
            <tr key={device.id}>
              <td>{device.name}</td>
              <td>{device.ip}</td>
              <td>{device.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WiFiMonitor;