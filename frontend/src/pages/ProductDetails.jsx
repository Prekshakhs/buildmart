import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingCart, Package, Minus, Plus, Store, Zap } from "lucide-react";
import { productService, reviewService } from "../api/services";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { PriceDisplay } from "../components/SharedComponents";
import { PageLoader, ErrorMessage } from "../components/Loaders";
import ReviewStars from "../components/ReviewStars";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import SimilarProducts from "../components/SimilarProducts";
import ShareButton from "../components/ShareButton";
import ProductImageGallery from "../components/ProductImageGallery";
import ProductSpecifications from "../components/ProductSpecifications";
import { calculatePrice, formatCurrency } from "../utils/helpers";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartLoading } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    productService.getById(id)
      .then((r) => setProduct(r.data.data))
      .catch((e) => setError(e.response?.data?.message || "Product not found"))
      .finally(() => setLoading(false));

    // Check if user has existing review
    if (user && user.role === "buyer") {
      reviewService.checkExisting(id).then((r) => {
        if (r.data.hasReview) {
          setExistingReview(r.data.data);
        }
      }).catch((e) => console.log("Error checking review:", e));
    }
  }, [id, user]);

  if (loading) return <PageLoader />;
  if (error) return (
    <div className="page-container">
      <ErrorMessage message={error} />
    </div>
  );

  const isBuyer = !user || user.role === "buyer";
  const { unitPrice, tierLabel, totalPrice } = calculatePrice(quantity, product.retailPrice, product.wholesaleTiers);
  const discount = product.retailPrice - unitPrice;

  const changeQty = (delta) => {
    const newQty = Math.max(1, Math.min(product.stock, quantity + delta));
    setQuantity(newQty);
  };

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm font-body text-steel-500">
        <Link to="/products" className="hover:text-amber-400 flex items-center gap-1">
          <ChevronLeft size={14} /> Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/products?category=${product.category._id}`} className="hover:text-amber-400">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-steel-300 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Images Gallery ────────────────────────────────────────────────────────── */}
        <div>
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />
        </div>

        {/* ── Info ───────────────────────────────────────────────────────────── */}
        <div className="space-y-6 fade-in">
          {product.category && (
            <Link to={`/products?category=${product.category._id}`}
              className="badge badge-amber text-[11px] hover:bg-amber-400/20 transition-colors">
              {product.category.icon} {product.category.name}
            </Link>
          )}

          <h1 className="font-display font-800 text-4xl uppercase text-steel-50 leading-tight">
            {product.name}
          </h1>

          {/* Share Button */}
          <div className="flex gap-2">
            <ShareButton
              productName={product.name}
              productId={product._id}
            />
          </div>

          {product.brand && (
            <p className="text-steel-500 font-mono text-xs uppercase tracking-widest">
              Brand: <span className="text-steel-300">{product.brand}</span>
            </p>
          )}

          {/* Ratings Summary */}
          {product.ratings && (
            <div className="bg-steel-900 border border-steel-800 rounded-lg p-3 flex items-center gap-3">
              <ReviewStars rating={product.ratings.average} count={product.ratings.count} />
            </div>
          )}

          <div className="divider" />

          {/* Pricing */}
          <PriceDisplay retailPrice={product.retailPrice} wholesaleTiers={product.wholesaleTiers} unit={product.unit} />

          <div className="divider" />

          {/* Quantity selector */}
          {isBuyer && product.stock > 0 && (
            <div className="space-y-4">
              <div>
                <label className="label">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-steel-700 rounded overflow-hidden">
                    <button onClick={() => changeQty(-1)} className="px-3 py-2 text-steel-400 hover:text-steel-100 hover:bg-steel-800 transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-mono font-700 text-steel-100 py-2">{quantity}</span>
                    <button onClick={() => changeQty(1)} className="px-3 py-2 text-steel-400 hover:text-steel-100 hover:bg-steel-800 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-steel-500">
                      In stock: <span className="text-emerald-400 font-700">{product.stock}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Live price preview */}
              <div className="bg-steel-900 border border-steel-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-steel-500 uppercase tracking-widest">
                      Applied tier: <span className="text-amber-400">{tierLabel}</span>
                    </p>
                    <p className="text-sm font-body text-steel-400 mt-0.5">
                      {formatCurrency(unitPrice)} × {quantity} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-800 text-2xl text-amber-400">{formatCurrency(totalPrice)}</p>
                    {discount > 0 && (
                      <p className="text-xs text-emerald-400 font-mono">
                        You save {formatCurrency(discount * quantity)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => addToCart(product._id, quantity)}
                disabled={cartLoading}
                className="btn-primary w-full flex items-center justify-center gap-3 py-3 text-base"
              >
                <ShoppingCart size={18} />
                Add {quantity} to Cart
              </button>

              <button
                onClick={() => {
                  addToCart(product._id, quantity).then(() => {
                    navigate("/checkout");
                  });
                }}
                disabled={cartLoading}
                className="btn-outline w-full flex items-center justify-center gap-3 py-3 text-base border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
              >
                <Zap size={18} />
                Buy Now
              </button>
            </div>
          )}

          {product.stock === 0 && (
            <div className="badge badge-red text-sm py-2 px-4">Currently Out of Stock</div>
          )}

          <div className="divider" />

          {/* Description */}
          <div>
            <h3 className="font-display font-700 text-sm uppercase tracking-widest text-steel-400 mb-3">Description</h3>
            <p className="text-steel-300 font-body leading-relaxed text-sm">{product.description}</p>
          </div>

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <ProductSpecifications specifications={product.specifications} />
          )}

          {/* Seller info */}
          {product.seller && (
            <div className="flex items-center gap-3 p-4 bg-steel-900 rounded-lg border border-steel-800">
              <div className="w-10 h-10 bg-amber-400/10 rounded-full flex items-center justify-center">
                <Store size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-mono text-steel-500 uppercase tracking-widest">Sold by</p>
                <p className="font-display font-700 text-sm text-steel-200">
                  {product.seller.sellerInfo?.businessName || product.seller.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="divider my-8" />

      {/* ── Reviews Section ──────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-700 text-steel-100">Customer Reviews</h2>

        {/* Review Form - Only for logged-in buyers */}
        {user && user.role === "buyer" && (
          <>
            {!reviewFormVisible && !existingReview && (
              <button
                onClick={() => setReviewFormVisible(true)}
                className="btn-primary text-sm py-2"
              >
                Write a Review
              </button>
            )}
            {(reviewFormVisible || existingReview) && (
              <ReviewForm
                productId={id}
                initialReview={existingReview}
                isEditing={!!existingReview}
                onSubmit={() => {
                  setReviewFormVisible(false);
                  setReviewsRefreshKey((prev) => prev + 1);
                  setExistingReview(null);
                  // Re-fetch product to get updated ratings
                  productService.getById(id).then((r) => setProduct(r.data.data));
                  // Check for updated review
                  reviewService.checkExisting(id).then((r) => {
                    if (r.data.hasReview) {
                      setExistingReview(r.data.data);
                    }
                  });
                }}
                onCancel={() => {
                  setReviewFormVisible(false);
                  if (!existingReview) {
                    // If there was no existing review, close the form
                  }
                }}
              />
            )}
          </>
        )}

        {/* Review List */}
        <ReviewList
          key={reviewsRefreshKey}
          productId={id}
          onReviewDeleted={() => {
            setReviewsRefreshKey((prev) => prev + 1);
            setExistingReview(null);
            // Re-fetch product to get updated ratings
            productService.getById(id).then((r) => setProduct(r.data.data));
          }}
        />
      </div>

      <div className="divider my-8" />

      {/* ── Similar Products ──────────────────────────────────────────────────────– */}
      <SimilarProducts productId={id} maxProducts={6} />
    </div>
  );
}