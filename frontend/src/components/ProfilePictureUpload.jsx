import React, { useState } from "react";
import { Upload, X, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { profileService } from "../api/services";

export default function ProfilePictureUpload({
  currentAvatar,
  onAvatarUpdate,
}) {
  const [preview, setPreview] = useState(currentAvatar || null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const response = await profileService.updateProfile({
        avatar: preview,
      });

      onAvatarUpdate(preview);
      setSelectedFile(null);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-2 border-steel-700">
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>📷</span>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm text-steel-400 mb-3">
            Upload a profile picture (JPG, PNG, GIF - max 5MB)
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-steel-800 hover:bg-steel-700 border border-steel-700 rounded cursor-pointer transition-colors">
            <Upload size={16} />
            <span className="text-sm font-medium">Choose Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      {selectedFile && (
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
            type="button"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Save Picture
              </>
            )}
          </button>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="px-4 py-2 bg-steel-800 hover:bg-steel-700 text-steel-300 rounded font-medium transition-colors flex items-center justify-center gap-2"
            type="button"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
