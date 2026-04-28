import { createContext, useContext, useState, useEffect } from "react";
import { cartService } from "../api/services";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, grandTotal: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = async () => {
    if (!user || user.role !== "buyer") return;
    try {
      const { data } = await cartService.get();
      setCart(data.data);
    } catch {}
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    setCartLoading(true);
    try {
      const { data } = await cartService.add(productId, quantity);
      setCart(data.data);
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const updateItem = async (productId, quantity) => {
    try {
      const { data } = await cartService.update(productId, quantity);
      setCart(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update cart");
    }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await cartService.remove(productId);
      setCart(data.data);
      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const clearCart = () => setCart({ items: [], totalItems: 0, grandTotal: 0 });

  return (
    <CartContext.Provider value={{ cart, cartLoading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
