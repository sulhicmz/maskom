import React from "react";

interface SidebarProps {
  onModuleChange: (module: string) => void;
}

const Sidebar = React.memo(({ onModuleChange }: SidebarProps) => {
  Sidebar.displayName = "Sidebar";
  return (
    <div className="sidebar bg-light p-3">
      <h5>Portal Maskom</h5>
      <ul className="nav flex-column">
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => onModuleChange("network") }>
            Monitoring Koneksi
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => onModuleChange("support") }>
            Tiket Dukungan
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link btn btn-link" onClick={() => onModuleChange("maintenance") }>
            Jadwal Pemeliharaan
          </button>
        </li>
      </ul>
    </div>
  );
});

export default Sidebar;