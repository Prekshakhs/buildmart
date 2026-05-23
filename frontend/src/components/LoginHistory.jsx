import React, { useState, useEffect } from "react";
import { Clock, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { authService } from "../api/services";

export default function LoginHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLoginHistory();
  }, []);

  const fetchLoginHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getLoginHistory(50);
      setHistory(response.data.data || []);
    } catch (err) {
      console.error("Error fetching login history:", err);
      setError(err.response?.data?.message || "Failed to load login history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "success") {
      return <CheckCircle className="text-emerald-400" size={16} />;
    }
    return <AlertCircle className="text-red-400" size={16} />;
  };

  const getActionBadge = (action) => {
    const styles = {
      login: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      logout: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      failed_login: "bg-red-500/10 text-red-400 border-red-500/30",
      password_reset: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      email_verified: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    };
    const style = styles[action] || "bg-steel-700 text-steel-300 border-steel-600";
    const labels = {
      login: "Login",
      logout: "Logout",
      failed_login: "Failed Login",
      password_reset: "Password Reset",
      email_verified: "Email Verified",
    };

    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${style}`}>
        {labels[action] || action}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const parseUserAgent = (userAgent) => {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown Browser";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin mb-3">
            <Clock size={32} className="text-amber-500" />
          </div>
          <p className="text-steel-400">Loading login history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-red-300 font-semibold">Error Loading History</h4>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto mb-3 text-steel-500" size={32} />
        <p className="text-steel-400">No login history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-steel-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-steel-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-steel-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-steel-400 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-steel-400 uppercase tracking-wider">
                Browser
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-steel-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr
                key={index}
                className="border-b border-steel-800 hover:bg-steel-800/50 transition-colors"
              >
                <td className="px-4 py-3 text-steel-300 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-steel-500" />
                    {formatDate(entry.timestamp)}
                  </div>
                </td>
                <td className="px-4 py-3">{getActionBadge(entry.action)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(entry.status)}
                    <span className="capitalize text-xs font-medium text-steel-300">
                      {entry.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-steel-400">
                    <MapPin size={14} />
                    <code className="text-xs bg-steel-900 px-2 py-1 rounded">
                      {entry.ipAddress || "N/A"}
                    </code>
                  </div>
                </td>
                <td className="px-4 py-3 text-steel-400 text-xs">
                  {parseUserAgent(entry.userAgent)}
                </td>
                <td className="px-4 py-3 text-steel-500 text-xs">
                  {entry.reason && <span className="italic">{entry.reason}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-steel-800/50 border border-steel-700 rounded-lg p-4">
        <p className="text-steel-400 text-xs">
          🔒 Showing your last {history.length} login activities. Review this list regularly to
          detect unauthorized access attempts.
        </p>
      </div>
    </div>
  );
}
