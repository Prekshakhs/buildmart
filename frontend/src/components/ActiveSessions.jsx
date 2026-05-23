import { useState, useEffect } from "react";
import { Trash2, LogOut, Globe, Smartphone, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axiosInstance";
import toast from "react-hot-toast";

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/sessions");
      setSessions(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId, isCurrent = false) => {
    if (isCurrent) {
      const confirmed = window.confirm(
        "This will log you out from this device. Continue?"
      );
      if (!confirmed) return;
    }

    setRevoking(sessionId);

    try {
      await API.delete(`/sessions/${sessionId}`);
      toast.success("Session revoked");
      fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to revoke session");
    } finally {
      setRevoking(null);
    }
  };

  const revokeAllOthers = async () => {
    const confirmed = window.confirm(
      "This will log you out from all other devices. Continue?"
    );
    if (!confirmed) return;

    try {
      await API.post("/sessions/revoke-all");
      toast.success("All other sessions revoked");
      fetchSessions();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to revoke sessions"
      );
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone size={20} />;
      case "tablet":
        return <Globe size={20} />;
      default:
        return <Globe size={20} />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-700 text-steel-50 mb-2">
          Active Sessions
        </h2>
        <p className="text-steel-400 text-sm">
          Manage your active login sessions across devices
        </p>
      </div>

      {loading ? (
        <div className="card p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
          <p className="mt-2 text-steel-400">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="card p-8 text-center bg-steel-800/50 border border-steel-700">
          <AlertCircle size={32} className="mx-auto text-steel-500 mb-2" />
          <p className="text-steel-400">No active sessions found</p>
        </div>
      ) : (
        <>
          {sessions.length > 1 && (
            <button
              onClick={revokeAllOthers}
              className="text-sm py-2 px-4 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              🔒 Revoke All Other Sessions
            </button>
          )}

          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="card p-4 bg-steel-800/50 border border-steel-700 hover:border-steel-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Device & Browser */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-amber-400">
                        {getDeviceIcon(session.deviceInfo?.deviceType)}
                      </div>
                      <div>
                        <h3 className="font-display font-600 text-steel-50">
                          {session.deviceInfo?.browser || "Unknown Browser"}{" "}
                          {session.deviceInfo?.browserVersion && `v${session.deviceInfo.browserVersion}`}
                        </h3>
                        <p className="text-xs text-steel-400">
                          {session.deviceInfo?.os || "Unknown OS"}
                          {session.deviceInfo?.isMobile && " (Mobile)"}
                        </p>
                      </div>
                      {session.isCurrent && (
                        <div className="ml-auto">
                          <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 font-body">
                            Current Device
                          </span>
                        </div>
                      )}
                    </div>

                    {/* IP Address & Last Activity */}
                    <div className="space-y-1 text-xs text-steel-400 font-body">
                      <p>
                        📍 IP: <span className="font-mono">{session.ipAddress}</span>
                      </p>
                      <p>
                        ⏱️  Last active:{" "}
                        <span className="text-steel-300">
                          {formatDate(session.lastActivityAt)}
                        </span>
                      </p>
                      {session.location?.city && (
                        <p>
                          🌍 Location:{" "}
                          <span className="text-steel-300">
                            {session.location.city}, {session.location.country}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Revoke Button */}
                  <button
                    onClick={() => revokeSession(session._id, session.isCurrent)}
                    disabled={revoking === session._id}
                    className="ml-4 p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    title="Revoke this session"
                  >
                    {revoking === session._id ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-red-400" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-amber-400/5 border border-amber-400/20">
            <p className="text-xs text-amber-400/70 font-body">
              ⚠️ If you see a session you don't recognize, revoke it immediately to
              protect your account.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
