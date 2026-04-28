import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { sellerService, productService } from "../../api/services";
import { PageLoader, EmptyState } from "../../components/Loaders";
import { OrderStatusBadge, Pagination } from "../../components/SharedComponents";
import { formatCurrency, getErrMsg } from "../../utils/helpers";
import toast from "react-hot-toast";

// ─── Manage Products ───────────────────────────────────────────────────────────
export function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = (p = 1) => {
    setLoading(true);
    sellerService.getProducts({ page: p, limit: 10 })
      .then((r) => { setProducts(r.data.data || []); setPagination(r.data.pagination || {}); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await productService.delete(id);
      toast.success("Product deleted");
      load(page);
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">My Products</h1>
        <Link to="/seller/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="📦" title="No Products Yet"
          description="Add your first product to start selling"
          action={<Link to="/seller/products/new" className="btn-primary">Add Product</Link>} />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-steel-900 border-b border-steel-800">
                <tr>
                  {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-display font-700 text-xs uppercase tracking-widest text-steel-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-800">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-steel-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-steel-800 rounded overflow-hidden flex-shrink-0">
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-steel-600"><Package size={14} /></div>
                          }
                        </div>
                        <p className="font-display font-700 text-xs uppercase text-steel-200 max-w-[150px] truncate">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-steel-400 font-body">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3 font-mono font-700 text-amber-400 text-xs">{formatCurrency(p.retailPrice)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-700 ${p.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.isActive ? "badge-green" : "badge-gray"}`}>{p.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/seller/products/edit/${p._id}`} className="text-steel-500 hover:text-amber-400 transition-colors p-1">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(p._id)} className="text-steel-500 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
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
  );
}

// ─── Seller Orders ─────────────────────────────────────────────────────────────
export function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    sellerService.getOrders({ page, limit: 10 })
      .then((r) => { setOrders(r.data.data || []); setPagination(r.data.pagination || {}); })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">Orders Received</h1>
      {orders.length === 0 ? (
        <EmptyState icon="📋" title="No Orders Yet" description="Orders for your products will appear here" />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-steel-900 border-b border-steel-800">
                <tr>
                  {["Order #", "Buyer", "Items", "Total", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-display font-700 text-xs uppercase tracking-widest text-steel-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-800">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-steel-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-steel-400">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-steel-200 font-body">{order.buyer?.name || "—"}</p>
                      <p className="text-[11px] text-steel-500">{order.buyer?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-steel-400">{order.items?.length}</td>
                    <td className="px-4 py-3 font-mono font-700 text-xs text-amber-400">
                      {formatCurrency(order.items?.reduce((s, i) => s + i.totalPrice, 0) || 0)}
                    </td>
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
  );
}

export default ManageProducts;
