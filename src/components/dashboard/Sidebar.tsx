import React from "react";

interface SidebarProps {
  onModuleChange: (module: string) => void;
}

const Sidebar = React.memo(({ onModuleChange }: SidebarProps) => {
  Sidebar.displayName = "Sidebar";
  return (
    <div className="sidebar bg-light p-3">
      <h5>Dashboard</h5>
      <ul className="nav flex-column">
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => onModuleChange("wifi")} aria-label="Buka WiFi Monitor">
            WiFi Monitor
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => onModuleChange("website")} aria-label="Buka Website Builder">
            Website Builder
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => onModuleChange("ai")} aria-label="Buka AI Automation">
            AI Automation
          </button>
        </li>
      </ul>
    </div>
  );
});

export default Sidebar;