import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { ORDER_STATUS } from "../utils/helpers";

export function SearchBar({ defaultValue = "", onSearch, className = "" }) {
  const [query, setQuery] = useState(defaultValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, tools, equipment…"
        className="input rounded-r-none flex-1 border-r-0"
      />
      <button
        type="submit"
        className="bg-amber-400 hover:bg-amber-500 text-steel-950 px-4 rounded-r flex items-center gap-2 font-display font-700 text-sm uppercase tracking-wider transition-colors"
      >
        <Search size={16} />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}

export function OrderStatusBadge({ status }) {
  const config = ORDER_STATUS[status] || ORDER_STATUS.pending;
  return <span className={config.className}>{config.label}</span>;
}

export function PriceDisplay({ retailPrice, wholesaleTiers = [], unit = "piece" }) {
  return (
    <div>
      <p className="font-display font-800 text-3xl text-amber-400">
        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(retailPrice)}
        <span className="text-sm font-body font-400 text-steel-400 ml-1">/ {unit}</span>
      </p>
      {wholesaleTiers.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs font-mono uppercase tracking-widest text-steel-500">Bulk Pricing</p>
          {wholesaleTiers.map((tier, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="badge badge-amber text-[10px]">{tier.label || `${tier.minQty}+ units`}</span>
              <span className="font-display font-700 text-steel-100">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(tier.price)}
              </span>
              <span className="text-steel-500 text-xs">
                ({Math.round(((retailPrice - tier.price) / retailPrice) * 100)}% off)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-center mt-8">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-30">‹ Prev</button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onPage(p)}
          className={`w-8 h-8 rounded text-xs font-mono font-700 transition-colors ${p === page ? "bg-amber-400 text-steel-950" : "text-steel-400 hover:text-steel-100 hover:bg-steel-800"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page >= pages} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-30">Next ›</button>
    </div>
  );
}
