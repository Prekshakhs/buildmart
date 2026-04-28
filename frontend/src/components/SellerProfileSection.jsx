import React, { useState } from "react";
import { Loader, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { profileService } from "../api/services";

export default function SellerProfileSection({ sellerInfo, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    businessName: sellerInfo?.businessName || "",
    gstin: sellerInfo?.gstin || "",
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    } else if (formData.businessName.length < 2) {
      newErrors.businessName = "Business name must be at least 2 characters";
    }

    // GSTIN validation: 15 characters, alphanumeric
    if (formData.gstin && !/^[0-9A-Z]{15}$/.test(formData.gstin)) {
      newErrors.gstin = "GSTIN must be 15 alphanumeric characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
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
      const response = await profileService.updateProfile({
        sellerInfo: {
          businessName: formData.businessName,
          gstin: formData.gstin,
        },
      });

      onUpdate(response.data.user);
      setIsEditing(false);
      toast.success("Business information updated successfully");
    } catch (error) {
      console.error("Error updating seller info:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update business information",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      businessName: sellerInfo?.businessName || "",
      gstin: sellerInfo?.gstin || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="p-3 rounded-lg bg-steel-800 border border-steel-700">
        <div className="flex items-center gap-2">
          {sellerInfo?.isApproved ? (
            <>
              <CheckCircle size={20} className="text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-400">
                  Seller Approved
                </p>
                <p className="text-xs text-steel-400">
                  {sellerInfo.approvedAt
                    ? `Approved on ${new Date(sellerInfo.approvedAt).toLocaleDateString()}`
                    : "Your seller account is active"}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={20} className="text-yellow-400" />
              <div>
                <p className="font-semibold text-yellow-400">
                  Pending Approval
                </p>
                <p className="text-xs text-steel-400">
                  Your seller account is under review by the admin
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Business Info Display */}
      {!isEditing && (
        <div className="p-4 bg-steel-800 border border-steel-700 rounded-lg space-y-3">
          <div>
            <p className="text-xs text-steel-500 uppercase tracking-widest mb-1">
              Business Name
            </p>
            <p className="text-steel-100 font-semibold">
              {sellerInfo?.businessName}
            </p>
          </div>

          {sellerInfo?.gstin && (
            <div>
              <p className="text-xs text-steel-500 uppercase tracking-widest mb-1">
                GSTIN
              </p>
              <p className="text-steel-100 font-mono">{sellerInfo.gstin}</p>
            </div>
          )}

          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium transition-colors"
            type="button"
          >
            Edit Business Info
          </button>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 bg-steel-800 border border-steel-700 rounded-lg"
        >
          {/* Business Name */}
          <div>
            <label className="label">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="input"
              placeholder="Enter your business name"
            />
            {errors.businessName && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.businessName}
              </p>
            )}
          </div>

          {/* GSTIN */}
          <div>
            <label className="label">
              GSTIN (Optional)
              <span className="text-xs text-steel-500 ml-2">15 characters</span>
            </label>
            <input
              type="text"
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              maxLength="15"
              className="input"
              placeholder="Enter GSTIN (e.g., 27AABCT1234A2M0)"
            />
            {errors.gstin && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.gstin}
              </p>
            )}
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
            ℹ️ GSTIN is optional but recommended for verified sellers. It helps
            build buyer trust.
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-steel-700 hover:bg-steel-600 text-steel-300 rounded font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
