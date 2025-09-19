const mockDevices = [
  { id: 1, name: "Device 1", ip: "192.168.1.10", status: "Online" },
  { id: 2, name: "Device 2", ip: "192.168.1.11", status: "Offline" },
];

const WiFiMonitor = () => {
  return (
    <div className="wifi-monitor">
      <h2>WiFi Monitor</h2>
      <div className="row">
        <div className="col-md-6">
          <h4>Network Status</h4>
          <p>SSID: Maskom WiFi</p>
          <p>Connected Devices: 2</p>
        </div>
        <div className="col-md-6">
          <h4>Alerts</h4>
          <ul>
            <li>Device 2 offline</li>
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
          {mockDevices.map(device => (
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