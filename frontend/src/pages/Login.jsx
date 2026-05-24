import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrMsg } from "../utils/helpers";
import toast from "react-hot-toast";

// ─── Login ─────────────────────────────────────────────────────────────────────
export function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      if (user.role === "seller") navigate("/seller/dashboard");
      else if (user.role === "admin") navigate("/admin/dashboard");
      else navigate(from);
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-amber-400 rounded flex items-center justify-center">
              <span className="font-display font-800 text-steel-950">BM</span>
            </div>
          </div>
          <h1 className="font-display font-800 text-4xl uppercase text-steel-50">
            Welcome Back
          </h1>
          <p className="text-steel-400 font-body text-sm mt-2">
            Sign in to your PickMyTools account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-500 hover:text-steel-300"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-right">
            <Link
              to="/forgot-password"
              className="text-amber-400 hover:text-amber-300 transition-colors text-xs font-body"
            >
              Forgot password?
            </Link>
          </p>

          <p className="text-center text-sm text-steel-500 font-body">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Register ──────────────────────────────────────────────────────────────────
export function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    phone: "",
    businessName: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [showPw, setShowPw] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(form);
      if (user.role === "seller") navigate("/seller/dashboard");
      else navigate("/");
    } catch (err) {
      toast.error(getErrMsg(err));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display font-800 text-4xl uppercase text-steel-50">
            Create Account
          </h1>
          <p className="text-steel-400 font-body text-sm mt-2">
            Join PickMyTools — India's B2B marketplace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {/* Role selector */}
          <div>
            <label className="label">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "buyer", label: "Buy Products", icon: "🛒" },
                { val: "seller", label: "Sell Products", icon: "🏪" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => set("role", opt.val)}
                  className={`flex flex-col items-center gap-1 p-4 rounded-lg border text-sm transition-colors ${form.role === opt.val ? "border-amber-400 bg-amber-400/5 text-amber-400" : "border-steel-700 text-steel-400 hover:border-steel-500"}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="font-display font-700 text-xs uppercase tracking-wider">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="John Doe"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="9876543210"
              className="input"
            />
          </div>

          {form.role === "seller" && (
            <>
              <div>
                <label className="label">Business Name</label>
                <input
                  value={form.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  placeholder="ABC Hardware Pvt. Ltd."
                  className="input"
                />
              </div>

              {/* Shop Address Section */}
              <div className="bg-steel-800/50 border border-steel-700 rounded p-4 space-y-3">
                <h3 className="text-xs font-display font-700 uppercase tracking-widest text-steel-300">
                  Shop Address
                </h3>

                <div>
                  <label className="label">Street Address</label>
                  <input
                    value={form.street}
                    onChange={(e) => set("street", e.target.value)}
                    placeholder="123 Market Street"
                    className="input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">City *</label>
                    <input
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="Bangalore"
                      className="input text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                      placeholder="Karnataka"
                      className="input text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Pincode</label>
                  <input
                    value={form.pincode}
                    onChange={(e) => set("pincode", e.target.value)}
                    placeholder="560001"
                    className="input text-xs"
                  />
                </div>

                <p className="text-xs text-steel-400 font-body">
                  📍 Your shop location will appear in the Location filter
                  dropdown when customers browse products.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Min. 6 characters"
                className="input pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-500 hover:text-steel-300"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {form.role === "seller" && (
            <div className="bg-amber-400/5 border border-amber-400/20 rounded p-3">
              <p className="text-xs text-amber-400/70 font-body">
                Seller accounts require admin approval before you can list
                products.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? "Creating Account…" : "Create Account"}
          </button>

          <p className="text-center text-sm text-steel-500 font-body">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
