import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingBag, Package } from "lucide-react";

export default function AdminLayout({ children }) {
  const navItems = [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={16} />,
    },
    { to: "/admin/users", label: "Manage Users", icon: <Users size={16} /> },
    { to: "/admin/products", label: "Products", icon: <Package size={16} /> },
    { to: "/admin/orders", label: "Orders", icon: <ShoppingBag size={16} /> },
  ];

  return (
    <div className="flex gap-6 page-container">
      {/* Sidebar */}
      <aside className="w-48 flex flex-col gap-2">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 rounded-lg font-display font-700 text-xs uppercase tracking-widest transition-all duration-200 ${
                isActive
                  ? "bg-amber-400 text-steel-950"
                  : "text-steel-300 hover:bg-steel-800 hover:text-steel-50"
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
