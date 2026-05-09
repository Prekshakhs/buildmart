import { useState, useEffect } from "react";
import { Trash2, CheckCircle2, Inbox } from "lucide-react";
import { notificationService } from "../api/services";
import { PageLoader, EmptyState } from "../components/Loaders";
import toast from "react-hot-toast";

const NOTIFICATION_TYPES = {
  order_placed: { label: "Order Placed", icon: "📦", color: "blue" },
  order_shipped: { label: "Order Shipped", icon: "🚚", color: "purple" },
  order_delivered: { label: "Order Delivered", icon: "✅", color: "green" },
  order_cancelled: { label: "Order Cancelled", icon: "❌", color: "red" },
  return_initiated: { label: "Return Initiated", icon: "🔄", color: "yellow" },
  return_approved: { label: "Return Approved", icon: "✓️", color: "green" },
  return_rejected: { label: "Return Rejected", icon: "❌", color: "red" },
  return_refunded: { label: "Refund Processed", icon: "💰", color: "green" },
  payment_confirmed: { label: "Payment Confirmed", icon: "💳", color: "green" },
  payment_refunded: { label: "Refund Processed", icon: "💸", color: "green" },
  account_registered: { label: "Account Created", icon: "🎉", color: "blue" },
  password_reset: { label: "Password Reset", icon: "🔑", color: "orange" },
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchNotifications();
  }, [filterType, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({
        page,
        limit: 20,
        type: filterType === "all" ? undefined : filterType,
      });
      setNotifications(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
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

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title mb-2">Notifications</h1>
          <p className="text-steel-400">All your notifications in one place</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn-outline text-xs py-1.5 px-3"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Type Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => { setFilterType("all"); setPage(1); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filterType === "all"
              ? "bg-amber-400 text-white"
              : "bg-steel-800 text-steel-300 hover:bg-steel-700"
          }`}
        >
          All
        </button>
        {[
          { key: "order_placed", label: "Orders" },
          { key: "return_initiated", label: "Returns" },
          { key: "payment_confirmed", label: "Payments" },
          { key: "account_registered", label: "Account" },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => { setFilterType(filter.key); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterType === filter.key
                ? "bg-amber-400 text-white"
                : "bg-steel-800 text-steel-300 hover:bg-steel-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No Notifications"
          description="You're all caught up!"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const typeInfo = NOTIFICATION_TYPES[notif.type] || {
              label: notif.type,
              icon: "📬",
            };
            return (
              <div
                key={notif._id}
                className={`card p-5 flex gap-4 hover:border-amber-400/40 transition-all ${
                  !notif.read ? "border-amber-400/60 bg-amber-400/5" : ""
                }`}
              >
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">{typeInfo.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-display font-700 text-sm uppercase text-steel-200">
                        {notif.title}
                      </h3>
                      <p className="text-xs text-steel-500 mt-0.5">
                        {typeInfo.label}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/50 rounded text-[10px] font-bold text-amber-400 flex-shrink-0">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-steel-300 mb-3">{notif.message}</p>
                  <p className="text-xs text-steel-600">
                    {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      title="Mark as read"
                      className="p-2 text-emerald-400 hover:bg-emerald-900/30 rounded transition-colors"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif._id)}
                    title="Delete"
                    className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-steel-800 hover:bg-steel-700 disabled:opacity-50 disabled:cursor-not-allowed text-steel-300 rounded text-sm transition-colors"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-amber-400 text-white"
                    : "bg-steel-800 text-steel-300 hover:bg-steel-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-steel-800 hover:bg-steel-700 disabled:opacity-50 disabled:cursor-not-allowed text-steel-300 rounded text-sm transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
