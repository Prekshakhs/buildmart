import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Loader } from "lucide-react";
import { toast } from "react-toastify";

export default function ProductImageGallery({
  images = [],
  productName = "",
  onImageUpload = null,
  canEdit = false,
  onImageDelete = null,
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const displayImages = images && images.length > 0 ? images : [];

  const handlePrevImage = () => {
    setActiveImg((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImg((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);

    // Call upload handler if provided
    if (onImageUpload) {
      setIsUploading(true);
      onImageUpload(file)
        .then(() => {
          toast.success("Image uploaded successfully");
          setPreviewUrl(null);
          e.target.value = ""; // Reset input
        })
        .catch((error) => {
          toast.error(error.message || "Failed to upload image");
          console.error(error);
        })
        .finally(() => {
          setIsUploading(false);
        });
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative bg-steel-800 rounded-xl overflow-hidden aspect-square border border-steel-700 group">
        {previewUrl || (displayImages.length > 0 && displayImages[activeImg]?.url) ? (
          <>
            <img
              src={previewUrl || displayImages[activeImg]?.url}
              alt={productName}
              className="w-full h-full object-cover"
            />

            {/* Image Counter */}
            {displayImages.length > 1 && !previewUrl && (
              <div className="absolute top-3 right-3 bg-steel-950/80 px-3 py-1 rounded-full text-xs font-mono text-steel-300">
                {activeImg + 1} / {displayImages.length}
              </div>
            )}

            {/* Navigation Arrows */}
            {displayImages.length > 1 && !previewUrl && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-steel-950/60 hover:bg-steel-950 rounded-full text-steel-100 transition-colors opacity-0 group-hover:opacity-100"
                  type="button"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-steel-950/60 hover:bg-steel-950 rounded-full text-steel-100 transition-colors opacity-0 group-hover:opacity-100"
                  type="button"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Preview Indicator */}
            {previewUrl && (
              <div className="absolute top-2 left-2 bg-emerald-500/90 text-xs text-white px-2 py-1 rounded font-semibold">
                📸 Preview
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <ImageIcon size={48} className="text-steel-600" />
            <p className="text-steel-400 text-center text-sm">No images yet</p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((img, i) => (
            <div key={i} className="relative flex-shrink-0">
              <button
                onClick={() => {
                  setActiveImg(i);
                  setPreviewUrl(null);
                }}
                className={`w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                  i === activeImg && !previewUrl
                    ? "border-amber-400 ring-2 ring-amber-400/30"
                    : "border-steel-700 hover:border-steel-500"
                }`}
                type="button"
              >
                <img src={img.url} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
              {canEdit && onImageDelete && (
                <button
                  onClick={() => onImageDelete(img.publicId)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white opacity-0 hover:opacity-100 transition-all"
                  title="Delete image"
                  type="button"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Section */}
      {canEdit && onImageUpload && (
        <div className="border-2 border-dashed border-steel-700 rounded-lg p-6 text-center hover:border-amber-400/50 transition-colors">
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isUploading}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <>
                  <Loader size={24} className="text-amber-400 animate-spin" />
                  <p className="text-sm text-steel-400">Uploading...</p>
                </>
              ) : (
                <>
                  <ImageIcon size={24} className="text-steel-500" />
                  <p className="text-sm font-medium text-steel-300">Drop or click to upload image</p>
                  <p className="text-xs text-steel-500">JPG, PNG, WebP (Max 5MB)</p>
                </>
              )}
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
