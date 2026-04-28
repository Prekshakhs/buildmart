import React, { useState } from "react";
import { X, Loader, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { orderService, sellerService } from "../api/services";
import { useAuth } from "../context/AuthContext";

export default function OrderStatusModal({ order, isOpen, onClose, onStatusUpdated, isSeller = false }) {
  const { user } = useAuth();
  const [newStatus, setNewStatus] = useState(order?.status || "pending");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const statuses = [
    { value: "confirmed", label: "Confirm Order", description: "Order confirmed, ready to ship" },
    { value: "shipped", label: "Shipped", description: "Order shipped to buyer" },
    { value: "delivered", label: "Delivered", description: "Order delivered to buyer" },
    { value: "cancelled", label: "Cancel Order", description: "Cancel this order" },
  ];

  // Filter out current status and past statuses
  const availableStatuses = statuses.filter((s) => {
    if (order?.status === "pending") return true; // From pending, can go to any
    if (order?.status === "confirmed") return ["shipped", "cancelled"].includes(s.value);
    if (order?.status === "shipped") return ["delivered", "cancelled"].includes(s.value);
    if (order?.status === "delivered" || order?.status === "cancelled") return false;
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    setLoading(true);
    try {
      // Check if user is seller - use different endpoint
      if (isSeller || user?.role === "seller") {
        await sellerService.bulkUpdateStatus([order._id], newStatus, note);
      } else {
        await orderService.updateStatus(order._id, newStatus, note);
      }
      toast.success(`Order status updated to ${newStatus}`);
      onStatusUpdated?.();
      onClose?.();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-steel-900 border border-steel-700 rounded-lg max-w-md w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-steel-800">
          <h2 className="text-lg font-display font-700 text-steel-100">Update Order Status</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-steel-800 rounded transition-colors"
            type="button"
          >
            <X size={20} className="text-steel-400" />
          </button>
        </div>

        {/* Order Info */}
        <div className="px-4 bg-steel-950 rounded p-3 space-y-1">
          <p className="text-xs text-steel-500">Order Number</p>
          <p className="font-mono font-700 text-amber-400">{order.orderNumber}</p>
          <p className="text-xs text-steel-500 mt-2">Current Status</p>
          <p className="text-sm capitalize text-steel-300 font-semibold">{order.status}</p>
        </div>

        {/* Status Selection */}
        <form onSubmit={handleSubmit} className="px-4 space-y-4">
          <div>
            <label className="label">New Status</label>
            <div className="space-y-2">
              {availableStatuses.length > 0 ? (
                availableStatuses.map((status) => (
                  <label key={status.value} className="flex items-start gap-3 p-3 rounded border-2 cursor-pointer transition-colors hover:bg-steel-800/30" style={{borderColor: newStatus === status.value ? '#f59e0b' : '#1e293b'}}>
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={newStatus === status.value}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-steel-100">{status.label}</p>
                      <p className="text-xs text-steel-400">{status.description}</p>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-steel-400">
                  ✅ Order is in final status. No further updates available.
                </p>
              )}
            </div>
          </div>

          {availableStatuses.length > 0 && (
            <>
              {/* Note */}
              <div>
                <label className="label">Update Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Shipped via DHL - Tracking: ABC123"
                  maxLength={200}
                  rows="3"
                  className="input text-xs resize-none"
                />
                <p className="text-xs text-steel-500 mt-1 text-right">
                  {note.length}/200
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-3 py-2 bg-steel-800 hover:bg-steel-700 text-steel-300 rounded text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
