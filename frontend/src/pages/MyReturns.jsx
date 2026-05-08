import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RotateCcw, Package, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { orderService } from "../api/services";
import { PageLoader, EmptyState } from "../components/Loaders";
import { formatCurrency } from "../utils/helpers";
import toast from "react-hot-toast";

const RETURN_REASONS = {
  defective: "🔧 Defective / Not Working",
  wrong_item: "❌ Wrong Item Received",
  not_as_described: "📷 Not as Described",
  damaged: "💥 Damaged on Delivery",
  changed_mind: "🤔 Changed Mind",
  better_price_elsewhere: "💰 Better Price Elsewhere",
  quality_issues: "⭐ Quality Issues",
  other: "📝 Other",
};

const STATUS_COLORS = {
  initiated: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  pending_seller_approval: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  approved: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  return_shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  return_received: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  refund_processed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  rejected: "bg-red-500/10 text-red-600 border-red-500/30",
  cancelled: "bg-gray-500/10 text-gray-600 border-gray-500/30",
};

const STATUS_LABELS = {
  initiated: "Return Initiated",
  pending_seller_approval: "Awaiting Seller",
  approved: "Approved",
  return_shipped: "Shipped Back",
  return_received: "Received",
  refund_processed: "Refunded",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function MyReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchReturns();
  }, [filterStatus]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyReturns({
        status: filterStatus === "all" ? undefined : filterStatus,
      });
      setReturns(response.data.data || []);
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  const getReturnDaysRemaining = (initiatedAt) => {
    const created = new Date(initiatedAt);
    const expiryDate = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.ceil((expiryDate - new Date()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysRemaining);
  };

  const getStatusStep = (status) => {
    const steps = {
      initiated: 1,
      pending_seller_approval: 1,
      approved: 2,
      return_shipped: 3,
      return_received: 4,
      refund_processed: 5,
    };
    return steps[status] || 0;
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title mb-2">My Returns</h1>
        <p className="text-steel-400">Track and manage your return requests</p>
      </div>

      {/* Status Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "initiated", label: "Initiated" },
          { value: "pending_seller_approval", label: "Awaiting Seller" },
          { value: "approved", label: "Approved" },
          { value: "return_shipped", label: "Shipped" },
          { value: "return_received", label: "Received" },
          { value: "refund_processed", label: "Refunded" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterStatus === filter.value
                ? "bg-amber-400 text-white"
                : "bg-steel-800 text-steel-300 hover:bg-steel-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Returns List */}
      {returns.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No Returns"
          description={
            filterStatus === "all"
              ? "You haven't initiated any returns yet"
              : `No returns with status "${filterStatus}"`
          }
          action={
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div
              key={ret._id}
              className="card p-5 hover:border-amber-400/40 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-steel-800 rounded overflow-hidden flex-shrink-0">
                  {ret.productImage ? (
                    <img
                      src={ret.productImage}
                      alt={ret.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-steel-600">
                      📦
                    </div>
                  )}
                </div>

                {/* Return Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-display font-700 text-sm uppercase text-steel-200">
                        {ret.productName}
                      </h3>
                      <p className="text-xs font-mono text-steel-500 mt-0.5">
                        Qty: {ret.quantity} • Refund: {formatCurrency(ret.refundAmount)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${
                          STATUS_COLORS[ret.status] || STATUS_COLORS.initiated
                        }`}
                      >
                        {STATUS_LABELS[ret.status] || ret.status}
                      </span>
                    </div>
                  </div>

                  {/* Return Reason */}
                  <p className="text-xs text-steel-400 mb-3">
                    <span className="font-semibold">Reason:</span> {RETURN_REASONS[ret.reason] || ret.reason}
                  </p>

                  {/* Status Timeline */}
                  <div className="mb-3 py-2 px-3 bg-steel-800/50 rounded flex items-center gap-2 text-xs">
                    <div className="flex gap-1.5 flex-1">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 h-1.5 rounded-full transition-all ${
                            getStatusStep(ret.status) >= step
                              ? "bg-emerald-500"
                              : "bg-steel-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Return Window Countdown */}
                  {ret.status !== "refund_processed" &&
                    ret.status !== "rejected" &&
                    ret.status !== "cancelled" && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400">
                        <Clock size={14} />
                        <span>
                          {getReturnDaysRemaining(ret.initiatedAt)} days remaining in
                          return window
                        </span>
                      </div>
                    )}

                  {ret.status === "refund_processed" && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <RotateCcw size={14} />
                      <span>Refund completed on{" "}
                        {new Date(ret.refundedAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  )}

                  {ret.status === "rejected" && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle size={14} />
                      <span>Return request rejected by seller</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/orders/${ret.order}`)}
                    className="btn-outline text-xs py-1.5"
                  >
                    View Order
                  </button>
                  {ret.status === "initiated" && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Cancel this return request?"
                          )
                        ) {
                          toast.info("Coming soon");
                        }
                      }}
                      className="btn-outline text-xs py-1.5 border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Status Notes */}
              {ret.statusHistory && ret.statusHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-steel-800">
                  <p className="text-xs text-steel-500 font-semibold mb-2">
                    Status History:
                  </p>
                  <div className="space-y-1">
                    {ret.statusHistory.slice(-2).map((history, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-steel-400 flex justify-between"
                      >
                        <span>{STATUS_LABELS[history.status]}</span>
                        <span className="text-steel-600">
                          {new Date(history.updatedAt).toLocaleDateString("en-IN")}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
