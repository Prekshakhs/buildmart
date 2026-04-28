import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Truck, Package } from "lucide-react";
import { toast } from "react-toastify";
import { sellerService } from "../api/services";
import { formatCurrency } from "../utils/helpers";

const RETURN_REASONS = {
  defective: "🔧 Defective",
  wrong_item: "❌ Wrong Item",
  not_as_described: "📷 Not Described",
  damaged: "💥 Damaged",
  changed_mind: "🤔 Changed Mind",
  better_price_elsewhere: "💰 Better Price",
  quality_issues: "⭐ Quality Issues",
  other: "📝 Other",
};

export default function ReturnRequestsUI() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("requested");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReturns();
  }, [status, page]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await sellerService.getReturnRequests({ status, page });
      setReturns(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId, itemIndex) => {
    try {
      await sellerService.approveReturn(orderId, itemIndex);
      toast.success("Return approved!");
      fetchReturns();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (orderId, itemIndex) => {
    try {
      await sellerService.rejectReturn(orderId, itemIndex);
      toast.success("Return rejected!");
      fetchReturns();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    }
  };

  const handleConfirmReceived = async (orderId, itemIndex) => {
    try {
      await sellerService.confirmReturnReceived(orderId, itemIndex);
      toast.success("Return received & refund processed!");
      fetchReturns();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm");
    }
  };

  if (loading && returns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Loading returns...
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No return requests for this status
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with Status Tabs */}
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Return Requests
        </h2>
        <div className="flex gap-2 flex-wrap">
          {["requested", "approved", "shipped", "received", "refunded"].map(
            (s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  status === s
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Returns Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Product
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Buyer
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Reason
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Refund Amount
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Status
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {returns.map((order, idx) => {
              const item = order.items;
              const buyer = order.buyerData?.[0];
              const returnStatus = item.returnStatus;

              return (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Product */}
                  <td className="py-3 px-4">
                    <div className="max-w-xs">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </td>

                  {/* Buyer */}
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {buyer?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {buyer?.email || ""}
                      </p>
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="py-3 px-4">
                    <span className="text-gray-700">
                      {RETURN_REASONS[item.returnReason] || item.returnReason}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.returnDescription}
                    </p>
                  </td>

                  {/* Refund Amount */}
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {formatCurrency(item.totalPrice)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        returnStatus === "requested"
                          ? "bg-yellow-100 text-yellow-800"
                          : returnStatus === "approved"
                            ? "bg-blue-100 text-blue-800"
                            : returnStatus === "shipped"
                              ? "bg-purple-100 text-purple-800"
                              : returnStatus === "received"
                                ? "bg-cyan-100 text-cyan-800"
                                : "bg-green-100 text-green-800"
                      }`}
                    >
                      {returnStatus === "shipped" && <Truck size={12} />}
                      {returnStatus === "received" && <Package size={12} />}
                      {returnStatus.charAt(0).toUpperCase() +
                        returnStatus.slice(1)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {returnStatus === "requested" && (
                        <>
                          <button
                            onClick={() =>
                              handleApprove(order._id, item.id || 0)
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors font-medium text-xs"
                            title="Approve return"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleReject(order._id, item.id || 0)
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium text-xs"
                            title="Reject return"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </>
                      )}

                      {returnStatus === "shipped" && (
                        <button
                          onClick={() =>
                            handleConfirmReceived(order._id, item.id || 0)
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200 transition-colors font-medium text-xs"
                          title="Confirm return received & process refund"
                        >
                          <CheckCircle size={14} />
                          Confirm Received
                        </button>
                      )}

                      {returnStatus === "refunded" && (
                        <span className="text-green-600 font-medium text-xs">
                          ✓ Refunded
                        </span>
                      )}

                      {returnStatus === "rejected" && (
                        <span className="text-red-600 font-medium text-xs">
                          ✗ Rejected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
