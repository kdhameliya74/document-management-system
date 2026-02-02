import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { useSelector } from 'react-redux';

const Header = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="h-16 flex items-center justify-between px-6 bg-bg-panel border-b border-border-muted">
      <div className="relative w-[400px]">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input 
          type="text" 
          placeholder="Search files, folders..." 
          className="w-full py-2 px-4 pl-10 border border-border-muted rounded-xl bg-bg-main text-sm text-text-main transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="text-text-muted p-2 rounded-full transition-all hover:bg-bg-hover hover:text-text-main">
          <Bell size={18} />
        </button>
        <button className="text-text-muted p-2 rounded-full transition-all hover:bg-bg-hover hover:text-text-main">
          <Settings size={18} />
        </button>
        <div className="flex items-center gap-2 cursor-pointer p-1 pr-2 rounded-xl transition-colors hover:bg-bg-hover">
          <div className="w-8 h-8 bg-linear-to-br from-secondary to-primary rounded-full flex items-center justify-center text-white font-normal text-sm">
            {user?.firstName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="font-medium text-sm text-text-main line-clamp-1">{user?.fullName || 'User'}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
