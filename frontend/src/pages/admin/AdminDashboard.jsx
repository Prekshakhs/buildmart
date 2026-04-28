import { useState, useEffect } from "react";
import { Users, Package, ShoppingBag, TrendingUp, CheckCircle, Ban } from "lucide-react";
import { adminService } from "../../api/services";
import { PageLoader, EmptyState } from "../../components/Loaders";
import { OrderStatusBadge, Pagination } from "../../components/SharedComponents";
import AdminLayout from "../../components/AdminLayout";
import { formatCurrency, getErrMsg } from "../../utils/helpers";
import toast from "react-hot-toast";

// ─── Admin Dashboard ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then((r) => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const cards = stats ? [
    { label: "Total Buyers", value: stats.users.buyers, icon: <Users size={18} />, accent: false },
    { label: "Active Sellers", value: stats.users.sellers, icon: <Package size={18} />, accent: false },
    { label: "Pending Sellers", value: stats.users.pendingSellers, icon: <Users size={18} />, accent: stats.users.pendingSellers > 0 },
    { label: "Total Orders", value: stats.orders, icon: <ShoppingBag size={18} />, accent: false },
    { label: "Products Listed", value: stats.products, icon: <Package size={18} />, accent: false },
    { label: "Platform Revenue", value: formatCurrency(stats.revenue), icon: <TrendingUp size={18} />, accent: true },
  ] : [];

  return (
    <AdminLayout>
      <div>
        <h1 className="section-title mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {cards.map(({ label, value, icon, accent }) => (
            <div key={label} className={`card p-6 ${accent ? "border-amber-400/30 bg-amber-400/5" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-display font-700 text-xs uppercase tracking-widest text-steel-400">{label}</p>
                <div className={`w-9 h-9 rounded flex items-center justify-center ${accent ? "bg-amber-400/20 text-amber-400" : "bg-steel-800 text-steel-400"}`}>
                  {icon}
                </div>
              </div>
              <p className={`font-display font-800 text-3xl ${accent ? "text-amber-400" : "text-steel-50"}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── Admin Users ───────────────────────────────────────────────────────────────
export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");

  const load = (p = 1) => {
    setLoading(true);
    adminService.getUsers({ page: p, limit: 15, role: roleFilter })
      .then((r) => { setUsers(r.data.data || []); setPagination(r.data.pagination || {}); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page, roleFilter]);

  const handleToggle = async (id) => {
    try {
      const { data } = await adminService.toggleUser(id);
      setUsers((u) => u.map((usr) => usr._id === id ? { ...usr, isActive: data.data.isActive } : usr));
      toast.success(data.message);
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveSeller(id);
      toast.success("Seller approved!");
      load(page);
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  if (loading) return <PageLoader />;

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="section-title">Manage Users</h1>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input w-40">
            <option value="">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {users.length === 0 ? (
          <EmptyState icon="👥" title="No Users Found" />
        ) : (
          <>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-steel-900 border-b border-steel-800">
                  <tr>
                    {["Name", "Email", "Role", "Status", "Seller Approval", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-display font-700 text-xs uppercase tracking-widest text-steel-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-800">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-steel-800/30 transition-colors">
                      <td className="px-4 py-3 font-display font-700 text-xs uppercase text-steel-200">{u.name}</td>
                      <td className="px-4 py-3 text-xs text-steel-400 font-mono">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.role === "admin" ? "badge-red" : u.role === "seller" ? "badge-amber" : "badge-blue"}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.isActive ? "badge-green" : "badge-gray"}`}>{u.isActive ? "Active" : "Inactive"}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role === "seller" && (
                          u.sellerInfo?.isApproved
                            ? <span className="badge badge-green">Approved</span>
                            : <button onClick={() => handleApprove(u._id)}
                                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-display font-700 uppercase tracking-wider">
                                <CheckCircle size={12} /> Approve
                              </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== "admin" && (
                          <button onClick={() => handleToggle(u._id)}
                            className={`flex items-center gap-1 text-xs ${u.isActive ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-300"} transition-colors`}>
                            <Ban size={12} /> {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} onPage={setPage} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}

// ─── Admin Orders ──────────────────────────────────────────────────────────────
export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const load = (p = 1) => {
    setLoading(true);
    adminService.getOrders({ page: p, limit: 15, status: statusFilter })
      .then((r) => { setOrders(r.data.data || []); setPagination(r.data.pagination || {}); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page, statusFilter]);

  if (loading) return <PageLoader />;

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="section-title">All Orders</h1>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-40">
            <option value="">All Statuses</option>
            {["pending","confirmed","shipped","delivered","cancelled"].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {orders.length === 0 ? (
          <EmptyState icon="📋" title="No Orders Found" />
        ) : (
          <>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-steel-900 border-b border-steel-800">
                  <tr>
                    {["Order #", "Buyer", "Items", "Total", "Payment", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-display font-700 text-xs uppercase tracking-widest text-steel-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-800">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-steel-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-amber-400">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-xs text-steel-300 font-body">{order.buyer?.name || "—"}</td>
                      <td className="px-4 py-3 text-xs text-steel-400">{order.items?.length}</td>
                      <td className="px-4 py-3 font-mono font-700 text-xs text-amber-400">{formatCurrency(order.grandTotal)}</td>
                      <td className="px-4 py-3 text-xs text-steel-400 font-mono uppercase">{order.paymentMethod}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-xs text-steel-500 font-mono">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} onPage={setPage} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
