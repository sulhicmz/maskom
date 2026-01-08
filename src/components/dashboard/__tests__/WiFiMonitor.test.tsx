import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WiFiDevice } from '@/types/data';
import WiFiMonitor from '../WiFiMonitor';

describe('WiFiMonitor', () => {
  const mockDevices: WiFiDevice[] = [
    {
      id: 1,
      name: 'Laptop John',
      ip: '192.168.1.10',
      status: 'Online',
    },
    {
      id: 2,
      name: 'Laptop Jane',
      ip: '192.168.1.11',
      status: 'Offline',
    },
    {
      id: 3,
      name: 'Phone Mike',
      ip: '192.168.1.12',
      status: 'Online',
    },
  ];

  describe('Rendering', () => {
    it('should render WiFi Monitor title', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      expect(screen.getByText('WiFi Monitor')).toBeInTheDocument();
    });

    it('should render network status section', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      expect(screen.getByText('Network Status')).toBeInTheDocument();
    });

    it('should render alerts section', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      expect(screen.getByText('Alerts')).toBeInTheDocument();
    });

    it('should render connected devices table', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      expect(screen.getByText('Connected Devices')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('IP')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should use default SSID when not provided', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      expect(screen.getByText('SSID: Maskom WiFi')).toBeInTheDocument();
    });

    it('should use custom SSID when provided', () => {
      render(<WiFiMonitor devices={mockDevices} ssid="Custom WiFi" />);
      
      expect(screen.getByText('SSID: Custom WiFi')).toBeInTheDocument();
    });
  });

  describe('Device Counting', () => {
    it('should display correct count of connected devices', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      expect(screen.getByText('Connected Devices: 2')).toBeInTheDocument();
    });

    it('should display zero when all devices are offline', () => {
      const allOffline = mockDevices.map(d => ({ ...d, status: 'Offline' as const }));
      
      render(<WiFiMonitor devices={allOffline} />);
      
      expect(screen.getByText('Connected Devices: 0')).toBeInTheDocument();
    });

    it('should count all devices when all are online', () => {
      const allOnline = mockDevices.map(d => ({ ...d, status: 'Online' as const }));
      
      render(<WiFiMonitor devices={allOnline} />);
      
      expect(screen.getByText('Connected Devices: 3')).toBeInTheDocument();
    });
  });

  describe('Alerts', () => {
    it('should display offline device alerts', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      expect(screen.getByText('Laptop Jane offline')).toBeInTheDocument();
    });

    it('should display multiple offline device alerts', () => {
      const multipleOffline = [
        ...mockDevices.map(d => ({ ...d, status: 'Offline' as const })),
      ];
      
      render(<WiFiMonitor devices={multipleOffline} />);
      
      expect(screen.getByText('Laptop John offline')).toBeInTheDocument();
      expect(screen.getByText('Laptop Jane offline')).toBeInTheDocument();
      expect(screen.getByText('Phone Mike offline')).toBeInTheDocument();
    });

    it('should show no alerts message when all devices are online', () => {
      const allOnline = mockDevices.map(d => ({ ...d, status: 'Online' as const }));
      
      render(<WiFiMonitor devices={allOnline} />);
      
      expect(screen.getByText('No alerts')).toBeInTheDocument();
    });
  });

  describe('Device Table', () => {
    it('should render all devices in the table', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      expect(screen.getByText('Laptop John')).toBeInTheDocument();
      expect(screen.getByText('Laptop Jane')).toBeInTheDocument();
      expect(screen.getByText('Phone Mike')).toBeInTheDocument();
    });

    it('should render device IP addresses', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.11')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.12')).toBeInTheDocument();
    });

    it('should render device status', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      const statusElements = screen.getAllByText('Online');
      expect(statusElements).toHaveLength(2);
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty devices array', () => {
      render(<WiFiMonitor devices={[]} />);
      
      expect(screen.getByText('Connected Devices: 0')).toBeInTheDocument();
      expect(screen.getByText('No alerts')).toBeInTheDocument();
    });

    it('should handle single device', () => {
      const singleDevice = [mockDevices[0]];
      
      render(<WiFiMonitor devices={singleDevice} />);
      
      expect(screen.getByText('Laptop John')).toBeInTheDocument();
      expect(screen.getByText('Connected Devices: 1')).toBeInTheDocument();
    });

    it('should handle device with special characters in name', () => {
      const specialCharDevice: WiFiDevice[] = [
        {
          id: 1,
          name: "O'Connor's Device",
          ip: '192.168.1.10',
          status: 'Online',
        },
      ];
      
      render(<WiFiMonitor devices={specialCharDevice} />);
      
      expect(screen.getByText("O'Connor's Device")).toBeInTheDocument();
    });

    it('should handle very long device name', () => {
      const longNameDevice: WiFiDevice[] = [
        {
          id: 1,
          name: 'Very long device name that might break the layout if not handled properly',
          ip: '192.168.1.10',
          status: 'Online',
        },
      ];
      
      render(<WiFiMonitor devices={longNameDevice} />);
      
      expect(screen.getByText('Very long device name that might break the layout if not handled properly')).toBeInTheDocument();
    });
  });

  describe('Data Integrity', () => {
    it('should render devices in order they are provided', () => {
      render(<WiFiMonitor devices={mockDevices} />);
      
      const rows = screen.getAllByRole('row');
      const secondRow = rows[1];
      
      expect(secondRow).toHaveTextContent('Laptop John');
    });

    it('should use device id as key in table rows', () => {
      const { container } = render(<WiFiMonitor devices={mockDevices} />);
      
      const tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(3);
    });
  });
});
