import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Package, ChevronRight, MapPin, X, RotateCcw } from "lucide-react";
import { orderService } from "../api/services";
import { OrderStatusBadge, Pagination } from "../components/SharedComponents";
import { PageLoader, EmptyState, ErrorMessage } from "../components/Loaders";
import ReturnItemModal from "../components/ReturnItemModal";
import { formatCurrency } from "../utils/helpers";
import toast from "react-hot-toast";

// ─── Order History ─────────────────────────────────────────────────────────────
export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = (p = 1) => {
    setLoading(true);
    orderService
      .getMyOrders({ page: p, limit: 10 })
      .then((r) => {
        setOrders(r.data.data || []);
        setPagination(r.data.pagination || {});
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No Orders Yet"
          description="Start shopping to see your orders here"
          action={
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          }
        />
      ) : (
        <div className="space-y-3 stagger">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-amber-400/40 group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-400/10 rounded flex items-center justify-center">
                  <Package size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="font-mono text-xs text-steel-500">
                    {order.orderNumber}
                  </p>
                  <p className="font-display font-700 text-sm uppercase text-steel-200 mt-0.5">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-steel-500 font-body mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <OrderStatusBadge status={order.status} />
                <div className="text-right">
                  <p className="font-display font-700 text-lg text-amber-400">
                    {formatCurrency(order.grandTotal)}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-steel-600 group-hover:text-amber-400 transition-colors"
                />
              </div>
            </Link>
          ))}
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPage={setPage}
          />
        </div>
      )}
    </div>
  );
}

