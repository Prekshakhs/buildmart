import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { authService } from "../api/services";
import toast from "react-hot-toast";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Verification token not found");
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
        toast.success("Email verified! You can now login.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Verification failed. Token may be expired."
        );
        toast.error(error.response?.data?.message || "Verification failed");
      }
    };

    if (!hasVerified.current) {
      hasVerified.current = true;
      verifyToken();
    }
  }, [searchParams]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/10 mb-6">
                <Loader size={32} className="text-amber-400 animate-spin" />
              </div>
              <h1 className="font-display font-800 text-3xl uppercase text-steel-50 mb-2">
                Verifying Email
              </h1>
              <p className="text-steel-400 font-body text-sm">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-400/10 mb-6">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h1 className="font-display font-800 text-3xl uppercase text-steel-50 mb-2">
                Email Verified ✓
              </h1>
              <p className="text-steel-300 font-body text-sm mb-8">{message}</p>
              <Link
                to="/login"
                className="btn-primary inline-block px-8 py-3"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-400/10 mb-6">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h1 className="font-display font-800 text-3xl uppercase text-steel-50 mb-2">
                Verification Failed
              </h1>
              <p className="text-steel-300 font-body text-sm mb-8">{message}</p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="btn-primary block py-3"
                >
                  Back to Login
                </Link>
                <p className="text-xs text-steel-400">
                  Need a new verification link?{" "}
                  <Link
                    to="/register"
                    className="text-amber-400 hover:text-amber-300"
                  >
                    Register again
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
