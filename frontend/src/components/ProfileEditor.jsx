import React, { useState } from "react";
import { Loader, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { profileService } from "../api/services";

export default function ProfileEditor({ profileData, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    name: profileData?.name || "",
    email: profileData?.email || "",
    phone: profileData?.phone || "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = "Phone must be at least 10 characters";
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
        name: formData.name,
        phone: formData.phone,
      });

      onProfileUpdate(response.data.user);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="label">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input"
          placeholder="Enter your full name"
        />
        {errors.name && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.name}
          </p>
        )}
      </div>

      {/* Email (Read-only) */}
      <div>
        <label className="label">Email Address</label>
        <input
          type="email"
          value={formData.email}
          disabled
          className="input bg-steel-800 cursor-not-allowed"
        />
        <p className="text-xs text-steel-500 mt-1">Email cannot be changed</p>
      </div>

      {/* Phone */}
      <div>
        <label className="label">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="input"
          placeholder="Enter your phone number"
        />
        {errors.phone && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.phone}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
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
    </form>
  );
}
