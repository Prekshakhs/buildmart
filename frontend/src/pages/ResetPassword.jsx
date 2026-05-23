import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { authService } from "../api/services";
import { getErrMsg } from "../utils/helpers";
import toast from "react-hot-toast";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Reset token not found");
      navigate("/forgot-password");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, form.newPassword);
      toast.success("Password reset successfully! Please login with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="font-display font-800 text-3xl uppercase text-steel-50 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-steel-400 font-body text-sm mb-8">
            The password reset link is missing or invalid.
          </p>
          <Link
            to="/forgot-password"
            className="btn-primary inline-block px-8 py-3"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/10 mb-6">
            <Lock size={32} className="text-amber-400" />
          </div>
          <h1 className="font-display font-800 text-4xl uppercase text-steel-50">
            Create New Password
          </h1>
          <p className="text-steel-400 font-body text-sm mt-2">
            Enter a strong password to secure your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
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
            <p className="text-xs text-steel-500 mt-1">
              Min. 8 chars, uppercase, lowercase, numbers
            </p>
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-500 hover:text-steel-300"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <div className="bg-red-400/5 border border-red-400/20 rounded p-3">
              <p className="text-xs text-red-400/70 font-body">
                ⚠️ Passwords don't match
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.newPassword || !form.confirmPassword}
            className="btn-primary w-full py-3"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>

          <p className="text-center text-xs text-steel-400 font-body">
            Remember your password?{" "}
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

export default ResetPassword;
