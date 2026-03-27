import React, { useState, useMemo } from "react";
import {
  HardDrive,
  Users,
  Trash2,
  Cloud,
  LogOut,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import ROUTES from "@/utils/routes";

const navItemClass = (isActive, isCollapsed) =>
  `flex items-center ${
    isCollapsed ? "justify-center" : "gap-3 px-3"
  } py-2.5 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer group
  ${
    isActive
      ? "bg-primary/10 text-primary"
      : "text-text-muted hover:bg-bg-hover hover:text-text-main"
  }`;

const SidebarItem = ({ to, icon, label, isCollapsed, isActive }) => {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      className={() => navItemClass(isActive, isCollapsed)}
      title={isCollapsed ? label : ""}
    >
      <Icon size={18} className="group-hover:scale-110 transition-transform flex-shrink-0" />
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
  );
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => dispatch(logout());

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const activeStates = useMemo(
    () => ({
      drive: location.pathname.startsWith(ROUTES.APP.FOLDERS),
      trash: location.pathname.startsWith(ROUTES.APP.TRASH),
      shared: location.pathname.startsWith(ROUTES.APP.SHARED),
      profile: location.pathname.startsWith(ROUTES.APP.PROFILE),
    }),
    [location.pathname],
  );

  const navItems = [
    {
      to: ROUTES.APP.FOLDERS,
      icon: HardDrive,
      label: "My Drive",
      isActive: activeStates.drive,
    },
    {
      to: ROUTES.APP.SHARED,
      icon: Users,
      label: "Shared with me",
      isActive: activeStates.shared,
    },
    {
      to: ROUTES.APP.TRASH,
      icon: Trash2,
      label: "Trash",
      isActive: activeStates.trash,
    },
  ];

  const footerItems = [
    {
      to: ROUTES.APP.PROFILE,
      icon: Settings,
      label: "Settings",
      isActive: activeStates.profile,
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-bg-panel border-r border-border-main flex flex-col p-4 h-full relative z-40 transition-all duration-300`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 cursor-pointer top-15 w-8 h-8 bg-bg-panel border border-border-main rounded-full flex items-center justify-center text-text-muted hover:bg-bg-hover hover:text-text-main shadow-md z-50"
      >
        {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>

      <div
        className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3.5"} mb-10 px-1 overflow-hidden`}
      >
        <div className="min-w-[40px] w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transform rotate-3 flex-shrink-0">
          <Cloud size={22} className="text-white -rotate-3" />
        </div>
        {!isCollapsed && (
          <div className="whitespace-nowrap opacity-100 transition-opacity duration-300">
            <h1 className="text-lg font-bold text-text-main leading-tight tracking-tight">
              CloudDocs
            </h1>
            <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">
              Document Vault
            </p>
          </div>
        )}{" "}
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.label}
            {...item}
            isCollapsed={isCollapsed}
            isActive={item.isActive}
          />
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-border-muted flex flex-col gap-1.5">
        {footerItems.map((item) => (
          <SidebarItem
            key={item.label}
            {...item}
            isCollapsed={isCollapsed}
            isActive={item.isActive}
          />
        ))}

        <button
          onClick={handleLogout}
          className={`flex items-center cursor-pointer ${
            isCollapsed ? "justify-center" : "gap-3 px-3"
          } py-2.5 rounded-xl text-text-muted hover:bg-red-500/10 hover:text-red-400 group`}
        >
          <LogOut />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
