import React, { useState } from "react";
import { X, Loader, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "../api/services";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success("Password changed successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onClose();
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
      if (errorMessage.includes("Current password")) {
        setErrors((prev) => ({
          ...prev,
          currentPassword: errorMessage,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-steel-900 border border-steel-700 rounded-lg max-w-md w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-steel-800">
          <h2 className="text-lg font-display font-700 text-steel-100">
            Change Password
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-steel-800 rounded transition-colors"
            type="button"
          >
            <X size={20} className="text-steel-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 space-y-4">
          {/* Current Password */}
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="input pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("current")}
                className="absolute right-3 top-3 text-steel-400 hover:text-steel-300"
              >
                {showPasswords.current ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="input pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("new")}
                className="absolute right-3 top-3 text-steel-400 hover:text-steel-300"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("confirm")}
                className="absolute right-3 top-3 text-steel-400 hover:text-steel-300"
              >
                {showPasswords.confirm ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
            ℹ️ Use a strong password with at least 6 characters for better
            security.
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-steel-800 hover:bg-steel-700 text-steel-300 rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
