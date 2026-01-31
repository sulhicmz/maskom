import React, { useCallback } from "react";

interface SidebarProps {
  onModuleChange: (module: string) => void;
}

const SidebarComponent = ({ onModuleChange }: SidebarProps) => {
  const handleWiFiClick = useCallback(() => {
    onModuleChange("wifi");
  }, [onModuleChange]);
  
  const handleWebsiteClick = useCallback(() => {
    onModuleChange("website");
  }, [onModuleChange]);
  
  const handleAIClick = useCallback(() => {
    onModuleChange("ai");
  }, [onModuleChange]);
  
  return (
    <div className="sidebar bg-light p-3">
      <h5>Dashboard</h5>
      <ul className="nav flex-column">
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={handleWiFiClick} aria-label="Buka WiFi Monitor">
            WiFi Monitor
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={handleWebsiteClick} aria-label="Buka Website Builder">
            Website Builder
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={handleAIClick} aria-label="Buka AI Automation">
            AI Automation
          </button>
        </li>
      </ul>
    </div>
  );
};

const Sidebar = React.memo(SidebarComponent);
Sidebar.displayName = "Sidebar";

export default Sidebar;