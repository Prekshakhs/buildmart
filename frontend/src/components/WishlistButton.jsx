import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useState } from "react";

export default function WishlistButton({ productId, isWishlisted, loading }) {
  const { addToWishlist, removeFromWishlist } = useWishlist();
  const [animating, setAnimating] = useState(false);

  const handleToggle = async () => {
    setAnimating(true);
    if (isWishlisted) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`transition-all duration-300 ${
        loading ? "opacity-50 cursor-wait" : ""
      } ${animating ? "scale-90" : "hover:scale-105"}`}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={24}
        className={`transition-all duration-500 ${
          isWishlisted
            ? "fill-rose-500 text-rose-500 drop-shadow-sm"
            : "text-gray-400 hover:text-rose-400"
        } ${animating ? "scale-75" : "scale-100"}`}
      />
    </button>
  );
}
