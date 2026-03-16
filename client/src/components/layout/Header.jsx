import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Bell, X } from "lucide-react";

import ROUTES from "@/utils/routes";
import { useGlobalSearch } from "@/hooks/useGloablSearch";
import GlobalSearchResults from "./GlobalSearchResults";
import NotificationDropdown from "./NotificationDropdown";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { results, loading, loadingMore, hasMore, totalResults, loadMore } =
    useGlobalSearch(searchQuery);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsSearchFocused(false); // Close search when opening notifications
  };

  return (
    <div className="h-20 flex items-center justify-between px-8 bg-bg-main border-b border-border-muted relative z-30">
      <div className="relative w-[450px] group" ref={searchRef}>
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors z-20"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            setIsSearchFocused(true);
            setIsNotificationsOpen(false); // Close notifications when focusing search
          }}
          placeholder="Search for anything..."
          className="w-full py-2.5 px-6 pl-12 pr-10 border border-border-main rounded-2xl bg-bg-panel text-sm text-text-main transition-all outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 shadow-inner group-hover:border-border-muted relative z-10"
        />
        {searchQuery.length > 0 && (
          <button
            onClick={handleClearSearch}
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-main hover:bg-bg-hover rounded-full transition-colors z-20"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}

        <GlobalSearchResults
          isSearchFocused={isSearchFocused}
          searchQuery={searchQuery}
          results={results}
          totalResults={totalResults}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          loadMore={loadMore}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 border-r border-border-muted pr-6 relative" ref={notificationRef}>
          <button 
            onClick={toggleNotifications}
            className={`text-text-muted p-2.5 rounded-xl transition-all hover:bg-bg-hover hover:text-text-main group relative border ${isNotificationsOpen ? 'border-primary/50 bg-primary/5 text-primary' : 'border-transparent hover:border-border-muted'}`}
          >
            <Bell size={20} strokeWidth={1.5} />
            <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-bg-main" />
          </button>

          <NotificationDropdown 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
          />
        </div>

        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate(ROUTES.APP.PROFILE)}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-text-main leading-none group-hover:text-primary transition-colors">
              {user?.fullName || "Guest User"}
            </p>
            <p className="text-[11px] text-text-dim font-medium mt-1 uppercase tracking-wide">
              Member
            </p>
          </div>
          <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-primary font-bold text-sm shadow-lg shadow-indigo-500/5 group-hover:scale-105 transition-all overflow-hidden group-hover:shadow-primary/20">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.firstName?.charAt(0).toUpperCase() || "U"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
