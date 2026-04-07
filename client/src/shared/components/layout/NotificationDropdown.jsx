import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNotifications,
  markAllRead,
  markOneRead,
} from "@/features/notifications/store/notification.slice";
import { Bell, Share, Info, AlertCircle, Loader2, CheckCheck, X } from "lucide-react";
import { logError } from "@/shared/utils/utils";
import { format } from "date-fns";

const NotificationIcon = ({ type, className }) => {
  switch (type) {
    case "doc_shared":
      return <Share className={`text-green-500 ${className}`} size={16} />;
    case "doc_shared_removed":
      return <X className={`text-red-500 ${className}`} size={16} />;
    case "doc_deleted":
      return <AlertCircle className={`text-red-500 ${className}`} size={16} />;
    default:
      return <Info className={`text-blue-500 ${className}`} size={16} />;
  }
};

const NotificationDropdown = ({ isOpen }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1); // we already fetched page 1 on login
  const dropdownRef = useRef(null);
  const { hasMore, items: notifications } = useSelector((state) => state.notifications);

  const loadMoreNotifications = async () => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      setPage((prev) => prev + 1);
      await dispatch(fetchNotifications({ page, limit: 10 }));
    } catch (error) {
      logError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMoreNotifications();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-bg-main top-full right-0 mt-2 w-80 border border-border-main rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[500px] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="px-4 py-3 border-b border-border-muted flex items-center justify-between bg-bg-main/50 sticky top-0 z-10 backdrop-blur-sm">
        <span className="text-sm font-bold text-text-main">Notifications</span>
        <button
          onClick={() => dispatch(markAllRead())}
          className="cursor-pointer text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
        >
          Mark all as read
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto divide-y divide-border-muted/70"
        onScroll={handleScroll}
      >
        {notifications.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-dim px-4 text-center">
            <div className="w-12 h-12 bg-bg-main rounded-2xl flex items-center justify-center mb-4 border border-border-muted/50 shadow-sm">
              <Bell size={22} className="text-text-dim" />
            </div>
            <p className="text-sm font-medium text-text-main">No notifications yet</p>
            <p className="text-xs mt-1">We'll let you know when something happens.</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id + notification.createdAt}
                className={`px-4 py-3 hover:bg-bg-hover cursor-pointer transition-colors flex gap-3 relative group ${!notification.read ? "bg-primary/5" : ""}`}
              >
                {!notification.isRead && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
                <div className={`p-2 rounded-xl shrink-0 h-fit`}>
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p
                      className={`text-sm font-medium ${notification.isRead ? "text-text-main" : "text-primary"}`}
                    >
                      {notification.message}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(markOneRead(notification.id));
                      }}
                      className={`opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity shrink-0 p-1 rounded-full hover:bg-primary/10 ${
                        notification.isRead ? "invisible" : ""
                      }`}
                      title="Mark as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-primary" />
                    </button>
                    <span className="text-[10px] text-text-dim whitespace-nowrap">
                      {format(new Date(notification.createdAt), "MMM d")}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="py-4 flex justify-center border-t border-border-muted/10">
                <div className="flex items-center gap-2 text-xs text-primary font-medium bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 shadow-sm">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Loading more...</span>
                </div>
              </div>
            )}

            {/* {!hasMore && notifications.length > 0 && (
              <div className="py-4 text-center">
                <span className="text-[10px] text-text-dim uppercase tracking-wider font-medium">
                  End of notifications
                </span>
              </div>
            )} */}
          </>
        )}
      </div>

      {/* <div className="p-2 border-t border-border-muted bg-bg-main/50">
        <button className="w-full py-2 text-xs font-semibold text-text-main hover:text-primary transition-colors text-center">
          View all notifications
        </button>
      </div> */}
    </div>
  );
};

export default NotificationDropdown;
