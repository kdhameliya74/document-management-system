import React from 'react';
import { HardDrive, Clock, Users, Trash2, Cloud, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import ROUTES from '@/utils/routes';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="w-[240px] bg-bg-panel border-r border-border-muted flex flex-col p-4 h-full">
      <div className="flex items-center gap-3 text-lg font-bold text-text-main mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
          <Cloud size={20} color="white" />
        </div>
        <span>CloudDocs</span>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <button 
          className={`flex items-center gap-3 p-2 rounded-lg font-medium text-sm transition-all cursor-pointer text-left ${isActive(ROUTES.DASHBOARD.FOLDER_BASE) ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-bg-hover hover:text-text-main'}`} 
          onClick={() => navigate(ROUTES.DASHBOARD.FOLDER_ROOT)}
        >
          <HardDrive size={18} />
          <span>My Drive</span>
        </button>
        <button className="flex items-center gap-3 p-2 rounded-lg text-text-muted font-medium text-sm cursor-pointer transition-all text-left hover:bg-bg-hover hover:text-text-main">
          <Users size={18} />
          <span>Shared with me</span>
        </button>
        <button className="flex items-center gap-3 p-2 rounded-lg text-text-muted font-medium cursor-pointer text-sm transition-all text-left hover:bg-bg-hover hover:text-text-main">
          <Clock size={18} />
          <span>Recent</span>
        </button>
        <button 
          className={`flex items-center gap-3 p-2 rounded-lg font-medium text-sm transition-all cursor-pointer text-left ${isActive(ROUTES.DASHBOARD.TRASH) ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-bg-hover hover:text-text-main'}`}
          onClick={() => navigate(ROUTES.DASHBOARD.TRASH)}
        >
          <Trash2 size={18} />
          <span>Trash</span>
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-border-muted">
        <button 
          className="flex items-center cursor-pointer gap-3 p-2 rounded-lg text-text-muted font-medium text-sm transition-all text-left hover:bg-red-500/10 hover:text-red-500 w-full"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
