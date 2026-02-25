import React from "react";
import { HardDrive, Clock, Users, Trash2, Cloud, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import ROUTES from "@/utils/routes";

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl
    font-medium text-sm transition-all duration-200 cursor-pointer text-left group
    ${
      isActive
        ? "bg-primary/10 text-primary"
        : "text-text-muted hover:bg-bg-hover hover:text-text-main"
    }
  `;

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
  };

  // Check if current path is a folder route to keep "My Drive" active
  const isFolderActive = location.pathname.startsWith(ROUTES.DASHBOARD.FOLDER_BASE);
  const isTrashActive = location.pathname.startsWith(ROUTES.DASHBOARD.TRASH);

  return (
    <div className="w-64 bg-bg-panel border-r border-border-main flex flex-col p-5 h-full relative z-20">
      {/* Logo Section */}
      <div className="flex items-center gap-3.5 mb-10 px-1">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transform rotate-3">
          <Cloud size={22} className="text-white -rotate-3" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-main leading-tight tracking-tight">
            CloudDocs
          </h1>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">
            Document Vault
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1.5 flex-1">
        <NavLink
          to={ROUTES.DASHBOARD.FOLDER_ROOT}
          className={({ isActive }) => navItemClass({ isActive: isActive || isFolderActive })}
        >
          <HardDrive size={18} className="group-hover:scale-110 transition-transform" />
          <span>My Drive</span>
        </NavLink>

        <NavLink to={ROUTES.DASHBOARD.SHARED} className={navItemClass}>
          <Users size={18} className="group-hover:scale-110 transition-transform" />
          <span>Shared with me</span>
        </NavLink>

        <NavLink to={ROUTES.DASHBOARD.RECENT} className={navItemClass}>
          <Clock size={18} className="group-hover:scale-110 transition-transform" />
          <span>Recent</span>
        </NavLink>

        <NavLink
          to={ROUTES.DASHBOARD.TRASH}
          className={({ isActive }) => navItemClass({ isActive: isActive || isTrashActive })}
        >
          <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
          <span>Trash</span>
        </NavLink>
      </div>

      {/* Footer / Logout */}
      <div className="mt-auto pt-6 border-t border-border-muted -mx-2">
        <button
          onClick={handleLogout}
          className="
            flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-xl w-full
            text-text-muted font-medium text-sm transition-all duration-200
            hover:bg-red-500/10 hover:text-red-400 group
          "
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
