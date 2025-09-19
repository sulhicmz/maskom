"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import WiFiMonitor from "./WiFiMonitor";
import WebsiteBuilder from "./WebsiteBuilder";
import AIAutomation from "./AIAutomation";

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState("wifi");

  const renderModule = () => {
    switch (activeModule) {
      case "wifi":
        return <WiFiMonitor />;
      case "website":
        return <WebsiteBuilder />;
      case "ai":
        return <AIAutomation />;
      default:
        return <WiFiMonitor />;
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