import { useState, useRef } from "react";
import {
  Bell,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

// Dummy data generator
const generateDummyNotifications = (page, limit = 10) => {
  const types = ["info", "success", "warning", "error"];
  const titles = [
    "File Shared",
    "Deployment Successful",
    "Security Alert",
    "System Update",
    "New Comment",
    "File Deleted",
    "Subscription Renewed",
    "Access Granted",
  ];
  const messages = [
    "John shared 'Budget_2024.pdf' with you.",
    "The client application was successfully deployed to production.",
    "A new login was detected from a new device in London.",
    "System maintenance scheduled for tonight at 2 AM.",
    "Sarah commented on your document 'Project Proposal'.",
    "The folder 'Legacy Documents' has been moved to trash.",
    "Your monthly subscription has been successfully renewed.",
    "You now have editor access to 'Annual Report'.",
  ];

  return Array.from({ length: limit }, (_, i) => {
    const id = page * limit + i + 1;
    const type = types[Math.floor(Math.random() * types.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString();

    return {
      id: `notification-${id}`,
      title,
      message,
      type,
      timestamp,
      read: Math.random() > 0.5,
    };
  });
};

const NotificationIcon = ({ type, className }) => {
  switch (type) {
    case "success":
      return <Check className={`text-green-500 ${className}`} size={16} />;
    case "warning":
      return <AlertTriangle className={`text-yellow-500 ${className}`} size={16} />;
    case "error":
      return <AlertCircle className={`text-red-500 ${className}`} size={16} />;
    default:
      return <Info className={`text-blue-500 ${className}`} size={16} />;
  }
};

const NotificationDropdown = ({ isOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);

  const fetchNotifications = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const nextPage = reset ? 0 : page;
    const newNotifications = generateDummyNotifications(nextPage);

    if (reset) {
      setNotifications(newNotifications);
      setPage(1);
    } else {
      setNotifications((prev) => [...prev, ...newNotifications]);
      setPage((prev) => prev + 1);
    }

    // Stop after 5 pages (50 notifications)
    if (nextPage >= 4) {
      setHasMore(false);
    }

    setLoading(false);
  };

  // useEffect(() => {
  //   if (isOpen) {
  //     fetchNotifications(true);
  //   }
  // }, [isOpen]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      fetchNotifications();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-bg-panel border border-border-main rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[500px] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="px-4 py-3 border-b border-border-muted flex items-center justify-between bg-bg-main/50 sticky top-0 z-10 backdrop-blur-sm">
        <span className="text-sm font-bold text-text-main">Notifications</span>
        <button className="text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded-lg hover:bg-primary/5">
          Mark all as read
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto py-2 divide-y divide-border-muted/30"
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
                key={notification.id}
                className={`px-4 py-3 hover:bg-bg-hover cursor-pointer transition-colors flex gap-3 relative group ${!notification.read ? "bg-primary/5" : ""}`}
              >
                {!notification.read && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
                <div
                  className={`p-2 rounded-xl shrink-0 h-fit ${
                    notification.type === "success"
                      ? "bg-green-500/10"
                      : notification.type === "warning"
                        ? "bg-yellow-500/10"
                        : notification.type === "error"
                          ? "bg-red-500/10"
                          : "bg-blue-500/10"
                  }`}
                >
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p
                      className={`text-sm font-bold truncate ${notification.read ? "text-text-main" : "text-primary"}`}
                    >
                      {notification.title}
                    </p>
                    <span className="text-[10px] text-text-dim whitespace-nowrap">
                      {new Date(notification.timestamp).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 bottom-3">
                  <button className="p-1 hover:bg-bg-panel rounded-lg border border-border-muted/50 transition-colors">
                    <MoreHorizontal size={12} className="text-text-muted" />
                  </button>
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

            {!hasMore && notifications.length > 0 && (
              <div className="py-4 text-center">
                <span className="text-[10px] text-text-dim uppercase tracking-wider font-medium">
                  End of notifications
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-2 border-t border-border-muted bg-bg-main/50">
        <button className="w-full py-2 text-xs font-semibold text-text-main hover:text-primary transition-colors text-center">
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
