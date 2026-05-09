import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Package,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Heart,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setUserOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === "seller") return "/seller/dashboard";
    if (user?.role === "admin") return "/admin/dashboard";
    return "/orders";
  };

  return (
    <header className="sticky top-0 z-50 bg-steel-950/95 backdrop-blur border-b border-steel-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-amber-400 rounded flex items-center justify-center">
              <span className="font-display font-800 text-steel-950 text-sm">
                BM
              </span>
            </div>
            <span className="font-display font-700 text-xl uppercase tracking-widest text-steel-50 group-hover:text-amber-400 transition-colors">
              Build<span className="text-amber-400">Mart</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Products" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-display uppercase tracking-widest transition-colors rounded ${
                    isActive
                      ? "text-amber-400"
                      : "text-steel-300 hover:text-steel-50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notification Bell (authenticated users) */}
            {isAuthenticated && <NotificationBell />}

            {/* Cart & Wishlist (buyers only) */}
            {(!user || user.role === "buyer") && (
              <>
                {/* Cart */}
                <Link
                  to={isAuthenticated ? "/cart" : "/login"}
                  className="relative p-2 text-steel-300 hover:text-amber-400 transition-colors"
                >
                  <ShoppingCart size={20} />
                  {cart.totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 text-steel-950 text-[10px] font-mono font-700 rounded-full flex items-center justify-center">
                      {cart.totalItems > 9 ? "9+" : cart.totalItems}
                    </span>
                  )}
                </Link>

                {/* Wishlist */}
                <Link
                  to={isAuthenticated ? "/wishlist" : "/login"}
                  className="relative p-2 text-steel-300 hover:text-rose-400 transition-colors"
                >
                  <Heart size={20} />
                  {wishlist.items && wishlist.items.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-mono font-700 rounded-full flex items-center justify-center">
                      {wishlist.items.length > 9 ? "9+" : wishlist.items.length}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded border border-steel-700 hover:border-steel-500 transition-colors"
                >
                  <div className="w-6 h-6 bg-amber-400/20 rounded-full flex items-center justify-center">
                    <span className="text-amber-400 text-xs font-display font-700">
                      {user.name[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-body text-steel-200 hidden sm:block max-w-[100px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className="text-steel-400" />
                </button>

                {userOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-steel-900 border border-steel-700 rounded-lg shadow-xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-steel-800">
                      <p className="text-xs text-steel-400 font-body">
                        {user.email}
                      </p>
                      <span
                        className={`badge mt-1 ${user.role === "admin" ? "badge-red" : user.role === "seller" ? "badge-amber" : "badge-blue"}`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-steel-300 hover:text-steel-50 hover:bg-steel-800 transition-colors"
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-steel-300 hover:text-steel-50 hover:bg-steel-800 transition-colors"
                    >
                      <User size={14} /> My Profile
                    </Link>
                    <Link
                      to="/notification-settings"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-steel-300 hover:text-steel-50 hover:bg-steel-800 transition-colors"
                    >
                      <span className="text-sm">🔔</span> Notification Settings
                    </Link>
                    {user.role === "buyer" && (
                      <>
                        <Link
                          to="/wishlist"
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-steel-300 hover:text-steel-50 hover:bg-steel-800 transition-colors"
                        >
                          <Heart size={14} /> My Wishlist
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-steel-300 hover:text-steel-50 hover:bg-steel-800 transition-colors"
                        >
                          <Package size={14} /> My Orders
                        </Link>
                        <Link
                          to="/returns"
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-steel-300 hover:text-steel-50 hover:bg-steel-800 transition-colors"
                        >
                          <RotateCcw size={14} /> My Returns
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-steel-800 transition-colors"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-xs">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-xs py-2 px-4">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-steel-300"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-steel-800 space-y-1">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Products" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm font-display uppercase tracking-widest text-steel-300 hover:text-amber-400"
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Accent line */}
      <div className="h-0.5 bg-gradient-to-r from-amber-400/0 via-amber-400/60 to-amber-400/0" />
    </header>
  );
}
