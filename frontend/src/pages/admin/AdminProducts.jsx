import { useState, useEffect } from "react";
import { Trash2, Package, AlertCircle } from "lucide-react";
import { adminService, categoryService } from "../../api/services";
import { PageLoader, EmptyState } from "../../components/Loaders";
import { Pagination } from "../../components/SharedComponents";
import AdminLayout from "../../components/AdminLayout";
import { formatCurrency, getErrMsg } from "../../utils/helpers";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load categories on mount
  useEffect(() => {
    categoryService
      .getAll()
      .then((r) => setCategories(r.data.data || []))
      .catch((err) => console.log("Error loading categories:", err));
  }, []);

  // Load products
  const load = (p = 1) => {
    setLoading(true);
    adminService
      .getProducts({
        page: p,
        limit: 15,
        search,
        category: categoryFilter,
        stockStatus: stockFilter,
        isActive: statusFilter,
      })
      .then((r) => {
        setProducts(r.data.data || []);
        setPagination(r.data.pagination || {});
      })
      .catch((err) => toast.error(getErrMsg(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
  }, [page, search, categoryFilter, stockFilter, statusFilter]);

  const handleDelete = async (productId) => {
    setDeleting(true);
    try {
      await adminService.removeProduct(productId);
      toast.success("Product removed from marketplace");
      setDeleteConfirm(null);
      load(page);
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStockFilter("");
    setStatusFilter("");
    setPage(1);
  };

  if (loading && products.length === 0) return <PageLoader />;

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-6">Products Management</h1>

          {/* Filters Row 1 */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input flex-1 min-w-[200px]"
            />
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-steel-800 text-steel-300 rounded border border-steel-700 hover:bg-steel-700 transition text-sm font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Filters Row 2 */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="input w-40 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPage(1);
              }}
              className="input w-40 text-sm"
            >
              <option value="">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock (≤5)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input w-40 text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="text-xs text-steel-400 font-mono bg-steel-900 px-3 py-2 rounded border border-steel-800">
              Total: {pagination.total || 0}
            </div>
          </div>
        </div>

        {/* Products Table */}
        {products.length === 0 ? (
          <EmptyState icon="📦" title="No Products Found" />
        ) : (
          <>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-steel-900 border-b border-steel-800">
                  <tr>
                    {[
                      "Name",
                      "SKU",
                      "Seller",
                      "Category",
                      "Price",
                      "Stock",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-display font-700 text-xs uppercase tracking-widest text-steel-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-800">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-steel-800/30 transition-colors"
                    >
                      {/* Product Name */}
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="font-display font-700 text-xs uppercase text-steel-200 line-clamp-2">
                            {product.name}
                          </p>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 font-mono text-xs text-steel-400">
                        {product.sku || "—"}
                      </td>

                      {/* Seller */}
                      <td className="px-4 py-3 text-xs text-steel-400">
                        {product.seller?.sellerInfo?.businessName ||
                          product.seller?.name ||
                          "—"}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-xs text-steel-400">
                        {product.category?.name || "—"}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-mono font-700 text-xs text-amber-400">
                        {formatCurrency(product.retailPrice)}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span
                          className={`badge text-xs ${
                            product.stock > 5
                              ? "badge-green"
                              : product.stock > 0
                                ? "badge-amber"
                                : "badge-red"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`badge text-xs ${
                            product.isActive ? "badge-green" : "badge-gray"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        {deleteConfirm === product._id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(product._id)}
                              disabled={deleting}
                              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-display font-700 uppercase tracking-wider disabled:opacity-50"
                            >
                              <AlertCircle size={12} /> Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              disabled={deleting}
                              className="flex items-center gap-1 text-xs text-steel-400 hover:text-steel-300 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(product._id)}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                            title="Remove from marketplace"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              onPage={setPage}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
