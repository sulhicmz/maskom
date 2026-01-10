"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import DashboardData from "@/data/DashboardData";

const WiFiMonitor = dynamic(() => import("./WiFiMonitor"), {
  loading: () => <div className="text-center py-5">Loading WiFi Monitor...</div>
});

const WebsiteBuilder = dynamic(() => import("./WebsiteBuilder"), {
  loading: () => <div className="text-center py-5">Loading Website Builder...</div>
});

const AIAutomation = dynamic(() => import("./AIAutomation"), {
  loading: () => <div className="text-center py-5">Loading AI Automation...</div>
});

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState("wifi");

  const renderModule = () => {
    switch (activeModule) {
      case "wifi":
        return <WiFiMonitor devices={DashboardData.wifiDevices} />;
      case "website":
        return <WebsiteBuilder templates={DashboardData.websiteTemplates} />;
      case "ai":
        return <AIAutomation steps={DashboardData.aiAutomationSteps} />;
      default:
        return <WiFiMonitor devices={DashboardData.wifiDevices} />;
    }
  };

  return (
    <div className="dashboard">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <Sidebar onModuleChange={setActiveModule} />
          </div>
          <div className="col-md-9">
            <div className="dashboard-content">
              {renderModule()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;