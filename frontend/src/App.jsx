import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// Seller pages
import SellerDashboard from "./pages/seller/SellerDashboard";
import ManageProducts from "./pages/seller/ManageProducts";
import AddEditProduct from "./pages/seller/AddEditProduct";
import SellerOrders from "./pages/seller/SellerOrders";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
              <Navbar />
              <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Buyer Protected */}
                <Route element={<ProtectedRoute roles={["buyer"]} />}>
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                </Route>

                {/* Seller Protected */}
                <Route element={<ProtectedRoute roles={["seller"]} />}>
                  <Route
                    path="/seller/dashboard"
                    element={<SellerDashboard />}
                  />
                  <Route path="/seller/products" element={<ManageProducts />} />
                  <Route
                    path="/seller/products/new"
                    element={<AddEditProduct />}
                  />
                  <Route
                    path="/seller/products/edit/:id"
                    element={<AddEditProduct />}
                  />
                  <Route path="/seller/orders" element={<SellerOrders />} />
                </Route>

                {/* Admin Protected */}
                <Route element={<ProtectedRoute roles={["admin"]} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                </Route>

                {/* Protected for all authenticated users */}
                <Route element={<ProtectedRoute roles={["buyer", "seller", "admin"]} />}>
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Routes>
            </main>
            <Footer />
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1e2e3e",
                color: "#e8eef4",
                border: "1px solid #2c3e4e",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#fbbf24", secondary: "#0f1820" },
              },
              error: {
                iconTheme: { primary: "#f87171", secondary: "#0f1820" },
              },
            }}
          />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
