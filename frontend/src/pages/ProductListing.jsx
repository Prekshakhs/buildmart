import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { productService, categoryService } from "../api/services";
import LocationFilter from "../components/LocationFilter";
import ProductCard from "../components/ProductCard";
import { SearchBar, Pagination } from "../components/SharedComponents";
import { SkeletonCard, EmptyState } from "../components/Loaders";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "popular", label: "Most Popular" },
];

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    if (key !== "page") p.delete("page");
    setSearchParams(p);
  };

  useEffect(() => {
    categoryService.getAll().then((r) => setCategories(r.data.data || []));
    productService.getCities().then((r) => setCities(r.data.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    productService.getAll({ search, category, city, minPrice, maxPrice, sort, page, limit: 12 })
      .then((r) => {
        setProducts(r.data.data || []);
        setPagination(r.data.pagination || {});
      })
      .finally(() => setLoading(false));
  }, [search, category, city, minPrice, maxPrice, sort, page]);

  const clearFilters = () => setSearchParams({});

  const hasFilters = search || category || city || minPrice || maxPrice;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="section-title">
            {search ? `Results for "${search}"` : "All Products"}
          </h1>
          {!loading && (
            <p className="text-steel-500 font-mono text-xs mt-1">{pagination.total} products found</p>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SearchBar defaultValue={search} onSearch={(q) => setParam("search", q)} className="flex-1 sm:w-72" />
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="btn-outline flex items-center gap-2 whitespace-nowrap"
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasFilters && <span className="w-2 h-2 bg-amber-400 rounded-full" />}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar Filters ──────────────────────────────────────────────────── */}
        <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-56 flex-shrink-0`}>
          <div className="card p-5 sticky top-20 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-700 text-sm uppercase tracking-widest text-steel-300">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="label">Category</label>
              <div className="space-y-1">
                <button onClick={() => setParam("category", "")}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm font-body transition-colors ${!category ? "bg-amber-400/15 text-amber-400" : "text-steel-400 hover:text-steel-200 hover:bg-steel-800"}`}>
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button key={cat._id} onClick={() => setParam("category", cat._id)}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm font-body transition-colors flex items-center gap-2 ${category === cat._id ? "bg-amber-400/15 text-amber-400" : "text-steel-400 hover:text-steel-200 hover:bg-steel-800"}`}>
                    <span>{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <LocationFilter
              selectedCity={city}
              onCityChange={(c) => setParam("city", c)}
              cities={cities}
            />

            {/* Price Range */}
            <div>
              <label className="label">Price Range (₹)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice}
                  onChange={(e) => setParam("minPrice", e.target.value)}
                  className="input text-xs py-2 px-3" />
                <input type="number" placeholder="Max" value={maxPrice}
                  onChange={(e) => setParam("maxPrice", e.target.value)}
                  className="input text-xs py-2 px-3" />
              </div>
            </div>

            {/* Sort (mobile) */}
            <div className="lg:hidden">
              <label className="label">Sort By</label>
              <select value={sort} onChange={(e) => setParam("sort", e.target.value)} className="input text-sm">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </aside>

        {/* ── Product Grid ─────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="hidden lg:flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((o) => (
                <button key={o.value} onClick={() => setParam("sort", o.value)}
                  className={`text-xs px-3 py-1.5 rounded font-display uppercase tracking-wider transition-colors ${sort === o.value ? "bg-amber-400/15 text-amber-400 border border-amber-400/30" : "text-steel-500 hover:text-steel-300 border border-steel-800"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon="🔍"
              title={city ? `No Products Yet in ${city}` : "No Products Found"}
              description={city ? "Check other cities or locations!" : "Try adjusting your search or filters"}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={page} pages={pagination.pages} onPage={(p) => setParam("page", p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
