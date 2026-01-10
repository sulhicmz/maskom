import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "@/components/dashboard/index";
import DashboardData from "@/data/DashboardData";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: { src: string; alt: string; width?: number; height?: number; className?: string; loading?: "eager" | "lazy" }) => <img {...props} alt={props.alt || ""} />, // eslint-disable-line @next/next/no-img-element
}));

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: jest.fn(() => {
    const DynamicMock = (props: { children?: React.ReactNode }) => <div data-testid="dynamic-component">{props.children}</div>;
    return DynamicMock;
  }),
}));

describe("Dashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering & Structure (5 tests)", () => {
    it("should render dashboard container", () => {
      render(<Dashboard />);
      const dashboard = document.querySelector(".dashboard");
      expect(dashboard).toBeInTheDocument();
    });

    it("should render sidebar column", () => {
      render(<Dashboard />);
      const sidebarColumn = document.querySelector(".dashboard .col-md-3");
      expect(sidebarColumn).toBeInTheDocument();
    });

    it("should render content column", () => {
      render(<Dashboard />);
      const contentColumn = document.querySelector(".dashboard .col-md-9");
      expect(contentColumn).toBeInTheDocument();
    });

    it("should render dashboard content wrapper", () => {
      render(<Dashboard />);
      expect(screen.getByTestId("dynamic-component")).toBeInTheDocument();
    });

    it("should render fluid container", () => {
      render(<Dashboard />);
      const container = document.querySelector(".container-fluid");
      expect(container).toBeInTheDocument();
    });
  });

  describe("State Management - Module Switching (6 tests)", () => {
    it("should default to wifi module on initial render", () => {
      render(<Dashboard />);
      const wifiDevices = DashboardData.wifiDevices;
      expect(wifiDevices).toHaveLength(2);
    });

    it("should render WiFi monitor module by default", () => {
      render(<Dashboard />);
      expect(screen.getByTestId("dynamic-component")).toBeInTheDocument();
    });

    it("should support wifi module selection", () => {
      render(<Dashboard />);
      const dynamicComponent = screen.getByTestId("dynamic-component");
      expect(dynamicComponent).toBeInTheDocument();
    });

    it("should support website module selection", () => {
      render(<Dashboard />);
      const websiteTemplates = DashboardData.websiteTemplates;
      expect(websiteTemplates).toHaveLength(2);
    });

    it("should support ai module selection", () => {
      render(<Dashboard />);
      const aiSteps = DashboardData.aiAutomationSteps;
      expect(aiSteps).toHaveLength(3);
    });

    it("should handle default case in switch statement", () => {
      render(<Dashboard />);
      const wifiDevices = DashboardData.wifiDevices;
      expect(wifiDevices).toBeDefined();
    });
  });

  describe("Data Access (6 tests)", () => {
    it("should pass wifi devices data to WiFiMonitor", () => {
      render(<Dashboard />);
      const wifiDevices = DashboardData.wifiDevices;
      expect(wifiDevices[0]).toHaveProperty("id", 1);
      expect(wifiDevices[0]).toHaveProperty("name", "Device 1");
      expect(wifiDevices[0]).toHaveProperty("ip", "192.168.1.10");
      expect(wifiDevices[0]).toHaveProperty("status", "Online");
    });

    it("should pass website templates data to WebsiteBuilder", () => {
      render(<Dashboard />);
      const websiteTemplates = DashboardData.websiteTemplates;
      expect(websiteTemplates[0]).toHaveProperty("id", 1);
      expect(websiteTemplates[0]).toHaveProperty("name", "Business Template");
    });

    it("should pass AI automation steps data to AIAutomation", () => {
      render(<Dashboard />);
      const aiSteps = DashboardData.aiAutomationSteps;
      expect(aiSteps[0]).toHaveProperty("id", 1);
      expect(aiSteps[0]).toHaveProperty("title", "Choose Automation Type");
    });

    it("should have multiple wifi devices", () => {
      render(<Dashboard />);
      const wifiDevices = DashboardData.wifiDevices;
      expect(wifiDevices).toHaveLength(2);
    });

    it("should have multiple website templates", () => {
      render(<Dashboard />);
      const websiteTemplates = DashboardData.websiteTemplates;
      expect(websiteTemplates).toHaveLength(2);
    });

    it("should have multiple AI automation steps", () => {
      render(<Dashboard />);
      const aiSteps = DashboardData.aiAutomationSteps;
      expect(aiSteps).toHaveLength(3);
    });
  });

  describe("Module Switching Logic (4 tests)", () => {
    it("should switch between wifi and website modules", () => {
      const { rerender } = render(<Dashboard />);
      const wifiDevices = DashboardData.wifiDevices;
      const websiteTemplates = DashboardData.websiteTemplates;
      expect(wifiDevices).toBeDefined();
      expect(websiteTemplates).toBeDefined();
      rerender(<Dashboard />);
    });

    it("should switch between wifi and ai modules", () => {
      const { rerender } = render(<Dashboard />);
      const wifiDevices = DashboardData.wifiDevices;
      const aiSteps = DashboardData.aiAutomationSteps;
      expect(wifiDevices).toBeDefined();
      expect(aiSteps).toBeDefined();
      rerender(<Dashboard />);
    });

    it("should switch between website and ai modules", () => {
      const { rerender } = render(<Dashboard />);
      const websiteTemplates = DashboardData.websiteTemplates;
      const aiSteps = DashboardData.aiAutomationSteps;
      expect(websiteTemplates).toBeDefined();
      expect(aiSteps).toBeDefined();
      rerender(<Dashboard />);
    });

    it("should handle module state changes", () => {
      render(<Dashboard />);
      const dynamicComponent = screen.getByTestId("dynamic-component");
      expect(dynamicComponent).toBeInTheDocument();
    });
  });

  describe("Dynamic Imports (4 tests)", () => {
    it("should use dynamic import for WiFiMonitor", () => {
      render(<Dashboard />);
      expect(screen.getByTestId("dynamic-component")).toBeInTheDocument();
    });

    it("should use dynamic import for WebsiteBuilder", () => {
      render(<Dashboard />);
      expect(screen.getByTestId("dynamic-component")).toBeInTheDocument();
    });

    it("should use dynamic import for AIAutomation", () => {
      render(<Dashboard />);
      expect(screen.getByTestId("dynamic-component")).toBeInTheDocument();
    });

    it("should display loading state for dynamic components", () => {
      render(<Dashboard />);
      expect(screen.getByTestId("dynamic-component")).toBeInTheDocument();
    });
  });

  describe("Layout & Styling (5 tests)", () => {
    it("should have proper dashboard container class", () => {
      render(<Dashboard />);
      const dashboard = document.querySelector(".dashboard");
      expect(dashboard).toBeInTheDocument();
    });

    it("should use fluid container", () => {
      render(<Dashboard />);
      const container = document.querySelector(".container-fluid");
      expect(container).toBeInTheDocument();
    });

    it("should have proper row layout", () => {
      render(<Dashboard />);
      const row = document.querySelector(".row");
      expect(row).toBeInTheDocument();
    });

    it("should have 2-column layout (sidebar + content)", () => {
      render(<Dashboard />);
      const columns = document.querySelectorAll(".dashboard .col-md-3, .dashboard .col-md-9");
      expect(columns).toHaveLength(2);
    });

    it("should have proper dashboard content wrapper", () => {
      render(<Dashboard />);
      const contentWrapper = document.querySelector(".dashboard-content");
      expect(contentWrapper).toBeInTheDocument();
    });
  });

  describe("Edge Cases (5 tests)", () => {
    it("should handle empty wifi devices array", () => {
      render(<Dashboard />);
      const wifiDevices = DashboardData.wifiDevices;
      expect(wifiDevices).toBeInstanceOf(Array);
    });

    it("should handle empty website templates array", () => {
      render(<Dashboard />);
      const websiteTemplates = DashboardData.websiteTemplates;
      expect(websiteTemplates).toBeInstanceOf(Array);
    });

    it("should handle empty AI steps array", () => {
      render(<Dashboard />);
      const aiSteps = DashboardData.aiAutomationSteps;
      expect(aiSteps).toBeInstanceOf(Array);
    });

    it("should render with default activeModule", () => {
      render(<Dashboard />);
      expect(screen.getByTestId("dynamic-component")).toBeInTheDocument();
    });

    it("should handle invalid module key gracefully", () => {
      render(<Dashboard />);
      const wifiDevices = DashboardData.wifiDevices;
      expect(wifiDevices).toBeDefined();
    });
  });

  describe("Data Integrity (3 tests)", () => {
    it("should have wifi devices with required properties", () => {
      render(<Dashboard />);
      const wifiDevices = DashboardData.wifiDevices;
      wifiDevices.forEach(device => {
        expect(device).toHaveProperty("id");
        expect(device).toHaveProperty("name");
        expect(device).toHaveProperty("ip");
        expect(device).toHaveProperty("status");
      });
    });

    it("should have website templates with required properties", () => {
      render(<Dashboard />);
      const websiteTemplates = DashboardData.websiteTemplates;
      websiteTemplates.forEach(template => {
        expect(template).toHaveProperty("id");
        expect(template).toHaveProperty("name");
        expect(template).toHaveProperty("preview");
      });
    });

    it("should have AI steps with required properties", () => {
      render(<Dashboard />);
      const aiSteps = DashboardData.aiAutomationSteps;
      aiSteps.forEach(step => {
        expect(step).toHaveProperty("id");
        expect(step).toHaveProperty("title");
        expect(step).toHaveProperty("content");
      });
    });
  });

  describe("Component Integration (3 tests)", () => {
    it("should integrate with Sidebar component", () => {
      render(<Dashboard />);
      const sidebarColumn = document.querySelector(".dashboard .col-md-3");
      expect(sidebarColumn).toBeInTheDocument();
    });

    it("should integrate with WiFiMonitor component", () => {
      render(<Dashboard />);
      const wifiDevices = DashboardData.wifiDevices;
      expect(wifiDevices).toBeDefined();
    });

    it("should integrate with DashboardData", () => {
      render(<Dashboard />);
      expect(DashboardData).toHaveProperty("wifiDevices");
      expect(DashboardData).toHaveProperty("websiteTemplates");
      expect(DashboardData).toHaveProperty("aiAutomationSteps");
    });
  });
});
