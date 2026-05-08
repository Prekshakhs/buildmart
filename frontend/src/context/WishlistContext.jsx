import { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { wishlistService } from "../api/services";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ items: [], _id: null });
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Fetch wishlist on user login
  useEffect(() => {
    if (user?.role === "buyer") {
      fetchWishlist();
    } else {
      setWishlist({ items: [], _id: null });
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      setWishlistLoading(true);
      const { data } = await wishlistService.get();
      setWishlist(data.data || { items: [], _id: null });
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      setWishlist({ items: [], _id: null });
    } finally {
      setWishlistLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }

    try {
      const { data } = await wishlistService.add(productId);
      setWishlist(data.data || { items: [], _id: null });
      toast.success("Added to wishlist ❤️");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to add to wishlist";
      toast.error(message);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;

    try {
      const { data } = await wishlistService.remove(productId);
      setWishlist(data.data || { items: [], _id: null });
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove from wishlist");
    }
  };

  const checkIsWishlisted = (productId) => {
    return wishlist.items.some((item) => item.product._id === productId);
  };

  const clearWishlist = async () => {
    if (!user) return;

    try {
      const { data } = await wishlistService.clear();
      setWishlist(data.data || { items: [], _id: null });
      toast.success("Wishlist cleared");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear wishlist");
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistLoading,
        addToWishlist,
        removeFromWishlist,
        checkIsWishlisted,
        clearWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return context;
}
