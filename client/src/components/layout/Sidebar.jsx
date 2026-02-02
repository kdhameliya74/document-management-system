import React from "react";
import { HardDrive, Clock, Users, Trash2, Cloud, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import ROUTES from "@/utils/routes";

const navItemClass = ({ isActive }) =>
  `
    flex items-center gap-3 p-2 rounded-lg
    font-medium text-sm transition-all cursor-pointer text-left
    ${
      isActive
        ? "bg-bg-hover text-text-main"
        : "text-text-muted hover:bg-bg-hover hover:text-text-main"
    }
  `;

const Sidebar = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="w-60 bg-bg-muted border-r border-border-muted flex flex-col p-4 h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 text-lg font-medium text-text-main mb-6">
        <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
          <Cloud size={20} className="text-white" />
        </div>
        <span className="font-semibold bg-linear-to-br from-primary to-secondary bg-clip-text text-transparent">
          CloudDocs
        </span>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <NavLink to={ROUTES.DASHBOARD.FOLDER_ROOT} className={navItemClass}>
          <HardDrive size={18} />
          <span>My Drive</span>
        </NavLink>

        <NavLink to={ROUTES.DASHBOARD.SHARED} className={navItemClass}>
          <Users size={18} />
          <span>Shared with me</span>
        </NavLink>

        <NavLink to={ROUTES.DASHBOARD.RECENT} className={navItemClass}>
          <Clock size={18} />
          <span>Recent</span>
        </NavLink>

        <NavLink to={ROUTES.DASHBOARD.TRASH} className={navItemClass}>
          <Trash2 size={18} />
          <span>Trash</span>
        </NavLink>
      </div>

      <div className="mt-auto pt-4 border-t border-border-muted">
        <button
          onClick={handleLogout}
          className="
            flex items-center cursor-pointer gap-3 p-2 rounded-lg w-full
            text-text-muted font-medium text-sm transition-all
            hover:bg-red-500/10 hover:text-red-500
          "
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
