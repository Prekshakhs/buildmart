import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { authService } from "../api/services";
import { getErrMsg } from "../utils/helpers";
import toast from "react-hot-toast";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/10 mb-6">
              <Mail size={32} className="text-amber-400" />
            </div>
            <h1 className="font-display font-800 text-3xl uppercase text-steel-50 mb-2">
              Check Your Email
            </h1>
            <p className="text-steel-400 font-body text-sm">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <div className="card p-8 space-y-6">
            <div className="bg-amber-400/5 border border-amber-400/20 rounded p-4">
              <p className="text-xs text-amber-400/70 font-body leading-relaxed">
                📧 The link will expire in 1 hour. If you don't see the email, check your spam folder.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setSent(false)}
                className="w-full py-3 px-4 rounded-lg border border-steel-700 text-steel-300 hover:bg-steel-800 transition-colors font-body text-sm"
              >
                Try Another Email
              </button>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-amber-400 text-steel-950 hover:bg-amber-300 transition-colors font-display font-700 text-sm uppercase"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm mb-6 font-body"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
          <h1 className="font-display font-800 text-4xl uppercase text-steel-50">
            Reset Password
          </h1>
          <p className="text-steel-400 font-body text-sm mt-2">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? "Sending…" : "Send Reset Link"}
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

export default ForgotPassword;
