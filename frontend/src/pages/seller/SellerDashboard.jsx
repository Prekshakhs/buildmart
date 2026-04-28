import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { sellerService } from "../../api/services";
import { PageLoader } from "../../components/Loaders";
import { formatCurrency } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import { StatCard } from "../../components/SellerDashboard/StatCard";
import { OrderFilters } from "../../components/SellerDashboard/OrderFilters";
import { BulkActions } from "../../components/SellerDashboard/BulkActions";
import { SellerProfile } from "../../components/SellerDashboard/SellerProfile";
import { OrdersTable } from "../../components/OrdersTable";
import ReturnRequestsUI from "../../components/ReturnRequestsUI";
import { toast } from "react-toastify";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    search: "",
    page: 1,
  });

  // Fetch basic dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await sellerService.getDashboard();
        setStats(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };
    fetchStats();
  }, []);

  // Fetch detailed dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await sellerService.getDashboardStats();
        setDashboardStats(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchDashboardStats();
  }, []);

  // Fetch orders with filters
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = {
          page: filters.page,
          limit: 10,
          status: filters.status !== "all" ? filters.status : undefined,
        };
        const response = await sellerService.getOrders(params);
        setOrders(response.data.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [filters.page, filters.status]);


  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setSelectedOrderIds([]);
  }, []);

  const handleBulkAction = async (type, data) => {
    if (type === "selectAll") {
      if (data) {
        setSelectedOrderIds(orders.map((o) => o._id));
      } else {
        setSelectedOrderIds([]);
      }
    } else if (type === "bulkUpdate") {
      try {
        setBulkLoading(true);
        await sellerService.bulkUpdateStatus(
          data.orderIds,
          data.status,
          "Bulk status update",
        );

        // Refresh orders
        const response = await sellerService.getOrders({
          page: filters.page,
          limit: 10,
          status: filters.status !== "all" ? filters.status : undefined,
        });
        setOrders(response.data.data || []);
        setSelectedOrderIds([]);
      } catch (error) {
        console.error("Error updating orders:", error);
      } finally {
        setBulkLoading(false);
      }
    }
  };

  const handleRowSelect = (orderId) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  if (loading && !stats) return <PageLoader />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-1">
            Welcome back
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.sellerInfo?.businessName || user?.name}
          </h1>
        </div>
        <Link
          to="/seller/products/new"
          className="btn-primary flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Seller Profile */}
      <SellerProfile seller={user} />

      {/* Statistics Grid - Enhanced with new stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardStats && (
          <>
            <StatCard
              icon={AlertCircle}
              label="Pending Items"
              value={dashboardStats.pendingItems}
              color="orange"
            />
            <StatCard
              icon={ShoppingBag}
              label="Confirmed Orders"
              value={dashboardStats.orders.confirmed}
              color="blue"
            />
            <StatCard
              icon={Package}
              label="Shipped Orders"
              value={dashboardStats.orders.shipped}
              color="purple"
            />
            <StatCard
              icon={BarChart3}
              label="Delivered Orders"
              value={dashboardStats.orders.delivered}
              color="green"
            />
          </>
        )}

        {stats && (
          <>
            <StatCard
              icon={TrendingUp}
              label="Total Revenue"
              value={formatCurrency(stats.revenue.total)}
              color="blue"
            />
            <StatCard
              icon={Package}
              label="Products"
              value={stats.products.total}
              color="green"
            />
            <StatCard
              icon={AlertCircle}
              label="Out of Stock"
              value={stats.products.outOfStock}
              color="red"
            />
            <StatCard
              icon={DollarSign}
              label="This Month"
              value={
                dashboardStats
                  ? formatCurrency(dashboardStats.revenue.thisMonth)
                  : "$0"
              }
              color="green"
            />
          </>
        )}
      </div>

      {/* Order status breakdown */}
      {stats && dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Order Status Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Status Overview
            </h2>
            <div className="space-y-4">
              {[
                { key: "pending", label: "Pending", color: "bg-gray-400" },
                { key: "confirmed", label: "Confirmed", color: "bg-blue-400" },
                { key: "shipped", label: "Shipped", color: "bg-yellow-400" },
                { key: "delivered", label: "Delivered", color: "bg-green-400" },
              ].map(({ key, label, color }) => {
                const count = dashboardStats.orders[key] || 0;
                const total = dashboardStats.orders.total || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700">
                        {label}
                      </p>
                      <span className="text-sm font-bold text-gray-900">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                {
                  to: "/seller/products/new",
                  label: "Add New Product",
                  icon: "➕",
                },
                {
                  to: "/seller/products",
                  label: "Manage Products",
                  icon: "📦",
                },
                { to: "/seller/orders", label: "View Orders", icon: "📋" },
              ].map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">
                      {label}
                    </span>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-gray-400 group-hover:text-blue-600 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Return Requests Section */}
      <div className="mb-8">
        <ReturnRequestsUI />
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>

        {/* Filters */}
        <OrderFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedOrderIds.length}
          selectedOrderIds={selectedOrderIds}
          orders={orders}
          onBulkAction={handleBulkAction}
          loading={bulkLoading}
        />

        {/* Orders Table */}
        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading orders...
          </div>
        ) : orders.length > 0 ? (
          <OrdersTable
            orders={orders}
            onRowSelect={handleRowSelect}
            selectedOrderIds={selectedOrderIds}
            isSeller
          />
        ) : (
          <div className="py-8 text-center text-gray-500">
            No orders found. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}
