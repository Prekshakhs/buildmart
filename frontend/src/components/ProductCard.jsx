import { Link } from "react-router-dom";
import { ShoppingCart, Star, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, truncate } from "../utils/helpers";
import WishlistButton from "./WishlistButton";

export default function ProductCard({ product }) {
  const { addToCart, cartLoading } = useCart();
  const { checkIsWishlisted, wishlistLoading } = useWishlist();
  const { user } = useAuth();

  const isBuyer = !user || user.role === "buyer";
  const isWishlisted = isBuyer && checkIsWishlisted(product._id);
  const img = product.images?.[0]?.url;
  const discount =
    product.wholesaleTiers?.length > 0
      ? Math.round(
          ((product.retailPrice - product.wholesaleTiers[0].price) /
            product.retailPrice) *
            100,
        )
      : 0;

  return (
    <div className="card group flex flex-col h-full fade-in">
      {/* Image */}
      <Link
        to={`/products/${product._id}`}
        className="relative block overflow-hidden bg-steel-800 aspect-[4/3]"
      >
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-steel-600" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 badge bg-rust-500 text-white border-0 text-[10px]">
            {discount}% off bulk
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-steel-950/70 flex items-center justify-center">
            <span className="badge badge-gray text-xs">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Category */}
        {product.category && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/70">
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="font-display font-700 text-base uppercase text-steel-100 group-hover:text-amber-400 transition-colors leading-tight">
            {truncate(product.name, 50)}
          </h3>
        </Link>

        {/* Rating */}
        {product.ratings?.count > 0 && (
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-mono text-steel-400">
              {product.ratings.average.toFixed(1)} ({product.ratings.count})
            </span>
          </div>
        )}

        {/* Seller Location */}
        {product.seller?.address?.city && (
          <p className="text-[11px] text-steel-500 font-body">
            📍 {product.seller.address.city}, {product.seller.address.state}
          </p>
        )}

        <div className="flex-1" />

        {/* Pricing */}
        <div className="flex items-end justify-between mt-2">
          <div>
            <p className="font-display font-700 text-xl text-amber-400">
              {formatCurrency(product.retailPrice)}
            </p>
            {product.wholesaleTiers?.length > 0 && (
              <p className="text-[11px] font-mono text-steel-500">
                From {formatCurrency(product.wholesaleTiers[0].price)} bulk
              </p>
            )}
            <p className="text-[11px] text-steel-600 font-body">
              per {product.unit || "piece"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-mono text-steel-500">Stock</p>
            <p
              className={`text-xs font-mono font-700 ${product.stock > 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              {product.stock > 0 ? product.stock : "–"}
            </p>
          </div>
        </div>

        {/* Add to cart */}
        {isBuyer && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => addToCart(product._id, 1)}
              disabled={cartLoading || product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-xs py-2"
            >
              <ShoppingCart size={14} />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <div className="btn-secondary px-3 py-2 hover:bg-amber-400/10 transition flex items-center justify-center">
              <WishlistButton
                productId={product._id}
                isWishlisted={isWishlisted}
                loading={wishlistLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
