import { useState, useEffect } from "react";
import { Bell, Trash2, CheckCircle2 } from "lucide-react";
import { notificationService } from "../api/services";
import toast from "react-hot-toast";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications({ limit: 5 });
      setNotifications(response.data.data || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      fetchNotifications();
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order_placed: "📦",
      order_shipped: "🚚",
      order_delivered: "✅",
      order_cancelled: "❌",
      return_initiated: "🔄",
      return_approved: "✓️",
      return_rejected: "❌",
      return_refunded: "💰",
      payment_confirmed: "💳",
      payment_refunded: "💸",
      account_registered: "🎉",
      password_reset: "🔑",
    };
    return icons[type] || "🔔";
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-steel-300 hover:text-amber-400 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-mono font-700 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-steel-900 border border-steel-700 rounded-lg shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-steel-800 bg-steel-950 flex items-center justify-between">
            <h3 className="font-display font-700 text-steel-200">Notifications</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-steel-400 hover:text-steel-200"
            >
              ✕
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-steel-400">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 border-b border-steel-800 hover:bg-steel-800/50 transition-colors ${
                    !notif.read ? "bg-steel-800/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-600 text-xs uppercase text-steel-200">
                        {notif.title}
                      </p>
                      <p className="text-xs text-steel-400 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-steel-600 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif._id)}
                          title="Mark as read"
                          className="p-1 text-emerald-400 hover:bg-emerald-900/30 rounded transition-colors"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif._id)}
                        title="Delete"
                        className="p-1 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-steel-800 text-center">
              <a
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-display font-700 text-amber-400 hover:text-amber-300 uppercase tracking-wider"
              >
                View All Notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
