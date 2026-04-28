import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/helpers";
import { EmptyState } from "../components/Loaders";

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="page-container">
        <h1 className="section-title mb-8">Your Cart</h1>
        <EmptyState icon="🛒" title="Cart is Empty" description="Add some products to get started"
          action={<Link to="/products" className="btn-primary">Browse Products</Link>} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">Your Cart <span className="text-steel-500 text-2xl font-mono">({cart.totalItems})</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Items ─────────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => (
            <div key={item.product._id} className="card p-4 flex gap-4 fade-in">
              {/* Image */}
              <Link to={`/products/${item.product._id}`} className="w-20 h-20 flex-shrink-0 bg-steel-800 rounded overflow-hidden">
                {item.product.images?.[0]?.url
                  ? <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-steel-600 text-2xl">📦</div>
                }
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product._id}`}>
                  <h3 className="font-display font-700 text-sm uppercase text-steel-100 hover:text-amber-400 transition-colors truncate">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-xs font-mono text-amber-400/70 mt-0.5">{item.tierLabel}</p>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-steel-700 rounded overflow-hidden">
                    <button onClick={() => updateItem(item.product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2 py-1.5 text-steel-400 hover:text-steel-100 hover:bg-steel-800 disabled:opacity-30 transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-700 text-steel-100 py-1.5">{item.quantity}</span>
                    <button onClick={() => updateItem(item.product._id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="px-2 py-1.5 text-steel-400 hover:text-steel-100 hover:bg-steel-800 disabled:opacity-30 transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-display font-700 text-lg text-amber-400">{formatCurrency(item.totalPrice)}</p>
                      <p className="text-xs font-mono text-steel-500">{formatCurrency(item.unitPrice)} each</p>
                    </div>
                    <button onClick={() => removeItem(item.product._id)} className="text-steel-600 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Summary ───────────────────────────────────────────────────────────── */}
        <div>
          <div className="card p-6 sticky top-20 space-y-4">
            <h2 className="font-display font-700 text-lg uppercase tracking-wide text-steel-200">Order Summary</h2>
            <div className="divider" />

            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between text-steel-400">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span className="font-mono">{formatCurrency(cart.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-steel-400">
                <span>Shipping</span>
                <span className={`font-mono ${cart.grandTotal >= 5000 ? "text-emerald-400" : ""}`}>
                  {cart.grandTotal >= 5000 ? "FREE" : formatCurrency(99)}
                </span>
              </div>
              {cart.grandTotal < 5000 && (
                <p className="text-xs text-steel-600 font-mono">
                  Add {formatCurrency(5000 - cart.grandTotal)} more for free shipping
                </p>
              )}
            </div>

            <div className="divider" />
            <div className="flex justify-between items-center">
              <span className="font-display font-700 text-base uppercase tracking-wide text-steel-200">Total</span>
              <span className="font-display font-800 text-2xl text-amber-400">
                {formatCurrency(cart.grandTotal + (cart.grandTotal >= 5000 ? 0 : 99))}
              </span>
            </div>

            <button onClick={() => navigate("/checkout")} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link to="/products" className="block text-center text-sm text-steel-500 hover:text-steel-300 transition-colors font-body">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
