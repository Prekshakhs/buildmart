import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import { productService, categoryService } from "../api/services";
import ProductCard from "../components/ProductCard";
import { SearchBar } from "../components/SharedComponents";
import { SkeletonCard } from "../components/Loaders";

const CATEGORY_ICONS = {
  "Construction Materials": "🏗️",
  "Hardware Tools": "🔧",
  "Plumbing & Electrical": "🔌",
  "Agriculture Equipment": "🌾",
  "Safety & PPE": "🦺",
  "Paints & Chemicals": "🎨",
};

const FEATURES = [
  {
    icon: <Zap size={20} />,
    title: "Bulk Pricing",
    desc: "Tiered wholesale rates on all orders",
  },
  {
    icon: <Truck size={20} />,
    title: "Pan-India Delivery",
    desc: "Free shipping on orders above ₹5000",
  },
  {
    icon: <Shield size={20} />,
    title: "Verified Sellers",
    desc: "All sellers are approved & trusted",
  },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      productService.getAll({ featured: true, limit: 8 }),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.data || []);
        setFeatured(prodRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-steel-950 border-b border-steel-800">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <span className="badge badge-amber mb-4">
              B2B Marketplace India
            </span>
            <h1 className="font-display font-800 text-5xl sm:text-6xl lg:text-7xl uppercase leading-none text-steel-50 mb-6">
              Pick Your Tools.
              <br />
              <span className="text-amber-400">Build Your Future.</span>
            </h1>
            <p className="text-steel-400 font-body text-lg mb-8 max-w-xl leading-relaxed">
              Construction materials, hardware tools &amp; agricultural
              equipment — all in one place. Get wholesale pricing on every
              order.
            </p>
            <SearchBar className="max-w-xl" />
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/products"
                className="btn-primary flex items-center gap-2"
              >
                Browse All Products <ArrowRight size={16} />
              </Link>
              <Link to="/register?role=seller" className="btn-outline">
                Start Selling
              </Link>
            </div>
          </div>
        </div>

        {/* Diagonal accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/0 via-amber-400 to-amber-400/0" />
      </section>

      {/* ── Features bar ─────────────────────────────────────────────────────── */}
      <section className="bg-steel-900 border-b border-steel-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-steel-800">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 px-6 py-5">
                <div className="w-10 h-10 bg-amber-400/10 rounded flex items-center justify-center text-amber-400 flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="font-display font-700 text-sm uppercase tracking-wider text-steel-100">
                    {title}
                  </p>
                  <p className="text-steel-500 text-xs font-body">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="page-container space-y-16">
        {/* ── Categories ───────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-amber-400/60 font-mono text-xs uppercase tracking-widest mb-1">
                Shop by
              </p>
              <h2 className="section-title">Categories</h2>
            </div>
            <Link
              to="/products"
              className="text-sm text-steel-400 hover:text-amber-400 font-body flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="skeleton h-28 rounded-lg" />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  className="group card p-5 text-center hover:border-amber-400/50 hover:bg-[var(--bg-elevated)] transition-all"
                >
                  <div className="text-3xl mb-3">
                    {cat.icon || CATEGORY_ICONS[cat.name] || "📦"}
                  </div>
                  <p className="font-display font-700 text-sm uppercase tracking-wide text-steel-200 group-hover:text-amber-400 transition-colors leading-tight">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Featured Products ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-amber-400/60 font-mono text-xs uppercase tracking-widest mb-1">
                Handpicked
              </p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link
              to="/products"
              className="text-sm text-steel-400 hover:text-amber-400 font-body flex items-center gap-1 transition-colors"
            >
              All products <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
            </div>
          ) : featured.length === 0 ? (
            <p className="text-steel-500 font-body text-center py-12">
              No featured products yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-steel-800 to-steel-900 border border-steel-700 p-8 sm:p-12">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(251,191,36,0.3) 10px, rgba(251,191,36,0.3) 11px)`,
            }}
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="font-display font-800 text-3xl uppercase text-steel-50">
                Ready to <span className="text-amber-400">sell?</span>
              </h2>
              <p className="text-steel-400 font-body mt-2">
                Join thousands of sellers. List your products and reach bulk
                buyers across India.
              </p>
            </div>
            <Link
              to="/register"
              className="btn-primary whitespace-nowrap flex items-center gap-2"
            >
              Become a Seller <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
