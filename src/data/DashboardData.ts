import { WiFiDevice, WebsiteTemplate, AIStep } from "@/types/data";

const wifiDevices: WiFiDevice[] = [
  { id: 1, name: "Device 1", ip: "192.168.1.10", status: "Online" },
  { id: 2, name: "Device 2", ip: "192.168.1.11", status: "Offline" },
];

const websiteTemplates: WebsiteTemplate[] = [
  { id: 1, name: "Business Template", preview: "/assets/images/template1.jpg" },
  { id: 2, name: "E-commerce Template", preview: "/assets/images/template2.jpg" },
];

const aiAutomationSteps: AIStep[] = [
  { id: 1, title: "Choose Automation Type", content: "Select chatbot, recommendations, or workflow." },
  { id: 2, title: "Configure Settings", content: "Set up parameters and integrations." },
  { id: 3, title: "Test and Deploy", content: "Test the automation and go live." },
];

const DashboardData = {
  wifiDevices,
  websiteTemplates,
  aiAutomationSteps,
};

export default DashboardData;
