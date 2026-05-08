import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, ChevronRight, Heart, AlertCircle } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist, wishlistLoading } =
    useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleMoveToCart = async (productId) => {
    await addToCart(productId, 1);
    await removeFromWishlist(productId);
    toast.success("Moved to cart ✓");
  };

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    toast.success("Removed from wishlist");
  };

  const handleClearAll = async () => {
    await clearWishlist();
    setShowClearConfirm(false);
    toast.success("Wishlist cleared");
  };

  if (wishlist.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">My Wishlist</h1>

          <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-16 border border-gray-100">
            <div className="mb-6 p-4 bg-gradient-to-br from-pink-100 to-red-100 rounded-full">
              <Heart size={72} className="text-red-500" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-8 text-center text-lg max-w-md">
              Start adding your favorite products to save them for later! ✨
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 font-semibold text-lg"
            >
              <ShoppingCart size={22} />
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = wishlist.items.reduce((sum, item) => sum + item.product.retailPrice, 0);
  const inStockCount = wishlist.items.filter(item => item.product.stock > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">Save and manage your favorite items</p>
          </div>
          {showClearConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
              >
                Confirm Clear
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-6 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-semibold hover:shadow-md"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Items</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{wishlist.items.length}</p>
              </div>
              <Heart className="text-red-400" size={40} fill="currentColor" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Stock</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{inStockCount}</p>
              </div>
              <ShoppingCart className="text-green-400" size={40} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">₹{totalValue.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {wishlist.items.map((item) => (
            <div
              key={item.product._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
            >
              {/* Product Image Container */}
              <div className="relative overflow-hidden bg-gray-100 h-56">
                {item.product.images?.[0] && (
                  <Link
                    to={`/products/${item.product._id}`}
                    className="block w-full h-full"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </Link>
                )}

                {/* Stock Badge */}
                <div className="absolute top-3 right-3">
                  {item.product.stock > 0 ? (
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      In Stock
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle size={14} /> Out of Stock
                    </span>
                  )}
                </div>

                {/* Added Date Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-lg shadow-sm">
                    Added {new Date(item.addedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <Link
                  to={`/products/${item.product._id}`}
                  className="font-bold text-gray-800 hover:text-blue-600 transition line-clamp-2 text-sm block mb-3"
                >
                  {item.product.name}
                </Link>

                {/* Category/Seller Info */}
                {item.product.category && (
                  <p className="text-xs text-gray-500 mb-3 bg-gray-100 inline-block px-2 py-1 rounded">
                    {item.product.category}
                  </p>
                )}

                {/* Price Section */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{item.product.retailPrice?.toLocaleString("en-IN")}
                  </p>
                  {item.product.wholesaleTiers?.[0] && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      ✓ Bulk pricing available
                    </p>
                  )}
                </div>

                {/* Stock Info */}
                <p className="text-xs text-gray-600 mb-4">
                  {item.product.stock > 0
                    ? `${item.product.stock} units available`
                    : "Not available"}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item.product._id)}
                    disabled={wishlistLoading || item.product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-bold"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item.product._id)}
                    disabled={wishlistLoading}
                    className="flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 p-2 rounded-lg transition-colors duration-200 hover:shadow-md"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping Section */}
        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg">
          <h3 className="text-white text-2xl font-bold mb-4">Keep Shopping!</h3>
          <p className="text-blue-100 mb-6 text-center max-w-md">
            Explore more amazing products at unbeatable prices
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 font-bold"
          >
            Continue Shopping
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
