import React from "react";

interface SidebarProps {
  onModuleChange: (module: string) => void;
}

const Sidebar = React.memo(({ onModuleChange }: SidebarProps) => {
  return (
    <div className="sidebar bg-light p-3">
      <h5>Dashboard</h5>
      <ul className="nav flex-column">
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => onModuleChange("wifi")}>
            WiFi Monitor
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => onModuleChange("website")}>
            Website Builder
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => onModuleChange("ai")}>
            AI Automation
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;