import React, { useState, useEffect } from "react";
import { Package, AlertCircle, TrendingUp, Zap } from "lucide-react";
import { sellerService, orderService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { PageLoader, ErrorMessage } from "../components/Loaders";
import OrdersTable from "../components/OrdersTable";
import OrderStatusModal from "../components/OrderStatusModal";
import { formatCurrency } from "../utils/helpers";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Fetch dashboard stats
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Fetch orders when status filter changes
  useEffect(() => {
    fetchOrders(1);
  }, [selectedStatus]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await sellerService.getDashboard();
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (page = 1) => {
    try {
      setOrdersLoading(true);
      const params = {
        page,
        limit: 10,
      };
      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }
      const response = await sellerService.getOrders(params);
      setOrders(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleStatusUpdated = () => {
    fetchDashboardStats();
    fetchOrders(pagination.page);
  };

  const handleViewDetails = (order) => {
    // In a real app, you might navigate to a detail page
    console.log("View details:", order);
  };

  if (loading) return <PageLoader />;
  if (error)
    return (
      <div className="page-container">
        <ErrorMessage message={error} />
      </div>
    );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-800 text-4xl uppercase text-steel-50 mb-2">
          Seller Dashboard
        </h1>
        <p className="text-steel-400">Manage your orders and track sales performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Orders */}
        <div className="bg-steel-900 border border-steel-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-steel-500 uppercase tracking-widest">
              Total Orders
            </p>
            <Package size={20} className="text-amber-400" />
          </div>
          <p className="font-display font-800 text-3xl text-steel-100">
            {stats?.orders?.total || 0}
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-steel-900 border border-yellow-500/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-yellow-600 uppercase tracking-widest">
              Pending
            </p>
            <AlertCircle size={20} className="text-yellow-500" />
          </div>
          <p className="font-display font-800 text-3xl text-yellow-400">
            {stats?.orders?.pending || 0}
          </p>
        </div>

        {/* Shipped Orders */}
        <div className="bg-steel-900 border border-purple-500/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-purple-600 uppercase tracking-widest">
              Shipped
            </p>
            <Zap size={20} className="text-purple-500" />
          </div>
          <p className="font-display font-800 text-3xl text-purple-400">
            {stats?.orders?.shipped || 0}
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-steel-900 border border-emerald-500/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-emerald-600 uppercase tracking-widest">
              Revenue
            </p>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="font-display font-800 text-2xl text-emerald-400">
            {formatCurrency(stats?.revenue?.total || 0)}
          </p>
        </div>
      </div>

      <div className="divider my-8" />

      {/* Orders Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-700 text-steel-100">Your Orders</h2>

          {/* Status Filter */}
          <div className="flex gap-2">
            {["all", "pending", "confirmed", "shipped", "delivered"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide transition-colors ${
                  selectedStatus === status
                    ? "bg-amber-500 text-white"
                    : "bg-steel-800 text-steel-300 hover:bg-steel-700"
                }`}
                type="button"
              >
                {status === "all" ? "All" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <OrdersTable
          orders={orders}
          loading={ordersLoading}
          onStatusUpdate={handleStatusUpdate}
          onViewDetails={handleViewDetails}
        />

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => fetchOrders(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-steel-800 hover:bg-steel-700 disabled:opacity-50 disabled:cursor-not-allowed text-steel-300 rounded transition-colors"
              type="button"
            >
              Previous
            </button>
            <span className="text-sm text-steel-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchOrders(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 bg-steel-800 hover:bg-steel-700 disabled:opacity-50 disabled:cursor-not-allowed text-steel-300 rounded transition-colors"
              type="button"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <OrderStatusModal
        order={selectedOrder}
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onStatusUpdated={handleStatusUpdated}
        isSeller={true}
      />
    </div>
  );
}
