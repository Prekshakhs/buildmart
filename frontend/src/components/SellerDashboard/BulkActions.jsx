import React, { useState } from "react";

export function BulkActions({ selectedCount, selectedOrderIds, orders, onBulkAction, loading }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("confirmed");

  const handleSelectAll = (e) => {
    onBulkAction("selectAll", e.target.checked);
  };

  const handleApplyBulk = () => {
    if (selectedCount > 0 && selectedStatus) {
      setShowConfirm(true);
    }
  };

  const confirmBulkAction = () => {
    onBulkAction("bulkUpdate", {
      orderIds: selectedOrderIds,
      status: selectedStatus,
    });
    setShowConfirm(false);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <input
            type="checkbox"
            checked={selectedCount === orders.length}
            onChange={handleSelectAll}
            disabled={orders.length === 0}
            className="w-5 h-5 text-blue-600 rounded cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} order{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Status</option>
            <option value="pending">Mark as Pending</option>
            <option value="confirmed">Mark as Confirmed</option>
            <option value="shipped">Mark as Shipped</option>
            <option value="delivered">Mark as Delivered</option>
            <option value="cancelled">Cancel Orders</option>
          </select>

          <button
            onClick={handleApplyBulk}
            disabled={!selectedStatus || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition"
          >
            {loading ? "Updating..." : "Apply"}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Bulk Update
            </h3>
            <p className="text-gray-600 mb-6">
              You are about to update <strong>{selectedCount}</strong> order{selectedCount !== 1 ? "s" : ""} to <strong>{selectedStatus}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkAction}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition"
              >
                {loading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
