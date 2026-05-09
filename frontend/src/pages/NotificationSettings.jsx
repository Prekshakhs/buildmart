import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone } from "lucide-react";
import { notificationService } from "../api/services";
import toast from "react-hot-toast";

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    orders: { email: true, push: true, inApp: true },
    returns: { email: true, push: true, inApp: true },
    payments: { email: true, push: true, inApp: true },
    account: { email: true, push: false, inApp: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getPreferences();
      setPrefs(response.data.data || {});
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category, channel) => {
    setPrefs((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel],
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await notificationService.updatePreferences(prefs);
      toast.success("Notification preferences saved!");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const eventCategories = [
    {
      key: "orders",
      label: "Order Updates",
      icon: "📦",
      description: "Order placed, shipped, delivered, cancelled",
    },
    {
      key: "returns",
      label: "Return Updates",
      icon: "🔄",
      description: "Return initiated, approved, rejected, refunded",
    },
    {
      key: "payments",
      label: "Payment Updates",
      icon: "💳",
      description: "Payment confirmed, refund processed",
    },
    {
      key: "account",
      label: "Account Updates",
      icon: "👤",
      description: "Account registered, password reset, profile changes",
    },
  ];

  const channels = [
    { key: "email", label: "Email", icon: Mail, desc: "Receive via email" },
    { key: "inApp", label: "In-App", icon: Bell, desc: "See in notification bell" },
    { key: "push", label: "Push", icon: Smartphone, desc: "Browser notifications" },
  ];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <div className="text-steel-400">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-2">Notification Preferences</h1>
        <p className="text-steel-400">
          Manage how you receive notifications across different event types
        </p>
      </div>

      {/* Settings Grid */}
      <div className="space-y-6">
        {eventCategories.map((category) => (
          <div key={category.key} className="card p-6">
            {/* Category Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{category.icon}</span>
                <h2 className="font-display font-700 uppercase text-lg text-steel-200">
                  {category.label}
                </h2>
              </div>
              <p className="text-sm text-steel-400">{category.description}</p>
            </div>

            {/* Channel Toggles */}
            <div className="space-y-3">
              {channels.map(({ key, label, icon: Icon, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 bg-steel-800/30 rounded-lg hover:bg-steel-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-amber-400" />
                    <div>
                      <p className="font-display font-600 text-sm text-steel-200">
                        {label}
                      </p>
                      <p className="text-xs text-steel-500">{desc}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={prefs[category.key]?.[key] ?? false}
                      onChange={() => handleToggle(category.key, key)}
                      className="w-5 h-5 accent-amber-400 cursor-pointer rounded"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8 py-3"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
        <button
          onClick={loadPreferences}
          disabled={saving}
          className="btn-outline px-8 py-3"
        >
          Cancel
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-300">
          <strong>ℹ️ Note:</strong> Even if you disable notifications, you'll still be able to view important updates in your notification center. We recommend keeping at least in-app notifications enabled.
        </p>
      </div>
    </div>
  );
}
