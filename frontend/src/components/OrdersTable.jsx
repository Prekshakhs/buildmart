import React, { useState } from "react";
import { ChevronDown, Package, Truck, CheckCircle, Clock, Edit2, X } from "lucide-react";
import { formatCurrency } from "../utils/helpers";

export function OrdersTable({
  orders = [],
  loading = false,
  onStatusUpdate = null,
  onViewDetails = null,
  onCancelItem = null,
  selectedOrderIds = [],
  onRowSelect = null,
  isSeller = false,
}) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [itemToCancel, setItemToCancel] = useState(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "shipped":
        return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case "delivered":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      default:
        return "bg-steel-700/10 text-steel-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={14} />;
      case "confirmed":
        return <CheckCircle size={14} />;
      case "shipped":
        return <Truck size={14} />;
      case "delivered":
        return <Package size={14} />;
      default:
        return null;
    }
  };

  const handleCancelItem = async () => {
    if (itemToCancel && onCancelItem) {
      await onCancelItem(itemToCancel.orderId, itemToCancel.itemIndex);
      setItemToCancel(null);
      setConfirmingCancel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Package size={48} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500">No orders yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {orders.map((order) => {
          const isSelected = selectedOrderIds.includes(order._id);
          return (
            <div
              key={order._id}
              className={`border rounded-lg overflow-hidden transition-all ${
                isSelected
                  ? "bg-blue-50 border-blue-400 shadow-md"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Order Header */}
              <div className="p-4 flex items-center gap-4">
                {/* Checkbox - Only show on seller dashboard */}
                {isSeller && onRowSelect && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onRowSelect(order._id)}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                )}

                {/* Expand/Collapse Button */}
                <button
                  onClick={() =>
                    setExpandedOrder(expandedOrder === order._id ? null : order._id)
                  }
                  className="p-0 hover:bg-gray-100 rounded transition-colors"
                  type="button"
                >
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      expandedOrder === order._id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Order Number & Date */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} •{" "}
                    {order.buyer?.name || "Customer"}
                  </p>
                </div>

                {/* Items Count */}
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{order.items?.length}</p>
                  <p className="text-xs text-gray-500">items</p>
                </div>

                {/* Total Amount */}
                <div className="text-right min-w-[100px]">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(order.grandTotal)}
                  </p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>

                {/* Status Badge - Show item statuses for sellers */}
                {isSeller ? (
                  <div className="flex flex-col gap-1">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-1 rounded border flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(
                          item.status || order.status
                        )}`}
                      >
                        {getStatusIcon(item.status || order.status)}
                        {item.status || order.status}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`px-3 py-1 rounded border flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedOrder === order._id && (
                <div className="bg-gray-50 border-t border-gray-200 p-4 space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
                      {isSeller ? "Your Items in This Order" : "Order Items"}
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className={`p-3 rounded border flex justify-between items-start ${
                          item.cancellationStatus === "cancelled"
                            ? "bg-red-50 border-red-200 opacity-60"
                            : "bg-white border-gray-200"
                        }`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-gray-900 font-medium">{item.name}</p>
                              {item.cancellationStatus === "cancelled" && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                  CANCELLED
                                </span>
                              )}
                              {item.status && (
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </p>
                            {/* Cancel button - only for buyers, if order is cancellable, and item not already cancelled */}
                            {!isSeller &&
                              !["delivered", "shipped"].includes(order.status) &&
                              item.cancellationStatus !== "cancelled" &&
                              onCancelItem && (
                                <button
                                  onClick={() => {
                                    setItemToCancel({ orderId: order._id, itemIndex: idx, itemName: item.name });
                                    setConfirmingCancel(true);
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                  title="Cancel this item"
                                  type="button"
                                >
                                  <X size={16} />
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">
                        Delivery Address
                      </h4>
                      <div className="text-xs text-gray-700 space-y-0.5">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                          {order.shippingAddress.pincode}
                        </p>
                        <p>📱 {order.shippingAddress.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Status History */}
                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">
                        Status History
                      </h4>
                      <div className="space-y-1 text-xs">
                        {order.statusHistory.map((entry, idx) => (
                          <div key={idx} className="flex justify-between text-gray-600">
                            <span>
                              <span className="text-gray-900 capitalize font-semibold">
                                {entry.status}
                              </span>{" "}
                              - {entry.note}
                            </span>
                            <span className="text-gray-500">
                              {new Date(entry.updatedAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onViewDetails?.(order)}
                      className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      type="button"
                    >
                      <Package size={14} />
                      Full Details
                    </button>
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <button
                        onClick={() => onStatusUpdate?.(order)}
                        className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        type="button"
                      >
                        <Edit2 size={14} />
                        Update Status
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Item Cancellation Confirmation Dialog */}
      {confirmingCancel && itemToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Cancel Item?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel <strong>{itemToCancel.itemName}</strong> from your order?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The stock will be returned to the seller and the order total will be updated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setItemToCancel(null);
                  setConfirmingCancel(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition"
              >
                Keep Item
              </button>
              <button
                onClick={handleCancelItem}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition"
              >
                Cancel Item
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OrdersTable;