// ─── Order Detail ──────────────────────────────────────────────────────────────
export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [itemToCancel, setItemToCancel] = useState(null);
  const [showItemCancelConfirm, setShowItemCancelConfirm] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [itemToReturn, setItemToReturn] = useState(null);

  useEffect(() => {
    orderService
      .getById(id)
      .then((r) => setOrder(r.data.data))
      .catch((e) => setError(e.response?.data?.message || "Order not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const { data } = await orderService.cancel(id, "Cancelled by buyer");
      setOrder(data.data);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel this order");
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelItem = async () => {
    if (!itemToCancel) return;
    setCancelling(true);
    try {
      const { data } = await orderService.cancelItem(id, itemToCancel.index);
      setOrder(data.data);
      toast.success(`${itemToCancel.name} cancelled successfully`);
      setItemToCancel(null);
      setShowItemCancelConfirm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel this item");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error)
    return (
      <div className="page-container">
        <ErrorMessage message={error} />
      </div>
    );

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-xs text-steel-500 mb-1">
            {order.orderNumber}
          </p>
          <h1 className="section-title">Order Details</h1>
          <p className="text-steel-500 text-sm font-body mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {["pending", "confirmed"].includes(order.status) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="btn-outline text-xs border-red-400/50 text-red-400 hover:border-red-400 py-1.5"
            >
              {cancelling ? "Cancelling…" : "Cancel Order"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-display font-700 text-sm uppercase tracking-widest text-steel-400">
            Items Ordered
          </h2>
          {order.items.map((item, i) => (
            <div
              key={i}
              className={`card p-4 flex gap-4 relative ${
                item.cancellationStatus === "cancelled"
                  ? "opacity-60 bg-red-950/20"
                  : ""
              }`}
            >
              <div className="w-16 h-16 bg-steel-800 rounded overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-steel-600">
                    📦
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-700 text-sm uppercase text-steel-200 truncate">
                    {item.name}
                  </p>
                  {item.status && (
                    <span className={`px-2 py-1 text-xs font-bold rounded border ${
                      item.status === "pending" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" :
                      item.status === "confirmed" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" :
                      item.status === "shipped" ? "bg-purple-500/10 text-purple-600 border-purple-500/30" :
                      item.status === "delivered" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
                      item.status === "cancelled" ? "bg-red-500/10 text-red-600 border-red-500/30" :
                      "bg-steel-700/10 text-steel-400"
                    }`}>
                      {item.status}
                    </span>
                  )}
                  {item.cancellationStatus === "cancelled" && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      CANCELLED
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-steel-500 mt-0.5">
                  Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <p className="font-display font-700 text-base text-amber-400">
                  {formatCurrency(item.totalPrice)}
                </p>
                {/* Cancel item button */}
                {item.cancellationStatus !== "cancelled" &&
                  !["delivered", "shipped"].includes(item.status) && (
                    <button
                      onClick={() => {
                        setItemToCancel({ index: i, name: item.name });
                        setShowItemCancelConfirm(true);
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                      title="Cancel this item"
                    >
                      <X size={18} />
                    </button>
                  )}
                {/* Return item button - only for delivered items */}
                {item.cancellationStatus !== "cancelled" && item.status === "delivered" && (
                  <button
                    onClick={() => {
                      setItemToReturn({ index: i, name: item.name, quantity: item.quantity, totalPrice: item.totalPrice });
                      setShowReturnModal(true);
                    }}
                    className="p-1.5 text-amber-400 hover:bg-amber-900/30 rounded transition-colors"
                    title="Return this item"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="card p-5 space-y-2 text-sm font-body">
            <div className="flex justify-between text-steel-400">
              <span>Items Total</span>
              <span className="font-mono">
                {formatCurrency(order.itemsTotal)}
              </span>
            </div>
            <div className="flex justify-between text-steel-400">
              <span>Shipping</span>
              <span
                className={`font-mono ${order.shippingCharges === 0 ? "text-emerald-400" : ""}`}
              >
                {order.shippingCharges === 0
                  ? "FREE"
                  : formatCurrency(order.shippingCharges)}
              </span>
            </div>
            <div className="divider" />
            <div className="flex justify-between items-center">
              <span className="font-display font-700 text-base uppercase text-steel-200">
                Grand Total
              </span>
              <span className="font-display font-800 text-xl text-amber-400">
                {formatCurrency(order.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Shipping address */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-amber-400" />
              <h3 className="font-display font-700 text-xs uppercase tracking-widest text-steel-400">
                Delivery Address
              </h3>
            </div>
            {order.shippingAddress && (
              <div className="text-sm font-body text-steel-300 space-y-0.5">
                <p className="font-600 text-steel-100">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p>{order.shippingAddress.pincode}</p>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h3 className="font-display font-700 text-xs uppercase tracking-widest text-steel-400 mb-2">
              Payment
            </h3>
            <p className="font-display font-700 text-sm uppercase text-steel-200">
              {order.paymentMethod?.toUpperCase()}
            </p>
            <span
              className={`badge mt-1 ${order.paymentInfo?.status === "paid" ? "badge-green" : "badge-gray"}`}
            >
              {order.paymentInfo?.status || "pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Item Cancellation Confirmation Dialog */}
      {showItemCancelConfirm && itemToCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-steel-900 border border-steel-800 rounded-lg p-6 max-w-md">
            <h3 className="font-display font-700 text-base uppercase text-steel-100 mb-2">
              Cancel Item?
            </h3>
            <p className="text-steel-400 text-sm mb-4">
              Are you sure you want to cancel{" "}
              <strong>{itemToCancel.name}</strong> from your order?
            </p>
            <p className="text-steel-500 text-xs mb-6">
              Stock will be returned to the seller and order total will be
              updated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setItemToCancel(null);
                  setShowItemCancelConfirm(false);
                }}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-steel-800 hover:bg-steel-700 text-steel-300 rounded text-sm font-medium transition-colors"
              >
                Keep Item
              </button>
              <button
                onClick={handleCancelItem}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
              >
                {cancelling ? "Cancelling…" : "Cancel Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Item Modal */}
      <ReturnItemModal
        isOpen={showReturnModal}
        item={itemToReturn}
        orderId={id}
        onClose={() => setShowReturnModal(false)}
        onSuccess={(returnData) => {
          setShowReturnModal(false);
          // Optionally reload order data
          orderService.getById(id)
            .then((r) => setOrder(r.data.data))
            .catch(() => {});
        }}
      />
    </div>
  );
}

export default OrderHistory;
