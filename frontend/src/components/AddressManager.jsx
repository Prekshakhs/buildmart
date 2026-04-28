import React, { useState } from "react";
import { Plus, Edit2, Trash2, Loader, AlertCircle, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { profileService } from "../api/services";

export default function AddressManager({ currentAddress, onAddressUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    street: currentAddress?.street || "",
    city: currentAddress?.city || "",
    state: currentAddress?.state || "",
    pincode: currentAddress?.pincode || "",
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
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
      const response = await profileService.updateProfile({
        address: formData,
      });

      onAddressUpdate(response.data.user);
      setIsEditing(false);
      toast.success("Address updated successfully");
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error(error.response?.data?.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      street: currentAddress?.street || "",
      city: currentAddress?.city || "",
      state: currentAddress?.state || "",
      pincode: currentAddress?.pincode || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Current Address Display */}
      {!isEditing && currentAddress?.street && (
        <div className="p-4 bg-steel-800 border border-steel-700 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-steel-100 font-semibold">
                  {currentAddress.street}
                </p>
                <p className="text-steel-400 text-sm">
                  {currentAddress.city}, {currentAddress.state}{" "}
                  {currentAddress.pincode}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-steel-700 rounded transition-colors text-amber-400"
              type="button"
              title="Edit address"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isEditing && !currentAddress?.street && (
        <div className="p-4 bg-steel-800 border border-steel-700 rounded-lg text-center">
          <p className="text-steel-400 mb-3">No address added yet</p>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium transition-colors"
            type="button"
          >
            <Plus size={16} />
            Add Address
          </button>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 bg-steel-800 border border-steel-700 rounded-lg"
        >
          {/* Street Address */}
          <div>
            <label className="label">Street Address</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="input"
              placeholder="Enter street address"
            />
            {errors.street && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.street}
              </p>
            )}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input"
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.city}
                </p>
              )}
            </div>
            <div>
              <label className="label">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input"
                placeholder="Enter state"
              />
              {errors.state && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.state}
                </p>
              )}
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className="label">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              maxLength="6"
              className="input"
              placeholder="Enter 6-digit pincode"
            />
            {errors.pincode && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.pincode}
              </p>
            )}
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
                "Save Address"
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

      {/* Info Note */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
        ℹ️ This address will be used for delivery. You can update it anytime.
      </div>
    </div>
  );
}
